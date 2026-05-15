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
    <div className="fixed top-0 right-0 z-[100] px-8 pt-8 pointer-events-none">
      {/* Atmospheric Background Mesh Glow */}
      <div className="mesh-glow top-0 right-0 w-[300px] h-[300px] opacity-20" />
      
      <header className="flex items-center gap-4 pointer-events-auto animate-v-fade-up bg-white/60 dark:bg-black/40 backdrop-blur-3xl p-2 rounded-[2rem] ring-1 ring-black/5 dark:ring-white/5 shadow-2xl">
        {/* Theme Toggle with Double-Bezel nested architecture */}
        <div className="p-1 bg-black/5 dark:bg-white/5 rounded-full ring-1 ring-black/5 dark:ring-white/10">
          <button 
            onClick={toggleTheme}
            className="w-12 h-12 rounded-full bg-fitti-bg dark:bg-fitti-bg-alt shadow-sm flex items-center justify-center 
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
      </header>
    </div>
  );
}
