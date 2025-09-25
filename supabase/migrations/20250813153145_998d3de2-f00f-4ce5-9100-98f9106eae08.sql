-- Make monthly_budget nullable since users might not always fill it in
ALTER TABLE public.rental_offers 
ALTER COLUMN monthly_budget DROP NOT NULL;