-- ============================================================
-- MODESY CLONE — SUPABASE SEED DATA (Tahap 7.11)
-- Jalankan SETELAH SUPABASE_SCHEMA.sql di SQL Editor Supabase.
-- Aman dijalankan ulang (idempotent).
--
-- Password SEMUA akun seed: Modesy123!
-- 5 user (admin, moderator, vendor1, vendor2, member1)
-- 8 kategori (sudah ada di schema) — seed menambah produk untuk 5 kategori
-- 20 produk + gambar, 10 order + item, 5 kupon
-- ============================================================

-- ------------------------------------------------------------
-- 1. AKUN LOGIN (auth.users + auth.identities)
-- Trigger handle_new_user otomatis membuat baris profiles + wallets.
-- Role TIDAK dibaca dari user_metadata: role diatur lewat UPDATE profiles di bawah.
-- ------------------------------------------------------------
do $$
declare
  r record;
  v_uid uuid;
begin
  for r in
    select * from (values
      ('admin@modesy.local',     'admin',     'Admin Modesy',  'admin'),
      ('moderator@modesy.local', 'moderator', 'Moderator Modesy', 'moderator'),
      ('vendor1@modesy.local',   'vendor1',   'Daniel Jones',  'vendor'),
      ('vendor2@modesy.local',   'vendor2',   'Ahmad Rizky',   'vendor'),
      ('member1@modesy.local',   'member1',   'Budi Santoso',  'member')
    ) as t(email, username, full_name, role)
  loop
    if not exists (select 1 from auth.users where email = r.email) then
      v_uid := gen_random_uuid();

      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user,
        confirmation_token, recovery_token, email_change, email_change_token_new
      ) values (
        '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated', r.email,
        extensions.crypt('Modesy123!', extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('username', r.username, 'full_name', r.full_name),
        now(), now(), false,
        '', '', '', ''
      );

      insert into auth.identities (
        id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at
      ) values (
        gen_random_uuid(), v_uid, v_uid,
        jsonb_build_object('sub', v_uid::text, 'email', r.email, 'email_verified', true),
        'email', now(), now(), now()
      );
    end if;
  end loop;
end $$;

-- GoTrue tidak bisa login kalau kolom token ini NULL ("Database error querying schema"),
-- jadi pastikan isinya string kosong untuk semua akun seed.
update auth.users
set confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change = coalesce(email_change, ''),
    email_change_token_new = coalesce(email_change_token_new, '')
where email like '%@modesy.local';

-- ------------------------------------------------------------
-- 2. PROFIL: role, verified, bio, avatar, banner, data toko
-- ------------------------------------------------------------
create or replace function public.__seed_profile(p_username text, p_role text, p_bio text, p_location text, p_shop text, p_verified boolean)
returns void language sql security definer set search_path = '' as $$
  update public.profiles set
    role = p_role,
    bio = p_bio,
    location = p_location,
    shop_name = p_shop,
    verified = p_verified,
    avatar_url = 'https://picsum.photos/seed/avatar-' || p_username || '/200/200',
    banner_url = 'https://picsum.photos/seed/banner-' || p_username || '/1600/500'
  where username = p_username;
$$;

select public.__seed_profile('admin', 'admin',
  'Pengelola platform Modesy. Tim support tersedia Senin-Jumat 09.00-18.00 WIB.',
  'Jakarta, Indonesia', 'Modesy Official', true);

select public.__seed_profile('moderator', 'moderator',
  'Moderator katalog: memeriksa produk baru dan laporan penyalahgunaan.',
  'Bandung, Indonesia', null, true);

select public.__seed_profile('vendor1', 'vendor',
  'Trendshop — perabot rumah, tas, dan fashion pilihan. Pengiriman dari Bandung setiap hari kerja.',
  'Bandung, Indonesia', 'Trendshop', true);

select public.__seed_profile('vendor2', 'vendor',
  'Rizky Digital — template website, aset foto/video, mainan kayu, dan sneakers. Repon cepat.',
  'Surabaya, Indonesia', 'Rizky Digital', false);

select public.__seed_profile('member1', 'member',
  'Kolektor perabot vintage dan hobi foto jalanan.',
  'Yogyakarta, Indonesia', null, false);

drop function public.__seed_profile(text, text, text, text, text, boolean);

-- ------------------------------------------------------------
-- 3. PRODUK (20 baris) via tabel temporer
-- ------------------------------------------------------------
drop table if exists temp_modesy_products;
create temp table temp_modesy_products as
select t.*, row_number() over () as row_no
from (values
  ('vendor1', 'home-living',           'handcrafted-decorative-pillow',       'Handcrafted decorative pillow for a luxurious touch', 'Bantal dekoratif anyaman tangan, jahitan rapi, isi serat halus.', 250000, 320000, 20, 'new',  true,  'pillow',  1),
  ('vendor1', 'clothing',              'women-saddle-handbag',                'Women kipiling bally saddle handbag',                 'Tas kulit sintetis model saddle, muat laptop 13 inch.',       480000, 590000,  8, 'new',  true,  'bag',     2),
  ('vendor1', 'home-living',           'minimalist-teak-coffee-table',        'Minimalist teak coffee table with drawer',            'Meja kopi kayu jati solid, finishing doff.',                1850000, 2400000, 3, 'new',  false, 'table',   1),
  ('vendor1', 'clothing',              'vintage-leather-jacket',              'Vintage leather jacket size L',                       'Jaket kulit asli bekas pakai, kondisi 90%.',                  750000, 900000,  5, 'used', false, 'jacket',  1),
  ('vendor1', 'home-living',           'woven-rattan-storage-basket',         'Woven rattan storage basket set of 3',                'Set 3 keranjang rotan untuk mainan atau cucian.',           120000, 150000, 25, 'new',  false, 'basket',  2),
  ('vendor1', 'clothing',              'canvas-tote-bag-eco',                 'Canvas tote bag eco series',                          'Tote canvas 12oz, sablon berbasis air.',                       95000, 130000, 40, 'new',  false, 'tote',    1),
  ('vendor1', 'home-living',           'monstera-plant-with-pot',             'Indoor monstera plant with ceramic pot',              'Tanaman hias monstera lengkap dengan pot keramik.',          165000, null,   12, 'new',  false, 'plant',   1),
  ('vendor1', 'home-living',           'brass-table-lamp-classic',           'Brass table lamp classic shade',                      'Lampu meja kuningan, shades kain baru.',                       620000, 780000,  6, 'used', true,  'lamp',    1),
  ('vendor1', 'shoes',                 'lightweight-running-shoes',           'Lightweight running shoes for daily jog',             'Sepatu lari mesh, sol EVA, ukuran 39-43.',                      540000, 690000, 10, 'new',  false, 'runner',  2),
  ('vendor1', 'home-living',           'ceramic-dinner-set-12pcs',            'Ceramic dinner set 12 pieces',                        'Set piring keramik 12 pcs, aman microwave.',                  430000, 520000,  9, 'new',  false, 'dinner',  1),

  ('vendor2', 'toys-entertainment',    'wooden-building-blocks-100pcs',       'Wooden building blocks 100 pieces',                   'Balok kayu cat non-toksik, 100 pieces.',                       185000, 240000, 30, 'new',  false, 'blocks',  1),
  ('vendor2', 'toys-entertainment',    'rc-drift-car-24ghz',                  'RC drift car 2.4GHz with spare motor',                'Mobil remote drift, baterai 1500mAh + spare motor.',          460000, 560000,  7, 'new',  true,  'rcar',    2),
  ('vendor2', 'graphics-photos',       'preset-lightroom-moody-pack',         'Lightroom presets moody pack (30 files)',             '30 preset Lightroom, format XMP, lisensi personal.',           75000, null,   99, 'new',  false, 'preset',  1),
  ('vendor2', 'graphics-photos',       'stock-photo-jakarta-skyline',         'Stock photo pack Jakarta skyline',                    '20 foto resolusi 4K kawasan Jakarta.',                        120000, null,   50, 'new',  false, 'skyline', 1),
  ('vendor2', 'video-audio',           'lofi-music-track-pack',               'Lofi music track pack (10 royalty-free)',             '10 trek lofi royalty-free, WAV + MP3.',                       250000, 300000, 20, 'new',  false, 'lofi',    1),
  ('vendor2', 'video-audio',           'podcast-xlr-microphone',              'Podcast XLR microphone with shock mount',             'Mikrofon XLR kondensor + shock mount.',                        890000, 1050000, 4, 'used', false, 'mic',     1),
  ('vendor2', 'web-templates-code',    'nextjs-landing-page-template',        'Next.js landing page template with blog',             'Template Next.js 16 + Tailwind, termasuk halaman blog.',       350000, null,   99, 'new',  true,  'nextjs',  2),
  ('vendor2', 'web-templates-code',    'bootstrap-admin-dashboard',           'Bootstrap 5 admin dashboard kit',                     'Admin dashboard Bootstrap 5, 25 komponen.',                    420000, 500000, 99, 'new',  false, 'admin',   1),
  ('vendor2', 'shoes',                 'white-leather-sneakers',              'White leather sneakers premium',                      'Sneakers kulit putih, outsole rubber.',                        610000, 720000,  6, 'new',  false, 'sneaker', 2),
  ('vendor2', 'shoes',                 'sneaker-cleaning-kit',                'Sneaker cleaning kit complete',                       'Kit bersih-bersih sneakers + 3 jenis sikat.',                   85000, 110000, 35, 'new',  false, 'clean',   1)
) as t(seller_username, category_slug, slug, title, description, price, old_price, stock, condition, featured, image_seed, extra_image);

insert into public.products (
  seller_id, category_id, title, slug, description, short_description,
  price, old_price, stock, condition, location, status, featured, views, created_at
)
select
  u.id,
  c.id,
  t.title,
  t.slug,
  t.description,
  left(t.description, 90),
  t.price,
  t.old_price,
  t.stock,
  t.condition,
  u.location,
  'published',
  t.featured,
  ((t.row_no * 37) % 400)::int,
  now() - ((t.row_no * 2) || ' days')::interval
from temp_modesy_products t
join public.profiles u on u.username = t.seller_username
left join public.categories c on c.slug = t.category_slug
where not exists (select 1 from public.products p where p.slug = t.slug);

insert into public.product_images (product_id, url, is_primary)
select p.id, 'https://picsum.photos/seed/' || t.image_seed || '-main/800/800', true
from temp_modesy_products t
join public.products p on p.slug = t.slug
where not exists (select 1 from public.product_images i where i.product_id = p.id);

insert into public.product_images (product_id, url, is_primary)
select p.id, 'https://picsum.photos/seed/' || t.image_seed || '-alt/800/800', false
from temp_modesy_products t
join public.products p on p.slug = t.slug
where t.extra_image > 1
  and not exists (select 1 from public.product_images i where i.product_id = p.id and i.is_primary = false);

-- ------------------------------------------------------------
-- 4. KUPON (5 baris)
-- ------------------------------------------------------------
insert into public.coupons (code, seller_id, discount_type, discount_value, min_purchase, max_uses, expires_at, active)
select v.code,
       (select id from public.profiles where username = v.seller_username),
       v.discount_type, v.discount_value, v.min_purchase, v.max_uses,
       now() + (v.valid_days || ' days')::interval, true
from (values
  ('MODESY10',   null,      'percent', 10, 100000,  500, 90),
  ('NEWBIE25',   null,      'percent', 25,  50000,  200, 60),
  ('HEMAT50K',   'vendor1', 'fixed',   50000, 300000, 100, 45),
  ('TRENDSHOP15','vendor1', 'percent', 15,  200000,   80, 30),
  ('RIZKYDIGITAL','vendor2','fixed',   75000, 400000,  60, 75)
) as v(code, seller_username, discount_type, discount_value, min_purchase, max_uses, valid_days)
where not exists (select 1 from public.coupons c where c.code = v.code);

-- ------------------------------------------------------------
-- 5. ORDER (10 baris) + ORDER_ITEMS
-- Harga item dibaca ulang dari DB agar subtotal konsisten.
-- ------------------------------------------------------------
drop table if exists temp_modesy_orders;
create temp table temp_modesy_orders as
select * from (values
  ('#10040', 'member1', 'vendor1', 'handcrafted-decorative-pillow', 2, 'completed',  'paid',         'bank_transfer',  true,  'Jl. Malioboro No. 12, Yogyakarta', 3),
  ('#10041', 'member1', 'vendor2', 'wooden-building-blocks-100pcs', 1, 'shipped',    'paid',         'wallet',         false, 'Perum Griya Asri B12, Sleman',     6),
  ('#10042', 'vendor2', 'vendor1', 'women-saddle-handbag',          1, 'processing', 'paid',         'debit',          false, 'Jl. Raya Kertajaya 88, Surabaya',  11),
  ('#10043', 'admin',   'vendor2', 'nextjs-landing-page-template',  1, 'completed',  'paid',         'bank_transfer',  true,  'Jl. Sudirman Kav. 1, Jakarta',      2),
  ('#10044', 'member1', 'vendor2', 'sneaker-cleaning-kit',          3, 'pending',    'pending',      'cod',            false, 'Jl. Kaliurang KM 9, Sleman',        0),
  ('#10045', 'vendor1', 'vendor2', 'lofi-music-track-pack',         2, 'completed',  'paid',         'wallet',         true,  'Jl. Braga No. 22, Bandung',          8),
  ('#10046', 'member1', 'vendor1', 'ceramic-dinner-set-12pcs',      1, 'cancelled',  'refunded',     'bank_transfer',  false, 'Jl. Malioboro No. 12, Yogyakarta',  5),
  ('#10047', 'admin',   'vendor1', 'minimalist-teak-coffee-table',  1, 'shipped',    'paid',         'debit',          false, 'Jl. Sudirman Kav. 1, Jakarta',      4),
  ('#10048', 'vendor2', 'vendor1', 'monstera-plant-with-pot',       2, 'completed',  'paid',         'bank_transfer',  true,  'Jl. Raya Kertajaya 88, Surabaya',  1),
  ('#10049', 'member1', 'vendor2', 'rc-drift-car-24ghz',            1, 'processing', 'pending',      'credit_card',    false, 'Jl. Kaliurang KM 9, Sleman',        0)
) as t(order_number, buyer_username, seller_username, product_slug, quantity, status, payment_status, payment_method, apply_coupon, shipping_address, days_ago);

insert into public.orders (
  order_number, buyer_id, seller_id, status, payment_method, payment_status,
  shipping_address, subtotal, shipping_cost, discount, coupon_id, total, created_at
)
select
  o.order_number,
  b.id,
  s.id,
  o.status,
  o.payment_method,
  o.payment_status,
  o.shipping_address,
  p.price * o.quantity,
  case when o.status = 'cancelled' then 0 else 20000 end,
  case when o.apply_coupon then round(p.price * o.quantity * 0.10) else 0 end,
  case when o.apply_coupon then c.id else null end,
  (p.price * o.quantity)
    + (case when o.status = 'cancelled' then 0 else 20000 end)
    - (case when o.apply_coupon then round(p.price * o.quantity * 0.10) else 0 end),
  now() - (o.days_ago || ' days')::interval
from temp_modesy_orders o
join public.profiles b on b.username = o.buyer_username
join public.profiles s on s.username = o.seller_username
join public.products p on p.slug = o.product_slug
left join public.coupons c on c.code = 'MODESY10'
where not exists (select 1 from public.orders x where x.order_number = o.order_number);

insert into public.order_items (order_id, product_id, seller_id, title, image, quantity, unit_price)
select
  ord.id,
  p.id,
  p.seller_id,
  p.title,
  coalesce(img.url, 'https://picsum.photos/seed/' || p.slug || '/400/400'),
  o.quantity,
  p.price
from temp_modesy_orders o
join public.orders ord on ord.order_number = o.order_number
join public.products p on p.slug = o.product_slug
left join lateral (
  select i.url from public.product_images i
  where i.product_id = p.id and i.is_primary
  limit 1
) img on true
where not exists (select 1 from public.order_items oi where oi.order_id = ord.id);

-- Urutan nomor order otomatis harus mulai setelah nomor seed, kalau tidak
-- order pertama dari aplikasi menabrak unique constraint orders_order_number_key.
select setval(
  'public.order_number_seq',
  (select coalesce(max(substring(order_number from '[0-9]+')::int), 10039) from public.orders)
);

-- Pemakaian kupon: order yang memakai kupon dicatat agar status "sudah dipakai" muncul
insert into public.coupon_redemptions (coupon_id, user_id, order_id)
select ord.coupon_id, ord.buyer_id, ord.id
from public.orders ord
join public.coupons c on c.id = ord.coupon_id
where ord.discount > 0
on conflict (coupon_id, user_id) do nothing;

update public.coupons c
set used_count = sub.n
from (select coupon_id, count(*)::int as n from public.coupon_redemptions group by coupon_id) sub
where sub.coupon_id = c.id and c.used_count <> sub.n;

-- ------------------------------------------------------------
-- 6. WALLET: saldo + riwayat transaksi (deposit/earning/payout)
-- ------------------------------------------------------------
insert into public.wallet_transactions (user_id, type, amount, status, method, description, created_at)
select u.id, v.type, v.amount, 'completed', v.method, v.description, now() - (v.days_ago || ' days')::interval
from (values
  ('vendor1', 'deposit',  1500000, 'bank_transfer', 'Top up saldo awal seller',  20),
  ('vendor1', 'earning',   850000, 'order',         'Penjualan produk',          12),
  ('vendor1', 'withdraw',  400000, 'payout',        'Pencairan dana ke rekening', 5),
  ('vendor2', 'deposit',   750000, 'bank_transfer', 'Top up saldo awal seller',  18),
  ('vendor2', 'earning',   620000, 'order',         'Penjualan template',        10),
  ('member1', 'deposit',   300000, 'bank_transfer', 'Top up untuk belanja',       9),
  ('member1', 'purchase',  250000, 'order',         'Pembayaran order #10040',     3),
  ('admin',   'deposit',  2000000, 'bank_transfer', 'Saldo operasional platform', 25)
) as v(username, type, amount, method, description, days_ago)
join public.profiles u on u.username = v.username
where not exists (
  select 1 from public.wallet_transactions w
  where w.user_id = u.id and w.description = v.description
);

-- Permintaan payout yang masih menunggu keputusan admin.
-- Disisipkan sebelum hitung saldo karena app sudah memotong saldo saat request dibuat.
insert into public.wallet_transactions (user_id, type, amount, status, method, description, created_at)
select u.id, 'withdraw', 350000, 'pending', 'payout', 'Permintaan pencairan dana', now() - interval '2 days'
from public.profiles u
where u.username = 'vendor2'
  and not exists (
    select 1 from public.wallet_transactions w
    where w.user_id = u.id and w.type = 'withdraw' and w.status = 'pending'
  );

-- Jaga saldo wallet tetap sinkron dengan riwayat transaksi.
-- Transaksi 'pending' (payout belum disetujui admin) dihitung sebagai potongan,
-- transaksi 'rejected' diabaikan karena sudah dikembalikan oleh admin_resolve_payout.
insert into public.wallets (user_id, balance, updated_at)
select user_id, sum(case when type in ('deposit','earning') then amount else -amount end), now()
from public.wallet_transactions
where status <> 'rejected'
group by user_id
on conflict (user_id) do update
set balance = excluded.balance, updated_at = now();

-- ------------------------------------------------------------
-- 7. FOLLOW, REVIEW, KOMENTAR PRODUK (isi halaman profil & review)
-- ------------------------------------------------------------
insert into public.follows (follower_id, following_id)
select f.id, t.id
from (values
  ('member1', 'vendor1'), ('member1', 'vendor2'), ('vendor2', 'vendor1'),
  ('admin', 'vendor1'), ('admin', 'member1'), ('moderator', 'vendor2')
) as v(follower_username, following_username)
join public.profiles f on f.username = v.follower_username
join public.profiles t on t.username = v.following_username
where f.id <> t.id
on conflict do nothing;

insert into public.reviews (product_id, reviewer_id, rating, comment, created_at)
select p.id, u.id, v.rating, v.comment, now() - (v.days_ago || ' days')::interval
from (values
  ('handcrafted-decorative-pillow',      'member1', 5, 'Bantalnya empuk dan jahitan rapi. Pengiriman cepat!', 3),
  ('handcrafted-decorative-pillow',      'vendor2', 4, 'Sesuai foto, cuma aroma kain agak menyengat awal.',   6),
  ('women-saddle-handbag',               'member1', 5, 'Kulitnya halus, resleting mulus. Rekomendasi.',      10),
  ('minimalist-teak-coffee-table',       'admin',   5, 'Kayu jati asli, kokoh banget.',                       4),
  ('rc-drift-car-24ghz',                 'member1', 4, 'Anak saya suka, baterai tahan lama.',                 8),
  ('nextjs-landing-page-template',       'vendor1', 5, 'Kode bersih, mudah dikustomisasi.',                   5),
  ('lofi-music-track-pack',              'vendor1', 4, 'Kualitas WAV bagus, cocok untuk podcast.',           12),
  ('sneaker-cleaning-kit',               'admin',   3, 'Sikat-nya agak keras untuk suede.',                   2),
  ('white-leather-sneakers',             'member1', 5, 'Ukuran pas, kulit asli.',                            14),
  ('ceramic-dinner-set-12pcs',           'vendor2', 5, 'Packing aman, tidak ada yang pecah.',                 9)
) as v(product_slug, reviewer_username, rating, comment, days_ago)
join public.products p on p.slug = v.product_slug
join public.profiles u on u.username = v.reviewer_username
where not exists (select 1 from public.reviews r where r.product_id = p.id and r.reviewer_id = u.id);

insert into public.product_comments (product_id, user_id, comment, created_at)
select p.id, u.id, v.comment, now() - (v.days_ago || ' hours')::interval
from (values
  ('handcrafted-decorative-pillow', 'vendor2', 'Apakah tersedia ukuran 60x60 cm, kak?', 7),
  ('minimalist-teak-coffee-table',  'member1', 'Berapa lama pengerjaan kalau pesan 3 unit?', 20),
  ('nextjs-landing-page-template',  'member1', 'Template-nya pakai App Router kan?',    11),
  ('rc-drift-car-24ghz',            'admin',   'Spare motor dijual terpisah tidak?',    30),
  ('podcast-xlr-microphone',        'member1', 'Cocok untuk interface Focusrite Scarlett?', 44)
) as v(product_slug, user_username, comment, days_ago)
join public.products p on p.slug = v.product_slug
join public.profiles u on u.username = v.user_username
where not exists (select 1 from public.product_comments c where c.product_id = p.id and c.user_id = u.id);

-- ------------------------------------------------------------
-- 8. CHAT: percakapan + pesan (latihan realtime)
-- ------------------------------------------------------------
insert into public.conversations (buyer_id, seller_id, product_id)
select b.id, s.id, p.id
from (values
  ('member1', 'vendor1', 'handcrafted-decorative-pillow'),
  ('member1', 'vendor2', 'nextjs-landing-page-template'),
  ('vendor1', 'vendor2', 'lofi-music-track-pack')
) as v(buyer_username, seller_username, product_slug)
join public.profiles b on b.username = v.buyer_username
join public.profiles s on s.username = v.seller_username
join public.products p on p.slug = v.product_slug
on conflict (buyer_id, seller_id, product_id) do nothing;

insert into public.messages (conversation_id, sender_id, content, created_at)
select c.id, sender.id, v.content, now() - (v.min_ago || ' minutes')::interval
from (values
  ('member1', 'vendor1', 'handcrafted-decorative-pillow', 'member1', 'Halo, bantalnya ada motif lain?',          240),
  ('member1', 'vendor1', 'handcrafted-decorative-pillow', 'vendor1', 'Ada kak, motif garis dan polos.',          200),
  ('member1', 'vendor1', 'handcrafted-decorative-pillow', 'member1', 'Oke saya ambil 2 yang polos ya.',          150),
  ('member1', 'vendor2', 'nextjs-landing-page-template',  'member1', 'Bisa minta screenshot dashboard-nya?',     90),
  ('member1', 'vendor2', 'nextjs-landing-page-template',  'vendor2', 'Kirim ke email kakak ya.',                 60),
  ('vendor1', 'vendor2', 'lofi-music-track-pack',         'vendor1', 'Lisensi trek-nya bisa untuk klien komersial?', 130),
  ('vendor1', 'vendor2', 'lofi-music-track-pack',         'vendor2', 'Bisa, sudah termasuk lisensi komersial.',    100)
) as v(buyer_username, seller_username, product_slug, sender_username, content, min_ago)
join public.conversations c
  on c.buyer_id = (select id from public.profiles where username = v.buyer_username)
 and c.seller_id = (select id from public.profiles where username = v.seller_username)
 and c.product_id = (select id from public.products where slug = v.product_slug)
join public.profiles sender on sender.username = v.sender_username
where not exists (select 1 from public.messages msg where msg.conversation_id = c.id);

-- ------------------------------------------------------------
-- 9. KARTU: keranjang member1 (latihan checkout)
-- ------------------------------------------------------------
insert into public.carts (user_id)
select id from public.profiles where username = 'member1'
on conflict do nothing;

insert into public.cart_items (cart_id, product_id, quantity)
select cart.id, p.id, 1
from public.carts cart
join public.profiles u on u.id = cart.user_id and u.username = 'member1'
join public.products p on p.slug in ('white-leather-sneakers', 'canvas-tote-bag-eco')
where not exists (select 1 from public.cart_items ci where ci.cart_id = cart.id);

-- ------------------------------------------------------------
-- 10. RINGKASAN SEED
-- ------------------------------------------------------------
select
  (select count(*) from auth.users)                                      as auth_users,
  (select count(*) from public.profiles)                                 as profiles,
  (select count(*) from public.categories)                               as categories,
  (select count(*) from public.products)                                 as products,
  (select count(*) from public.product_images)                           as product_images,
  (select count(*) from public.orders)                                   as orders,
  (select count(*) from public.order_items)                              as order_items,
  (select count(*) from public.coupons)                                  as coupons,
  (select count(*) from public.wallet_transactions)                      as wallet_tx,
  (select count(*) from public.follows)                                  as follows,
  (select count(*) from public.reviews)                                  as reviews,
  (select count(*) from public.product_comments)                         as product_comments,
  (select count(*) from public.conversations)                            as conversations,
  (select count(*) from public.messages)                                 as messages;

-- ------------------------------------------------------------
-- 11. TAHAP 9: banner, brand, alamat, quote, refund, produk digital
-- ------------------------------------------------------------

insert into public.banners (title, subtitle, tag, button_text, button_link, image_url, sort_order)
select * from (values
  ('Buy Nice and Unique Clothes',
   'Discover quality premium basics and trendy essentials at surprisingly affordable prices',
   'Modesy Featured', 'Explore Now', '/products',
   'https://picsum.photos/seed/banner1/1600/600', 1),
  ('Find Backpacks That Best Suit You',
   'Timeless, modern, and versatile pieces made with quality materials and craftsmanship',
   'Trending Collection', 'Buy Now', '/products?category=clothing',
   'https://picsum.photos/seed/banner2/1600/600', 2),
  ('Handcrafted Decor & Modern Living',
   'Elevate your daily living space with authentic designs from talented artisan creators',
   'New Arrivals', 'Discover More', '/products?category=home-living',
   'https://picsum.photos/seed/banner3/1600/600', 3)
) t(title, subtitle, tag, button_text, button_link, image_url, sort_order)
where not exists (select 1 from public.banners);

insert into public.brands (name)
select * from (values
  ('Adidas'),('Armani'),('Burberry'),('Diesel'),('Dockers'),('Gucci'),('H & M'),
  ('Hugo Boss'),('Lacoste'),('Lee Cooper'),('Levi''s'),('Nike'),('Puma'),('Zara')
) t(name)
on conflict (name) do nothing;

-- Brand untuk produk fashion; produk lain tetap tanpa brand.
update public.products p set brand = t.brand
from (values
  ('canvas-tote-bag-eco', 'H & M'),
  ('women-saddle-handbag', 'Zara'),
  ('vintage-leather-jacket', 'Diesel'),
  ('lightweight-running-shoes', 'Nike'),
  ('white-leather-sneakers', 'Adidas'),
  ('sneaker-cleaning-kit', 'Puma'),
  ('monstera-plant-with-pot', 'Gucci')
) t(slug, brand)
where p.slug = t.slug and p.brand is null;

-- Produk digital: bisa diunduh dari halaman Downloads
update public.products
   set is_digital = true,
       file_url = 'https://picsum.photos/seed/' || slug || '-file/1200/800'
 where slug in ('preset-lightroom-moody-pack', 'stock-photo-jakarta-skyline',
                'lofi-music-track-pack', 'nextjs-landing-page-template',
                'bootstrap-admin-dashboard');

insert into public.addresses (user_id, label, address, is_default)
select u.id, t.label, t.address, t.is_default
from (values
  ('member1', 'Home', 'Jl. Kaliurang KM 9 No. 12, Sleman, DIY 55581', true),
  ('member1', 'Office', 'Gedung Modesy Lt. 3, Jl. Sudirman Kav. 1, Jakarta', false)
) t(username, label, address, is_default)
join public.profiles u on u.username = t.username
where not exists (select 1 from public.addresses a where a.user_id = u.id and a.label = t.label);

insert into public.quote_requests (buyer_id, seller_id, product_id, quantity, bid, message, status, created_at)
select b.id, s.id, p.id, t.quantity, t.bid, t.message, t.status,
       now() - (t.days_ago || ' days')::interval
from (values
  ('member1', 'preset-lightroom-moody-pack',  8, null,  'new',       5, 'Butuh 8 lisensi untuk tim, ada harga grosir?'),
  ('member1', 'wooden-building-blocks-100pcs', 1, null,  'new',      10, 'Bisa request warna natural tanpa cat?'),
  ('member1', 'lofi-music-track-pack',         1, 60000, 'pending',  24, 'Penawaran saya Rp 60.000, bagaimana?'),
  ('member1', 'nextjs-landing-page-template',  1, 70000, 'pending',  30, 'Minta harga Rp 70.000 termasuk dukungan 1 bulan')
) t(buyer_username, product_slug, quantity, bid, status, days_ago, message)
join public.profiles b on b.username = t.buyer_username
join public.products p on p.slug = t.product_slug
join public.profiles s on s.id = p.seller_id
where not exists (
  select 1 from public.quote_requests q
  where q.buyer_id = b.id and q.product_id = p.id and q.message = t.message
);

-- Satu order digital untuk member1 agar halaman Downloads berisi
insert into public.orders (
  order_number, buyer_id, seller_id, status, payment_method, payment_status,
  shipping_address, subtotal, shipping_cost, discount, total, created_at
)
select '#10051', b.id, p.seller_id, 'completed', 'wallet', 'paid',
       'Digital delivery', p.price, 0, 0, p.price, now() - interval '2 days'
from public.profiles b
join public.products p on p.slug = 'preset-lightroom-moody-pack'
where b.username = 'member1'
  and not exists (select 1 from public.orders o where o.order_number = '#10051');

insert into public.order_items (order_id, product_id, seller_id, title, image, quantity, unit_price)
select o.id, p.id, p.seller_id, p.title,
       coalesce((select i.url from public.product_images i where i.product_id = p.id and i.is_primary limit 1),
                'https://picsum.photos/seed/' || p.slug || '/400/400'),
       1, p.price
from public.orders o
join public.profiles b on b.id = o.buyer_id and b.username = 'member1'
join public.products p on p.slug = 'preset-lightroom-moody-pack'
where o.order_number = '#10051'
  and not exists (select 1 from public.order_items oi where oi.order_id = o.id);

insert into public.refund_requests (order_id, buyer_id, seller_id, reason, status, created_at)
select o.id, o.buyer_id, o.seller_id, t.reason, t.status, now() - (t.days_ago || ' days')::interval
from (values
  ('#10046', 'Piring keramik nomor 4 pecah saat tiba', 'processing', 30),
  ('#10049', 'Barang tidak dikirim melewati estimasi', 'requested',   2)
) t(order_number, reason, status, days_ago)
join public.orders o on o.order_number = t.order_number
where not exists (select 1 from public.refund_requests r where r.order_id = o.id);

-- Nomor sequence harus tetap di belakang nomor order terbaru
select setval(
  'public.order_number_seq',
  (select coalesce(max(substring(order_number from '[0-9]+')::int), 10039) from public.orders)
);

-- ==========================================
-- 12. TAHAP 10 — Data pendukung halaman admin
-- ==========================================

-- 12a. Tags + penugasan tag ke produk (count dihitung dari product_tags)
insert into public.tags (name, slug) values
  ('Summer Collection', 'summer-collection'),
  ('Casual Wear', 'casual-wear'),
  ('Handmade Craft', 'handmade-craft'),
  ('Vintage Look', 'vintage-look'),
  ('Eco Friendly', 'eco-friendly'),
  ('Streetwear', 'streetwear'),
  ('Minimalist Decor', 'minimalist-decor'),
  ('Premium Leather', 'premium-leather'),
  ('Digital Art', 'digital-art'),
  ('Smart Gadget', 'smart-gadget')
on conflict (slug) do nothing;

insert into public.product_tags (product_id, tag_id)
select p.id, x.tag_id
from public.products p
cross join lateral (
  select t.id as tag_id
  from public.tags t
  order by abs(hashtext(p.id::text || t.id::text))
  limit 2
) x
on conflict do nothing;

-- 12b. Brands: slug + status aktif
update public.brands
set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null;

-- 12c. Themes
insert into public.themes (name, description, preview_url, is_active, version) values
  ('Default Classic', 'Clean modern layout with multi-vendor storefront focus', 'https://picsum.photos/seed/theme1/400/250', true, '1.4.0'),
  ('Minimal Marketplace', 'Ultra-lightweight sleek layout with bold typography', 'https://picsum.photos/seed/theme2/400/250', false, '1.2.1'),
  ('Modern Boutique', 'Vibrant boutique layout tailored for fashion and lifestyle', 'https://picsum.photos/seed/theme3/400/250', false, '2.0.0'),
  ('Digital Marketplace', 'Optimized for digital assets, downloads, and licenses', 'https://picsum.photos/seed/theme4/400/250', false, '1.1.0')
on conflict do nothing;

-- 12d. Pages
insert into public.pages (title, slug, location, status, created_at) values
  ('About Modesy', 'about-us', 'Footer & Header', 'active', '2026-08-01 09:00'),
  ('Terms & Conditions', 'terms-conditions', 'Footer', 'active', '2026-08-01 09:00'),
  ('Privacy Policy', 'privacy-policy', 'Footer', 'active', '2026-08-01 09:00'),
  ('Help & FAQ Center', 'help-faq', 'Top Bar & Footer', 'active', '2026-08-05 09:00'),
  ('Contact Us', 'contact', 'Top Bar & Footer', 'active', '2026-08-05 09:00'),
  ('Seller Community Guidelines', 'seller-guidelines', 'Footer', 'active', '2026-08-10 09:00')
on conflict (slug) do nothing;

-- 12e. Custom fields
insert into public.custom_fields (name, field_type, category, required) values
  ('Shoe Size', 'Select Box', 'Shoes', true),
  ('Clothing Fabric', 'Select Box', 'Clothing', false),
  ('Color Pattern', 'Text Input', 'Fashion', true),
  ('Warranty Period', 'Select Box', 'Electronics', true),
  ('Digital File Format', 'Checkbox', 'Graphics & Photos', true),
  ('Product Dimensions', 'Text Input', 'Home & Living', false)
on conflict do nothing;

-- 12f. Ad spaces
insert into public.ad_spaces (name, location, size, impressions, clicks, active) values
  ('Header Top Banner (728x90)', 'Header', '728x90', 45200, 1240, true),
  ('Sidebar Widget Banner (300x250)', 'Sidebar', '300x250', 28400, 820, true),
  ('Products Grid Intermediate (970x90)', 'Product Feed', '970x90', 38100, 950, true),
  ('Footer Leaderboard (728x90)', 'Footer', '728x90', 19800, 310, true),
  ('Product Details Sticky Right (300x600)', 'Product Details', '300x600', 16500, 530, true),
  ('Blog Sidebar Banner (300x250)', 'Blog Sidebar', '300x250', 12100, 280, false)
on conflict do nothing;

-- 12g. Abuse reports
insert into public.abuse_reports (reporter_name, reported_item, reason, status, created_at) values
  ('Budi Santoso', 'Product #47 (Copyright violation)', 'Menggunakan foto katalog resmi tanpa izin', 'pending', '2026-10-08 10:00'),
  ('Zus Kara', 'Seller Fashion Store ID', 'Spam pesan promosi di room diskusi pembeli', 'resolved', '2026-10-06 10:00'),
  ('Mamat Ian', 'Review #7 by Test User', 'Kata-kata kasar dan tidak pantas di review produk', 'resolved', '2026-10-04 10:00'),
  ('Caleb Prosper', 'Product #39 (Misleading info)', 'File template yang diunduh rusak dan tidak lengkap', 'pending', '2026-09-30 10:00'),
  ('Atukunda Didan', 'User Spammer99', 'Akun bot mengirimkan link phising melalui form komentar', 'banned', '2026-09-27 10:00')
on conflict do nothing;

-- 12h. Email blacklist
insert into public.email_blacklist (email, reason, created_at) values
  ('spammer_bot@fakebox.net', 'Mass marketing bot and malicious payloads', '2026-10-05 08:00'),
  ('phishing_link@tempmail.io', 'Automated phishing attempts in chat message', '2026-10-02 08:00'),
  ('promo_blast@scamhub.org', 'Unsolicited spam reviews blast on multiple listings', '2026-09-29 08:00'),
  ('fake_buyer@throwaway.cc', 'Fake credit card testing chargebacks', '2026-09-21 08:00'),
  ('crypto_giveaway@tmail.org', 'Spam comment link distributor', '2026-09-14 08:00')
on conflict (email) do nothing;

-- 12i. Newsletter
insert into public.newsletter_subscribers (email, status, created_at) values
  ('alex@example.com', 'subscribed', '2026-10-09 08:00'),
  ('nadia.fashion@gmail.com', 'subscribed', '2026-10-08 08:00'),
  ('buyer.budi@santoso.id', 'subscribed', '2026-10-07 08:00'),
  ('customer12@yahoo.com', 'subscribed', '2026-10-05 08:00'),
  ('sarah.craft@outlook.com', 'subscribed', '2026-10-03 08:00'),
  ('info@studiomerchant.com', 'unsubscribed', '2026-09-28 08:00'),
  ('johndoe_id@gmail.com', 'subscribed', '2026-09-24 08:00'),
  ('citra.olshop@gmail.com', 'subscribed', '2026-09-18 08:00')
on conflict (email) do nothing;

-- 12j. Contact messages
insert into public.contact_messages (name, email, subject, message, created_at) values
  ('Andi Pratama', 'andi@example.com', 'Pertanyaan Pembayaran Midtrans', 'Halo admin, apakah pembayaran QRIS mendukung auto-settlement?', '2026-10-09 15:30'),
  ('Siti Rahma', 'siti@example.com', 'Kendala Verifikasi Toko Vendor', 'Saya sudah unggah dokumen toko 2 hari lalu namun belum diverifikasi.', '2026-10-08 11:20'),
  ('David Miller', 'david@global.com', 'International Shipping Inquiry', 'Do you offer direct DHL integration for overseas shipments?', '2026-10-07 09:45'),
  ('Dewi Lestari', 'dewi@example.com', 'Kerjasama Media Partner', 'Kami ingin menawarkan promosi kolaborasi untuk event Ramadhan.', '2026-10-06 14:10'),
  ('Bambang Sudiro', 'bambang@example.com', 'Laporan Bug di Halaman Cart', 'Tombol checkout sempat reload berulang kali pada mobile browser Safari.', '2026-10-05 18:00'),
  ('Linda Wijaya', 'linda@example.com', 'Pendaftaran Kurir Ekspedisi', 'Bagaimana prosedur mendaftarkan armada logistik lokal ke platform?', '2026-10-04 10:25')
on conflict do nothing;

-- 12k. Blog categories + posts + comments
insert into public.blog_categories (name, slug) values
  ('Fashion & Style', 'fashion-style'),
  ('Footwear Guide', 'footwear-guide'),
  ('Fabric Care', 'fabric-care'),
  ('Home Living', 'home-living'),
  ('Seller Guide', 'seller-guide'),
  ('Digital Assets', 'digital-assets'),
  ('Eco Lifestyle', 'eco-lifestyle')
on conflict (slug) do nothing;

insert into public.blog_posts (title, slug, author_name, category_id, image_url, views, status, created_at)
select p.title, p.slug, p.author, c.id, p.image_url, p.views, p.status, p.created_at
from (values
  ('Top 10 Fashion Trends in 2026', 'top-10-fashion-trends-2026', 'Modesy Editorial', 'fashion-style', 'https://picsum.photos/seed/blog1/300/180', 1420, 'published', '2026-10-01 08:00'::timestamptz),
  ('Tips Memilih Sepatu Boot Nyaman untuk Cuaca Tropis', 'tips-sepatu-boot-nyaman', 'Fashion Store ID', 'footwear-guide', 'https://picsum.photos/seed/blog2/300/180', 890, 'published', '2026-09-28 08:00'),
  ('Cara Merawat Pakaian Katun dan Rayon Agar Awet', 'merawat-pakaian-katun-rayon', 'Trendshop', 'fabric-care', 'https://picsum.photos/seed/blog3/300/180', 650, 'published', '2026-09-22 08:00'),
  ('Inspirasi Menata Ruang Tamu Modern Minimalis', 'ruang-tamu-minimalis', 'Artisan Woodcraft', 'home-living', 'https://picsum.photos/seed/blog4/300/180', 1120, 'published', '2026-09-18 08:00'),
  ('Panduan Memulai Toko Online Multi-Vendor di Modesy', 'panduan-toko-online-multivendor', 'Super Admin', 'seller-guide', 'https://picsum.photos/seed/blog5/300/180', 2340, 'published', '2026-09-10 08:00'),
  ('Peluang Bisnis Produk Kreatif Digital dan Lisensi', 'peluang-produk-digital', 'Studio Digital Pro', 'digital-assets', 'https://picsum.photos/seed/blog6/300/180', 780, 'published', '2026-09-04 08:00'),
  ('Koleksi Aksesoris Handmade Paling Diburu Tahun Ini', 'koleksi-aksesoris-handmade', 'Trendshop', 'fashion-style', 'https://picsum.photos/seed/blog7/300/180', 0, 'draft', '2026-10-08 08:00'),
  ('5 Tips Fotografi Produk Menggunakan Smartphone', 'tips-fotografi-produk', 'Modesy Editorial', 'seller-guide', 'https://picsum.photos/seed/blog8/300/180', 1890, 'published', '2026-08-29 08:00'),
  ('Mengenal Ragam Bahan Kulit Vegan Ramah Lingkungan', 'bahan-kulit-vegan', 'Fashion Store ID', 'eco-lifestyle', 'https://picsum.photos/seed/blog9/300/180', 540, 'published', '2026-08-20 08:00'),
  ('Strategi Diskon dan Promosi Akhir Tahun untuk Seller', 'strategi-diskon-akhir-tahun', 'Super Admin', 'seller-guide', 'https://picsum.photos/seed/blog10/300/180', 980, 'published', '2026-08-15 08:00')
) as p(title, slug, author, cat_slug, image_url, views, status, created_at)
join public.blog_categories c on c.slug = p.cat_slug
on conflict (slug) do nothing;

insert into public.blog_comments (post_id, commenter_name, comment, status, created_at)
select p.id, x.commenter, x.comment, x.status, x.created_at
from (values
  ('top-10-fashion-trends-2026', 'Mamat Ian', 'Artikel sangat berbobot dan membuka inspirasi gaya santai.', 'approved', '2026-10-07 19:40'::timestamptz),
  ('tips-sepatu-boot-nyaman', 'Atukunda Didan', 'Sangat setuju bagian pemilihan sol tebal untuk jalan jauh.', 'approved', '2026-10-06 16:50'),
  ('merawat-pakaian-katun-rayon', 'Rina Moderator', 'Kiat menyetrika suhu rendah berguna sekali!', 'approved', '2026-10-04 20:05'),
  ('ruang-tamu-minimalis', 'Zus Kara', 'Kombinasi sofa abu dan bantal motif memang paling pas.', 'approved', '2026-10-02 15:45'),
  ('panduan-toko-online-multivendor', 'Test User', 'Apakah bisa multi-gudang untuk pengiriman terpisah?', 'pending', '2026-10-01 09:10')
) as x(post_slug, commenter, comment, status, created_at)
join public.blog_posts p on p.slug = x.post_slug
on conflict do nothing;

-- 12l. Membership plans + pembayaran
insert into public.membership_plans (name, price, duration, features, member_count) values
  ('Free Starter', 0, 'Unlimited', 'Upload up to 5 products, basic shop profile, standard support', 420),
  ('Silver Seller', 150000, '1 Month', 'Upload up to 50 products, featured badge, standard analytics', 86),
  ('Gold Vendor', 350000, '3 Months', 'Upload up to 250 products, priority placement, low commission', 48),
  ('Platinum Store', 950000, '12 Months', 'Unlimited products, zero marketplace fees, 24/7 dedicated support', 22)
on conflict do nothing;

insert into public.membership_payments (payment_id, method, amount, status, user_name, plan, ip, created_at) values
  ('PAY-892110', 'Stripe', 450000, 'completed', 'Budi Santoso', 'Gold Vendor', '192.168.1.10', '2026-10-09 14:22'),
  ('PAY-892109', 'PayPal', 250000, 'completed', 'Zus Kara', 'Basic Seller', '10.0.0.15', '2026-10-08 19:10'),
  ('PAY-892108', 'Bank Transfer', 750000, 'pending', 'Mamat Ian', 'Platinum Store', '172.16.0.4', '2026-10-08 11:05'),
  ('PAY-892107', 'Wallet Balance', 150000, 'completed', 'Caleb Prosper', 'Silver Plan', '192.168.1.44', '2026-10-07 09:30'),
  ('PAY-892106', 'Midtrans', 320000, 'completed', 'Atukunda Didan', 'Gold Vendor', '192.168.1.20', '2026-10-06 21:14'),
  ('PAY-892105', 'Stripe', 500000, 'completed', 'Test User', 'Platinum Store', '10.0.0.8', '2026-10-05 16:45'),
  ('PAY-892104', 'Bank Transfer', 180000, 'pending', 'Budi Santoso', 'Basic Seller', '192.168.1.10', '2026-10-04 12:18'),
  ('PAY-892103', 'PayStack', 620000, 'completed', 'Zus Kara', 'Platinum Store', '10.0.0.15', '2026-10-03 08:50'),
  ('PAY-892102', 'Wallet Balance', 95000, 'completed', 'Mamat Ian', 'Silver Plan', '172.16.0.4', '2026-10-02 18:22'),
  ('PAY-892101', 'PayPal', 300000, 'refunded', 'Caleb Prosper', 'Gold Vendor', '192.168.1.44', '2026-10-01 10:12')
on conflict do nothing;

insert into public.promotion_payments (payment_id, method, amount, status, user_name, promotion, created_at) values
  ('PRM-501', 'Stripe', 75000, 'completed', 'Fashion Store ID', '7 Days Featured Badge', '2026-10-09 12:00'),
  ('PRM-502', 'Wallet Balance', 120000, 'completed', 'Toko Elektronik Jaya', '14 Days Homepage Carousel', '2026-10-08 15:30'),
  ('PRM-503', 'PayPal', 50000, 'completed', 'Trendshop', '5 Days Category Spotlight', '2026-10-07 11:20'),
  ('PRM-504', 'Midtrans', 200000, 'completed', 'Studio Digital Pro', '30 Days Top Search Ranking', '2026-10-06 09:45'),
  ('PRM-505', 'Wallet Balance', 75000, 'completed', 'Fashion Store ID', '7 Days Featured Badge', '2026-10-04 16:15'),
  ('PRM-506', 'Stripe', 120000, 'completed', 'Trendshop', '14 Days Homepage Carousel', '2026-10-02 14:00')
on conflict do nothing;

-- 12m. Shop requests, login activities, deletion requests
insert into public.shop_requests (requester_name, shop_name, categories, status, created_at) values
  ('Budi Santoso', 'Budi Handicraft Studio', 'Home & Living, Decor', 'pending', '2026-10-09 09:00'),
  ('Zus Kara', 'Kara Shoes Collection', 'Shoes, Footwear', 'pending', '2026-10-08 09:00'),
  ('Caleb Prosper', 'Prosper Digital Templates', 'Web Templates, Code', 'approved', '2026-10-04 09:00'),
  ('Atukunda Didan', 'Didan Fashion Casual', 'Clothing', 'approved', '2026-10-01 09:00'),
  ('Mamat Ian', 'Mamat Spareparts', 'Automotive', 'rejected', '2026-09-26 09:00')
on conflict do nothing;

insert into public.login_activities (user_name, ip, device, location, created_at) values
  ('Super Admin', '127.0.0.1', 'Chrome on Windows 11', 'Jakarta, Indonesia', '2026-10-10 21:05'),
  ('Rina Moderator', '192.168.1.18', 'Firefox on macOS', 'Surabaya, Indonesia', '2026-10-10 18:30'),
  ('Toko Elektronik Jaya', '114.122.45.10', 'Edge on Windows 10', 'Bandung, Indonesia', '2026-10-10 14:12'),
  ('Budi Santoso', '180.252.19.88', 'Safari on iPhone 15', 'Jakarta, Indonesia', '2026-10-10 09:40'),
  ('Fashion Store ID', '103.28.12.90', 'Chrome on Windows 11', 'Semarang, Indonesia', '2026-10-09 20:15'),
  ('Zus Kara', '110.137.8.4', 'Chrome on Android', 'Denpasar, Indonesia', '2026-10-09 16:55'),
  ('Super Admin', '127.0.0.1', 'Chrome on Windows 11', 'Jakarta, Indonesia', '2026-10-09 08:00'),
  ('Mamat Ian', '36.85.22.140', 'Firefox on Windows 10', 'Medan, Indonesia', '2026-10-08 19:20')
on conflict do nothing;

insert into public.deletion_requests (user_name, reason, status, created_at) values
  ('AkunTesLama', 'Sudah tidak menggunakan platform dan ingin menghapus data pribadi', 'pending', '2026-10-08 09:00'),
  ('UserInaktif2025', 'Pindah ke platform lain dan ingin menutup akun', 'pending', '2026-10-07 09:00'),
  ('BudiBuyerDuplicate', 'Terbuat akun ganda secara tidak sengaja', 'approved', '2026-09-28 09:00'),
  ('TestSpamAcc', 'Pelanggaran keamanan terdeteksi', 'approved', '2026-09-15 09:00')
on conflict do nothing;

-- 12n. Affiliates
insert into public.affiliates (affiliate_name, referrals, earnings, conversion_rate, status) values
  ('Dimas Kreatif ID', 45, 1350000, 12.4, 'active'),
  ('Fashion Influencer ID', 88, 2640000, 15.8, 'active'),
  ('Tech Gadget Reviewer', 24, 720000, 8.1, 'active'),
  ('Bunda Cerdas Belanja', 62, 1860000, 14.2, 'active'),
  ('Lifestyle Daily Blog', 19, 570000, 6.5, 'pending'),
  ('Student Discount Club', 38, 1140000, 9.8, 'active')
on conflict do nothing;

-- 12o. Lokasi: countries -> states -> cities
insert into public.countries (name, code, flag) values
  ('Indonesia', 'ID', '🇮🇩'),
  ('Malaysia', 'MY', '🇲🇾'),
  ('Singapore', 'SG', '🇸🇬'),
  ('Thailand', 'TH', '🇹🇭'),
  ('Philippines', 'PH', '🇵🇭'),
  ('Vietnam', 'VN', '🇻🇳'),
  ('United States', 'US', '🇺🇸'),
  ('United Kingdom', 'GB', '🇬🇧'),
  ('Australia', 'AU', '🇦🇺'),
  ('Japan', 'JP', '🇯🇵')
on conflict (code) do nothing;

insert into public.states (name, country_id)
select s.name, c.id
from (values
  ('DKI Jakarta', 'ID'), ('Jawa Barat', 'ID'), ('Jawa Timur', 'ID'),
  ('Jawa Tengah', 'ID'), ('Bali', 'ID'), ('Selangor', 'MY'),
  ('California', 'US'), ('Tokyo Metropolis', 'JP')
) as s(name, code)
join public.countries c on c.code = s.code
on conflict do nothing;

insert into public.cities (name, state_id)
select x.name, st.id
from (values
  ('Jakarta Selatan', 'DKI Jakarta'), ('Jakarta Pusat', 'DKI Jakarta'),
  ('Bandung', 'Jawa Barat'), ('Surabaya', 'Jawa Timur'),
  ('Semarang', 'Jawa Tengah'), ('Denpasar', 'Bali'),
  ('Kuala Lumpur', 'Selangor'), ('Los Angeles', 'California')
) as x(name, state_name)
join public.states st on st.name = x.state_name
on conflict do nothing;

-- 12p. Help center
insert into public.support_tickets (user_name, subject, priority, status, created_at) values
  ('Toko Elektronik Jaya', 'Integrasi kurir J&T gagal saat generate waybill', 'high', 'open', '2026-10-10 09:00'),
  ('Budi Santoso', 'Saldo dompet belum bertambah setelah top-up VA BCA', 'urgent', 'in_progress', '2026-10-09 09:00'),
  ('Fashion Store ID', 'Pertanyaan perhitungan komisi promosi diskon', 'medium', 'resolved', '2026-10-08 09:00'),
  ('Zus Kara', 'Kendala download invoice resmi pembayaran', 'low', 'closed', '2026-10-06 09:00'),
  ('Mamat Ian', 'Laporan notifikasi chat lambat diterima pada mobile', 'medium', 'resolved', '2026-10-04 09:00'),
  ('Atukunda Didan', 'Konfirmasi pergantian rekening bank terdaftar', 'high', 'resolved', '2026-10-01 09:00')
on conflict do nothing;

insert into public.knowledge_base_articles (title, category, views) values
  ('Panduan Lengkap Pendaftaran Vendor dan Buka Toko', 'Vendor Onboarding', 3240),
  ('Cara Menghubungkan Gateway Pembayaran Midtrans & Stripe', 'Payment Setup', 2150),
  ('Kebijakan Pengembalian Dana (Refund) dan Resolusi Sengketa', 'Buyer Protection', 1890),
  ('Mengatur Biaya Pengiriman dan Ekspedisi Logistik', 'Shipping & Delivery', 1460),
  ('Panduan Lisensi Produk Digital dan Format File Unduhan', 'Digital Products', 980),
  ('Cara Mengajukan Penarikan Saldo (Payout) Mingguan', 'Seller Payout', 1720),
  ('Tips Menulis Judul dan Deskripsi SEO-Friendly untuk Produk', 'Marketing', 1110),
  ('Pengaturan Keamanan Akun dan Verifikasi Dua Langkah', 'Account Security', 840)
on conflict do nothing;

-- 12q. Pengaturan payout default
insert into public.app_settings (key, value) values
  ('payout', '{"minPayoutBank": 100000, "minPayoutPaypal": 150000, "processingDays": 3, "payoutFeePercentage": 0, "autoPayoutEnabled": false}'::jsonb)
on conflict (key) do nothing;
