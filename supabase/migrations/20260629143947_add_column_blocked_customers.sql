ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS blocked boolean not null default false;