import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Users, Dumbbell, TrendingUp, Target, Flame, Plus, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import Sidebar from '../../components/shared/Sidebar';
import Navbar from '../../components/shared/Navbar';
import FloatingBackground from '../../components/shared/FloatingBackground';
import MessagingView from '../../components/chat/MessagingView';
import Modal from '../../components/shared/Modal';
import { nanoid } from 'nanoid';

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
        <div><h3 className="text-xl font-display font-bold text-fitti-text">Create Workout Plan</h3><p className="text-sm text-fitti-text-muted">For {customer.name}</p></div>
        <button onClick={onClose} className="p-2 hover:bg-fitti-bg rounded-full"><X className="h-5 w-5 text-fitti-text-muted"/></button>
      </div>
      <div className="mb-4">
        <label className="label-spaced block mb-2">Intensity</label>
        <select value={plan.intensity} onChange={e=>setPlan(p=>({...p,intensity:e.target.value}))} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none">
          <option value="light">Light</option><option value="moderate">Moderate</option><option value="intense">Intense</option><option value="extreme">Extreme</option>
        </select>
      </div>
      {plan.days.map((day,di) => (
        <div key={di} className="bg-fitti-bg rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <select value={day.day} onChange={e=>setPlan(p=>({...p,days:p.days.map((d,i)=>i===di?{...d,day:e.target.value}:d)}))} className="bg-white border border-fitti-border rounded-lg px-3 py-1.5 text-sm font-bold">
              {dayNames.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={()=>addExercise(di)} className="text-xs text-fitti-green font-semibold flex items-center gap-1"><Plus className="h-3 w-3"/>Exercise</button>
          </div>
          {day.exercises.map((ex,ei) => (
            <div key={ei} className="grid grid-cols-4 gap-2 mb-2">
              <input placeholder="Exercise" value={ex.name} onChange={e=>updateEx(di,ei,'name',e.target.value)} className="bg-white border border-fitti-border rounded-lg px-2 py-1.5 text-xs focus:border-fitti-green focus:outline-none"/>
              <input placeholder="Sets" type="number" value={ex.sets} onChange={e=>updateEx(di,ei,'sets',e.target.value)} className="bg-white border border-fitti-border rounded-lg px-2 py-1.5 text-xs focus:border-fitti-green focus:outline-none"/>
              <input placeholder="Reps" type="number" value={ex.reps} onChange={e=>updateEx(di,ei,'reps',e.target.value)} className="bg-white border border-fitti-border rounded-lg px-2 py-1.5 text-xs focus:border-fitti-green focus:outline-none"/>
              <input placeholder="Rest(s)" value={ex.rest} onChange={e=>updateEx(di,ei,'rest',e.target.value)} className="bg-white border border-fitti-border rounded-lg px-2 py-1.5 text-xs focus:border-fitti-green focus:outline-none"/>
            </div>
          ))}
        </div>
      ))}
      <button onClick={addDay} className="mb-4 text-sm text-fitti-green font-semibold flex items-center gap-1"><Plus className="h-4 w-4"/>Add Day</button>
      <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-fitti-green text-white font-bold rounded-xl hover:bg-fitti-green-dark transition-colors disabled:opacity-50">
        <Save className="h-4 w-4"/>{saving ? 'Saving...' : 'Save Workout Plan'}
      </button>
    </Modal>
  );
}

function LogProgressModal({ customer, trainerId, onClose, onSaved }) {
  const [log, setLog] = useState({ weight:'', energy_level:'', diet_adherence:'', workout_performance:'good', notes:'' });
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    await supabase.from('progress_logs').insert([{ customer_id: customer.id, trainer_id: trainerId, weight: parseFloat(log.weight)||null, energy_level: parseInt(log.energy_level)||null, diet_adherence: parseInt(log.diet_adherence)||null, workout_performance: log.workout_performance, notes: log.notes }]);
    await supabase.from('activity_feed').insert([{ actor_id: trainerId, actor_role:'trainer', customer_id: customer.id, event_type:'progress_logged', event_data: log }]);
    setSaving(false); onSaved(); onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <div><h3 className="text-xl font-display font-bold text-fitti-text">Log Progress</h3><p className="text-sm text-fitti-text-muted">For {customer.name}</p></div>
        <button onClick={onClose} className="p-2 hover:bg-fitti-bg rounded-full"><X className="h-5 w-5 text-fitti-text-muted"/></button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label-spaced block mb-1">Weight (kg)</label><input type="number" step="0.1" value={log.weight} onChange={e=>setLog(p=>({...p,weight:e.target.value}))} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none"/></div>
          <div><label className="label-spaced block mb-1">Performance</label><select value={log.workout_performance} onChange={e=>setLog(p=>({...p,workout_performance:e.target.value}))} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none"><option value="excellent">Excellent</option><option value="good">Good</option><option value="average">Average</option><option value="poor">Poor</option></select></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label-spaced block mb-1">Energy (1-10)</label><input type="number" min="1" max="10" value={log.energy_level} onChange={e=>setLog(p=>({...p,energy_level:e.target.value}))} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none"/></div>
          <div><label className="label-spaced block mb-1">Diet Adherence (1-10)</label><input type="number" min="1" max="10" value={log.diet_adherence} onChange={e=>setLog(p=>({...p,diet_adherence:e.target.value}))} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none"/></div>
        </div>
        <div><label className="label-spaced block mb-1">Notes</label><textarea value={log.notes} onChange={e=>setLog(p=>({...p,notes:e.target.value}))} rows="3" className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none resize-none"/></div>
      </div>
      <button onClick={handleSave} disabled={saving} className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-fitti-green text-white font-bold rounded-xl hover:bg-fitti-green-dark transition-colors disabled:opacity-50">
        <Save className="h-4 w-4"/>{saving ? 'Saving...' : 'Save Progress Log'}
      </button>
    </Modal>
  );
}

function ClientsTab({ onOpenWorkout, onOpenProgress }) {
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
    <div className="p-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-fitti-text flex items-center gap-2"><Flame className="h-6 w-6 text-fitti-orange"/>My Clients</h2>
        <span className="text-sm text-fitti-text-muted">{clients.length} assigned</span>
      </div>
      {loading ? <div className="space-y-4">{[1,2].map(i=><div key={i} className="h-28 bg-white rounded-2xl shimmer"/>)}</div>
      : clients.length===0 ? (
        <div className="bg-white border border-fitti-border rounded-2xl p-12 text-center animate-scale-in">
          <Users className="h-12 w-12 text-fitti-text-muted mx-auto mb-4"/><p className="text-fitti-text-muted font-medium">No clients assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
          {clients.map(c => (
            <div key={c.id} className="bg-white border border-fitti-border rounded-2xl p-6 shadow-sm card-hover">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">{c.name.charAt(0)}</div>
                <div className="ml-3"><h3 className="font-bold text-fitti-text">{c.name}</h3><p className="text-xs text-fitti-text-muted">{c.email}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                <div className="bg-fitti-bg rounded-xl p-3 text-center"><p className="text-fitti-text-muted text-xs mb-1">Weight</p><p className="font-bold text-fitti-text">{c.weight?`${c.weight}kg`:'—'}</p></div>
                <div className="bg-fitti-bg rounded-xl p-3 text-center"><p className="text-fitti-text-muted text-xs mb-1">Height</p><p className="font-bold text-fitti-text">{c.height?`${c.height}cm`:'—'}</p></div>
                <div className="bg-fitti-bg rounded-xl p-3 text-center"><p className="text-fitti-text-muted text-xs mb-1">Goal</p><p className="font-bold text-fitti-orange capitalize text-xs">{c.goal?.replace(/_/g,' ')||'—'}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={()=>onOpenWorkout(c)} className="flex items-center justify-center gap-2 py-2.5 bg-fitti-bg border border-fitti-border rounded-xl text-xs font-semibold text-fitti-green hover:bg-fitti-bg-alt transition-colors"><Dumbbell className="h-4 w-4"/>Workout Plan</button>
                <button onClick={()=>onOpenProgress(c)} className="flex items-center justify-center gap-2 py-2.5 bg-fitti-green text-white rounded-xl text-xs font-semibold hover:bg-fitti-green-dark transition-colors"><TrendingUp className="h-4 w-4"/>Log Progress</button>
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
    <div className="p-8 animate-fade-in-up">
      <h2 className="text-2xl font-display font-bold text-fitti-text mb-6 flex items-center gap-2"><Dumbbell className="h-6 w-6 text-fitti-green"/>Workout Plans</h2>
      {plans.length===0 ? <div className="bg-white border border-fitti-border rounded-2xl p-12 text-center"><Dumbbell className="h-12 w-12 text-fitti-text-muted mx-auto mb-4"/><p className="text-fitti-text-muted">No plans yet. Go to My Clients to create one.</p></div>
      : <div className="space-y-4 stagger-children">{plans.map(p => {
        const days = Array.isArray(p.weekly_structure) ? p.weekly_structure : [];
        return (
          <div key={p.id} className="bg-white border border-fitti-border rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-fitti-text">{p.customer_name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium capitalize text-fitti-text-muted">{p.intensity}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${p.active?'bg-emerald-50 text-emerald-600':'bg-gray-100 text-gray-500'}`}>{p.active?'Active':'Inactive'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{days.map((d,i) => (
              <div key={i} className="bg-fitti-bg rounded-lg p-2 text-xs">
                <p className="font-bold text-fitti-text mb-1">{d.day}</p>
                {(d.exercises||[]).map((e,j)=><p key={j} className="text-fitti-text-muted">{e.name||'—'} {e.sets}x{e.reps}</p>)}
              </div>
            ))}</div>
          </div>
        );
      })}</div>}
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
    <div className="p-8 animate-fade-in-up">
      <h2 className="text-2xl font-display font-bold text-fitti-text mb-6 flex items-center gap-2"><TrendingUp className="h-6 w-6 text-blue-500"/>Progress Tracking</h2>
      {logs.length===0 ? <div className="bg-white border border-fitti-border rounded-2xl p-12 text-center"><Target className="h-12 w-12 text-fitti-text-muted mx-auto mb-4"/><p className="text-fitti-text-muted">No logs yet. Go to My Clients to log progress.</p></div>
      : <div className="space-y-4 stagger-children">{logs.map(l => (
        <div key={l.id} className="bg-white border border-fitti-border rounded-2xl p-6 card-hover">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-fitti-text">{l.customer_name}</h3>
            <span className="text-xs text-fitti-text-muted">{new Date(l.logged_at).toLocaleDateString()}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs text-center">
            <div className="bg-fitti-bg rounded-lg p-2"><p className="text-fitti-text-muted">Weight</p><p className="font-bold">{l.weight||'—'} kg</p></div>
            <div className="bg-fitti-bg rounded-lg p-2"><p className="text-fitti-text-muted">Energy</p><p className="font-bold">{l.energy_level||'—'}/10</p></div>
            <div className="bg-fitti-bg rounded-lg p-2"><p className="text-fitti-text-muted">Diet</p><p className="font-bold">{l.diet_adherence||'—'}/10</p></div>
            <div className="bg-fitti-bg rounded-lg p-2"><p className="text-fitti-text-muted">Perf</p><p className="font-bold text-fitti-green capitalize">{l.workout_performance||'—'}</p></div>
          </div>
          {l.notes && <p className="text-sm text-fitti-text-muted mt-3 bg-fitti-bg rounded-lg p-3">{l.notes}</p>}
        </div>
      ))}</div>}
    </div>
  );
}

export default function TrainerDashboard() {
  const [showWorkout, setShowWorkout] = useState(null);
  const [showProgress, setShowProgress] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const user = useAuthStore(state => state.user);
  const setActiveCall = useAuthStore(state => state.setActiveCall);

  const startVideoCall = async (contact) => {
    const roomCode = nanoid(8);
    await supabase.from('meet_sessions').insert([{ room_code: roomCode, host_id: user.id, guest_id: contact.id, session_type:'customer_trainer' }]);
    setActiveCall({ roomCode, isHost: true, guestId: contact.id, remoteName: contact.name });
  };

  return (
    <div className="flex h-screen bg-fitti-bg relative">
      <FloatingBackground role="trainer"/>
      <Sidebar/>
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Navbar title="" />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<ClientsTab onOpenWorkout={setShowWorkout} onOpenProgress={setShowProgress} />}/>
            <Route path="/workouts" element={<WorkoutsTab key={refreshKey} />}/>
            <Route path="/progress" element={<ProgressTab key={refreshKey} />}/>
            <Route path="/messages" element={<MessagingView onStartVideoCall={startVideoCall}/>}/>
            <Route path="/sessions" element={<div className="p-8 animate-fade-in-up"><h2 className="text-2xl font-bold text-fitti-text mb-4">Video Sessions</h2><div className="bg-white border border-fitti-border rounded-2xl p-12 text-center"><p className="text-fitti-text-muted">Use Messages tab to start a call.</p></div></div>}/>
          </Routes>
        </main>
      </div>
      {showWorkout && <CreateWorkoutModal customer={showWorkout} trainerId={user.id} onClose={()=>setShowWorkout(null)} onSaved={()=>setRefreshKey(k=>k+1)}/>}
      {showProgress && <LogProgressModal customer={showProgress} trainerId={user.id} onClose={()=>setShowProgress(null)} onSaved={()=>setRefreshKey(k=>k+1)}/>}
    </div>
  );
}
