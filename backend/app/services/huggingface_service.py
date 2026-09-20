import json
import os
from typing import Any
from dotenv import load_dotenv

load_dotenv()

try:
    from huggingface_hub import InferenceClient
except Exception:
    InferenceClient = None

class HuggingFaceService:
    def __init__(self):
        self.token = os.getenv("HF_TOKEN")
        self.model = os.getenv("HF_MODEL", "Qwen/Qwen2.5-7B-Instruct")
        self.client = InferenceClient(api_key=self.token) if self.token and InferenceClient else None

    @property
    def configured(self) -> bool:
        return self.client is not None

    def chat(self, system: str, user: str) -> str:
        if not self.client:
            return "Hugging Face is not configured. Add HF_TOKEN to backend/.env to enable live AI responses."
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
            temperature=0.25,
            max_tokens=1800,
        )
        return response.choices[0].message.content or ""

    def json(self, system: str, user: str, fallback: Any) -> Any:
        raw = self.chat(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}")
            if start >= 0 and end > start:
                return json.loads(raw[start:end + 1])
        except Exception:
            pass
        return fallback

hf = HuggingFaceService()
