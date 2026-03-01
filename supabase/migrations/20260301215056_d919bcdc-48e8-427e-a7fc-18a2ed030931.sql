
-- Allow drivers (with driver role) to view requested rides
CREATE POLICY "Drivers can view requested rides"
ON public.rides
FOR SELECT
TO authenticated
USING (
  status = 'requested' AND has_role(auth.uid(), 'driver')
);

-- Allow riders to update own rides (for cancellation and rating)
CREATE POLICY "Riders can update own rides"
ON public.rides
FOR UPDATE
TO authenticated
USING (auth.uid() = rider_id);

-- Allow drivers to accept requested rides (set driver_id on themselves)
CREATE POLICY "Drivers can accept requested rides"
ON public.rides
FOR UPDATE
TO authenticated
USING (
  status = 'requested' AND has_role(auth.uid(), 'driver')
);
