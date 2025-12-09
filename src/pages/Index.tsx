import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import AuthPage from '@/components/auth/AuthPage';
import ChatInterface from '@/components/chat/ChatInterface';
import { Loader2, Shield } from 'lucide-react';

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for guest mode
    const guestMode = localStorage.getItem('guestMode');
    if (guestMode === 'true') {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGuestLogin = () => {
    localStorage.setItem('guestMode', 'true');
    setIsGuest(true);
  };

  const handleSignOut = async () => {
    if (isGuest) {
      localStorage.removeItem('guestMode');
      setIsGuest(false);
    } else {
      await supabase.auth.signOut();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Loan Advisor...</p>
        </div>
      </div>
    );
  }

  if (!session && !isGuest) {
    return <AuthPage onGuestLogin={handleGuestLogin} />;
  }

  return (
    <ChatInterface 
      session={session} 
      isGuest={isGuest}
      onSignOut={handleSignOut} 
    />
  );
};

export default Index;
