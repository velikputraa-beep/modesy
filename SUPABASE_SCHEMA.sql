-- ============================================================
-- MODESY CLONE — SUPABASE SCHEMA (TAHAP 7: lengkap + cart, wallet, coupons, follows)
-- Jalankan seluruh file ini di Supabase SQL Editor.
-- File ini idempotent — aman dijalankan ulang.
-- ============================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  banner_url text,
  role text not null default 'member' check (role in ('admin','moderator','vendor','member')),
  bio text,
  location text,
  phone text,
  website text,
  verified boolean default false,
  created_at timestamptz default now()
);

-- Kolom tambahan Tahap 7 (aman jika sudah ada)
alter table public.profiles add column if not exists shop_name text;
alter table public.profiles add column if not exists shop_description text;
alter table public.profiles add column if not exists payout_account jsonb;

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Role & verified tidak bisa diubah user sendiri dari client.
-- Promosi role (vendor/moderator/admin) via RPC admin atau SQL Editor:
--   select public.admin_update_user_role('uuid-user', 'vendor');
revoke update (role, verified, id) on table public.profiles from authenticated;
revoke update (role, verified, id) on table public.profiles from anon;

-- 2. CATEGORIES
create table if not exists public.categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  icon text,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
create policy "Categories viewable by everyone"
  on public.categories for select using (true);

create policy "Admins manage categories"
  on public.categories for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator')));

-- 3. PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles(id) on delete cascade not null,
  category_id int references public.categories(id),
  title text not null,
  slug text unique not null,
  description text,
  short_description text,
  price numeric not null default 0,
  old_price numeric,
  stock int not null default 0,
  condition text check (condition in ('new','used')) default 'used',
  location text,
  status text check (status in ('draft','pending','published','hidden','sold','rejected','expired','deleted')) default 'pending',
  featured boolean default false,
  views int default 0,
  created_at timestamptz default now()
);

-- Kolom/konstraint tambahan Tahap 7 (idempotent)
alter table public.products add column if not exists stock int not null default 0;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_status_check') then
    alter table public.products add constraint products_status_check
      check (status in ('draft','pending','published','hidden','sold','rejected','expired','deleted'));
  end if;
end $$;

alter table public.products enable row level security;

create policy "Published products viewable by everyone"
  on public.products for select using (
    status = 'published'
    or seller_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','moderator'))
  );

create policy "Sellers can insert own products"
  on public.products for insert to authenticated
  with check (seller_id = auth.uid());

create policy "Sellers can update own products"
  on public.products for update to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create policy "Admins moderate products"
  on public.products for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator')));

create policy "Admins delete products"
  on public.products for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator')));

create index if not exists products_seller_id_idx on public.products (seller_id);
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_status_idx on public.products (status);

-- 4. PRODUCT IMAGES
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  url text not null,
  is_primary boolean default false
);

alter table public.product_images enable row level security;
create policy "Product images viewable by everyone"
  on public.product_images for select using (true);

create index if not exists product_images_product_id_idx on public.product_images (product_id);

-- 5. FAVORITES
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table public.favorites enable row level security;
create policy "Users manage own favorites"
  on public.favorites for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 6. CONVERSATIONS
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (buyer_id, seller_id, product_id)
);

alter table public.conversations enable row level security;
create policy "Participants view conversations"
  on public.conversations for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "Users create conversations"
  on public.conversations for insert to authenticated
  with check (buyer_id = auth.uid() and seller_id <> auth.uid());

-- 7. MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;
create policy "Participants view messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );
create policy "Participants send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create index if not exists messages_conversation_id_idx on public.messages (conversation_id);

-- Realtime untuk chat (aman dijalankan ulang)
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.conversations;
exception when duplicate_object then null;
end $$;

-- 8. ORDERS (multi-item: rincian produk ada di order_items)
create sequence if not exists public.order_number_seq start 10040;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique default ('#' || nextval('public.order_number_seq')),
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending','processing','shipped','completed','cancelled')) default 'pending',
  payment_method text,
  payment_status text check (payment_status in ('pending','paid','refunded')) default 'pending',
  shipping_address text,
  subtotal numeric not null default 0,
  shipping_cost numeric not null default 0,
  discount numeric not null default 0,
  coupon_id bigint,
  total numeric not null default 0,
  created_at timestamptz default now()
);

-- Migrasi idempotent dari definisi lama (single-item) bila schema lama sudah pernah dijalankan
alter table public.orders add column if not exists order_number text;
alter table public.orders add column if not exists subtotal numeric not null default 0;
alter table public.orders add column if not exists shipping_cost numeric not null default 0;
alter table public.orders add column if not exists discount numeric not null default 0;
alter table public.orders add column if not exists coupon_id bigint;
do $$
begin
  alter table public.orders alter column order_number set default ('#' || nextval('public.order_number_seq'));
exception when others then null;
end $$;

alter table public.orders enable row level security;
create policy "Buyers and sellers view orders"
  on public.orders for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "Buyers create orders"
  on public.orders for insert to authenticated
  with check (buyer_id = auth.uid());

create index if not exists orders_buyer_id_idx on public.orders (buyer_id);
create index if not exists orders_seller_id_idx on public.orders (seller_id);

-- 8a. ORDER ITEMS
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  image text,
  quantity int not null default 1,
  unit_price numeric not null default 0
);

alter table public.order_items enable row level security;
create policy "Order participants view items"
  on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
  ));
create policy "Buyers create order items"
  on public.order_items for insert to authenticated
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id and o.buyer_id = auth.uid()
  ));

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_seller_id_idx on public.order_items (seller_id);

-- 9. REVIEWS
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;
create policy "Reviews viewable by everyone"
  on public.reviews for select using (true);
create policy "Users create reviews"
  on public.reviews for insert to authenticated
  with check (reviewer_id = auth.uid());
create policy "Reviewers manage own reviews"
  on public.reviews for update to authenticated
  using (reviewer_id = auth.uid())
  with check (reviewer_id = auth.uid());
drop policy if exists "Reviewers and admins delete reviews" on public.reviews;
drop policy if exists "Reviewers, sellers and admins delete reviews" on public.reviews;
create policy "Reviewers, sellers and admins delete reviews"
  on public.reviews for delete to authenticated
  using (
    reviewer_id = auth.uid()
    or exists (
      select 1 from public.products pr
      where pr.id = reviews.product_id and pr.seller_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

create index if not exists reviews_product_id_idx on public.reviews (product_id);

-- 9b. PRODUCT COMMENTS (pertanyaan/komentar pembeli pada produk)
create table if not exists public.product_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  comment text not null,
  created_at timestamptz default now()
);

alter table public.product_comments enable row level security;
create policy "Comments viewable by everyone"
  on public.product_comments for select using (true);
create policy "Users create comments"
  on public.product_comments for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists "Users and admins delete comments" on public.product_comments;
drop policy if exists "Users, sellers and admins delete comments" on public.product_comments;
create policy "Users, sellers and admins delete comments"
  on public.product_comments for delete to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.products pr
      where pr.id = product_comments.product_id and pr.seller_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

create index if not exists product_comments_product_id_idx on public.product_comments (product_id);

-- 10. STORAGE BUCKET
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "Product images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Authenticated users can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images');

create policy "Users can update own product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and owner = auth.uid());

create policy "Users can delete own product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and owner = auth.uid());

-- 11. CARTS + CART ITEMS
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  updated_at timestamptz default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity int not null default 1,
  added_at timestamptz default now(),
  unique (cart_id, product_id)
);

alter table public.carts enable row level security;
create policy "Users manage own cart"
  on public.carts for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.cart_items enable row level security;
create policy "Users manage own cart items"
  on public.cart_items for all to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

create index if not exists cart_items_cart_id_idx on public.cart_items (cart_id);
create index if not exists cart_items_product_id_idx on public.cart_items (product_id);

-- 12. WALLETS + WALLET TRANSACTIONS
create table if not exists public.wallets (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  balance numeric not null default 0 check (balance >= 0),
  updated_at timestamptz default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('deposit','withdraw','purchase','earning','payout')),
  amount numeric not null,
  status text not null check (status in ('pending','completed','rejected')) default 'completed',
  method text,
  description text,
  created_at timestamptz default now()
);

alter table public.wallets enable row level security;
create policy "Users view own wallet"
  on public.wallets for select to authenticated
  using (user_id = auth.uid());
-- Tidak ada policy insert/update — saldo hanya berubah lewat RPC (security definer).

alter table public.wallet_transactions enable row level security;
create policy "Users view own transactions"
  on public.wallet_transactions for select to authenticated
  using (user_id = auth.uid());
-- Tidak ada policy insert — transaksi hanya dibuat lewat RPC.

create index if not exists wallet_transactions_user_id_idx on public.wallet_transactions (user_id);

-- 13. COUPONS + REDEMPTIONS
create table if not exists public.coupons (
  id bigint generated always as identity primary key,
  code text unique not null,
  seller_id uuid references public.profiles(id) on delete cascade,
  discount_type text not null check (discount_type in ('percent','fixed')) default 'percent',
  discount_value numeric not null default 0,
  min_purchase numeric not null default 0,
  max_uses int,
  used_count int not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id bigint references public.coupons(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz default now(),
  unique (coupon_id, user_id)
);

alter table public.coupons enable row level security;
create policy "Active coupons viewable"
  on public.coupons for select to authenticated
  using (active = true);
create policy "Sellers manage own coupons"
  on public.coupons for all to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());
create policy "Admins manage all coupons"
  on public.coupons for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

alter table public.coupon_redemptions enable row level security;
create policy "Users view own redemptions"
  on public.coupon_redemptions for select to authenticated
  using (user_id = auth.uid());
-- Insert redemption hanya lewat RPC place_order (security definer).

create index if not exists coupons_seller_id_idx on public.coupons (seller_id);
create index if not exists coupon_redemptions_user_id_idx on public.coupon_redemptions (user_id);

-- 14. FOLLOWS
create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.follows enable row level security;
create policy "Follows are public"
  on public.follows for select using (true);
create policy "Users follow others"
  on public.follows for insert to authenticated
  with check (follower_id = auth.uid());
create policy "Users unfollow"
  on public.follows for delete to authenticated
  using (follower_id = auth.uid());

create index if not exists follows_following_id_idx on public.follows (following_id);

-- ============================================================
-- 15. TRIGGER: profile + wallet otomatis saat signup
-- Role SELALU 'member' — metadata role dari client diabaikan
-- agar tidak ada yang bisa daftar sebagai admin lewat API.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    'member'
  );
  insert into public.wallets (user_id, balance) values (new.id, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 16. RPC: CHECKOUT ATOMIK (place_order)
-- Validasi stok, kurangi stok, buat order + order_items,
-- terapkan kupon — semua dalam satu transaksi.
-- Harga SELALU diambil dari DB (client tidak dipercaya).
-- payment_method 'wallet': saldo dikunci (FOR UPDATE), diperiksa terhadap
-- total tagihan, lalu dipotong + dicatat di wallet_transactions. Kalau saldo
-- kurang, fungsi raise exception sehingga order, pemotongan stok, dan redeem
-- kupon ikut dibatalkan — tidak ada order yatim.
-- ============================================================
create or replace function public.place_order(
  p_items jsonb,
  p_shipping_address text default '',
  p_payment_method text default 'bank_transfer',
  p_coupon_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_buyer uuid := auth.uid();
  v_coupon public.coupons%rowtype;
  v_discount numeric := 0;
  v_subtotal numeric := 0;
  v_seller uuid;
  v_order_id uuid;
  v_first_order_id uuid;
  v_order_ids uuid[] := '{}'::uuid[];
  v_item jsonb;
  v_qty int;
  v_price numeric;
  v_stock int;
  v_title text;
  v_image text;
  v_seller_subtotal numeric;
  v_shipping numeric := 20000;
  v_wallet boolean := lower(coalesce(p_payment_method, '')) = 'wallet';
  v_balance numeric := 0;
  v_required numeric := 0;
  v_seller_count int := 0;
begin
  if v_buyer is null then
    raise exception 'Login diperlukan untuk checkout';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang kosong';
  end if;

  -- Kunci saldo di awal transaksi: dua order wallet paralel tidak boleh sama-sama
  -- lolos cek saldo. Baris wallet-nya dikunci sampai transaksi selesai/rollback.
  if v_wallet then
    select balance into v_balance
      from public.wallets
     where user_id = v_buyer
       for update;
    if not found then
      raise exception 'Wallet tidak ditemukan';
    end if;
  end if;

  -- product_id wajib UUID asli. Item sisa data lama (id numerik) ditolak dengan
  -- pesan terbaca, bukan error cast Postgres.
  if exists (
    select 1 from jsonb_array_elements(p_items) e
     where coalesce(e.value->>'product_id', '') !~*
           '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  ) then
    raise exception 'Item keranjang tidak valid, hapus lalu tambahkan ulang produknya';
  end if;

  -- Validasi stok + hitung subtotal
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_qty := coalesce((v_item->>'quantity')::int, 0);
    if v_qty <= 0 then
      raise exception 'Kuantitas tidak valid';
    end if;
    select stock, title into v_stock, v_title
      from public.products
     where id = (v_item->>'product_id')::uuid and status = 'published';
    if not found then
      raise exception 'Produk tidak tersedia';
    end if;
    if v_stock < v_qty then
      raise exception 'Stok tidak mencukupi: %', v_title;
    end if;
    select price into v_price from public.products where id = (v_item->>'product_id')::uuid;
    v_subtotal := v_subtotal + v_price * v_qty;
  end loop;

  -- Validasi kupon
  if p_coupon_code is not null and p_coupon_code <> '' then
    select * into v_coupon from public.coupons
     where lower(code) = lower(p_coupon_code) and active = true
       and (expires_at is null or expires_at > now());
    if not found then
      raise exception 'Kupon tidak valid atau sudah kedaluwarsa';
    end if;
    if exists (select 1 from public.coupon_redemptions where coupon_id = v_coupon.id and user_id = v_buyer) then
      raise exception 'Kupon sudah pernah kamu pakai';
    end if;
    if v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses then
      raise exception 'Kuota kupon sudah habis';
    end if;
    if v_coupon.min_purchase > 0 and v_subtotal < v_coupon.min_purchase then
      raise exception 'Subtotal belum memenuhi minimal pembelian kupon';
    end if;
    if v_coupon.discount_type = 'percent' then
      v_discount := round(v_subtotal * v_coupon.discount_value / 100);
    else
      v_discount := least(v_coupon.discount_value, v_subtotal);
    end if;
  end if;

  -- Tagihan wallet = subtotal + ongkos per penjual - diskon kupon. Nilainya sama
  -- persis dengan jumlah total seluruh order yang akan dibuat di bawah.
  if v_wallet then
    select count(distinct p.seller_id) into v_seller_count
      from jsonb_array_elements(p_items) e
      join public.products p on p.id = (e.value->>'product_id')::uuid;
    v_required := v_subtotal + v_shipping * v_seller_count - v_discount;
    if v_balance < v_required then
      raise exception 'Saldo wallet tidak mencukupi. Tagihan Rp %, saldo Rp %',
        trim(to_char(v_required, 'FM999999999999')),
        trim(to_char(v_balance, 'FM999999999999'));
    end if;
  end if;

  -- Buat satu order per penjual.
  -- Penjual SELALU diambil dari baris products di DB, bukan dari kiriman client.
  for v_seller in
    select distinct p.seller_id
    from jsonb_array_elements(p_items) elem
    join public.products p on p.id = (elem.value->>'product_id')::uuid
  loop
    select coalesce(sum((elem.value->>'quantity')::int * p.price), 0)
      into v_seller_subtotal
      from jsonb_array_elements(p_items) elem
      join public.products p on p.id = (elem.value->>'product_id')::uuid
     where p.seller_id = v_seller;

    insert into public.orders (buyer_id, seller_id, status, payment_method, payment_status,
                               shipping_address, subtotal, shipping_cost, total)
    values (v_buyer, v_seller, 'pending', p_payment_method,
            case when v_wallet then 'paid' else 'pending' end,
            p_shipping_address, v_seller_subtotal, v_shipping,
            v_seller_subtotal + v_shipping)
    returning id into v_order_id;
    v_first_order_id := coalesce(v_first_order_id, v_order_id);
    v_order_ids := v_order_ids || v_order_id;

    for v_item in
      select elem.value from jsonb_array_elements(p_items) elem
      join public.products p on p.id = (elem.value->>'product_id')::uuid
       where p.seller_id = v_seller
    loop
      v_qty := (v_item->>'quantity')::int;
      select p.price, p.title,
             (select pi.url from public.product_images pi
               where pi.product_id = p.id order by pi.is_primary desc limit 1)
        into v_price, v_title, v_image
        from public.products p where p.id = (v_item->>'product_id')::uuid;

      update public.products set stock = stock - v_qty
       where id = (v_item->>'product_id')::uuid and stock >= v_qty;
      if not found then
        raise exception 'Stok tidak mencukupi: %', v_title;
      end if;

      insert into public.order_items (order_id, product_id, seller_id, title, image, quantity, unit_price)
      values (v_order_id, (v_item->>'product_id')::uuid, v_seller, v_title, v_image, v_qty, v_price);
    end loop;
  end loop;

  -- Diskon kupon hanya dipasang di order pertama
  if v_discount > 0 and v_first_order_id is not null then
    update public.orders
       set discount = v_discount,
           coupon_id = v_coupon.id,
           total = subtotal + shipping_cost - v_discount
     where id = v_first_order_id;
    insert into public.coupon_redemptions (coupon_id, user_id, order_id)
    values (v_coupon.id, v_buyer, v_first_order_id);
    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;

  -- Pembayaran wallet: potong saldo sekali, lalu catat satu baris riwayat per order.
  -- v_required selalu sama dengan jumlah total seluruh order yang baru dibuat,
  -- termasuk saat kupon dipakai (diskon sudah dikurangi di perhitungan di atas).
  if v_wallet then
    update public.wallets
       set balance = balance - v_required, updated_at = now()
     where user_id = v_buyer;

    insert into public.wallet_transactions (user_id, type, amount, status, method, description)
    select v_buyer, 'purchase', o.total, 'completed', 'wallet',
           'Pembayaran order ' || coalesce(o.order_number, o.id::text)
      from public.orders o
     where o.id = any (v_order_ids);

    return jsonb_build_object(
      'order_id', v_first_order_id,
      'charged', v_required,
      'balance', v_balance - v_required
    );
  end if;

  return jsonb_build_object('order_id', v_first_order_id);
end;
$$;

-- ============================================================
-- 17. RPC: WALLET
-- ============================================================
create or replace function public.wallet_topup(p_amount numeric, p_method text default 'bank_transfer')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then raise exception 'Login diperlukan'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Nominal tidak valid'; end if;
  insert into public.wallets (user_id, balance) values (v_user, 0)
  on conflict (user_id) do nothing;
  insert into public.wallet_transactions (user_id, type, amount, status, method, description)
  values (v_user, 'deposit', p_amount, 'completed', p_method, 'Top up saldo')
  returning id into v_id;
  update public.wallets set balance = balance + p_amount, updated_at = now()
   where user_id = v_user;
  return v_id;
end;
$$;

create or replace function public.wallet_withdraw(p_amount numeric, p_account jsonb default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_balance numeric;
  v_id uuid;
begin
  if v_user is null then raise exception 'Login diperlukan'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Nominal tidak valid'; end if;
  select balance into v_balance from public.wallets where user_id = v_user for update;
  v_balance := coalesce(v_balance, 0);
  if v_balance < p_amount then raise exception 'Saldo tidak mencukupi'; end if;
  insert into public.wallet_transactions (user_id, type, amount, status, method, description)
  values (v_user, 'withdraw', p_amount, 'pending', 'payout', 'Permintaan pencairan dana')
  returning id into v_id;
  update public.wallets set balance = balance - p_amount, updated_at = now()
   where user_id = v_user;
  return v_id;
end;
$$;

-- ============================================================
-- 18. RPC: ADMIN (role & hapus user)
-- ============================================================
create or replace function public.admin_update_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Khusus admin';
  end if;
  if p_role not in ('admin','moderator','vendor','member') then
    raise exception 'Role tidak valid';
  end if;
  update public.profiles set role = p_role where id = p_user_id;
end;
$$;

create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Khusus admin';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Tidak bisa menghapus akun sendiri';
  end if;
  delete from auth.users where id = p_user_id;
end;
$$;

-- Grant execute ke authenticated
grant execute on function public.place_order(jsonb, text, text, text) to authenticated;
grant execute on function public.wallet_topup(numeric, text) to authenticated;
grant execute on function public.wallet_withdraw(numeric, jsonb) to authenticated;
grant execute on function public.admin_update_user_role(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- ============================================================
-- 19. SEED DATA (kategori)
-- ============================================================
insert into public.categories (name, slug, icon) values
  ('Clothing', 'clothing', 'shirt'),
  ('Shoes', 'shoes', 'footprints'),
  ('Home & Living', 'home-living', 'home'),
  ('Jewelry & Accessories', 'jewelry-accessories', 'gem'),
  ('Toys & Entertainment', 'toys-entertainment', 'gamepad-2'),
  ('Graphics & Photos', 'graphics-photos', 'image'),
  ('Video & Audio', 'video-audio', 'music'),
  ('Web Templates & Code', 'web-templates-code', 'code')
on conflict (slug) do nothing;

-- ============================================================
-- 20. ADMIN POLICIES (Tahap 7.9 — Panel Admin baca/tulis lintas user)
-- Helper is_admin() dipakai semua policy admin agar konsisten.
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.role in ('admin', 'moderator') from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins update any profile" on public.profiles;
create policy "Admins update any profile"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins view all orders" on public.orders;
create policy "Admins view all orders"
  on public.orders for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
  on public.orders for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins view all order items" on public.order_items;
create policy "Admins view all order items"
  on public.order_items for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins view all conversations" on public.conversations;
create policy "Admins view all conversations"
  on public.conversations for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins view all messages" on public.messages;
create policy "Admins view all messages"
  on public.messages for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins moderate reviews" on public.reviews;
create policy "Admins moderate reviews"
  on public.reviews for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins view all wallets" on public.wallets;
create policy "Admins view all wallets"
  on public.wallets for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins view all wallet transactions" on public.wallet_transactions;
create policy "Admins view all wallet transactions"
  on public.wallet_transactions for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins moderate wallet transactions" on public.wallet_transactions;
create policy "Admins moderate wallet transactions"
  on public.wallet_transactions for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins view all carts" on public.carts;
create policy "Admins view all carts"
  on public.carts for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins view all cart items" on public.cart_items;
create policy "Admins view all cart items"
  on public.cart_items for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins view all redemptions" on public.coupon_redemptions;
create policy "Admins view all redemptions"
  on public.coupon_redemptions for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins view all favorites" on public.favorites;
create policy "Admins view all favorites"
  on public.favorites for select to authenticated
  using (public.is_admin());

-- RPC: admin menyetujui/menolak permintaan payout (wallet_withdraw sudah memotong saldo,
-- jadi penolakan mengembalikan saldo lewat RPC security definer ini).
create or replace function public.admin_resolve_payout(p_transaction_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tx public.wallet_transactions%rowtype;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Khusus admin';
  end if;

  select * into v_tx from public.wallet_transactions
   where id = p_transaction_id and type = 'withdraw'
   for update;

  if not found then
    raise exception 'Permintaan payout tidak ditemukan';
  end if;
  if v_tx.status <> 'pending' then
    raise exception 'Permintaan payout sudah diproses';
  end if;

  update public.wallet_transactions
     set status = case when p_approve then 'completed' else 'rejected' end
   where id = p_transaction_id;

  if not p_approve then
    update public.wallets
       set balance = balance + v_tx.amount, updated_at = now()
     where user_id = v_tx.user_id;

    insert into public.wallet_transactions (user_id, type, amount, status, method, description)
    values (v_tx.user_id, 'deposit', v_tx.amount, 'completed', 'payout', 'Payout ditolak, saldo dikembalikan');
  end if;
end;
$$;

grant execute on function public.admin_resolve_payout(uuid, boolean) to authenticated;

drop policy if exists "Admins delete messages" on public.messages;
create policy "Admins delete messages"
  on public.messages for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- 21. SELLER / DASHBOARD POLICIES (Tahap 7.10)
-- Seller boleh mengelola produk, gambar, order, dan kupon miliknya sendiri.
-- ============================================================

drop policy if exists "Sellers manage images of own products" on public.product_images;
create policy "Sellers manage images of own products"
  on public.product_images for all to authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_images.product_id
      and (p.seller_id = auth.uid() or public.is_admin())
  ))
  with check (exists (
    select 1 from public.products p
    where p.id = product_images.product_id and p.seller_id = auth.uid()
  ));

drop policy if exists "Sellers update own orders" on public.orders;
create policy "Sellers update own orders"
  on public.orders for update to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

drop policy if exists "Buyers update own orders" on public.orders;
create policy "Buyers update own orders"
  on public.orders for update to authenticated
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());

drop policy if exists "Sellers view all products" on public.products;
create policy "Sellers view all products"
  on public.products for select to authenticated
  using (seller_id = auth.uid() or public.is_admin() or status = 'published');

drop policy if exists "Sellers delete own products" on public.products;
create policy "Sellers delete own products"
  on public.products for delete to authenticated
  using (seller_id = auth.uid());

-- Pengaturan toko seller (dipakai halaman /dashboard/shop-settings, /shop-policies, /shipping-settings)
alter table public.profiles add column if not exists shop_policies jsonb;
alter table public.profiles add column if not exists shipping_settings jsonb;
alter table public.profiles add column if not exists shop_settings jsonb;

-- ============================================================
-- TAHAP 9: banner home, brand, alamat checkout, quote & refund
-- ============================================================

-- 9.1 Banner hero slider di halaman home
create table if not exists public.banners (
  id serial primary key,
  title text not null,
  subtitle text,
  tag text,
  button_text text default 'Explore Now',
  button_link text default '/products',
  image_url text not null,
  sort_order int default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);
alter table public.banners enable row level security;
drop policy if exists "Active banners are public" on public.banners;
create policy "Active banners are public"
  on public.banners for select using (active = true);
drop policy if exists "Admins manage banners" on public.banners;
create policy "Admins manage banners"
  on public.banners for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 9.2 Daftar brand untuk filter produk
create table if not exists public.brands (
  id serial primary key,
  name text unique not null,
  logo_url text,
  created_at timestamptz default now()
);
alter table public.brands enable row level security;
drop policy if exists "Brands are public" on public.brands;
create policy "Brands are public"
  on public.brands for select using (true);
drop policy if exists "Admins manage brands" on public.brands;
create policy "Admins manage brands"
  on public.brands for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.products add column if not exists brand text;

-- 9.3 Produk digital: halaman /orders/downloads pakai kolom ini
alter table public.products add column if not exists is_digital boolean not null default false;
alter table public.products add column if not exists file_url text;

-- 9.4 Alamat pengiriman milik buyer
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  label text not null default 'Home',
  address text not null,
  is_default boolean not null default false,
  created_at timestamptz default now()
);
alter table public.addresses enable row level security;
drop policy if exists "Own addresses" on public.addresses;
create policy "Own addresses"
  on public.addresses for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 9.5 Permintaan penawaran (quote request) dari buyer ke seller
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  bid numeric,
  message text,
  status text not null default 'new'
    check (status in ('new','pending','accepted','rejected','cancelled')),
  created_at timestamptz default now()
);
alter table public.quote_requests enable row level security;
drop policy if exists "Parties view quotes" on public.quote_requests;
create policy "Parties view quotes"
  on public.quote_requests for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());
drop policy if exists "Buyers create quotes" on public.quote_requests;
create policy "Buyers create quotes"
  on public.quote_requests for insert to authenticated
  with check (buyer_id = auth.uid());
drop policy if exists "Parties update quotes" on public.quote_requests;
create policy "Parties update quotes"
  on public.quote_requests for update to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin())
  with check (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());
drop policy if exists "Buyers delete own quotes" on public.quote_requests;
create policy "Buyers delete own quotes"
  on public.quote_requests for delete to authenticated
  using (buyer_id = auth.uid() or public.is_admin());

-- 9.6 Pengajuan refund per order
create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'requested'
    check (status in ('requested','processing','approved','rejected')),
  created_at timestamptz default now()
);
alter table public.refund_requests enable row level security;
drop policy if exists "Parties view refunds" on public.refund_requests;
create policy "Parties view refunds"
  on public.refund_requests for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());
drop policy if exists "Buyers create refunds" on public.refund_requests;
create policy "Buyers create refunds"
  on public.refund_requests for insert to authenticated
  with check (buyer_id = auth.uid());
drop policy if exists "Sellers and admins update refunds" on public.refund_requests;
create policy "Sellers and admins update refunds"
  on public.refund_requests for update to authenticated
  using (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid() or public.is_admin());

-- Buyer boleh melihat item ordernya sendiri untuk halaman refunds/downloads
drop policy if exists "Buyers view own order items" on public.order_items;
create policy "Buyers view own order items"
  on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.buyer_id = auth.uid() or o.seller_id = auth.uid() or public.is_admin())
  ));

-- ==========================================
-- TAHAP 10 — Tabel pendukung halaman admin (CMS, katalog, membership, lokasi, help center)
-- ==========================================

-- 17a. TAGS + relasi ke produk
create table if not exists public.tags (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamptz default now()
);

create table if not exists public.product_tags (
  product_id uuid references public.products(id) on delete cascade,
  tag_id integer references public.tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

-- 17b. BRANDS — kolom untuk halaman admin
alter table public.brands add column if not exists slug text unique;
alter table public.brands add column if not exists active boolean not null default true;

-- 17c. THEMES
create table if not exists public.themes (
  id serial primary key,
  name text not null,
  description text,
  preview_url text,
  is_active boolean not null default false,
  version text,
  created_at timestamptz default now()
);

-- 17d. PAGES (halaman statis)
create table if not exists public.pages (
  id serial primary key,
  title text not null,
  slug text not null unique,
  location text,
  content text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz default now()
);

-- 17e. CUSTOM FIELDS
create table if not exists public.custom_fields (
  id serial primary key,
  name text not null,
  field_type text not null default 'Text Input',
  category text,
  required boolean not null default false,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- 17f. AD SPACES
create table if not exists public.ad_spaces (
  id serial primary key,
  name text not null,
  location text,
  size text,
  impressions integer not null default 0,
  clicks integer not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- 17g. ABUSE REPORTS
create table if not exists public.abuse_reports (
  id serial primary key,
  reporter_name text,
  reported_item text not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','resolved','banned')),
  created_at timestamptz default now()
);

-- 17h. EMAIL BLACKLIST
create table if not exists public.email_blacklist (
  id serial primary key,
  email text not null unique,
  reason text,
  created_at timestamptz default now()
);

-- 17i. NEWSLETTER
create table if not exists public.newsletter_subscribers (
  id serial primary key,
  email text not null unique,
  status text not null default 'subscribed' check (status in ('subscribed','unsubscribed')),
  created_at timestamptz default now()
);

-- 17j. CONTACT MESSAGES
create table if not exists public.contact_messages (
  id serial primary key,
  name text,
  email text,
  subject text,
  message text,
  created_at timestamptz default now()
);

-- 17k. BLOG
create table if not exists public.blog_categories (
  id serial primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

create table if not exists public.blog_posts (
  id serial primary key,
  title text not null,
  slug text not null unique,
  author_name text,
  category_id integer references public.blog_categories(id) on delete set null,
  content text,
  image_url text,
  views integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz default now()
);

create table if not exists public.blog_comments (
  id serial primary key,
  post_id integer references public.blog_posts(id) on delete cascade,
  commenter_name text,
  comment text,
  status text not null default 'pending' check (status in ('pending','approved','spam')),
  created_at timestamptz default now()
);

-- 17l. MEMBERSHIP & PROMO
create table if not exists public.membership_plans (
  id serial primary key,
  name text not null,
  price numeric not null default 0,
  duration text,
  features text,
  member_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.membership_payments (
  id serial primary key,
  payment_id text,
  method text,
  amount numeric not null default 0,
  status text not null default 'pending' check (status in ('pending','completed','refunded')),
  user_name text,
  plan text,
  ip text,
  created_at timestamptz default now()
);

create table if not exists public.promotion_payments (
  id serial primary key,
  payment_id text,
  method text,
  amount numeric not null default 0,
  status text not null default 'pending' check (status in ('pending','completed','refunded')),
  user_name text,
  promotion text,
  ip text,
  created_at timestamptz default now()
);

create table if not exists public.shop_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  requester_name text,
  shop_name text not null,
  categories text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table if not exists public.login_activities (
  id serial primary key,
  user_name text,
  ip text,
  device text,
  location text,
  created_at timestamptz default now()
);

create table if not exists public.deletion_requests (
  id serial primary key,
  user_name text,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- 17m. AFFILIATE
create table if not exists public.affiliates (
  id serial primary key,
  affiliate_name text not null,
  referrals integer not null default 0,
  earnings numeric not null default 0,
  conversion_rate numeric not null default 0,
  status text not null default 'pending' check (status in ('active','pending','banned')),
  created_at timestamptz default now()
);

-- 17n. LOKASI (rantai FK country -> state -> city)
create table if not exists public.countries (
  id serial primary key,
  name text not null,
  code text not null unique,
  flag text,
  active boolean not null default true
);

create table if not exists public.states (
  id serial primary key,
  name text not null,
  country_id integer references public.countries(id) on delete cascade,
  active boolean not null default true
);

create table if not exists public.cities (
  id serial primary key,
  name text not null,
  state_id integer references public.states(id) on delete cascade,
  active boolean not null default true
);

-- 17o. HELP CENTER
create table if not exists public.support_tickets (
  id serial primary key,
  user_name text,
  subject text not null,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  created_at timestamptz default now()
);

create table if not exists public.knowledge_base_articles (
  id serial primary key,
  title text not null,
  category text,
  content text,
  views integer not null default 0,
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz default now()
);

-- 17p. SETTINGS key/value (mis. pengaturan payout)
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 17q. RLS: semua tabel Tahap 10 hanya bisa dikelola admin
do $$
declare t text;
begin
  foreach t in array array[
    'tags','product_tags','brands','themes','pages','custom_fields','ad_spaces',
    'abuse_reports','email_blacklist','newsletter_subscribers','contact_messages',
    'blog_categories','blog_posts','blog_comments','membership_plans','membership_payments',
    'promotion_payments','shop_requests','login_activities','deletion_requests','affiliates',
    'countries','states','cities','support_tickets','knowledge_base_articles','app_settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Admins manage %s" on public.%I', t, t);
    execute format(
      'create policy "Admins manage %s" on public.%I for all to authenticated
         using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- 17r. Baca publik untuk data katalog/content yang dipakai storefront
drop policy if exists "Tags are public" on public.tags;
create policy "Tags are public" on public.tags for select using (true);
drop policy if exists "Blog categories are public" on public.blog_categories;
create policy "Blog categories are public" on public.blog_categories for select using (true);
drop policy if exists "Published blog posts are public" on public.blog_posts;
create policy "Published blog posts are public" on public.blog_posts for select using (status = 'published');
drop policy if exists "Active pages are public" on public.pages;
create policy "Active pages are public" on public.pages for select using (status = 'active');
drop policy if exists "Published articles are public" on public.knowledge_base_articles;
create policy "Published articles are public" on public.knowledge_base_articles for select using (status = 'published');
drop policy if exists "Locations are public" on public.countries;
create policy "Locations are public" on public.countries for select using (active = true);
drop policy if exists "Locations are public" on public.states;
create policy "Locations are public" on public.states for select using (active = true);
drop policy if exists "Locations are public" on public.cities;
create policy "Locations are public" on public.cities for select using (active = true);
drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);

-- 17s. RPC: admin membuat payout manual untuk penjual (potong saldo wallet penjual)
create or replace function public.admin_create_payout(
  p_seller_id uuid,
  p_amount numeric,
  p_method text default 'bank_transfer',
  p_description text default ''
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
  v_tx_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat membuat payout';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Nominal payout tidak valid';
  end if;

  select balance into v_balance from public.wallets where user_id = p_seller_id for update;
  if v_balance is null then
    raise exception 'Wallet penjual tidak ditemukan';
  end if;
  if v_balance < p_amount then
    raise exception 'Saldo penjual tidak cukup (sisa %)', v_balance;
  end if;

  update public.wallets set balance = balance - p_amount, updated_at = now()
    where user_id = p_seller_id;

  insert into public.wallet_transactions (user_id, type, amount, status, method, description)
    values (p_seller_id, 'withdraw', p_amount, 'pending', p_method, p_description)
    returning id into v_tx_id;

  return v_tx_id;
end $$;

grant execute on function public.admin_create_payout(uuid, numeric, text, text) to authenticated;

-- 17t. RPC: simpan/ambil pengaturan (key/value) sebagai admin
create or replace function public.admin_save_setting(p_key text, p_value jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat menyimpan pengaturan';
  end if;
  insert into public.app_settings (key, value, updated_at)
    values (p_key, p_value, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
  return p_value;
end $$;

grant execute on function public.admin_save_setting(text, jsonb) to authenticated;

-- ============================================================
-- TAHAP 11 — Trash (deleted), masa tayang (expired) & status baru
-- Idempotent: aman dijalankan ulang dari SQL Editor.
-- ============================================================

-- 11a. Kolom baru untuk halaman admin products/{deleted,expired}
alter table public.products add column if not exists deleted_at timestamptz;
alter table public.products add column if not exists expires_at timestamptz;
-- status sebelum masuk trash, dipakai tombol Restore di /admin/products/deleted
alter table public.products add column if not exists pre_trash_status text;

create index if not exists products_deleted_at_idx on public.products (deleted_at);
create index if not exists products_expires_at_idx on public.products (expires_at);

-- 11b. Perluas status check dengan 'expired' dan 'deleted'
alter table public.products drop constraint if exists products_status_check;
alter table public.products add constraint products_status_check
  check (status in ('draft','pending','published','hidden','sold','rejected','expired','deleted'));

-- 11c. Pindahkan produk yang masa tayangnya lewat dari now() ke status 'expired'
update public.products
  set status = 'expired'
  where deleted_at is null
    and status = 'published'
    and expires_at is not null
    and expires_at < now();

-- 11d. RPC: pindahkan produk ke trash / pulihkan dari trash (khusus admin)
create or replace function public.admin_trash_product(p_product_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat memindahkan produk ke trash';
  end if;

  update public.products
    set pre_trash_status = status,
        status = 'deleted',
        deleted_at = now()
    where id = p_product_id and status <> 'deleted';

  if not found then
    raise exception 'Produk tidak ditemukan atau sudah berada di trash';
  end if;

  return true;
end $$;

grant execute on function public.admin_trash_product(uuid) to authenticated;

create or replace function public.admin_restore_product(p_product_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat memulihkan produk';
  end if;

  update public.products
    set status = coalesce(pre_trash_status, 'pending'),
        pre_trash_status = null,
        deleted_at = null
    where id = p_product_id and status = 'deleted';

  if not found then
    raise exception 'Produk tidak ada di trash';
  end if;

  return true;
end $$;

grant execute on function public.admin_restore_product(uuid) to authenticated;

-- 11e. RPC: perpanjang masa tayang produk expired (default 30 hari)
create or replace function public.admin_renew_product(p_product_id uuid, p_days integer default 30)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_expires timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat memperpanjang masa tayang produk';
  end if;

  v_new_expires := now() + make_interval(days => coalesce(nullif(p_days, 0), 30));

  update public.products
    set expires_at = v_new_expires,
        status = 'published'
    where id = p_product_id;

  if not found then
    raise exception 'Produk tidak ditemukan';
  end if;

  return v_new_expires;
end $$;

grant execute on function public.admin_renew_product(uuid, integer) to authenticated;

-- ============================================================
-- TAHAP 12 — Beranda (/) membaca konfigurasi homepage_sections
-- Hanya key konfigurasi tampilan ini yang boleh dibaca publik;
-- policy "Admins manage app_settings" tetap mengunci penulisannya.
-- ============================================================
drop policy if exists "Homepage settings are readable" on public.app_settings;
create policy "Homepage settings are readable" on public.app_settings
  for select to anon, authenticated
  using (key = 'homepage_sections');

-- ============================================================
-- TAHAP 12B (arsip) — Auto-expire produk lewat pg_cron
-- Sudah diterapkan live; dicatat ulang di sini supaya file schema
-- = kebenaran database. Catatan: tabel products TIDAK punya kolom
-- updated_at, jadi fungsi ini hanya mengubah status.
-- ============================================================
create extension if not exists pg_cron;

create index if not exists idx_products_expires_at
  on public.products (expires_at)
  where status = 'published';

create or replace function public.expire_old_products()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
    set status = 'expired'
  where status = 'published'
    and expires_at is not null
    and expires_at < now();
end $$;

revoke execute on function public.expire_old_products() from public, anon, authenticated;

select cron.schedule('expire-old-products', '5 0 * * *', $$
  select public.expire_old_products();
$$);

-- ============================================================
-- TAHAP 12C — roles + role_permissions (pergantian ROLE_META statis)
-- Key role memakai nilai asli profiles.role: admin, moderator,
-- vendor, member. Tabel lama/policy yang sudah ada tidak diubah.
-- ============================================================
create table if not exists public.roles (
  key text primary key,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  id serial primary key,
  role_key text not null references public.roles(key) on delete cascade,
  permission text not null,
  created_at timestamptz not null default now(),
  unique (role_key, permission)
);

alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists "Admins manage roles" on public.roles;
create policy "Admins manage roles" on public.roles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage role_permissions" on public.role_permissions;
create policy "Admins manage role_permissions" on public.role_permissions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create index if not exists idx_role_permissions_role_key
  on public.role_permissions (role_key);

-- Seed 4 role asli + matriks hak akses (idempotent)
insert into public.roles (key, name, description, sort_order) values
  ('admin', 'Super Admin', 'Full uninhibited access to all modules, billing, settings, and permissions', 1),
  ('moderator', 'Moderator', 'Restricted access for daily content moderation and catalog approval', 2),
  ('vendor', 'Vendor', 'Store operator access for uploading items and managing store orders', 3),
  ('member', 'Member', 'Standard consumer buyer access for browsing, purchasing, and reviewing', 4)
on conflict (key) do update
  set name = excluded.name,
      description = excluded.description,
      sort_order = excluded.sort_order;

insert into public.role_permissions (role_key, permission)
select 'admin', unnest(array['All Permissions'])
on conflict (role_key, permission) do nothing;

insert into public.role_permissions (role_key, permission)
select 'moderator', unnest(array['Admin Panel','Slider','Homepage Manager','Products','Categories','Reviews','Comments','Abuse Reports'])
on conflict (role_key, permission) do nothing;

insert into public.role_permissions (role_key, permission)
select 'vendor', unnest(array['Vendor Storefront','Product Upload','Order Fulfillment','AI Writer'])
on conflict (role_key, permission) do nothing;

insert into public.role_permissions (role_key, permission)
select 'member', unnest(array['Storefront Browsing','Order History','Wishlist','Chat Messages'])
on conflict (role_key, permission) do nothing;

-- ============================================================
-- TAHAP 12D — payment_settings / email_settings / social_settings
-- Migrasi 5 halaman P1 (audit MODESY_AUDIT_STATUS.md): sebelumnya
-- form-nya state lokal + toast "berhasil disimpan" palsu sehingga
-- admin mengira konfigurasi aktif padahal hilang saat reload.
--
-- KEBIJAKAN RAHASIA: API key / client secret / password SMTP TIDAK
-- PERNAH ditulis ke database. Kolom jsonb hanya menyimpan NAMA env
-- var pointer (mis. STRIPE_SECRET_KEY). Nilai env dibaca di server
-- dan diekspor ke UI semata-mata sebagai status configured true/false.
--
-- Hanya tabel + policy baru di blok ini; tabel dan policy Tahap 1-12C
-- tidak disentuh.
-- ============================================================

create table if not exists public.payment_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.email_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.social_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.payment_settings enable row level security;
alter table public.email_settings enable row level security;
alter table public.social_settings enable row level security;

drop policy if exists "Admins manage payment_settings" on public.payment_settings;
create policy "Admins manage payment_settings" on public.payment_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage email_settings" on public.email_settings;
create policy "Admins manage email_settings" on public.email_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage social_settings" on public.social_settings;
create policy "Admins manage social_settings" on public.social_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Seed baris default (kosong & jujur: bukan kredensial contoh dari mock)
insert into public.payment_settings (key, value) values
  ('default', '{
     "activeGateway": "stripe",
     "gateways": {
       "stripe":   { "enabled": false, "mode": "test",    "publishableKeyEnv": "STRIPE_PUBLISHABLE_KEY", "secretKeyEnv": "STRIPE_SECRET_KEY" },
       "paypal":   { "enabled": false, "mode": "sandbox", "clientIdEnv": "PAYPAL_CLIENT_ID",            "secretKeyEnv": "PAYPAL_SECRET_KEY" },
       "midtrans": { "enabled": false, "mode": "sandbox", "clientKeyEnv": "MIDTRANS_CLIENT_KEY",         "serverKeyEnv": "MIDTRANS_SERVER_KEY" },
       "bank":     { "enabled": true,  "instructions": "" },
       "cod":      { "enabled": false, "note": "" }
     }
   }'::jsonb)
on conflict (key) do nothing;

insert into public.email_settings (key, value) values
  ('default', '{
     "protocol": "smtp",
     "host": "",
     "port": "587",
     "username": "",
     "passwordEnv": "SMTP_PASSWORD",
     "encryption": "tls",
     "senderEmail": "",
     "senderName": "Modesy Marketplace"
   }'::jsonb)
on conflict (key) do nothing;

insert into public.social_settings (key, value) values
  ('default', '{
     "google":   { "enabled": false, "clientId": "", "secretEnv": "GOOGLE_CLIENT_SECRET" },
     "facebook": { "enabled": false, "appId": "",    "secretEnv": "FACEBOOK_APP_SECRET" },
     "apple":    { "enabled": false, "serviceId": "" }
   }'::jsonb)
on conflict (key) do nothing;

-- ============================================================
-- TAHAP 12E — beranda: 5 section tambahan di HomeSectionRenderer
-- orders/order_items hanya terbaca peserta order + admin (RLS Tahap 6),
-- jadi daftar penjual terlaris untuk pengunjung anonim dibaca lewat RPC
-- agregat ini. Fungsinya security definer TETAPI hanya mengembalikan
-- identitas publik seller (username/nama/avatar/verified) + jumlah
-- penjualan; tidak ada nilai rupiah, tidak ada identitas pembeli.
-- Tidak ada policy lama yang diubah.
-- ============================================================
create or replace function public.home_top_sellers(p_limit integer default 6)
returns table (
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  verified boolean,
  total_orders bigint,
  items_sold bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with sales as (
    select oi.seller_id,
           count(distinct oi.order_id) as total_orders,
           sum(oi.quantity)::bigint as items_sold
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where o.status = 'completed'
    group by oi.seller_id
  )
  select s.seller_id,
         p.username,
         p.full_name,
         p.avatar_url,
         p.verified,
         s.total_orders,
         s.items_sold
  from sales s
  join public.profiles p on p.id = s.seller_id
  where p.role in ('vendor', 'admin') and p.username is not null
  order by s.items_sold desc, s.total_orders desc, p.created_at asc
  limit greatest(1, least(coalesce(p_limit, 6), 20));
$$;

revoke all on function public.home_top_sellers(integer) from public;
grant execute on function public.home_top_sellers(integer) to anon, authenticated;

-- ============================================================
-- TAHAP 12F — checkout storefront membaca payment_settings
-- payment_settings hanya terbaca admin (policy "Admins manage
-- payment_settings" memakai public.is_admin()), dan policy itu
-- TIDAK boleh dilonggarkan supaya shoppers tidak bisa membaca
-- pointer env var. Jadi storefront membaca daftar metode lewat
-- fungsi whitelist ini: hanya id/enabled/mode/instructions/note
-- yang keluar. Nama env var, secretKeyEnv, publishableKeyEnv,
-- clientKeyEnv, serverKeyEnv dan field rahasia apa pun sengaja
-- tidak disertakan. Tidak ada policy lama yang diubah.
-- ============================================================
create or replace function public.storefront_payment_options()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with raw as (
    select s.value as v
    from public.payment_settings s
    where s.key = 'default'
    limit 1
  ),
  seed(name, order_index, enabled_default, mode_default) as (
    values
      ('stripe',   1, false, 'test'),
      ('paypal',   2, false, 'sandbox'),
      ('midtrans', 3, false, 'sandbox'),
      ('bank',     4, true,  'live'),
      ('cod',      5, false, 'live')
  ),
  merged as (
    select sd.name,
           sd.order_index,
           sd.enabled_default,
           sd.mode_default,
           coalesce(r.v -> 'gateways' -> sd.name, '{}'::jsonb) as g
    from seed sd
    left join raw r on true
  ),
  opts as (
    select name as id,
           order_index,
           case
             when jsonb_typeof(g -> 'enabled') = 'boolean' then (g ->> 'enabled')::boolean
             else enabled_default
           end as enabled,
           coalesce(nullif(g ->> 'mode', ''), mode_default) as mode,
           coalesce(g ->> 'instructions', '') as instructions,
           coalesce(g ->> 'note', '') as note
    from merged
  )
  select jsonb_build_object(
    'activeGateway',
      case
        when exists (
          select 1 from opts o
          where o.enabled
            and o.id = (select r.v ->> 'activeGateway' from raw r)
        )
        then (select r.v ->> 'activeGateway' from raw r)
        else null
      end,
    'options',
      coalesce(
        (
          select jsonb_agg(
                   jsonb_build_object(
                     'id', o.id,
                     'enabled', o.enabled,
                     'mode', o.mode,
                     'instructions', o.instructions,
                     'note', o.note
                   )
                   order by o.order_index
                 )
          from opts o
          where o.enabled
        ),
        '[]'::jsonb
      )
  );
$$;

revoke all on function public.storefront_payment_options() from public;
grant execute on function public.storefront_payment_options() to anon, authenticated;
