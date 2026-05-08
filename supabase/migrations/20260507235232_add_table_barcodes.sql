-- migration: create_barcode_table.sql

create extension if not exists pgcrypto;

create table if not exists public.barcodes (
  id uuid primary key default gen_random_uuid(),

  ean text not null,
  product_id uuid not null,
  company_id uuid not null,

  created_at timestamptz not null default now(),

  constraint fk_barcode_products
    foreign key (product_id)
    references public.products (id)
    on delete cascade,

  constraint fk_barcode_company_id
    foreign key (company_id)
    references public.companies (id)
    on delete cascade,

  constraint unique_company_ean
    unique (company_id, ean)
);

alter table public.barcodes enable row level security;

create policy "Inserir codigos de barras na empresa"
on public.barcodes
for insert
to authenticated
with check (
  company_id = public.get_user_company_id()
);

create policy "Visualizar codigos de barras da empresa"
on public.barcodes
for select
to authenticated
using (
  company_id = public.get_user_company_id()
);

create policy "Atualizar codigos de barras da empresa"
on public.barcodes
for update
to authenticated
using (
  company_id = public.get_user_company_id()
)
with check (
  company_id = public.get_user_company_id()
);

create policy "Remover codigos de barras da empresa"
on public.barcodes
for delete
to authenticated
using (
  company_id = public.get_user_company_id()
);

create index idx_barcodes_product_id
on public.barcodes(product_id);

create index idx_barcodes_company_id
on public.barcodes(company_id);