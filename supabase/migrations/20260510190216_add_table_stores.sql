-- migration: create_stores_table.sql

create extension if not exists pgcrypto;

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),

  store_number integer,
  name text not null,
  company_id uuid not null,
  cnpj text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_stores_company
    foreign key (company_id)
    references public.companies (id)
    on delete cascade,

  constraint unique_company_cnpj
    unique (company_id, cnpj),

  constraint unique_company_store_number
    unique (company_id, store_number)
);

drop trigger if exists set_updated_at_stores on public.stores;

create trigger set_updated_at_stores
before update on public.stores
for each row
execute function public.update_updated_at_column();