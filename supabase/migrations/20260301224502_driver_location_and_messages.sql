-- Fix 1: Add driver live location columns to rides table
ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS driver_lat double precision,
  ADD COLUMN IF NOT EXISTS driver_lng double precision;

-- Fix 2: Create messages table for real-time in-app chat
CREATE TABLE IF NOT EXISTS public.messages (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id     uuid        NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  sender_id   uuid        NOT NULL,
  text        text        NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- Row-Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Riders and drivers on the same ride can read messages
CREATE POLICY "Ride participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rides r
      WHERE r.id = messages.ride_id
        AND (r.rider_id = auth.uid() OR r.driver_id = auth.uid())
    )
  );

-- Riders and drivers on the same ride can send messages
CREATE POLICY "Ride participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.rides r
      WHERE r.id = messages.ride_id
        AND (r.rider_id = auth.uid() OR r.driver_id = auth.uid())
    )
  );

-- Enable realtime broadcasts for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
