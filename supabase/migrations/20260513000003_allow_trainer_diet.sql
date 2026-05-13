-- Drop existing policies on diet_plans if needed
DROP POLICY IF EXISTS "Diet plans insert" ON diet_plans;

-- Create policy to allow trainer and cook to insert
CREATE POLICY "Diet plans insert" ON diet_plans FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('cook', 'trainer'))
);
