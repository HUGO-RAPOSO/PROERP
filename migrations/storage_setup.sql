-- Create the storage bucket for library files
insert into storage.buckets (id, name, public)
values ('library-files', 'library-files', true)
on conflict (id) do nothing;

-- Set up security policies for the storage bucket

-- Allow authenticated users to upload files
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'library-files' );

-- Allow public access to view files (so users can download/view PDFs)
create policy "Allow public read access"
on storage.objects for select
to public
using ( bucket_id = 'library-files' );

-- Allow authenticated users to update/delete their own tenant's files
-- Note: This is a simplified policy. For stricter multitenancy, you'd check the path prefix against user metadata
create policy "Allow authenticated delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'library-files' );
