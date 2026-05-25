insert into storage.buckets (id, name, public) values ('productos', 'productos', true);

create policy "Fotos productos publicas"
on storage.objects for select
using (bucket_id = 'productos');

create policy "Admin sube fotos productos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'productos');

create policy "Admin actualiza fotos productos"
on storage.objects for update
to authenticated
using (bucket_id = 'productos');

create policy "Admin borra fotos productos"
on storage.objects for delete
to authenticated
using (bucket_id = 'productos');