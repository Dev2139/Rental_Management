
-- Remove the foreign key constraint on owner_id so we can have sample data
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_owner_id_fkey;
