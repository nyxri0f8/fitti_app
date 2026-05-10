import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const user = useAuthStore(state => state.user);

  const [activeAlert, setActiveAlert] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) setNotifications(data);
    };

    fetchNotifications();

    const subscription = supabase
      .channel(`notif:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 5));
        setActiveAlert(payload.new);
        // Auto-hide alert
        setTimeout(() => setActiveAlert(null), 5000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-xl text-fitti-text-muted hover:text-fitti-green hover:bg-white border border-transparent hover:border-fitti-border/50 shadow-sm transition-all duration-300 active:scale-95"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fitti-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fitti-orange"></span>
          </span>
        )}
      </button>

      {/* Floating Notification Alert */}
      {activeAlert && (
        <div className="fixed top-24 left-8 z-[100] animate-fade-in-right">
          <div className="bg-white/90 backdrop-blur-xl border border-fitti-border shadow-2xl rounded-[1.2rem] p-4 flex items-center gap-4 min-w-[300px]">
             <div className="h-10 w-10 bg-fitti-green/10 rounded-full flex items-center justify-center">
                <Bell className="h-5 w-5 text-fitti-green" />
             </div>
             <div>
                <p className="text-xs font-black text-fitti-text uppercase tracking-widest mb-0.5">{activeAlert.title}</p>
                <p className="text-[10px] font-bold text-fitti-text-muted line-clamp-1">{activeAlert.body}</p>
             </div>
             <button 
               onClick={() => setActiveAlert(null)}
               className="ml-auto text-fitti-text-muted hover:text-fitti-text p-1"
             >
               <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        </div>
      )}

      {showDropdown && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-2xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-fitti-border">
              <h3 className="text-sm font-bold text-fitti-text">Notifications</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-4 text-sm text-fitti-text-muted text-center">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`px-4 py-3 border-b border-fitti-border last:border-0 cursor-pointer hover:bg-fitti-bg ${!notif.read ? 'bg-fitti-bg-alt/30' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <p className={`text-sm ${!notif.read ? 'font-bold text-fitti-text' : 'text-fitti-text-dark'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-fitti-text-muted mt-1">{notif.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
