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
    const { text, language } = await req.json();

    if (!text) {
      throw new Error('No text provided');
    }

    console.log('Generating speech for text:', text.substring(0, 50), 'in language:', language);

    // Generate speech using OpenAI TTS
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'nova', // Natural, friendly voice
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('TTS API error:', error);
      throw new Error(`TTS API error: ${response.status}`);
    }

    // Convert audio to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    console.log('Generated audio, size:', arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide helpful error messages
    let userMessage = errorMessage;
    if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      userMessage = 'Text-to-speech service quota exceeded. Please check your OpenAI account or try again later.';
    } else if (errorMessage.includes('API key')) {
      userMessage = 'Text-to-speech API key not configured properly. Please contact support.';
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
