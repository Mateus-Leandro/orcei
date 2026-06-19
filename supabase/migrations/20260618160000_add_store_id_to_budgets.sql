-- migration: add store_id to budgets (orçamentos passam a ser por loja)

alter table public.budgets
add column if not exists store_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_budgets_store'
  ) then
    alter table public.budgets
    add constraint fk_budgets_store
      foreign key (store_id)
      references public.stores (id)
      on delete cascade;
  end if;
end $$;

create index if not exists idx_budgets_store_id
on public.budgets (store_id);

alter table public.budgets
alter column store_id set not null;
