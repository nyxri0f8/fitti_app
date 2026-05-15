import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { 
  Home, Users, Package, Activity, MessageSquare, 
  Utensils, CalendarDays, LineChart, Stethoscope, ClipboardList, LogOut, Menu, X, ArrowRight, User, Shield, Lock, Mail
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [passkey, setPasskey] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const profile = useAuthStore(state => state.profile);
  const setProfile = useAuthStore(state => state.setProfile);
  const logout = useAuthStore(state => state.logout);
  const setSecretKey = useAuthStore(state => state.setSecretKey);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    setSecretKey(null);
  };

  const getPasskeyPassword = (email, code) => {
    return `fitti_pk_${email.toLowerCase().trim()}_${code}_secure`;
  };

  const handleSetPasskey = async (e) => {
    e.preventDefault();
    if (passkey.length !== 4) return;
    setLoading(true);
    setError(null);

    try {
      const code = passkey.join('');
      const securePassword = getPasskeyPassword(profile.email, code);
      
      // 1. Update Supabase Auth Password
      const { error: authError } = await supabase.auth.updateUser({ password: securePassword });
      if (authError) throw authError;

      // 2. Update Profile passkey field
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ passkey: code })
        .eq('id', profile.id);
      
      if (profileError) throw profileError;

      // 3. Update Local Store
      setProfile({ ...profile, passkey: code });
      
      // Update remembered user for Zero-Email login
      localStorage.setItem('fitti_last_user', JSON.stringify({
        email: profile.email,
        name: profile.full_name,
        role: profile.role
      }));

      setPasskey(['', '', '', '']);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
                <span className="font-accent text-xs text-fitti-text-muted mt-2">Elevating Personal Health.</span>
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
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full text-left p-3 bg-black/5 dark:bg-white/5 rounded-[1.5rem] ring-1 ring-black/5 hover:ring-fitti-green/20 transition-all group/profile"
              >
                <div className="flex items-center gap-4 bg-fitti-bg dark:bg-fitti-bg-alt p-3 rounded-[calc(1.5rem-0.5rem)] shadow-sm group-hover/profile:shadow-md transition-all">
                  <div className="h-10 w-10 rounded-full bg-fitti-green/10 flex items-center justify-center text-fitti-green font-black text-xs ring-1 ring-fitti-green/20 group-hover/profile:bg-fitti-green group-hover/profile:text-white transition-colors">
                    {profile.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-black text-fitti-text truncate tracking-tighter">{profile.full_name || 'User'}</p>
                    <p className="text-[10px] font-bold text-fitti-green uppercase tracking-[0.2em]">{profile.role}</p>
                  </div>
                </div>
              </button>

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
      {/* Profile Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-4 animate-v-fade-up">
          <div className="bezel-shell max-w-2xl w-full">
            <div className="bezel-core p-8 md:p-12 relative overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-fitti-green/10 flex items-center justify-center text-fitti-green text-3xl font-black ring-1 ring-fitti-green/20 shadow-inner">
                    {profile.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="logo-fitti text-4xl uppercase mb-1">{profile.full_name}</h2>
                    <span className="eyebrow-tag !mb-0">{profile.role}</span>
                  </div>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="p-3 hover:bg-black/5 rounded-full transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Credentials Info */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="font-mono text-[10px] font-black text-fitti-text-muted uppercase tracking-[0.2em]">Clinical Identity</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-fitti-text">
                        <div className="p-2 bg-fitti-green/5 rounded-lg text-fitti-green"><User className="h-4 w-4" /></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-fitti-text-muted uppercase">Full Name</p>
                          <p className="font-display font-black text-sm">{profile.full_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-fitti-text">
                        <div className="p-2 bg-fitti-green/5 rounded-lg text-fitti-green"><Mail className="h-4 w-4" /></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-fitti-text-muted uppercase">Clinical Email</p>
                          <p className="font-display font-black text-sm">{profile.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passkey Setup */}
                <div className="bezel-shell !bg-fitti-green/5 ring-1 ring-fitti-green/10">
                  <div className="bezel-core p-8 text-center">
                    <div className="w-12 h-12 bg-fitti-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-fitti-green/20">
                      <Shield className={`h-6 w-6 ${success ? 'text-fitti-green' : 'text-fitti-green'}`} />
                    </div>
                    <h3 className="logo-fitti text-xl mb-2 uppercase">
                      {success ? 'Protocol Authorized' : (profile.passkey ? 'Modify Passkey' : 'Create Passkey')}
                    </h3>
                    <p className="font-accent text-xs italic text-fitti-text-muted mb-8 leading-relaxed">
                      {success ? 'Your clinical access code has been synchronized.' : 'Enable fast clinical access with a 4-digit security code.'}
                    </p>

                    <form onSubmit={handleSetPasskey} className="space-y-6">
                      {error && (
                        <div className="p-3 bg-red-500/5 ring-1 ring-red-500/20 rounded-xl animate-v-fade-up">
                          <p className="font-mono text-[8px] text-red-500 font-bold uppercase tracking-widest mb-1">Authorization Error</p>
                          <p className="font-body text-[10px] text-red-500/80 leading-tight">{error}</p>
                        </div>
                      )}

                      <div className="flex gap-3 justify-center">
                        {[0,1,2,3].map(i => (
                          <input
                            key={i}
                            id={`profile-pk-${i}`}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            required
                            className="w-12 h-12 text-center bg-fitti-bg border border-fitti-border/20 rounded-xl font-display font-black text-2xl text-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/50 transition-all"
                            value={passkey[i] || ''}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !passkey[i] && i > 0) {
                                document.getElementById(`profile-pk-${i-1}`)?.focus();
                              }
                            }}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '').slice(-1);
                              const newPk = [...passkey];
                              newPk[i] = val;
                              setPasskey(newPk);
                              
                              if (val && i < 3) {
                                document.getElementById(`profile-pk-${i+1}`)?.focus();
                              }
                            }}
                          />
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={loading || passkey.some(k => !k)}
                        className="btn-vanguard btn-vanguard-primary w-full py-4 text-xs justify-center"
                      >
                        <span className="font-display font-black tracking-tight">{loading ? 'Processing...' : 'Authorize Code'}</span>
                        {!loading && <ArrowRight className="h-3 w-3 ml-2" />}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

