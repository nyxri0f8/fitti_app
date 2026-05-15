import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Phone, Lock, MoreVertical, Video, X, Mic, ChevronLeft } from 'lucide-react';
import Modal from '../shared/Modal';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ activeContact, messages, onSendMessage, onBack }) {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [generatingMeet, setGeneratingMeet] = useState(false);
  const [hasGoogleLinked, setHasGoogleLinked] = useState(false);
  
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

  const checkIdentity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const isLinked = user?.identities?.some(id => id.provider === 'google');
    setHasGoogleLinked(!!isLinked);
  };

  useEffect(() => {
    checkIdentity();
  }, [user]);

  const handleConnectGoogle = async () => {
    await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
        queryParams: { access_type: 'offline', prompt: 'consent' },
        redirectTo: window.location.href
      }
    });
  };

  const handleGenerateLink = async () => {
    setGeneratingMeet(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('schedule-meet', {
        body: { guestId: activeContact.id, providerToken: session?.provider_token }
      });
      if (error) throw error;
      onSendMessage(`🗓️ I've generated a Google Meet link: ${data.meetLink}`);
    } catch (err) {
      console.error(err);
      onSendMessage(`❌ Failed to generate Meet link: ${err.message}`);
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

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden animate-v-fade-up">
      {/* Centered Profile Header */}
      <div className="p-8 md:p-12 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="lg:hidden p-3 hover:bg-black/5 rounded-2xl transition-all"
            >
              <ChevronLeft className="h-6 w-6 text-fitti-text" />
            </button>
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl overflow-hidden ring-1 ring-fitti-green/20 shadow-lg shadow-fitti-green/10">
                <img src={activeContact.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeContact.name}`} alt="" className="h-full w-full object-cover" />
              </div>
              <div>
                <h2 className="font-display text-3xl font-black text-fitti-text tracking-tighter uppercase leading-none mb-1">
                  {activeContact.name}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-fitti-green animate-pulse" />
                  <span className="font-mono text-[9px] font-black text-fitti-green uppercase tracking-[0.2em]">Secure Node Linked</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-fitti-text-muted hover:text-fitti-green transition-all duration-500">
              <Phone strokeWidth={1.5} className="h-5 w-5" />
            </button>
            <button className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-fitti-text-muted hover:text-fitti-green transition-all duration-500">
              <MoreVertical strokeWidth={1.5} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-8 md:px-16 py-12 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12 stagger-v-fade">
          <div className="flex justify-center mb-12">
            <div className="bg-fitti-green/5 border border-fitti-green/20 px-6 py-2.5 rounded-full flex items-center gap-3">
              <Lock className="h-3 w-3 text-fitti-green" />
              <p className="font-mono text-[9px] font-black text-fitti-green uppercase tracking-[0.2em]">End-to-End Encryption Secured</p>
            </div>
          </div>
          {messages.map((msg, index) => (
            <MessageBubble key={msg.id || index} message={msg} isOwn={msg.isOwn} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-8 md:p-12 bg-fitti-bg/50 backdrop-blur-3xl border-t border-black/5 dark:border-white/5">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-6">
          <div className="relative" ref={attachMenuRef}>
            <button 
              type="button" 
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-fitti-text-muted hover:text-fitti-green transition-all duration-700 active:scale-90"
            >
              <Paperclip className="h-5 w-5 rotate-45" />
            </button>
            
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-6 w-64 bg-white/95 dark:bg-fitti-bg-alt/95 backdrop-blur-3xl border border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-2xl p-3 animate-v-fade-up z-50 overflow-hidden">
                <div className="px-5 py-3 border-b border-black/5 mb-2">
                  <p className="font-mono text-[9px] font-black text-fitti-text-muted uppercase tracking-widest">Protocol Actions</p>
                </div>
                <button className="w-full flex items-center gap-4 px-4 py-4 hover:bg-fitti-green/5 rounded-[1.5rem] text-left transition-all group">
                  <div className="w-10 h-10 bg-fitti-bg flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                    <Paperclip className="h-4 w-4 text-fitti-text-muted" />
                  </div>
                  <span className="font-display font-black text-xs text-fitti-text tracking-tight">Upload Artifact</span>
                </button>
                <button 
                  type="button"
                  onClick={() => { setShowAttachMenu(false); setShowMeetModal(true); }} 
                  className="w-full flex items-center gap-4 px-4 py-4 hover:bg-fitti-green/5 rounded-[1.5rem] text-left transition-all group"
                >
                  <div className="w-10 h-10 bg-fitti-bg flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                    <Video className="h-4 w-4 text-fitti-green" />
                  </div>
                  <span className="font-display font-black text-xs text-fitti-green tracking-tight">Schedule Meet Node</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex items-center bg-black/5 dark:bg-white/5 rounded-[2.5rem] p-2 ring-1 ring-black/5 focus-within:ring-fitti-green/30 transition-all duration-700">
            <input
              type="text"
              className="flex-1 bg-transparent border-none px-6 py-4 text-sm font-bold text-fitti-text focus:ring-0 placeholder:text-fitti-text-muted/40"
              placeholder="Inject secure transmission..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="button" className="p-4 text-fitti-text-muted hover:text-fitti-green transition-colors">
              <Mic strokeWidth={1.5} className="h-5 w-5" />
            </button>
            <button 
              type="submit" 
              className="w-12 h-12 rounded-full bg-fitti-green text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-fitti-green/20 active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:grayscale"
              disabled={!inputText.trim()}
            >
              <Send strokeWidth={2.5} className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Google Meet Modal */}
      {showMeetModal && (
        <Modal onClose={() => setShowMeetModal(false)}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display text-2xl font-black text-fitti-text tracking-tight uppercase flex items-center gap-2">
                <Video className="h-6 w-6 text-fitti-green" /> Schedule Meet
              </h3>
            </div>
            <button onClick={() => setShowMeetModal(false)} className="p-3 hover:bg-fitti-bg rounded-2xl transition-all">
              <X className="h-6 w-6 text-fitti-text-muted" />
            </button>
          </div>

          {!hasGoogleLinked ? (
            <div className="text-center py-8">
              <button 
                onClick={handleConnectGoogle}
                className="btn-vanguard btn-vanguard-primary w-full"
              >
                Connect Google Account
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGenerateLink}
              disabled={generatingMeet}
              className="btn-vanguard btn-vanguard-primary w-full"
            >
              {generatingMeet ? 'Analyzing Calendars...' : 'Generate Meet Link'}
            </button>
          )}
        </Modal>
      )}
    </div>
  );
}
