import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { 
  Dumbbell, Plus, X, Clock, Flame, Target, Timer, Trophy,
  ChevronDown, Check, Trash2, Save, Play, Pause, RotateCcw
} from 'lucide-react';

const EXERCISE_CATEGORIES = {
  'Chest': ['Bench Press', 'Incline Press', 'Decline Press', 'Cable Fly', 'Push-Up', 'Dumbbell Fly', 'Chest Dip'],
  'Back': ['Deadlift', 'Pull-Up', 'Barbell Row', 'Lat Pulldown', 'Cable Row', 'T-Bar Row', 'Face Pull'],
  'Shoulders': ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Arnold Press', 'Shrugs'],
  'Arms': ['Bicep Curl', 'Tricep Extension', 'Hammer Curl', 'Skull Crusher', 'Preacher Curl', 'Dip'],
  'Legs': ['Squat', 'Leg Press', 'Lunges', 'Leg Extension', 'Leg Curl', 'Calf Raise', 'Bulgarian Split Squat', 'Hip Thrust'],
  'Core': ['Plank', 'Crunch', 'Russian Twist', 'Leg Raise', 'Mountain Climber', 'Ab Wheel', 'Bicycle Crunch'],
  'Cardio': ['Running', 'Cycling', 'Jump Rope', 'Rowing', 'Stair Climber', 'Burpees', 'HIIT Sprint', 'Swimming'],
};

// Calorie estimates per minute for common activities at moderate intensity
const CALORIE_PER_MIN = {
  'Chest': 6, 'Back': 7, 'Shoulders': 5, 'Arms': 4, 'Legs': 8, 'Core': 5, 'Cardio': 10,
};

function RestTimer({ initialSeconds = 60, onDone }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      setIsRunning(false);
      onDone?.();
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const reset = () => { setSeconds(initialSeconds); setIsRunning(false); };
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex items-center gap-3">
      <div className={`font-mono text-2xl font-bold tabular-nums transition-colors duration-300 ${seconds <= 10 && isRunning ? 'text-red-500 animate-pulse-soft' : 'text-fitti-text'}`}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div className="flex gap-1">
        <button onClick={() => setIsRunning(!isRunning)} className={`p-2 rounded-xl transition-all duration-300 ${isRunning ? 'bg-amber-100 text-amber-600' : 'bg-fitti-green/10 text-fitti-green'} hover:scale-105`}>
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button onClick={reset} className="p-2 rounded-xl bg-fitti-bg text-fitti-text-muted hover:bg-fitti-border/50 hover:scale-105 transition-all duration-300">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ExerciseRow({ exercise, index, onUpdate, onRemove }) {
  const [showCategories, setShowCategories] = useState(false);
  const [showExercises, setShowExercises] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  const estimatedCalories = exercise.category
    ? Math.round((CALORIE_PER_MIN[exercise.category] || 5) * (parseInt(exercise.time) || 0))
    : exercise.calories || 0;

  return (
    <div className="group bg-white border-2 border-fitti-border/40 rounded-2xl p-4 hover:border-fitti-green/30 transition-all duration-300 hover:shadow-lg hover:shadow-fitti-green/5 animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex items-start gap-4">
        {/* Exercise Number */}
        <div className="h-10 w-10 rounded-xl bg-fitti-green/10 flex items-center justify-center flex-shrink-0">
          <span className="font-mono text-sm font-bold text-fitti-green">{String(index + 1).padStart(2, '0')}</span>
        </div>

        <div className="flex-1 space-y-3">
          {/* Category & Exercise Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="label-spaced block mb-1.5">Category</label>
              <button 
                onClick={() => { setShowCategories(!showCategories); setShowExercises(false); }}
                className="w-full flex items-center justify-between bg-fitti-bg/50 border border-fitti-border rounded-xl px-3 py-2.5 text-sm font-body hover:border-fitti-green/40 transition-colors"
              >
                <span className={exercise.category ? 'text-fitti-text font-medium' : 'text-fitti-text-muted'}>{exercise.category || 'Select...'}</span>
                <ChevronDown className={`h-4 w-4 text-fitti-text-muted transition-transform ${showCategories ? 'rotate-180' : ''}`} />
              </button>
              {showCategories && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-fitti-border rounded-xl shadow-xl z-20 overflow-hidden animate-scale-in">
                  {Object.keys(EXERCISE_CATEGORIES).map(cat => (
                    <button key={cat} onClick={() => { onUpdate('category', cat); onUpdate('name', ''); setShowCategories(false); }} className="w-full text-left px-4 py-2.5 text-sm font-body hover:bg-fitti-green/5 hover:text-fitti-green transition-colors">
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="label-spaced block mb-1.5">Exercise</label>
              <button 
                onClick={() => { if (exercise.category) { setShowExercises(!showExercises); setShowCategories(false); }}}
                className={`w-full flex items-center justify-between bg-fitti-bg/50 border border-fitti-border rounded-xl px-3 py-2.5 text-sm font-body transition-colors ${exercise.category ? 'hover:border-fitti-green/40' : 'opacity-50 cursor-not-allowed'}`}
              >
                <span className={exercise.name ? 'text-fitti-text font-medium' : 'text-fitti-text-muted'}>{exercise.name || 'Select...'}</span>
                <ChevronDown className={`h-4 w-4 text-fitti-text-muted transition-transform ${showExercises ? 'rotate-180' : ''}`} />
              </button>
              {showExercises && exercise.category && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-fitti-border rounded-xl shadow-xl z-20 overflow-hidden max-h-48 overflow-y-auto animate-scale-in">
                  {EXERCISE_CATEGORIES[exercise.category]?.map(ex => (
                    <button key={ex} onClick={() => { onUpdate('name', ex); setShowExercises(false); }} className="w-full text-left px-4 py-2.5 text-sm font-body hover:bg-fitti-green/5 hover:text-fitti-green transition-colors">
                      {ex}
                    </button>
                  ))}
                  {/* Custom input option */}
                  <div className="border-t border-fitti-border p-2">
                    <input
                      placeholder="Custom exercise..."
                      className="w-full px-3 py-2 text-sm border border-fitti-border rounded-lg focus:border-fitti-green focus:outline-none"
                      onKeyDown={(e) => { if (e.key === 'Enter') { onUpdate('name', e.target.value); setShowExercises(false); }}}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="label-spaced block mb-1.5 flex items-center gap-1">
                <Timer className="h-3 w-3" /> Time
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="0"
                  value={exercise.time || ''}
                  onChange={(e) => onUpdate('time', e.target.value)}
                  className="w-full bg-fitti-bg/50 border border-fitti-border rounded-xl px-3 py-2.5 font-mono text-sm focus:border-fitti-green focus:outline-none transition-all"
                />
                <span className="text-[9px] font-mono text-fitti-text-muted">min</span>
              </div>
            </div>
            <div>
              <label className="label-spaced block mb-1.5 flex items-center gap-1">
                <Target className="h-3 w-3" /> Reps
              </label>
              <input
                type="number"
                placeholder="0"
                value={exercise.reps || ''}
                onChange={(e) => onUpdate('reps', e.target.value)}
                className="w-full bg-fitti-bg/50 border border-fitti-border rounded-xl px-3 py-2.5 font-mono text-sm focus:border-fitti-green focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="label-spaced block mb-1.5 flex items-center gap-1">
                <Dumbbell className="h-3 w-3" /> Sets
              </label>
              <input
                type="number"
                placeholder="0"
                value={exercise.sets || ''}
                onChange={(e) => onUpdate('sets', e.target.value)}
                className="w-full bg-fitti-bg/50 border border-fitti-border rounded-xl px-3 py-2.5 font-mono text-sm focus:border-fitti-green focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="label-spaced block mb-1.5 flex items-center gap-1">
                <Flame className="h-3 w-3" /> Calories
              </label>
              <input
                type="number"
                placeholder={estimatedCalories || '0'}
                value={exercise.calories || ''}
                onChange={(e) => onUpdate('calories', e.target.value)}
                className="w-full bg-fitti-bg/50 border border-fitti-border rounded-xl px-3 py-2.5 font-mono text-sm focus:border-fitti-green focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Rest Timer Toggle */}
          <div className="flex items-center justify-between pt-1">
            <button onClick={() => setShowTimer(!showTimer)} className="text-[10px] font-mono font-bold text-fitti-green hover:text-fitti-green-dark transition-colors flex items-center gap-1.5 uppercase tracking-widest">
              <Clock className="h-3 w-3" /> {showTimer ? 'Hide Timer' : 'Rest Timer'}
            </button>
            {estimatedCalories > 0 && !exercise.calories && (
              <span className="text-[10px] font-mono text-fitti-text-muted">
                Est. ~{estimatedCalories} kcal
              </span>
            )}
          </div>

          {showTimer && (
            <div className="bg-fitti-bg/50 rounded-xl p-4 animate-scale-in">
              <RestTimer initialSeconds={60} />
            </div>
          )}
        </div>

        {/* Remove button */}
        <button onClick={onRemove} className="p-2 rounded-xl text-fitti-text-muted/40 hover:text-red-500 hover:bg-red-50 transition-all duration-300 opacity-0 group-hover:opacity-100">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function WorkoutTracker({ customerId, isTrainerView = false, customerName = '' }) {
  const user = useAuthStore(state => state.user);
  const [exercises, setExercises] = useState([createEmptyExercise()]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  function createEmptyExercise() {
    return { id: Date.now() + Math.random(), category: '', name: '', time: '', reps: '', sets: '', calories: '' };
  }

  // Fetch existing workout logs
  useEffect(() => {
    const fetchLogs = async () => {
      const targetId = customerId || user?.id;
      if (!targetId) return;
      const { data } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false })
        .limit(10);
      setLogs(data || []);
      setLoadingLogs(false);
    };
    fetchLogs();
  }, [user, customerId, saved]);

  const addExercise = () => setExercises(prev => [...prev, createEmptyExercise()]);
  const removeExercise = (id) => setExercises(prev => prev.filter(e => e.id !== id));
  const updateExercise = (id, field, value) => setExercises(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));

  const totalCalories = exercises.reduce((sum, ex) => {
    const cal = parseInt(ex.calories) || (ex.category ? Math.round((CALORIE_PER_MIN[ex.category] || 5) * (parseInt(ex.time) || 0)) : 0);
    return sum + cal;
  }, 0);

  const totalTime = exercises.reduce((sum, ex) => sum + (parseInt(ex.time) || 0), 0);
  const totalSets = exercises.reduce((sum, ex) => sum + (parseInt(ex.sets) || 0), 0);

  const handleSave = async () => {
    if (exercises.every(e => !e.name)) return;
    setSaving(true);
    const targetId = customerId || user.id;
    
    const logEntry = {
      user_id: targetId,
      logged_by: user.id,
      exercises: exercises.filter(e => e.name).map(e => ({
        category: e.category,
        name: e.name,
        time: parseInt(e.time) || 0,
        reps: parseInt(e.reps) || 0,
        sets: parseInt(e.sets) || 0,
        calories: parseInt(e.calories) || Math.round((CALORIE_PER_MIN[e.category] || 5) * (parseInt(e.time) || 0)),
      })),
      total_calories: totalCalories,
      total_time: totalTime,
      total_sets: totalSets,
    };

    await supabase.from('workout_logs').insert([logEntry]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setExercises([createEmptyExercise()]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-black text-fitti-text tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-fitti-green/10 flex items-center justify-center animate-pulse-soft">
              <Dumbbell className="h-5 w-5 text-fitti-green" />
            </div>
            {isTrainerView ? `Log for ${customerName}` : 'Workout Tracker'}
          </h2>
          <p className="font-body text-sm text-fitti-text-muted mt-1">
            Track exercises, time, reps, and calories burned
          </p>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Time', value: `${totalTime}m`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Sets', value: totalSets, icon: Target, color: 'text-fitti-green', bg: 'bg-fitti-green/10' },
          { label: 'Est. Calories', value: `${totalCalories}`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-2xl p-5 border border-white/60 transition-all duration-500 hover:scale-[1.02]`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="label-spaced !text-[9px] !mb-0">{stat.label}</span>
            </div>
            <p className={`font-mono text-2xl font-bold ${stat.color} tabular-nums`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Exercise List */}
      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <ExerciseRow
            key={ex.id}
            exercise={ex}
            index={i}
            onUpdate={(field, value) => updateExercise(ex.id, field, value)}
            onRemove={() => removeExercise(ex.id)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={addExercise}
          className="group flex items-center gap-2 px-5 py-3 border-2 border-dashed border-fitti-border hover:border-fitti-green/40 rounded-2xl font-display text-sm font-bold text-fitti-text-muted hover:text-fitti-green transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          Add Exercise
        </button>
        
        <div className="flex-1" />

        <button
          onClick={handleSave}
          disabled={saving || exercises.every(e => !e.name)}
          className="group btn-gradient flex items-center gap-3 px-8 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saved ? (
            <>
              <Check className="h-5 w-5 animate-bounce-in" />
              <span className="font-display font-bold">Saved!</span>
            </>
          ) : saving ? (
            <>
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="font-display font-bold">Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-display font-bold">Save Workout</span>
            </>
          )}
        </button>
      </div>

      {/* Previous Workout Logs */}
      {logs.length > 0 && (
        <div className="mt-12">
          <h3 className="font-display text-xl font-bold text-fitti-text mb-5 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-fitti-green" />
            <span>Recent Sessions</span>
          </h3>
          <div className="space-y-4 stagger-children">
            {logs.map(log => (
              <div key={log.id} className="card-glass p-6 hover:shadow-lg hover:shadow-fitti-green/5 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-fitti-green/10 flex items-center justify-center">
                      <Dumbbell className="h-4 w-4 text-fitti-green" />
                    </div>
                    <span className="font-body text-sm font-bold text-fitti-text">
                      {new Date(log.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-xs text-fitti-text-muted">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{log.total_time || 0}m</span>
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" />{log.total_sets || 0} sets</span>
                    <span className="flex items-center gap-1 text-fitti-green font-bold"><Flame className="h-3 w-3" />{log.total_calories || 0} kcal</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(log.exercises || []).map((ex, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-fitti-bg/50 rounded-full text-[11px] font-body font-medium text-fitti-text border border-fitti-border/30">
                      <span className="font-bold">{ex.name}</span>
                      {ex.sets > 0 && ex.reps > 0 && <span className="text-fitti-text-muted">• {ex.sets}×{ex.reps}</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
