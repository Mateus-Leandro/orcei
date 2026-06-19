-- migration: add sale_unit (enum) and is_fractional columns to products

-- 1. Enum com as unidades de venda usadas comercialmente
do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_sale_unit') then
    create type public.product_sale_unit as enum (
      'UN', -- Unidade
      'KG', -- Quilograma
      'G',  -- Grama
      'L',  -- Litro
      'ML', -- Mililitro
      'M',  -- Metro
      'CX', -- Caixa
      'FD', -- Fardo
      'PCT',-- Pacote
      'DZ', -- Dúzia
      'PC', -- Peça
      'SC'  -- Saco
    );
  end if;
end $$;

-- 2. Unidade de venda (padrão UN)
alter table public.products
add column if not exists sale_unit public.product_sale_unit not null default 'UN';

-- 3. Permite venda com quantidade fracionada
alter table public.products
add column if not exists is_fractional boolean not null default false;
