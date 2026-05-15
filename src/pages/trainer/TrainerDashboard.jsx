import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Users, Dumbbell, TrendingUp, Target, Flame, Plus, X, Save, Activity, Clock, Zap, ChefHat, Apple, ArrowRight } from 'lucide-react';
import { supabase, createNotification } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import Sidebar from '../../components/shared/Sidebar';
import Navbar from '../../components/shared/Navbar';
import FloatingBackground from '../../components/shared/FloatingBackground';
import MessagingView from '../../components/chat/MessagingView';
import Modal from '../../components/shared/Modal';
import WorkoutTracker from '../../components/workout/WorkoutTracker';

function CreateWorkoutModal({ customer, trainerId, onClose, onSaved }) {
  const [plan, setPlan] = useState({ intensity:'moderate', days:[{ day:'Monday', exercises:[{ name:'', sets:'', reps:'', rest:'' }] }] });
  const [saving, setSaving] = useState(false);
  const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const addDay = () => setPlan(p => ({...p, days:[...p.days, { day: dayNames[p.days.length%7], exercises:[{ name:'', sets:'', reps:'', rest:'' }] }]}));
  const addExercise = (di) => setPlan(p => ({...p, days: p.days.map((d,i) => i===di ? {...d, exercises:[...d.exercises,{ name:'', sets:'', reps:'', rest:'' }]} : d)}));
  const updateEx = (di,ei,f,v) => setPlan(p => ({...p, days: p.days.map((d,i) => i===di ? {...d, exercises: d.exercises.map((e,j) => j===ei ? {...e,[f]:v} : e)} : d)}));

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('workout_plans').insert([{ customer_id: customer.id, trainer_id: trainerId, weekly_structure: plan.days, intensity: plan.intensity, active: true }]);
    await supabase.from('activity_feed').insert([{ actor_id: trainerId, actor_role:'trainer', customer_id: customer.id, event_type:'workout_plan_created', event_data: { days: plan.days.length } }]);
    setSaving(false); onSaved(); onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-bold text-fitti-text">Create Workout Plan</h3>
          <p className="font-body text-sm text-fitti-text-muted">For {customer.name}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-fitti-bg rounded-full transition-colors"><X className="h-5 w-5 text-fitti-text-muted"/></button>
      </div>
      <div className="mb-4">
        <label className="label-spaced block mb-2">Intensity</label>
        <select value={plan.intensity} onChange={e=>setPlan(p=>({...p,intensity:e.target.value}))} className="w-full bg-white border-2 border-fitti-border rounded-xl px-4 py-3 font-body focus:border-fitti-green focus:outline-none transition-colors">
          <option value="light">Light</option><option value="moderate">Moderate</option><option value="intense">Intense</option><option value="extreme">Extreme</option>
        </select>
      </div>
      {plan.days.map((day,di) => (
        <div key={di} className="bg-fitti-bg/50 rounded-xl p-4 mb-3 border border-fitti-border/30">
          <div className="flex items-center justify-between mb-3">
            <select value={day.day} onChange={e=>setPlan(p=>({...p,days:p.days.map((d,i)=>i===di?{...d,day:e.target.value}:d)}))} className="bg-white border border-fitti-border rounded-lg px-3 py-1.5 text-sm font-display font-bold focus:border-fitti-green focus:outline-none">
              {dayNames.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={()=>addExercise(di)} className="font-mono text-xs text-fitti-green font-semibold flex items-center gap-1 hover:text-fitti-green-dark transition-colors"><Plus className="h-3 w-3"/>Exercise</button>
          </div>
          {day.exercises.map((ex,ei) => (
            <div key={ei} className="grid grid-cols-4 gap-2 mb-2">
              <input placeholder="Exercise" value={ex.name} onChange={e=>updateEx(di,ei,'name',e.target.value)} className="bg-white border border-fitti-border rounded-lg px-2 py-1.5 text-xs font-body focus:border-fitti-green focus:outline-none transition-colors"/>
              <input placeholder="Sets" type="number" value={ex.sets} onChange={e=>updateEx(di,ei,'sets',e.target.value)} className="bg-white border border-fitti-border rounded-lg px-2 py-1.5 text-xs font-mono focus:border-fitti-green focus:outline-none transition-colors"/>
              <input placeholder="Reps" type="number" value={ex.reps} onChange={e=>updateEx(di,ei,'reps',e.target.value)} className="bg-white border border-fitti-border rounded-lg px-2 py-1.5 text-xs font-mono focus:border-fitti-green focus:outline-none transition-colors"/>
              <input placeholder="Rest(s)" value={ex.rest} onChange={e=>updateEx(di,ei,'rest',e.target.value)} className="bg-white border border-fitti-border rounded-lg px-2 py-1.5 text-xs font-mono focus:border-fitti-green focus:outline-none transition-colors"/>
            </div>
          ))}
        </div>
      ))}
      <button onClick={addDay} className="mb-4 font-mono text-sm text-fitti-green font-semibold flex items-center gap-1 hover:text-fitti-green-dark transition-colors"><Plus className="h-4 w-4"/>Add Day</button>
      <button onClick={handleSave} disabled={saving} className="w-full btn-gradient flex items-center justify-center gap-2 py-3.5 disabled:opacity-50">
        <Save className="h-4 w-4"/><span className="font-display font-bold">{saving ? 'Saving...' : 'Save Workout Plan'}</span>
      </button>
    </Modal>
  );
}

/* ── Nutritional Strategy Modal ───────────────────────── */
function NutritionalStrategyModal({ customer, onClose, onSaved, trainerId }) {
  const [strategy, setStrategy] = useState({
    target_calories: 2000,
    target_protein: 150,
    target_carbs: 200,
    target_fat: 60,
    meal_targets: [
      { name: 'Breakfast', time: '08:00', calories: 500, protein: 40, carbs: 50, fat: 15 },
      { name: 'Lunch', time: '13:00', calories: 700, protein: 50, carbs: 70, fat: 20 },
      { name: 'Dinner', time: '20:00', calories: 600, protein: 40, carbs: 60, fat: 15 }
    ],
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const addMeal = () => setStrategy(s => ({
    ...s,
    meal_targets: [...s.meal_targets, { name: '', time: '12:00', calories: 0, protein: 0, carbs: 0, fat: 0 }]
  }));

  const updateMeal = (idx, field, val) => setStrategy(s => ({
    ...s,
    meal_targets: s.meal_targets.map((m, i) => i === idx ? { ...m, [field]: val } : m)
  }));

  const removeMeal = (idx) => setStrategy(s => ({
    ...s,
    meal_targets: s.meal_targets.filter((_, i) => i !== idx)
  }));

  const totalCals = strategy.meal_targets.reduce((acc, m) => acc + (parseInt(m.calories) || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('nutritional_strategies').update({ active: false }).eq('customer_id', customer.id);
    
    const { error } = await supabase.from('nutritional_strategies').insert([{
      customer_id: customer.id,
      trainer_id: trainerId,
      target_calories: totalCals || strategy.target_calories,
      target_protein: strategy.target_protein,
      target_carbs: strategy.target_carbs,
      target_fat: strategy.target_fat,
      meal_targets: strategy.meal_targets,
      active: true
    }]);

    if (!error) {
      await supabase.from('activity_feed').insert([{
        actor_id: trainerId,
        actor_role: 'trainer',
        customer_id: customer.id,
        event_type: 'nutritional_strategy_created',
        event_data: { calories: totalCals, meals: strategy.meal_targets.length }
      }]);
      onSaved();
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-3xl animate-v-fade-up p-4">
      <div className="bezel-shell max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="bezel-core p-8 md:p-12 relative flex-1 overflow-y-auto custom-scrollbar">
          <div className="mesh-glow -top-24 -left-24 opacity-20" />
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="eyebrow-tag">Clinical Strategy</span>
              <h2 className="logo-fitti text-4xl leading-none uppercase tracking-tighter">Nutritional Protocol.</h2>
              <p className="font-accent text-lg italic text-fitti-text-muted mt-2">Meal distribution schedule for {customer.name}</p>
            </div>
            <button onClick={onClose} className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-8 mb-12">
            <div className="flex items-center justify-between">
              <label className="eyebrow-tag !mb-0">Meal Distribution & Targets</label>
              <button onClick={addMeal} className="btn-vanguard py-2 px-4 text-[10px] !bg-fitti-green/10 !text-fitti-green">
                <Plus className="h-3 w-3" /> Add Meal Slot
              </button>
            </div>

            {strategy.meal_targets.map((m, idx) => (
              <div key={idx} className="bezel-shell group">
                <div className="bezel-core p-6 space-y-6 relative">
                  <button onClick={() => removeMeal(idx)} className="absolute top-4 right-4 p-2 bg-black/5 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label-spaced !text-[9px] !mb-2">Meal Designation</label>
                      <input type="text" value={m.name} onChange={e=>updateMeal(idx, 'name', e.target.value)}
                        placeholder="e.g. Breakfast" className="w-full bg-white/5 border border-fitti-border/20 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-fitti-green/50 outline-none" />
                    </div>
                    <div>
                      <label className="label-spaced !text-[9px] !mb-2">Scheduled Time</label>
                      <input type="time" value={m.time} onChange={e=>updateMeal(idx, 'time', e.target.value)}
                        className="w-full bg-white/5 border border-fitti-border/20 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-fitti-green/50 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { f: 'calories', l: 'Calories', u: 'kcal' },
                      { f: 'protein', l: 'Protein', u: 'g' },
                      { f: 'carbs', l: 'Carbs', u: 'g' },
                      { f: 'fat', l: 'Fat', u: 'g' }
                    ].map(field => (
                      <div key={field.f}>
                        <label className="font-mono text-[8px] font-black text-fitti-text-muted uppercase tracking-widest block mb-1">{field.l} ({field.u})</label>
                        <input type="number" value={m[field.f]} onChange={e=>updateMeal(idx, field.f, parseInt(e.target.value))}
                          className="w-full bg-white/5 border border-fitti-border/20 rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-fitti-green/50 outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bezel-shell !bg-fitti-green/5">
              <div className="bezel-core p-8">
                <span className="label-spaced !text-[10px] !mb-2 block opacity-60">Daily Nutritional Target</span>
                <p className="font-display font-black text-4xl text-fitti-green">{totalCals} <span className="text-sm uppercase font-mono tracking-widest opacity-40">kcal</span></p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="label-spaced !text-[10px]">Nutritional Directives</label>
              <textarea value={strategy.notes} onChange={e=>setStrategy({...s, notes: e.target.value})} rows={3}
                placeholder="Specific clinical directives for the kitchen..."
                className="w-full bg-white/5 border border-fitti-border/20 rounded-2xl px-6 py-4 font-body text-sm focus:ring-1 focus:ring-fitti-green/50 outline-none resize-none" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-vanguard btn-vanguard-primary w-full py-5 text-lg justify-center shadow-2xl shadow-fitti-green/20">
            <span className="font-display font-black tracking-tight">{saving ? 'Transmitting Protocol...' : 'Save Nutritional Protocol'}</span>
            {!saving && <div className="btn-vanguard-icon-wrapper"><ArrowRight strokeWidth={2.5} className="h-4 w-4" /></div>}
          </button>
        </div>
      </div>
    </div>
  );
}

function LogProgressModal({ customer, trainerId, onClose, onSaved }) {
  const [tab, setTab] = useState('stats'); // 'stats' or 'log'
  const [log, setLog] = useState({ weight:'', energy_level:'', diet_adherence:'', workout_performance:'good', notes:'' });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ caloriesBurned: 0, caloriesConsumed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch recent workout logs for burned calories
      const { data: workouts } = await supabase.from('workout_logs').select('total_calories').eq('user_id', customer.id).order('created_at', { ascending: false }).limit(10);
      const burned = (workouts || []).reduce((acc, curr) => acc + (curr.total_calories || 0), 0);
      
      // Fetch recent orders for consumed calories
      const { data: orders } = await supabase.from('orders').select('calories').eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(10);
      const consumed = (orders || []).reduce((acc, curr) => acc + (curr.calories || 0), 0);
      
      setStats({ caloriesBurned: burned, caloriesConsumed: consumed });
    };
    fetchStats();
  }, [customer.id]);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('progress_logs').insert([{ customer_id: customer.id, trainer_id: trainerId, weight: parseFloat(log.weight)||null, energy_level: parseInt(log.energy_level)||null, diet_adherence: parseInt(log.diet_adherence)||null, workout_performance: log.workout_performance, notes: log.notes }]);
    await supabase.from('activity_feed').insert([{ actor_id: trainerId, actor_role:'trainer', customer_id: customer.id, event_type:'progress_logged', event_data: log }]);
    setSaving(false); onSaved(); onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-bold text-fitti-text">Client Progress</h3>
          <p className="font-body text-sm text-fitti-text-muted">For {customer.name}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-fitti-bg rounded-full transition-colors"><X className="h-5 w-5 text-fitti-text-muted"/></button>
      </div>

      <div className="flex bg-fitti-bg p-1 rounded-xl mb-6">
        <button onClick={() => setTab('stats')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'stats' ? 'bg-white shadow-sm text-fitti-green' : 'text-fitti-text-muted'}`}>Statistics</button>
        <button onClick={() => setTab('log')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'log' ? 'bg-white shadow-sm text-fitti-green' : 'text-fitti-text-muted'}`}>Log Progress</button>
      </div>

      {tab === 'stats' ? (
        <div className="space-y-4">
          <div className="card-glass p-6 text-center border border-fitti-orange/20 bg-orange-50/50">
            <Flame className="h-8 w-8 text-fitti-orange mx-auto mb-2" />
            <p className="font-mono text-xs font-bold text-fitti-text-muted uppercase tracking-widest mb-1">Recent Calories Burned</p>
            <p className="font-display text-4xl font-black text-fitti-orange">{stats.caloriesBurned} <span className="text-sm">kcal</span></p>
            <p className="text-[10px] text-fitti-text-muted mt-2">From recent tracked workouts</p>
          </div>
          <div className="card-glass p-6 text-center border border-fitti-green/20 bg-fitti-green/5">
            <ChefHat className="h-8 w-8 text-fitti-green mx-auto mb-2" />
            <p className="font-mono text-xs font-bold text-fitti-text-muted uppercase tracking-widest mb-1">Recent Calories Consumed</p>
            <p className="font-display text-4xl font-black text-fitti-green">{stats.caloriesConsumed} <span className="text-sm">kcal</span></p>
            <p className="text-[10px] text-fitti-text-muted mt-2">From ordered Fitti meals</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-spaced block mb-1">Weight (kg)</label><input type="number" step="0.1" value={log.weight} onChange={e=>setLog(p=>({...p,weight:e.target.value}))} className="w-full bg-white border-2 border-fitti-border rounded-xl px-4 py-3 font-mono focus:border-fitti-green focus:outline-none transition-colors"/></div>
            <div><label className="label-spaced block mb-1">Performance</label><select value={log.workout_performance} onChange={e=>setLog(p=>({...p,workout_performance:e.target.value}))} className="w-full bg-white border-2 border-fitti-border rounded-xl px-4 py-3 font-body focus:border-fitti-green focus:outline-none transition-colors"><option value="excellent">Excellent</option><option value="good">Good</option><option value="average">Average</option><option value="poor">Poor</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-spaced block mb-1">Energy (1-10)</label><input type="number" min="1" max="10" value={log.energy_level} onChange={e=>setLog(p=>({...p,energy_level:e.target.value}))} className="w-full bg-white border-2 border-fitti-border rounded-xl px-4 py-3 font-mono focus:border-fitti-green focus:outline-none transition-colors"/></div>
            <div><label className="label-spaced block mb-1">Diet Adherence (1-10)</label><input type="number" min="1" max="10" value={log.diet_adherence} onChange={e=>setLog(p=>({...p,diet_adherence:e.target.value}))} className="w-full bg-white border-2 border-fitti-border rounded-xl px-4 py-3 font-mono focus:border-fitti-green focus:outline-none transition-colors"/></div>
          </div>
          <div><label className="label-spaced block mb-1">Notes</label><textarea value={log.notes} onChange={e=>setLog(p=>({...p,notes:e.target.value}))} rows="3" className="w-full bg-white border-2 border-fitti-border rounded-xl px-4 py-3 font-body focus:border-fitti-green focus:outline-none resize-none transition-colors"/></div>
          <button onClick={handleSave} disabled={saving} className="mt-6 w-full btn-gradient flex items-center justify-center gap-2 py-3.5 disabled:opacity-50">
            <Save className="h-4 w-4"/><span className="font-display font-bold">{saving ? 'Saving...' : 'Save Progress Log'}</span>
          </button>
        </div>
      )}
    </Modal>
  );
}

function ViewWorkoutsModal({ customer, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.from('workout_logs').select('*').eq('user_id', customer.id).order('created_at', { ascending: false });
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, [customer.id]);

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-bold text-fitti-text">Workout History</h3>
          <p className="font-body text-sm text-fitti-text-muted">Tracked by {customer.name}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-fitti-bg rounded-full transition-colors"><X className="h-5 w-5 text-fitti-text-muted"/></button>
      </div>
      
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-fitti-bg rounded-xl shimmer"/>)}</div>
      ) : logs.length === 0 ? (
        <div className="p-10 text-center card-glass bg-fitti-bg/50">
           <Activity className="h-12 w-12 text-fitti-text-muted mx-auto mb-3" />
           <p className="font-bold text-fitti-text-muted">No workouts logged yet.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
          {logs.map(log => (
            <div key={log.id} className="bg-fitti-bg/50 rounded-xl p-4 border border-fitti-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-fitti-text uppercase">{log.exercises?.[0]?.name || 'Custom Workout'}</span>
                <span className="font-mono text-[10px] text-fitti-text-muted">{new Date(log.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-fitti-text-muted">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {log.total_time}m</span>
                <span className="flex items-center gap-1 text-fitti-orange"><Flame className="h-3 w-3" /> {log.total_calories} kcal</span>
                {log.total_sets > 0 && <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {log.total_sets} sets</span>}
              </div>
              {log.notes && <p className="mt-2 text-xs font-body italic text-fitti-text-muted bg-white p-2 rounded-lg border border-fitti-border/30">"{log.notes}"</p>}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function ClientsTab({ onOpenWorkout, onOpenStrategy, onOpenProgress, onOpenLogWorkout }) {
  const user = useAuthStore(state => state.user);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const f = async () => {
      const { data } = await supabase.from('customers').select('*, profiles!customers_id_fkey(full_name, email)').eq('assigned_trainer', user.id);
      setClients((data||[]).map(c => ({...c, name: c.profiles?.full_name||'Unknown', email: c.profiles?.email })));
      setLoading(false);
    };
    if(user) f();
  }, [user]);

  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto space-y-12 md:space-y-24">
      {/* Header Section */}
      <section className="animate-v-fade-up">
        <span className="eyebrow-tag">Trainer Overview</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-fitti-text mb-8 tracking-tighter leading-[0.9]">
              Trainer <br/>
              <span className="text-fitti-green">Dashboard</span>.
            </h2>
            <p className="font-accent text-xl md:text-2xl italic text-fitti-text-muted max-w-xl leading-relaxed">
              Managing {clients.length} active clients. Every data point is an opportunity for progress.
            </p>
          </div>
          <div className="bezel-shell w-full lg:w-72 h-32 md:h-48 group overflow-hidden">
            <div className="bezel-core h-full flex flex-col items-center justify-center relative text-center">
              <div className="mesh-glow w-full h-full opacity-40 group-hover:scale-125 transition-transform duration-1000" />
              <Users strokeWidth={1} className="h-10 w-10 text-fitti-green mb-2" />
              <span className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-[0.2em]">Active Clients</span>
              <span className="font-display text-2xl font-black text-fitti-green">{clients.length}</span>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1,2,3,4].map(i=><div key={i} className="bezel-shell h-64 shimmer"/>)}
        </div>
      ) : clients.length===0 ? (
        <div className="bezel-shell min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Users strokeWidth={1} className="h-20 w-20 text-fitti-border/40 mx-auto mb-6" />
            <p className="font-body text-fitti-text-muted font-bold text-xl uppercase tracking-widest">No clients assigned to your account.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 stagger-v-fade">
          {clients.map((c, idx) => (
            <div key={c.id} className="md:col-span-6 bezel-shell group">
              <div className="bezel-core p-8 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 mesh-glow opacity-5 group-hover:opacity-20 transition-opacity duration-1000" />
                
                <div className="flex items-center gap-6 mb-10">
                  <div className="h-16 w-16 rounded-2xl bg-fitti-green/10 flex items-center justify-center text-fitti-green font-display font-black text-2xl ring-1 ring-fitti-green/20 group-hover:bg-fitti-green group-hover:text-white transition-all duration-700 ease-vanguard">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-fitti-text text-2xl tracking-tight leading-none mb-1">{c.name}</h3>
                    <p className="font-mono text-[10px] text-fitti-text-muted uppercase tracking-[0.2em]">{c.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10">
                  {[
                    { label: 'Weight', value: c.weight?`${c.weight}kg`:'—' },
                    { label: 'Height', value: c.height?`${c.height}cm`:'—' },
                    { label: 'Primary Goal', value: c.goal?.replace(/_/g,' ')||'—', isGoal: true }
                  ].map((stat, i) => (
                    <div key={i} className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 ring-1 ring-black/5 text-center">
                      <p className="label-spaced !text-[9px] !mb-2 opacity-50">{stat.label}</p>
                      <p className={`font-display font-bold ${stat.isGoal ? 'text-[10px] text-fitti-green uppercase' : 'text-sm text-fitti-text'}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <button onClick={()=>onOpenWorkout(c)} className="btn-vanguard btn-vanguard-secondary text-[10px] py-4 group/btn">
                    <Dumbbell strokeWidth={2} className="h-3 w-3 group-hover/btn:scale-125 transition-transform" />
                    Workouts
                  </button>
                  <button onClick={()=>onOpenStrategy(c)} className="btn-vanguard text-[10px] py-4 group/btn bg-fitti-orange/5 text-fitti-orange ring-1 ring-fitti-orange/20">
                    <Apple strokeWidth={2} className="h-3 w-3 group-hover/btn:scale-125 transition-transform" />
                    Strategy
                  </button>
                  <button onClick={()=>onOpenLogWorkout(c)} className="btn-vanguard text-[10px] py-4 group/btn">
                    <Activity strokeWidth={2} className="h-3 w-3 group-hover/btn:scale-125 transition-transform" />
                    History
                  </button>
                  <button onClick={()=>onOpenProgress(c)} className="btn-vanguard btn-vanguard-primary text-[10px] py-4 group/btn">
                    <TrendingUp strokeWidth={2} className="h-3 w-3 group-hover/btn:scale-125 transition-transform" />
                    Metrics
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkoutsTab() {
  const user = useAuthStore(state => state.user);
  const [plans, setPlans] = useState([]);
  useEffect(() => {
    const f = async () => {
      const { data } = await supabase.from('workout_plans').select('*').eq('trainer_id', user.id).order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const ids = [...new Set(data.map(p => p.customer_id))];
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids);
        const nameMap = Object.fromEntries((profiles||[]).map(p => [p.id, p.full_name]));
        setPlans(data.map(p => ({...p, customer_name: nameMap[p.customer_id]||'Unknown'})));
      }
    };
    if(user) f();
  }, [user]);

  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto space-y-12 md:space-y-24">
      {/* Header Section */}
      <section className="animate-v-fade-up">
        <span className="eyebrow-tag">Active Programs</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-fitti-text mb-8 tracking-tighter leading-[0.9]">
              Workout <br/>
              <span className="text-fitti-green">Schedules</span>.
            </h2>
            <p className="font-accent text-xl md:text-2xl italic text-fitti-text-muted max-w-xl leading-relaxed">
              Client workout schedules. Structured programming for optimal progress.
            </p>
          </div>
          <div className="bezel-shell w-full lg:w-72 h-32 md:h-48 group overflow-hidden">
            <div className="bezel-core h-full flex flex-col items-center justify-center relative text-center">
              <div className="mesh-glow w-full h-full opacity-40 group-hover:scale-125 transition-transform duration-1000" />
              <Dumbbell strokeWidth={1} className="h-10 w-10 text-fitti-green mb-2" />
              <span className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-[0.2em]">Active Plans</span>
              <span className="font-display text-2xl font-black text-fitti-green">{plans.length}</span>
            </div>
          </div>
        </div>
      </section>
      
      {plans.length===0 ? (
        <div className="bezel-shell min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Dumbbell strokeWidth={1} className="h-20 w-20 text-fitti-border/40 mx-auto mb-6"/>
            <p className="font-body text-fitti-text-muted font-bold text-xl uppercase tracking-widest">No active programs discovered.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-12 stagger-v-fade">
          {plans.map((p, idx) => {
            const days = Array.isArray(p.weekly_structure) ? p.weekly_structure : [];
            return (
              <div key={p.id} className="bezel-shell group overflow-hidden">
                <div className="bezel-core p-8 md:p-12 h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 mesh-glow opacity-5 group-hover:opacity-10 transition-opacity duration-1000" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-fitti-green/10 flex items-center justify-center text-fitti-green font-display font-black text-2xl ring-1 ring-fitti-green/20">
                        {p.customer_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-display font-black text-fitti-text text-3xl tracking-tight leading-none mb-2">{p.customer_name}</h3>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] font-bold px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full text-fitti-text-muted uppercase tracking-widest">{p.intensity}</span>
                          <span className={`font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${p.active?'bg-fitti-green/10 text-fitti-green':'bg-fitti-bg text-fitti-text-muted'}`}>{p.active?'Active':'Inactive'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {days.map((d,i) => (
                      <div key={i} className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 ring-1 ring-black/5 hover:ring-fitti-green/30 transition-all duration-500">
                        <p className="font-display font-black text-fitti-green text-xs uppercase tracking-[0.2em] mb-4 border-b border-fitti-green/10 pb-2">{d.day}</p>
                        <div className="space-y-3">
                          {(d.exercises||[]).map((e,j)=>(
                            <div key={j} className="flex flex-col">
                              <span className="font-body font-bold text-fitti-text text-sm mb-1">{e.name||'Rest Day'}</span>
                              {e.name && (
                                <span className="font-mono text-[9px] text-fitti-text-muted uppercase tracking-widest">
                                  {e.sets} Sets <span className="mx-1 text-fitti-green opacity-30">|</span> {e.reps} Reps
                                </span>
                              )}
                            </div>
                          ))}
                          {(d.exercises||[]).length === 0 && <p className="font-body text-xs italic text-fitti-text-muted">No activities assigned.</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProgressTab() {
  const user = useAuthStore(state => state.user);
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const f = async () => {
      const { data } = await supabase.from('progress_logs').select('*').eq('trainer_id', user.id).order('logged_at', { ascending: false });
      if (data && data.length > 0) {
        const ids = [...new Set(data.map(l => l.customer_id))];
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids);
        const nameMap = Object.fromEntries((profiles||[]).map(p => [p.id, p.full_name]));
        setLogs(data.map(l => ({...l, customer_name: nameMap[l.customer_id]||'Unknown'})));
      }
    };
    if(user) f();
  }, [user]);

  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto space-y-12 md:space-y-24">
      {/* Header Section */}
      <section className="animate-v-fade-up">
        <span className="eyebrow-tag">Analytical Insights</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-fitti-text mb-8 tracking-tighter leading-[0.9]">
              Progress <br/>
              <span className="text-fitti-green">Tracking</span>.
            </h2>
            <p className="font-accent text-xl md:text-2xl italic text-fitti-text-muted max-w-xl leading-relaxed">
              Monitor client progress. Data-driven insights for professional health management.
            </p>
          </div>
          <div className="bezel-shell w-full lg:w-72 h-32 md:h-48 group overflow-hidden">
            <div className="bezel-core h-full flex flex-col items-center justify-center relative text-center">
              <div className="mesh-glow w-full h-full opacity-40 group-hover:scale-125 transition-transform duration-1000" />
              <TrendingUp strokeWidth={1} className="h-10 w-10 text-fitti-green mb-2" />
              <span className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-[0.2em]">Total Logs</span>
              <span className="font-display text-2xl font-black text-fitti-green">{logs.length}</span>
            </div>
          </div>
        </div>
      </section>
      
      {logs.length===0 ? (
        <div className="bezel-shell min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Target strokeWidth={1} className="h-20 w-20 text-fitti-border/40 mx-auto mb-6"/>
            <p className="font-body text-fitti-text-muted font-bold text-xl uppercase tracking-widest">No progress metrics discovered.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-12 stagger-v-fade">
          {logs.map((l, idx) => (
            <div key={l.id} className="bezel-shell group overflow-hidden">
              <div className="bezel-core p-8 md:p-12 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 mesh-glow opacity-5 group-hover:opacity-10 transition-opacity duration-1000" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-fitti-green/10 flex items-center justify-center text-fitti-green font-display font-black text-2xl ring-1 ring-fitti-green/20">
                      {l.customer_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-fitti-text text-3xl tracking-tight leading-none mb-2">{l.customer_name}</h3>
                      <p className="font-mono text-[10px] text-fitti-text-muted uppercase tracking-[0.2em]">{new Date(l.logged_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {[
                    { label: 'Weight', value: l.weight?`${l.weight}kg`:'—' },
                    { label: 'Energy', value: l.energy_level?`${l.energy_level}/10`:'—' },
                    { label: 'Diet', value: l.diet_adherence?`${l.diet_adherence}/10`:'—' },
                    { label: 'Performance', value: l.workout_performance||'—', isHighlight: true }
                  ].map((stat, i) => (
                    <div key={i} className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 ring-1 ring-black/5 text-center">
                      <p className="label-spaced !text-[9px] !mb-3 opacity-50">{stat.label}</p>
                      <p className={`font-display font-bold ${stat.isHighlight ? 'text-sm text-fitti-green uppercase' : 'text-lg text-fitti-text'}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {l.notes && (
                  <div className="bg-fitti-bg/50 rounded-2xl p-6 border border-fitti-border/30 relative">
                    <div className="absolute top-4 left-4 font-mono text-[8px] font-black text-fitti-green uppercase tracking-widest opacity-40">Notes</div>
                    <p className="font-body text-sm text-fitti-text-muted mt-4 leading-relaxed italic">"{l.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrainerDashboard() {
  const [showWorkout, setShowWorkout] = useState(null);
  const [showStrategy, setShowStrategy] = useState(null);
  const [showProgress, setShowProgress] = useState(null);
  const [showLogWorkout, setShowLogWorkout] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const user = useAuthStore(state => state.user);
  
  return (
    <div className="flex min-h-[100dvh] bg-fitti-bg relative overflow-hidden">
      {/* Global Grain Texture Overlay */}
      <div className="grain-overlay" />
      
      <FloatingBackground role="trainer"/>
      <Sidebar/>
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="" />
        <main className="flex-1 overflow-y-auto pb-24">
          <Routes>
            <Route path="/" element={<ClientsTab onOpenWorkout={setShowWorkout} onOpenStrategy={setShowStrategy} onOpenProgress={setShowProgress} onOpenLogWorkout={setShowLogWorkout} />}/>
            <Route path="/workouts" element={<WorkoutsTab key={refreshKey} />}/>
            <Route path="/progress" element={<ProgressTab key={refreshKey} />}/>
            <Route path="/messages" element={<MessagingView/>}/>
          </Routes>
        </main>
      </div>
      {showWorkout && <CreateWorkoutModal customer={showWorkout} trainerId={user.id} onClose={()=>setShowWorkout(null)} onSaved={()=>setRefreshKey(k=>k+1)}/>}
      {showStrategy && <NutritionalStrategyModal customer={showStrategy} trainerId={user.id} onClose={()=>setShowStrategy(null)} onSaved={()=>setRefreshKey(k=>k+1)}/>}
      {showProgress && <LogProgressModal customer={showProgress} trainerId={user.id} onClose={()=>setShowProgress(null)} onSaved={()=>setRefreshKey(k=>k+1)}/>}
      {showLogWorkout && <ViewWorkoutsModal customer={showLogWorkout} onClose={()=>setShowLogWorkout(null)}/>}
    </div>
  );
}
