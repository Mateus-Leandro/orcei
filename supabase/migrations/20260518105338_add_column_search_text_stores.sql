-- migration: add search_text column + populate + keep updated for stores

-- 1. Adiciona a coluna caso ela não exista
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS search_text text;

-- 2. Popula a nova coluna para os registros já existentes
UPDATE public.stores
SET search_text = CONCAT_WS(
  ' ',
  store_number::text,
  name,
  cnpj
);

-- 3. Cria ou substitui a função da trigger
CREATE OR REPLACE FUNCTION public.update_stores_search_text()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_text := CONCAT_WS(
    ' ',
    NEW.store_number::text,
    NEW.name,
    NEW.cnpj
  );

  RETURN NEW;
END;
$$;

-- 4. Remove a trigger se ela já existir (previne erros ao rodar a migration novamente)
DROP TRIGGER IF EXISTS trg_update_stores_search_text
ON public.stores;

-- 5. Cria a trigger para rodar antes de inserts ou de updates nas colunas específicas
CREATE TRIGGER trg_update_stores_search_text
BEFORE INSERT OR UPDATE OF store_number, name, cnpj
ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.update_stores_search_text();