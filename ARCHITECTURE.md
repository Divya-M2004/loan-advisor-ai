# System Architecture

## Overview
Loan Advisor is a full-stack web application built with a modern JAMstack architecture, utilizing a React frontend and serverless backend functions.

## High-Level Architecture

```
┌─────────────────┐
│   Client Side   │
│  (React + Vite) │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│   Supabase      │
│   Backend       │
├─────────────────┤
│ - PostgreSQL    │
│ - Auth          │
│ - Edge Functions│
│ - Storage       │
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│  AI Services    │
├─────────────────┤
│ - Gemini AI     │
│ - OpenAI Whisper│
└─────────────────┘
```

## Component Architecture

### Frontend Layer
```
src/
├── pages/              # Route-level components
│   └── Index.tsx       # Main entry with auth logic
├── components/
│   ├── auth/          # Authentication UI
│   │   └── AuthPage.tsx
│   ├── chat/          # Chat interface
│   │   ├── ChatInterface.tsx
│   │   └── VoiceRecorder.tsx
│   └── ui/            # Reusable UI primitives
├── integrations/      # External services
│   └── supabase/
│       ├── client.ts  # Supabase initialization
│       └── types.ts   # Auto-generated DB types
└── lib/               # Utilities
    └── utils.ts
```

### Backend Layer (Supabase Edge Functions)
```
supabase/functions/
├── loan-advisor-chat/
│   └── index.ts       # Main AI chat endpoint
├── loan-eligibility-check/
│   └── index.ts       # Loan assessment logic
├── transcribe-audio/
│   └── index.ts       # Voice-to-text
└── text-to-speech/
    └── index.ts       # Text-to-voice
```

## Data Flow

### Authentication Flow
```
User → AuthPage → Supabase Auth → Session Created
                                 ↓
                          JWT Token Stored
                                 ↓
                          User Redirected to Chat
```

### Chat Message Flow
```
User Input → ChatInterface → Edge Function → AI Gateway
                                           ↓
                        Response ← AI Model (Gemini)
                                           ↓
                        Database ← Save to chat_messages
                                           ↓
                        UI Update ← Display Response
```

### Voice Message Flow
```
Microphone → VoiceRecorder → Base64 Audio → Edge Function
                                           ↓
                              OpenAI Whisper API
                                           ↓
                              Transcribed Text
                                           ↓
                              Send as Text Message
```

## Database Schema

### Entity Relationship
```
auth.users (Supabase Managed)
    ↓ (1:1)
profiles
    ↓ (1:N)
chat_sessions
    ↓ (1:N)
chat_messages

profiles
    ↓ (1:N)
loan_assessments
```

### Tables

#### profiles
- Stores user metadata
- RLS: Users can only see their own profile
- Trigger: Auto-created on signup

#### chat_sessions
- Groups related messages
- Tracks language preference
- RLS: Users can only access their own sessions

#### chat_messages
- Individual chat messages
- Stores role (user/assistant)
- RLS: Users can only see messages from their sessions

#### loan_assessments
- Stores loan eligibility results
- Contains AI-generated recommendations
- RLS: Users can only view their own assessments

## Security Architecture

### Authentication
- Supabase Auth with JWT tokens
- Automatic token refresh
- Secure session management

### Authorization
- Row Level Security (RLS) on all tables
- JWT validation on edge functions
- User-scoped data access

### API Security
- CORS headers configured
- Environment variables for secrets
- API keys stored server-side only

## Deployment Architecture

### Production Setup
```
GitHub Repo
    ↓ (Git Push)
Netlify/Render
    ↓ (Build Process)
Static Files → CDN
    ↓
End Users

Backend:
Supabase Cloud
    ↓
Edge Functions (Deno)
    ↓
External APIs
```

### Environment Separation
- Development: Local Vite server + Cloud Supabase
- Production: CDN-hosted + Cloud Supabase
- Edge Functions: Auto-deploy to Supabase regions

## Scalability Considerations

### Frontend
- Static site hosting on CDN (global distribution)
- Code splitting with React lazy loading
- Optimized bundle size with tree shaking

### Backend
- Serverless edge functions (auto-scaling)
- Connection pooling for database
- Horizontal scaling via Supabase infrastructure

### Database
- PostgreSQL with automatic backups
- Read replicas for scaling reads
- Indexed queries for performance

## Performance Optimizations

### Client-Side
- React Query for data caching
- Optimistic UI updates
- Lazy loading of routes
- Image optimization

### Network
- HTTP/2 server push
- Compression (gzip/brotli)
- Asset caching strategies
- CDN edge caching

### Backend
- Efficient database queries
- Connection reuse
- Response streaming for AI
- Batched operations

## Monitoring & Observability

### Logs
- Edge function logs in Supabase dashboard
- Browser console for client errors
- Error boundaries in React

### Metrics
- Response times
- Error rates
- User session tracking
- Database query performance

## Future Architecture Enhancements

### Planned Improvements
1. **Real-time features**: WebSocket connections for live chat
2. **Caching layer**: Redis for session management
3. **CDN optimization**: Geographic edge caching
4. **Load balancing**: Multi-region deployment
5. **Monitoring**: APM integration (Sentry, DataDog)
6. **Testing**: E2E test suite with Playwright

### Scalability Roadmap
- Implement rate limiting per user
- Add queue system for heavy operations
- Database read replicas for analytics
- Microservices for complex workflows
