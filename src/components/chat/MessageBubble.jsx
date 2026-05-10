import { format } from 'date-fns';
import { CheckCheck } from 'lucide-react';

export default function MessageBubble({ message, isOwn }) {
  const time = format(new Date(message.created_at || Date.now()), 'h:mm a');

  return (
    <div className={`flex w-full mb-6 ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
      <div className={`max-w-[80%] md:max-w-[70%] ${
        isOwn 
          ? 'bg-fitti-green text-white rounded-[2rem] rounded-br-lg' 
          : 'bg-white border border-fitti-border text-fitti-text-dark rounded-[2rem] rounded-bl-lg shadow-sm'
      } px-6 py-4 relative group transition-transform hover:scale-[1.01]`}
      >
        <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <div className={`flex items-center justify-end mt-2 space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity`}>
          <span className="text-[10px] font-bold uppercase tracking-widest">{time}</span>
          {isOwn && <CheckCheck className="h-3.5 w-3.5" />}
        </div>
      </div>
    </div>
  );
}
