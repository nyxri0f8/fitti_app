-- Create nutritional_strategies table
CREATE TABLE nutritional_strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) NOT NULL,
  trainer_id UUID REFERENCES profiles(id) NOT NULL,
  target_calories INTEGER NOT NULL,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  calories_per_meal INTEGER,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE nutritional_strategies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Strategies visibility" ON nutritional_strategies FOR SELECT USING (
  customer_id = auth.uid() OR
  trainer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.id = nutritional_strategies.customer_id 
    AND (customers.assigned_cook = auth.uid() OR customers.assigned_doctor = auth.uid())
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Trainer strategy management" ON nutritional_strategies FOR ALL USING (
  trainer_id = auth.uid()
);

-- Update Activity Feed events
ALTER TABLE activity_feed DROP CONSTRAINT activity_feed_event_type_check;
ALTER TABLE activity_feed ADD CONSTRAINT activity_feed_event_type_check 
CHECK (event_type IN (
  'order_status_update',
  'progress_logged',
  'medical_updated',
  'diet_plan_created',
  'workout_plan_created',
  'session_started',
  'session_ended',
  'user_assigned',
  'nutritional_strategy_created'
));
