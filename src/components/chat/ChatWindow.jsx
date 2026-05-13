import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Phone, Lock, MoreVertical, User, Calendar, Video, X } from 'lucide-react';
import Modal from '../shared/Modal';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ activeContact, messages, onSendMessage }) {
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
        alert('Google Account Disconnected. You can now connect again.');
        window.location.reload();
      }
    } catch (err) {
      console.error('Unlink Error:', err);
      alert('Failed to disconnect: ' + err.message);
    }
  };

  const handleGenerateLink = async () => {
    setGeneratingMeet(true);
    try {
      const { data, error } = await supabase.functions.invoke('schedule-meet', {
        body: { guestId: activeContact.id }
      });
      
      // Handle Supabase Function Errors
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
      // Check if it's a permission error
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

  const hasGoogleLinked = user?.identities?.some(id => id.provider === 'google');

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
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-fitti-bg">
      {/* Header */}
      <header className="h-20 px-8 bg-white/70 backdrop-blur-md border-b border-fitti-border/50 flex items-center justify-between sticky top-0 z-10 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-fitti-green shadow-lg shadow-fitti-green/20 flex items-center justify-center text-white">
              <User className="h-6 w-6" />
            </div>
            {activeContact.online && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-fitti-green border-4 border-white rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="font-black text-fitti-text tracking-tight">{activeContact.name}</h2>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${activeContact.online ? 'bg-fitti-green' : 'bg-fitti-border'}`} />
              <p className="text-[10px] font-bold text-fitti-text-muted uppercase tracking-widest">
                {activeContact.online ? 'Secure Connection' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-3 text-fitti-text-muted hover:bg-fitti-bg rounded-2xl transition-all">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 relative space-y-6">
        <div className="flex justify-center mb-8">
          <div className="bg-white/50 backdrop-blur-sm border border-fitti-border/50 px-6 py-2 rounded-2xl">
            <p className="text-[10px] font-black text-fitti-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
              <Lock className="h-3 w-3 text-fitti-green" /> End-to-End Encryption Enabled
            </p>
          </div>
        </div>

        <div className="stagger-children space-y-4">
          {messages.map((msg, index) => (
            <MessageBubble key={msg.id || index} message={msg} isOwn={msg.isOwn} />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/70 backdrop-blur-md border-t border-fitti-border/50">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="relative" ref={attachMenuRef}>
            <button 
              type="button" 
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-4 text-fitti-text-muted hover:text-fitti-green hover:bg-fitti-green/5 rounded-2xl transition-all"
            >
              <Paperclip className="h-6 w-6" />
            </button>
            
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-4 w-56 bg-white/90 backdrop-blur-xl border border-fitti-border/50 rounded-2xl shadow-xl p-2 animate-fade-in-up z-50">
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-fitti-bg rounded-xl text-left transition-colors group">
                  <div className="bg-fitti-bg p-2 rounded-lg group-hover:bg-white transition-colors">
                    <Paperclip className="h-4 w-4 text-fitti-text-muted" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-fitti-text">Upload File</span>
                    <span className="block text-[10px] text-fitti-text-muted uppercase tracking-wider">Images & Docs</span>
                  </div>
                </button>
                <div className="h-px bg-fitti-border/30 my-1 mx-2" />
                <button onClick={handleScheduleMeet} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-fitti-green/5 rounded-xl text-left transition-colors group">
                  <div className="bg-fitti-bg p-2 rounded-lg group-hover:bg-white transition-colors">
                    <Video className="h-4 w-4 text-fitti-green" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-fitti-text group-hover:text-fitti-green transition-colors">Schedule GMeet</span>
                    <span className="block text-[10px] text-fitti-text-muted uppercase tracking-wider">Auto-find free time</span>
                  </div>
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 relative group">
            <input
              type="text"
              className="w-full bg-fitti-bg/50 border border-fitti-border rounded-[1.5rem] px-8 py-4 text-sm font-bold text-fitti-text focus:border-fitti-green focus:outline-none focus:ring-4 focus:ring-fitti-green/10 transition-all placeholder:text-fitti-text-muted/50"
              placeholder="Securely transmit message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="h-14 w-14 rounded-[1.5rem] bg-fitti-green text-white flex items-center justify-center hover:bg-fitti-green-dark transition-all shadow-lg shadow-fitti-green/20 active:scale-90 disabled:opacity-50 disabled:scale-100"
            disabled={!inputText.trim()}
          >
            <Send className="h-6 w-6 ml-1" />
          </button>
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

