-- migration: add search_text column + populate + keep updated

alter table public.products
add column if not exists search_text text;

update public.products
set search_text = concat_ws(
  ' ',
  code::text,
  name
);

create or replace function public.update_products_search_text()
returns trigger
language plpgsql
as $$
begin
  new.search_text := concat_ws(
    ' ',
    new.code::text,
    new.name
  );

  return new;
end;
$$;

drop trigger if exists trg_update_products_search_text
on public.products;

create trigger trg_update_products_search_text
before insert or update of code, name
on public.products
for each row
execute function public.update_products_search_text();