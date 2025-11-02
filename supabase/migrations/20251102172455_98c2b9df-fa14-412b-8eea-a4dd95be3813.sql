-- Fix profiles table RLS to explicitly prevent anonymous access
-- Current policy only allows authenticated users to read their own profile
-- But we need to ensure no default SELECT policy exists for anonymous users

-- First, drop any existing public SELECT policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Verify that only authenticated users can read profiles
-- The existing "Users can read own profile" policy already restricts to auth.uid() = id
-- This ensures anonymous users (where auth.uid() is NULL) cannot read anything

-- Add explicit policy for admins to read all profiles if needed
CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update balance_transactions to be explicit about denying anonymous access
-- The existing restrictive policies should handle this, but let's be explicit

-- Ensure no public SELECT policy exists
DROP POLICY IF EXISTS "Enable read access for all users" ON public.balance_transactions;
DROP POLICY IF EXISTS "Public transactions are viewable by everyone" ON public.balance_transactions;