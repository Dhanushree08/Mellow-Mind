import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

async def demo_golden_dataset():
    print("\nConnecting to MongoDB Database (MellowMind_Production)...")
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=30000)
    db = client["MellowMind_Production"]
    
    output = []
    output.append("================================================================================================================================")
    output.append("                                       MELLOW MIND - GOLDEN DATASET (LIVE DATABASE VERIFICATION)                                                ")
    output.append("================================================================================================================================\n")
    output.append("Fetching and Analyzing Data from Golden_Dataset Collection...\n")
    
    total_docs = await db["Golden_Dataset"].count_documents({})
    if total_docs == 0:
        print("No data found! Make sure the dataset is uploaded.")
        return
        
    pipeline = [{"$sample": {"size": 15}}]
    cursor = db["Golden_Dataset"].aggregate(pipeline)
    sample_records = await cursor.to_list(length=15)
    
    output.append(f"{'Username':<15} | {'Domain':<16} | {'Emotion':<10} | {'Risk':<5} | {'User Utterance (Truncated)':<55} | {'Gold Response (Truncated)':<25}")
    output.append("-" * 144)
    
    for r in sample_records:
        uname = str(r.get('username', 'N/A'))[:14]
        domain = str(r.get('domain', 'N/A'))[:15]
        emotion = str(r.get('emotion_label', 'N/A')).capitalize()[:9]
        risk = str(r.get('risk_level', 'N/A'))[:4]
        utt = str(r.get('utterance', 'N/A'))
        if len(utt) > 52: utt = utt[:49] + "..."
        gold = str(r.get('gold_reference_response', 'N/A'))
        if len(gold) > 22: gold = gold[:19] + "..."
        output.append(f"{uname:<15} | {domain:<16} | {emotion:<10} | {risk:<5} | {utt:<55} | {gold:<25}")
        
    output.append("-" * 144)
    output.append(f"\nSUCCESS: Database verification complete. {total_docs} Golden Dataset records mapped successfully.\n")
    
    print("\n".join(output))
    client.close()

if __name__ == "__main__":
    asyncio.run(demo_golden_dataset())
