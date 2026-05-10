import { Search, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function ContactsList({ contacts, activeContactId, onSelectContact }) {
  return (
    <div className="w-80 bg-white/50 backdrop-blur-md flex flex-col border-r border-fitti-border/50 h-full overflow-hidden">
      <div className="p-6 border-b border-fitti-border/50 bg-white/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-black text-fitti-text tracking-tighter uppercase">Direct</h2>
          <ShieldCheck className="h-4 w-4 text-fitti-green" />
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-fitti-green">
            <Search className="h-4 w-4 text-fitti-text-muted" />
          </div>
          <input
            type="text"
            className="w-full bg-fitti-bg/50 border border-fitti-border rounded-2xl pl-12 pr-4 py-3 text-xs font-bold focus:border-fitti-green focus:outline-none focus:ring-4 focus:ring-fitti-green/10 transition-all placeholder:text-fitti-text-muted/50"
            placeholder="FILTER CHANNELS..."
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {contacts.map((contact) => (
          <div 
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`flex items-center px-6 py-5 cursor-pointer border-b border-fitti-border/30 transition-all duration-300 relative group ${activeContactId === contact.id ? 'bg-fitti-green/5' : 'hover:bg-fitti-bg'}`}
          >
            {activeContactId === contact.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-fitti-green rounded-r-full shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
            )}
            
            <div className="relative flex-shrink-0">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform group-hover:scale-105 duration-300 ${activeContactId === contact.id ? 'bg-fitti-green shadow-fitti-green/20' : 'bg-fitti-text/80 shadow-fitti-text/10'}`}>
                {contact.name.charAt(0)}
              </div>
              {contact.online && (
                <span className="absolute -bottom-1 -right-1 block h-4 w-4 rounded-full bg-fitti-green border-4 border-white shadow-sm"></span>
              )}
            </div>
            
            <div className="ml-4 flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className={`text-sm font-black tracking-tight truncate transition-colors ${activeContactId === contact.id ? 'text-fitti-green' : 'text-fitti-text'}`}>
                  {contact.name}
                </h3>
                <span className="text-[9px] font-black text-fitti-text-muted uppercase tracking-widest opacity-60">
                  {contact.lastMessageTime ? format(new Date(contact.lastMessageTime), 'HH:mm') : ''}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-[11px] font-bold truncate flex-1 pr-2 ${activeContactId === contact.id ? 'text-fitti-text' : 'text-fitti-text-muted'}`}>
                  {contact.lastMessageContent || "INITIATE TRANSMISSION"}
                </p>
                {contact.unreadCount > 0 && (
                  <span className="bg-fitti-green text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-lg shadow-fitti-green/20 animate-pulse">
                    {contact.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

