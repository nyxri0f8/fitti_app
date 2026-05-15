import { format } from 'date-fns';

export default function MessageBubble({ message, isOwn }) {
  const time = format(new Date(message.created_at || Date.now()), 'h:mm a');

  return (
    <div className={`flex w-full mb-8 ${isOwn ? 'justify-end' : 'justify-start'} animate-v-fade-up`}>
      <div className={`max-w-[80%] md:max-w-[65%] relative group transition-all duration-700 ease-vanguard ${
        isOwn 
          ? 'bg-fitti-green text-white rounded-[2rem] rounded-tr-[0.5rem] shadow-xl shadow-fitti-green/20' 
          : 'bg-black/5 dark:bg-white/5 text-fitti-text rounded-[2rem] rounded-tl-[0.5rem] ring-1 ring-black/5'
      } px-8 py-6`}
      >
        <p className="font-display font-bold text-[15px] md:text-lg leading-snug whitespace-pre-wrap tracking-tight">
          {message.content}
        </p>
        <div className={`flex items-center mt-4 ${isOwn ? 'justify-end' : 'justify-start'} opacity-40 group-hover:opacity-100 transition-all duration-700`}>
          <span className={`font-mono text-[9px] font-black uppercase tracking-[0.2em] ${isOwn ? 'text-white' : 'text-fitti-text-muted'}`}>
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}
