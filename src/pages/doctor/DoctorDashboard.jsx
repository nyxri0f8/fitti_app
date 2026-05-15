import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Users, FileText, Heart, Shield, Plus, X, Save, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import Sidebar from '../../components/shared/Sidebar';
import Navbar from '../../components/shared/Navbar';
import FloatingBackground from '../../components/shared/FloatingBackground';
import MessagingView from '../../components/chat/MessagingView';
import Modal from '../../components/shared/Modal';


function CreateRecordModal({ patient, doctorId, onClose, onSaved }) {
  const [rec, setRec] = useState({ health_summary:'', conditions:'', medications:'', workout_restrictions:'', dietary_restrictions:'', follow_up_date:'' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('medical_records').insert([{
      customer_id: patient.id, doctor_id: doctorId,
      health_summary: rec.health_summary, conditions: rec.conditions,
      medications: rec.medications, workout_restrictions: rec.workout_restrictions,
      dietary_restrictions: rec.dietary_restrictions,
      follow_up_date: rec.follow_up_date || null,
    }]);
    if (error) { console.error('Insert error:', error); setSaving(false); return; }
    await supabase.from('activity_feed').insert([{ actor_id: doctorId, actor_role: 'doctor', customer_id: patient.id, event_type: 'medical_updated', event_data: { conditions: rec.conditions } }]);
    setSaving(false); onSaved(); onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <div><h3 className="text-xl font-display font-bold text-fitti-text">Medical Record</h3><p className="text-sm text-fitti-text-muted">For {patient.name}</p></div>
        <button onClick={onClose} className="p-2 hover:bg-fitti-bg rounded-full transition-colors"><X className="h-5 w-5 text-fitti-text-muted"/></button>
      </div>
      <div className="space-y-4">
        <div><label className="label-spaced block mb-1">Health Summary</label><textarea value={rec.health_summary} onChange={e=>setRec(p=>({...p,health_summary:e.target.value}))} rows="3" placeholder="Overall health assessment..." className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none resize-none"/></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label-spaced block mb-1">Conditions</label><input value={rec.conditions} onChange={e=>setRec(p=>({...p,conditions:e.target.value}))} placeholder="e.g. Hypertension, Diabetes" className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none"/></div>
          <div><label className="label-spaced block mb-1">Medications</label><input value={rec.medications} onChange={e=>setRec(p=>({...p,medications:e.target.value}))} placeholder="e.g. Metformin 500mg" className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none"/></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label-spaced block mb-1">Workout Restrictions</label><input value={rec.workout_restrictions} onChange={e=>setRec(p=>({...p,workout_restrictions:e.target.value}))} placeholder="e.g. No heavy lifting" className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none"/></div>
          <div><label className="label-spaced block mb-1">Dietary Restrictions</label><input value={rec.dietary_restrictions} onChange={e=>setRec(p=>({...p,dietary_restrictions:e.target.value}))} placeholder="e.g. Low sodium" className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none"/></div>
        </div>
        <div><label className="label-spaced block mb-1">Follow-up Date</label><input type="date" value={rec.follow_up_date} onChange={e=>setRec(p=>({...p,follow_up_date:e.target.value}))} className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none"/></div>
      </div>
      <button onClick={handleSave} disabled={saving||!rec.health_summary} className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-fitti-green text-white font-bold rounded-xl hover:bg-fitti-green-dark transition-colors disabled:opacity-50">
        <Save className="h-4 w-4"/>{saving ? 'Saving...' : 'Save Medical Record'}
      </button>
    </Modal>
  );
}

function PatientsTab({ onOpenRecord }) {
  const user = useAuthStore(state => state.user);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data } = await supabase.from('customers').select('*, profiles!customers_id_fkey(full_name, email, phone)').eq('assigned_doctor', user.id);
      setPatients((data||[]).map(c => ({ ...c, name: c.profiles?.full_name||'Unknown', email: c.profiles?.email, phone: c.profiles?.phone })));
      setLoading(false);
    };
    if(user) fetchPatients();
  }, [user]);

  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto space-y-12 md:space-y-24">
      {/* Header Section */}
      <section className="animate-v-fade-up">
        <span className="eyebrow-tag">Medical Overview</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-fitti-text mb-8 tracking-tighter leading-[0.9]">
              Medical <br/>
              <span className="text-fitti-green">Dashboard</span>.
            </h2>
            <p className="font-accent text-xl md:text-2xl italic text-fitti-text-muted max-w-xl leading-relaxed">
              Monitoring health status and treatment compliance for {patients.length} active patients.
            </p>
          </div>
          <div className="bezel-shell w-full lg:w-72 h-32 md:h-48 group overflow-hidden">
            <div className="bezel-core h-full flex flex-col items-center justify-center relative text-center">
              <div className="mesh-glow w-full h-full opacity-40 group-hover:scale-125 transition-transform duration-1000" />
              <Shield strokeWidth={1} className="h-10 w-10 text-fitti-green mb-2" />
              <span className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-[0.2em]">Health Network</span>
              <span className="font-display text-2xl font-black text-fitti-green">Active</span>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1,2].map(i=><div key={i} className="bezel-shell h-64 shimmer"/>)}
        </div>
      ) : patients.length===0 ? (
        <div className="bezel-shell min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Heart strokeWidth={1} className="h-20 w-20 text-fitti-border/40 mx-auto mb-6" />
            <p className="font-body text-fitti-text-muted font-bold text-xl uppercase tracking-widest">No patient profiles assigned.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 stagger-v-fade">
          {patients.map((p, idx) => (
            <div key={p.id} className="md:col-span-6 bezel-shell group">
              <div className="bezel-core p-8 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 mesh-glow opacity-5 group-hover:opacity-20 transition-opacity duration-1000" />
                
                <div className="flex items-center gap-6 mb-10">
                  <div className="h-16 w-16 rounded-2xl bg-fitti-green/5 flex items-center justify-center text-fitti-green font-display font-black text-2xl ring-1 ring-fitti-green/20 group-hover:bg-fitti-green group-hover:text-white transition-all duration-700 ease-vanguard">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-fitti-text text-2xl tracking-tight leading-none mb-1">{p.name}</h3>
                    <p className="font-mono text-[10px] text-fitti-text-muted uppercase tracking-[0.2em]">{p.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  {[
                    { label: 'Weight', value: p.weight?`${p.weight} kg`:'—' },
                    { label: 'Condition', value: p.medical_conditions||'Clear' },
                    { label: 'Goal', value: p.goal?.replace(/_/g,' ')||'—', isTag: true },
                    { label: 'Preference', value: p.food_preference?.replace(/_/g,' ')||'—', isTag: true }
                  ].map((stat, i) => (
                    <div key={i} className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 ring-1 ring-black/5">
                      <p className="label-spaced !text-[8px] !mb-1 opacity-50">{stat.label}</p>
                      <p className={`font-display font-bold ${stat.isTag ? 'text-[9px] text-fitti-green uppercase' : 'text-xs text-fitti-text'}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <button onClick={()=>onOpenRecord(p)} className="btn-vanguard btn-vanguard-primary w-full py-4 group/btn">
                  <Plus strokeWidth={2.5} className="h-4 w-4 group-hover/btn:rotate-90 transition-transform" />
                  Create Medical Record
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecordsTab() {
  const user = useAuthStore(state => state.user);
  const [records, setRecords] = useState([]);
  useEffect(() => {
    const f = async () => {
      // Use a simpler query without the foreign key hint to avoid errors
      const { data } = await supabase.from('medical_records').select('*').eq('doctor_id', user.id).order('created_at', { ascending: false });
      if (data && data.length > 0) {
        // Fetch patient names separately
        const customerIds = [...new Set(data.map(r => r.customer_id))];
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', customerIds);
        const nameMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]));
        setRecords(data.map(r => ({ ...r, patient_name: nameMap[r.customer_id] || 'Unknown' })));
      } else {
        setRecords([]);
      }
    };
    if (user) f();
  }, [user]);

  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto space-y-12 md:space-y-24">
      {/* Header Section */}
      <section className="animate-v-fade-up">
        <span className="eyebrow-tag">Clinical History</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-fitti-text mb-8 tracking-tighter leading-[0.9]">
              Medical <br/>
              <span className="text-fitti-green">Records</span>.
            </h2>
            <p className="font-accent text-xl md:text-2xl italic text-fitti-text-muted max-w-xl leading-relaxed">
              Comprehensive health documentation and diagnostic history for your patients.
            </p>
          </div>
          <div className="bezel-shell w-full lg:w-72 h-32 md:h-48 group overflow-hidden">
            <div className="bezel-core h-full flex flex-col items-center justify-center relative text-center">
              <div className="mesh-glow w-full h-full opacity-40 group-hover:scale-125 transition-transform duration-1000" />
              <FileText strokeWidth={1} className="h-10 w-10 text-fitti-green mb-2" />
              <span className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-[0.2em]">Total Files</span>
              <span className="font-display text-2xl font-black text-fitti-green">{records.length}</span>
            </div>
          </div>
        </div>
      </section>
      
      {records.length===0 ? (
        <div className="bezel-shell min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Shield strokeWidth={1} className="h-20 w-20 text-fitti-border/40 mx-auto mb-6"/>
            <p className="font-body text-fitti-text-muted font-bold text-xl uppercase tracking-widest">No medical files discovered.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-12 stagger-v-fade">
          {records.map((r, idx) => (
            <div key={r.id} className="bezel-shell group overflow-hidden">
              <div className="bezel-core p-8 md:p-12 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 mesh-glow opacity-5 group-hover:opacity-10 transition-opacity duration-1000" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-fitti-green/10 flex items-center justify-center text-fitti-green font-display font-black text-2xl ring-1 ring-fitti-green/20">
                      {r.patient_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-fitti-text text-3xl tracking-tight leading-none mb-2">{r.patient_name}</h3>
                      <p className="font-mono text-[10px] text-fitti-text-muted uppercase tracking-[0.2em]">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {r.follow_up_date && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-fitti-green/5 rounded-xl border border-fitti-green/10 text-fitti-green font-mono text-[10px] font-black uppercase tracking-widest">
                      <Calendar className="h-3 w-3"/> Next Review: {new Date(r.follow_up_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="mb-10">
                  <p className="font-mono text-[9px] font-black text-fitti-green uppercase tracking-[0.2em] mb-4 border-b border-fitti-green/10 pb-2">Clinical Assessment</p>
                  <p className="font-body text-lg text-fitti-text leading-relaxed">{r.health_summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Conditions', value: r.conditions, color: 'bg-fitti-bg-alt' },
                    { label: 'Medications', value: r.medications, color: 'bg-blue-50/50 dark:bg-blue-900/10' },
                    { label: 'Restrictions', value: r.workout_restrictions, color: 'bg-amber-50/50 dark:bg-amber-900/10' },
                    { label: 'Dietary', value: r.dietary_restrictions, color: 'bg-green-50/50 dark:bg-green-900/10' }
                  ].map((field, i) => field.value && (
                    <div key={i} className={`rounded-2xl p-6 ring-1 ring-black/5 ${field.color}`}>
                      <p className="label-spaced !text-[9px] !mb-3 opacity-50">{field.label}</p>
                      <p className="font-display font-bold text-sm text-fitti-text">
                        {field.value}
                      </p>
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

export default function DoctorDashboard() {
  const [showRecord, setShowRecord] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const user = useAuthStore(state => state.user);
  
  return (
    <div className="flex min-h-[100dvh] bg-fitti-bg relative overflow-hidden">
      {/* Global Grain Texture Overlay */}
      <div className="grain-overlay" />
      
      <FloatingBackground role="doctor"/>
      <Sidebar/>
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="" />
        <main className="flex-1 overflow-y-auto pb-24">
          <Routes>
            <Route path="/" element={<PatientsTab onOpenRecord={setShowRecord} />}/>
            <Route path="/records" element={<RecordsTab key={refreshKey} />}/>
            <Route path="/messages" element={<MessagingView/>}/>
          </Routes>
        </main>
      </div>
      {/* Modals rendered outside overflow container via Portal */}
      {showRecord && <CreateRecordModal patient={showRecord} doctorId={user.id} onClose={()=>setShowRecord(null)} onSaved={()=>setRefreshKey(k=>k+1)} />}
    </div>
  );
}
