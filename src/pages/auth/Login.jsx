import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { Dumbbell, ArrowRight, Zap, Shield, Heart, Activity, Mail, Lock, X } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState('password'); // 'password' or 'passkey'
  const [passkey, setPasskey] = useState(['', '', '', '']);
  const [showPasskeySetup, setShowPasskeySetup] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [rememberedUser, setRememberedUser] = useState(() => {
    const saved = localStorage.getItem('fitti_last_user');
    return saved ? JSON.parse(saved) : null;
  });

  const setSession = useAuthStore(state => state.setSession);
  const setProfile = useAuthStore(state => state.setProfile);

  const getPasskeyPassword = (email, code) => {
    return `fitti_pk_${email.toLowerCase().trim()}_${code}_secure`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let authEmail = rememberedUser?.email || email.trim();
      let authCode = passkey.join('');
      let authPassword = loginMode === 'passkey' ? getPasskeyPassword(authEmail, authCode) : password.trim();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      setSession(authData.session);

      // Store for next passkey login
      if (profile) {
        localStorage.setItem('fitti_last_user', JSON.stringify({
          email: authEmail,
          name: profile.full_name,
          role: profile.role
        }));
      }

      if (!profile) {
        navigate('/onboarding');
      } else if (!profile.passkey && loginMode === 'password') {
        // Force passkey setup for existing users who don't have one
        setTempUser({ id: authData.user.id, email: authEmail, role: profile.role, profile });
        setShowPasskeySetup(true);
      } else {
        setProfile(profile);
        navigate(`/${profile.role}`);
      }
    } catch (err) {
      setError(loginMode === 'passkey' ? 'Invalid email or passkey.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPasskey = async (e) => {
    e.preventDefault();
    if (passkey.length !== 4) {
      setError('Please enter a complete 4-digit protocol code.');
      return;
    }
    setLoading(true);

    try {
      const code = passkey.join('');
      const securePassword = getPasskeyPassword(tempUser.email, code);
      
      // 1. Update Supabase Auth Password
      const { error: authError } = await supabase.auth.updateUser({ password: securePassword });
      if (authError) throw authError;

      // 2. Update Profile passkey field
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ passkey: code })
        .eq('id', tempUser.id);
      
      if (profileError) throw profileError;

      // Update remembered user
      localStorage.setItem('fitti_last_user', JSON.stringify({
        email: tempUser.email,
        name: tempUser.profile.full_name,
        role: tempUser.role
      }));

      // 3. Finalize Session
      setProfile({ ...tempUser.profile, passkey: code });
      navigate(`/${tempUser.role}`);
    } catch (err) {
      setError(`Protocol Initialization Failed: ${err.message}`);
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
          <span className="eyebrow-tag !mb-4">Personalized Health Platform</span>
          <h1 className="logo-fitti text-[12vw] mb-12">
            Fitti.
          </h1>
          <p className="font-accent text-3xl italic text-fitti-text-muted max-w-lg leading-relaxed">
            The next stage of your fitness journey starts here. Access your personalized health dashboard.
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
               
               <div className="mb-10 relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="logo-fitti text-4xl mb-1 uppercase">
                      {loginMode === 'passkey' ? 'Passkey.' : 'Login.'}
                    </h2>
                    <p className="font-body text-xs text-fitti-text-muted font-medium">
                      {loginMode === 'passkey' ? 'Enter your 4-digit security code.' : 'Enter your credentials to continue.'}
                    </p>
                  </div>
                  <div className="p-3 bg-fitti-green/10 rounded-2xl text-fitti-green">
                    <Shield className="h-6 w-6" />
                  </div>
                </div>

              <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
                {error && (
                  <div className="p-4 bg-red-500/5 ring-1 ring-red-500/20 rounded-2xl animate-v-fade-up">
                    <p className="font-mono text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">Login Error</p>
                    <p className="font-body text-xs text-red-500/80">{error}</p>
                  </div>
                )}
                
                {(!rememberedUser || loginMode === 'password') && (
                  <div className="space-y-2">
                    <label className="label-spaced block !mb-0 text-[10px]">Email Address</label>
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
                )}

                {rememberedUser && loginMode === 'passkey' && (
                  <div className="bezel-shell !bg-fitti-green/5 ring-1 ring-fitti-green/10 animate-v-fade-up">
                    <div className="bezel-core p-6 flex items-center gap-6">
                      <div className="w-14 h-14 rounded-full bg-fitti-green/10 flex items-center justify-center text-fitti-green font-black text-xl ring-1 ring-fitti-green/20">
                        {rememberedUser.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-mono text-[9px] font-black text-fitti-text-muted uppercase tracking-[0.2em]">Authorized Identity</p>
                        <p className="font-display font-black text-lg text-fitti-text">{rememberedUser.name}</p>
                        <button 
                          onClick={() => {
                            localStorage.removeItem('fitti_last_user');
                            setRememberedUser(null);
                          }}
                          className="font-mono text-[8px] font-bold text-fitti-green uppercase tracking-widest hover:underline mt-1"
                        >
                          Use a different account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {loginMode === 'password' ? (
                  <div className="space-y-2 animate-v-fade-up">
                    <label className="label-spaced block !mb-0 text-[10px]">Security Password</label>
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
                ) : (
                  <div className="space-y-2 animate-v-fade-up">
                    <label className="label-spaced block !mb-0 text-[10px]">4-Digit Passkey</label>
                    <div className="flex gap-4 justify-between">
                      {[0,1,2,3].map(i => (
                        <input
                          key={i}
                          id={`pk-login-${i}`}
                          type="password"
                          inputMode="numeric"
                          maxLength={1}
                          required
                          className="w-full aspect-square text-center bg-black/5 dark:bg-white/5 border border-fitti-border/20 rounded-2xl font-display font-black text-3xl text-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/50 transition-all"
                          value={passkey[i] || ''}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !passkey[i] && i > 0) {
                              document.getElementById(`pk-login-${i-1}`)?.focus();
                            }
                          }}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(-1);
                            const newPk = [...passkey];
                            newPk[i] = val;
                            setPasskey(newPk);
                            
                            if (val && i < 3) {
                              document.getElementById(`pk-login-${i+1}`)?.focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (loginMode === 'passkey' && passkey.some(k => !k))}
                  className="btn-vanguard btn-vanguard-primary w-full py-5 text-base justify-center shadow-2xl shadow-fitti-green/10"
                >
                  <span className="font-display font-black tracking-tight">
                    {loading ? 'Authenticating...' : loginMode === 'passkey' ? 'Authorize Passkey' : 'Access Dashboard'}
                  </span>
                  {!loading && (
                    <div className="btn-vanguard-icon-wrapper">
                      <ArrowRight strokeWidth={2.5} className="h-4 w-4" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMode(loginMode === 'password' ? 'passkey' : 'password');
                    setPasskey('');
                    setError(null);
                  }}
                  className="w-full py-3 text-[10px] font-mono font-black text-fitti-text-muted uppercase tracking-[0.2em] hover:text-fitti-green transition-colors"
                >
                  {loginMode === 'password' ? 'Switch to Passkey Login' : 'Switch to Password Login'}
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-fitti-border/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <span className="font-mono text-[10px] text-fitti-text-muted font-bold uppercase tracking-widest">New user?</span>
                <Link to="/onboarding" className="group flex items-center gap-2 font-display font-black text-xs text-fitti-green">
                  Begin Onboarding
                  <ArrowRight strokeWidth={2.5} className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      {/* Passkey Setup Modal */}
      {showPasskeySetup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl animate-v-fade-up p-4">
          <div className="bezel-shell max-w-md w-full">
            <div className="bezel-core p-10 relative overflow-hidden text-center">
              <div className="mesh-glow -top-24 -left-24 opacity-20" />
              <div className="w-20 h-20 bg-fitti-green/10 rounded-2xl flex items-center justify-center mx-auto mb-8 ring-1 ring-fitti-green/20">
                <Lock className="h-10 w-10 text-fitti-green" />
              </div>
              <h2 className="logo-fitti text-3xl mb-2 uppercase">Set Passkey.</h2>
              <p className="font-accent text-lg italic text-fitti-text-muted mb-10">Simplify your future access.</p>
              
              <form onSubmit={handleSetPasskey} className="space-y-8">
                <div className="flex gap-4 justify-between">
                  {[0,1,2,3].map(i => (
                    <input
                      key={i}
                      id={`pk-setup-${i}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      required
                      autoFocus={i === 0}
                      className="w-full aspect-square text-center bg-black/5 dark:bg-white/5 border border-fitti-border/20 rounded-2xl font-display font-black text-3xl text-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/50 transition-all"
                      value={passkey[i] || ''}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !passkey[i] && i > 0) {
                          document.getElementById(`pk-setup-${i-1}`)?.focus();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(-1);
                        const newPk = [...passkey];
                        newPk[i] = val;
                        setPasskey(newPk);
                        
                        if (val && i < 3) {
                          document.getElementById(`pk-setup-${i+1}`)?.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                <p className="font-body text-[10px] text-fitti-text-muted/60 uppercase tracking-widest leading-relaxed">
                  Your 4-digit code will replace your password for faster clinical access on this device.
                </p>

                <button 
                  type="submit"
                  disabled={loading || passkey.some(k => !k)}
                  className="btn-vanguard btn-vanguard-primary w-full py-5 text-base justify-center shadow-2xl shadow-fitti-green/10"
                >
                  <span className="font-display font-black tracking-tight">{loading ? 'Finalizing...' : 'Initialize Passkey'}</span>
                  {!loading && <div className="btn-vanguard-icon-wrapper"><ArrowRight strokeWidth={2.5} className="h-4 w-4" /></div>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
