// @ts-expect-error: Remote Deno std import used in Supabase Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error: Remote ESM import for Supabase client used at runtime in Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Minimal Deno typings to satisfy the TypeScript checker in this environment.
// Minimal ambient declaration for the Deno env.get API used at runtime
declare const Deno: {
env: {
get(name: string): string | undefined;
};
};
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  language?: string;
}

serve(async (req:Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, language = 'en', messageType = 'text' } = await req.json();
    
    console.log('Request received:', { message, sessionId, language, messageType });
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid authorization');
    }

    console.log('User authenticated:', user.id);

    // Get or create session
    let session;
    if (sessionId) {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();
      
      if (error || !data) {
        console.error('Session fetch error:', error);
        throw new Error('Session not found');
      }
      session = data;
    } else {
      // Create new session
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          language,
          session_type: 'general'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Session creation error:', error);
        throw error;
      }
      session = data;
    }

    console.log('Session ID:', session.id);

    // Save user message
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        role: 'user',
        content: message,
        language,
        message_type: messageType
      });

    if (insertError) {
      console.error('Message insert error:', insertError);
      throw insertError;
    }

    // Get conversation history (last 10 messages for context)
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(10);

    console.log('Retrieved messages:', messages?.length);

    // Prepare system prompt based on language
    const systemPrompts = {
      en: "You are a helpful financial advisor for rural users. Keep responses SHORT and in BULLET POINTS. Maximum 3-4 bullets per response. Use simple language. Format: • Point 1 • Point 2 • Point 3. Help with loan eligibility, loan types, interest rates, and application processes.",
      hi: "आप ग्रामीण उपयोगकर्ताओं के लिए एक सहायक वित्तीय सलाहकार हैं। जवाब छोटे और बुलेट पॉइंट्स में दें। अधिकतम 3-4 बुलेट पॉइंट्स। सरल भाषा का उपयोग करें। प्रारूप: • पॉइंट 1 • पॉइंट 2 • पॉइंट 3. ऋण पात्रता, ऋण प्रकार, ब्याज दरों और आवेदन प्रक्रियाओं में मदद करें।",
      kn: "ನೀವು ಗ್ರಾಮೀಣ ಬಳಕೆದಾರರಿಗೆ ಸಹಾಯಕ ಹಣಕಾಸು ಸಲಹೆಗಾರರಾಗಿದ್ದೀರಿ. ಉತ್ತರಗಳನ್ನು ಚಿಕ್ಕದಾಗಿ ಮತ್ತು ಬುಲೆಟ್ ಪಾಯಿಂಟ್ಗಳಲ್ಲಿ ನೀಡಿ. ಗರಿಷ್ಠ 3-4 ಬುಲೆಟ್ ಪಾಯಿಂಟ್ಗಳು. ಸರಳ ಭಾಷೆ ಬಳಸಿ. ಫಾರ್ಮ್ಯಾಟ್: • ಪಾಯಿಂಟ್ 1 • ಪಾಯಿಂಟ್ 2 • ಪಾಯಿಂಟ್ 3. ಸಾಲದ ಅರ್ಹತೆ, ಸಾಲದ ಪ್ರಕಾರಗಳು, ಬಡ್ಡಿ ದರಗಳು ಮತ್ತು ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಿ."
    };

    // Build conversation for AI
    const conversationMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.en },
      ...(messages || []).map((msg: { role: string; content: string }) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content
      }))
    ];

    // Call OpenAI API
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Calling OpenAI API...');
    
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: conversationMessages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', aiResponse.status);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenAI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait a moment and try again.',
          sessionId: session.id 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (aiResponse.status === 401) {
        return new Response(JSON.stringify({ 
          error: 'API authentication failed. Please contact support.',
          sessionId: session.id 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices[0]?.message?.content || 'I apologize, but I could not process your request. Please try again.';

    console.log('AI response received, length:', assistantMessage.length);

    // Save assistant response
    const { error: saveError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        role: 'assistant',
        content: assistantMessage,
        language,
        message_type: 'text'
      });

    if (saveError) {
      console.error('Error saving assistant message:', saveError);
      // Don't throw here, still return the response
    }

    return new Response(JSON.stringify({ 
      response: assistantMessage, 
      sessionId: session.id,
      language
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in loan-advisor-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});