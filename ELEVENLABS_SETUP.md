# ElevenLabs Voice Integration Setup

## 🎤 How to Set Up ElevenLabs Voices

### Step 1: Get Your ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up for a free account
3. Go to your profile settings
4. Copy your API key

### Step 2: Update the Backend

1. Open `backend/app.py`
2. Replace `"your-elevenlabs-api-key-here"` with your actual API key:

```python
ELEVENLABS_API_KEY = "your-actual-api-key-here"
```

### Step 3: Restart the Backend

```bash
cd backend
python3 app.py
```

### Step 4: Test Different Voices

The app now includes a voice selector with these ElevenLabs voices:

- **Rachel** - Professional female voice (default)
- **Domi** - Strong female voice
- **Bella** - Soft female voice
- **Antoni** - Male voice
- **Elli** - Young female voice
- **Josh** - Male voice
- **Adam** - Male voice
- **Sam** - Male voice

### Step 5: Use Your Own Voice

To use your own custom voice:

1. Go to ElevenLabs Voice Library
2. Create a new voice or clone an existing one
3. Copy the voice ID
4. Replace the voice ID in the frontend or add it to the `availableVoices` array

### Step 6: Custom Voice Settings

You can adjust voice settings in `backend/app.py`:

```python
payload = {
    "text": text,
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {
        "stability": 0.5,        # 0-1: Higher = more stable
        "similarity_boost": 0.5  # 0-1: Higher = more similar to original
    }
}
```

## 🎯 Features

- **High-quality AI voices** from ElevenLabs
- **Voice selector** in the UI
- **Fallback to browser speech** if ElevenLabs fails
- **Multiple voice options** to choose from
- **Custom voice support** for your own voices

## 🔧 Troubleshooting

### If ElevenLabs doesn't work:
1. Check your API key is correct
2. Ensure you have credits available (free tier: 10,000 characters/month)
3. Check the browser console for error messages
4. The app will automatically fall back to browser speech synthesis

### To add more voices:
1. Get voice IDs from ElevenLabs
2. Add them to the `availableVoices` array in `frontend/terra/app/page.tsx`

## 💡 Tips

- **Rachel** is great for professional conversations
- **Bella** is softer and more conversational
- **Antoni** and **Josh** are good male voices
- You can create custom voices by uploading audio samples to ElevenLabs

Enjoy your high-quality AI voice chat! 🎤✨ 