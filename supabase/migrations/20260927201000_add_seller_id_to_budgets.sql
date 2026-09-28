alter table public.budgets
add column if not exists seller_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_budgets_seller'
  ) then
    alter table public.budgets
    add constraint fk_budgets_seller
      foreign key (seller_id)
      references public.sellers (id)
      on delete set null;
  end if;
end $$;

create index if not exists idx_budgets_seller_id
on public.budgets (seller_id);
