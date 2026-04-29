create table public.usuarios (
  id uuid references auth.users(id) on delete cascade not null primary key,
  nome text unique,
  data_criacao timestamp with time zone default now(),
  data_alteracao timestamp with time zone default now(),

  constraint nome_length check (char_length(nome) >= 3)
);

alter table public.usuarios
enable row level security;

create policy "Usuarios publicos podem ser visualizados por todos"
on public.usuarios
for select
using (true);

create policy "Usuarios podem inserir seu proprio perfil"
on public.usuarios
for insert
with check (auth.uid() = id);

create policy "Usuarios podem atualizar seu proprio perfil"
on public.usuarios
for update
using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.usuarios (
    id,
    nome
  )
  values (
    new.id,
    new.raw_user_meta_data->>'nome'
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();