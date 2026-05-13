import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { Dumbbell, ArrowRight, Zap, Shield, Heart, Activity } from 'lucide-react';

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
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle(); // Use maybeSingle to not throw error if 0 rows

      setSession(authData.session);

      if (!profile) {
        // No profile found, redirect to onboarding
        navigate('/onboarding');
      } else {
        // Profile exists, redirect to dashboard
        setProfile(profile);
        navigate(`/${profile.role}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testUsers = [
    { role: 'Admin', email: 'admin@fitti.org.in', icon: Shield, desc: 'Full system control' },
    { role: 'Trainer', email: 'trainer@fitti.org.in', icon: Dumbbell, desc: 'Manage clients' },
    { role: 'Doctor', email: 'doctor@fitti.org.in', icon: Heart, desc: 'Patient care' },
    { role: 'Cook', email: 'cook@fitti.org.in', icon: Zap, desc: 'Meal prep' }
  ];

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-fitti-green/5 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fitti-green/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fitti-green/[0.02] rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(118,185,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(118,185,0,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-16">
        <div className="relative z-10 max-w-lg animate-fade-in-up">
          <div className="mb-12">
            <h1 className="logo-fitti text-7xl mb-4">Fitti</h1>
            <p className="font-accent text-2xl italic text-fitti-text/60 leading-relaxed">
              Where discipline meets evolution.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: Activity, text: 'Real-time health tracking & analytics' },
              { icon: Dumbbell, text: 'Personalized workout protocols' },
              { icon: Zap, text: 'AI-optimized meal plans' },
            ].map((item, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 group animate-fade-in-left"
                style={{ animationDelay: `${0.3 + i * 0.15}s` }}
              >
                <div className="h-12 w-12 rounded-2xl bg-fitti-green/10 flex items-center justify-center group-hover:bg-fitti-green/20 group-hover:scale-110 transition-all duration-300">
                  <item.icon className="h-5 w-5 text-fitti-green" />
                </div>
                <p className="font-body text-sm font-medium text-fitti-text/70">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Decorative element */}
          <div className="mt-16 flex items-center gap-3 opacity-40">
            <div className="h-px flex-1 bg-fitti-green/30" />
            <span className="font-mono text-[10px] text-fitti-green tracking-widest uppercase">Est. 2026</span>
            <div className="h-px flex-1 bg-fitti-green/30" />
          </div>
        </div>

        {/* Big floating dumbbell watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] animate-spin-slow">
          <Dumbbell className="w-[500px] h-[500px] text-fitti-green" />
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 relative z-10">
        <div className="w-full max-w-md mx-auto animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <h1 className="logo-fitti text-5xl mb-2">Fitti</h1>
            <p className="font-accent text-lg italic text-fitti-text/50">Where discipline meets evolution.</p>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-4xl font-black text-fitti-text tracking-tight">
              Welcome back<span className="text-fitti-green">.</span>
            </h2>
            <p className="mt-2 font-body text-sm text-fitti-text-muted">
              Sign in to continue your evolution
            </p>
          </div>

          <div className="card-glass p-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl animate-bounce-in">
                  <span className="font-mono text-xs">⚠</span>
                  <span className="font-body">{error}</span>
                </div>
              )}
              
              <div className="relative">
                <label className="label-spaced block mb-2">Email</label>
                <input
                  type="email"
                  required
                  className={`w-full bg-white/80 border-2 rounded-xl px-4 py-3.5 font-body text-fitti-text focus:outline-none transition-all duration-300 ${
                    focusedField === 'email' ? 'border-fitti-green shadow-lg shadow-fitti-green/10 bg-white' : 'border-fitti-border hover:border-fitti-green/40'
                  }`}
                  value={email}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="relative">
                <label className="label-spaced block mb-2">Password</label>
                <input
                  type="password"
                  required
                  className={`w-full bg-white/80 border-2 rounded-xl px-4 py-3.5 font-body text-fitti-text focus:outline-none transition-all duration-300 ${
                    focusedField === 'password' ? 'border-fitti-green shadow-lg shadow-fitti-green/10 bg-white' : 'border-fitti-border hover:border-fitti-green/40'
                  }`}
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group btn-gradient w-full py-4 px-6 flex items-center justify-center gap-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-display font-bold tracking-wide">
                  {loading ? 'Authenticating...' : 'Sign In'}
                </span>
                {!loading && (
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                )}
                {loading && (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
              </button>
            </form>

            {/* Test Credentials */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-fitti-border/60" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white/70 font-mono text-[9px] text-fitti-text-muted font-bold uppercase tracking-[0.25em]">
                    Quick Access
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {testUsers.map((testUser, i) => (
                  <button
                    key={testUser.role}
                    onClick={() => {
                      setEmail(testUser.email);
                      setPassword('Test@01');
                    }}
                    className="group flex items-center gap-3 py-3 px-4 border-2 border-fitti-border/50 rounded-xl bg-white/60 hover:border-fitti-green/40 hover:bg-fitti-green/5 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
                    style={{ animationDelay: `${0.5 + i * 0.08}s` }}
                  >
                    <testUser.icon className="h-4 w-4 text-fitti-green/60 group-hover:text-fitti-green group-hover:scale-110 transition-all" />
                    <div className="text-left">
                      <p className="font-display text-xs font-bold text-fitti-text">{testUser.role}</p>
                      <p className="font-mono text-[8px] text-fitti-text-muted">{testUser.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[10px] text-fitti-text-muted/50 tracking-widest uppercase">
            Secured by Fitti Infrastructure v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
