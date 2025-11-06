-- Migration 002: Fix race conditions and add utility functions

-- Function to atomically increment AI request counter with limit check
-- This prevents race conditions where multiple requests could bypass the rate limit
CREATE OR REPLACE FUNCTION public.increment_ai_requests(
  user_id UUID,
  max_limit INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
  current_tier subscription_tier;
BEGIN
  -- Get current tier to handle unlimited tiers
  SELECT subscription_tier INTO current_tier
  FROM public.users
  WHERE id = user_id
  FOR UPDATE; -- Lock the row to prevent race conditions

  -- For pro/elite tiers with unlimited access, just increment
  IF current_tier IN ('pro', 'elite') THEN
    UPDATE public.users
    SET ai_requests_count = ai_requests_count + 1
    WHERE id = user_id
    RETURNING ai_requests_count INTO new_count;

    RETURN new_count;
  END IF;

  -- For free tier, check limit before incrementing
  UPDATE public.users
  SET ai_requests_count = ai_requests_count + 1
  WHERE id = user_id
    AND ai_requests_count < max_limit
  RETURNING ai_requests_count INTO new_count;

  -- If update didn't happen (limit exceeded), raise exception
  IF new_count IS NULL THEN
    RAISE EXCEPTION 'AI request limit exceeded'
      USING HINT = 'Upgrade to Pro for unlimited AI coaching';
  END IF;

  RETURN new_count;
END;
$$;

-- Function to safely get or create user stats (prevents null issues)
CREATE OR REPLACE FUNCTION public.get_or_create_user_stats(user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  total_focus_time BIGINT,
  total_distraction_time BIGINT,
  current_streak INTEGER,
  longest_streak INTEGER,
  last_session_date DATE,
  sessions_completed INTEGER,
  average_focus_quality NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Try to get existing stats
  RETURN QUERY
  SELECT us.* FROM public.user_stats us WHERE us.user_id = $1;

  -- If no stats exist, create them
  IF NOT FOUND THEN
    INSERT INTO public.user_stats (user_id)
    VALUES ($1)
    RETURNING * INTO id, user_id, total_focus_time, total_distraction_time,
              current_streak, longest_streak, last_session_date,
              sessions_completed, average_focus_quality;

    RETURN NEXT;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_ai_requests(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_stats(UUID) TO authenticated;
