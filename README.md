🚀 Multilingual Loan Advisor – AI-Powered Financial Assistant

A multilingual, voice-enabled loan advisory platform that helps users understand, compare, and explore loan options using a conversational AI interface.
Built with modern full-stack technologies and optimized for accessibility, especially for users from rural communities who may not be fluent in English or comfortable typing.

✨ Features

✔ AI-Powered Chat — Conversational financial guidance using OpenAI GPT
✔ Voice Support — Speech-to-text (OpenAI Whisper) + text-to-speech output
✔ Multilingual — Supports English, हिंदी (Hindi), and ಕನ್ನಡ (Kannada)
✔ Guest Mode — Explore the app without creating an account
✔ Loan Eligibility Analysis — AI-based assessment and suggestions
✔ Secure Authentication — Profiles, saved conversations, and personalized data
✔ Mobile-Responsive UI — Works seamlessly across mobile and desktop
✔ Persistent Conversations — Each session is stored securely

🛠️ Tech Stack
Frontend
Technology	Purpose
React 18	UI framework
TypeScript	Strong typing & maintainable code
Vite	Lightning-fast dev server and bundler
Tailwind CSS	Styling system
shadcn/ui	Modern, customizable UI components
React Router	Navigation
TanStack Query	Client caching & API state
Backend
Service	Purpose
Supabase	Auth, DB, edge functions
PostgreSQL	Relational database
Supabase Edge Functions	Serverless AI endpoints
Row Level Security	Protect user data
AI & Voice Processing
Feature	Engine
Chat responses	OpenAI GPT
Voice input (speech-to-text)	OpenAI Whisper
Voice output	Web Speech API + Supabase fallback TTS
📦 Installation
Prerequisites

Node.js 18+

npm

Git

Setup
# Clone repository
git clone <YOUR_GIT_URL>
cd loan-advisor

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Fill in your Supabase credentials

# Start development server
npm run dev


App starts at:
👉 http://localhost:8080

🔧 Environment Variables

Create a .env file:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

📁 Project Structure
src/
├── components/          
│   ├── auth/                # Authentication screens
│   ├── chat/                # Chat interface & voice recorder
│   └── ui/                  # Reusable UI components
├── integrations/
│   └── supabase/            # Supabase clients & types
├── pages/                   # Page-level routes
├── hooks/                   # Custom React hooks
└── lib/                     # Utility functions

supabase/
├── functions/               
│   ├── loan-advisor-chat/        # Chat AI endpoint
│   ├── loan-eligibility-check/   # Eligibility scoring
│   ├── transcribe-audio/         # Whisper STT
│   └── text-to-speech/           # TTS fallback
└── migrations/               # PostgreSQL migrations

🚀 Deployment
Netlify Settings
Build Command: npm run build
Publish Directory: dist


Environment variables to configure:

VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID

🔐 Security Practices

🛡️ Row Level Security on all tables
🔑 JWT-based authentication
📦 Environment variables for secrets
🧹 Zod + react-hook-form for safe user input
🚫 No credentials stored on client-side

🌍 Accessibility & Multilingual Support

UI and messages available in three Indian languages

Voice-driven interaction enables non-English & rural users to use the system effortlessly

Works even for users who cannot type

🎙️ Voice Features Explained
Task	Tech
User speaks a query	Microphone + Whisper
Whisper converts audio → text	Supabase edge function
GPT generates a reply	AI engine
Browser speaks answer aloud	Web Speech API

This layered approach ensures speech support even when language models are limited.

🧪 Development
npm run dev      # Start local server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # Linting

📊 Database Schema
Table	Purpose
profiles	User details
chat_sessions	Session-level context
chat_messages	Individual messages
loan_assessments	AI-based eligibility tracking

All tables use Row Level Security to isolate user data.

📝 License

This project is private and intended for demonstration purposes only.

👤 Author

Divya M
Full-stack developer passionate about AI-driven, multilingual financial tools that improve digital accessibility.
