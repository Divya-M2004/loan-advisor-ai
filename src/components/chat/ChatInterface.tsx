import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  Send, 
  Volume2, 
  VolumeX,
  Calculator,
  FileText,
  User,
  Bot,
  Loader2
} from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import VoiceRecorder from './VoiceRecorder';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
}

interface ChatInterfaceProps {
  session: Session | null;
  isGuest?: boolean;
  onSignOut: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ session, isGuest = false, onSignOut }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const languages = {
    en: { name: 'English', flag: '🇺🇸' },
    hi: { name: 'हिंदी', flag: '🇮🇳' },
    kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳' }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    const welcomeMessages = {
      en: "Hello! I'm your Loan Advisor. I can help you with loan eligibility, applications, and financial planning. How can I assist you today?",
      hi: "नमस्ते! मैं आपका ऋण सलाहकार हूं। मैं ऋण पात्रता, आवेदन और वित्तीय योजना में आपकी सहायता कर सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
      kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸಾಲ ಸಲಹೆಗಾರ. ಸಾಲದ ಅರ್ಹತೆ, ಅರ್ಜಿಗಳು ಮತ್ತು ಹಣಕಾಸು ಯೋಜನೆಯಲ್ಲಿ ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
    };

    setMessages([{
      id: '1',
      role: 'assistant',
      content: welcomeMessages[language as keyof typeof welcomeMessages],
      timestamp: new Date(),
      language
    }]);
  }, [language]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      language
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Guest mode: Use simple mock response
      if (isGuest) {
        const guestResponses = {
          en: "I'm a demo assistant. To access full loan advisory features including personalized recommendations, eligibility checks, and saved conversations, please create an account. How else can I help demonstrate the app?",
          hi: "मैं एक डेमो सहायक हूं। व्यक्तिगत सिफारिशें, पात्रता जांच और सहेजी गई बातचीत सहित पूर्ण ऋण सलाहकार सुविधाओं तक पहुंचने के लिए, कृपया एक खाता बनाएं। मैं ऐप प्रदर्शित करने में और कैसे मदद कर सकता हूं?",
          kn: "ನಾನು ಡೆಮೊ ಸಹಾಯಕ. ವೈಯಕ್ತಿಕ ಶಿಫಾರಸುಗಳು, ಅರ್ಹತೆ ಪರಿಶೀಲನೆಗಳು ಮತ್ತು ಉಳಿಸಿದ ಸಂಭಾಷಣೆಗಳು ಸೇರಿದಂತೆ ಸಂಪೂರ್ಣ ಸಾಲ ಸಲಹಾ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಪ್ರವೇಶಿಸಲು, ದಯವಿಟ್ಟು ಖಾತೆಯನ್ನು ರಚಿಸಿ. ಅಪ್ಲಿಕೇಶನ್ ಪ್ರದರ್ಶಿಸಲು ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
        };

        await new Promise(resolve => setTimeout(resolve, 1500));

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: guestResponses[language as keyof typeof guestResponses] || guestResponses.en,
          timestamp: new Date(),
          language
        };

        setMessages(prev => [...prev, assistantMessage]);
        await playAudioResponse(assistantMessage.content);
        setIsLoading(false);
        return;
      }

      // Authenticated mode: Use full AI backend
     const { data, error } = await supabase.functions.invoke('loan-advisor-chat', {
  body: {
    message: messageText,
    conversationId: currentSessionId,
    lang: language,
    guest: isGuest
  }
});


      if (error) {
        console.error('Supabase function error:', error);
        
        // Check if it's a rate limit error
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        
        throw new Error('Unable to connect to the AI service. Please check your internet connection or try guest mode.');
      }
      
      // Check for error in response data
      if (data?.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
  id: (Date.now() + 1).toString(),
  role: 'assistant',
  content: data.response,   // FIXED
  timestamp: new Date(),
  language
};

setCurrentSessionId(data.sessionId);   

setMessages(prev => [...prev, assistantMessage]);

await playAudioResponse(data.response); // FIXED



    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the failed user message
      setMessages(prev => prev.filter(msg => msg.id !== newUserMessage.id));
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      
      toast({
        title: "Connection Error",
        description: errorMessage + " You can use Guest Mode for offline testing.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleVoiceTranscription = (text: string) => {
    setInputMessage(text);
    sendMessage(text);
  };

  const playAudioResponse = async (text: string) => {
    if (!text) return;
    
    try {
      setIsSpeaking(true);
      
      // Use browser's Web Speech API (free, no API key needed)
      if ('speechSynthesis' in window) {
        // Wait for voices to load
        const getVoices = () => {
          return new Promise<SpeechSynthesisVoice[]>((resolve) => {
            let voices = window.speechSynthesis.getVoices();
            if (voices.length) {
              resolve(voices);
            } else {
              window.speechSynthesis.onvoiceschanged = () => {
                voices = window.speechSynthesis.getVoices();
                resolve(voices);
              };
            }
          });
        };

        const voices = await getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language and find appropriate voice
        const langMap: { [key: string]: string } = {
          'en': 'en-US',
          'hi': 'hi-IN',
          'kn': 'kn-IN'
        };
        const targetLang = langMap[language] || 'en-US';
        utterance.lang = targetLang;
        
        // Try to find a voice that matches the language
        const matchingVoice = voices.find(voice => 
          voice.lang === targetLang || voice.lang.startsWith(targetLang.split('-')[0])
        );
        
        if (matchingVoice) {
          utterance.voice = matchingVoice;
          console.log('Using voice:', matchingVoice.name, matchingVoice.lang);
        } else {
          console.warn(`No voice found for ${targetLang}, using default`);
          // For Kannada, try to find any Indian voice as fallback
          if (language === 'kn' || language === 'hi') {
            const indianVoice = voices.find(v => v.lang.includes('-IN'));
            if (indianVoice) {
              utterance.voice = indianVoice;
              console.log('Using Indian voice fallback:', indianVoice.name);
            }
          }
        }
        
        // Set voice parameters
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        utterance.onerror = (error) => {
          console.error('Speech synthesis error:', error);
          setIsSpeaking(false);
          toast({
            title: "Voice playback failed",
            description: "Kannada voice may not be available in your browser. Try Chrome or Edge for better language support.",
            variant: "destructive",
          });
        };

        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        window.speechSynthesis.speak(utterance);
        return;
      }

      // Fallback to OpenAI TTS if browser API not available
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text, language }
      });

      if (response.error) throw response.error;

      const { audioContent } = response.data;
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsSpeaking(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const quickMessages = {
      eligibility: {
        en: "I want to check my loan eligibility. Can you help me?",
        hi: "मैं अपनी ऋण पात्रता की जांच करना चाहता हूं। क्या आप मेरी मदद कर सकते हैं?",
        kn: "ನಾನು ನನ್ನ ಸಾಲದ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ಬಯಸುತ್ತೇನೆ. ನೀವು ನನಗೆ ಸಹಾಯ ಮಾಡಬಹುದೇ?"
      },
      compare: {
        en: "Can you help me compare different loan options?",
        hi: "क्या आप विभिन्न ऋण विकल्पों की तुलना करने में मेरी सहायता कर सकते हैं?",
        kn: "ವಿವಿಧ ಸಾಲ ಆಯ್ಕೆಗಳನ್ನು ಹೋಲಿಸಲು ನೀವು ನನಗೆ ಸಹಾಯ ಮಾಡಬಹುದೇ?"
      },
      application: {
        en: "I need help with my loan application process.",
        hi: "मुझे अपनी ऋण आवेदन प्रक्रिया में सहायता चाहिए।",
        kn: "ನನ್ನ ಸಾಲದ ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ನನಗೆ ಸಹಾಯ ಬೇಕು."
      }
    };

    const message = quickMessages[action as keyof typeof quickMessages][language as keyof typeof languages];
    if (message) {
      sendMessage(message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-primary p-2 rounded-full">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">
                Loan Advisor {isGuest && <span className="text-xs text-warning">(Guest Mode)</span>}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isGuest ? 'Demo Mode - Sign up for full features' : 'Financial Assistant'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue>
                  <span className="flex items-center space-x-2">
                    <span>{languages[language as keyof typeof languages].flag}</span>
                    <span className="hidden sm:inline">{languages[language as keyof typeof languages].name}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(languages).map(([code, lang]) => (
                  <SelectItem key={code} value={code}>
                    <span className="flex items-center space-x-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSignOut}
              className="text-muted-foreground"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex space-x-2 overflow-x-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('eligibility')}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <Calculator className="h-4 w-4" />
            <span>Check Eligibility</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('compare')}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <FileText className="h-4 w-4" />
            <span>Compare Loans</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('application')}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <User className="h-4 w-4" />
            <span>Application Help</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          >
            <div className={`flex items-start space-x-2 max-w-xs sm:max-w-md lg:max-w-lg`}>
              {message.role === 'assistant' && (
                <div className="bg-gradient-primary p-2 rounded-full flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              
              <Card className={`p-3 ${
                message.role === 'user' 
                  ? 'bg-chat-user text-chat-user-foreground' 
                  : 'bg-chat-assistant text-chat-assistant-foreground'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </Card>
              
              {message.role === 'user' && (
                <div className="bg-primary p-2 rounded-full flex-shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="flex items-start space-x-2">
              <div className="bg-gradient-primary p-2 rounded-full">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <Card className="p-3 bg-chat-assistant">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </Card>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              language === 'hi' ? 'अपना संदेश लिखें...' :
              language === 'kn' ? 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...' :
              'Type your message...'
            }
            disabled={isLoading}
            className="flex-1 h-12"
          />
          
          <VoiceRecorder
            onTranscription={handleVoiceTranscription}
            language={language}
            isLoading={isLoading}
          />
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => isSpeaking ? audioRef.current?.pause() : playAudioResponse(messages[messages.length - 1]?.content || '')}
            disabled={isLoading || messages.length === 0}
            className="h-12 w-12"
            title={isSpeaking ? "Stop speaking" : "Replay last message"}
          >
            {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="h-12 w-12 bg-gradient-primary"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        <audio 
          ref={audioRef} 
          onEnded={() => setIsSpeaking(false)}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatInterface;