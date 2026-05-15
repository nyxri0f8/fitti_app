import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { Dumbbell, ArrowRight, Zap, Shield, Heart, Activity, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const setSession = useAuthStore(state => state.setSession);
  const setProfile = useAuthStore(state => state.setProfile);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      setSession(authData.session);

      if (!profile) {
        navigate('/onboarding');
      } else {
        setProfile(profile);
        navigate(`/${profile.role}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-fitti-bg flex relative overflow-hidden">
      {/* Global Atmosphere */}
      <div className="grain-overlay" />
      <div className="mesh-glow -top-1/4 -right-1/4 w-[150%] h-[150%] opacity-20 animate-pulse-soft" />
      <div className="mesh-glow -bottom-1/4 -left-1/4 w-[150%] h-[150%] opacity-10 [animation-delay:2s]" />

      {/* Hero Brand Section - Editorial Architecture */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-24 z-10 border-r border-fitti-border/10">
        <div className="relative animate-v-fade-up">
          <span className="eyebrow-tag !mb-4">Biological Evolution Protocol</span>
          <h1 className="logo-fitti text-[12vw] mb-12">
            Fitti.
          </h1>
          <p className="font-accent text-3xl italic text-fitti-text-muted max-w-lg leading-relaxed">
            The next stage of your physical evolution begins here. Access the encrypted synchronization node.
          </p>
          
          <div className="mt-24 flex items-center gap-12 stagger-v-fade">
             {[
               { icon: <Zap strokeWidth={1} />, label: 'Energy' },
               { icon: <Shield strokeWidth={1} />, label: 'Security' },
               { icon: <Activity strokeWidth={1} />, label: 'Biometrics' }
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center gap-3">
                 <div className="w-12 h-12 rounded-full border border-fitti-green/20 flex items-center justify-center text-fitti-green animate-pulse-soft" style={{ animationDelay: `${i * 0.5}s` }}>
                   {item.icon}
                 </div>
                 <span className="font-mono text-[9px] font-bold text-fitti-text-muted uppercase tracking-[0.2em]">{item.label}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Authentication Node - Hardware Enclosure */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 relative z-10">
        <div className="w-full max-w-[500px] stagger-v-fade">
          
          {/* Mobile Branding */}
          <div className="lg:hidden mb-16 text-center animate-v-fade-up">
            <h1 className="logo-fitti text-7xl mb-2">Fitti.</h1>
            <span className="eyebrow-tag">Biological Evolution Protocol</span>
          </div>

          <div className="bezel-shell group">
            <div className="bezel-core p-8 md:p-12 relative overflow-hidden">
               <div className="mesh-glow opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
               
               <div className="mb-10 relative z-10">
                <h2 className="logo-fitti text-4xl mb-3">
                  Sync Identity_
                </h2>
                <p className="font-body text-sm text-fitti-text-muted font-medium">
                  Enter your encrypted credentials to initialize.
                </p>
              </div>

              <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
                {error && (
                  <div className="p-4 bg-red-500/5 ring-1 ring-red-500/20 rounded-2xl animate-v-fade-up">
                    <p className="font-mono text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">Authorization Error</p>
                    <p className="font-body text-xs text-red-500/80">{error}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="label-spaced block !mb-0 text-[10px]">Credential Path / Email</label>
                  <div className="relative group/field">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-fitti-text-muted group-focus-within/field:text-fitti-green transition-colors duration-500">
                      <Mail strokeWidth={1.5} className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full bg-black/5 dark:bg-white/5 border border-fitti-border/20 rounded-2xl pl-12 pr-4 py-4 font-display font-bold text-fitti-text placeholder:text-fitti-text-muted/30 focus:outline-none focus:ring-1 focus:ring-fitti-green/50 transition-all duration-700 ease-vanguard"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="evolution@fitti.sys"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-spaced block !mb-0 text-[10px]">Access Key / Password</label>
                  <div className="relative group/field">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-fitti-text-muted group-focus-within/field:text-fitti-green transition-colors duration-500">
                      <Lock strokeWidth={1.5} className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      required
                      className="w-full bg-black/5 dark:bg-white/5 border border-fitti-border/20 rounded-2xl pl-12 pr-4 py-4 font-display font-bold text-fitti-text placeholder:text-fitti-text-muted/30 focus:outline-none focus:ring-1 focus:ring-fitti-green/50 transition-all duration-700 ease-vanguard"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-vanguard btn-vanguard-primary w-full py-5 text-base justify-center shadow-2xl shadow-fitti-green/10"
                >
                  <span className="font-display font-black tracking-tight">
                    {loading ? 'Decrypting...' : 'Initialize Synchronization'}
                  </span>
                  {!loading && (
                    <div className="btn-vanguard-icon-wrapper">
                      <ArrowRight strokeWidth={2.5} className="h-4 w-4" />
                    </div>
                  )}
                  {loading && (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-fitti-border/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <span className="font-mono text-[10px] text-fitti-text-muted font-bold uppercase tracking-widest">New protocol?</span>
                <Link to="/onboarding" className="group flex items-center gap-2 font-display font-black text-xs text-fitti-green">
                  Begin Onboarding
                  <ArrowRight strokeWidth={2.5} className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-12 text-center font-mono text-[9px] text-fitti-text-muted/40 tracking-[0.4em] uppercase animate-pulse">
            Fitti Infrastructure v2.0 // Unified Bio-Node
          </p>
        </div>
      </div>
    </div>
  );
}
