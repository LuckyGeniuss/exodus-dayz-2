-- Create table for rate limiting tracking
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_rate_limit_user_endpoint ON public.rate_limit_log(user_id, endpoint, window_start);
CREATE INDEX idx_rate_limit_ip_endpoint ON public.rate_limit_log(ip_address, endpoint, window_start);

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id UUID,
  _ip_address TEXT,
  _endpoint TEXT,
  _max_requests INTEGER DEFAULT 10,
  _window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _window_start TIMESTAMP WITH TIME ZONE;
  _current_count INTEGER;
BEGIN
  _window_start := NOW() - (_window_minutes || ' minutes')::INTERVAL;
  
  -- Count recent requests for this user/ip and endpoint
  SELECT COALESCE(SUM(request_count), 0) INTO _current_count
  FROM public.rate_limit_log
  WHERE endpoint = _endpoint
    AND window_start >= _window_start
    AND (
      (_user_id IS NOT NULL AND user_id = _user_id) OR
      (_user_id IS NULL AND ip_address = _ip_address)
    );
  
  -- Check if limit exceeded
  IF _current_count >= _max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Log this request
  INSERT INTO public.rate_limit_log (user_id, ip_address, endpoint, window_start)
  VALUES (_user_id, _ip_address, _endpoint, NOW());
  
  RETURN TRUE;
END;
$$;

-- Create enhanced logging table for all edge function operations
CREATE TABLE IF NOT EXISTS public.edge_function_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  function_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  status TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  duration_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.edge_function_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own logs"
  ON public.edge_function_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all logs
CREATE POLICY "Service role can manage logs"
  ON public.edge_function_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_edge_logs_user ON public.edge_function_logs(user_id, created_at DESC);
CREATE INDEX idx_edge_logs_function ON public.edge_function_logs(function_name, created_at DESC);
CREATE INDEX idx_edge_logs_status ON public.edge_function_logs(status, created_at DESC);