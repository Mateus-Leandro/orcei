-- migration: adiciona sale_unit em budgets_products
-- Unidade de venda usada no item do orçamento. Pode diferir da unidade do cadastro
-- do produto. Itens antigos ficam null e exibem a unidade atual do produto.
alter table public.budgets_products
add column if not exists sale_unit public.product_sale_unit null;
