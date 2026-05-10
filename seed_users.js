import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function seed() {
  const users = [
    { email: 'test01@fitti.org.in', password: 'Test@01' },
    { email: 'admin@fitti.org.in', password: 'Test@01' },
    { email: 'cook@fitti.org.in', password: 'Test@01' },
    { email: 'doctor@fitti.org.in', password: 'Test@01' },
    { email: 'trainer@fitti.org.in', password: 'Test@01' }
  ];

  for (const u of users) {
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
    });
    
    if (error) {
      console.log(`Error creating ${u.email}:`, error.message);
    } else {
      console.log(`Created ${u.email}. Session exists: ${!!data.session}`);
    }
  }
}

seed();
