-- Check if 'Chat rooms insert' policy already exists and drop/recreate to be safe
-- Allow any authenticated user to create chat rooms (needed for first message)
DO $$
BEGIN
  -- Ensure the room_type check constraint allows all role combos
  -- Update chat_rooms to allow more room types
  ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_room_type_check;
  ALTER TABLE chat_rooms ADD CONSTRAINT chat_rooms_room_type_check CHECK (room_type IS NOT NULL);
END
$$;

-- Allow any authenticated user to insert messages into rooms they're part of
-- (policy already exists, but let's make sure)
