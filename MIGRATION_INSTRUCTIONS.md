# How to Apply the Property Status Migration

## Method 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Project**
   - Visit: https://app.supabase.com
   - Select your project: "Rental_Management" or similar

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click on "New Query"

3. **Copy and Paste the SQL**
   - Copy the SQL below and paste it into the query editor:

```sql
-- Create property status enum
CREATE TYPE public.property_status AS ENUM ('available', 'rented', 'under_maintenance');

-- Add status column to properties table
ALTER TABLE public.properties 
ADD COLUMN status public.property_status DEFAULT 'available' NOT NULL;

-- Create index for better query performance
CREATE INDEX idx_properties_status ON public.properties(status);
```

4. **Execute the Query**
   - Click the "Run" button (or press Ctrl+Enter)
   - Wait for confirmation that the query executed successfully

---

## Method 2: Using Supabase CLI (After Setup)

If you want to use the CLI in the future:

1. **Login to Supabase**
   ```bash
   npx supabase login
   ```
   - This will open a browser to authenticate

2. **Link Your Project**
   ```bash
   npx supabase link
   ```
   - Select your project from the list

3. **Push Migrations**
   ```bash
   npx supabase db push
   ```

---

## After Applying the Migration

Once you've applied the SQL, the error should be resolved and you can:
- ✅ Update property status (available/rented/under_maintenance)
- ✅ Filter properties by status on the Explore page
- ✅ See status badges on property cards and detail pages

