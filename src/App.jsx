import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import useAuthStore from './store/authStore';

// Routes
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/auth/Login';
import Onboarding from './pages/auth/Onboarding';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CookDashboard from './pages/cook/CookDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import TrainerDashboard from './pages/trainer/TrainerDashboard';

// SAFETY NET: Grab the provider_token from the URL before React or Supabase can clear the hash!
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const pToken = hashParams.get('provider_token');
if (pToken) {
  localStorage.setItem('fitti_google_provider_token', pToken);
}

function App() {
  const setSession = useAuthStore(state => state.setSession);
  const setProfile = useAuthStore(state => state.setProfile);
  const session = useAuthStore(state => state.session);
  const profile = useAuthStore(state => state.profile);

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession) {
        fetchProfile(currentSession.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession?.provider_token) {
        localStorage.setItem('fitti_google_provider_token', newSession.provider_token);
        localStorage.setItem('fitti_google_refresh_token', newSession.provider_refresh_token || '');
      }
      setSession(newSession);
      if (newSession) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setProfile]);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) {
      setProfile(data);
    }
  };

  return (
    <BrowserRouter>

      <Routes>
        <Route path="/login" element={session && profile ? <Navigate to={`/${profile.role}`} replace /> : <Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Admin Route */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Customer Route */}
        <Route path="/customer/*" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />

        {/* Cook Route */}
        <Route path="/cook/*" element={
          <ProtectedRoute allowedRoles={['cook']}>
            <CookDashboard />
          </ProtectedRoute>
        } />

        {/* Doctor Route */}
        <Route path="/doctor/*" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />

        {/* Trainer Route */}
        <Route path="/trainer/*" element={
          <ProtectedRoute allowedRoles={['trainer']}>
            <TrainerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
