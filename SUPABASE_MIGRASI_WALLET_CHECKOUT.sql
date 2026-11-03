-- MIGRASI BUG 1 — pembayaran wallet memotong saldo
-- Jalankan SELURUH file ini di Supabase Dashboard → SQL Editor (project qajtworgcolbevxzewld).
-- Aman diulang: hanya CREATE OR REPLACE FUNCTION, tidak menyentuh tabel, data, RLS, maupun policy.
--
-- Isi: public.place_order() versi wallet-aware.
--   1. payment_method = 'wallet' → baris wallets pembeli dikunci FOR UPDATE di awal transaksi.
--   2. Tagihan dihitung dari harga di DB (subtotal + ongkos per penjual - diskon kupon).
--   3. Saldo kurang → RAISE EXCEPTION, seluruh transaksi rollback (tidak ada order, stok utuh).
--   4. Saldo cukup → order dibuat dengan payment_status 'paid', saldo dipotong, dan
--      wallet_transactions diisi satu baris per order: type='purchase', status='completed',
--      description='Pembayaran order #xxxx'.
--
-- Catatan: draf awal memakai type='spend'. CHECK constraint wallet_transactions hanya
-- mengizinkan ('deposit','withdraw','purchase','earning','payout'), dan WalletClient
-- menghitung pengeluaran dari type='purchase' — jadi dipakai 'purchase'.

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

-- Verifikasi cepat (read-only): fungsi sudah terpasang + parameter wallet dikenali.
select p.proname, pg_get_function_arguments(p.oid) as args
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname = 'place_order';
