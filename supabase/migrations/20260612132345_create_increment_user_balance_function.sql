CREATE OR REPLACE FUNCTION public.increment_user_balance(user_id UUID, amount_to_add NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET balance = balance + amount_to_add
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


GRANT EXECUTE ON FUNCTION public.increment_user_balance(UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_user_balance(UUID, NUMERIC) TO service_role;
