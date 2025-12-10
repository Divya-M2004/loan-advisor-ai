# Loan Advisor - AI-Powered Financial Assistant

A multilingual loan advisory application built with modern web technologies, designed to help rural communities access financial guidance through an intuitive chat interface with voice support.

## 🚀 Features

- **AI-Powered Chat**: Intelligent loan advisory powered by Google Gemini AI
- **Voice Support**: Speech-to-text and text-to-speech in multiple languages
- **Multilingual**: Support for English, Hindi, and Kannada
- **Guest Mode**: Try the app without creating an account
- **Loan Eligibility**: AI-based loan assessment and recommendations
- **Secure Authentication**: User accounts with profile management
- **Real-time Chat**: Persistent conversations with session management
- **Responsive Design**: Works seamlessly on mobile and desktop

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching

### Backend
- **Supabase** - Backend as a service
  - PostgreSQL database
  - Authentication
  - Edge Functions (Deno)
  - Real-time capabilities
- **AI Integration** - Google Gemini 2.5 Flash via gateway
- **OpenAI Whisper** - Speech-to-text transcription

### Key Libraries
- `lucide-react` - Beautiful icons
- `sonner` - Toast notifications
- `react-hook-form` + `zod` - Form handling and validation
- `date-fns` - Date manipulation

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd loan-advisor

# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env and fill in your Supabase credentials

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🔧 Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication pages
│   ├── chat/           # Chat interface
│   └── ui/             # Reusable UI components
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── pages/              # Route pages
├── lib/                # Utility functions
└── hooks/              # Custom React hooks

supabase/
├── functions/          # Edge Functions
│   ├── loan-advisor-chat/      # Main chat AI endpoint
│   ├── loan-eligibility-check/ # Loan assessment
│   ├── transcribe-audio/       # Voice-to-text
│   └── text-to-speech/         # Text-to-voice
└── migrations/         # Database migrations
```

## 🚀 Deployment

### Netlify
```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables (add in Netlify dashboard)
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

## 🔐 Security Features

- Row Level Security (RLS) on all database tables
- Secure authentication with Supabase Auth
- Environment variables for sensitive data
- Input validation with Zod schemas
- Protected API endpoints with JWT verification

## 📱 Key Features Explained

### Guest Mode
Users can try the app immediately without signing up. Guest sessions use demo responses and don't persist data.

### Multilingual Support
- Automatic language detection
- UI translation for English, Hindi, and Kannada
- Voice input/output in native languages
- Context-aware AI responses

### Voice Features
- Browser-based speech synthesis (free, no API needed)
- OpenAI Whisper for accurate transcription
- Support for multiple Indian languages

### Loan Assessment
- AI-powered eligibility checks
- Personalized loan recommendations
- Risk level analysis
- Multiple loan product comparisons

## 🧪 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📊 Database Schema

### Tables
- `profiles` - User profile information
- `chat_sessions` - Conversation sessions
- `chat_messages` - Individual messages
- `loan_assessments` - Loan eligibility results

All tables include Row Level Security policies for data protection.

### Why This Stack?
- **React**: Industry standard, large ecosystem, excellent for interactive UIs
- **TypeScript**: Catches errors early, better IDE support, self-documenting code
- **Supabase**: Open-source, PostgreSQL-based, handles auth/database/APIs in one platform
- **Tailwind**: Rapid styling, consistent design system, small production bundle
- **Edge Functions**: Low latency, auto-scaling, pay-per-use pricing

### Challenges Solved
- **Multilingual Voice**: Implemented fallback system for languages not supported by all browsers
- **Guest vs Auth**: Dual-mode system allows trial without friction while maintaining security for logged-in users
- **AI Rate Limits**: Error handling and user feedback for API limitations
- **Real-time Chat**: Optimistic UI updates for instant feedback

## 📝 License

This project is private and confidential.

## 👤 Author
Divya M
Developed as a full-stack demonstration project showcasing modern web development practices.
