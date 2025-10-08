-- Fix profiles RLS policy: only allow users to view their own profile
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- The existing "Users can read own profile" policy already restricts to own data
-- No additional policy needed