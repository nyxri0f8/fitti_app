import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Phone, Lock, MoreVertical, User, Calendar, Video, X, CheckCheck, Mic, ArrowLeft, ChevronLeft } from 'lucide-react';
import Modal from '../shared/Modal';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ activeContact, messages, onSendMessage, onBack }) {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [generatingMeet, setGeneratingMeet] = useState(false);
  
  const messagesEndRef = useRef(null);
  const attachMenuRef = useRef(null);
  const user = useAuthStore(state => state.user);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setShowAttachMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScheduleMeet = () => {
    setShowAttachMenu(false);
    setShowMeetModal(true);
  };

  const [hasGoogleLinked, setHasGoogleLinked] = useState(false);

  const checkIdentity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const isLinked = user?.identities?.some(id => id.provider === 'google');
    setHasGoogleLinked(!!isLinked);
  };

  useEffect(() => {
    checkIdentity();
    
    // Auto-open modal if returning from a Google link attempt
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = urlParams.get('error') || hashParams.get('error');
    const errorCode = urlParams.get('error_code') || hashParams.get('error_code');
    const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
    
    // Extract provider_token BEFORE wiping the URL
    const pToken = hashParams.get('provider_token');
    if (pToken) {
      localStorage.setItem('fitti_google_provider_token', pToken);
    }
    
    if (window.location.hash.includes('access_token') || error || errorCode) {
      setShowMeetModal(true);
      
      // Cleanup URL to prevent re-opening on manual refresh
      window.history.replaceState({}, document.title, window.location.pathname);

      if (errorCode === 'identity_already_exists' || errorDescription?.includes('already linked')) {
        alert('❌ GOOGLE ACCOUNT CONFLICT: This Google account is already linked to a different Fitti profile.\n\nTo fix this:\n1. Use a different Google account.\n2. OR log in to your other Fitti account and disconnect it first.');
      }
    }
  }, [user]);

  const handleConnectGoogle = async () => {
    await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: window.location.href
      }
    });
  };

  const handleUnlinkGoogle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const googleIdentity = user?.identities?.find(id => id.provider === 'google');
      if (googleIdentity) {
        const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
        if (error) throw error;
        setHasGoogleLinked(false);
        // Reset the session locally to clear cached identities
        await supabase.auth.getSession(); 
        localStorage.removeItem('fitti_google_provider_token');
        alert('Google Account Disconnected. You can now connect again.');
      }
    } catch (err) {
      console.error('Unlink Error:', err);
      alert('Failed to disconnect: ' + err.message);
    }
  };

  const handleGenerateLink = async () => {
    setGeneratingMeet(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const localToken = localStorage.getItem('fitti_google_provider_token');
      const tokenToUse = session?.provider_token || localToken;
      
      const { data, error } = await supabase.functions.invoke('schedule-meet', {
        body: { 
          guestId: activeContact.id,
          providerToken: tokenToUse
        }
      });
      
      if (error) {
        const errorMsg = await error.context?.json() || { error: error.message };
        throw new Error(errorMsg.error || error.message);
      }
      
      if (!data?.meetLink) {
        throw new Error('Google did not return a meeting link. Check your permissions.');
      }
      
      onSendMessage(`🗓️ I've generated a Google Meet link for our session.\n\nJoin here: ${data.meetLink}`);
    } catch (err) {
      console.error('Meet Generation Error:', err);
      if (err.message.includes('TOKEN MISSING') || err.message.includes('Identity')) {
        onSendMessage(`❌ Permissions Required: Click "Connect Google Account" above and make sure to CHECK THE BOX for "Google Calendar" access.`);
      } else {
        onSendMessage(`❌ Failed to generate Meet link: ${err.message}`);
      }
    } finally {
      setGeneratingMeet(false);
      setShowMeetModal(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  if (!activeContact) {
    return (
      <div className="flex-1 bg-fitti-bg-alt flex flex-col items-center justify-center p-8">
        <div className="bg-white/80 backdrop-blur-md p-12 rounded-[2.5rem] border border-fitti-border text-center max-w-md animate-scale-in">
          <div className="logo-fitti text-5xl mb-6">Fitti</div>
          <p className="text-fitti-text-muted font-bold leading-relaxed">Select a secure channel to begin communication. All data is encrypted using military-grade standards.</p>
        </div>
      </div>
    );
  }


  return (
  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden animate-fade-in-left">
      {/* Centered Profile Header - Matching Screenshot */}
      <div className="mx-auto w-full max-w-2xl px-4 md:px-6 pt-4 md:pt-6 sticky top-0 z-20">
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl md:rounded-[2rem] p-3 md:p-6 flex items-center justify-between md:justify-center relative shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          {/* Back Button for Mobile */}
          <button 
            onClick={onBack}
            className="md:hidden p-2 hover:bg-white/50 rounded-full transition-colors mr-2"
          >
            <ChevronLeft className="h-6 w-6 text-fitti-text" />
          </button>

          <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-none justify-center">
            <h2 className="text-lg md:text-xl font-black font-display text-fitti-text tracking-tight truncate max-w-[150px] md:max-w-none">
              {activeContact.name}
            </h2>
            <div className="bg-[#52C41A] rounded-full p-0.5 shadow-sm flex-shrink-0">
              <CheckCheck className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" strokeWidth={4} />
            </div>
          </div>
          
          <button className="p-2 text-fitti-text-muted hover:bg-white/50 rounded-full transition-colors md:absolute md:right-6">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Encryption Banner - Matching Screenshot */}
      <div className="flex justify-center mt-4 md:mt-6 px-4">
        <div className="bg-white/40 backdrop-blur-md border border-white/30 px-4 md:px-6 py-1.5 md:py-2 rounded-xl flex items-center gap-2 shadow-sm">
          <Lock className="h-2.5 w-2.5 md:h-3 md:w-3 text-fitti-text" />
          <p className="text-[9px] md:text-[10px] font-black text-fitti-text-muted uppercase tracking-[0.1em] md:tracking-[0.15em] text-center">
            End-to-End Encryption Enabled
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-8 space-y-4 md:space-y-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto stagger-children">
          {messages.map((msg, index) => (
            <MessageBubble key={msg.id || index} message={msg} isOwn={msg.isOwn} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Matching Screenshot */}
      <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2">
        <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl md:rounded-[2.5rem] p-2 md:p-3 flex items-center gap-2 md:gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.06)] group-focus-within:shadow-[0_12px_40px_rgba(118,185,0,0.12)] transition-all">
          <div className="relative" ref={attachMenuRef}>
            <button 
              type="button" 
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center text-fitti-text-muted hover:text-fitti-green hover:bg-white/50 rounded-full transition-all"
            >
              <Paperclip className="h-4 w-4 md:h-5 md:w-5 rotate-45" />
            </button>
            
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-4 w-52 md:w-56 bg-white/95 backdrop-blur-2xl border border-white/50 rounded-2xl md:rounded-[2rem] shadow-2xl p-2 animate-bounce-in z-50 overflow-hidden">
                <div className="px-3 md:px-4 py-2 md:py-3 border-b border-fitti-border/30 mb-1">
                  <p className="text-[9px] md:text-[10px] font-black text-fitti-text-muted uppercase tracking-widest">Secure Actions</p>
                </div>
                <button className="w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 hover:bg-fitti-bg rounded-xl md:rounded-2xl text-left transition-colors group">
                  <div className="bg-fitti-bg p-1.5 md:p-2 rounded-lg group-hover:bg-white transition-colors">
                    <Paperclip className="h-3.5 w-3.5 md:h-4 md:w-4 text-fitti-text-muted" />
                  </div>
                  <span className="font-bold text-xs md:text-sm text-fitti-text">Upload Artifact</span>
                </button>
                <button onClick={handleScheduleMeet} className="w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 hover:bg-fitti-green/5 rounded-xl md:rounded-2xl text-left transition-colors group">
                  <div className="bg-fitti-bg p-1.5 md:p-2 rounded-lg group-hover:bg-white transition-colors">
                    <Video className="h-3.5 w-3.5 md:h-4 md:w-4 text-fitti-green" />
                  </div>
                  <span className="font-bold text-xs md:text-sm text-fitti-text group-hover:text-fitti-green transition-colors">Schedule Meet</span>
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex-1 flex items-center gap-2 md:gap-3">
            <input
              type="text"
              className="flex-1 bg-transparent border-none px-1 md:px-2 py-2 text-xs md:text-sm font-bold text-fitti-text focus:ring-0 placeholder:text-fitti-text-muted/40"
              placeholder="Message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <div className="flex items-center gap-0.5 md:gap-1 pr-1 md:pr-2">
              <button type="button" className="p-2 md:p-3 text-fitti-text-muted hover:text-fitti-green transition-colors">
                <Mic className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              <button 
                type="submit" 
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-[#C7CED9] text-white flex items-center justify-center hover:bg-fitti-green transition-all shadow-md active:scale-90 disabled:opacity-50 disabled:scale-100 flex-shrink-0"
                disabled={!inputText.trim()}
              >
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Google Meet Modal */}
      {showMeetModal && (
        <Modal onClose={() => setShowMeetModal(false)}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display text-2xl font-black text-fitti-text tracking-tight uppercase flex items-center gap-2">
                <Video className="h-6 w-6 text-fitti-green" /> Schedule Meet
              </h3>
              <p className="font-body text-sm font-bold text-fitti-text-muted mt-1">Intelligent scheduling with {activeContact.name}</p>
            </div>
            <button onClick={() => setShowMeetModal(false)} className="p-3 hover:bg-fitti-bg rounded-2xl transition-all">
              <X className="h-6 w-6 text-fitti-text-muted" />
            </button>
          </div>

          {!hasGoogleLinked ? (
            <div className="text-center py-8">
              <div className="h-16 w-16 bg-fitti-bg rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-fitti-text-muted" />
              </div>
              <h4 className="font-display text-xl font-black text-fitti-text mb-3">Calendar Access Required</h4>
              <p className="text-sm font-bold text-fitti-text-muted mb-8 leading-relaxed max-w-sm mx-auto">
                To automatically find a mutual free time and generate a Google Meet link, you need to link your Google account.
              </p>
              <button 
                onClick={handleConnectGoogle}
                className="w-full flex items-center justify-center gap-3 py-4 bg-fitti-text text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-fitti-text/20 uppercase tracking-[0.1em]"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
                Connect Google Account
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-fitti-green/10 border border-fitti-green/20 rounded-2xl p-6 text-center">
                <p className="text-sm font-bold text-fitti-green">
                  Your Google Calendar is linked. We will check both schedules and automatically create a 30-minute Meet event at the next available mutual time slot.
                </p>
              </div>
              <button 
                onClick={handleGenerateLink}
                disabled={generatingMeet}
                className="w-full flex items-center justify-center gap-3 py-5 bg-fitti-green text-white font-black rounded-2xl hover:bg-fitti-green-dark transition-all shadow-xl shadow-fitti-green/20 uppercase tracking-[0.15em]"
              >
                {generatingMeet ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing Calendars...
                  </>
                ) : (
                  <>
                    <Calendar className="h-5 w-5" />
                    Find Time & Generate Link
                  </>
                )}
              </button>
              
              <div className="h-px bg-fitti-border/30 my-4" />
              
              <button 
                onClick={handleUnlinkGoogle}
                className="w-full py-3 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest border border-red-100"
              >
                Disconnect Google Account
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

