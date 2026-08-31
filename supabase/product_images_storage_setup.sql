-- Creates a storage bucket for product photos, with public read access
-- (needed so images display in the app) and open upload access (matching
-- the rest of this app's no-login-required design). Run once in Supabase
-- SQL Editor.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "public upload product images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'product-images');

create policy "public update product images"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'product-images');
