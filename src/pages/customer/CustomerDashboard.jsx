import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Zap, Package, TrendingUp, Scale, Target, Calendar, ChefHat, Dumbbell, Stethoscope, Heart, Activity, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import Sidebar from '../../components/shared/Sidebar';
import Navbar from '../../components/shared/Navbar';
import StatusBadge from '../../components/shared/StatusBadge';
import FloatingBackground from '../../components/shared/FloatingBackground';
import MessagingView from '../../components/chat/MessagingView';
import { nanoid } from 'nanoid';

/* ── Home Tab ──────────────────────────────────────────── */
function HomeTab() {
  const profile = useAuthStore(state => state.profile);
  const user = useAuthStore(state => state.user);
  const [customerData, setCustomerData] = useState(null);
  const [latestOrder, setLatestOrder] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: cd } = await supabase.from('customers').select('*').eq('id', user.id).maybeSingle();
      setCustomerData(cd);
      const { data: orders } = await supabase.from('orders').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }).limit(1);
      if (orders?.[0]) setLatestOrder(orders[0]);
    };
    fetchData();
  }, [user]);

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-8 animate-fade-in-up max-w-7xl mx-auto">
      <div className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-[2.5rem] p-10 mb-8 relative overflow-hidden group shadow-2xl shadow-fitti-green/5">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
           <Zap className="h-40 w-40 text-fitti-green fill-fitti-green" />
        </div>
        <div className="relative z-10">
          <h2 className="text-5xl font-display font-black text-fitti-text mb-4 tracking-tighter leading-tight">
            {greeting}, <span className="text-fitti-green">{profile?.full_name?.split(' ')[0] || 'Champ'}</span>.
          </h2>
          <p className="text-fitti-text-muted font-bold text-lg max-w-lg leading-relaxed">
            Your biological systems are performing optimally. Here is your personalized evolution strategy for today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger-children">
        {/* Logistics Status */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-fitti-border rounded-[2rem] p-8 card-hover shadow-xl shadow-fitti-green/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-fitti-text uppercase tracking-[0.3em] flex items-center gap-3">
              <Package className="h-5 w-5 text-fitti-green" /> Logistics Protocol
            </h3>
            <span className="text-[10px] font-black text-fitti-text-muted uppercase tracking-widest bg-fitti-bg px-4 py-2 rounded-full">Active Stream</span>
          </div>
          
          {latestOrder ? (
            <div className="space-y-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-fitti-text mb-2 capitalize">{latestOrder.status?.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-bold text-fitti-text-muted">Estimated arrival in 15-20 minutes.</p>
                </div>
                <StatusBadge status={latestOrder.status} />
              </div>
              
              <div className="relative pt-4">
                <div className="w-full bg-fitti-bg rounded-full h-4 shadow-inner overflow-hidden">
                  <div className="bg-gradient-to-r from-fitti-green/80 to-fitti-green h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,197,94,0.3)]" style={{
                    width: { pending: '10%', preparing: '35%', packed: '60%', out_for_delivery: '85%', delivered: '100%' }[latestOrder.status] || '0%'
                  }} />
                </div>
                <div className="grid grid-cols-5 gap-1 text-[8px] font-black text-fitti-text-muted uppercase tracking-widest mt-6">
                  <span className="text-center">Pending</span>
                  <span className="text-center">Processing</span>
                  <span className="text-center">Secured</span>
                  <span className="text-center">Transit</span>
                  <span className="text-center">Deployed</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="h-16 w-16 bg-fitti-bg rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-fitti-border">
                <Clock className="h-8 w-8 text-fitti-border" />
              </div>
              <p className="text-fitti-text-muted font-bold">No active deliveries detected.</p>
            </div>
          )}
        </div>

        {/* Biometric Snapshot */}
        <div className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-[2rem] p-8 card-hover shadow-xl shadow-fitti-green/5">
          <h3 className="text-xs font-black text-fitti-text uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <Activity className="h-5 w-5 text-fitti-orange" /> Biometrics
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Weight', value: customerData?.weight ? `${customerData.weight}kg` : '—', icon: <Scale className="h-4 w-4 text-fitti-green" /> },
              { label: 'Growth Goal', value: customerData?.goal?.replace(/_/g, ' ') || '—', icon: <Target className="h-4 w-4 text-fitti-orange" />, accent: 'text-fitti-orange' },
              { label: 'Height', value: customerData?.height ? `${customerData.height}cm` : '—', icon: <TrendingUp className="h-4 w-4 text-blue-500" /> },
              { label: 'Dietary Pref', value: customerData?.food_preference?.replace(/_/g, ' ') || '—', icon: <Heart className="h-4 w-4 text-red-400" /> }
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-fitti-bg/50 rounded-2xl border border-fitti-border/30 transition-all hover:border-fitti-green/50 hover:bg-white group">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-white rounded-xl shadow-sm">{stat.icon}</div>
                   <span className="label-spaced !text-[10px] !mb-0">{stat.label}</span>
                </div>
                <span className={`text-sm font-black uppercase tracking-tight ${stat.accent || 'text-fitti-text'}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Meals Tab ─────────────────────────────────────────── */
function MealsTab() {
  const user = useAuthStore(state => state.user);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      const { data } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('customer_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      // diet_plans contains meal_structure as JSON
      // If we have a plan, we use its structure
      if (data && data.length > 0) {
        const plan = data[0];
        const mealList = (plan.meal_structure || []).map(m => ({
          ...m,
          id: plan.id + m.name,
          meal_name: m.name,
          meal_time: m.time,
          calories: (m.protein * 4) + (m.carbs * 4) + (m.fat * 9),
          macros: `P:${m.protein}g C:${m.carbs}g F:${m.fat}g`,
          created_at: plan.created_at
        }));
        setMeals(mealList);
      } else {
        setMeals([]);
      }
      setLoading(false);
    };
    if (user) fetchMeals();
  }, [user]);

  return (
    <div className="p-8 animate-fade-in-up max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-display font-black text-fitti-text tracking-tighter uppercase">Nutrition Vault</h2>
        <ChefHat className="h-10 w-10 text-fitti-orange opacity-20" />
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-white/50 rounded-[2rem] shimmer" />)}
        </div>
      ) : meals.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-[2.5rem] p-20 text-center">
          <ChefHat className="h-20 w-20 text-fitti-border mx-auto mb-6" />
          <p className="text-fitti-text-muted font-bold text-xl uppercase tracking-widest">No active nutrition plans detected.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {meals.map(meal => (
            <div key={meal.id} className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-[2rem] p-8 card-hover shadow-xl shadow-fitti-green/5 overflow-hidden relative">
              <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <ChefHat className="h-40 w-40" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-fitti-orange uppercase tracking-[0.2em] bg-fitti-orange/10 px-4 py-2 rounded-full">Evolution Meal</span>
                  <p className="text-xs font-black text-fitti-text-muted">{new Date(meal.created_at).toLocaleDateString()}</p>
                </div>
                <h3 className="text-2xl font-black text-fitti-text mb-4 leading-tight">{meal.meal_name}</h3>
                <div className="flex items-center gap-2 mb-8">
                  <Clock className="h-3 w-3 text-fitti-text-muted" />
                  <span className="text-[10px] font-bold text-fitti-text-muted uppercase tracking-widest">{meal.meal_time}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-fitti-bg p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-fitti-text-muted uppercase tracking-widest mb-1">Calories</p>
                    <p className="text-lg font-black text-fitti-text">{Math.round(meal.calories)} kcal</p>
                  </div>
                  <div className="bg-fitti-bg p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-fitti-text-muted uppercase tracking-widest mb-1">Macros</p>
                    <p className="text-[10px] font-black text-fitti-text leading-relaxed">{meal.macros || 'Optimized'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Workout Tab ───────────────────────────────────────── */
function WorkoutTab() {
  const user = useAuthStore(state => state.user);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data } = await supabase.from('workout_plans').select('*').eq('customer_id', user.id).order('created_at', { ascending: false });
      setPlans(data || []);
      setLoading(false);
    };
    fetchWorkouts();
  }, [user]);

  return (
    <div className="p-8 animate-fade-in-up max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-display font-black text-fitti-text tracking-tighter uppercase">Hypertrophy Hub</h2>
        <Dumbbell className="h-10 w-10 text-blue-500 opacity-20" />
      </div>
      
      {loading ? (
        <div className="space-y-6">{[1,2].map(i => <div key={i} className="h-40 bg-white/50 rounded-[2rem] shimmer" />)}</div>
      ) : plans.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-[2.5rem] p-20 text-center">
          <Dumbbell className="h-20 w-20 text-fitti-border mx-auto mb-6" />
          <p className="text-fitti-text-muted font-bold text-xl uppercase tracking-widest">No performance directives detected.</p>
        </div>
      ) : (
        <div className="space-y-8 stagger-children">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-[2.5rem] p-10 card-hover shadow-xl shadow-fitti-green/5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-4 py-2 rounded-full border border-blue-100">Directive {plan.id.slice(0,4)}</span>
                    <p className="text-xs font-bold text-fitti-text-muted">{new Date(plan.created_at).toLocaleDateString()}</p>
                  </div>
                  <h3 className="text-3xl font-black text-fitti-text mb-6 tracking-tight">{plan.workout_name}</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-6 py-3 bg-fitti-bg rounded-2xl border border-fitti-border/30">
                       <ShieldCheck className="h-4 w-4 text-fitti-green" />
                       <span className="text-xs font-black text-fitti-text uppercase tracking-widest">Verified Program</span>
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 bg-fitti-bg/50 rounded-3xl p-8 border border-fitti-border/30">
                  <p className="text-[10px] font-black text-fitti-text-muted uppercase tracking-[0.2em] mb-4">Tactical Instructions</p>
                  <p className="text-sm font-bold text-fitti-text leading-loose whitespace-pre-wrap">{plan.instructions}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Health Tab ────────────────────────────────────────── */
function HealthTab() {
  const user = useAuthStore(state => state.user);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      const { data } = await supabase.from('medical_records').select('*').eq('customer_id', user.id).order('created_at', { ascending: false });
      setRecords(data || []);
      setLoading(false);
    };
    fetchHealth();
  }, [user]);

  return (
    <div className="p-8 animate-fade-in-up max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-display font-black text-fitti-text tracking-tighter uppercase">Biotic History</h2>
        <Stethoscope className="h-10 w-10 text-purple-500 opacity-20" />
      </div>
      
      {loading ? (
        <div className="space-y-6">{[1,2].map(i => <div key={i} className="h-56 bg-white/50 rounded-[2rem] shimmer" />)}</div>
      ) : records.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-[2.5rem] p-20 text-center">
          <Stethoscope className="h-20 w-20 text-fitti-border mx-auto mb-6" />
          <p className="text-fitti-text-muted font-bold text-xl uppercase tracking-widest">No medical telemetry recorded.</p>
        </div>
      ) : (
        <div className="space-y-8 stagger-children">
          {records.map(r => (
            <div key={r.id} className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-[2.5rem] p-10 card-hover shadow-xl shadow-fitti-green/5">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-2">Physician Assessment</h3>
                  <p className="text-sm font-bold text-fitti-text-muted">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100">
                  <ShieldCheck className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              
              <div className="mb-10">
                 <p className="text-xl font-bold text-fitti-text leading-relaxed italic">"{r.health_summary}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Conditions', value: r.conditions, color: 'text-red-500', bg: 'bg-red-50' },
                  { label: 'Medications', value: r.medications, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Physical Limits', value: r.workout_restrictions, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Dietary Limits', value: r.dietary_restrictions, color: 'text-green-600', bg: 'bg-green-50' }
                ].map((item, i) => item.value && (
                  <div key={i} className={`${item.bg} p-6 rounded-2xl border border-white shadow-sm`}>
                    <p className={`text-[9px] font-black ${item.color} uppercase tracking-widest mb-2`}>{item.label}</p>
                    <p className="text-xs font-black text-fitti-text tracking-tight uppercase leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────── */
export default function CustomerDashboard() {
  const user = useAuthStore(state => state.user);
  const setActiveCall = useAuthStore(state => state.setActiveCall);

  const startVideoCall = async (contact) => {
    const roomCode = nanoid(8);
    await supabase.from('meet_sessions').insert([{ room_code: roomCode, host_id: user.id, guest_id: contact.id, session_type: 'customer_doctor' }]);
    setActiveCall({ roomCode, isHost: true, guestId: contact.id, remoteName: contact.name });
  };

  return (
    <div className="flex h-screen bg-fitti-bg relative">
      <FloatingBackground role="customer" />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Navbar title="" />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomeTab />} />
            <Route path="/meals" element={<MealsTab />} />
            <Route path="/workout" element={<WorkoutTab />} />
            <Route path="/health" element={<HealthTab />} />
            <Route path="/progress" element={<div className="p-8 text-center py-20"><TrendingUp className="h-16 w-16 text-fitti-border mx-auto mb-6" /><p className="text-fitti-text-muted font-bold text-xl uppercase tracking-widest">Progress Analytics initializing...</p></div>} />
            <Route path="/messages" element={<MessagingView onStartVideoCall={startVideoCall} />} />
            <Route path="/sessions" element={<div className="p-8"><h2 className="text-3xl font-display font-black text-fitti-text tracking-tight uppercase mb-4">Secure Link</h2><div className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-[2rem] p-20 text-center"><p className="text-fitti-text-muted font-bold">Use the Messages tab to establish a video node.</p></div></div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

