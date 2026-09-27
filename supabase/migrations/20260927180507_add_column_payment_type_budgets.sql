-- migration: add payment_type (enum) column to budgets

-- 1. Enum com os tipos de pagamento do orçamento
do $$
begin
  if not exists (select 1 from pg_type where typname = 'budget_payment_type') then
    create type public.budget_payment_type as enum (
      'CASH',       -- À vista
      'INSTALLMENT' -- A prazo
    );
  end if;
end $$;

-- 2. Tipo de pagamento (padrão à vista)
alter table public.budgets
add column if not exists payment_type public.budget_payment_type not null default 'INSTALLMENT';
