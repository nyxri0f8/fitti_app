import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Package, Clock, CheckCircle, ChevronDown, Plus, X, Save, Utensils, Flame, ChefHat, Activity, ArrowRight, Target, Apple, Info } from 'lucide-react';
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
    useAuthStore.setState({ user: { ...user, user_metadata: { ...user.user_metadata, kitchen_name: kitchenName, kitchen_location: location } } });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-3xl animate-v-fade-up">
      <div className="bezel-shell max-w-md w-full mx-4">
        <div className="bezel-core p-12 text-center relative overflow-hidden">
          <div className="mesh-glow -top-24 -left-24 opacity-20" />
          <div className="w-20 h-20 bg-fitti-green/10 rounded-2xl flex items-center justify-center mx-auto mb-8 ring-1 ring-fitti-green/20">
            <Flame className="h-10 w-10 text-fitti-green" />
          </div>
          <h2 className="logo-fitti text-3xl mb-2">Setup.</h2>
          <p className="font-accent text-lg italic text-fitti-text-muted mb-12">Set up your kitchen information.</p>
          
          <div className="space-y-6 mb-12 text-left">
            <div>
              <label className="eyebrow-tag !mb-2">Kitchen Name</label>
              <input 
                type="text" 
                value={kitchenName} 
                onChange={e => setKitchenName(e.target.value)}
                placeholder="e.g. Fitti Kitchen Pro"
                className="w-full bg-black/5 dark:bg-white/5 border border-fitti-border/20 rounded-2xl px-6 py-4 font-display font-bold focus:ring-1 focus:ring-fitti-green/50 outline-none transition-all"
              />
            </div>
            <div>
              <label className="eyebrow-tag !mb-2">Geospatial Location</label>
              <input 
                type="text" 
                value={location} 
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Chennai, Sector 4"
                className="w-full bg-black/5 dark:bg-white/5 border border-fitti-border/20 rounded-2xl px-6 py-4 font-display font-bold focus:ring-1 focus:ring-fitti-green/50 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving || !kitchenName || !location}
            className="btn-vanguard btn-vanguard-primary w-full py-5 text-base justify-center shadow-2xl shadow-fitti-green/10"
          >
            <span className="font-display font-black tracking-tight">{saving ? 'Completing...' : 'Complete Setup'}</span>
            {!saving && <div className="btn-vanguard-icon-wrapper"><ArrowRight strokeWidth={2.5} className="h-4 w-4" /></div>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Create Meal Modal ─────────────────────────────────── */
function CreateMealModal({ customer, onClose, onSaved, cookId }) {
  const [strategy, setStrategy] = useState(null);
  const [meal, setMeal] = useState({
    meal_plan: '',
    meals: [{ name: '', time: '08:00', protein: '', carbs: '', fat: '' }],
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrategy = async () => {
      const { data } = await supabase.from('nutritional_strategies').select('*').eq('customer_id', customer.id).eq('active', true).maybeSingle();
      setStrategy(data);
      setLoading(false);
    };
    fetchStrategy();
  }, [customer.id]);

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
    const { error } = await supabase.from('orders').insert([{
      customer_id: customer.id,
      meal_plan: meal.meal_plan || 'Custom Plan',
      calories: Math.round(totalCalories),
      status: 'preparing',
      cook_notes: JSON.stringify(meal.meals),
      updated_by: cookId,
    }]);

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="logo-fitti text-2xl uppercase">Fulfillment Strategy.</h3>
              <p className="font-accent text-sm italic text-fitti-text-muted mt-1">Implementing nutritional protocol for {customer.name}</p>
            </div>
            <button onClick={onClose} className="p-3 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="h-48 shimmer rounded-3xl" />
          ) : strategy?.meal_targets ? (
            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-2 px-6">
                <Target className="h-4 w-4 text-fitti-green" />
                <span className="font-mono text-[10px] font-black text-fitti-green uppercase tracking-[0.2em]">Clinical Mandate Schedule</span>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategy.meal_targets.map((mt, i) => (
                <div key={i} className="bezel-shell !bg-fitti-green/5 ring-1 ring-fitti-green/20">
                  <div className="bezel-core p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-display font-black text-lg text-fitti-text tracking-tight">{mt.name}</span>
                      <span className="font-mono text-[9px] font-bold text-fitti-green bg-fitti-green/10 px-2 py-1 rounded-lg">{mt.time}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      {[
                        { l: 'Cals', v: mt.calories },
                        { l: 'Pro', v: mt.protein },
                        { l: 'Carbs', v: mt.carbs },
                        { l: 'Fat', v: mt.fat }
                      ].map((s, j) => (
                        <div key={j}>
                          <p className="font-mono text-[8px] font-black text-fitti-text-muted uppercase tracking-widest opacity-50">{s.l}</p>
                          <p className="font-display font-bold text-sm text-fitti-text">{s.v}{s.l!=='Cals'&&'g'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {strategy.notes && (
              <div className="bezel-shell !bg-fitti-text/5 mx-6">
                <div className="bezel-core p-6 flex gap-4 items-start">
                  <Info className="h-4 w-4 text-fitti-green shrink-0 mt-0.5" />
                  <p className="font-body text-xs text-fitti-text-muted italic">"{strategy.notes}"</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bezel-shell mb-8 !bg-orange-500/5 ring-1 ring-orange-500/20 mx-6">
            <div className="bezel-core p-8 flex items-center gap-4">
              <Apple className="h-6 w-6 text-orange-500" />
              <p className="font-mono text-[10px] font-black text-orange-500 uppercase tracking-widest">No active strategy discovered. Proceed with baseline fulfillment.</p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <div>
            <label className="eyebrow-tag !mb-2">Plan Name</label>
            <input
              type="text"
              value={meal.meal_plan}
              onChange={e => setMeal(prev => ({ ...prev, meal_plan: e.target.value }))}
              placeholder="e.g. Weight Loss - Week 1"
              className="w-full bg-black/5 dark:bg-white/5 border border-fitti-border/20 rounded-2xl px-6 py-4 font-display font-bold focus:ring-1 focus:ring-fitti-green/50 outline-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="eyebrow-tag !mb-0">Meal Details</label>
              <button onClick={addMealRow} className="text-[10px] font-mono font-black text-fitti-green uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity">
                <Plus className="h-3 w-3" /> Add Item
              </button>
            </div>

            {meal.meals.map((m, i) => (
              <div key={i} className="bezel-shell">
                <div className="bezel-core p-6 space-y-4 relative">
                  {meal.meals.length > 1 && (
                    <button onClick={() => removeMealRow(i)} className="absolute top-4 right-4 p-2 bg-black/5 rounded-full hover:bg-red-500 hover:text-white transition-all">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[9px] font-black text-fitti-text-muted uppercase tracking-widest block mb-2">Designation</label>
                      <input type="text" value={m.name} onChange={e => updateMealRow(i, 'name', e.target.value)}
                        placeholder="e.g. Breakfast" className="w-full bg-black/5 dark:bg-white/5 border border-fitti-border/20 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-fitti-green/50 outline-none" />
                    </div>
                    <div>
                      <label className="font-mono text-[9px] font-black text-fitti-text-muted uppercase tracking-widest block mb-2">Timestamp</label>
                      <input type="time" value={m.time} onChange={e => updateMealRow(i, 'time', e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-fitti-border/20 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-fitti-green/50 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {['protein', 'carbs', 'fat'].map(macro => (
                      <div key={macro}>
                        <label className="font-mono text-[9px] font-black text-fitti-text-muted uppercase tracking-widest block mb-2">{macro}</label>
                        <input type="number" value={m[macro]} onChange={e => updateMealRow(i, macro, e.target.value)}
                          placeholder="0g" className="w-full bg-black/5 dark:bg-white/5 border border-fitti-border/20 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-fitti-green/50 outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bezel-shell">
            <div className="bezel-core p-8 bg-fitti-green/5 ring-1 ring-fitti-green/10">
              <div className="flex items-center justify-between mb-6">
                <h4 className="eyebrow-tag !mb-0">Nutritional Compliance Audit</h4>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-fitti-green" />
                     <span className="font-mono text-[9px] font-bold text-fitti-text-muted uppercase">Actual Value</span>
                   </div>
                   {strategy && (
                     <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-fitti-border" />
                       <span className="font-mono text-[9px] font-bold text-fitti-text-muted uppercase">Clinical Target</span>
                     </div>
                   )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Calories', val: Math.round(totalCalories), target: strategy?.target_calories },
                  { label: 'Protein', val: Math.round(totalProtein), target: strategy?.target_protein },
                  { label: 'Carbs', val: Math.round(totalCarbs), target: strategy?.target_carbs },
                  { label: 'Fat', val: Math.round(totalFat), target: strategy?.target_fat }
                ].map((s, i) => (
                  <div key={i} className="p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-white shadow-sm">
                    <p className="font-mono text-[9px] font-black text-fitti-text-muted uppercase mb-1">{s.label}</p>
                    <p className={`font-display font-black text-xl ${s.target && s.val > s.target ? 'text-red-500' : 'text-fitti-green'}`}>{s.val}{s.label!=='Calories'&&'g'}</p>
                    {s.target && (
                      <div className="w-full h-1 bg-black/5 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${s.val > s.target ? 'bg-red-500' : 'bg-fitti-green'}`} style={{ width: `${Math.min(100, (s.val/s.target)*100)}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || meal.meals.every(m => !m.name)}
            className="btn-vanguard btn-vanguard-primary w-full py-5 text-base justify-center">
            <span className="font-display font-black tracking-tight">{saving ? 'Saving...' : 'Save Plan'}</span>
            {!saving && <div className="btn-vanguard-icon-wrapper"><ArrowRight strokeWidth={2.5} className="h-4 w-4" /></div>}
          </button>
        </div>
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
    const { data: custData } = await supabase.from('customers').select('id, profiles!customers_id_fkey(full_name, email)').eq('assigned_cook', user.id);
    const custs = (custData || []).map(c => ({ id: c.id, name: c.profiles?.full_name || 'Unknown', email: c.profiles?.email }));
    setCustomers(custs);

    const customerIds = custs.map(c => c.id);
    if (customerIds.length > 0) {
      const { data: orderData } = await supabase.from('orders').select('*').in('customer_id', customerIds).neq('status', 'delivered').order('created_at', { ascending: false });
      setOrders((orderData || []).map(o => ({ ...o, customer_name: custs.find(c => c.id === o.customer_id)?.name || 'Unknown' })));

      const { data: dietData } = await supabase.from('diet_plans').select('*').in('customer_id', customerIds).eq('active', true);
      const schedule = [];
      dietData?.forEach(plan => {
        const cust = custs.find(c => c.id === plan.customer_id);
        const dayMeals = plan.meal_structure?.[today] || [];
        dayMeals.forEach(m => schedule.push({ ...m, customer_id: plan.customer_id, customer_name: cust?.name, plan_id: plan.id }));
      });
      setDailySchedule(schedule);
    }
    setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const updateOrderStatus = async (orderId, status) => {
    const order = orders.find(o => o.id === orderId);
    await supabase.from('orders').update({ status, updated_by: user.id, updated_at: new Date() }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (order) createNotification(order.customer_id, 'Order Update', `Your ${order.meal_plan} is now ${status.replace(/_/g, ' ')}`, 'order_status');
    if (status === 'delivered') fetchData();
  };

  const preparingCount = orders.filter(o => ['pending', 'preparing'].includes(o.status)).length;
  const kitchenName = user?.user_metadata?.kitchen_name || 'Kitchen Overview';
  const kitchenLocation = user?.user_metadata?.kitchen_location || 'High-performance fueling station';

  return (
    <div className="p-8 md:p-12 animate-v-fade-up max-w-7xl mx-auto space-y-16">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <span className="eyebrow-tag !mb-4">Kitchen Operations</span>
          <h2 className="logo-fitti text-6xl leading-none">{kitchenName}.</h2>
          <p className="font-accent text-2xl italic text-fitti-text-muted mt-4">{kitchenLocation}</p>
        </div>
        <div className="bezel-shell">
          <div className="bezel-core px-10 py-6 bg-fitti-green/5 ring-1 ring-fitti-green/10 flex flex-col items-center">
            <span className="font-mono text-[10px] font-black text-fitti-text-muted uppercase tracking-[0.2em] mb-1">Active Orders</span>
            <p className="font-display font-black text-4xl text-fitti-green">{preparingCount}</p>
          </div>
        </div>
      </div>

      {/* Assigned Clients Horizontal Hardware List */}
      <div className="space-y-8">
        <h3 className="eyebrow-tag !mb-0">Assigned Customers</h3>
        {customers.length === 0 ? (
          <div className="bezel-shell">
            <div className="bezel-core p-12 text-center text-fitti-text-muted italic font-accent text-lg">
              No customers assigned to this kitchen.
            </div>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar stagger-v-fade">
            {customers.map(c => (
              <div key={c.id} className="bezel-shell min-w-[320px]">
                <div className="bezel-core p-8 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-700">
                  <h4 className="font-display font-black text-2xl text-fitti-text mb-1 tracking-tight">{c.name}</h4>
                  <p className="font-mono text-[10px] font-black text-fitti-text-muted mb-8 tracking-widest opacity-50 uppercase">{c.email}</p>
                  <button 
                    onClick={() => setShowMealModal(c)}
                    className="btn-vanguard w-full py-4 text-xs !bg-fitti-green/10 !text-fitti-green hover:!bg-fitti-green hover:!text-white"
                  >
                    Set Meal Plan
                    <div className="btn-vanguard-icon-wrapper"><Plus className="h-4 w-4" /></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Order Schedule */}
        <div className="lg:col-span-1 space-y-8">
          <h3 className="eyebrow-tag !mb-0">Delivery Schedule</h3>
          <div className="space-y-6 stagger-v-fade">
            {dailySchedule.length === 0 ? (
              <div className="bezel-shell">
                <div className="bezel-core p-12 text-center font-accent text-fitti-text-muted italic">
                  No scheduled orders for today.
                </div>
              </div>
            ) : dailySchedule.map((meal, i) => (
              <div key={i} className="bezel-shell group">
                <div className="bezel-core p-6 hover:bg-black/5 transition-all duration-700">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="font-mono text-[10px] font-black text-fitti-green uppercase tracking-[0.2em] mb-1">{meal.time}</p>
                      <h4 className="font-display font-black text-xl text-fitti-text leading-tight">{meal.name}</h4>
                      <p className="font-accent text-sm italic text-fitti-text-muted mt-1">{meal.customer_name}</p>
                    </div>
                    <button className="h-12 w-12 bg-fitti-green/10 text-fitti-green rounded-2xl flex items-center justify-center hover:bg-fitti-green hover:text-white transition-all duration-500">
                      <Flame className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex gap-4 border-t border-fitti-border/20 pt-4">
                    {['P', 'C', 'F'].map((m, idx) => (
                      <div key={idx} className="font-mono text-[9px] font-black text-fitti-text-muted uppercase tracking-widest">{m}: {meal[idx === 0 ? 'protein' : idx === 1 ? 'carbs' : 'fat']}g</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KDS Control Center */}
        <div className="lg:col-span-2 space-y-8">
          <h3 className="eyebrow-tag !mb-0">Kitchen Display System</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Preparation Terminal */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <span className="font-mono text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Preparing</span>
                <div className="h-6 w-6 bg-blue-500/10 rounded-lg flex items-center justify-center font-mono text-[10px] font-black text-blue-500 border border-blue-500/20">{preparingCount}</div>
              </div>
              <div className="space-y-6 stagger-v-fade">
                {orders.filter(o => ['pending', 'preparing'].includes(o.status)).map(o => (
                  <div key={o.id} className="bezel-shell border-l-4 border-blue-500">
                    <div className="bezel-core p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="font-display font-black text-2xl text-fitti-text tracking-tight">{o.customer_name}</h4>
                          <p className="font-mono text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 opacity-70">{o.meal_plan}</p>
                        </div>
                        <Activity className="h-5 w-5 text-fitti-border/40" />
                      </div>
                      <div className="flex items-center gap-3 mb-8">
                        <span className="font-mono text-[10px] font-black bg-black/5 px-4 py-1.5 rounded-full uppercase tracking-widest">{o.calories} kcal</span>
                        <span className="font-mono text-[10px] font-black bg-black/5 px-4 py-1.5 rounded-full uppercase tracking-widest text-fitti-text-muted">In Progress</span>
                      </div>
                      <button 
                        onClick={() => updateOrderStatus(o.id, 'packed')}
                        className="btn-vanguard btn-vanguard-primary w-full py-4 text-xs shadow-none"
                      >
                        Pack Order
                        <div className="btn-vanguard-icon-wrapper"><CheckCircle className="h-4 w-4" /></div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics Terminal */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <span className="font-mono text-[10px] font-black text-fitti-green uppercase tracking-[0.3em]">Management</span>
                <div className="h-6 w-6 bg-fitti-green/10 rounded-lg flex items-center justify-center font-mono text-[10px] font-black text-fitti-green border border-fitti-green/20">
                  {orders.filter(o => ['packed', 'out_for_delivery'].includes(o.status)).length}
                </div>
              </div>
              <div className="space-y-6 stagger-v-fade">
                {orders.filter(o => ['packed', 'out_for_delivery'].includes(o.status)).map(o => (
                  <div key={o.id} className="bezel-shell border-l-4 border-fitti-green">
                    <div className="bezel-core p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="font-display font-black text-2xl text-fitti-text tracking-tight">{o.customer_name}</h4>
                          <p className="font-mono text-[10px] font-black text-fitti-green uppercase tracking-widest mt-1 opacity-70">{o.status.replace(/_/g, ' ')}</p>
                        </div>
                        <Package className="h-5 w-5 text-fitti-green opacity-40" />
                      </div>
                      <select 
                        value={o.status} 
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-fitti-border/20 rounded-2xl px-6 py-4 font-mono font-black text-[10px] uppercase tracking-widest focus:ring-1 focus:ring-fitti-green/50 outline-none appearance-none cursor-pointer"
                      >
                        <option value="packed">Packed</option>
                        <option value="out_for_delivery">En Route</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
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
        const { data } = await supabase.from('orders').select('*').in('customer_id', customerIds).eq('status', 'delivered').order('updated_at', { ascending: false });
        setHistory((data || []).map(o => ({ ...o, customer_name: custs.find(c => c.id === o.customer_id)?.name || 'Unknown' })));
      }
      setLoading(false);
    };
    if (user) fetchHistory();
  }, [user]);

  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto space-y-12 md:space-y-24">
      {/* Header Section */}
      <section className="animate-v-fade-up">
        <span className="eyebrow-tag">Operational Archive</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-fitti-text mb-8 tracking-tighter leading-[0.9]">
              Order <br/>
              <span className="text-fitti-green">History</span>.
            </h2>
            <p className="font-accent text-xl md:text-2xl italic text-fitti-text-muted max-w-xl leading-relaxed">
              Historical record of fulfilled meal plans and dietary deliveries.
            </p>
          </div>
          <div className="bezel-shell w-full lg:w-72 h-32 md:h-48 group overflow-hidden">
            <div className="bezel-core h-full flex flex-col items-center justify-center relative text-center">
              <div className="mesh-glow w-full h-full opacity-40 group-hover:scale-125 transition-transform duration-1000" />
              <Clock strokeWidth={1} className="h-10 w-10 text-fitti-green mb-2" />
              <span className="font-mono text-[10px] font-bold text-fitti-text-muted uppercase tracking-[0.2em]">Fulfilled</span>
              <span className="font-display text-2xl font-black text-fitti-green">{history.length}</span>
            </div>
          </div>
        </div>
      </section>
      
      {history.length===0 ? (
        <div className="bezel-shell min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Clock strokeWidth={1} className="h-20 w-20 text-fitti-border/40 mx-auto mb-6"/>
            <p className="font-body text-fitti-text-muted font-bold text-xl uppercase tracking-widest">No historical logs discovered.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-12 stagger-v-fade">
          {history.map((o, idx) => (
            <div key={o.id} className="bezel-shell group overflow-hidden">
              <div className="bezel-core p-8 md:p-12 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 mesh-glow opacity-5 group-hover:opacity-10 transition-opacity duration-1000" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-fitti-green/10 flex items-center justify-center text-fitti-green font-display font-black text-2xl ring-1 ring-fitti-green/20">
                      {o.customer_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-fitti-text text-3xl tracking-tight leading-none mb-2">{o.customer_name}</h3>
                      <p className="font-mono text-[10px] text-fitti-text-muted uppercase tracking-[0.2em]">{new Date(o.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-fitti-green/10 rounded-xl text-fitti-green font-mono text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle className="h-3 w-3"/> Fulfilled
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Plan', value: o.meal_plan },
                    { label: 'Calories', value: `${o.calories} kcal` },
                    { label: 'Fulfilled At', value: new Date(o.updated_at).toLocaleTimeString() },
                    { label: 'Status', value: o.status, isHighlight: true }
                  ].map((stat, i) => (
                    <div key={i} className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 ring-1 ring-black/5 text-center">
                      <p className="label-spaced !text-[9px] !mb-3 opacity-50">{stat.label}</p>
                      <p className={`font-display font-bold ${stat.isHighlight ? 'text-sm text-fitti-green uppercase' : 'text-lg text-fitti-text'}`}>
                        {stat.value}
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

export default function CookDashboard() {
  const user = useAuthStore(state => state.user);

  return (
    <div className="flex h-screen bg-fitti-bg relative overflow-hidden">
      <FloatingBackground role="cook" />
      {(!user?.user_metadata?.kitchen_name) && <KitchenOnboardingModal user={user} onClose={() => {}} />}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Navbar title="" />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
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
