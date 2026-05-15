import { ShieldCheck, Plus } from 'lucide-react';

export default function ContactsList({ contacts, activeContactId, onSelectContact }) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-v-fade-right p-6 md:p-8">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="font-display text-4xl font-black text-fitti-text tracking-tighter uppercase">Direct</h2>
          <p className="font-mono text-[9px] font-black text-fitti-green uppercase tracking-[0.2em] mt-2">Active Channels</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-fitti-green/5 flex items-center justify-center text-fitti-green ring-1 ring-fitti-green/20">
          <ShieldCheck strokeWidth={1} className="h-5 w-5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {contacts.map((contact) => (
          <div 
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`group relative p-6 rounded-[2rem] transition-all duration-700 ease-vanguard cursor-pointer overflow-hidden ring-1 ${
              activeContactId === contact.id 
                ? 'bg-fitti-green text-white shadow-xl shadow-fitti-green/20 ring-fitti-green' 
                : 'bg-black/5 dark:bg-white/5 ring-black/5 hover:ring-fitti-green/30'
            }`}
          >
            <div className="flex items-center gap-5 relative z-10">
              <div className="relative">
                <div className={`h-14 w-14 rounded-2xl overflow-hidden transition-all duration-700 ${
                  activeContactId === contact.id ? 'scale-110 shadow-lg' : 'bg-fitti-bg'
                }`}>
                  <img 
                    src={contact.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`} 
                    alt={contact.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-4 ${activeContactId === contact.id ? 'border-fitti-green bg-white' : 'border-fitti-bg bg-fitti-green'} ${!contact.online && 'bg-fitti-text-muted'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-display font-black text-lg tracking-tight mb-0.5 truncate ${activeContactId === contact.id ? 'text-white' : 'text-fitti-text'}`}>
                  {contact.name}
                </h3>
                <p className={`font-mono text-[9px] font-bold uppercase tracking-widest truncate ${activeContactId === contact.id ? 'text-white/60' : 'text-fitti-text-muted'}`}>
                  {contact.lastMessageContent || "Standby..."}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-vanguard btn-vanguard-primary mt-8 w-full">
        Initiate Protocol
        <div className="btn-vanguard-icon-wrapper">
          <Plus strokeWidth={2.5} className="h-4 w-4" />
        </div>
      </button>
    </div>
  );
}
