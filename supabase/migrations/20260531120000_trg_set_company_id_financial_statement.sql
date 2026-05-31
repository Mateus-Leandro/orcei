DROP TRIGGER IF EXISTS trg_set_company_id_financial_statement_changes ON public.financial_statement;

CREATE TRIGGER trg_set_company_id_financial_statement_changes
BEFORE INSERT OR UPDATE ON public.financial_statement
FOR EACH ROW
EXECUTE FUNCTION public.set_company_id();
