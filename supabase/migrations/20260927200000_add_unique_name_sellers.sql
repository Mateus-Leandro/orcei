-- Impede vendedores com o mesmo nome na mesma empresa,
-- ignorando diferenças de maiúsculas/minúsculas e espaços nas pontas.
DROP INDEX IF EXISTS public.unique_name_seller;

CREATE UNIQUE INDEX unique_name_seller
ON public.sellers (company_id, lower(btrim(name)));
