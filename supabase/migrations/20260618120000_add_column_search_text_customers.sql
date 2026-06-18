-- migration: add search_text column + populate + keep updated for customers

alter table public.customers
add column if not exists search_text text;

update public.customers
set search_text = concat_ws(
  ' ',
  code::text,
  name,
  surname,
  document,
  phone,
  address
);

create or replace function public.update_customers_search_text()
returns trigger
language plpgsql
as $$
begin
  new.search_text := concat_ws(
    ' ',
    new.code::text,
    new.name,
    new.surname,
    new.document,
    new.phone,
    new.address
  );

  return new;
end;
$$;

drop trigger if exists trg_update_customers_search_text
on public.customers;

create trigger trg_update_customers_search_text
before insert or update of code, name, surname, document, phone, address
on public.customers
for each row
execute function public.update_customers_search_text();
