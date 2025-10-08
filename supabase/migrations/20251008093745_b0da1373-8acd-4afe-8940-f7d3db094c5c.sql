-- Fix critical security issues: restrict public access to profiles and user_roles tables

-- Drop existing public policies on profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create proper RLS policy for profiles - only authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Drop existing public policies on user_roles  
DROP POLICY IF EXISTS "Anyone can view user_roles" ON public.user_roles;

-- No additional policy needed - existing policies already restrict to admins and own roles