"""
AIService: Handles interaction with OpenRouter AI models.
Includes a failover mechanism for multiple API keys.
"""
import requests
import os
import random
from flask import current_app

class AIService:
    # Model to use (Free models on OpenRouter)
    MODEL = "mistralai/mistral-7b-instruct:free"
    
    # List of API keys (provided by user, will be rotated if one fails)
    API_KEYS = [
        "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",
        "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",
        "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"
    ]

    @classmethod
    def _call_openrouter(cls, prompt, key_index=0):
        """Internal method to call OpenRouter with a specific key index."""
        if key_index >= len(cls.API_KEYS):
            return None, "All API keys failed or exhausted."

        api_key = cls.API_KEYS[key_index]
        
        try:
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://eventify.fun", # Free tier requires a referer
                    "X-Title": "Eventify AI"
                },
                json={
                    "model": cls.MODEL,
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant for an event management platform called Eventify. Help organizers create compelling event descriptions and answer attendee questions."},
                        {"role": "user", "content": prompt}
                    ]
                },
                timeout=15
            )

            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content'], None
            
            elif response.status_code == 429:
                # Rate limited? Try next key
                print(f"[AI] Key {key_index} rate limited. Retrying with next key...")
                return cls._call_openrouter(prompt, key_index + 1)
            
            else:
                print(f"[AI] Error from OpenRouter (Key {key_index}): {response.text}")
                return cls._call_openrouter(prompt, key_index + 1)

        except Exception as e:
            print(f"[AI] Request Exception (Key {key_index}): {str(e)}")
            return cls._call_openrouter(prompt, key_index + 1)

    @classmethod
    def generate_description(cls, title, category, details=""):
        """Generate a compelling event description based on basic info."""
        prompt = f"Write a professional and exciting event description for an event titled '{title}' in the category '{category}'. Additional details provided: {details}. Keep it under 250 words."
        return cls._call_openrouter(prompt)

    @classmethod
    def get_event_suggestions(cls, interests):
        """Recommend event categories or themes based on user interests."""
        prompt = f"Based on the following interests: {', '.join(interests)}, suggest 3 specific types of events or themes that would be popular on our platform. Output only the 3 suggestions as a list."
        return cls._call_openrouter(prompt)
