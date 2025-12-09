# Local Development Setup

## Current Issue
The app is configured to connect to a cloud Supabase instance which is not accessible from localhost. You have two options:

## Option 1: Use Guest Mode (Simplest)
1. Run the app: `npm run dev`
2. Click "Continue as Guest" button on the login page
3. Test all UI features with mock responses (no backend needed)

## Option 2: Set Up Your Own Supabase Project (Full Features)

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Log in
3. Create a new project
4. Wait for the project to be provisioned (~2 minutes)

### Step 2: Get Your Credentials
1. Go to Project Settings → API
2. Copy these values:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Project ID (e.g., `xxxxx`)
   - `anon` public key (long JWT token)

### Step 3: Update .env File
Replace the values in `.env`:
```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY_HERE
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
```

### Step 4: Set Up Database Tables
Run these SQL commands in Supabase SQL Editor:

```sql
-- Create chat sessions table
CREATE TABLE public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  language TEXT DEFAULT 'en',
  session_type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their sessions"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );
```

### Step 5: Set Up Edge Functions (Optional - for AI features)
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref YOUR_PROJECT_ID`
4. Deploy functions: `supabase functions deploy`

### Step 6: Configure Secrets for Edge Functions
In Supabase Dashboard → Edge Functions → Secrets, add:
- `LOVABLE_API_KEY` - Get from Lovable AI gateway (if you have access)
- Or use `OPENAI_API_KEY` and update edge function code to use OpenAI directly

### Step 7: Enable Email Auto-confirmation (Development)
1. Go to Authentication → Settings
2. Scroll to "Email Auth"
3. Toggle "Enable email confirmations" to OFF (for development only)

## Testing

### For Guest Mode:
```bash
npm run dev
# Click "Continue as Guest"
# Test the UI and mock responses
```

### For Full Authentication:
```bash
npm run dev
# Sign up with email/password
# Verify the chat sends messages to your Supabase backend
```

## Deployment

For production deployment to Netlify/Render, make sure to:
1. Set environment variables in your hosting platform
2. Use your production Supabase credentials
3. Enable email confirmation in production
4. Set up proper CORS policies

## Troubleshooting

**Error: "Failed to fetch"**
- Check if Supabase project is running
- Verify .env variables are correct
- Try guest mode to isolate the issue

**Edge functions not working**
- Make sure functions are deployed
- Check function logs in Supabase dashboard
- Verify secrets are set

**Authentication errors**
- Enable auto-confirm for development
- Check RLS policies are correctly set
- Verify user exists in auth.users table
