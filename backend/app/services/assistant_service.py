import httpx
from app.core.config import settings
from app.schemas.intelligence import ChatMessage
from typing import List
import json
import logging

logger = logging.getLogger(__name__)

async def chat_with_gemini(message: str, history: List[ChatMessage]) -> str:
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your-gemini-api-key":
        return "সিস্টেম কনফিগারেশন ত্রুটি: Gemini API Key সেট করা নেই।"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={settings.GEMINI_API_KEY}"
    
    # Construct contents array based on history and current message
    contents = []
    
    # System instructions via context framing
    system_prompt = (
        "You are Krishi Bondhu (কৃষি বন্ধু), an expert, empathetic, and friendly agricultural AI assistant for farmers in Bangladesh. "
        "You must ALWAYS reply in clear, natural, and conversational Bengali. Your goal is to provide accurate, easy-to-understand, "
        "and scientifically sound farming advice, weather interpretations, pest/disease management, and crop recommendations "
        "tailored to the local context of Bangladesh. "
        "Use Markdown formatting (bolding key terms, bullet points, numbered lists) to structure your answers and make them easy to read. "
        "Be encouraging, practical, and direct. If a farmer asks about a disease (e.g. 'ধান গাছ মরে যাচ্ছে'), provide step-by-step diagnostic advice, and list immediate actionable organic or chemical remedies commonly available in Bangladesh."
    )
    
    # Add system prompt as a user message at the very beginning
    contents.append({"role": "user", "parts": [{"text": system_prompt}]})
    contents.append({"role": "model", "parts": [{"text": "আমি বুঝতে পেরেছি। আমি কৃষি বন্ধু হিসেবে আপনাকে সাহায্য করব।"}]})
    
    for msg in history:
        role = "user" if msg.role == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg.content}]
        })
    
    # Add the current message
    contents.append({
        "role": "user",
        "parts": [{"text": message}]
    })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 4000,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # Extract the text
            if "candidates" in data and len(data["candidates"]) > 0:
                parts = data["candidates"][0]["content"]["parts"]
                return "".join(part.get("text", "") for part in parts)
            else:
                return "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।"
                
    except Exception as e:
        logger.error(f"Error communicating with Gemini: {e}")
        return "দুঃখিত, সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। অনুগ্রহ করে পরে আবার চেষ্টা করুন।"
