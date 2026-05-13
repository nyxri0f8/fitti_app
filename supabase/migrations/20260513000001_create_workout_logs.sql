-- Create workout_logs table for tracking individual workout sessions
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercises JSONB NOT NULL DEFAULT '[]',
  total_calories INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Policies: users can see their own logs, trainers can see their clients' logs
CREATE POLICY "Users can view own workout logs" ON workout_logs
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = logged_by);

CREATE POLICY "Users can insert workout logs" ON workout_logs
  FOR INSERT WITH CHECK (auth.uid() = logged_by);

CREATE POLICY "Users can update own workout logs" ON workout_logs
  FOR UPDATE USING (auth.uid() = logged_by);

CREATE POLICY "Users can delete own workout logs" ON workout_logs
  FOR DELETE USING (auth.uid() = logged_by);
