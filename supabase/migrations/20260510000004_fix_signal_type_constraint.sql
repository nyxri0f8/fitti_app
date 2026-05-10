-- Update webrtc_signals signal_type constraint to include 'ready'
ALTER TABLE webrtc_signals DROP CONSTRAINT IF EXISTS webrtc_signals_signal_type_check;

ALTER TABLE webrtc_signals ADD CONSTRAINT webrtc_signals_signal_type_check 
CHECK (signal_type IN ('offer', 'answer', 'ice_candidate', 'ready'));
