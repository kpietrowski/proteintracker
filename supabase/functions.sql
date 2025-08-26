-- Database Functions and Triggers
-- Run this after the schema.sql

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, daily_protein_goal)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'daily_protein_goal')::INTEGER, 140)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update daily summaries when protein entries change
CREATE OR REPLACE FUNCTION public.update_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
  summary_date DATE;
  user_goal INTEGER;
  total_amount DECIMAL(10,2);
  entry_count INTEGER;
BEGIN
  -- Determine the date and user for the summary
  IF TG_OP = 'DELETE' THEN
    summary_date := OLD.date::DATE;
    user_goal := (SELECT daily_protein_goal FROM public.users WHERE id = OLD.user_id);
  ELSE
    summary_date := NEW.date::DATE;
    user_goal := (SELECT daily_protein_goal FROM public.users WHERE id = NEW.user_id);
  END IF;

  -- Calculate totals for the day
  SELECT 
    COALESCE(SUM(amount), 0),
    COUNT(*)
  INTO total_amount, entry_count
  FROM public.protein_entries 
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) 
    AND date::DATE = summary_date;

  -- Insert or update daily summary
  INSERT INTO public.daily_summaries (user_id, date, total_protein, goal_protein, entries_count)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    summary_date,
    total_amount,
    user_goal,
    entry_count
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    total_protein = EXCLUDED.total_protein,
    goal_protein = EXCLUDED.goal_protein,
    entries_count = EXCLUDED.entries_count,
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for protein entries
CREATE OR REPLACE TRIGGER trigger_update_daily_summary_insert
  AFTER INSERT ON public.protein_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_summary();

CREATE OR REPLACE TRIGGER trigger_update_daily_summary_update
  AFTER UPDATE ON public.protein_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_summary();

CREATE OR REPLACE TRIGGER trigger_update_daily_summary_delete
  AFTER DELETE ON public.protein_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_summary();

-- Function to get weekly progress
CREATE OR REPLACE FUNCTION public.get_weekly_progress(
  user_uuid UUID,
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '6 days'
)
RETURNS TABLE (
  date DATE,
  total_protein DECIMAL(10,2),
  goal_protein INTEGER,
  goal_met BOOLEAN,
  entries_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.date,
    ds.total_protein,
    ds.goal_protein,
    ds.goal_met,
    ds.entries_count
  FROM public.daily_summaries ds
  WHERE ds.user_id = user_uuid
    AND ds.date >= start_date
    AND ds.date <= CURRENT_DATE
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly calendar data
CREATE OR REPLACE FUNCTION public.get_monthly_calendar(
  user_uuid UUID,
  target_year INTEGER,
  target_month INTEGER
)
RETURNS TABLE (
  date DATE,
  total_protein DECIMAL(10,2),
  goal_protein INTEGER,
  goal_met BOOLEAN,
  success_rate DECIMAL(5,2)
) AS $$
DECLARE
  month_start DATE;
  month_end DATE;
BEGIN
  month_start := DATE(target_year || '-' || target_month || '-01');
  month_end := (month_start + INTERVAL '1 month - 1 day')::DATE;

  RETURN QUERY
  WITH calendar AS (
    SELECT generate_series(month_start, month_end, '1 day'::INTERVAL)::DATE AS cal_date
  ),
  month_stats AS (
    SELECT 
      COUNT(CASE WHEN goal_met THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0) * 100 AS success_rate
    FROM public.daily_summaries ds
    WHERE ds.user_id = user_uuid 
      AND ds.date >= month_start 
      AND ds.date <= month_end
  )
  SELECT 
    c.cal_date,
    COALESCE(ds.total_protein, 0),
    COALESCE(ds.goal_protein, (SELECT daily_protein_goal FROM public.users WHERE id = user_uuid)),
    COALESCE(ds.goal_met, FALSE),
    COALESCE(ms.success_rate, 0)
  FROM calendar c
  LEFT JOIN public.daily_summaries ds ON ds.date = c.cal_date AND ds.user_id = user_uuid
  CROSS JOIN month_stats ms
  ORDER BY c.cal_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;