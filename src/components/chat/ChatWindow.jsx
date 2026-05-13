import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Video, Phone, Lock, MoreVertical } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ activeContact, messages, onSendMessage, onStartVideoCall }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Cook cannot have video calls
  const canVideoCall = activeContact.role !== 'cook' && activeContact.id !== 'admin';

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-fitti-bg">
      {/* Header */}
      <header className="h-20 px-8 bg-white/70 backdrop-blur-md border-b border-fitti-border/50 flex items-center justify-between sticky top-0 z-10 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-fitti-green shadow-lg shadow-fitti-green/20 flex items-center justify-center text-white font-black text-xl">
              {activeContact.name.charAt(0)}
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
          {canVideoCall && (
            <button 
              onClick={onStartVideoCall} 
              className="p-3 text-fitti-green bg-fitti-green/5 hover:bg-fitti-green hover:text-white rounded-2xl transition-all duration-300 active:scale-95"
            >
              <Video className="h-5 w-5" />
            </button>
          )}
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
          <button type="button" className="p-4 text-fitti-text-muted hover:text-fitti-green hover:bg-fitti-green/5 rounded-2xl transition-all">
            <Paperclip className="h-6 w-6" />
          </button>
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
    </div>
  );
}

