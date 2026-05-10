import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import { encryptMessage, decryptMessage } from '../lib/crypto';

export default function useChat() {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const secretKey = useAuthStore(state => state.secretKey);
  
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef(null);

  // 1. Fetch contacts based on role
  useEffect(() => {
    if (!user || !profile) return;
    
    const fetchContacts = async () => {
      try {
        let allowedContacts = [];
        
        if (profile.role === 'customer') {
          const { data } = await supabase.from('profiles').select('*').in('role', ['cook', 'doctor', 'trainer', 'admin']);
          allowedContacts = data || [];
        } else if (profile.role !== 'admin') {
          const { data } = await supabase.from('profiles').select('*').in('role', ['customer', 'admin']);
          allowedContacts = data || [];
        } else {
          const { data } = await supabase.from('profiles').select('*').neq('id', user.id);
          allowedContacts = data || [];
        }

        const formattedContacts = allowedContacts.map(c => ({
          id: c.id,
          name: c.full_name,
          role: c.role,
          online: true,
          roomId: null,
          pubkey: null,
          lastMessageContent: '',
          lastMessageTime: null,
          unreadCount: 0
        }));
        
        setContacts(formattedContacts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setLoading(false);
      }
    };

    fetchContacts();
  }, [user, profile]);

  // 2. Fetch room and messages when contact is selected
  useEffect(() => {
    if (!activeContact?.id || !user) return;

    // Cleanup previous subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    const fetchRoomAndMessages = async () => {
      // Find room
      const { data: rooms } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`);

      let room = (rooms || []).find(r => 
        (r.participant_a === user.id && r.participant_b === activeContact.id) ||
        (r.participant_b === user.id && r.participant_a === activeContact.id)
      );

      // If no room, create one
      if (!room) {
        const { data: myKey } = await supabase.from('user_pubkeys').select('public_key').eq('user_id', user.id).maybeSingle();
        const { data: theirKey } = await supabase.from('user_pubkeys').select('public_key').eq('user_id', activeContact.id).maybeSingle();

        const roles = [profile.role, activeContact.role].sort();
        const roomType = `${roles[0]}_${roles[1]}`;

        const newRoom = {
          participant_a: user.id,
          participant_b: activeContact.id,
          room_type: roomType,
          pubkey_a: myKey?.public_key || null,
          pubkey_b: theirKey?.public_key || null
        };

        const { data: createdRoom, error: roomError } = await supabase.from('chat_rooms').insert([newRoom]).select().single();
        if (roomError) return;
        room = createdRoom;
      }

      if (!room) return;

      const theirPubKey = room.participant_a === activeContact.id ? room.pubkey_a : room.pubkey_b;
      const hasEncryption = secretKey && theirPubKey;

      // Fetch messages
      const { data: rawMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', room.id)
        .order('created_at', { ascending: true });

      const decryptedMessages = (rawMessages || []).map(msg => {
        const isOwn = msg.sender_id === user.id;
        let content = msg.encrypted_content;
        if (hasEncryption && msg.nonce && msg.nonce !== 'none') {
          try {
            const decrypted = decryptMessage(msg.encrypted_content, msg.nonce, theirPubKey, secretKey);
            if (decrypted) content = decrypted;
          } catch (e) { }
        }
        return { id: msg.id, content, isOwn, created_at: msg.created_at };
      });

      setMessages(decryptedMessages);

      // Subscribe robustly
      const channel = supabase
        .channel(`chat:${room.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${room.id}`
        }, (payload) => {
          const msg = payload.new;
          const isOwn = msg.sender_id === user.id;
          
          let content = msg.encrypted_content;
          if (hasEncryption && msg.nonce && msg.nonce !== 'none') {
            try {
              const decrypted = decryptMessage(msg.encrypted_content, msg.nonce, theirPubKey, secretKey);
              if (decrypted) content = decrypted;
            } catch (e) { }
          }

          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, { id: msg.id, content, isOwn, created_at: msg.created_at }];
          });
        })
        .subscribe();
      
      subscriptionRef.current = channel;
      setActiveContact(prev => ({ ...prev, roomId: room.id, pubkey: theirPubKey }));
    };

    fetchRoomAndMessages();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [activeContact?.id, user.id, secretKey, profile.role]);

  const sendMessage = async (text) => {
    if (!activeContact?.roomId) return;

    try {
      const hasEncryption = secretKey && activeContact.pubkey;
      let ciphertext, nonce;

      if (hasEncryption) {
        const encrypted = encryptMessage(text, activeContact.pubkey, secretKey);
        ciphertext = encrypted.ciphertext;
        nonce = encrypted.nonce;
      } else {
        ciphertext = text;
        nonce = 'none';
      }
      
      await supabase.from('messages').insert([{
        room_id: activeContact.roomId,
        sender_id: user.id,
        encrypted_content: ciphertext,
        nonce: nonce
      }]);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return {
    contacts,
    activeContact,
    setActiveContact,
    messages,
    sendMessage,
    loading
  };
}
