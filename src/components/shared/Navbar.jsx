import NotificationBell from './NotificationBell';

export default function Navbar({ title }) {
  return (
    <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-md border-b border-fitti-border/50 px-8 py-5 flex items-center justify-between animate-fade-in-up">
      {title && (
        <div className="flex flex-col">
          <h1 className="text-xl font-display font-black text-fitti-text tracking-tight uppercase">{title}</h1>
          <div className="h-1 w-8 bg-fitti-green rounded-full mt-1 animate-scale-in" />
        </div>
      )}
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-[10px] font-bold text-fitti-text-muted uppercase tracking-widest">Status</span>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 bg-fitti-green rounded-full animate-pulse" />
            <span className="text-xs font-bold text-fitti-text">System Active</span>
          </div>
        </div>
        
        <div className="h-8 w-px bg-fitti-border mx-2" />
        <NotificationBell />
      </div>
    </header>
  );
}

