-- Allow admins to update customer assignments
CREATE POLICY "Admin can update customers" ON customers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);

-- Allow authenticated users to insert into user_pubkeys
CREATE POLICY "Users can insert own pubkey" ON user_pubkeys FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow staff to read their assigned customers
CREATE POLICY "Staff can view assigned customers" ON customers FOR SELECT USING (
  auth.uid() = id OR
  auth.uid() = assigned_cook OR
  auth.uid() = assigned_trainer OR
  auth.uid() = assigned_doctor OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);

-- Allow authenticated users to insert into activity_feed
CREATE POLICY "Authenticated can insert activity" ON activity_feed FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Progress logs: trainer reads assigned
CREATE POLICY "Progress logs insert" ON progress_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Medical records: doctor reads own, customer reads own
CREATE POLICY "Medical records visibility" ON medical_records FOR SELECT USING (
  doctor_id = auth.uid() OR customer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Medical records insert" ON medical_records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Diet plans: 
CREATE POLICY "Diet plans visibility" ON diet_plans FOR SELECT USING (
  customer_id = auth.uid() OR created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Diet plans insert" ON diet_plans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Workout plans:
CREATE POLICY "Workout plans visibility" ON workout_plans FOR SELECT USING (
  customer_id = auth.uid() OR trainer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Workout plans insert" ON workout_plans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Progress logs visibility:
CREATE POLICY "Progress logs visibility" ON progress_logs FOR SELECT USING (
  customer_id = auth.uid() OR trainer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);

-- Meet sessions insert
CREATE POLICY "Meet sessions insert" ON meet_sessions FOR INSERT WITH CHECK (host_id = auth.uid());

-- Orders insert (admin/cook can create orders)
CREATE POLICY "Orders insert" ON orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('admin', 'cook'))
);
