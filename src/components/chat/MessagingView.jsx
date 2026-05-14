import useChat from '../../hooks/useChat';
import ContactsList from './ContactsList';
import ChatWindow from './ChatWindow';

export default function MessagingView() {
  const {
    contacts,
    activeContact,
    setActiveContact,
    messages,
    sendMessage,
    loading
  } = useChat();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-fitti-bg-alt relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-16 w-16 border-4 border-fitti-green/20 border-t-fitti-green rounded-full animate-spin mb-4" />
          <p className="font-display font-bold text-fitti-text-muted animate-pulse">Establishing Secure Connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4FBF2] relative">
      {/* Dynamic Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <div className="text-[40rem] font-black tracking-tighter logo-fitti rotate-[-12deg] translate-x-[-10%] translate-y-[5%]">
          Fitti
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-fitti-green/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-fitti-green/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Main Layout Container */}
      <div className="flex-1 flex p-6 gap-6 relative z-10 h-full overflow-hidden">
        <ContactsList 
          contacts={contacts} 
          activeContactId={activeContact?.id} 
          onSelectContact={setActiveContact} 
        />
        <ChatWindow 
          activeContact={activeContact} 
          messages={messages} 
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  );
}
