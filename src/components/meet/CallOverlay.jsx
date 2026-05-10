import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import VideoRoom from './VideoRoom';

export default function CallOverlay() {
  const user = useAuthStore(state => state.user);
  const activeCall = useAuthStore(state => state.activeCall);
  const setActiveCall = useAuthStore(state => state.setActiveCall);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Listen for new sessions where current user is guest
    console.log('🔔 Call Overlay Listening for calls for user:', user.id);
    
    // Manual Test Trigger for User
    window.triggerTestCall = () => {
      console.log('🧪 Triggering Test Call...');
      setIncomingCall({
        roomCode: 'TEST-ROOM-' + Math.random().toString(36).substring(7),
        hostId: 'test',
        hostName: 'Test Caller',
        sessionId: 'test-' + Date.now()
      });
    };

    // Use a more specific channel and filter at the server level if possible
    // Note: guest_id=eq.${user.id} filter is much more efficient
    const channel = supabase.channel(`calls:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'meet_sessions',
        filter: `guest_id=eq.${user.id}`
      }, async (payload) => {
        console.log('📡 [INSERT] New Call Received:', payload);
        const session = payload.new;
        
        if (session.status === 'waiting') {
          console.log('✅ Valid incoming call! Fetching host profile...');
          const { data: host, error: hostErr } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.host_id)
            .single();
            
          if (hostErr) console.error('❌ Failed to fetch host profile:', hostErr);

          setIncomingCall({
            roomCode: session.room_code,
            hostId: session.host_id,
            hostName: host?.full_name || 'Someone',
            sessionId: session.id
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'meet_sessions',
        filter: `guest_id=eq.${user.id}`
      }, (payload) => {
        console.log('📡 [UPDATE] Call Status Changed:', payload);
        const session = payload.new;
        // If the call was canceled by the host or ended
        if (session.status === 'ended' && incomingCall?.sessionId === session.id) {
          console.log('🛑 Call was ended/canceled by host');
          setIncomingCall(null);
        }
      })
      .subscribe((status) => {
        console.log('📡 Call Subscription Status:', status);
      });

    return () => {
      console.log('🔕 Call Overlay Unmounting, cleaning up channel');
      supabase.removeChannel(channel);
    };
  }, [user, incomingCall?.sessionId]);

  const handleAccept = async () => {
    if (!incomingCall) return;
    
    // Update session status
    await supabase.from('meet_sessions').update({ status: 'active' }).eq('id', incomingCall.sessionId);
    
    setActiveCall({
      roomCode: incomingCall.roomCode,
      isHost: false,
      guestId: user.id,
      remoteName: incomingCall.hostName
    });
    setIncomingCall(null);
  };

  const handleDecline = async () => {
    if (!incomingCall) return;
    await supabase.from('meet_sessions').update({ status: 'ended' }).eq('id', incomingCall.sessionId);
    setIncomingCall(null);
  };

  if (!incomingCall && !activeCall) return null;

  return (
    <>
      {/* Incoming Call Notification */}
      {incomingCall && !activeCall && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-xl border border-fitti-green/20 shadow-2xl rounded-3xl p-6 flex items-center gap-6 min-w-[320px]">
            <div className="h-14 w-14 rounded-2xl bg-fitti-green/10 flex items-center justify-center relative">
              <Video className="h-7 w-7 text-fitti-green animate-pulse" />
              <div className="absolute inset-0 bg-fitti-green/20 rounded-2xl animate-ping" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-fitti-green mb-1">Incoming Call</p>
              <h4 className="font-bold text-fitti-text text-lg">{incomingCall.hostName}</h4>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleDecline} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors">
                <PhoneOff className="h-6 w-6" />
              </button>
              <button onClick={handleAccept} className="p-4 bg-fitti-green text-white rounded-2xl hover:bg-fitti-green-dark shadow-lg shadow-fitti-green/20 transition-all">
                <Phone className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Room Overlay */}
      {activeCall && (
        <VideoRoom
          roomCode={activeCall.roomCode}
          isHost={activeCall.isHost}
          guestId={activeCall.guestId}
          remoteName={activeCall.remoteName}
          onClose={() => setActiveCall(null)}
        />
      )}
    </>
  );
}
