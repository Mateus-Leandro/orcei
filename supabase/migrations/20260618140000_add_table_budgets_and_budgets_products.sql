-- migration: create budgets + budgets_products tables (FKs, RLS and company_id triggers)

create extension if not exists pgcrypto;

-- =============================================================
-- 1. Tabela budgets
-- =============================================================

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),

  customer_id uuid not null,
  company_id uuid not null,

  observation text,
  delivery_forecast date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_budgets_customer
    foreign key (customer_id)
    references public.customers (id)
    on delete cascade,

  constraint fk_budgets_company
    foreign key (company_id)
    references public.companies (id)
    on delete cascade
);

create index if not exists idx_budgets_customer_id
on public.budgets (customer_id);

create index if not exists idx_budgets_company_id
on public.budgets (company_id);

drop trigger if exists set_updated_at_budgets on public.budgets;

create trigger set_updated_at_budgets
before update on public.budgets
for each row
execute function public.update_updated_at_column();

drop trigger if exists trg_set_company_id_budgets_changes on public.budgets;

create trigger trg_set_company_id_budgets_changes
before insert or update on public.budgets
for each row
execute function public.set_company_id();

alter table public.budgets
enable row level security;


drop policy if exists "orcamentos_consultar_por_empresa" on public.budgets;

create policy "orcamentos_consultar_por_empresa"
on public.budgets
for select
to authenticated
using (
  company_id = public.get_user_company_id()
);


drop policy if exists "orcamentos_inserir_por_empresa" on public.budgets;

create policy "orcamentos_inserir_por_empresa"
on public.budgets
for insert
to authenticated
with check (
  company_id = public.get_user_company_id()
);


drop policy if exists "orcamentos_atualizar_por_empresa" on public.budgets;

create policy "orcamentos_atualizar_por_empresa"
on public.budgets
for update
to authenticated
using (
  company_id = public.get_user_company_id()
)
with check (
  company_id = public.get_user_company_id()
);


drop policy if exists "orcamentos_excluir_por_empresa" on public.budgets;

create policy "orcamentos_excluir_por_empresa"
on public.budgets
for delete
to authenticated
using (
  company_id = public.get_user_company_id()
);


-- =============================================================
-- 2. Tabela budgets_products
-- =============================================================

create table if not exists public.budgets_products (
  id uuid primary key default gen_random_uuid(),

  budget_id uuid not null,
  product_id uuid not null,
  company_id uuid not null,

  quantity numeric not null default 1,
  unit_price numeric not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_budgets_products_budget
    foreign key (budget_id)
    references public.budgets (id)
    on delete cascade,

  constraint fk_budgets_products_product
    foreign key (product_id)
    references public.products (id)
    on delete cascade,

  constraint fk_budgets_products_company
    foreign key (company_id)
    references public.companies (id)
    on delete cascade
);

create index if not exists idx_budgets_products_budget_id
on public.budgets_products (budget_id);

create index if not exists idx_budgets_products_product_id
on public.budgets_products (product_id);

create index if not exists idx_budgets_products_company_id
on public.budgets_products (company_id);

drop trigger if exists set_updated_at_budgets_products on public.budgets_products;

create trigger set_updated_at_budgets_products
before update on public.budgets_products
for each row
execute function public.update_updated_at_column();

drop trigger if exists trg_set_company_id_budgets_products_changes on public.budgets_products;

create trigger trg_set_company_id_budgets_products_changes
before insert or update on public.budgets_products
for each row
execute function public.set_company_id();

alter table public.budgets_products
enable row level security;


drop policy if exists "orcamentos_produtos_consultar_por_empresa" on public.budgets_products;

create policy "orcamentos_produtos_consultar_por_empresa"
on public.budgets_products
for select
to authenticated
using (
  company_id = public.get_user_company_id()
);


drop policy if exists "orcamentos_produtos_inserir_por_empresa" on public.budgets_products;

create policy "orcamentos_produtos_inserir_por_empresa"
on public.budgets_products
for insert
to authenticated
with check (
  company_id = public.get_user_company_id()
);


drop policy if exists "orcamentos_produtos_atualizar_por_empresa" on public.budgets_products;

create policy "orcamentos_produtos_atualizar_por_empresa"
on public.budgets_products
for update
to authenticated
using (
  company_id = public.get_user_company_id()
)
with check (
  company_id = public.get_user_company_id()
);


drop policy if exists "orcamentos_produtos_excluir_por_empresa" on public.budgets_products;

create policy "orcamentos_produtos_excluir_por_empresa"
on public.budgets_products
for delete
to authenticated
using (
  company_id = public.get_user_company_id()
);
