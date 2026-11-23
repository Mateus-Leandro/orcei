-- migration: remove is_fractional de products
-- A permissão de venda fracionada passa a ser derivada da unidade de venda (sale_unit)
-- no front-end (FRACTIONAL_SALE_UNITS em product.model.ts).
alter table public.products
drop column if exists is_fractional;
