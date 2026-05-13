import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { generateKeyPair } from '../../lib/crypto';

export default function Onboarding() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    role: 'customer',
    goal: 'weight_loss',
    weight: '',
    height: '',
    foodPreference: 'veg'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const session = useAuthStore(state => state.session);
  const setProfile = useAuthStore(state => state.setProfile);
  const setSecretKey = useAuthStore(state => state.setSecretKey);

  // Redirect if they somehow get here but are already fully onboarded
  useEffect(() => {
    const checkProfile = async () => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) {
          setProfile(data);
          navigate(`/${data.role}`);
        }
      } else {
        navigate('/login');
      }
    };
    checkProfile();
  }, [session, navigate, setProfile]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOnboard = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!session?.user) throw new Error("No active session found.");
      
      const userId = session.user.id;
      const email = session.user.email;

      // 1. Insert into profiles
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: userId,
        full_name: formData.fullName,
        email: email,
        phone: formData.phone,
        role: formData.role
      }]);

      if (profileError) throw profileError;

      // 2. If customer, insert into customers
      if (formData.role === 'customer') {
        const { error: customerError } = await supabase.from('customers').insert([{
          id: userId,
          goal: formData.goal,
          weight: parseFloat(formData.weight) || null,
          height: parseFloat(formData.height) || null,
          food_preference: formData.foodPreference
        }]);
        if (customerError) throw customerError;
      }

      // 3. Generate NaCl keypair
      const keypair = generateKeyPair();

      // Store public key in user_pubkeys
      const { error: pubkeyError } = await supabase.from('user_pubkeys').insert([{
        user_id: userId,
        public_key: keypair.publicKey
      }]);
      
      if (pubkeyError) throw pubkeyError;

      // 4. Store secret key in memory (Zustand) and update profile state
      setSecretKey(keypair.secretKey);
      
      const profileData = { id: userId, full_name: formData.fullName, email: email, role: formData.role };
      setProfile(profileData);

      navigate(`/${formData.role}`);
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
        <h3 className="mt-6 text-3xl font-display font-bold text-fitti-text">Complete Your Profile</h3>
        <p className="mt-2 text-sm text-fitti-text-muted">Welcome! Please provide a few details to get started.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 border border-fitti-border shadow-sm rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleOnboard}>
            {error && <div className="text-black text-sm">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-spaced block mb-1">Full Name</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/20" />
              </div>
              <div>
                <label className="label-spaced block mb-1">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/20" />
              </div>
            </div>

            <div>
              <label className="label-spaced block mb-1">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/20">
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="cook">Cook</option>
                <option value="doctor">Doctor</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>

            {formData.role === 'customer' && (
              <div className="p-4 border border-dashed border-fitti-border rounded-xl space-y-4 bg-fitti-bg-alt/30">
                <h4 className="font-semibold text-fitti-green">Customer Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-spaced block mb-1">Goal</label>
                    <select name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/20">
                      <option value="weight_loss">Weight Loss</option>
                      <option value="weight_gain">Weight Gain</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="recomposition">Recomposition</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-spaced block mb-1">Food Pref</label>
                    <select name="foodPreference" value={formData.foodPreference} onChange={handleChange} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/20">
                      <option value="veg">Vegetarian</option>
                      <option value="non_veg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-spaced block mb-1">Weight (kg)</label>
                    <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/20" />
                  </div>
                  <div>
                    <label className="label-spaced block mb-1">Height (cm)</label>
                    <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/20" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <button disabled={loading} type="submit" className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-fitti-green hover:bg-fitti-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fitti-green transition-all disabled:opacity-50">
                {loading ? 'Saving...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
