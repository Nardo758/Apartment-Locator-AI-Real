-- Fix the broken INSERT policy for rental_offers
-- Remove the policy that allows creating offers with any email
DROP POLICY IF EXISTS "Users can create offers" ON public.rental_offers;

-- Create a secure policy that only allows users to create offers with their own email
CREATE POLICY "Users can create offers with their own email" 
ON public.rental_offers 
FOR INSERT 
WITH CHECK (user_email = auth.jwt() ->> 'email');