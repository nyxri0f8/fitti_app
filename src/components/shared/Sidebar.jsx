import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { 
  Home, Users, Package, Activity, MessageSquare, 
  Utensils, CalendarDays, LineChart, Stethoscope, ClipboardList, LogOut, Menu, X, ArrowRight
} from 'lucide-react';

const ROLES_NAV = {
  admin: [
    { label: 'Overview', to: '/admin', icon: Home, end: true },
    { label: 'All Users', to: '/admin/users', icon: Users },
    { label: 'Orders', to: '/admin/orders', icon: Package },
    { label: 'Activity Feed', to: '/admin/activity', icon: Activity },
    { label: 'Messages', to: '/admin/messages', icon: MessageSquare },
  ],
  customer: [
    { label: 'Home', to: '/customer', icon: Home, end: true },
    { label: 'My Meals', to: '/customer/meals', icon: Package },
    { label: 'My Workout', to: '/customer/workout', icon: CalendarDays },
    { label: 'My Progress', to: '/customer/progress', icon: LineChart },
    { label: 'My Health', to: '/customer/health', icon: Stethoscope },
    { label: 'Messages', to: '/customer/messages', icon: MessageSquare },
  ],
  cook: [
    { label: "Today's Orders", to: '/cook', icon: Package, end: true },
    { label: 'Order History', to: '/cook/history', icon: ClipboardList },
    { label: 'Messages', to: '/cook/messages', icon: MessageSquare },
  ],
  doctor: [
    { label: 'My Patients', to: '/doctor', icon: Users, end: true },
    { label: 'Medical Records', to: '/doctor/records', icon: ClipboardList },
    { label: 'Messages', to: '/doctor/messages', icon: MessageSquare },
  ],
  trainer: [
    { label: 'My Clients', to: '/trainer', icon: Users, end: true },
    { label: 'Workout Plans', to: '/trainer/workouts', icon: CalendarDays },
    { label: 'Progress Tracking', to: '/trainer/progress', icon: LineChart },
    { label: 'Messages', to: '/trainer/messages', icon: MessageSquare },
  ]
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const profile = useAuthStore(state => state.profile);
  const logout = useAuthStore(state => state.logout);
  const setSecretKey = useAuthStore(state => state.setSecretKey);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    setSecretKey(null);
  };

  if (!profile) return null;

  const navLinks = ROLES_NAV[profile.role] || [];

  return (
    <>
      {/* Mobile Hamburger Toggle - Premium Morph Architecture */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-[110] w-14 h-14 bg-fitti-green text-white rounded-full flex items-center justify-center md:hidden shadow-2xl shadow-fitti-green/20 active:scale-90 transition-transform duration-500 ease-vanguard"
      >
        {isOpen ? <X strokeWidth={2.5} className="h-6 w-6" /> : <Menu strokeWidth={2.5} className="h-6 w-6" />}
      </button>

      {/* Overlay - Staggered Mask Reveal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-[105] md:hidden animate-v-fade-up" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed md:sticky top-6 bottom-6 left-6 z-[106] w-72 h-[calc(100vh-3rem)]
        transition-all duration-700 ease-vanguard
        ${isOpen ? 'translate-x-0' : '-translate-x-[150%] md:translate-x-0'}
      `}>
        {/* Double-Bezel Nested Frame */}
        <div className="bezel-shell h-full flex flex-col">
          <div className="bezel-core h-full flex flex-col py-8">
            <div className="px-8 mb-12">
              <div className="flex flex-col">
                <h2 className="logo-fitti text-5xl">Fitti.</h2>
                <span className="font-accent text-xs text-fitti-text-muted mt-2">Evolve Your Fitness.</span>
              </div>
            </div>

            <nav className="flex-1 space-y-2 px-4 overflow-y-auto custom-scrollbar stagger-v-fade">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `group relative flex items-center px-6 py-4 rounded-2xl transition-all duration-700 ease-vanguard overflow-hidden ${
                        isActive
                          ? 'bg-fitti-green text-white shadow-xl shadow-fitti-green/20'
                          : 'text-fitti-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-fitti-text'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon strokeWidth={isActive ? 2.5 : 1.5} className={`mr-4 h-5 w-5 transition-transform duration-700 ease-vanguard group-hover:scale-110 group-hover:-rotate-3`} />
                        <span className="font-display font-bold text-sm tracking-tight">{link.label}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        )}
                        {!isActive && (
                          <ArrowRight strokeWidth={2} className="ml-auto h-4 w-4 opacity-0 -translate-x-4 transition-all duration-700 ease-vanguard group-hover:opacity-100 group-hover:translate-x-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Profile Island with Nested Architecture */}
            <div className="mt-auto px-4 pt-6 border-t border-fitti-border/10 space-y-4">
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-[1.5rem] ring-1 ring-black/5">
                <div className="flex items-center gap-4 bg-fitti-bg dark:bg-fitti-bg-alt p-3 rounded-[calc(1.5rem-0.5rem)] shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-fitti-green/10 flex items-center justify-center text-fitti-green font-black text-xs ring-1 ring-fitti-green/20">
                    {profile.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-black text-fitti-text truncate tracking-tighter">{profile.full_name || 'User'}</p>
                    <p className="text-[10px] font-bold text-fitti-green uppercase tracking-[0.2em]">{profile.role}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn-vanguard w-full justify-center text-sm text-fitti-text-muted hover:text-red-500 hover:bg-red-500/5 transition-colors"
              >
                <LogOut strokeWidth={1.5} className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

