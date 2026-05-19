-- migration: create_financial_statement_table.sql

create extension if not exists pgcrypto;

create table if not exists public.financial_statement (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  store_id uuid not null,
  product_id uuid not null,
  margin numeric,
  cost_price numeric,
  sale_price numeric,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_financial_statement_products
    foreign key (product_id)
    references public.products (id)
    on delete cascade,

  constraint fk_financial_statement_company_id
    foreign key (company_id)
    references public.companies (id)
    on delete cascade,

  constraint fk_financial_statement_stores
    foreign key (store_id)
    references public.stores (id)
    on delete cascade,

  constraint unique_financial_statement
    unique (product_id, company_id, store_id)
);

alter table public.financial_statement enable row level security;

create policy "Inserir ficha financeira na empresa"
on public.financial_statement
for insert
to authenticated
with check (
  company_id = public.get_user_company_id()
);

create policy "Visualizar ficha financeira da empresa"
on public.financial_statement
for select
to authenticated
using (
  company_id = public.get_user_company_id()
);

create policy "Atualizar ficha financeira da empresa"
on public.financial_statement
for update
to authenticated
using (
  company_id = public.get_user_company_id()
)
with check (
  company_id = public.get_user_company_id()
);

create policy "Remover ficha financeira da empresa"
on public.financial_statement
for delete
to authenticated
using (
  company_id = public.get_user_company_id()
);

create index idx_financial_statement_product_id
on public.financial_statement(product_id);

create index idx_financial_statement_company_id
on public.financial_statement(company_id);

create trigger set_updated_at_financial_statement
before update on public.financial_statement
for each row
execute function public.update_updated_at_column();