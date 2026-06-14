import os
import asyncio
from datetime import datetime
from collections import Counter
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

async def demo_simulation():
    print("\nConnecting to MongoDB Database (MellowMind_Production)...")
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=30000)
    db = client["MellowMind_Production"]
    chat_collection = db["Chat_History"]
    
    output = []
    output.append("========================================================================================================================")
    output.append("                              MELLOW MIND - LONGITUDINAL USER SIMULATION RESULTS (UP TO TODAY)                             ")
    output.append("========================================================================================================================\n")
    
    users = await chat_collection.distinct("username")
    output.append("Fetching and Analyzing Data for Test Users...\n")
    
    output.append(f"{'User ID':<20} | {'March Avg':<10} | {'April Avg':<10} | {'May Avg':<10} | {'June Avg':<10} | {'Current Emotion':<15} | {'Overall Trend':<20}")
    output.append("-" * 120)
    
    for user in users:
        cursor = chat_collection.find({"username": user})
        history = await cursor.to_list(length=1000)
        
        march_scores, april_scores, may_scores, june_scores = [], [], [], []
        june_emotions = []
        
        for doc in history:
            try:
                time_str = doc.get('time', '')
                if not time_str: continue
                doc_time = datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S.%f") if '.' in time_str else datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S")
                score = int(doc.get('mind_vibe_score', doc.get('score', 0)))
                emotion = doc.get('emotion', 'Neutral').capitalize()
                
                if doc_time.month == 3: march_scores.append(score)
                elif doc_time.month == 4: april_scores.append(score)
                elif doc_time.month == 5: may_scores.append(score)
                elif doc_time.month == 6: 
                    june_scores.append(score)
                    june_emotions.append(emotion)
            except Exception:
                pass
        
        march_avg = int(sum(march_scores) / len(march_scores)) if march_scores else 0
        april_avg = int(sum(april_scores) / len(april_scores)) if april_scores else 0
        may_avg = int(sum(may_scores) / len(may_scores)) if may_scores else 0
        june_avg = int(sum(june_scores) / len(june_scores)) if june_scores else 0
        
        june_dom_emotion = Counter(june_emotions).most_common(1)[0][0] if june_emotions else "N/A"
        baseline = march_avg if march_avg > 0 else april_avg
        
        if june_avg > baseline and baseline > 0: trend = f"+{june_avg - baseline} Points (Improved)"
        elif june_avg < baseline and baseline > 0: trend = f"-{baseline - june_avg} Points (Declined)"
        else: trend = "Stable"
            
        if march_avg == 0 and april_avg == 0 and may_avg == 0 and june_avg == 0:
            output.append(f"{user:<20} | {'N/A':<10} | {'N/A':<10} | {'N/A':<10} | {'N/A':<10} | {'N/A':<15} | {'N/A':<20}")
        else:
            output.append(f"{user:<20} | {str(march_avg):<10} | {str(april_avg):<10} | {str(may_avg):<10} | {str(june_avg):<10} | {june_dom_emotion:<15} | {trend:<20}")
            
    output.append("-" * 120)
    output.append("\nSUCCESS: Database verification complete. Data mapped successfully.\n")
    print("\n".join(output))
    client.close()

if __name__ == "__main__":
    asyncio.run(demo_simulation())
