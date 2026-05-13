import NotificationBell from './NotificationBell';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar({ title }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-fitti-bg/60 backdrop-blur-xl border-b border-fitti-border/30 px-8 py-5 flex items-center justify-between animate-fade-in-down">
      <div className="flex flex-col">
        {title && (
          <>
            <h1 className="font-display text-xl font-black text-fitti-text tracking-tight uppercase">{title}</h1>
            <div className="h-1 w-8 bg-fitti-green rounded-full mt-1 animate-scale-in" style={{ animationDelay: '0.3s' }} />
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-fitti-border/50 text-fitti-text-muted transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <NotificationBell />
      </div>
    </header>
  );
}
