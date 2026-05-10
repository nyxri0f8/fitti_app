-- Enable Realtime for meet_sessions and webrtc_signals
-- This is CRITICAL for the "Incoming Call" notification and signaling to work.

-- 1. Enable Realtime for the tables
BEGIN;
  -- Add tables to the supabase_realtime publication
  -- We check if they are already in the publication to avoid errors
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'meet_sessions'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE meet_sessions;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'webrtc_signals'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE webrtc_signals;
    END IF;
  END
  $$;
COMMIT;

-- 2. Ensure RLS policies allow the guest to see the session
-- The guest MUST be able to SELECT the record to receive the Realtime event.
-- The existing policy in init.sql covers this, but let's reinforce it.

DROP POLICY IF EXISTS "Meet sessions visibility" ON meet_sessions;
CREATE POLICY "Meet sessions visibility" ON meet_sessions 
FOR ALL USING (
  host_id = auth.uid() OR guest_id = auth.uid()
);

-- 3. Ensure WebRTC signals are visible to the recipient
DROP POLICY IF EXISTS "WebRTC visibility" ON webrtc_signals;
CREATE POLICY "WebRTC visibility" ON webrtc_signals 
FOR SELECT USING (
  to_user = auth.uid()
);

DROP POLICY IF EXISTS "WebRTC insert" ON webrtc_signals;
CREATE POLICY "WebRTC insert" ON webrtc_signals 
FOR INSERT WITH CHECK (
  from_user = auth.uid()
);

-- 4. Set replica identity to FULL for these tables to ensure all columns are available in Realtime payloads
ALTER TABLE meet_sessions REPLICA IDENTITY FULL;
ALTER TABLE webrtc_signals REPLICA IDENTITY FULL;
