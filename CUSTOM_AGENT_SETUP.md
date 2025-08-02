# Custom ElevenLabs Agent Integration Guide

## 🎯 How to Use Your Trained ElevenLabs Agent

### Step 1: Get Your Agent Details

1. **Go to ElevenLabs Dashboard**: https://elevenlabs.io/
2. **Navigate to your trained agent**: Find your custom agent in the dashboard
3. **Get the Agent ID**: Copy your agent's unique identifier
4. **Get the Voice ID**: Note which voice your agent uses

### Step 2: Update the Backend Configuration

Edit `backend/app.py` and update these variables:

```python
# ElevenLabs configuration
ELEVENLABS_API_KEY = "your-actual-api-key-here"
ELEVENLABS_VOICE_ID = "your-agent-voice-id"  # Your agent's voice ID
ELEVENLABS_AGENT_ID = "your-agent-id"  # Your trained agent ID
ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"
```

### Step 3: Replace the Simple Response Function

Replace the `generate_conversational_response` function in `backend/app.py`:

```python
def generate_conversational_response(user_message: str) -> str:
    """Generate response using your trained ElevenLabs agent"""
    try:
        # Call your trained agent
        url = f"{ELEVENLABS_BASE_URL}/agents/{ELEVENLABS_AGENT_ID}/chat"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        payload = {
            "message": user_message,
            "conversation_id": "voice_chat_session"
        }
        
        print(f"🤖 Calling trained agent: {ELEVENLABS_AGENT_ID}")
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            agent_response = data.get('response', '')
            print(f"🤖 Agent response: {agent_response}")
            return agent_response
        else:
            print(f"❌ Agent error: {response.status_code} - {response.text}")
            return "I'm having trouble processing that right now. Can you try again?"
            
    except Exception as e:
        print(f"❌ Agent exception: {str(e)}")
        return "Sorry, I'm experiencing some technical difficulties."
```

### Step 4: Alternative - Use ElevenLabs Conversation API

If your agent supports the conversation API, use this instead:

```python
def generate_conversational_response(user_message: str) -> str:
    """Generate response using ElevenLabs conversation API"""
    try:
        url = f"{ELEVENLABS_BASE_URL}/conversation"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        payload = {
            "conversation_id": "voice_chat_session",
            "message": user_message,
            "voice_id": ELEVENLABS_VOICE_ID,
            "model_id": "eleven_turbo_v2",  # or your custom model
            "system_prompt": "You are a friendly, conversational AI assistant. Keep responses short and natural."
        }
        
        print(f"💬 Calling ElevenLabs conversation API")
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            ai_message = data.get('ai_message', '')
            print(f"💬 AI Message: {ai_message}")
            return ai_message
        else:
            print(f"❌ Conversation API error: {response.status_code} - {response.text}")
            return "I'm having trouble processing that right now."
            
    except Exception as e:
        print(f"❌ Conversation exception: {str(e)}")
        return "Sorry, I'm experiencing some technical difficulties."
```

### Step 5: Use Your Custom Voice

Update the voice ID to use your agent's voice:

```python
ELEVENLABS_VOICE_ID = "your-agent-voice-id"  # Your agent's voice
```

### Step 6: Test Your Integration

1. **Restart the backend**: `python3 app.py`
2. **Test the voice**: Use the "Test Voice" button
3. **Speak to your agent**: Try conversational prompts
4. **Check logs**: Monitor the backend console for agent responses

## 🔧 Troubleshooting

### If you get 404 errors:
- Check that your agent ID is correct
- Verify your API key has access to the agent
- Ensure the agent is published and available

### If you get 403 errors:
- Check your API key permissions
- Verify you have enough credits
- Make sure the agent is accessible with your plan

### If responses are generic:
- Check that your agent is properly trained
- Verify the agent's personality and knowledge
- Test the agent directly in ElevenLabs dashboard

## 🎤 Voice Customization

### Use Your Agent's Voice:
```python
ELEVENLABS_VOICE_ID = "your-agent-voice-id"
```

### Use a Different Voice:
```python
# Available voices:
# "21m00Tcm4TlvDq8ikWAM" - Rachel
# "AZnzlk1XvdvUeBnXmlld" - Domi
# "EXAVITQu4vr4xnSDxMaL" - Bella
# "ErXwobaYiN019PkySvjV" - Antoni
```

## 📊 Expected Results

With your trained agent integrated:
- **Custom responses**: Your agent's personality and knowledge
- **High-quality voice**: ElevenLabs voice synthesis
- **Fast responses**: Optimized for conversation
- **Natural flow**: Seamless voice interaction

## 💡 Tips

1. **Test in ElevenLabs first**: Make sure your agent works in the dashboard
2. **Monitor credits**: ElevenLabs charges per character
3. **Optimize responses**: Keep them concise for faster processing
4. **Backup plan**: Always have fallback responses

Your trained agent should now be fully integrated! 🎤✨ 