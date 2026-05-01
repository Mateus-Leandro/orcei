create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text unique not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.companies enable row level security;

create policy "Permitir leitura para usuários autenticados"
on public.companies
for select
to authenticated
using (true);


create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_companies_updated_at
    before update on public.companies
    for each row
    execute function update_updated_at_column();