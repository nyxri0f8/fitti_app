import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are not set. The app will not function correctly without them.')
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder')

export const createNotification = async (userId, title, body, type = 'info', metadata = {}) => {
  try {
    const { error } = await supabase.from('notifications').insert([{
      user_id: userId,
      title,
      body,
      type,
      metadata
    }]);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};
