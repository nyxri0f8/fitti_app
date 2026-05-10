import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@fitti.org.in',
    password: 'Test@01', // Or whatever password they used
  });
  
  if (error) {
    console.error("Login Error:", error);
    return;
  }
  
  console.log("Logged in:", data.user.id);
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();
    
  if (profileError) {
    console.error("Profile Error:", JSON.stringify(profileError, null, 2));
  } else {
    console.log("Profile Data:", profile);
  }
}

testLogin();
