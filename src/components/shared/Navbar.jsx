import NotificationBell from './NotificationBell';

export default function Navbar({ title }) {
  return (
    <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-fitti-border/30 px-8 py-5 flex items-center justify-between animate-fade-in-down">
      <div className="flex flex-col">
        {title && (
          <>
            <h1 className="font-display text-xl font-black text-fitti-text tracking-tight uppercase">{title}</h1>
            <div className="h-1 w-8 bg-fitti-green rounded-full mt-1 animate-scale-in" style={{ animationDelay: '0.3s' }} />
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-fitti-bg/50 rounded-full border border-fitti-border/30">
          <div className="h-2 w-2 rounded-full bg-fitti-green animate-pulse-soft" />
          <span className="font-mono text-[10px] text-fitti-text-muted font-bold tracking-widest uppercase">Online</span>
        </div>
        <NotificationBell />
      </div>
    </header>
  );
}
