DROP TRIGGER IF EXISTS trg_set_company_id_store_changes ON public.stores;

CREATE TRIGGER trg_set_company_id_store_changes
BEFORE INSERT OR UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.set_company_id();
