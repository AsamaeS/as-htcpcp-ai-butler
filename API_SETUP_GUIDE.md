# 🔑 API Setup Guide - The Whispering Orb

This guide will help you set up the required APIs for the voice-driven murder mystery game.

## 🎯 Required APIs

### 1. ElevenLabs API (Voice Synthesis)
**Purpose**: Text-to-speech for the mystical orb's voice

**Setup Steps**:
1. Go to [ElevenLabs.io](https://elevenlabs.io/)
2. Create a free account (includes 10,000 characters/month)
3. Navigate to your [API Keys page](https://elevenlabs.io/speech-synthesis)
4. Copy your API key
5. Add to `.env` file: `VITE_ELEVENLABS_API_KEY=your_key_here`

**Free Tier**: 10,000 characters/month (enough for demo)
**Paid Tier**: $5/month for 30,000 characters

### 2. Google Gemini AI API (Response Generation)
**Purpose**: Dynamic, contextual responses from the orb

**Setup Steps**:
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create a new API key
5. Copy the key
6. Add to `.env` file: `VITE_GEMINI_API_KEY=your_key_here`

**Free Tier**: 60 requests per minute (perfect for demo)
**Paid Tier**: Pay-per-use pricing

### 3. Google Cloud (Deployment - Optional)
**Purpose**: Hosting the application

**Setup Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable App Engine API
4. Install [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
5. Run: `gcloud auth login`
6. Run: `gcloud config set project YOUR_PROJECT_ID`

## 🚀 Quick Setup Commands

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env file with your API keys
# Add your ElevenLabs and Gemini API keys

# 3. Install dependencies (if not done)
npm install

# 4. Start development server
npm run dev

# 5. Test voice features
# Click the microphone button and speak a question
```

## 🧪 Testing Your Setup

### Test ElevenLabs Integration
1. Start the game: `npm run dev`
2. Navigate to Level 1
3. Enter interrogation mode
4. Switch to voice mode
5. Ask a question - you should hear the orb respond with voice

### Test Gemini AI Integration
1. Ask contextual questions like:
   - "Who had access to the wine?"
   - "What about the timing of the poison?"
   - "Tell me about the alibis"
2. Responses should be contextual and cryptic, not generic

### Test Without APIs (Demo Mode)
- The game works without API keys using placeholder responses
- Perfect for initial testing and demos
- Voice recognition still works, but no voice synthesis

## 🔧 Troubleshooting

### ElevenLabs Issues
- **Error 401**: Check your API key is correct
- **Error 429**: You've hit the rate limit (wait or upgrade)
- **No audio**: Check browser audio permissions

### Gemini AI Issues
- **Error 400**: Check your API key format
- **Error 403**: API might not be enabled for your project
- **Generic responses**: API key might be missing

### Voice Recognition Issues
- **Not working**: Use Chrome, Edge, or Safari (Firefox has limited support)
- **Poor accuracy**: Speak clearly and ensure good microphone
- **No permission**: Allow microphone access when prompted

## 💡 Pro Tips

### ElevenLabs Optimization
- Use the default Rachel voice (included in free tier)
- Create a custom "mystical orb" voice for better immersion
- Adjust stability and similarity settings in VoiceSettings component

### Gemini AI Optimization
- The prompts are designed to maintain mystery game balance
- AI never reveals the murderer directly
- Responses are contextual based on case facts and previous questions

### Development Tips
- Test with API keys first, then without for fallback behavior
- Use browser dev tools to monitor API calls
- Check console for detailed error messages

## 🏆 Hackathon Deployment

### For Judges/Demo
1. Set up both APIs (takes 5 minutes)
2. Deploy to Google Cloud: `npm run deploy`
3. Share the live URL
4. Create 3-minute demo video showing voice interaction

### Cost Estimate for Hackathon
- **ElevenLabs**: Free tier sufficient for demo
- **Gemini AI**: Free tier sufficient for demo  
- **Google Cloud**: ~$0.05/day for App Engine
- **Total**: Essentially free for hackathon period

## 🎯 Success Checklist

- [ ] ElevenLabs API key working (orb speaks)
- [ ] Gemini AI API key working (contextual responses)
- [ ] Voice recognition working (can ask questions by voice)
- [ ] Game progression working (can solve cases and unlock levels)
- [ ] Deployed to Google Cloud (live demo URL)
- [ ] Demo video recorded (3 minutes max)

---

**Ready to create an unforgettable voice-driven gaming experience!** 🎮✨