import NotificationBell from './NotificationBell';

export default function Navbar({ title }) {
  return (
    <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-md border-b border-fitti-border/50 px-8 py-5 flex items-center justify-between animate-fade-in-up">
      <div className="flex flex-col">
        {title && (
          <>
            <h1 className="text-xl font-display font-black text-fitti-text tracking-tight uppercase">{title}</h1>
            <div className="h-1 w-8 bg-fitti-green rounded-full mt-1 animate-scale-in" />
          </>
        )}
      </div>

      <NotificationBell />
    </header>
  );
}

