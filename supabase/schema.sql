-- Run this whole file once in Supabase: SQL Editor > New query > Run

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz default now()
);

create table public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) <= 80),
  category text not null,
  image_path text not null,
  created_at timestamptz default now()
);

create table public.likes (
  post_id bigint references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

create table public.comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('appreciation','suggestion')),
  body text not null check (char_length(body) between 1 and 300),
  created_at timestamptz default now()
);

create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- Auto-create a profile when someone signs up
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'username',''), split_part(new.email,'@',1)));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security: everyone can read, only owners can write
alter table public.profiles enable row level security;
alter table public.posts    enable row level security;
alter table public.likes    enable row level security;
alter table public.comments enable row level security;
alter table public.follows  enable row level security;

create policy "read profiles" on public.profiles for select using (true);
create policy "read posts"    on public.posts    for select using (true);
create policy "read likes"    on public.likes    for select using (true);
create policy "read comments" on public.comments for select using (true);
create policy "read follows"  on public.follows  for select using (true);

create policy "insert own post" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy "delete own post" on public.posts for delete to authenticated using (auth.uid() = user_id);
create policy "insert own like" on public.likes for insert to authenticated with check (auth.uid() = user_id);
create policy "delete own like" on public.likes for delete to authenticated using (auth.uid() = user_id);
create policy "insert own comment" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "delete own comment" on public.comments for delete to authenticated using (auth.uid() = user_id);
create policy "insert own follow" on public.follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "delete own follow" on public.follows for delete to authenticated using (auth.uid() = follower_id);

-- Photo storage: public bucket, users upload only into their own folder
insert into storage.buckets (id, name, public) values ('photos','photos',true);

create policy "photos are public" on storage.objects for select using (bucket_id = 'photos');
create policy "upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own photos" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
