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
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        console.error('Login error details:', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        });
        throw authError;
      }

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
            <h1 className="logo-fitti text-9xl mb-4">Fitti</h1>
            <p className="motto-fitti ml-1">Evolve your fitness</p>
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
            <h1 className="logo-fitti text-7xl mb-2">Fitti</h1>
            <p className="motto-fitti">Evolve your fitness</p>
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

            <div className="mt-8 pt-6 border-t border-fitti-border/30 flex items-center justify-center gap-2">
              <span className="font-body text-xs text-fitti-text-muted">New to the evolution?</span>
              <Link to="/onboarding" className="font-display font-bold text-xs text-fitti-green hover:underline">Begin Onboarding</Link>
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
