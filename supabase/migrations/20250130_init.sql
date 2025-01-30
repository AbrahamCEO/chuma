-- Create profiles table
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    display_name text,
    profile_pic text,
    bio text,
    location text,
    followers_count int default 0,
    following_count int default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create listings table
create table public.listings (
    id uuid not null default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    title text not null,
    description text not null,
    price decimal(10,2) not null,
    category text not null,
    images text[] not null,
    video text,
    status text not null default 'active',
    views integer not null default 0
);

-- Enable RLS
alter table public.listings enable row level security;

-- Create policies
create policy "Listings are viewable by everyone" on listings
    for select using (true);

create policy "Users can create their own listings" on listings
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own listings" on listings
    for update using (auth.uid() = user_id);

create policy "Users can delete their own listings" on listings
    for delete using (auth.uid() = user_id);

-- Create profile trigger to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, display_name)
    values (new.id, new.raw_user_meta_data->>'display_name');
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
