# 🔮 The Whispering Orb - Voice-Driven Murder Mystery

> **Hackathon Project**: ElevenLabs Challenge - Google Cloud AI Hackathon 2024

An immersive, voice-driven murder mystery game where players interact entirely through speech with a mystical AI-powered orb to solve complex cases.

## 🎯 Hackathon Challenge: ElevenLabs + Google Cloud AI

This project demonstrates the power of combining **ElevenLabs' conversational AI** with **Google Cloud's Vertex AI/Gemini** to create a fully voice-driven gaming experience. Players can:

- 🎤 **Ask questions by voice** - Natural speech recognition
- 🔮 **Receive AI-generated responses** - Contextual, cryptic answers from the mystical orb
- 🗣️ **Hear responses spoken aloud** - ElevenLabs text-to-speech with custom voices
- 🧠 **Experience dynamic storytelling** - Gemini AI generates contextual responses

## 🚀 Live Demo

**Deployed URL**: https://the-whispering-orb.vercel.app

**Demo Video**: [3-minute demo video on YouTube]

## 🛠️ Technology Stack

### Core Technologies
- **React 18** + **TypeScript** - Modern web framework
- **Vite** - Fast development and building
- **Tailwind CSS** + **shadcn/ui** - Beautiful, responsive design
- **Framer Motion** - Smooth animations and transitions

### AI & Voice Integration
- **ElevenLabs API** - High-quality text-to-speech and voice synthesis
- **Google Gemini AI** - Dynamic response generation and case analysis
- **Web Speech API** - Browser-native speech recognition
- **Web Audio API** - Audio playback and processing

### Cloud Infrastructure
- **Google Cloud App Engine** - Scalable hosting
- **Google Cloud Build** - CI/CD pipeline
- **Vertex AI** - Advanced AI capabilities (planned)

## 🎮 Game Features

### Voice-First Experience
- **Natural Conversation**: Speak questions naturally to the mystical orb
- **Intelligent Responses**: AI-generated cryptic clues that maintain game balance
- **Atmospheric Audio**: Custom voice synthesis for the orb's mystical personality
- **Seamless Switching**: Toggle between voice and text input modes

### Murder Mystery Gameplay
- **Progressive Cases**: Multiple difficulty levels with increasing complexity
- **Limited Questions**: Strategic gameplay with only 3 questions per case
- **Logical Deduction**: Fair, solvable mysteries with consistent clues
- **Dynamic Storytelling**: AI adapts responses based on previous questions

### Technical Innovation
- **Real-time Voice Processing**: Low-latency speech recognition and synthesis
- **Context-Aware AI**: Gemini maintains case consistency and narrative flow
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Offline Fallback**: Graceful degradation when APIs are unavailable

## 🔧 Setup Instructions

### Prerequisites
- **Node.js 18+** and **npm**
- **ElevenLabs API Key** ([Get one here](https://elevenlabs.io/))
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/))
- **Google Cloud Account** (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/UnknownGod2011/the-whispering-orb.git
   cd the-whispering-orb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Google Cloud Deployment

1. **Install Google Cloud CLI**
   ```bash
   # Follow instructions at: https://cloud.google.com/sdk/docs/install
   ```

2. **Initialize and authenticate**
   ```bash
   gcloud init
   gcloud auth login
   ```

3. **Set up project**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   gcloud app create --region=us-central
   ```

4. **Deploy application**
   ```bash
   npm run build
   gcloud app deploy
   ```

## 🎯 Hackathon Requirements Fulfilled

### ✅ ElevenLabs Integration
- **Voice Synthesis**: Custom orb voice with atmospheric personality
- **Real-time Audio**: Streaming audio responses for immersive experience
- **Voice Recognition**: Natural speech input for questions
- **React SDK**: Integrated using ElevenLabs React components

### ✅ Google Cloud AI Integration
- **Gemini AI**: Dynamic response generation maintaining game logic
- **Contextual Understanding**: AI maintains case consistency across questions
- **Cloud Deployment**: Hosted on Google Cloud App Engine
- **Scalable Architecture**: Built for cloud-native scaling

### ✅ Innovation & User Experience
- **Voice-First Design**: Entirely conversational gameplay option
- **Atmospheric Immersion**: AI-powered mystical orb personality
- **Progressive Difficulty**: Multiple cases with increasing complexity
- **Cross-Platform**: Works on desktop, mobile, and tablets

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   ElevenLabs     │    │  Google Cloud   │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │Voice Manager│ │◄──►│ │Text-to-Speech│ │    │ │  Gemini AI  │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │Speech Recog │ │    │ │Voice Cloning │ │    │ │ App Engine  │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎨 Game Design Philosophy

### Mystical Atmosphere
- **Visual Design**: Dark, atmospheric UI with glowing orb animations
- **Audio Design**: Ethereal voice synthesis with mystical personality
- **Narrative Style**: Cryptic, poetic responses that maintain immersion

### Fair Mystery Design
- **Logical Consistency**: All cases have clear, deducible solutions
- **Balanced Clues**: Information is distributed fairly across questions
- **Progressive Difficulty**: Cases increase in complexity and red herrings

### Accessibility
- **Multiple Input Methods**: Voice and text input options
- **Visual Feedback**: Clear indicators for voice recognition status
- **Responsive Design**: Works across all device sizes

## 🏆 Future Enhancements

- **Dynamic Case Generation**: AI-generated cases with infinite variety
- **Multiplayer Mode**: Collaborative solving with voice chat
- **Advanced Voice Features**: Emotion detection and response adaptation
- **VR Integration**: Immersive 3D environments with spatial audio

## 📝 License

This project is open source under the MIT License. See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

---

**Built for the Google Cloud AI Hackathon 2024** 🚀  
*Pushing the boundaries of voice-driven gaming with AI*
