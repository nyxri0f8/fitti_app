import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Package, Clock, CheckCircle, ChevronDown, Plus, X, Save, Utensils, Flame } from 'lucide-react';
import { supabase, createNotification } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import Sidebar from '../../components/shared/Sidebar';
import Navbar from '../../components/shared/Navbar';
import StatusBadge from '../../components/shared/StatusBadge';
import FloatingBackground from '../../components/shared/FloatingBackground';
import MessagingView from '../../components/chat/MessagingView';
import Modal from '../../components/shared/Modal';

/* ── Create Meal Modal ─────────────────────────────────── */
function CreateMealModal({ customer, onClose, onSaved, cookId }) {
  const [meal, setMeal] = useState({
    meal_plan: '',
    calories: '',
    meals: [{ name: '', time: '08:00', protein: '', carbs: '', fat: '' }],
  });
  const [saving, setSaving] = useState(false);

  const addMealRow = () => {
    setMeal(prev => ({
      ...prev,
      meals: [...prev.meals, { name: '', time: '12:00', protein: '', carbs: '', fat: '' }]
    }));
  };

  const removeMealRow = (index) => {
    setMeal(prev => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index)
    }));
  };

  const updateMealRow = (index, field, value) => {
    setMeal(prev => ({
      ...prev,
      meals: prev.meals.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }));
  };

  const totalCalories = meal.meals.reduce((sum, m) => {
    const p = parseFloat(m.protein) || 0;
    const c = parseFloat(m.carbs) || 0;
    const f = parseFloat(m.fat) || 0;
    return sum + (p * 4) + (c * 4) + (f * 9);
  }, 0);

  const totalProtein = meal.meals.reduce((s, m) => s + (parseFloat(m.protein) || 0), 0);
  const totalCarbs = meal.meals.reduce((s, m) => s + (parseFloat(m.carbs) || 0), 0);
  const totalFat = meal.meals.reduce((s, m) => s + (parseFloat(m.fat) || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    // Create the order
    const { error } = await supabase.from('orders').insert([{
      customer_id: customer.id,
      meal_plan: meal.meal_plan || 'Custom Plan',
      calories: Math.round(totalCalories),
      status: 'pending',
      cook_notes: JSON.stringify(meal.meals),
      updated_by: cookId,
    }]);

    // Also create/update diet plan
    await supabase.from('diet_plans').insert([{
      customer_id: customer.id,
      created_by: cookId,
      daily_calories: Math.round(totalCalories),
      protein_grams: Math.round(totalProtein),
      carb_grams: Math.round(totalCarbs),
      fat_grams: Math.round(totalFat),
      meal_structure: meal.meals,
      active: true,
    }]);

    // Log activity
    await supabase.from('activity_feed').insert([{
      actor_id: cookId,
      actor_role: 'cook',
      customer_id: customer.id,
      event_type: 'diet_plan_created',
      event_data: { calories: Math.round(totalCalories), meals: meal.meals.length },
    }]);

    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Modal onClose={onClose}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-display font-bold text-fitti-text">Create Meal Plan</h3>
            <p className="text-sm text-fitti-text-muted">For {customer.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-fitti-bg rounded-full transition-colors">
            <X className="h-5 w-5 text-fitti-text-muted" />
          </button>
        </div>

        {/* Plan Name */}
        <div className="mb-4">
          <label className="label-spaced block mb-2">Plan Name</label>
          <input
            type="text"
            value={meal.meal_plan}
            onChange={e => setMeal(prev => ({ ...prev, meal_plan: e.target.value }))}
            placeholder="e.g. Weight Loss - Week 1"
            className="w-full bg-white border border-fitti-border rounded-xl px-4 py-3 focus:border-fitti-green focus:outline-none focus:ring-2 focus:ring-fitti-green/20"
          />
        </div>

        {/* Meal Rows */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <label className="label-spaced">Meals</label>
            <button onClick={addMealRow} className="flex items-center gap-1 text-sm text-fitti-green font-semibold hover:text-fitti-green-dark transition-colors">
              <Plus className="h-4 w-4" /> Add Meal
            </button>
          </div>

          {meal.meals.map((m, i) => (
            <div key={i} className="bg-fitti-bg rounded-xl p-4 space-y-3 relative">
              {meal.meals.length > 1 && (
                <button onClick={() => removeMealRow(i)} className="absolute top-2 right-2 p-1 hover:bg-white rounded-full transition-colors">
                  <X className="h-3 w-3 text-fitti-text-muted" />
                </button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-fitti-text-muted font-medium block mb-1">Meal Name</label>
                  <input type="text" value={m.name} onChange={e => updateMealRow(i, 'name', e.target.value)}
                    placeholder="e.g. Breakfast" className="w-full bg-white border border-fitti-border rounded-lg px-3 py-2 text-sm focus:border-fitti-green focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-fitti-text-muted font-medium block mb-1">Time</label>
                  <input type="time" value={m.time} onChange={e => updateMealRow(i, 'time', e.target.value)}
                    className="w-full bg-white border border-fitti-border rounded-lg px-3 py-2 text-sm focus:border-fitti-green focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-fitti-text-muted font-medium block mb-1">Protein (g)</label>
                  <input type="number" value={m.protein} onChange={e => updateMealRow(i, 'protein', e.target.value)}
                    placeholder="0" className="w-full bg-white border border-fitti-border rounded-lg px-3 py-2 text-sm focus:border-fitti-green focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-fitti-text-muted font-medium block mb-1">Carbs (g)</label>
                  <input type="number" value={m.carbs} onChange={e => updateMealRow(i, 'carbs', e.target.value)}
                    placeholder="0" className="w-full bg-white border border-fitti-border rounded-lg px-3 py-2 text-sm focus:border-fitti-green focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-fitti-text-muted font-medium block mb-1">Fat (g)</label>
                  <input type="number" value={m.fat} onChange={e => updateMealRow(i, 'fat', e.target.value)}
                    placeholder="0" className="w-full bg-white border border-fitti-border rounded-lg px-3 py-2 text-sm focus:border-fitti-green focus:outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Macro Totals */}
        <div className="bg-fitti-bg-alt rounded-xl p-4 mb-6">
          <h4 className="label-spaced mb-3">Daily Totals</h4>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-fitti-text-muted">Calories</p>
              <p className="text-xl font-display font-bold text-fitti-orange">{Math.round(totalCalories)}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-fitti-text-muted">Protein</p>
              <p className="text-xl font-display font-bold text-fitti-green">{Math.round(totalProtein)}g</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-fitti-text-muted">Carbs</p>
              <p className="text-xl font-display font-bold text-amber-500">{Math.round(totalCarbs)}g</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-fitti-text-muted">Fat</p>
              <p className="text-xl font-display font-bold text-fitti-green">{Math.round(totalFat)}g</p>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving || meal.meals.every(m => !m.name)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-fitti-green text-white font-bold rounded-xl hover:bg-fitti-green-dark transition-colors disabled:opacity-50">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Meal Plan & Create Order'}
        </button>
      </Modal>
  );
}

/* ── Orders Tab ────────────────────────────────────────── */
function OrdersTab() {
  const user = useAuthStore(state => state.user);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMealModal, setShowMealModal] = useState(null); // customer object or null

  const fetchData = async () => {
    // Get customers assigned to this cook
    const { data: custData } = await supabase.from('customers').select('id, profiles!customers_id_fkey(full_name, email)').eq('assigned_cook', user.id);
    const custs = (custData || []).map(c => ({ id: c.id, name: c.profiles?.full_name || 'Unknown', email: c.profiles?.email }));
    setCustomers(custs);

    const customerIds = custs.map(c => c.id);
    if (customerIds.length > 0) {
      const { data: orderData } = await supabase.from('orders').select('*').in('customer_id', customerIds).order('created_at', { ascending: false });
      const enriched = (orderData || []).map(o => {
        const cust = custs.find(c => c.id === o.customer_id);
        return { ...o, customer_name: cust?.name || 'Unknown' };
      });
      setOrders(enriched);
    }
    setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const updateOrderStatus = async (orderId, status) => {
    const order = orders.find(o => o.id === orderId);
    await supabase.from('orders').update({ status, updated_by: user.id, updated_at: new Date() }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    
    // Send notification to customer
    if (order) {
      createNotification(
        order.customer_id,
        'Order Update',
        `Your meal order status is now: ${status.replace(/_/g, ' ')}`,
        'order_status'
      );
    }
  };

  const parseMeals = (cookNotes) => {
    try { return JSON.parse(cookNotes); } catch { return null; }
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;

  return (
    <div className="p-8 animate-fade-in-up">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 stagger-children">
        <div className="bg-white border border-fitti-border rounded-2xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-amber-50 rounded-xl"><Clock className="h-6 w-6 text-amber-500" /></div>
            <span className="label-spaced">Pending</span>
          </div>
          <p className="text-3xl font-display font-black text-fitti-text">{pendingCount}</p>
        </div>
        <div className="bg-white border border-fitti-border rounded-2xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-50 rounded-xl"><Package className="h-6 w-6 text-fitti-green" /></div>
            <span className="label-spaced">Preparing</span>
          </div>
          <p className="text-3xl font-display font-black text-fitti-text">{preparingCount}</p>
        </div>
        <div className="bg-white border border-fitti-border rounded-2xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-fitti-bg-alt rounded-xl"><CheckCircle className="h-6 w-6 text-fitti-bg-alt0" /></div>
            <span className="label-spaced">Total Orders</span>
          </div>
          <p className="text-3xl font-display font-black text-fitti-text">{orders.length}</p>
        </div>
      </div>

      {/* Create Meal Button */}
      {customers.length > 0 && (
        <div className="mb-6">
          <h3 className="label-spaced mb-3">Create New Meal Plan</h3>
          <div className="flex flex-wrap gap-3">
            {customers.map(c => (
              <button key={c.id} onClick={() => setShowMealModal(c)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-fitti-border rounded-xl text-sm font-semibold text-fitti-green hover:bg-fitti-bg-alt transition-colors card-hover">
                <Plus className="h-4 w-4" /> {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Order Cards */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl shimmer" />)}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-fitti-border rounded-2xl p-12 text-center animate-scale-in">
          <Utensils className="h-12 w-12 text-fitti-text-muted mx-auto mb-4" />
          <p className="text-fitti-text-muted font-medium">No orders yet.</p>
          <p className="text-fitti-text-muted text-sm mt-1">Create a meal plan for your assigned clients above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {orders.map(o => {
            const meals = parseMeals(o.cook_notes);
            return (
              <div key={o.id} className="bg-white border border-fitti-border rounded-2xl shadow-sm p-6 card-hover">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-fitti-text text-lg">{o.customer_name}</h3>
                    <span className="text-xs font-semibold text-fitti-text-muted uppercase tracking-widest">
                      {o.meal_plan || 'Standard'} &middot; {o.calories || '—'} kcal
                    </span>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                {/* Meal Breakdown */}
                {meals && Array.isArray(meals) && (
                  <div className="space-y-2 mb-4">
                    {meals.map((m, i) => (
                      <div key={i} className="flex items-center justify-between bg-fitti-bg rounded-lg px-3 py-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Flame className="h-3 w-3 text-fitti-orange" />
                          <span className="font-semibold text-fitti-text">{m.name || `Meal ${i+1}`}</span>
                          <span className="text-fitti-text-muted">{m.time}</span>
                        </div>
                        <span className="text-fitti-text-muted">
                          P:{m.protein || 0} C:{m.carbs || 0} F:{m.fat || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Update */}
                <div className="relative">
                  <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                    className="w-full appearance-none bg-fitti-bg border border-fitti-border rounded-xl px-4 py-2.5 text-sm font-medium focus:border-fitti-green focus:outline-none pr-10">
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="packed">Packed</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fitti-text-muted pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Meal Modal */}
      {showMealModal && (
        <CreateMealModal
          customer={showMealModal}
          cookId={user.id}
          onClose={() => setShowMealModal(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}

function HistoryTab() {
  const user = useAuthStore(state => state.user);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: custData } = await supabase.from('customers').select('id, profiles!customers_id_fkey(full_name)').eq('assigned_cook', user.id);
      const custs = (custData || []).map(c => ({ id: c.id, name: c.profiles?.full_name }));
      const customerIds = custs.map(c => c.id);

      if (customerIds.length > 0) {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .in('customer_id', customerIds)
          .eq('status', 'delivered')
          .order('updated_at', { ascending: false });
        
        const enriched = (data || []).map(o => {
          const cust = custs.find(c => c.id === o.customer_id);
          return { ...o, customer_name: cust?.name || 'Unknown' };
        });
        setHistory(enriched);
      }
      setLoading(false);
    };
    if (user) fetchHistory();
  }, [user]);

  return (
    <div className="p-8 animate-fade-in-up">
      <h2 className="text-2xl font-display font-bold text-fitti-text mb-6">Order History</h2>
      {loading ? (
        <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-20 bg-white rounded-2xl shimmer" />)}</div>
      ) : history.length === 0 ? (
        <div className="bg-white border border-fitti-border rounded-2xl p-12 text-center">
          <Clock className="h-12 w-12 text-fitti-text-muted mx-auto mb-4" />
          <p className="text-fitti-text-muted">No delivered orders yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-fitti-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-fitti-bg-alt border-b border-fitti-border">
              <tr>
                <th className="px-6 py-4 label-spaced">Date</th>
                <th className="px-6 py-4 label-spaced">Client</th>
                <th className="px-6 py-4 label-spaced">Plan</th>
                <th className="px-6 py-4 label-spaced">Calories</th>
                <th className="px-6 py-4 label-spaced text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fitti-border">
              {history.map(o => (
                <tr key={o.id} className="hover:bg-fitti-bg transition-colors">
                  <td className="px-6 py-4 text-sm text-fitti-text font-medium">{new Date(o.updated_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-fitti-text font-bold">{o.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-fitti-text-muted">{o.meal_plan}</td>
                  <td className="px-6 py-4 text-sm text-fitti-green font-bold">{o.calories} kcal</td>
                  <td className="px-6 py-4 text-right"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Main Cook Dashboard ──────────────────────────────── */
export default function CookDashboard() {
  return (
    <div className="flex h-screen bg-fitti-bg relative">
      <FloatingBackground role="cook" />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Navbar title="" />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<OrdersTab />} />
            <Route path="/history" element={<HistoryTab />} />
            <Route path="/messages" element={<MessagingView onStartVideoCall={() => {}} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
