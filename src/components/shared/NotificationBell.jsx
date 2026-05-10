import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (!user) return;

    // Initial fetch
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

    // Subscribe to realtime updates
    const subscription = supabase
      .channel(`notif:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 5));
        // Simple toast using native DOM for now or a custom toast library
        alert(`New Notification: ${payload.new.title}`);
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
        className="relative p-2 rounded-full text-fitti-text-muted hover:text-fitti-green hover:bg-fitti-bg-alt focus:outline-none transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fitti-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-fitti-orange"></span>
          </span>
        )}
      </button>

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
