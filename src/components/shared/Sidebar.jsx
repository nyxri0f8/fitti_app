import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { 
  Home, Users, Package, Activity, MessageSquare,  Bell, 
  Utensils, CalendarDays, LineChart, Stethoscope, ClipboardList, LogOut, Menu, X 
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
    { label: 'My Diet Plan', to: '/customer/diet', icon: Utensils },
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
      {/* Mobile Hamburger Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-white/80 backdrop-blur-md border border-fitti-border rounded-2xl md:hidden shadow-lg shadow-fitti-green/5 animate-scale-in"
      >
        {isOpen ? <X className="h-6 w-6 text-fitti-green" /> : <Menu className="h-6 w-6 text-fitti-green" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-fade-in-up" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 sidebar-glass transition-transform duration-500 ease-out md:sticky md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col pt-8 pb-6
      `}>
        <div className="px-8 mb-10 stagger-children">
          <div className="flex flex-col gap-1">
            <h2 className="logo-fitti text-4xl">Fitti</h2>
            <p className="motto-fitti text-[11px] uppercase tracking-[0.2em] opacity-60">Evolve Your Fitness</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 overflow-y-auto stagger-children">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center px-5 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-fitti-green text-white shadow-lg shadow-fitti-green/20 scale-[1.02]'
                      : 'text-fitti-text-muted hover:bg-fitti-green/5 hover:text-fitti-green'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`mr-4 h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-fitti-green/60 group-hover:text-fitti-green'}`} />
                    {link.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-6 mt-8 space-y-4 stagger-children">
          <div className="flex items-center px-4 py-4 bg-fitti-green/5 rounded-2xl border border-fitti-green/10">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-xl bg-fitti-green shadow-lg shadow-fitti-green/20 flex items-center justify-center text-white font-bold animate-pulse-soft">
                {profile.full_name?.charAt(0) || profile.email?.charAt(0)}
              </div>
            </div>
            <div className="ml-4 overflow-hidden">
              <p className="text-sm font-bold text-fitti-text truncate">{profile.full_name || 'User'}</p>
              <p className="text-[10px] font-bold text-fitti-green uppercase tracking-widest">{profile.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="group w-full flex items-center px-5 py-4 text-sm font-bold text-fitti-text-muted hover:bg-fitti-bg-alt hover:text-black rounded-2xl transition-all duration-300"
          >
            <LogOut className="mr-4 h-5 w-5 text-fitti-green group-hover:text-black transition-transform group-hover:-translate-x-1" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

