import useChat from '../../hooks/useChat';
import ContactsList from './ContactsList';
import ChatWindow from './ChatWindow';

export default function MessagingView({ onStartVideoCall }) {
  const {
    contacts,
    activeContact,
    setActiveContact,
    messages,
    sendMessage,
    loading
  } = useChat();

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading messages...</div>;
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-fitti-bg">
      <ContactsList 
        contacts={contacts} 
        activeContactId={activeContact?.id} 
        onSelectContact={setActiveContact} 
      />
      <ChatWindow 
        activeContact={activeContact} 
        messages={messages} 
        onSendMessage={sendMessage}
        onStartVideoCall={() => onStartVideoCall(activeContact)}
      />
    </div>
  );
}
