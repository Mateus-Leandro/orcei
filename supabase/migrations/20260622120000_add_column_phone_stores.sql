-- migration: add phone column to stores + include it on search_text

-- 1. Adiciona a coluna caso ela não exista
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS phone text;

-- 2. Atualiza search_text dos registros existentes incluindo o telefone
UPDATE public.stores
SET search_text = CONCAT_WS(
  ' ',
  store_number::text,
  name,
  cnpj,
  phone
);

-- 3. Recria a função da trigger incluindo o telefone
CREATE OR REPLACE FUNCTION public.update_stores_search_text()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_text := CONCAT_WS(
    ' ',
    NEW.store_number::text,
    NEW.name,
    NEW.cnpj,
    NEW.phone
  );

  RETURN NEW;
END;
$$;

-- 4. Remove a trigger se ela já existir (previne erros ao rodar a migration novamente)
DROP TRIGGER IF EXISTS trg_update_stores_search_text
ON public.stores;

-- 5. Recria a trigger incluindo a coluna phone no gatilho de update
CREATE TRIGGER trg_update_stores_search_text
BEFORE INSERT OR UPDATE OF store_number, name, cnpj, phone
ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.update_stores_search_text();
