DROP TRIGGER IF EXISTS trg_set_company_id_before_changes ON public.customers;

CREATE TRIGGER trg_set_company_id_before_changes
BEFORE INSERT OR UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.set_company_id();
