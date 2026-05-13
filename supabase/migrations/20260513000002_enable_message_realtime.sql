-- Enable Realtime for messages and chat_rooms tables
BEGIN;
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'chat_rooms'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
    END IF;
  END
  $$;
COMMIT;

-- Ensure replica identity is set to FULL for messages to get complete data in realtime
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE chat_rooms REPLICA IDENTITY FULL;
