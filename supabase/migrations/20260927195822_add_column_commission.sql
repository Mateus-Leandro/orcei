ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS commission boolean not null default true;