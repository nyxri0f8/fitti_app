import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Zap, Package, TrendingUp, Scale, Target, Calendar, ChefHat, Dumbbell, Stethoscope, Heart, Activity, ArrowRight, ShieldCheck, Clock, Utensils } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import Sidebar from '../../components/shared/Sidebar';
import Navbar from '../../components/shared/Navbar';
import StatusBadge from '../../components/shared/StatusBadge';
import FloatingBackground from '../../components/shared/FloatingBackground';
import MessagingView from '../../components/chat/MessagingView';
import WorkoutTracker from '../../components/workout/WorkoutTracker';

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
      <div className="card-glass p-10 mb-8 relative overflow-hidden group shadow-2xl shadow-fitti-green/5">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
           <Zap className="h-40 w-40 text-fitti-green fill-fitti-green" />
        </div>
        <div className="relative z-10">
          <h2 className="font-display text-5xl font-black text-fitti-text mb-4 tracking-tighter leading-tight">
            {greeting}, <span className="text-fitti-green">{profile?.full_name?.split(' ')[0] || 'Champ'}</span>.
          </h2>
          <p className="font-accent text-xl italic text-fitti-text-muted max-w-lg leading-relaxed">
            Your biological systems are performing optimally. Here is your personalized evolution strategy for today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger-children">
        {/* Logistics Status */}
        <div className="lg:col-span-2 card-glass p-8 card-hover shadow-xl shadow-fitti-green/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="label-spaced flex items-center gap-3">
              <Package className="h-5 w-5 text-fitti-green" /> Logistics Protocol
            </h3>
            <span className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-widest bg-fitti-bg px-4 py-2 rounded-full">Active Stream</span>
          </div>
          
          {latestOrder ? (
            <div className="space-y-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-display text-3xl font-black text-fitti-text mb-2 capitalize">{latestOrder.status?.replace(/_/g, ' ')}</p>
                  <p className="font-body text-sm font-bold text-fitti-text-muted">Estimated arrival in 15-20 minutes.</p>
                </div>
                <StatusBadge status={latestOrder.status} />
              </div>
              
              <div className="relative pt-4">
                <div className="w-full bg-fitti-bg rounded-full h-4 shadow-inner overflow-hidden">
                  <div className="bg-gradient-to-r from-fitti-green/80 to-fitti-green h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(118,185,0,0.3)]" style={{
                    width: { pending: '10%', preparing: '35%', packed: '60%', out_for_delivery: '85%', delivered: '100%' }[latestOrder.status] || '0%'
                  }} />
                </div>
                <div className="grid grid-cols-5 gap-1 font-mono text-[8px] font-bold text-fitti-text-muted uppercase tracking-widest mt-6">
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
              <p className="font-body text-fitti-text-muted font-bold">No active deliveries detected.</p>
            </div>
          )}
        </div>

        {/* Biometric Snapshot */}
        <div className="card-glass p-8 card-hover shadow-xl shadow-fitti-green/5">
          <h3 className="label-spaced mb-8 flex items-center gap-3">
            <Activity className="h-5 w-5 text-fitti-orange" /> Biometrics
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Weight', value: customerData?.weight ? `${customerData.weight}kg` : '—', icon: <Scale className="h-4 w-4 text-fitti-green" /> },
              { label: 'Growth Goal', value: customerData?.goal?.replace(/_/g, ' ') || '—', icon: <Target className="h-4 w-4 text-fitti-orange" />, accent: 'text-fitti-orange' },
              { label: 'Height', value: customerData?.height ? `${customerData.height}cm` : '—', icon: <TrendingUp className="h-4 w-4 text-fitti-green" /> },
              { label: 'Dietary Pref', value: customerData?.food_preference?.replace(/_/g, ' ') || '—', icon: <Heart className="h-4 w-4 text-fitti-green" /> }
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-fitti-bg/50 rounded-2xl border border-fitti-border/30 transition-all hover:border-fitti-green/50 hover:bg-white group duration-300 hover:-translate-x-1">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">{stat.icon}</div>
                   <span className="label-spaced !text-[10px] !mb-0">{stat.label}</span>
                </div>
                <span className={`font-mono text-sm font-bold uppercase tracking-tight ${stat.accent || 'text-fitti-text'}`}>{stat.value}</span>
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
  const [dietPlan, setDietPlan] = useState(null);
  const [latestOrder, setLatestOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'weekly'

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Diet Plan
      const { data: plans } = await supabase.from('diet_plans').select('*').eq('customer_id', user.id).eq('active', true).order('created_at', { ascending: false }).limit(1);
      if (plans?.[0]) setDietPlan(plans[0]);

      // Fetch Latest Order (Live Status)
      const { data: orders } = await supabase.from('orders').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }).limit(1);
      if (orders?.[0]) setLatestOrder(orders[0]);
      
      setLoading(false);
    };
    if (user) fetchData();
  }, [user]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dayMeals = dietPlan?.meal_structure?.[today] || [];

  return (
    <div className="p-8 animate-fade-in-up max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h2 className="font-display text-4xl font-black text-fitti-text tracking-tighter uppercase">Nutrition Vault</h2>
          <p className="font-accent text-lg italic text-fitti-text-muted mt-1">Biological fuel management system</p>
        </div>
        <div className="flex bg-fitti-bg p-1 rounded-2xl border border-fitti-border/50">
          <button 
            onClick={() => setActiveTab('live')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'live' ? 'bg-white text-fitti-green shadow-sm' : 'text-fitti-text-muted hover:text-fitti-text'}`}
          >
            Live Evolution
          </button>
          <button 
            onClick={() => setActiveTab('weekly')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'weekly' ? 'bg-white text-fitti-green shadow-sm' : 'text-fitti-text-muted hover:text-fitti-text'}`}
          >
            Weekly Protocol
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="h-96 bg-white/50 rounded-[2.5rem] shimmer" />
      ) : activeTab === 'live' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Order Tracking */}
          <div className="lg:col-span-2 card-glass p-10 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <ChefHat className="h-64 w-64" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                 <span className="label-spaced flex items-center gap-2">
                   <Activity className="h-4 w-4 text-fitti-green animate-pulse" /> Active Transmission
                 </span>
                 {latestOrder && <StatusBadge status={latestOrder.status} />}
              </div>

              {latestOrder && ['preparing', 'packed', 'out_for_delivery'].includes(latestOrder.status) ? (
                <div className="space-y-10">
                   <div>
                     <h3 className="font-display text-5xl font-black text-fitti-text mb-4 tracking-tight">
                       Chef is <span className="text-fitti-green">{latestOrder.status === 'preparing' ? 'Preparing' : 'Deploying'}</span>
                     </h3>
                     <p className="font-body text-xl text-fitti-text-muted font-bold capitalize">{latestOrder.meal_plan}</p>
                   </div>

                   <div className="relative h-4 bg-fitti-bg rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="absolute h-full bg-gradient-to-r from-fitti-green/50 to-fitti-green shadow-[0_0_20px_rgba(118,185,0,0.4)] transition-all duration-1000 ease-out"
                        style={{ width: { preparing: '30%', packed: '60%', out_for_delivery: '90%' }[latestOrder.status] }}
                      />
                   </div>

                   <div className="grid grid-cols-3 gap-6">
                      <div className="bg-fitti-bg/50 p-6 rounded-2xl border border-fitti-border/30">
                        <p className="label-spaced !text-[9px] !mb-1">Calories</p>
                        <p className="font-display font-black text-2xl text-fitti-text">{latestOrder.calories}</p>
                      </div>
                      <div className="bg-fitti-bg/50 p-6 rounded-2xl border border-fitti-border/30 text-center">
                        <p className="label-spaced !text-[9px] !mb-1">Time Initiated</p>
                        <p className="font-mono font-bold text-fitti-text-muted">{new Date(latestOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="bg-fitti-bg/50 p-6 rounded-2xl border border-fitti-border/30 text-right">
                        <p className="label-spaced !text-[9px] !mb-1">Est. Completion</p>
                        <p className="font-mono font-bold text-fitti-green">15-20m</p>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="py-20 text-center">
                   <div className="h-24 w-24 bg-fitti-bg rounded-3xl flex items-center justify-center mx-auto mb-6 border border-dashed border-fitti-border">
                     <Utensils className="h-10 w-10 text-fitti-border" />
                   </div>
                   <h3 className="font-display text-2xl font-black text-fitti-text mb-2">Kitchen Standby</h3>
                   <p className="font-body text-fitti-text-muted font-bold max-w-sm mx-auto">No meals are currently in the high-performance preparation phase.</p>
                </div>
              )}
            </div>
          </div>

          {/* Today's Schedule Sidebar */}
          <div className="card-glass p-8">
            <h3 className="label-spaced mb-8 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-fitti-orange" /> Today's Protocol
            </h3>
            <div className="space-y-4">
              {dayMeals.length === 0 ? (
                <p className="text-sm font-bold text-fitti-text-muted italic">Rest Day / Custom Plan</p>
              ) : dayMeals.map((m, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-fitti-bg/50 rounded-2xl border border-fitti-border/20">
                   <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Clock className="h-5 w-5 text-fitti-orange" />
                   </div>
                   <div>
                      <p className="font-display font-bold text-fitti-text text-sm">{m.name}</p>
                      <p className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-widest">{m.time}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
           {/* Weekly Schedule Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 stagger-children">
             {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
               const meals = dietPlan?.meal_structure?.[day] || [];
               const isToday = day === today;
               return (
                 <div key={day} className={`card-glass p-6 transition-all duration-500 ${isToday ? 'ring-2 ring-fitti-green scale-105 shadow-2xl z-10' : 'opacity-80 hover:opacity-100'}`}>
                   <h3 className={`font-display font-black text-sm mb-4 uppercase tracking-tighter ${isToday ? 'text-fitti-green' : 'text-fitti-text-muted'}`}>{day}</h3>
                   <div className="space-y-3">
                     {meals.map((m, i) => (
                       <div key={i} className="bg-white/50 p-3 rounded-xl border border-fitti-border/30 group hover:border-fitti-green/30 transition-colors">
                         <p className="font-bold text-[10px] text-fitti-text leading-tight mb-1">{m.name}</p>
                         <p className="font-mono text-[8px] text-fitti-text-muted">{m.time}</p>
                       </div>
                     ))}
                     {meals.length === 0 && <p className="text-[10px] font-bold text-fitti-text-muted italic py-4">Custom</p>}
                   </div>
                 </div>
               );
             })}
           </div>

           {/* Nutrient Summary */}
           <div className="card-glass p-10 bg-fitti-text relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10">
               <Zap className="h-32 w-32 text-white fill-white" />
             </div>
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                 { label: 'Daily Target', value: `${dietPlan?.daily_calories} kcal`, color: 'text-fitti-green' },
                 { label: 'Protein Focus', value: `${dietPlan?.protein_grams}g`, color: 'text-white' },
                 { label: 'Carb Reserve', value: `${dietPlan?.carb_grams}g`, color: 'text-white' },
                 { label: 'Fat Allocation', value: `${dietPlan?.fat_grams}g`, color: 'text-white' }
               ].map((stat, i) => (
                 <div key={i}>
                   <p className="font-mono text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                   <p className={`font-display text-3xl font-black ${stat.color}`}>{stat.value}</p>
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

/* ── Workout Tab (with full tracker) ──────────────────── */
function WorkoutTab() {
  return (
    <div className="p-8 animate-fade-in-up max-w-7xl mx-auto">
      <WorkoutTracker />
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
        <div>
          <h2 className="font-display text-4xl font-black text-fitti-text tracking-tighter">Biotic History</h2>
          <p className="font-accent text-lg italic text-fitti-text-muted mt-1">Your complete health timeline</p>
        </div>
        <Stethoscope className="h-10 w-10 text-purple-500 opacity-20" />
      </div>
      
      {loading ? (
        <div className="space-y-6">{[1,2].map(i => <div key={i} className="h-56 bg-white/50 rounded-[2rem] shimmer" />)}</div>
      ) : records.length === 0 ? (
        <div className="card-glass p-20 text-center">
          <Stethoscope className="h-20 w-20 text-fitti-border mx-auto mb-6" />
          <p className="font-body text-fitti-text-muted font-bold text-xl">No medical telemetry recorded.</p>
        </div>
      ) : (
        <div className="space-y-8 stagger-children">
          {records.map(r => (
            <div key={r.id} className="card-glass p-10 card-hover">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-mono text-[10px] font-bold text-purple-600 uppercase tracking-[0.2em] mb-2">Physician Assessment</h3>
                  <p className="font-body text-sm font-bold text-fitti-text-muted">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100">
                  <ShieldCheck className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              
              <div className="mb-10">
                 <p className="font-accent text-xl text-fitti-text leading-relaxed italic">"{r.health_summary}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Conditions', value: r.conditions, color: 'text-fitti-text', bg: 'bg-fitti-bg-alt' },
                  { label: 'Medications', value: r.medications, color: 'text-fitti-green', bg: 'bg-blue-50' },
                  { label: 'Physical Limits', value: r.workout_restrictions, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Dietary Limits', value: r.dietary_restrictions, color: 'text-green-600', bg: 'bg-green-50' }
                ].map((item, i) => item.value && (
                  <div key={i} className={`${item.bg} p-6 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow duration-300`}>
                    <p className={`font-mono text-[9px] font-bold ${item.color} uppercase tracking-widest mb-2`}>{item.label}</p>
                    <p className="font-body text-xs font-bold text-fitti-text tracking-tight uppercase leading-relaxed">{item.value}</p>
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

/* ── Progress Tab ─────────────────────────────────────── */
function ProgressTab() {
  const user = useAuthStore(state => state.user);
  const [workoutData, setWorkoutData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      // Fetch workout logs
      const { data: workouts } = await supabase
        .from('workout_logs')
        .select('created_at, total_calories')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      // Aggregate workouts by date
      const wMap = {};
      (workouts || []).forEach(w => {
        const date = new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        wMap[date] = (wMap[date] || 0) + (w.total_calories || 0);
      });
      const formattedWorkouts = Object.keys(wMap).map(date => ({ date, calories: wMap[date] }));

      // Fetch progress logs (trainer/doctor)
      const { data: progress } = await supabase
        .from('progress_logs')
        .select('logged_at, weight, energy_level, diet_adherence, notes')
        .eq('customer_id', user.id)
        .order('logged_at', { ascending: true });
        
      const formattedProgress = (progress || []).map(p => ({
        date: new Date(p.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: p.weight,
        energy: p.energy_level,
        diet: p.diet_adherence,
        notes: p.notes
      }));

      setWorkoutData(formattedWorkouts);
      setProgressData(formattedProgress);
      setLoading(false);
    };
    fetchProgress();
  }, [user]);

  return (
    <div className="p-8 animate-fade-in-up max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="font-display text-4xl font-black text-fitti-text tracking-tighter">Evolution Metrics</h2>
          <p className="font-accent text-lg italic text-fitti-text-muted mt-1">Visualize your progress trajectory</p>
        </div>
        <TrendingUp className="h-10 w-10 text-fitti-green opacity-20" />
      </div>

      {loading ? (
        <div className="h-96 bg-white/50 rounded-[2rem] shimmer" />
      ) : (
        <div className="space-y-8 stagger-children">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Calories Chart */}
            <div className="card-glass p-8">
              <h3 className="label-spaced flex items-center gap-2 mb-6">
                <Zap className="h-4 w-4 text-fitti-orange" /> Caloric Burn (Kcal)
              </h3>
              {workoutData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={workoutData}>
                      <defs>
                        <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#76B900" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#76B900" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7b68' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7b68' }} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="calories" stroke="#76B900" strokeWidth={3} fillOpacity={1} fill="url(#colorCalories)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                 <div className="h-64 flex items-center justify-center text-fitti-text-muted font-bold text-sm">No workout data recorded yet.</div>
              )}
            </div>

            {/* Weight Trend Chart */}
            <div className="card-glass p-8">
              <h3 className="label-spaced flex items-center gap-2 mb-6">
                <Scale className="h-4 w-4 text-fitti-green" /> Weight Trajectory (Kg)
              </h3>
              {progressData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7b68' }} dy={10} />
                      <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7b68' }} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="weight" stroke="#111111" strokeWidth={3} dot={{ stroke: '#111111', strokeWidth: 2, fill: '#fff', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-fitti-text-muted font-bold text-sm">No weight records found.</div>
              )}
            </div>

          </div>

          {/* Detailed Progress Logs Table/Cards */}
          {progressData.length > 0 && (
            <div className="card-glass p-8">
              <h3 className="label-spaced flex items-center gap-2 mb-6">
                <Activity className="h-4 w-4 text-fitti-green" /> Professional Assessments
              </h3>
              <div className="space-y-4">
                {[...progressData].reverse().map((log, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white/50 rounded-2xl border border-fitti-border/50 hover:border-fitti-green/30 transition-all">
                    <div className="mb-4 md:mb-0">
                      <span className="font-mono text-xs font-bold text-fitti-text-muted block mb-1">{log.date}</span>
                      <p className="font-accent text-sm text-fitti-text font-bold italic">{log.notes || 'No specific notes recorded.'}</p>
                    </div>
                    <div className="flex gap-4">
                       <div className="text-center bg-fitti-bg p-3 rounded-xl min-w-[80px]">
                         <p className="text-[9px] font-mono text-fitti-text-muted font-bold uppercase mb-1">Energy</p>
                         <p className="font-bold text-fitti-text">{log.energy || '-'}/10</p>
                       </div>
                       <div className="text-center bg-fitti-bg p-3 rounded-xl min-w-[80px]">
                         <p className="text-[9px] font-mono text-fitti-text-muted font-bold uppercase mb-1">Diet</p>
                         <p className="font-bold text-fitti-text">{log.diet || '-'}/10</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────── */
export default function CustomerDashboard() {
  const user = useAuthStore(state => state.user);
  
  
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
            <Route path="/progress" element={<ProgressTab />} />
            <Route path="/messages" element={<MessagingView />} />
                      </Routes>
        </main>
      </div>
    </div>
  );
}
