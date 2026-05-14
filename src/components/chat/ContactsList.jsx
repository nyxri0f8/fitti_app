import { Search, Moon, Bell, Plus, ShieldCheck } from 'lucide-react';

export default function ContactsList({ contacts, activeContactId, onSelectContact }) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-fade-in-right">
      {/* Top Navigation Bar - Matching Screenshot */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl md:rounded-[2.5rem] p-3 md:p-4 flex items-center justify-between mb-4 md:mb-6 shadow-[0_8px_32px_rgba(118,185,0,0.08)] mx-2 md:mx-0">
        <h1 className="text-xl md:text-2xl font-black font-display text-fitti-text tracking-tighter uppercase ml-2">Direct</h1>
        
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="relative group hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-fitti-green">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="bg-fitti-bg/80 border border-fitti-border/50 rounded-full pl-9 pr-4 py-2 text-xs font-bold w-28 md:w-40 focus:w-48 transition-all focus:outline-none focus:border-fitti-green/50 placeholder:text-fitti-text-muted/40"
            />
          </div>
          <button className="p-2 md:p-2.5 bg-fitti-bg/80 rounded-full border border-fitti-border/50 hover:bg-white transition-colors shadow-sm text-fitti-text-muted">
            <Moon className="h-3.5 w-3.5 md:h-4 md:h-4" />
          </button>
          <button className="p-2 md:p-2.5 bg-fitti-bg/80 rounded-full border border-fitti-border/50 hover:bg-white transition-colors shadow-sm text-fitti-text-muted">
            <Bell className="h-3.5 w-3.5 md:h-4 md:h-4" />
          </button>
          <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-fitti-green/20 border-2 border-fitti-green overflow-hidden shadow-sm flex-shrink-0">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Varun" alt="Profile" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      {/* Contacts List Container */}
      <div className="flex-1 bg-white/40 backdrop-blur-md rounded-t-[2.5rem] md:rounded-[3rem] border-t md:border border-white/30 p-4 md:p-6 flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
          {contacts.map((contact) => (
            <div 
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`group relative p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden ${
                activeContactId === contact.id 
                  ? 'bg-white shadow-[0_20px_40px_rgba(118,185,0,0.1)] border-white' 
                  : 'bg-white/30 border-transparent hover:bg-white/60 hover:border-white/50'
              }`}
            >
              {/* Active Highlight Glow */}
              {activeContactId === contact.id && (
                <div className="absolute inset-0 bg-gradient-to-br from-fitti-green/5 to-transparent pointer-events-none" />
              )}
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="relative mb-4">
                  <div className={`h-24 w-24 rounded-full p-1 border-4 transition-all duration-500 ${
                    activeContactId === contact.id ? 'border-fitti-green scale-110 shadow-lg shadow-fitti-green/20' : 'border-white/50'
                  }`}>
                    <div className="h-full w-full rounded-full bg-fitti-bg overflow-hidden border border-fitti-border/50 shadow-inner">
                      <img 
                        src={contact.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`} 
                        alt={contact.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white shadow-sm transition-colors duration-500 ${
                    contact.online ? 'bg-fitti-green' : 'bg-fitti-text-muted'
                  }`} />
                </div>
                
                <h3 className="font-display font-black text-lg text-fitti-text tracking-tight mb-1">{contact.name}</h3>
                <p className="text-[11px] font-bold text-fitti-text-muted leading-tight line-clamp-2 px-2">
                  {contact.lastMessageContent || "Start a conversation to see secure updates."}
                </p>
              </div>

              {/* Unread Badge Overlay */}
              {contact.unreadCount > 0 && (
                <div className="absolute top-4 right-4 bg-fitti-green text-white text-[10px] font-black h-6 min-w-[1.5rem] px-1.5 flex items-center justify-center rounded-full shadow-lg shadow-fitti-green/30 animate-pulse">
                  {contact.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* New Message Button - Matching Screenshot */}
        <button className="mt-6 py-4 px-6 bg-[#D8FF4D] hover:bg-[#C5EA00] text-fitti-text font-black font-display text-sm tracking-widest uppercase rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_25px_rgba(216,255,77,0.3)] group">
          <div className="bg-fitti-text text-[#D8FF4D] p-1 rounded-md group-hover:scale-110 transition-transform">
            <Plus className="h-3 w-3" strokeWidth={4} />
          </div>
          New Message
        </button>
      </div>
    </div>
  );
}

