import useChat from '../../hooks/useChat';
import ContactsList from './ContactsList';
import ChatWindow from './ChatWindow';
import { ShieldCheck } from 'lucide-react';

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
      <div className="flex-1 flex flex-col items-center justify-center bg-fitti-bg relative overflow-hidden">
        <div className="bezel-shell p-12">
          <div className="bezel-core p-12 flex flex-col items-center">
            <div className="h-16 w-16 border-4 border-fitti-green/20 border-t-fitti-green rounded-full animate-spin mb-6" />
            <p className="font-mono text-[10px] font-black text-fitti-green uppercase tracking-[0.3em] animate-pulse">Initializing Secure Node...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-fitti-bg relative">
      <div className="flex-1 flex flex-col lg:flex-row p-6 md:p-12 lg:p-16 gap-8 relative z-10 h-full overflow-hidden">
        
        {/* Side Panel - Contacts */}
        <div className={`h-full flex-shrink-0 transition-all duration-700 ease-vanguard ${activeContact ? 'hidden lg:flex w-96' : 'w-full lg:w-96'}`}>
          <div className="bezel-shell h-full w-full">
            <div className="bezel-core h-full">
              <ContactsList 
                contacts={contacts} 
                activeContactId={activeContact?.id} 
                onSelectContact={setActiveContact} 
              />
            </div>
          </div>
        </div>

        {/* Main Panel - Chat */}
        <div className={`h-full flex-1 transition-all duration-700 ease-vanguard ${activeContact ? 'flex' : 'hidden lg:flex'}`}>
          <div className="bezel-shell h-full w-full group">
            <div className="bezel-core h-full relative overflow-hidden">
              <div className="mesh-glow -top-32 -right-32 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
              {activeContact ? (
                <ChatWindow 
                  activeContact={activeContact} 
                  messages={messages} 
                  onSendMessage={sendMessage}
                  onBack={() => setActiveContact(null)}
                />
              ) : (
                <div className="h-full flex items-center justify-center p-12">
                  <div className="text-center max-w-sm relative z-10">
                    <span className="eyebrow-tag !mb-8">Encrypted Comms Node</span>
                    <h2 className="font-display text-6xl font-black text-fitti-green mb-6 tracking-tighter">Fitti.</h2>
                    <p className="font-accent text-xl italic text-fitti-text-muted leading-relaxed">
                      Select a secure channel to initiate high-fidelity biological strategy updates.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
