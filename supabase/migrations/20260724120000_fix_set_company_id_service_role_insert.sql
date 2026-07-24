CREATE OR REPLACE FUNCTION public.set_company_id()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id uuid;
BEGIN
  v_company_id := public.get_user_company_id();

  IF TG_OP = 'INSERT' THEN
    IF v_company_id IS NOT NULL THEN
      NEW.company_id := v_company_id;
    END IF;

    IF NEW.company_id IS NULL THEN
      RAISE EXCEPTION 'Não foi possível determinar o company_id do usuário logado.';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.company_id := OLD.company_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
