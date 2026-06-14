from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
import uuid
from starlette.background import BackgroundTask
import edge_tts
from faster_whisper import WhisperModel
import shutil
import tempfile
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from groq import AsyncGroq
from datetime import datetime, timedelta
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import time
import os
from dotenv import load_dotenv
import random

load_dotenv()

# Initialize Faster Whisper
model_size = "base"
try:
    whisper_model = WhisperModel(model_size, device="cpu", compute_type="int8")
    print(f"Faster Whisper model '{model_size}' loaded successfully!")
except Exception as e:
    print(f"Error loading Whisper model: {e}")
    whisper_model = None

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# MongoDB Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# Global Variables
client = None
db = None

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = []
    
    async def insert_one(self, doc):
        self.data.append(doc)
        return type('obj', (object,), {'inserted_id': len(self.data)})
    
    def find(self, query=None):
        data = self.data
        if query:
            data = [d for d in data if all(d.get(k) == v for k, v in query.items())]
        
        class Cursor:
            def __init__(self, d): self.d = d
            def sort(self, f, dir=1): 
                self.d.sort(key=lambda x: str(x.get(f, "")), reverse=(dir==-1))
                return self
            async def to_list(self, length=100): return self.d[:length]
        return Cursor(data)
    
    async def find_one(self, query, sort=None):
        data = self.data
        if query:
            data = [d for d in data if all(d.get(k) == v for k, v in query.items())]
        if sort:
            field, dir = sort[0]
            data.sort(key=lambda x: str(x.get(field, "")), reverse=(dir==-1))
        return data[0] if data else None
    
    async def update_one(self, query, update):
        return None
    
    async def count_documents(self, query):
        return len(self.data)
    
    def aggregate(self, pipeline):
        sessions = {}
        for d in self.data:
            sid = d.get("session_id")
            if not sid: continue
            if sid not in sessions:
                sessions[sid] = {
                    "_id": sid,
                    "last_time": d.get("time"),
                    "message_count": 1,
                    "first_message": d.get("message"),
                    "top_emotion": d.get("emotion")
                }
            else:
                sessions[sid]["message_count"] += 1
                if str(d.get("time")) > str(sessions[sid]["last_time"]):
                    sessions[sid]["last_time"] = d.get("time")
        
        class MockCursor:
            def __init__(self, data): self.data = data
            async def to_list(self, length=100): 
                res = list(self.data.values())
                res.sort(key=lambda x: str(x.get("last_time", "")), reverse=True)
                return res[:length]
        return MockCursor(sessions)

chat_collection = MockCollection("Chat_History")
journal_collection = MockCollection("Journal_Entries")
completed_activities_collection = MockCollection("Completed_Activities")
activities_collection = MockCollection("Activities")
mood_history_collection = MockCollection("Mood_history")
users_collection = MockCollection("Users")
community_collection = MockCollection("Community_Posts")

@app.on_event("startup")
async def startup_db_client():
    global client, db
    global chat_collection, journal_collection, completed_activities_collection
    global activities_collection, mood_history_collection, users_collection, community_collection
    
    try:
        print(f"Connecting to MongoDB Atlas...")
        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        await client.admin.command('ping')
        db = client["MellowMind_Production"]
        chat_collection = db["Chat_History"]
        journal_collection = db["Journal_Entries"]
        completed_activities_collection = db["Completed_Activities"]
        activities_collection = db["Activities"]
        mood_history_collection = db["Mood_history"]
        users_collection = db["Users"]
        community_collection = db["Community_Posts"]
        print("Successfully connected to MongoDB Atlas!")
        
        # Seed dummy community data if empty
        if await community_collection.count_documents({}) == 0:
            dummy_posts = [
                {"username": "SkyWalker7", "content": "Just finished a 10-minute meditation and honestly, I feel so much lighter. If you're reading this, take a deep breath. You've got this! ✨", "likes": 24, "comments": 5, "time": str(datetime.now() - timedelta(hours=2)), "mood": "peaceful", "is_anonymous": False},
                {"username": "LunarVibe", "content": "Feeling a bit overwhelmed today, but my AI bestie reminded me that it's okay to not be okay. One step at a time. 💛", "likes": 42, "comments": 12, "time": str(datetime.now() - timedelta(hours=5)), "mood": "vulnerable", "is_anonymous": False},
                {"username": "VibeMaster", "content": "Finally hit a 30-day streak on my wellness quests! The journey is the destination. Let's keep growing together! 🏆", "likes": 156, "comments": 28, "time": str(datetime.now() - timedelta(days=1)), "mood": "proud", "is_anonymous": False}
            ]
            await community_collection.insert_many(dummy_posts)
            print("Seeded community posts.")
            
    except Exception as e:
        print(f"MongoDB Connection failed: {e}")
        db = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = AsyncGroq(api_key=GROQ_API_KEY)
MODEL = "llama-3.1-8b-instant"

from typing import Optional

class ChatRequest(BaseModel):
    username: str
    session_id: Optional[str] = None
    message: str
    audio_url: Optional[str] = None

class JournalEntryRequest(BaseModel):
    username: str
    entry: str
    mood: str
    tags: list[str] = []

class GenerateJournalFromChatRequest(BaseModel):
    username: str
    session_id: str

class ActivityRequest(BaseModel):
    username: str
    session_id: str
    activity: str

class EnhanceRequest(BaseModel):
    text: str

class LoginRequest(BaseModel):
    username: str
    email: str
    password: str

class CommunityPostRequest(BaseModel):
    username: str
    content: str
    mood: str
    is_anonymous: bool

async def call_llm(prompt, system="You are a helpful AI."):
    try:
        chat_completion = await groq_client.chat.completions.create(
            messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
            model=MODEL,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"LLM Error: {e}")
        return ""

def serialize_mongo(doc):
    if not doc: return doc
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# Mapped constants based on Algorithm flowchart
STRATEGY_MAP = {
    "Happy": "Encourage",
    "Sad": "Comfort",
    "Anxious": "Support",
    "Angry": "Calm",
    "Lonely": "Comfort",
    "Neutral": "Listen",
    "Crisis": "Crisis support"
}

RESOURCE_MAP = {
    "Happy": ["Motivational content", "Gratitude journaling"],
    "Sad": ["Music / Relaxation playlist", "Mindful walking"],
    "Anxious": ["Breathing exercise", "Grounding techniques (5-4-3-2-1)"],
    "Angry": ["Calm techniques", "Physical venting/Stretching"],
    "Lonely": ["Connection circle", "Self-compassion meditation"],
    "Neutral": ["Daily quote reflection", "Goal alignment task"],
    "Crisis": [
        "Kiran Helpline: 1800-599-0019", 
        "Tele-MANAS: 14416", 
        "Suicide & Crisis Lifeline: 988"
    ]
}

def clean_input_text(text: str) -> str:
    if not text:
        return ""
    # 1.3.1 Remove noise & 1.3.2 Convert to lowercase & strip
    import re
    cleaned = re.sub(r'[^\w\s\?\!\.\,\-\'\"]', '', text)
    cleaned = " ".join(cleaned.split()).strip().lower()
    return cleaned

async def calculate_mellow_vibe_score(username: str, current_emotion: str, risk_level: str) -> int:
    # 3.1. Assign base score B based on emotion
    base_scores = {
        "Happy": 88,
        "Neutral": 72,
        "Sad": 48,
        "Anxious": 42,
        "Angry": 38,
        "Lonely": 40,
        "Crisis": 10
    }
    b = base_scores.get(current_emotion, 72)
    
    # 3.2. Assign penalty P based on risk
    p = 0
    if risk_level == "MEDIUM":
        p = -12
    elif risk_level == "HIGH":
        p = -28
        
    # 3.4. Compute history adjustment H
    h = 0
    try:
        # Find previous score & emotion in database
        last_chat = await chat_collection.find_one(
            {"username": username},
            sort=[("time", -1)]
        )
        if last_chat:
            prev_emotion = last_chat.get("emotion", "Neutral")
            mood_hierarchy = {
                "Happy": 6,
                "Neutral": 5,
                "Lonely": 4,
                "Sad": 3,
                "Anxious": 2,
                "Angry": 1,
                "Crisis": 0
            }
            prev_level = mood_hierarchy.get(prev_emotion, 5)
            curr_level = mood_hierarchy.get(current_emotion, 5)
            
            if curr_level > prev_level:
                h = 2
            elif curr_level < prev_level:
                h = -2
    except Exception as e:
        print(f"Error computing history adjustment: {e}")
        
    # 3.5. Calculate final score
    v = b + p + h
    
    # 3.6. Limit score between 5 and 98
    if v > 98:
        v = 98
    if v < 5:
        v = 5
        
    return v

async def intelligent_processing_multi_agent_core(username, text):
    # STEP 2: Detect Emotion and Risk (Parallel - MASS)
    prompt_em = f"Analyze this text and identify the dominant emotion from this list ONLY: Happy, Sad, Anxious, Angry, Lonely, Neutral. Return ONLY the single word, nothing else: {text}"
    prompt_risk = f"Analyze this text for crisis risk. If the user expresses a desire to hurt or kill THEMSELVES, return HIGH_SELF_HARM. If the user expresses a desire to hurt, kill, or act violently towards OTHERS (e.g. 'kill someone I hate', 'hurt them'), return HIGH_HARM_OTHERS. Otherwise return LOW or MEDIUM. You MUST return ONLY one exact word from this list (LOW, MEDIUM, HIGH_SELF_HARM, HIGH_HARM_OTHERS) and nothing else: {text}"
    em_task = call_llm(prompt_em)
    risk_task = call_llm(prompt_risk)
    emotion, risk = await asyncio.gather(em_task, risk_task)
    
    # More robust keyword extraction
    allowed_moods = ["Happy", "Sad", "Anxious", "Angry", "Lonely", "Neutral"]
    emotion_found = "Neutral"
    for m in allowed_moods:
        if m.lower() in emotion.lower():
            emotion_found = m
            break
            
    risk_found = "LOW"
    for r in ["HIGH_SELF_HARM", "HIGH_HARM_OTHERS", "HIGH", "MEDIUM", "LOW"]:
        if r in risk.upper():
            risk_found = r
            break
    
    if risk_found == "HIGH" or risk_found == "HIGH_SELF_HARM": 
        emotion_found = "Crisis"
        
    return emotion_found, risk_found

@app.post("/login")
async def login(req: LoginRequest):
    return {"status": "success", "username": req.username}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        audio_filename = f"{uuid.uuid4().hex}.webm"
        audio_filepath = os.path.join("static", "audio", audio_filename)
        
        with open(audio_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Use local faster-whisper to bypass all API rate limits
        if whisper_model:
            def _transcribe():
                segments, info = whisper_model.transcribe(audio_filepath, beam_size=5, language="en")
                return " ".join([segment.text for segment in segments]).strip()
            
            loop = asyncio.get_event_loop()
            text = await loop.run_in_executor(None, _transcribe)
        else:
            with open(audio_filepath, "rb") as f:
                transcription = await groq_client.audio.transcriptions.create(
                    file=(audio_filepath, f.read()),
                    model="whisper-large-v3-turbo",
                    response_format="json",
                    language="en",
                )
            text = transcription.text.strip()
            
        return {"text": text, "audio_url": f"/static/audio/{audio_filename}"}
    except Exception as e:
        print(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tts")
async def get_tts(text: str, emotion: str = "Neutral"):
    try:
        # Use a very smooth, natural, and calming female voice from Microsoft Azure Neural
        voice = "en-US-AriaNeural"
        
        # Adjust tone dynamically based on emotion/risk
        if emotion.lower() == "crisis":
            # Ultra soothing, slow, and low pitch for self-harm crisis
            communicate = edge_tts.Communicate(text, voice, rate="-20%", pitch="-10Hz")
        elif emotion.lower() == "angry":
            # Firm, serious, normal rate, slightly lower pitch for de-escalation
            communicate = edge_tts.Communicate(text, voice, rate="+0%", pitch="-15Hz")
        elif emotion.lower() == "sad" or emotion.lower() == "lonely":
            # Soft, comforting, slower
            communicate = edge_tts.Communicate(text, voice, rate="-10%", pitch="-5Hz")
        elif emotion.lower() == "happy":
            # Upbeat, fast, higher pitch
            communicate = edge_tts.Communicate(text, voice, rate="+10%", pitch="+5Hz")
        else:
            # Normal chat
            communicate = edge_tts.Communicate(text, voice, rate="-5%", pitch="+0Hz")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
            tmp_path = tmp_file.name
        
        await communicate.save(tmp_path)
        return FileResponse(tmp_path, media_type="audio/mpeg", background=BackgroundTask(os.unlink, tmp_path))
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(req: ChatRequest):
    # STEP 2: INPUT PROCESSING (Input cleaning/noise removal)
    u_clean = clean_input_text(req.message)
    if not u_clean:
        raise HTTPException(status_code=400, detail="Input message is invalid or contains only noise")
        
    # STEP 2: Detect Emotion and Risk (Parallel - MASS)
    emotion, risk = await intelligent_processing_multi_agent_core(req.username, u_clean)
    
    # Check for direct crisis keywords using the normalized/cleaned text
    crisis_keywords = ["suicide", "suicidal", "die", "kill myself", "self harm", "self-harm", "self harming", "harm myself", "hurt myself", "cutting", "end my life"]
    is_crisis_keyword = any(kw in u_clean for kw in crisis_keywords)
    
    if risk == "HIGH_SELF_HARM" or risk == "HIGH" or is_crisis_keyword:
        risk = "HIGH"
        emotion = "Crisis"
        
        # Generate a personalized empathetic intro using the LLM
        persona = "You are a crisis support AI. A user is expressing severe distress or suicidal thoughts."
        prompt = f"User message: {req.message}\nWrite a deeply compassionate, persuasive, and grounding 3-4 sentence response. Actively CONVINCE them that their life is worth living based on the specific words they just said. Speak softly but firmly like a caring friend holding their hand. Acknowledge their pain gently without judgment, but actively challenge their hopelessness. Use their name ({req.username}) if appropriate. Do NOT list any phone numbers. Focus strictly on bringing their heart rate down and persuading them to stay safe."
        
        empathetic_intro = await call_llm(prompt, system=persona)
        
        reply = f"""{empathetic_intro}

As an AI, I cannot replace professional support, but please know there are people who want to help you right now:

📞 Kiran Helpline (India): 1800-599-0019 (24/7, Toll-free)
📞 Tele-MANAS (India): 14416 or 1800-891-4416 (24/7)
📞 Vandrevala Foundation (India): +91 9999 666 555 (24/7)
📞 AASRA (India): +91-9820466726

What you can do right now:
1. Reach out to a trusted friend or family member.
2. Go to a safe, public space or emergency room.
3. Pause and take deep breaths. You do not have to carry this alone."""
    else:
        # STEP 4: Generate Response (ARO) with Strategy
        strategy = STRATEGY_MAP.get(emotion, "Listen")
        
        # Calculate dynamic MVS score for prompting
        temp_score = await calculate_mellow_vibe_score(req.username, emotion, risk)
        
        persona = "You are a warm, compassionate, and highly supportive AI companion for mental wellness. You engage in a safe, non-judgmental, and genuinely caring tone."
        
        # If the user threatens violence against OTHERS, drop the sweet persona and firmly de-escalate.
        if risk == "HIGH_HARM_OTHERS":
            risk = "MEDIUM" # Downgrade so the frontend renders a normal white bubble, not a suicide red bubble
            emotion = "Angry"
            persona = "You are a firm, serious, but calm AI. The user is expressing a desire to hurt or kill OTHERS. You must actively CONVINCE them this is the wrong path. De-escalate their anger immediately, firmly explain why violence is never the answer, and suggest peaceful resolutions. Do NOT be overly sweet or blindly supportive."

        context = (
            f"Persona: {persona}\n"
            f"User Emotion: {emotion}\n"
            f"Therapeutic Strategy: {strategy}\n"
            f"Current Vibe Score: {temp_score}/100\n"
            f"Tone Constraints: Ensure absolute empathy, safety, non-judgmental comfort. Keep conversational, authentic, and naturally supportive."
        )
        
        prompt = f"User: {req.message}\nReply in a natural, empathetic, and conversational way. Provide thoughtful advice or comfort based on the user's emotion. Keep it concise (2-3 sentences), and only ask a question if it naturally fits the conversation."
        reply = await call_llm(prompt, system=context)
    
    # STEP 3: Calculate Score (MVS)
    score = await calculate_mellow_vibe_score(req.username, emotion, risk)
    
    # 2.4 Recommending dynamic resources Rec based on emotion
    resources = RESOURCE_MAP.get(emotion, ["Meditation", "Deep breathing"])
    
    # STEP 6 & 8: Store in MongoDB & Output
    doc = {
        "username": req.username, 
        "session_id": req.session_id, 
        "message": req.message, 
        "audio_url": req.audio_url,
        "ai_reply": reply, 
        "emotion": emotion, 
        "risk": risk, 
        "score": score, 
        "mind_vibe_score": score, 
        "mood_label": emotion, 
        "time": str(datetime.now())
    }
    await chat_collection.insert_one(doc)
    
    return {
        "reply": reply, 
        "emotion": emotion, 
        "risk": risk, 
        "mind_vibe_score": score, 
        "activities": resources, 
        "mood_label": emotion
    }

@app.get("/sessions")
async def get_sessions(username: str):
    cursor = chat_collection.aggregate([
        {"$match": {"username": username}},
        {"$sort": {"time": 1}},
        {"$group": {"_id": "$session_id", "last_time": {"$last": "$time"}, "message_count": {"$sum": 1}, "first_message": {"$first": "$message"}, "top_emotion": {"$last": "$emotion"}}},
        {"$sort": {"last_time": -1}}
    ])
    results = await cursor.to_list(length=100)
    return [serialize_mongo(r) for r in results]

@app.get("/history")
async def get_history(username: str, session_id: str):
    # Fetch targeted session history directly (order by time ascending)
    session_cursor = chat_collection.find({"username": username, "session_id": session_id}).sort("time", 1)
    session_history = await session_cursor.to_list(length=500)
    serialized_history = [serialize_mongo(h) for h in session_history]

    # Fetch user's overall history (up to 1000 messages) to compute accurate analytics distributions
    all_cursor = chat_collection.find({"username": username}).sort("time", 1)
    all_history = await all_cursor.to_list(length=1000)
    
    mood_dist = {"Happy": 0, "Neutral": 0, "Sad": 0, "Anxious": 0, "Angry": 0}
    risk_dist = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
    total_score = 0
    
    for h in all_history:
        em = h.get("emotion", "Neutral")
        if em: em = str(em).split()[0].replace(".", "").replace("*", "").capitalize()
        if em not in mood_dist: em = "Neutral"
        mood_dist[em] += 1
        
        risk = h.get("risk", "LOW")
        if risk: risk = str(risk).split()[0].replace(".", "").replace("*", "").upper()
        if risk not in risk_dist: risk = "LOW"
        risk_dist[risk] += 1
        
        score_val = h.get("score")
        try:
            total_score += int(score_val) if score_val is not None else 70
        except ValueError:
            total_score += 70
            
    avg_score = round(total_score / len(all_history)) if all_history else 70
    last = serialized_history[-1] if serialized_history else {}
    
    return {
        "history": serialized_history,
        "all_history": [serialize_mongo(h) for h in all_history],
        "analytics": {
            "mind_vibe_score": avg_score,
            "mood_label": last.get("mood_label", last.get("emotion", "Neutral")),
            "emotion": last.get("emotion", "neutral"),
            "activities": last.get("activities", ["Meditation", "Journaling"]),
            "mood_distribution": mood_dist,
            "risk_distribution": risk_dist,
            "trend": "Stable",
            "energy": "High" if avg_score > 60 else "Low"
        }
    }

@app.post("/activity/complete")
async def complete_activity(req: ActivityRequest):
    await completed_activities_collection.insert_one({"username": req.username, "activity": req.activity, "time": str(datetime.now())})
    return {"status": "success"}

@app.post("/enhance-journal")
async def enhance_journal(req: EnhanceRequest):
    prompt = f"Refine this journal entry to be clearer and slightly more reflective. IMPORTANT: Keep it to exactly 1-2 sentences. Do NOT add extra information or hallucinate context. Only use the content provided: {req.text}"
    enhanced = await call_llm(prompt, system="You are a concise wellness editor. Fix grammar and add a touch of mindfulness without adding extra words.")
    return {"enhanced": enhanced}

@app.post("/journal/generate-from-chat")
async def generate_journal_from_chat(req: GenerateJournalFromChatRequest):
    cursor = chat_collection.find({"username": req.username, "session_id": req.session_id}).sort("time", 1)
    history = await cursor.to_list(length=100)
    
    if not history:
        raise HTTPException(status_code=400, detail="No chat history found for this session.")
        
    conversation = []
    for h in history:
        msg = h.get("message", "")
        reply = h.get("ai_reply", "")
        if msg: conversation.append(f"User: {msg}")
        if reply: conversation.append(f"AI: {reply}")
        
    chat_text = "\n".join(conversation)
    
    is_crisis = any(kw in chat_text.lower() for kw in ["kill", "die", "suicide", "hurt myself", "end it", "self-harm"])
    
    if is_crisis:
        prefix = "Today, I choose to focus on self-compassion, reminding myself that even in my darkest moments, I am worthy of love, support, and a beautiful future. "
    else:
        prefix = "Today, I choose to focus on self-compassion, reminding myself that even in difficult moments, my strength and resilience are growing. "
        
    prompt = (
        f"Generate a beautiful, highly compassionate 2-3 sentence mindfulness reflection "
        f"summarizing this personal chat conversation in the first person ('I').\n"
        f"CRITICAL REQUIREMENTS:\n"
        f"1. Do NOT repeat the positive quote prefix '{prefix}'. Start immediately with a reflective continuation of my thoughts and experiences.\n"
        f"2. Summarize the feelings shared in the chat with complete kindness, absolute self-compassion, and optimism.\n"
        f"3. Frame my reaching out and talking as a highly courageous act, looking forward to constructive steps and support.\n\n"
        f"Conversation:\n{chat_text}"
    )
    
    entry_text = await call_llm(prompt, system="You are an extremely encouraging, positive, and compassionate therapeutic wellness editor. Help the user frame their experiences with maximum hope, resilience, and positive affirmations.")
    
    entry_text = prefix + entry_text.strip()
    
    # Detect dominant emotion
    mood_prompt = (
        f"Read this conversation and pick the dominant emotion from ONLY these choices: Happy, Neutral, Sad, Anxious, Angry. "
        f"Return ONLY the single word, nothing else.\n\n"
        f"Conversation:\n{chat_text}"
    )
    detected_mood = await call_llm(mood_prompt, system="You are an emotion classification model.")
    
    allowed_moods = ["Happy", "Neutral", "Sad", "Anxious", "Angry"]
    mood_found = "Neutral"
    for m in allowed_moods:
        if m.lower() in detected_mood.lower():
            mood_found = m
            break
            
    return {"entry": entry_text, "mood": mood_found}

@app.post("/journal")
async def add_journal(req: JournalEntryRequest):
    doc = {"username": req.username, "entry": req.entry, "mood": req.mood, "tags": req.tags, "time": str(datetime.now()), "date": datetime.now().strftime("%b %d")}
    await journal_collection.insert_one(doc)
    return {"status": "success"}

@app.get("/journal/{username}")
async def get_journal(username: str):
    cursor = journal_collection.find({"username": username}).sort("time", -1)
    entries = await cursor.to_list(length=100)
    entries = [serialize_mongo(e) for e in entries]
    for e in entries: e["snippet"] = e["entry"][:100] + "..."
    return entries

# Community Endpoints
@app.get("/community/posts")
async def get_community_posts():
    cursor = community_collection.find({}).sort("time", -1)
    posts = await cursor.to_list(length=50)
    return [serialize_mongo(p) for p in posts]

@app.post("/community/posts")
async def add_community_post(req: CommunityPostRequest):
    doc = {
        "username": req.username,
        "content": req.content,
        "mood": req.mood,
        "is_anonymous": req.is_anonymous,
        "likes": 0,
        "comments": 0,
        "time": str(datetime.now())
    }
    await community_collection.insert_one(doc)
    return {"status": "success"}

@app.post("/community/posts/{post_id}/like")
async def like_community_post(post_id: str):
    # In a real app, you'd use bson.ObjectId
    # For now we'll mock update or just return success
    return {"status": "success"}


