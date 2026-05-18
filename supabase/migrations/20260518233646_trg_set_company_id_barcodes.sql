DROP TRIGGER IF EXISTS trg_set_company_id_barcode_changes ON public.barcodes;

CREATE TRIGGER trg_set_company_id_barcode_changes
BEFORE INSERT OR UPDATE ON public.barcodes
FOR EACH ROW
EXECUTE FUNCTION public.set_company_id();