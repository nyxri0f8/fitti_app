import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import { createPeerConnection } from '../lib/webrtc';

export default function useWebRTC(roomCode, isHost, guestId) {
  const user = useAuthStore(state => state.user);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const sessionIdRef = useRef(null);
  const channelRef = useRef(null);
  const isInitializingRef = useRef(false);

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    pcRef.current?.close();
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    pcRef.current = null;
    localStreamRef.current = null;
  }, []);

  const initCall = useCallback(async () => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    try {
      // 1. Cleanup previous if any
      cleanup();

      // 2. Get media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      localStreamRef.current = stream;

      // 3. Fetch session ID
      const { data: session } = await supabase.from('meet_sessions').select('id, guest_id, host_id').eq('room_code', roomCode).maybeSingle();
      if (!session) throw new Error('Session nodes not found. Please re-initiate.');
      sessionIdRef.current = session.id;

      const remoteUserId = isHost ? session.guest_id : session.host_id;

      // 4. Setup Peer Connection
      const pc = createPeerConnection();
      pcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      pc.onicecandidate = async (event) => {
        if (event.candidate && sessionIdRef.current) {
          await supabase.from('webrtc_signals').insert([{
            session_id: sessionIdRef.current,
            from_user: user.id,
            to_user: remoteUserId,
            signal_type: 'ice_candidate',
            payload: JSON.parse(JSON.stringify(event.candidate))
          }]);
        }
      };

      // 5. Setup channel and listeners BEFORE subscribe
      const channel = supabase.channel(`meet:${roomCode}`);
      channelRef.current = channel;

      channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'webrtc_signals',
        filter: `session_id=eq.${session.id}`
      }, async (payload) => {
        const signal = payload.new;
        if (signal.to_user !== user.id) return;
        if (!pcRef.current) return;

        try {
          if (signal.signal_type === 'offer' && !isHost) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.payload));
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);

            await supabase.from('webrtc_signals').insert([{
              session_id: session.id,
              from_user: user.id,
              to_user: signal.from_user,
              signal_type: 'answer',
              payload: JSON.parse(JSON.stringify(answer))
            }]);
          } else if (signal.signal_type === 'answer' && isHost) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.payload));
          } else if (signal.signal_type === 'ice_candidate') {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.payload));
          }
        } catch (sigErr) {
          console.error('Signal handling error:', sigErr);
        }
      });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          if (isHost && pcRef.current) {
            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);

            await supabase.from('webrtc_signals').insert([{
              session_id: session.id,
              from_user: user.id,
              to_user: guestId,
              signal_type: 'offer',
              payload: JSON.parse(JSON.stringify(offer))
            }]);

            await supabase.from('meet_sessions').update({ status: 'active', started_at: new Date() }).eq('id', session.id);
          }
        }
      });

    } catch (err) {
      console.error('WebRTC Init Error:', err);
      setError(err.message);
    } finally {
      isInitializingRef.current = false;
    }
  }, [roomCode, isHost, user.id, guestId, cleanup]);

  useEffect(() => {
    initCall();
    return cleanup;
  }, [initCall, cleanup]);

  const endCall = async () => {
    cleanup();
    if (sessionIdRef.current) {
      await supabase.from('meet_sessions').update({ status: 'ended', ended_at: new Date() }).eq('id', sessionIdRef.current);
      await supabase.from('webrtc_signals').delete().eq('session_id', sessionIdRef.current);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
    }
  };

  return {
    localStream,
    remoteStream,
    error,
    endCall,
    toggleMute,
    toggleVideo
  };
}
