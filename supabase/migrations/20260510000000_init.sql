-- PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin','customer','cook','doctor','trainer')) NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE customers (
  id UUID REFERENCES profiles(id) PRIMARY KEY,
  goal TEXT CHECK (goal IN ('weight_loss','weight_gain','maintenance','recomposition')),
  weight NUMERIC,
  height NUMERIC,
  food_preference TEXT CHECK (food_preference IN ('veg','non_veg','vegan')),
  medical_conditions TEXT,
  assigned_cook UUID REFERENCES profiles(id),
  assigned_trainer UUID REFERENCES profiles(id),
  assigned_doctor UUID REFERENCES profiles(id),
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) NOT NULL,
  meal_plan TEXT,
  calories INTEGER,
  status TEXT CHECK (status IN ('pending','preparing','packed','out_for_delivery','delivered')) DEFAULT 'pending',
  delivery_date DATE DEFAULT CURRENT_DATE,
  cook_notes TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRESS LOGS
CREATE TABLE progress_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id),
  trainer_id UUID REFERENCES profiles(id),
  weight NUMERIC,
  chest NUMERIC, waist NUMERIC, hips NUMERIC, arms NUMERIC,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  diet_adherence INTEGER CHECK (diet_adherence BETWEEN 1 AND 10),
  workout_performance TEXT,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICAL RECORDS
CREATE TABLE medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id),
  doctor_id UUID REFERENCES profiles(id),
  health_summary TEXT,
  conditions TEXT,
  medications TEXT,
  workout_restrictions TEXT,
  dietary_restrictions TEXT,
  follow_up_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DIET PLANS
CREATE TABLE diet_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  daily_calories INTEGER,
  protein_grams INTEGER,
  carb_grams INTEGER,
  fat_grams INTEGER,
  meal_structure JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WORKOUT PLANS
CREATE TABLE workout_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id),
  trainer_id UUID REFERENCES profiles(id),
  weekly_structure JSONB,
  intensity TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- E2E ENCRYPTED CHAT ROOMS
CREATE TABLE chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_a UUID REFERENCES profiles(id) NOT NULL,
  participant_b UUID REFERENCES profiles(id) NOT NULL,
  room_type TEXT CHECK (room_type IN ('customer_cook','customer_doctor','customer_trainer','admin_cook','admin_doctor','admin_trainer','admin_customer')) NOT NULL,
  pubkey_a TEXT,
  pubkey_b TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_a, participant_b)
);

-- ENCRYPTED MESSAGES
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  encrypted_content TEXT NOT NULL,
  nonce TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEET SESSIONS
CREATE TABLE meet_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES profiles(id),
  guest_id UUID REFERENCES profiles(id),
  session_type TEXT CHECK (session_type IN ('customer_doctor','customer_trainer','admin_any')),
  status TEXT CHECK (status IN ('waiting','active','ended')) DEFAULT 'waiting',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WEBRTC SIGNALING
CREATE TABLE webrtc_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES meet_sessions(id) ON DELETE CASCADE,
  from_user UUID REFERENCES profiles(id),
  to_user UUID REFERENCES profiles(id),
  signal_type TEXT CHECK (signal_type IN ('offer','answer','ice_candidate')),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY FEED
CREATE TABLE activity_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id),
  actor_role TEXT,
  customer_id UUID REFERENCES profiles(id),
  event_type TEXT CHECK (event_type IN ('order_status_update','progress_logged','medical_updated','diet_plan_created','workout_plan_created','session_started','session_ended','user_assigned')),
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT,
  body TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER PUBKEYS
CREATE TABLE user_pubkeys (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  public_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meet_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webrtc_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pubkeys ENABLE ROW LEVEL SECURITY;

-- POLICIES (Simplified for quick setup based on instructions)

-- Profiles: Authenticated users can read all, update own
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Customers: Customer reads own, assigned staff reads assigned, admin reads all
CREATE POLICY "Customer view logic" ON customers FOR SELECT USING (
  auth.uid() = id OR
  auth.uid() = assigned_cook OR
  auth.uid() = assigned_trainer OR
  auth.uid() = assigned_doctor OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);

-- Orders: Customer reads own, cook reads all, admin reads all. Cook updates status/notes.
CREATE POLICY "Orders view logic" ON orders FOR SELECT USING (
  customer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('admin', 'cook'))
);
CREATE POLICY "Orders update logic" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('admin', 'cook'))
);

-- Chat rooms: Only participants can see their rooms
CREATE POLICY "Chat rooms visibility" ON chat_rooms FOR SELECT USING (
  participant_a = auth.uid() OR participant_b = auth.uid()
);
CREATE POLICY "Chat rooms insert" ON chat_rooms FOR INSERT WITH CHECK (
  participant_a = auth.uid() OR participant_b = auth.uid()
);

-- Messages: Only room participants can read/insert
CREATE POLICY "Messages visibility" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_rooms WHERE chat_rooms.id = messages.room_id AND (chat_rooms.participant_a = auth.uid() OR chat_rooms.participant_b = auth.uid()))
);
CREATE POLICY "Messages insert" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM chat_rooms WHERE chat_rooms.id = messages.room_id AND (chat_rooms.participant_a = auth.uid() OR chat_rooms.participant_b = auth.uid()))
);

-- Meet sessions: Only host+guest can access
CREATE POLICY "Meet sessions visibility" ON meet_sessions FOR ALL USING (
  host_id = auth.uid() OR guest_id = auth.uid()
);

-- WebRTC signals: only to_user can read, anyone in session can insert
CREATE POLICY "WebRTC visibility" ON webrtc_signals FOR SELECT USING (
  to_user = auth.uid()
);
CREATE POLICY "WebRTC insert" ON webrtc_signals FOR INSERT WITH CHECK (
  from_user = auth.uid()
);

-- Activity Feed: Admin reads all, others read own events only
CREATE POLICY "Activity feed visibility" ON activity_feed FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin') OR
  actor_id = auth.uid() OR customer_id = auth.uid()
);
CREATE POLICY "Activity feed insert" ON activity_feed FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Notifications: User reads/updates only their own
CREATE POLICY "Notifications visibility" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Notifications update" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Notifications insert" ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- User Pubkeys: anyone authenticated can read, only owner can insert/update
CREATE POLICY "User pubkeys visibility" ON user_pubkeys FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "User pubkeys update/insert" ON user_pubkeys FOR ALL USING (user_id = auth.uid());
