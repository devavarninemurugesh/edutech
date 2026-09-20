import json
import os
import requests
from typing import Optional, Dict, Any

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

DEFAULT_KEY = ""

class GeminiService:
    def __init__(self, api_key: Optional[str] = None):
        self._key = api_key or os.getenv("GEMINI_API_KEY", "")

    @property
    def api_key(self) -> str:
        return self._key or os.getenv("GEMINI_API_KEY", "")

    @api_key.setter
    def api_key(self, key: str):
        self._key = key

    def is_configured(self, custom_key: Optional[str] = None) -> bool:
        key = custom_key or self.api_key
        return bool(key and key.strip())

    def chat(self, system_prompt: str, user_prompt: str, custom_key: Optional[str] = None) -> str:
        key = (custom_key or self.api_key).strip()
        if not key:
            return self._fallback_answer(user_prompt)

        # 1. Try google-genai SDK first if available
        if genai is not None:
            models_to_try = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
            for model_name in models_to_try:
                try:
                    client = genai.Client(api_key=key)
                    config = None
                    if types is not None:
                        config = types.GenerateContentConfig(
                            system_instruction=system_prompt,
                            temperature=0.3,
                        )
                    
                    contents = user_prompt if config else f"{system_prompt}\n\n{user_prompt}"
                    response = client.models.generate_content(
                        model=model_name,
                        contents=contents,
                        config=config
                    )
                    if response and response.text:
                        return response.text.strip()
                except Exception:
                    continue

        # 2. Direct REST API Fallback (Verified active endpoint in 2026)
        try:
            models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
            for model_name in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}"
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": f"{system_prompt}\n\n{user_prompt}"
                        }]
                    }]
                }
                resp = requests.post(url, json=payload, timeout=15)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
        except Exception:
            pass

        return self._fallback_answer(user_prompt)

    def json(self, system_prompt: str, user_prompt: str, fallback: Any = None, custom_key: Optional[str] = None) -> Any:
        raw = self.chat(system_prompt, user_prompt, custom_key=custom_key)
        if not raw or "Gemini Standby" in raw:
            return fallback
        try:
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned = "\n".join(lines).strip()
            
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start >= 0 and end > start:
                return json.loads(cleaned[start:end + 1])
                
            start_arr = cleaned.find("[")
            end_arr = cleaned.rfind("]")
            if start_arr >= 0 and end_arr > start_arr:
                return json.loads(cleaned[start_arr:end_arr + 1])
        except Exception:
            pass
        return fallback

    def _fallback_answer(self, user_prompt: str) -> str:
        return (
            "🤖 **EduPath AI Assistant**\n\n"
            "hi"
        )

gemini = GeminiService()

