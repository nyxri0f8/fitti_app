import { format } from 'date-fns';

export default function MessageBubble({ message, isOwn }) {
  const time = format(new Date(message.created_at || Date.now()), 'h:mm a');

  return (
    <div className={`flex w-full mb-4 md:mb-6 ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
      <div className={`max-w-[85%] md:max-w-[70%] relative group transition-transform hover:scale-[1.02] duration-300 ${
        isOwn 
          ? 'bg-[#E6F4D0]/80 border border-white/50 text-fitti-text rounded-[1.25rem] md:rounded-[1.5rem] rounded-tr-[0.4rem] md:rounded-tr-[0.5rem] shadow-[0_4px_12px_rgba(118,185,0,0.06)] md:shadow-[0_8px_20px_rgba(118,185,0,0.06)]' 
          : 'bg-white text-fitti-text border border-white rounded-[1.25rem] md:rounded-[1.5rem] rounded-tl-[0.4rem] md:rounded-tl-[0.5rem] shadow-[0_4px_12px_rgba(0,0,0,0.04)] md:shadow-[0_8px_20px_rgba(0,0,0,0.04)]'
      } px-4 md:px-5 py-3 md:py-4`}
      >
        <p className="text-sm md:text-[15px] font-medium leading-snug whitespace-pre-wrap">{message.content}</p>
        <div className={`flex items-center justify-end mt-1 md:mt-1.5 opacity-40 group-hover:opacity-100 transition-opacity`}>
          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest">{time}</span>
        </div>
      </div>
    </div>
  );
}
