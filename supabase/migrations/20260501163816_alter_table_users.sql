alter table public.users
add column company_id uuid;

alter table public.users
add constraint users_company_id_fkey 
foreign key (company_id) 
references public.companies(id) 
on delete cascade;

alter table public.users alter column company_id set not null;

alter table public.users rename constraint usuarios_pkey to users_pkey;
alter table public.users rename constraint usuarios_nome_key to users_name_key;
alter table public.users rename constraint usuarios_id_fkey to users_auth_id_fkey;