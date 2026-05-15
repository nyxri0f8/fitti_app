import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Zap, Package, TrendingUp, Scale, Target, Calendar, ChefHat, Dumbbell, Stethoscope, Heart, Activity, ArrowRight, ShieldCheck, Clock, Utensils, Trophy } from 'lucide-react';
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
    <div className="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto space-y-12 md:space-y-24">
      {/* Hero Section - Editorial Split Style */}
      <section className="animate-v-fade-up">
        <span className="eyebrow-tag">Dashboard Overview</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-fitti-text mb-8 tracking-tighter leading-[0.9]">
              {greeting}, <br/>
              <span className="text-fitti-green">{profile?.full_name?.split(' ')[0] || 'Champ'}</span>.
            </h2>
            <p className="font-accent text-xl md:text-2xl italic text-fitti-text-muted max-w-xl leading-relaxed">
              Your health metrics are updated and trackable. Here is your personalized fitness plan for today.
            </p>
          </div>
          <div className="bezel-shell w-full lg:w-72 h-32 md:h-48 group overflow-hidden">
            <div className="bezel-core h-full flex flex-col items-center justify-center relative">
              <div className="mesh-glow w-full h-full opacity-40 group-hover:scale-125 transition-transform duration-1000" />
              <Zap strokeWidth={1} className="h-12 w-12 text-fitti-green mb-2 group-hover:rotate-12 transition-transform duration-700" />
              <span className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-[0.2em]">Activity Level</span>
              <span className="font-display text-2xl font-black text-fitti-green">98%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetrical Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 stagger-v-fade">
        
        {/* Logistics Protocol - Large Card (col-span-8) */}
        <div className="md:col-span-8 bezel-shell">
          <div className="bezel-core p-8 md:p-12 h-full relative">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-fitti-green/10 flex items-center justify-center">
                  <Package strokeWidth={1.5} className="h-5 w-5 text-fitti-green" />
                </div>
                <h3 className="label-spaced !mb-0 text-sm">Delivery Status</h3>
              </div>
              <span className="font-mono text-[10px] font-bold text-fitti-green uppercase tracking-widest px-4 py-1.5 bg-fitti-green/5 rounded-full ring-1 ring-fitti-green/20">Active Order</span>
            </div>
            
            {latestOrder ? (
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <p className="font-display text-4xl md:text-6xl font-black text-fitti-text mb-4 capitalize tracking-tighter">{latestOrder.status?.replace(/_/g, ' ')}</p>
                    <p className="font-body text-base text-fitti-text-muted font-medium">Estimated arrival in <span className="text-fitti-text">15-20 minutes</span>.</p>
                  </div>
                  <div className="scale-125 origin-right">
                    <StatusBadge status={latestOrder.status} />
                  </div>
                </div>
                
                <div className="relative pt-4">
                  <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2 overflow-hidden ring-1 ring-black/5">
                    <div className="bg-fitti-green h-full rounded-full transition-all duration-1000 ease-vanguard shadow-[0_0_20px_rgba(118,185,0,0.5)]" style={{
                      width: { pending: '10%', preparing: '35%', packed: '60%', out_for_delivery: '85%', delivered: '100%' }[latestOrder.status] || '0%'
                    }} />
                  </div>
                  <div className="grid grid-cols-5 gap-1 font-mono text-[9px] font-bold text-fitti-text-muted/40 uppercase tracking-[0.2em] mt-8">
                    <span className={latestOrder.status === 'pending' ? 'text-fitti-green' : ''}>Pending</span>
                    <span className={latestOrder.status === 'preparing' ? 'text-fitti-green' : ''}>Processing</span>
                    <span className={latestOrder.status === 'packed' ? 'text-fitti-green' : ''}>Ready</span>
                    <span className={latestOrder.status === 'out_for_delivery' ? 'text-fitti-green' : ''}>In Transit</span>
                    <span className={latestOrder.status === 'delivered' ? 'text-fitti-green' : ''}>Delivered</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center">
                <Clock strokeWidth={1} className="h-16 w-16 text-fitti-border/40 mx-auto mb-6" />
                <p className="font-body text-fitti-text-muted font-bold text-lg">No active deliveries detected.</p>
              </div>
            )}
          </div>
        </div>

        {/* Biometric Snapshot - Stacked Card (col-span-4) */}
        <div className="md:col-span-4 bezel-shell">
          <div className="bezel-core p-8 h-full">
            <h3 className="label-spaced mb-10 flex items-center gap-3">
              <Activity strokeWidth={1.5} className="h-5 w-5 text-fitti-orange" /> Health Metrics
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Weight', value: customerData?.weight ? `${customerData.weight}kg` : '—', icon: <Scale strokeWidth={1} className="h-5 w-5 text-fitti-green" /> },
                { label: 'Goal', value: customerData?.goal?.replace(/_/g, ' ') || '—', icon: <Target strokeWidth={1} className="h-5 w-5 text-fitti-orange" /> },
                { label: 'Height', value: customerData?.height ? `${customerData.height}cm` : '—', icon: <TrendingUp strokeWidth={1} className="h-5 w-5 text-fitti-green" /> },
                { label: 'Pref', value: customerData?.food_preference?.replace(/_/g, ' ') || '—', icon: <Heart strokeWidth={1} className="h-5 w-5 text-fitti-green" /> }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl ring-1 ring-black/5 hover:ring-fitti-green/30 transition-all duration-700 ease-vanguard group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white dark:bg-fitti-bg-alt rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-700">{stat.icon}</div>
                     <span className="label-spaced !text-[10px] !mb-0">{stat.label}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-fitti-text group-hover:text-fitti-green transition-colors">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Large Aesthetic Card - (col-span-12) */}
        <div className="md:col-span-12 bezel-shell min-h-[300px] group overflow-hidden">
           <div className="bezel-core h-full p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative">
             <div className="mesh-glow -top-24 -left-24 w-[600px] h-[600px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
             <div className="max-w-2xl relative z-10">
               <span className="eyebrow-tag">Weekly Progress</span>
               <h3 className="font-display text-4xl md:text-6xl font-black text-fitti-text mb-6 tracking-tighter leading-none">
                 Your Health Journey is <span className="text-fitti-green">84% Complete</span>.
               </h3>
               <button className="btn-vanguard btn-vanguard-primary">
                 View Full Progress Report
                 <div className="btn-vanguard-icon-wrapper">
                   <ArrowRight strokeWidth={2} className="h-4 w-4" />
                 </div>
               </button>
             </div>
             <div className="relative h-64 w-64 flex items-center justify-center">
                <div className="absolute inset-0 border-[1px] border-fitti-green/20 rounded-full animate-spin-slow" />
                <div className="absolute inset-4 border-[1px] border-fitti-green/40 rounded-full animate-spin-slow [animation-direction:reverse]" />
                <Dumbbell strokeWidth={0.5} className="h-32 w-32 text-fitti-green opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-1000" />
             </div>
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
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    const fetchData = async () => {
      const { data: plans } = await supabase.from('diet_plans').select('*').eq('customer_id', user.id).eq('active', true).order('created_at', { ascending: false }).limit(1);
      if (plans?.[0]) setDietPlan(plans[0]);
      const { data: orders } = await supabase.from('orders').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }).limit(1);
      if (orders?.[0]) setLatestOrder(orders[0]);
      setLoading(false);
    };
    if (user) fetchData();
  }, [user]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dayMeals = dietPlan?.meal_structure?.[today] || [];

  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto space-y-12 md:space-y-24">
      {/* Header with Switcher */}
      <section className="animate-v-fade-up">
        <span className="eyebrow-tag">Nutrition Management</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-fitti-text mb-8 tracking-tighter leading-[0.9]">
              Nutrition <br/>
              <span className="text-fitti-green">Vault</span>.
            </h2>
            <p className="font-accent text-xl md:text-2xl italic text-fitti-text-muted max-w-xl leading-relaxed">
              Manage your daily nutrition and meal schedule.
            </p>
          </div>
          <div className="bezel-shell p-1 flex items-center gap-1 rounded-full">
            <button 
              onClick={() => setActiveTab('live')}
              className={`px-8 py-3 rounded-full text-xs font-black transition-all ${activeTab === 'live' ? 'bg-fitti-green text-white shadow-lg' : 'text-fitti-text-muted hover:text-fitti-text'}`}
            >
              CURRENT ORDER
            </button>
            <button 
              onClick={() => setActiveTab('weekly')}
              className={`px-8 py-3 rounded-full text-xs font-black transition-all ${activeTab === 'weekly' ? 'bg-fitti-green text-white shadow-lg' : 'text-fitti-text-muted hover:text-fitti-text'}`}
            >
              WEEKLY PLAN
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="bezel-shell h-96 shimmer" />
      ) : activeTab === 'live' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 stagger-v-fade">
          {/* Main Delivery Tracking - Bento Large */}
          <div className="md:col-span-8 bezel-shell group">
            <div className="bezel-core p-8 md:p-12 h-full relative overflow-hidden">
              <div className="mesh-glow -top-20 -right-20 opacity-20 group-hover:scale-110 transition-transform duration-1000" />
              
              <div className="flex items-center justify-between mb-16 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-fitti-green/5 flex items-center justify-center text-fitti-green ring-1 ring-fitti-green/20">
                    <ChefHat strokeWidth={1} className="h-6 w-6" />
                  </div>
                  <h3 className="label-spaced !mb-0">Active Status</h3>
                </div>
                {latestOrder && <StatusBadge status={latestOrder.status} />}
              </div>

              {latestOrder && ['preparing', 'packed', 'out_for_delivery'].includes(latestOrder.status) ? (
                <div className="space-y-16 relative z-10">
                   <div>
                     <h3 className="font-display text-5xl md:text-7xl font-black text-fitti-text mb-4 tracking-tighter leading-none">
                       Chef is <span className="text-fitti-green">{latestOrder.status === 'preparing' ? 'Preparing' : 'Shipping'}</span>
                     </h3>
                     <p className="font-body text-xl text-fitti-text-muted font-bold capitalize tracking-tight">{latestOrder.meal_plan}</p>
                   </div>

                   <div className="relative pt-4">
                      <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2.5 overflow-hidden ring-1 ring-black/5">
                        <div 
                          className="bg-fitti-green h-full rounded-full transition-all duration-1000 ease-vanguard shadow-[0_0_25px_rgba(118,185,0,0.6)]"
                          style={{ width: { preparing: '35%', packed: '65%', out_for_delivery: '90%' }[latestOrder.status] }}
                        />
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-6">
                      {[
                        { label: 'Calories', value: latestOrder.calories, icon: <Activity className="h-4 w-4" /> },
                        { label: 'Initiated', value: new Date(latestOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: <Clock className="h-4 w-4" /> },
                        { label: 'Est. Arrival', value: '15-20m', icon: <Calendar className="h-4 w-4" />, highlight: true }
                      ].map((item, i) => (
                        <div key={i} className="bg-black/5 dark:bg-white/5 p-6 rounded-[2rem] border border-black/5 group/stat hover:ring-1 hover:ring-fitti-green/30 transition-all duration-700">
                          <p className="label-spaced !text-[9px] !mb-2 opacity-50 flex items-center gap-2">{item.icon} {item.label}</p>
                          <p className={`font-display font-black text-2xl ${item.highlight ? 'text-fitti-green' : 'text-fitti-text'}`}>{item.value}</p>
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="py-32 text-center relative z-10">
                   <Utensils strokeWidth={0.5} className="h-24 w-24 text-fitti-border/40 mx-auto mb-8" />
                   <h3 className="font-display text-3xl font-black text-fitti-text mb-4">Kitchen Standby</h3>
                   <p className="font-body text-fitti-text-muted font-bold max-w-sm mx-auto">No meals are currently being prepared for delivery.</p>
                </div>
              )}
            </div>
          </div>

          {/* Daily Schedule - Bento Side */}
          <div className="md:col-span-4 bezel-shell">
            <div className="bezel-core p-8 md:p-12 h-full">
              <h3 className="label-spaced mb-12 flex items-center gap-4">
                <Calendar strokeWidth={1.5} className="h-5 w-5 text-fitti-orange" /> Daily Schedule
              </h3>
              <div className="space-y-6">
                {dayMeals.length === 0 ? (
                  <p className="font-accent italic text-fitti-text-muted">No scheduled meals for today.</p>
                ) : dayMeals.map((m, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 bg-black/5 dark:bg-white/5 rounded-[2rem] border border-black/5 hover:ring-1 hover:ring-fitti-green/30 transition-all duration-700 group">
                     <div className="h-14 w-14 rounded-2xl bg-fitti-bg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-700">
                        <Clock strokeWidth={1} className="h-6 w-6 text-fitti-orange" />
                     </div>
                     <div>
                        <p className="font-display font-black text-fitti-text text-lg leading-tight mb-1">{m.name}</p>
                        <p className="font-mono text-[10px] font-bold text-fitti-green uppercase tracking-[0.2em]">{m.time}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-24 stagger-v-fade">
           {/* Weekly Schedule Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
             {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
               const meals = dietPlan?.meal_structure?.[day] || [];
               const isToday = day === today;
               return (
                 <div key={day} className={`${isToday ? 'md:scale-105 z-10' : 'opacity-80'} bezel-shell`}>
                   <div className={`bezel-core p-6 h-full ${isToday ? 'ring-2 ring-fitti-green shadow-[0_0_50px_rgba(118,185,0,0.1)]' : ''}`}>
                     <h3 className={`font-mono text-[10px] font-black mb-6 uppercase tracking-[0.2em] ${isToday ? 'text-fitti-green' : 'text-fitti-text-muted'}`}>{day}</h3>
                     <div className="space-y-4">
                       {meals.map((m, i) => (
                         <div key={i} className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5">
                           <p className="font-display font-black text-[11px] text-fitti-text leading-tight mb-1">{m.name}</p>
                           <p className="font-mono text-[8px] text-fitti-text-muted font-bold">{m.time}</p>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>

           {/* Macro Stats - Bento Wide */}
           <div className="bezel-shell group">
             <div className="bezel-core p-12 md:p-20 relative overflow-hidden">
               <div className="mesh-glow -top-32 -right-32 w-[800px] h-[800px] opacity-10 group-hover:scale-110 transition-transform duration-1000" />
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12">
                 {[
                   { label: 'Daily Energy Target', value: `${dietPlan?.daily_calories} kcal`, highlight: true },
                   { label: 'Protein Allocation', value: `${dietPlan?.protein_grams}g` },
                   { label: 'Glycogen Reserve', value: `${dietPlan?.carb_grams}g` },
                   { label: 'Lipid Balance', value: `${dietPlan?.fat_grams}g` }
                 ].map((stat, i) => (
                   <div key={i} className="space-y-4">
                     <p className="font-mono text-[10px] font-black text-fitti-text-muted uppercase tracking-[0.3em]">{stat.label}</p>
                     <p className={`font-display text-4xl md:text-5xl font-black ${stat.highlight ? 'text-fitti-green' : 'text-fitti-text'}`}>{stat.value}</p>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

/* ── Workout Tab (with Plan & Tracker) ──────────────────── */
import confetti from 'canvas-confetti';
import { CheckCircle2, Circle } from 'lucide-react';

function WorkoutTab() {
  const user = useAuthStore(state => state.user);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      const { data } = await supabase.from('workout_plans').select('*').eq('customer_id', user.id).eq('active', true).order('created_at', { ascending: false }).limit(1);
      if (data?.[0]) setWorkoutPlan(data[0]);
      setLoading(false);
    };
    if (user) fetchPlan();
  }, [user]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysPlan = workoutPlan?.weekly_structure?.find(d => d.day === today);

  const toggleExercise = (index) => {
    setCompletedExercises(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleCompleteWorkout = () => {
    setIsCompleted(true);
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
    
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto space-y-12 md:space-y-24">
      {/* Workout Hero */}
      <section className="animate-v-fade-up">
        <span className="eyebrow-tag">Workout Plan: Active</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-fitti-text mb-8 tracking-tighter leading-[0.9]">
              Movement <br/>
              <span className="text-fitti-green">Vault</span>.
            </h2>
            <p className="font-accent text-xl md:text-2xl italic text-fitti-text-muted max-w-xl leading-relaxed">
              Execution of assigned structural stimulus and physical evolution tasks.
            </p>
          </div>
          <div className="bezel-shell w-full lg:w-72 h-32 md:h-48 group overflow-hidden">
            <div className="bezel-core h-full flex flex-col items-center justify-center relative">
              <div className="mesh-glow w-full h-full opacity-40 group-hover:scale-125 transition-transform duration-1000" />
              <Dumbbell strokeWidth={1} className="h-12 w-12 text-fitti-green mb-2" />
              <span className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-[0.2em]">Intensity Level</span>
              <span className="font-display text-2xl font-black text-fitti-green">Level 4</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tracker Bento */}
      <div className="bezel-shell group">
        <div className="bezel-core p-8 md:p-16 relative overflow-hidden min-h-[400px]">
          <div className="mesh-glow top-0 right-0 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
          
          <div className="flex items-center gap-4 mb-16 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-fitti-green/5 flex items-center justify-center text-fitti-green ring-1 ring-fitti-green/20">
              <Target strokeWidth={1} className="h-6 w-6" />
            </div>
            <h3 className="label-spaced !mb-0">Today's Exercises</h3>
          </div>
          
          {loading ? (
            <div className="h-64 shimmer rounded-[2rem]" />
          ) : !todaysPlan || !todaysPlan.exercises?.length ? (
             <div className="py-24 text-center">
               <Dumbbell strokeWidth={0.5} className="h-24 w-24 text-fitti-border/40 mx-auto mb-8" />
               <h3 className="font-display text-3xl font-black text-fitti-text mb-4">Rest Interval</h3>
               <p className="font-body text-fitti-text-muted font-bold max-w-sm mx-auto">Enjoy your rest day. No exercises assigned for {today}.</p>
             </div>
          ) : isCompleted ? (
             <div className="py-24 text-center animate-v-fade-up">
               <div className="h-32 w-32 bg-fitti-green/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-fitti-green/30">
                <Trophy strokeWidth={1} className="h-16 w-16 text-fitti-green" />
               </div>
               <h3 className="font-display text-5xl font-black text-fitti-green tracking-tighter mb-4 uppercase">Workout Complete</h3>
               <p className="font-body text-xl text-fitti-text-muted font-bold">Your daily fitness goals have been satisfied.</p>
             </div>
          ) : (
            <div className="relative z-10 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {todaysPlan.exercises.map((ex, i) => (
                  <div 
                    key={i} 
                    onClick={() => toggleExercise(i)}
                    className={`flex items-center gap-6 p-8 rounded-[2.5rem] border transition-all cursor-pointer group/item ${completedExercises.has(i) ? 'bg-fitti-green/5 border-fitti-green/30' : 'bg-black/5 dark:bg-white/5 border-black/5 hover:ring-1 hover:ring-fitti-green/30'}`}
                  >
                     <div className={`transition-all duration-500 ${completedExercises.has(i) ? 'text-fitti-green scale-110' : 'text-fitti-text-muted opacity-40 group-hover/item:opacity-100'}`}>
                       {completedExercises.has(i) ? <CheckCircle2 strokeWidth={2} className="h-8 w-8" /> : <Circle strokeWidth={1} className="h-8 w-8" />}
                     </div>
                     <div className="flex-1">
                       <p className={`font-display font-black text-2xl transition-all duration-700 ${completedExercises.has(i) ? 'text-fitti-text-muted line-through' : 'text-fitti-text'}`}>{ex.name}</p>
                       <p className="font-mono text-[10px] font-black text-fitti-text-muted uppercase tracking-[0.2em] mt-2">
                         {ex.sets} SETS <span className="text-fitti-text mx-2">×</span> {ex.reps} REPS <span className="text-fitti-green ml-4">REST {ex.rest}</span>
                       </p>
                     </div>
                  </div>
                ))}
              </div>
              
              {completedExercises.size === todaysPlan.exercises.length && (
                <button 
                  onClick={handleCompleteWorkout}
                  className="btn-vanguard btn-vanguard-primary w-full py-6 text-xl"
                >
                  Confirm Physical Evolution Complete
                  <div className="btn-vanguard-icon-wrapper">
                    <Trophy strokeWidth={2.5} className="h-5 w-5" />
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bezel-shell overflow-hidden">
        <div className="bezel-core p-8 md:p-12">
          <WorkoutTracker />
        </div>
      </div>
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
    <div className="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto space-y-12 md:space-y-24">
      {/* Health Hero */}
      <section className="animate-v-fade-up">
        <span className="eyebrow-tag">Health Record: Verified</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-fitti-text mb-8 tracking-tighter leading-[0.9]">
              Health <br/>
              <span className="text-fitti-green">Vault</span>.
            </h2>
            <p className="font-accent text-xl md:text-2xl italic text-fitti-text-muted max-w-xl leading-relaxed">
              Access your medical records and professional health summaries.
            </p>
          </div>
          <div className="bezel-shell w-full lg:w-72 h-32 md:h-48 group overflow-hidden">
            <div className="bezel-core h-full flex flex-col items-center justify-center relative">
              <div className="mesh-glow w-full h-full opacity-40 group-hover:scale-125 transition-transform duration-1000" />
              <Heart strokeWidth={1} className="h-12 w-12 text-fitti-green mb-2" />
              <span className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-[0.2em]">Vital Signs</span>
              <span className="font-display text-2xl font-black text-fitti-green">Stable</span>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="bezel-shell h-64 shimmer rounded-[2rem]" />
      ) : records.length === 0 ? (
        <div className="bezel-shell min-h-[400px] flex items-center justify-center text-center">
           <div>
             <Stethoscope strokeWidth={0.5} className="h-20 w-20 text-fitti-border/40 mx-auto mb-8" />
             <p className="font-body text-xl font-black text-fitti-text-muted uppercase tracking-widest">No medical records found.</p>
           </div>
        </div>
      ) : (
        <div className="space-y-12 stagger-v-fade">
          {records.map(r => (
            <div key={r.id} className="bezel-shell group">
              <div className="bezel-core p-8 md:p-12 relative overflow-hidden">
                <div className="mesh-glow opacity-5 group-hover:opacity-10 transition-opacity duration-1000" />
                
                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-fitti-green/5 flex items-center justify-center text-fitti-green ring-1 ring-fitti-green/20">
                      <ShieldCheck strokeWidth={1} className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="label-spaced !mb-0 text-xs">Professional Assessment</h3>
                      <p className="font-mono text-[10px] text-fitti-text-muted font-bold">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-16 relative z-10">
                   <p className="font-accent text-3xl md:text-5xl text-fitti-text leading-tight tracking-tighter italic">"{r.health_summary}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                  {[
                    { label: 'Conditions', value: r.conditions, color: 'text-fitti-text' },
                    { label: 'Medications', value: r.medications, color: 'text-fitti-green' },
                    { label: 'Work Restrictions', value: r.workout_restrictions, color: 'text-fitti-orange' },
                    { label: 'Dietary Limits', value: r.dietary_restrictions, color: 'text-fitti-green' }
                  ].map((item, i) => item.value && (
                    <div key={i} className="bg-black/5 dark:bg-white/5 p-8 rounded-[2.5rem] border border-black/5 hover:ring-1 hover:ring-fitti-green/30 transition-all duration-700">
                      <p className="font-mono text-[9px] font-black text-fitti-text-muted uppercase tracking-[0.3em] mb-4">{item.label}</p>
                      <p className={`font-display font-black text-lg ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
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
      const { data: workouts } = await supabase.from('workout_logs').select('created_at, total_calories').eq('user_id', user.id).order('created_at', { ascending: true });
      const wMap = {};
      (workouts || []).forEach(w => {
        const date = new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        wMap[date] = (wMap[date] || 0) + (w.total_calories || 0);
      });
      const formattedWorkouts = Object.keys(wMap).map(date => ({ date, calories: wMap[date] }));
      const { data: progress } = await supabase.from('progress_logs').select('logged_at, weight, energy_level, diet_adherence, notes').eq('customer_id', user.id).order('logged_at', { ascending: true });
      const formattedProgress = (progress || []).map(p => ({
        date: new Date(p.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: p.weight, energy: p.energy_level, diet: p.diet_adherence, notes: p.notes
      }));
      setWorkoutData(formattedWorkouts);
      setProgressData(formattedProgress);
      setLoading(false);
    };
    fetchProgress();
  }, [user]);

  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto space-y-12 md:space-y-24">
      {/* Progress Hero */}
      <section className="animate-v-fade-up">
        <span className="eyebrow-tag">Progress: Ascending</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-fitti-text mb-8 tracking-tighter leading-[0.9]">
              Evolution <br/>
              <span className="text-fitti-green">Metrics</span>.
            </h2>
            <p className="font-accent text-xl md:text-2xl italic text-fitti-text-muted max-w-xl leading-relaxed">
              Track your health improvements and activity data.
            </p>
          </div>
          <div className="bezel-shell w-full lg:w-72 h-32 md:h-48 group overflow-hidden">
            <div className="bezel-core h-full flex flex-col items-center justify-center relative">
              <div className="mesh-glow w-full h-full opacity-40 group-hover:scale-125 transition-transform duration-1000" />
              <TrendingUp strokeWidth={1} className="h-12 w-12 text-fitti-green mb-2" />
              <span className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-[0.2em]">Goal Achievement</span>
              <span className="font-display text-2xl font-black text-fitti-green">+12.4%</span>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="bezel-shell h-96 shimmer rounded-[2rem]" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 stagger-v-fade">
          
          {/* Caloric Burn - Bento Side */}
          <div className="md:col-span-6 bezel-shell">
            <div className="bezel-core p-8 md:p-12 h-full">
              <h3 className="label-spaced mb-10 flex items-center gap-3">
                <Zap strokeWidth={1.5} className="h-5 w-5 text-fitti-orange" /> Activity Level
              </h3>
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
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7b68', fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7b68', fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: '#fff' }} />
                    <Area type="monotone" dataKey="calories" stroke="#76B900" strokeWidth={4} fillOpacity={1} fill="url(#colorCalories)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Weight Trend - Bento Side */}
          <div className="md:col-span-6 bezel-shell">
            <div className="bezel-core p-8 md:p-12 h-full">
              <h3 className="label-spaced mb-10 flex items-center gap-3">
                <Scale strokeWidth={1.5} className="h-5 w-5 text-fitti-green" /> Weight Trend
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7b68', fontWeight: 'bold' }} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7b68', fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: '#fff' }} />
                    <Line type="monotone" dataKey="weight" stroke="#111" strokeWidth={4} dot={{ stroke: '#111', strokeWidth: 3, fill: '#fff', r: 5 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Logs - Bento Large */}
          <div className="md:col-span-12 bezel-shell">
            <div className="bezel-core p-8 md:p-16">
              <h3 className="label-spaced mb-12 flex items-center gap-3">
                <ShieldCheck strokeWidth={1.5} className="h-5 w-5 text-fitti-green" /> Progress History
              </h3>
              <div className="space-y-6">
                {[...progressData].reverse().map((log, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/5 hover:ring-1 hover:ring-fitti-green/30 transition-all duration-700 group">
                    <div className="mb-6 md:mb-0">
                      <span className="font-mono text-[10px] font-black text-fitti-text-muted uppercase tracking-[0.2em] mb-2 block">{log.date}</span>
                      <p className="font-accent text-2xl text-fitti-text font-bold italic tracking-tight">"{log.notes || 'System performance within normal parameters.'}"</p>
                    </div>
                    <div className="flex gap-6">
                       {[
                         { label: 'Energy', value: log.energy },
                         { label: 'Diet', value: log.diet }
                       ].map((m, j) => (
                         <div key={j} className="text-center bg-white dark:bg-fitti-bg p-5 rounded-2xl min-w-[100px] shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform duration-700">
                           <p className="text-[9px] font-mono text-fitti-text-muted font-black uppercase mb-1">{m.label}</p>
                           <p className="font-display font-black text-2xl text-fitti-text">{m.value || '-'}<span className="text-[10px] opacity-30">/10</span></p>
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────── */
/* ── Main Dashboard ───────────────────────────────────── */
export default function CustomerDashboard() {
  const user = useAuthStore(state => state.user);
  
  return (
    <div className="flex min-h-[100dvh] bg-fitti-bg relative overflow-hidden">
      {/* Global Grain Texture Overlay */}
      <div className="grain-overlay" />
      
      <FloatingBackground role="customer" />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="" />
        <main className="flex-1 overflow-y-auto pb-24">
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
