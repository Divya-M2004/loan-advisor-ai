import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  language: string;
  isLoading: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription, language, isLoading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [useBrowserAPI, setUseBrowserAPI] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Map language codes
      const langMap: { [key: string]: string } = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'kn': 'kn-IN'
      };
      recognition.lang = langMap[language] || 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log('Browser transcription:', transcript);
        onTranscription(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: "Voice input failed",
          description: "Could not recognize speech. Please try again or type your message.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setUseBrowserAPI(false);
    }
  }, [language, onTranscription, toast]);

  const startRecording = () => {
    if (useBrowserAPI && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast({
          title: "Listening...",
          description: "Speak now",
        });
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive",
        });
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isLoading || !useBrowserAPI}
      className={`h-12 w-12 transition-all ${
        isRecording 
          ? 'bg-voice-active text-white shadow-voice animate-pulse-voice' 
          : 'hover:bg-voice-inactive/20'
      }`}
      title={!useBrowserAPI ? "Voice input not supported in this browser" : ""}
    >
      {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </Button>
  );
};

export default VoiceRecorder;
