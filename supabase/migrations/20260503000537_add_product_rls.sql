-- migration: function + RLS usando app_metadata.company_id

create or replace function public.get_user_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select
    (
      auth.jwt() -> 'app_metadata' ->> 'company_id'
    )::uuid;
$$;

comment on function public.get_user_company_id()
is 'Retorna o company_id salvo no app_metadata do usuário autenticado';


alter table public.products
enable row level security;


drop policy if exists "products_select_by_company" on public.products;

create policy "products_select_by_company"
on public.products
for select
to authenticated
using (
  company_id = public.get_user_company_id()
);


drop policy if exists "products_insert_by_company" on public.products;

create policy "products_insert_by_company"
on public.products
for insert
to authenticated
with check (
  company_id = public.get_user_company_id()
);


drop policy if exists "products_update_by_company" on public.products;

create policy "products_update_by_company"
on public.products
for update
to authenticated
using (
  company_id = public.get_user_company_id()
)
with check (
  company_id = public.get_user_company_id()
);


drop policy if exists "products_delete_by_company" on public.products;

create policy "products_delete_by_company"
on public.products
for delete
to authenticated
using (
  company_id = public.get_user_company_id()
);