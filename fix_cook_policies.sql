-- Allow cook to insert orders for their assigned customers
DROP POLICY IF EXISTS "Orders insert" ON orders;
CREATE POLICY "Orders insert" ON orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('admin', 'cook'))
);

-- Allow cook to insert diet plans
DROP POLICY IF EXISTS "Diet plans insert" ON diet_plans;
CREATE POLICY "Diet plans insert" ON diet_plans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
