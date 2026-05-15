import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { 
  Dumbbell, Clock, Flame, Target, Trophy,
  MapPin, PlayCircle, StopCircle, Flag, Activity, Plus, ArrowRight
} from 'lucide-react';

const MET_VALUES = {
  'Walking': 3.5,
  'Jogging': 7.0,
  'Running': 10.0,
  'Strength': 5.0,
  'Yoga': 2.5
};

export default function WorkoutTracker({ customerId, isTrainerView = false, customerName = '' }) {
  const user = useAuthStore(state => state.user);
  const [customerWeight, setCustomerWeight] = useState(70);
  const [mode, setMode] = useState('select');
  const [workoutType, setWorkoutType] = useState('Strength');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [distance, setDistance] = useState(0);
  const [positions, setPositions] = useState([]);
  const watchIdRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');

  useEffect(() => {
    const initData = async () => {
      const targetId = customerId || user?.id;
      if (!targetId) return;
      const { data: custData } = await supabase.from('customers').select('weight').eq('id', targetId).maybeSingle();
      if (custData?.weight) setCustomerWeight(custData.weight);
      const { data: logData } = await supabase.from('workout_logs').select('*').eq('user_id', targetId).order('created_at', { ascending: false }).limit(6);
      if (logData) setLogs(logData);
    };
    initData();
  }, [user, customerId]);

  useEffect(() => {
    let interval;
    if (isRunning) interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const caloriesBurned = Math.round((MET_VALUES[workoutType] || 5) * customerWeight * (time / 3600));

  const handleStart = (type, workoutMode) => {
    setWorkoutType(type);
    setMode(workoutMode);
    setTime(0);
    setLaps([]);
    setDistance(0);
    setPositions([]);
    setIsRunning(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const targetId = customerId || user.id;
    const logEntry = {
      user_id: targetId,
      logged_by: user.id,
      total_time: Math.floor(time / 60),
      total_calories: caloriesBurned,
      notes: workoutNotes,
      exercises: [{ 
        name: workoutName || workoutType,
        distance: distance > 0 ? distance.toFixed(2) : undefined,
        sets: mode === 'strength' ? laps.map(l => l.lapTime) : undefined
      }],
      total_sets: laps.length
    };
    await supabase.from('workout_logs').insert([logEntry]);
    const { data } = await supabase.from('workout_logs').select('*').eq('user_id', targetId).order('created_at', { ascending: false }).limit(6);
    setLogs(data || []);
    setSaving(false);
    setMode('select');
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-v-fade-up">
      {/* Editorial Header */}
      <div className="flex flex-col">
        <span className="eyebrow-tag !mb-2">Movement Protocol</span>
        <h2 className="font-display text-6xl font-black text-fitti-text tracking-tighter leading-none">
          Active <span className="text-fitti-green">Session.</span>
        </h2>
        <p className="font-accent text-xl italic text-fitti-text-muted mt-2">Log real-time performance to refine biological evolution.</p>
      </div>

      {mode === 'select' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Strength Hardware Module */}
          <div className="bezel-shell group" onClick={() => handleStart('Strength', 'strength')}>
            <div className="bezel-core p-12 text-center relative overflow-hidden transition-all duration-700 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
              <div className="mesh-glow -top-24 -left-24 opacity-0 group-hover:opacity-10 transition-opacity duration-1000" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-fitti-green/10 rounded-2xl flex items-center justify-center mx-auto mb-8 ring-1 ring-fitti-green/20">
                  <Dumbbell className="h-10 w-10 text-fitti-green" />
                </div>
                <h3 className="font-display text-4xl font-black text-fitti-text mb-4 tracking-tighter">Strength Hub</h3>
                <p className="font-body font-bold text-fitti-text-muted mb-12 max-w-xs mx-auto leading-relaxed">
                  Precision stopwatch for muscle-fiber hyper-trophy and rest-period logging.
                </p>
                <button className="btn-vanguard btn-vanguard-primary w-full">
                  Start Lifting
                  <div className="btn-vanguard-icon-wrapper">
                    <ArrowRight strokeWidth={2.5} className="h-4 w-4" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Cardio Hardware Module */}
          <div className="bezel-shell group">
            <div className="bezel-core p-12 text-center relative overflow-hidden">
              <div className="mesh-glow -bottom-24 -right-24 opacity-0 group-hover:opacity-10 transition-opacity duration-1000" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-fitti-green/10 rounded-2xl flex items-center justify-center mx-auto mb-8 ring-1 ring-fitti-green/20">
                  <MapPin className="h-10 w-10 text-fitti-green" />
                </div>
                <h3 className="font-display text-4xl font-black text-fitti-text mb-4 tracking-tighter">GPS Cardio</h3>
                <p className="font-body font-bold text-fitti-text-muted mb-12 max-w-xs mx-auto leading-relaxed">
                  High-fidelity route mapping and spatial velocity tracking via GPS.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {['Walk', 'Jog', 'Run'].map((label) => (
                    <button 
                      key={label}
                      onClick={() => handleStart(label + 'ing', 'cardio')} 
                      className="p-4 bg-black/5 dark:bg-white/5 border border-fitti-border/30 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-fitti-green hover:text-white transition-all duration-500 active:scale-95"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode !== 'select' && (
        <div className="bezel-shell">
          <div className="bezel-core p-12 relative overflow-hidden">
            <div className="mesh-glow -top-32 left-1/4 opacity-10" />
            <div className="text-center mb-16 relative z-10">
              <span className="eyebrow-tag !mb-4">{workoutType} Session Active</span>
              <h1 className="font-mono text-[8rem] font-black text-fitti-text tracking-tighter tabular-nums leading-none">
                {formatTime(time)}
              </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 relative z-10">
              <div className="bg-black/5 dark:bg-white/5 p-8 rounded-[2rem] text-center border border-black/5">
                <Flame className="h-6 w-6 text-fitti-green mx-auto mb-3" />
                <p className="font-mono text-[9px] font-black text-fitti-text-muted uppercase tracking-widest mb-1">Biological Fuel</p>
                <p className="font-display text-3xl font-black">{caloriesBurned} <span className="text-sm opacity-40">kcal</span></p>
              </div>
              {mode === 'cardio' ? (
                <>
                  <div className="bg-black/5 dark:bg-white/5 p-8 rounded-[2rem] text-center border border-black/5">
                    <MapPin className="h-6 w-6 text-fitti-green mx-auto mb-3" />
                    <p className="font-mono text-[9px] font-black text-fitti-text-muted uppercase tracking-widest mb-1">Spatial Path</p>
                    <p className="font-display text-3xl font-black">{distance.toFixed(2)} <span className="text-sm opacity-40">km</span></p>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 p-8 rounded-[2rem] text-center border border-black/5">
                    <Activity className="h-6 w-6 text-fitti-green mx-auto mb-3" />
                    <p className="font-mono text-[9px] font-black text-fitti-text-muted uppercase tracking-widest mb-1">Velocity</p>
                    <p className="font-display text-3xl font-black">
                      {distance > 0 ? (time / 60 / distance).toFixed(1) : '0'} <span className="text-sm opacity-40">m/km</span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-black/5 dark:bg-white/5 p-8 rounded-[2rem] text-center border border-black/5">
                  <Target className="h-6 w-6 text-fitti-green mx-auto mb-3" />
                  <p className="font-mono text-[9px] font-black text-fitti-text-muted uppercase tracking-widest mb-1">Protocol Sets</p>
                  <p className="font-display text-3xl font-black">{laps.length}</p>
                </div>
              )}
              <div className="bg-black/5 dark:bg-white/5 p-8 rounded-[2rem] text-center border border-black/5 flex flex-col justify-center">
                <p className="font-mono text-[9px] font-black text-fitti-text-muted uppercase tracking-widest mb-1">Body Weight</p>
                <p className="font-display text-3xl font-black">{customerWeight} <span className="text-sm opacity-40">kg</span></p>
              </div>
            </div>

            <div className="flex justify-center gap-8 relative z-10">
              {isRunning ? (
                <button onClick={() => setIsRunning(false)} className="h-24 w-24 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-all duration-700 shadow-2xl shadow-red-500/20">
                  <StopCircle className="h-10 w-10" />
                </button>
              ) : (
                <button onClick={() => setIsRunning(true)} className="h-24 w-24 rounded-full bg-fitti-green text-white flex items-center justify-center hover:scale-110 transition-all duration-700 shadow-2xl shadow-fitti-green/20">
                  <PlayCircle className="h-10 w-10 ml-1" />
                </button>
              )}
              {time > 0 && !isRunning && (
                <button onClick={handleSave} disabled={saving} className="btn-vanguard btn-vanguard-primary px-12 h-24">
                  Log Artifact
                  <div className="btn-vanguard-icon-wrapper">
                    <Plus strokeWidth={2.5} className="h-4 w-4" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Historical Artifacts */}
      {logs.length > 0 && mode === 'select' && (
        <div className="space-y-8">
          <h3 className="font-display text-3xl font-black text-fitti-text tracking-tighter uppercase">Recent History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-v-fade">
            {logs.map(log => (
              <div key={log.id} className="bezel-shell h-full">
                <div className="bezel-core p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-[10px] font-black text-fitti-green uppercase tracking-[0.2em]">
                      {log.exercises?.[0]?.name || 'Workout'}
                    </span>
                    <span className="font-mono text-[9px] font-black text-fitti-text-muted opacity-50">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-fitti-text-muted" />
                      <span className="font-display font-bold text-sm">{log.total_time || 0}m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="h-3.5 w-3.5 text-fitti-green" />
                      <span className="font-display font-bold text-sm">{log.total_calories || 0} kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
