-- Fix the broken RLS policy for rental_offers
-- Remove the policy that allows viewing all offers
DROP POLICY IF EXISTS "Users can view their own offers" ON public.rental_offers;

-- Create a properly secured policy that only allows users to view their own offers
CREATE POLICY "Users can view their own offers" 
ON public.rental_offers 
FOR SELECT 
USING (user_email = auth.jwt() ->> 'email');

-- Also ensure users can only update their own offers
CREATE POLICY "Users can update their own offers" 
ON public.rental_offers 
FOR UPDATE 
USING (user_email = auth.jwt() ->> 'email');