import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  return (
    <div className="min-h-screen bg-fitti-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-4xl font-display font-black text-fitti-green tracking-tight">Fitti.</h2>
        <h3 className="mt-6 text-3xl font-display font-bold text-fitti-text">Welcome back.</h3>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-fitti-border shadow-sm rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            
            <div>
              <label className="label-spaced block mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 text-fitti-text-dark focus:border-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="label-spaced block mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 text-fitti-text-dark focus:border-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-fitti-green hover:bg-fitti-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fitti-green transition-all disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
