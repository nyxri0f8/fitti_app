import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Package, Clock, CheckCircle, ChevronDown, Plus, X, Save, Utensils, Flame, ChefHat } from 'lucide-react';
import { supabase, createNotification } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import Sidebar from '../../components/shared/Sidebar';
import Navbar from '../../components/shared/Navbar';
import StatusBadge from '../../components/shared/StatusBadge';
import FloatingBackground from '../../components/shared/FloatingBackground';
import MessagingView from '../../components/chat/MessagingView';
import Modal from '../../components/shared/Modal';

/* ── Kitchen Onboarding Modal ──────────────────────────── */
function KitchenOnboardingModal({ user, onClose }) {
  const [kitchenName, setKitchenName] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!kitchenName || !location) return;
    setSaving(true);
    await supabase.auth.updateUser({
      data: { kitchen_name: kitchenName, kitchen_location: location }
    });
    // Update local store user object so it reflects immediately
    useAuthStore.setState({ user: { ...user, user_metadata: { ...user.user_metadata, kitchen_name: kitchenName, kitchen_location: location } } });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-fitti-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Flame className="h-8 w-8 text-fitti-orange" />
          </div>
          <h2 className="font-display text-2xl font-black text-fitti-text tracking-tight mb-2">Welcome to the Kitchen</h2>
          <p className="font-body text-sm text-fitti-text-muted">Set up your cloud kitchen details to get started.</p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="label-spaced block mb-2">Cloud Kitchen Name</label>
            <input 
              type="text" 
              value={kitchenName} 
              onChange={e => setKitchenName(e.target.value)}
              placeholder="e.g. Fitti Kitchen Pro"
              className="w-full bg-fitti-bg border-2 border-fitti-border rounded-xl px-4 py-3 font-body focus:border-fitti-green focus:bg-white focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="label-spaced block mb-2">Location</label>
            <input 
              type="text" 
              value={location} 
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Downtown Hub, NY"
              className="w-full bg-fitti-bg border-2 border-fitti-border rounded-xl px-4 py-3 font-body focus:border-fitti-green focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving || !kitchenName || !location}
          className="w-full btn-gradient py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-50"
        >
          <span className="font-display font-bold">{saving ? 'Setting up...' : 'Start Cooking'}</span>
        </button>
      </div>
    </div>
  );
}

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
  const [dailySchedule, setDailySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMealModal, setShowMealModal] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get customers assigned to this cook
    const { data: custData } = await supabase.from('customers').select('id, profiles!customers_id_fkey(full_name, email)').eq('assigned_cook', user.id);
    const custs = (custData || []).map(c => ({ id: c.id, name: c.profiles?.full_name || 'Unknown', email: c.profiles?.email }));
    setCustomers(custs);

    const customerIds = custs.map(c => c.id);
    if (customerIds.length > 0) {
      // Fetch Active Orders
      const { data: orderData } = await supabase.from('orders').select('*').in('customer_id', customerIds).neq('status', 'delivered').order('created_at', { ascending: false });
      const enriched = (orderData || []).map(o => {
        const cust = custs.find(c => c.id === o.customer_id);
        return { ...o, customer_name: cust?.name || 'Unknown' };
      });
      setOrders(enriched);

      // Fetch Today's Schedule from Diet Plans
      const { data: dietData } = await supabase.from('diet_plans').select('*').in('customer_id', customerIds).eq('active', true);
      const schedule = [];
      dietData?.forEach(plan => {
        const cust = custs.find(c => c.id === plan.customer_id);
        const dayMeals = plan.meal_structure?.[today] || [];
        dayMeals.forEach(m => {
          schedule.push({
            ...m,
            customer_id: plan.customer_id,
            customer_name: cust?.name,
            plan_id: plan.id
          });
        });
      });
      setDailySchedule(schedule);
    }
    setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const startCooking = async (meal) => {
    // Check if an order for this meal already exists today
    const { data: existing } = await supabase.from('orders')
      .select('id')
      .eq('customer_id', meal.customer_id)
      .eq('meal_plan', meal.name)
      .gte('created_at', new Date().toISOString().split('T')[0]);

    if (existing?.length > 0) {
      alert("This meal is already being prepared or has been delivered.");
      return;
    }

    const { error } = await supabase.from('orders').insert([{
      customer_id: meal.customer_id,
      meal_plan: meal.name,
      calories: Math.round((meal.protein*4)+(meal.carbs*4)+(meal.fat*9)),
      status: 'preparing',
      updated_by: user.id,
      cook_notes: JSON.stringify([{ name: meal.name, time: meal.time, protein: meal.protein, carbs: meal.carbs, fat: meal.fat }])
    }]);

    if (!error) {
      createNotification(meal.customer_id, 'Cooking Started', `Chef is now preparing your ${meal.name}!`, 'order_status');
      fetchData();
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const order = orders.find(o => o.id === orderId);
    await supabase.from('orders').update({ status, updated_by: user.id, updated_at: new Date() }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    
    if (order) {
      createNotification(order.customer_id, 'Order Update', `Your ${order.meal_plan} is now ${status.replace(/_/g, ' ')}`, 'order_status');
    }
    if (status === 'delivered') fetchData();
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;

  const kitchenName = user?.user_metadata?.kitchen_name || 'Kitchen Command';
  const kitchenLocation = user?.user_metadata?.kitchen_location || 'High-performance fueling station';

  return (
    <div className="p-8 animate-fade-in-up max-w-7xl mx-auto">
      {(!user?.user_metadata?.kitchen_name) && <KitchenOnboardingModal user={user} onClose={() => {}} />}
      
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="font-display text-4xl font-black text-fitti-text tracking-tighter flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-fitti-green" /> {kitchenName}
          </h2>
          <p className="font-accent text-lg italic text-fitti-text-muted mt-1">{kitchenLocation}</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-6 py-3 rounded-2xl border border-fitti-border shadow-sm">
             <p className="label-spaced !text-[9px] !mb-1">Active Batches</p>
             <p className="font-display font-black text-2xl text-fitti-green">{preparingCount + pendingCount}</p>
           </div>
        </div>
      </div>

      {/* Assigned Clients Horizontal List */}
      <div className="mb-10">
        <h3 className="label-spaced mb-4 flex items-center gap-2">
          <Utensils className="h-4 w-4 text-fitti-green" /> Assigned Clients
        </h3>
        {customers.length === 0 ? (
          <div className="bg-white/50 border border-fitti-border rounded-2xl p-6 text-center text-sm text-fitti-text-muted italic">
            No clients assigned yet. Wait for an admin to assign clients to your kitchen.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {customers.map(c => (
              <div key={c.id} className="min-w-[280px] bg-white border border-fitti-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex-shrink-0 card-hover">
                <h4 className="font-display font-bold text-lg text-fitti-text mb-1">{c.name}</h4>
                <p className="font-mono text-[10px] text-fitti-text-muted mb-4">{c.email}</p>
                <button 
                  onClick={() => setShowMealModal(c)}
                  className="w-full py-2 bg-fitti-green/10 text-fitti-green font-display font-bold text-xs rounded-xl hover:bg-fitti-green hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-3 w-3" /> Log Meal Plan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Daily Schedule / Prep List */}
        <div className="lg:col-span-1">
          <h3 className="label-spaced mb-6 flex items-center gap-2">
            <Clock className="h-4 w-4 text-fitti-orange" /> Today's Prep Schedule
          </h3>
          <div className="space-y-4">
            {dailySchedule.length === 0 ? (
              <div className="card-glass p-8 text-center border-dashed border-2">
                <p className="font-body text-sm text-fitti-text-muted">No scheduled meals for today.</p>
              </div>
            ) : dailySchedule.map((meal, i) => (
              <div key={i} className="card-glass p-5 card-hover group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono text-[9px] font-bold text-fitti-orange uppercase tracking-widest">{meal.time}</p>
                    <h4 className="font-display font-bold text-fitti-text">{meal.name}</h4>
                    <p className="font-body text-xs text-fitti-text-muted">{meal.customer_name}</p>
                  </div>
                  <button 
                    onClick={() => startCooking(meal)}
                    className="p-3 bg-fitti-green/10 text-fitti-green rounded-xl hover:bg-fitti-green hover:text-white transition-all group-hover:scale-110 shadow-sm"
                  >
                    <Flame className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-3 mt-4 border-t border-fitti-border/30 pt-3">
                  <div className="text-[9px] font-mono font-bold text-fitti-text-muted uppercase">P:{meal.protein}g</div>
                  <div className="text-[9px] font-mono font-bold text-fitti-text-muted uppercase">C:{meal.carbs}g</div>
                  <div className="text-[9px] font-mono font-bold text-fitti-text-muted uppercase">F:{meal.fat}g</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Kanban Board (Active Orders) */}
        <div className="lg:col-span-2">
          <h3 className="label-spaced mb-6 flex items-center gap-2">
            <Utensils className="h-4 w-4 text-fitti-green" /> Kitchen Display System
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preparing Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="font-mono text-[10px] font-black text-blue-500 uppercase tracking-widest">In Preparation</span>
                <span className="h-5 w-5 rounded-full bg-blue-50 text-[10px] font-black text-blue-500 flex items-center justify-center border border-blue-100">{preparingCount}</span>
              </div>
              {orders.filter(o => o.status === 'preparing').map(o => (
                <div key={o.id} className="bg-white border-l-4 border-blue-500 rounded-2xl p-6 shadow-xl shadow-blue-500/5 card-hover">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h4 className="font-display font-black text-fitti-text text-lg">{o.customer_name}</h4>
                       <p className="font-body text-xs font-bold text-blue-500 uppercase tracking-tight">{o.meal_plan}</p>
                     </div>
                     <Package className="h-5 w-5 text-fitti-border" />
                   </div>
                   <div className="flex items-center gap-3 mb-6">
                     <span className="font-mono text-[10px] font-bold bg-fitti-bg px-3 py-1 rounded-full">{o.calories} kcal</span>
                     <span className="font-mono text-[10px] font-bold bg-fitti-bg px-3 py-1 rounded-full text-fitti-text-muted">Est. 15m</span>
                   </div>
                   <button 
                     onClick={() => updateOrderStatus(o.id, 'packed')}
                     className="w-full py-3 bg-fitti-text text-white font-display font-bold text-xs rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                   >
                     <CheckCircle className="h-4 w-4" /> Ready to Ship
                   </button>
                </div>
              ))}
            </div>

            {/* Logistics Column (Packed / Out for Delivery) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="font-mono text-[10px] font-black text-fitti-green uppercase tracking-widest">Logistics Hub</span>
                <span className="h-5 w-5 rounded-full bg-fitti-green/10 text-[10px] font-black text-fitti-green flex items-center justify-center border border-fitti-green/20">
                  {orders.filter(o => ['packed', 'out_for_delivery'].includes(o.status)).length}
                </span>
              </div>
              {orders.filter(o => ['packed', 'out_for_delivery'].includes(o.status)).map(o => (
                <div key={o.id} className="bg-white border-l-4 border-fitti-green rounded-2xl p-6 shadow-xl shadow-fitti-green/5 card-hover">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h4 className="font-display font-black text-fitti-text text-lg">{o.customer_name}</h4>
                       <p className="font-body text-xs font-bold text-fitti-green uppercase tracking-tight">{o.status.replace(/_/g, ' ')}</p>
                     </div>
                     <StatusBadge status={o.status} />
                   </div>
                   <select 
                     value={o.status} 
                     onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                     className="w-full bg-fitti-bg border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-fitti-green/20 appearance-none cursor-pointer"
                   >
                     <option value="packed">Packed</option>
                     <option value="out_for_delivery">Out for Delivery</option>
                     <option value="delivered">Delivered</option>
                   </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
