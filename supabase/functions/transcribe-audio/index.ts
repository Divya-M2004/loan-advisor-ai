import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-expect-error: Remote Deno std import used in Supabase Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
declare const Deno: {
env: {
get(name: string): string | undefined;
};
};
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req:Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, language } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Transcribing audio with language hint:', language);

    // Decode base64 audio
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Prepare form data for Whisper API
    const formData = new FormData();
    const blob = new Blob([bytes], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    if (language) {
      formData.append('language', language === 'hi' ? 'hi' : language === 'kn' ? 'kn' : 'en');
    }

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Whisper API error:', error);
      throw new Error(`Whisper API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Transcription result:', result.text);

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transcribe-audio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide helpful error messages
    let userMessage = errorMessage;
    if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      userMessage = 'Voice recognition service quota exceeded. Please check your OpenAI account or try again later.';
    } else if (errorMessage.includes('API key')) {
      userMessage = 'Voice recognition API key not configured properly. Please contact support.';
    }
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
