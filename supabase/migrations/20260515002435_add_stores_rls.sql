-- migration: function + RLS usando app_metadata.company_id

alter table public.stores
enable row level security;

drop policy if exists "Visualizar lojas da empresa" on public.stores;

create policy "Visualizar lojas da empresa"
on public.stores
for select
to authenticated
using (
  company_id = public.get_user_company_id()
);

drop policy if exists "Inserir lojas da empresa" on public.stores;

create policy "Inserir lojas da empresa"
on public.stores
for insert
to authenticated
with check (
  company_id = public.get_user_company_id()
);

drop policy if exists "Alterar lojas da empresa" on public.stores;

create policy "Alterar lojas da empresa"
on public.stores
for update
to authenticated
using (
  company_id = public.get_user_company_id()
)
with check (
  company_id = public.get_user_company_id()
);

drop policy if exists "Deletar lojas da empresa" on public.stores;

create policy "Deletar lojas da empresa"
on public.stores
for delete
to authenticated
using (
  company_id = public.get_user_company_id()
);