-- Add new columns to properties table for advanced filtering
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS pet_friendly BOOLEAN DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_furnished BOOLEAN DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS near_transport BOOLEAN DEFAULT false;

-- Create indexes for better query performance on new columns
CREATE INDEX IF NOT EXISTS properties_pet_friendly_idx ON public.properties (pet_friendly);
CREATE INDEX IF NOT EXISTS properties_is_furnished_idx ON public.properties (is_furnished);
CREATE INDEX IF NOT EXISTS properties_near_transport_idx ON public.properties (near_transport);