-- Enable Realtime for webrtc_signals
ALTER TABLE webrtc_signals REPLICA IDENTITY FULL;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'webrtc_signals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE webrtc_signals;
  END IF;
END $$;
