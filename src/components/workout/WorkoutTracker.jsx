import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { 
  Dumbbell, Plus, X, Clock, Flame, Target, Timer, Trophy,
  ChevronDown, Check, Trash2, Save, Play, Pause, RotateCcw,
  Activity, MapPin, PlayCircle, StopCircle, Flag
} from 'lucide-react';

// --- Utility: Haversine distance in km ---
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const MET_VALUES = {
  'Walking': 3.5,
  'Jogging': 7.0,
  'Running': 10.0,
  'Strength': 5.0,
  'Yoga': 2.5
};

export default function WorkoutTracker({ customerId, isTrainerView = false, customerName = '' }) {
  const user = useAuthStore(state => state.user);
  
  // States
  const [customerWeight, setCustomerWeight] = useState(70); // Default 70kg for calorie calc
  const [mode, setMode] = useState('select'); // select, strength, cardio
  const [workoutType, setWorkoutType] = useState('Strength');
  
  // Stopwatch States
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  
  // Cardio States
  const [distance, setDistance] = useState(0); // in km
  const [positions, setPositions] = useState([]);
  const watchIdRef = useRef(null);

  // Saving logs
  const [logs, setLogs] = useState([]);
  const [saving, setSaving] = useState(false);

  // Fetch weight & past logs
  useEffect(() => {
    const initData = async () => {
      const targetId = customerId || user?.id;
      if (!targetId) return;

      // Get Weight
      const { data: custData } = await supabase.from('customers').select('weight').eq('id', targetId).maybeSingle();
      if (custData?.weight) setCustomerWeight(custData.weight);

      // Get Logs
      const { data: logData } = await supabase.from('workout_logs').select('*').eq('user_id', targetId).order('created_at', { ascending: false }).limit(5);
      if (logData) setLogs(logData);
    };
    initData();
  }, [user, customerId]);

  // Stopwatch Timer
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // GPS Tracker
  useEffect(() => {
    if (mode === 'cardio' && isRunning) {
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setPositions(prev => {
              const newPos = { lat: latitude, lon: longitude, time: Date.now() };
              if (prev.length > 0) {
                const lastPos = prev[prev.length - 1];
                const dist = calculateDistance(lastPos.lat, lastPos.lon, newPos.lat, newPos.lon);
                setDistance(d => d + dist);
              }
              return [...prev, newPos];
            });
          },
          (err) => console.error(err),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }
    } else {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    }
    return () => { if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, [mode, isRunning]);

  // Calorie Calculation
  // Calories = MET * weight(kg) * (time(min)/60)
  const caloriesBurned = Math.round(
    (MET_VALUES[workoutType] || 5) * customerWeight * (time / 3600)
  );

  const handleStart = (type, workoutMode) => {
    setWorkoutType(type);
    setMode(workoutMode);
    setTime(0);
    setLaps([]);
    setDistance(0);
    setPositions([]);
    setIsRunning(true);
  };

  const handleLap = () => {
    if (!isRunning) return;
    setLaps(prev => [...prev, {
      lapTime: time - (prev.length > 0 ? prev[prev.length - 1].totalTime : 0),
      totalTime: time
    }]);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const targetId = customerId || user.id;

    const logEntry = {
      user_id: targetId,
      logged_by: user.id,
      total_time: Math.floor(time / 60),
      total_calories: caloriesBurned,
      exercises: mode === 'strength' 
        ? laps.map((lap, i) => ({ name: `Set ${i+1}`, time: lap.lapTime, sets: 1 }))
        : [{ name: workoutType, distance: distance.toFixed(2), time: time }],
      total_sets: laps.length
    };

    await supabase.from('workout_logs').insert([logEntry]);
    
    // Refresh logs
    const { data } = await supabase.from('workout_logs').select('*').eq('user_id', targetId).order('created_at', { ascending: false }).limit(5);
    setLogs(data || []);
    
    setSaving(false);
    setMode('select'); // Go back to start
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="font-display text-4xl font-black text-fitti-text tracking-tighter flex items-center gap-3">
           <Activity className="h-8 w-8 text-fitti-green" />
           Live Workout Session
        </h2>
        <p className="font-accent text-lg italic text-fitti-text-muted mt-1">Track your performance in real-time</p>
      </div>

      {mode === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strength Training */}
          <div className="card-glass p-8 text-center hover:border-fitti-green/50 cursor-pointer transition-all duration-300 hover:-translate-y-1" onClick={() => handleStart('Strength', 'strength')}>
            <Dumbbell className="h-16 w-16 text-fitti-text mx-auto mb-6 opacity-80" />
            <h3 className="font-display text-2xl font-black text-fitti-text mb-2">Strength / Weights</h3>
            <p className="font-body text-sm font-bold text-fitti-text-muted mb-8">Use stopwatch to track your sets and rest periods accurately.</p>
            <button className="btn-gradient w-full py-4">Start Lifting</button>
          </div>

          {/* Cardio / Strava-like */}
          <div className="card-glass p-8 text-center hover:border-fitti-orange/50 cursor-pointer transition-all duration-300 hover:-translate-y-1">
            <MapPin className="h-16 w-16 text-fitti-orange mx-auto mb-6 opacity-80" />
            <h3 className="font-display text-2xl font-black text-fitti-text mb-2">GPS Cardio</h3>
            <p className="font-body text-sm font-bold text-fitti-text-muted mb-6">Track distance, pace, and route via GPS.</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleStart('Walking', 'cardio')} className="bg-fitti-bg hover:bg-fitti-orange hover:text-white transition-all py-3 rounded-xl font-bold text-sm">Walk</button>
              <button onClick={() => handleStart('Jogging', 'cardio')} className="bg-fitti-bg hover:bg-fitti-orange hover:text-white transition-all py-3 rounded-xl font-bold text-sm">Jog</button>
              <button onClick={() => handleStart('Running', 'cardio')} className="bg-fitti-bg hover:bg-fitti-orange hover:text-white transition-all py-3 rounded-xl font-bold text-sm">Run</button>
            </div>
          </div>
        </div>
      )}

      {mode !== 'select' && (
        <div className="card-glass p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-fitti-bg">
            <div className={`h-full bg-fitti-green transition-all ${isRunning ? 'w-full duration-[60000ms]' : 'w-0'}`} />
          </div>

          <div className="text-center mb-10">
            <p className="font-mono text-sm font-bold text-fitti-green uppercase tracking-[0.2em] mb-2">{workoutType} Session</p>
            <h1 className="font-mono text-7xl font-black text-fitti-text tracking-tighter tabular-nums">
              {formatTime(time)}
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-fitti-bg p-5 rounded-2xl text-center">
              <Flame className="h-5 w-5 text-fitti-orange mx-auto mb-2" />
              <p className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-widest">Kcal Burned</p>
              <p className="font-display text-2xl font-bold">{caloriesBurned}</p>
            </div>
            {mode === 'cardio' ? (
              <>
                <div className="bg-fitti-bg p-5 rounded-2xl text-center">
                  <MapPin className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                  <p className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-widest">Distance</p>
                  <p className="font-display text-2xl font-bold">{distance.toFixed(2)} <span className="text-sm">km</span></p>
                </div>
                <div className="bg-fitti-bg p-5 rounded-2xl text-center">
                  <Activity className="h-5 w-5 text-purple-500 mx-auto mb-2" />
                  <p className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-widest">Avg Pace</p>
                  <p className="font-display text-2xl font-bold">
                    {distance > 0 ? (time / 60 / distance).toFixed(1) : '0'} <span className="text-sm">m/km</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-fitti-bg p-5 rounded-2xl text-center">
                  <Target className="h-5 w-5 text-fitti-green mx-auto mb-2" />
                  <p className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-widest">Total Sets</p>
                  <p className="font-display text-2xl font-bold">{laps.length}</p>
                </div>
              </>
            )}
            <div className="bg-fitti-bg p-5 rounded-2xl text-center flex items-center justify-center">
              <p className="font-mono text-xs font-bold text-fitti-text-muted">Weight: {customerWeight}kg</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {isRunning ? (
              <>
                <button onClick={handleStop} className="h-20 w-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-all shadow-lg hover:scale-105">
                  <StopCircle className="h-8 w-8" />
                </button>
                {mode === 'strength' && (
                  <button onClick={handleLap} className="h-20 w-20 rounded-full bg-fitti-bg text-fitti-text flex items-center justify-center hover:bg-fitti-border/50 transition-all shadow-sm hover:scale-105">
                    <Flag className="h-6 w-6" />
                    <span className="sr-only">Lap</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button onClick={() => setIsRunning(true)} className="h-20 w-20 rounded-full bg-fitti-green text-white flex items-center justify-center hover:bg-fitti-green-dark transition-all shadow-xl shadow-fitti-green/20 hover:scale-105">
                  <PlayCircle className="h-8 w-8 ml-1" />
                </button>
                {time > 0 && (
                  <button onClick={handleSave} disabled={saving} className="h-20 px-8 rounded-full bg-black text-white font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2">
                    {saving ? 'Saving...' : 'Finish & Save'}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Laps List */}
          {laps.length > 0 && (
            <div className="mt-10 border-t border-fitti-border/50 pt-8">
              <h4 className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-[0.2em] mb-4">Set History</h4>
              <div className="space-y-2">
                {[...laps].reverse().map((lap, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-fitti-bg/30 rounded-xl">
                    <span className="font-bold text-sm">Set {laps.length - i}</span>
                    <div className="font-mono text-sm">
                      <span className="text-fitti-text-muted mr-4">+{formatTime(lap.lapTime)}</span>
                      <span>{formatTime(lap.totalTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Previous Logs */}
      {logs.length > 0 && mode === 'select' && (
        <div className="pt-8">
          <h3 className="font-display text-xl font-bold text-fitti-text mb-5 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-fitti-green" />
            <span>Recent Sessions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {logs.map(log => (
              <div key={log.id} className="card-glass p-5 hover:border-fitti-green/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] font-bold text-fitti-green uppercase tracking-widest">
                    {log.exercises?.[0]?.name || 'Workout'}
                  </span>
                  <span className="font-body text-xs font-bold text-fitti-text-muted">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono text-xs text-fitti-text">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-fitti-text-muted" />{log.total_time || 0}m</span>
                  {log.total_sets > 0 && <span className="flex items-center gap-1"><Target className="h-3 w-3 text-fitti-text-muted" />{log.total_sets} sets</span>}
                  {log.exercises?.[0]?.distance && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-blue-500" />{log.exercises[0].distance} km</span>}
                  <span className="flex items-center gap-1 text-fitti-orange font-bold"><Flame className="h-3 w-3" />{log.total_calories || 0} kcal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
