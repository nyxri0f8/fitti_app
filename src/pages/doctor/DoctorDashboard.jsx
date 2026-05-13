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
import { nanoid } from 'nanoid';

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
    <div className="p-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-fitti-text flex items-center gap-2"><Heart className="h-6 w-6 text-fitti-green"/>My Patients</h2>
        <span className="text-sm text-fitti-text-muted">{patients.length} assigned</span>
      </div>
      {loading ? <div className="space-y-4">{[1,2].map(i=><div key={i} className="h-28 bg-white rounded-2xl shimmer"/>)}</div>
      : patients.length===0 ? (
        <div className="bg-white border border-fitti-border rounded-2xl p-12 text-center animate-scale-in">
          <Users className="h-12 w-12 text-fitti-text-muted mx-auto mb-4"/><p className="text-fitti-text-muted font-medium">No patients assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
          {patients.map(p => (
            <div key={p.id} className="bg-white border border-fitti-border rounded-2xl p-6 shadow-sm card-hover">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg flex-shrink-0">{p.name.charAt(0)}</div>
                <div className="ml-3"><h3 className="font-bold text-fitti-text">{p.name}</h3><p className="text-xs text-fitti-text-muted">{p.email}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-fitti-bg rounded-xl p-3"><p className="text-fitti-text-muted text-xs">Weight</p><p className="font-bold text-fitti-text">{p.weight?`${p.weight} kg`:'—'}</p></div>
                <div className="bg-fitti-bg rounded-xl p-3"><p className="text-fitti-text-muted text-xs">Goal</p><p className="font-bold text-fitti-text capitalize">{p.goal?.replace(/_/g,' ')||'—'}</p></div>
                <div className="bg-fitti-bg rounded-xl p-3"><p className="text-fitti-text-muted text-xs">Food Pref</p><p className="font-bold text-fitti-text capitalize">{p.food_preference?.replace(/_/g,' ')||'—'}</p></div>
                <div className="bg-fitti-bg rounded-xl p-3"><p className="text-fitti-text-muted text-xs">Conditions</p><p className="font-bold text-fitti-text">{p.medical_conditions||'None'}</p></div>
              </div>
              <button onClick={()=>onOpenRecord(p)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-sm font-semibold text-purple-600 hover:bg-purple-100 transition-colors">
                <Plus className="h-4 w-4"/>Add Medical Record
              </button>
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
    <div className="p-8 animate-fade-in-up">
      <h2 className="text-2xl font-display font-bold text-fitti-text mb-6 flex items-center gap-2"><FileText className="h-6 w-6 text-fitti-green"/>Medical Records</h2>
      {records.length===0 ? (
        <div className="bg-white border border-fitti-border rounded-2xl p-12 text-center">
          <Shield className="h-12 w-12 text-fitti-text-muted mx-auto mb-4"/><p className="text-fitti-text-muted">No records yet. Go to My Patients to create one.</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">{records.map(r => (
          <div key={r.id} className="bg-white border border-fitti-border rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-fitti-text">{r.patient_name}</h3>
              <span className="text-xs text-fitti-text-muted">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-fitti-text-dark mb-3">{r.health_summary}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {r.conditions && <div className="bg-fitti-bg-alt rounded-lg p-2"><p className="text-fitti-green font-medium">Conditions</p><p className="text-black font-semibold">{r.conditions}</p></div>}
              {r.medications && <div className="bg-blue-50 rounded-lg p-2"><p className="text-fitti-green font-medium">Medications</p><p className="text-fitti-green font-semibold">{r.medications}</p></div>}
              {r.workout_restrictions && <div className="bg-amber-50 rounded-lg p-2"><p className="text-amber-400 font-medium">Workout Limits</p><p className="text-amber-600 font-semibold">{r.workout_restrictions}</p></div>}
              {r.dietary_restrictions && <div className="bg-green-50 rounded-lg p-2"><p className="text-green-400 font-medium">Diet Limits</p><p className="text-green-600 font-semibold">{r.dietary_restrictions}</p></div>}
            </div>
            {r.follow_up_date && <div className="mt-3 flex items-center gap-2 text-xs text-fitti-text-muted"><Calendar className="h-3 w-3"/>Follow-up: {new Date(r.follow_up_date).toLocaleDateString()}</div>}
          </div>
        ))}</div>
      )}
    </div>
  );
}

export default function DoctorDashboard() {
  const [showRecord, setShowRecord] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const user = useAuthStore(state => state.user);
  const setActiveCall = useAuthStore(state => state.setActiveCall);

  const startVideoCall = async (contact) => {
    const roomCode = nanoid(8);
    await supabase.from('meet_sessions').insert([{ room_code: roomCode, host_id: user.id, guest_id: contact.id, session_type: 'customer_doctor' }]);
    setActiveCall({ roomCode, isHost: true, guestId: contact.id, remoteName: contact.name });
  };

  return (
    <div className="flex h-screen bg-fitti-bg relative">
      <FloatingBackground role="doctor"/>
      <Sidebar/>
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Navbar title="" />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<PatientsTab onOpenRecord={setShowRecord} />}/>
            <Route path="/records" element={<RecordsTab key={refreshKey} />}/>
            <Route path="/messages" element={<MessagingView onStartVideoCall={startVideoCall}/>}/>
            <Route path="/sessions" element={<div className="p-8 animate-fade-in-up"><h2 className="text-2xl font-bold text-fitti-text mb-4">Video Sessions</h2><div className="bg-white border border-fitti-border rounded-2xl p-12 text-center"><p className="text-fitti-text-muted">Use Messages tab to start a call.</p></div></div>}/>
          </Routes>
        </main>
      </div>
      {/* Modals rendered outside overflow container via Portal */}
      {showRecord && <CreateRecordModal patient={showRecord} doctorId={user.id} onClose={()=>setShowRecord(null)} onSaved={()=>setRefreshKey(k=>k+1)} />}
    </div>
  );
}
