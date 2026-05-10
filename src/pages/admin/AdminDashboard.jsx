import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Users, ChefHat, Dumbbell, Stethoscope, ChevronRight, Package, Activity as ActivityIcon, UserPlus, Eye, X, Save, TrendingUp, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import Sidebar from '../../components/shared/Sidebar';
import Navbar from '../../components/shared/Navbar';
import FloatingBackground from '../../components/shared/FloatingBackground';
import MessagingView from '../../components/chat/MessagingView';
import Modal from '../../components/shared/Modal';
import { nanoid } from 'nanoid';

/* ── Overview Tab ──────────────────────────────────────── */
function OverviewTab() {
  const [stats, setStats] = useState({ customers: 0, cooks: 0, trainers: 0, doctors: 0 });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: profiles } = await supabase.from('profiles').select('role');
      if (profiles) {
        setStats({
          customers: profiles.filter(p => p.role === 'customer').length,
          cooks: profiles.filter(p => p.role === 'cook').length,
          trainers: profiles.filter(p => p.role === 'trainer').length,
          doctors: profiles.filter(p => p.role === 'doctor').length,
        });
      }
      const { data: activity } = await supabase.from('activity_feed').select('*').order('created_at', { ascending: false }).limit(5);
      setRecentActivity(activity || []);
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Clients', count: stats.customers, icon: <Users className="text-fitti-green h-6 w-6" />, color: 'bg-emerald-50' },
    { title: 'Cooks', count: stats.cooks, icon: <ChefHat className="text-fitti-orange h-6 w-6" />, color: 'bg-orange-50' },
    { title: 'Trainers', count: stats.trainers, icon: <Dumbbell className="text-blue-500 h-6 w-6" />, color: 'bg-blue-50' },
    { title: 'Doctors', count: stats.doctors, icon: <Stethoscope className="text-purple-500 h-6 w-6" />, color: 'bg-purple-50' },
  ];

  return (
    <div className="p-8 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 stagger-children">
        {cards.map(stat => (
          <div key={stat.title} className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-3xl p-6 shadow-sm card-hover cursor-pointer group">
            <div className="flex justify-between items-center mb-6">
              <span className={`p-4 ${stat.color} rounded-2xl transition-transform group-hover:scale-110 duration-300`}>{stat.icon}</span>
              <h3 className="label-spaced">{stat.title}</h3>
            </div>
            <p className="text-5xl font-display font-black text-fitti-text tracking-tighter">{stat.count}</p>
            <div className="mt-6 pt-4 border-t border-fitti-border/50 text-fitti-text-muted text-xs font-bold flex justify-between items-center group-hover:text-fitti-green transition-colors">
              <span className="uppercase tracking-widest">View details</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-3xl shadow-sm p-8 animate-scale-in">
        <h3 className="text-lg font-display font-bold text-fitti-text mb-6">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <ActivityIcon className="h-10 w-10 text-fitti-border mx-auto mb-4" />
            <p className="text-fitti-text-muted text-sm font-medium">No activity yet. Assign staff to clients to get started.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {recentActivity.map(a => (
              <li key={a.id} className="flex items-center gap-4 text-sm text-fitti-text-dark pb-4 border-b border-fitti-border last:border-0 last:pb-0">
                <div className="h-2 w-2 rounded-full bg-fitti-green animate-pulse" />
                <div className="flex-1">
                  <span className="font-bold capitalize">{a.event_type?.replace(/_/g, ' ')}</span>
                  <p className="text-xs text-fitti-text-muted mt-0.5">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ── Users Tab (View & Assign Staff) ──────────────────── */
function UsersTab() {
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState({ cooks: [], doctors: [], trainers: [] });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [assignments, setAssignments] = useState({ cook: '', doctor: '', trainer: '' });
  const [saving, setSaving] = useState(false);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const fetchData = async () => {
      const { data: customerProfiles } = await supabase.from('profiles').select('*').eq('role', 'customer');
      const { data: customerRecords } = await supabase.from('customers').select('*');
      const merged = (customerProfiles || []).map(cp => ({ ...cp, ...(customerRecords || []).find(cr => cr.id === cp.id) }));
      setCustomers(merged);

      const { data: allStaff } = await supabase.from('profiles').select('*').in('role', ['cook', 'doctor', 'trainer']);
      if (allStaff) {
        setStaff({
          cooks: allStaff.filter(s => s.role === 'cook'),
          doctors: allStaff.filter(s => s.role === 'doctor'),
          trainers: allStaff.filter(s => s.role === 'trainer'),
        });
      }
    };
    fetchData();
  }, []);

  const openDetails = (customer) => {
    setSelectedCustomer(customer);
    setAssignments({
      cook: customer.assigned_cook || '',
      doctor: customer.assigned_doctor || '',
      trainer: customer.assigned_trainer || '',
    });
  };

  const saveAssignments = async () => {
    if (!selectedCustomer) return;
    setSaving(true);
    const { error } = await supabase.from('customers').update({
      assigned_cook: assignments.cook || null,
      assigned_doctor: assignments.doctor || null,
      assigned_trainer: assignments.trainer || null,
    }).eq('id', selectedCustomer.id);

    if (!error) {
      await supabase.from('activity_feed').insert([{ actor_id: user.id, actor_role: 'admin', customer_id: selectedCustomer.id, event_type: 'user_assigned', event_data: assignments }]);
      setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, ...assignments } : c));
      setSelectedCustomer(null);
    }
    setSaving(false);
  };

  const getStaffName = (id, list) => list.find(s => s.id === id)?.full_name || '—';

  return (
    <div className="p-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-display font-black text-fitti-text tracking-tight uppercase">Clients Portal</h2>
        <span className="px-4 py-1.5 bg-fitti-green/10 text-fitti-green rounded-full text-xs font-bold uppercase tracking-widest">{customers.length} total</span>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-3xl p-16 text-center animate-scale-in">
          <Users className="h-16 w-16 text-fitti-border mx-auto mb-6" />
          <p className="text-fitti-text-muted font-bold text-lg">No clients onboarded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {customers.map(c => (
            <div key={c.id} className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-3xl p-8 shadow-sm card-hover group">
              <div className="flex items-center mb-8">
                <div className="h-14 w-14 rounded-2xl bg-fitti-green shadow-lg shadow-fitti-green/20 flex items-center justify-center text-white font-black text-xl flex-shrink-0 animate-scale-in">
                  {c.full_name?.charAt(0) || '?'}
                </div>
                <div className="ml-4 overflow-hidden">
                  <h3 className="font-black text-lg text-fitti-text truncate group-hover:text-fitti-green transition-colors">{c.full_name || 'Unnamed'}</h3>
                  <p className="text-xs font-medium text-fitti-text-muted truncate">{c.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-fitti-bg-alt/50 rounded-2xl p-4 transition-colors group-hover:bg-fitti-green/5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingUp className="h-3 w-3 text-fitti-green" />
                    <span className="label-spaced !text-[9px]">Goal</span>
                  </div>
                  <p className="font-bold text-fitti-text text-sm capitalize">{c.goal?.replace(/_/g, ' ') || '—'}</p>
                </div>
                <div className="bg-fitti-bg-alt/50 rounded-2xl p-4 transition-colors group-hover:bg-fitti-green/5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Heart className="h-3 w-3 text-red-400" />
                    <span className="label-spaced !text-[9px]">Weight</span>
                  </div>
                  <p className="font-bold text-fitti-text text-sm">{c.weight ? `${c.weight}kg` : '—'}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-3 bg-fitti-bg/30 rounded-xl border border-fitti-border/30">
                  <span className="label-spaced !text-[8px]">Cook</span>
                  <span className="text-[11px] font-bold text-fitti-green truncate ml-4">{getStaffName(c.assigned_cook, staff.cooks)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-fitti-bg/30 rounded-xl border border-fitti-border/30">
                  <span className="label-spaced !text-[8px]">Doctor</span>
                  <span className="text-[11px] font-bold text-purple-600 truncate ml-4">{getStaffName(c.assigned_doctor, staff.doctors)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-fitti-bg/30 rounded-xl border border-fitti-border/30">
                  <span className="label-spaced !text-[8px]">Trainer</span>
                  <span className="text-[11px] font-bold text-blue-600 truncate ml-4">{getStaffName(c.assigned_trainer, staff.trainers)}</span>
                </div>
              </div>

              <button
                onClick={() => openDetails(c)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-fitti-green text-white rounded-2xl text-xs font-black uppercase tracking-[0.15em] hover:bg-fitti-green-dark transition-all shadow-lg shadow-fitti-green/10"
              >
                <UserPlus className="h-4 w-4" /> Manage Access
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedCustomer && (
        <Modal onClose={() => setSelectedCustomer(null)}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-display font-black text-fitti-text tracking-tight uppercase">Staff Assignments</h3>
              <p className="text-sm font-bold text-fitti-text-muted mt-1">Configure access for {selectedCustomer.full_name}</p>
            </div>
            <button onClick={() => setSelectedCustomer(null)} className="p-3 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group">
              <X className="h-6 w-6 text-fitti-text-muted group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {[
                { label: 'Primary Cook', icon: <ChefHat className="h-4 w-4 text-fitti-orange" />, key: 'cook', list: staff.cooks, color: 'border-orange-100 focus:border-fitti-orange ring-orange-500/20' },
                { label: 'Medical Doctor', icon: <Stethoscope className="h-4 w-4 text-purple-500" />, key: 'doctor', list: staff.doctors, color: 'border-purple-100 focus:border-purple-500 ring-purple-500/20' },
                { label: 'Fitness Trainer', icon: <Dumbbell className="h-4 w-4 text-blue-500" />, key: 'trainer', list: staff.trainers, color: 'border-blue-100 focus:border-blue-500 ring-blue-500/20' }
              ].map(field => (
                <div key={field.key} className="animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-3">
                    {field.icon}
                    <label className="label-spaced !text-[10px]">{field.label}</label>
                  </div>
                  <select
                    value={assignments[field.key]}
                    onChange={e => setAssignments(p => ({ ...p, [field.key]: e.target.value }))}
                    className={`w-full bg-fitti-bg/50 border rounded-2xl px-5 py-4 font-bold text-fitti-text focus:outline-none focus:ring-4 transition-all appearance-none cursor-pointer ${field.color}`}
                  >
                    <option value="">— Unassigned —</option>
                    {field.list.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <button
              onClick={saveAssignments}
              disabled={saving}
              className="mt-8 w-full flex items-center justify-center gap-3 py-5 bg-fitti-green text-white font-black rounded-2xl hover:bg-fitti-green-dark transition-all disabled:opacity-50 shadow-xl shadow-fitti-green/20 uppercase tracking-[0.2em] text-xs"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Assignments
                </>
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Orders Tab ────────────────────────────────────────── */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:customer_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });
      setOrders(data || []);
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-8 animate-fade-in-up">
      <h2 className="text-3xl font-display font-black text-fitti-text tracking-tight uppercase mb-8">Fleet Logistics</h2>
      {orders.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-3xl p-16 text-center">
          <Package className="h-16 w-16 text-fitti-border mx-auto mb-6" />
          <p className="text-fitti-text-muted font-bold">No active orders found.</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-3xl shadow-sm overflow-hidden animate-scale-in">
          <table className="w-full">
            <thead>
              <tr className="bg-fitti-bg/50 border-b border-fitti-border">
                <th className="px-8 py-5 text-left label-spaced">Customer Entity</th>
                <th className="px-8 py-5 text-left label-spaced">Logistics Status</th>
                <th className="px-8 py-5 text-left label-spaced">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fitti-border/50">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-fitti-green/5 transition-colors group">
                  <td className="px-8 py-6 text-sm font-black text-fitti-text group-hover:text-fitti-green transition-colors">{o.profiles?.full_name || 'Unknown'}</td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black px-4 py-1.5 bg-fitti-bg-alt text-fitti-text-muted rounded-full uppercase tracking-widest border border-fitti-border/50">
                      {o.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-fitti-text-muted">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Activity Tab ──────────────────────────────────────── */
function ActivityTab() {
  const [feed, setFeed] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('activity_feed').select('*').order('created_at', { ascending: false }).limit(50);
      setFeed(data || []);
    };
    fetch();
  }, []);

  return (
    <div className="p-8 animate-fade-in-up">
      <h2 className="text-3xl font-display font-black text-fitti-text tracking-tight uppercase mb-8">System Telemetry</h2>
      {feed.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-3xl p-16 text-center">
          <ActivityIcon className="h-16 w-16 text-fitti-border mx-auto mb-6" />
          <p className="text-fitti-text-muted font-bold">Telemetry feed is empty.</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {feed.map(a => (
            <div key={a.id} className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-2xl p-6 flex items-center gap-6 card-hover group">
              <div className="h-14 w-14 rounded-2xl bg-fitti-green/5 flex items-center justify-center flex-shrink-0 group-hover:bg-fitti-green/10 transition-colors">
                <ActivityIcon className="h-6 w-6 text-fitti-green" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-fitti-text uppercase tracking-tight group-hover:text-fitti-green transition-colors">
                  {a.event_type?.replace(/_/g, ' ')}
                </p>
                <p className="text-xs font-bold text-fitti-text-muted mt-1">{new Date(a.created_at).toLocaleString()}</p>
              </div>
              <div className="hidden md:block">
                 <span className="text-[10px] font-black px-4 py-2 bg-fitti-bg text-fitti-text-muted rounded-full uppercase tracking-[0.2em]">Live</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Admin Dashboard ─────────────────────────────── */
export default function AdminDashboard() {
  const user = useAuthStore(state => state.user);
  const setActiveCall = useAuthStore(state => state.setActiveCall);

  const startVideoCall = async (contact) => {
    const roomCode = nanoid(8);
    await supabase.from('meet_sessions').insert([{ room_code: roomCode, host_id: user.id, guest_id: contact.id, session_type: 'admin_any' }]);
    setActiveCall({ roomCode, isHost: true, guestId: contact.id, remoteName: contact.name });
  };

  return (
    <div className="flex h-screen bg-fitti-bg relative">
      <FloatingBackground role="admin" />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Navbar title="Admin Operations" />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<OverviewTab />} />
            <Route path="/users" element={<UsersTab />} />
            <Route path="/orders" element={<OrdersTab />} />
            <Route path="/activity" element={<ActivityTab />} />
            <Route path="/messages" element={<MessagingView onStartVideoCall={startVideoCall} />} />
            <Route path="/sessions" element={<div className="p-8"><h2 className="text-3xl font-display font-black text-fitti-text tracking-tight uppercase mb-4">Video Infrastructure</h2><div className="bg-white/80 backdrop-blur-md border border-fitti-border rounded-3xl p-16 text-center"><p className="text-fitti-text-muted font-bold">Use the Messages tab to initiate encrypted sessions.</p></div></div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

