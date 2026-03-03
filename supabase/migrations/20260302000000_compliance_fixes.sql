-- saved_places
CREATE TABLE public.saved_places (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  address text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Riders manage own saved places" ON public.saved_places
  FOR ALL USING (auth.uid() = rider_id);

-- notifications
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Riders manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = rider_id);

-- Profile preferences
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sound_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true;

-- Rides payment + feedback
ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS final_fare numeric(10,2),
  ADD COLUMN IF NOT EXISTS feedback text;
