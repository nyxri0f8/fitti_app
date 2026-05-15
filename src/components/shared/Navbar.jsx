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
    <div className="fixed top-0 left-0 w-full z-[100] px-6 pt-6 pointer-events-none">
      {/* Atmospheric Background Mesh Glow */}
      <div className="mesh-glow top-0 left-1/4 w-[400px] h-[200px]" />
      
      <header className="nav-island mx-auto flex items-center justify-between gap-8 pointer-events-auto animate-v-fade-up">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="eyebrow-tag !mb-0 scale-75 origin-left">Dashboard</span>
            <h1 className="font-display text-lg font-black text-fitti-text tracking-tighter leading-none">{title || 'Fitti'}</h1>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-fitti-border/20" />

        <div className="flex items-center gap-3">
          {/* Theme Toggle with Double-Bezel nested architecture */}
          <div className="p-1 bg-black/5 dark:bg-white/5 rounded-full ring-1 ring-black/5 dark:ring-white/10">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-fitti-bg dark:bg-fitti-bg-alt shadow-sm flex items-center justify-center 
                         text-fitti-text-muted hover:text-fitti-green transition-all duration-700 ease-vanguard 
                         active:scale-90"
              title="Toggle Theme"
            >
              {isDark ? <Sun strokeWidth={1} className="h-5 w-5" /> : <Moon strokeWidth={1} className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="p-1 bg-black/5 dark:bg-white/5 rounded-full ring-1 ring-black/5 dark:ring-white/10">
            <NotificationBell />
          </div>
        </div>
      </header>
    </div>
  );
}
