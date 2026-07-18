# MyShop — Next.js + Supabase E-commerce

ร้านค้าออนไลน์ครบวงจร ธีมมินิมอล แดง/ขาว รองรับการชำระเงินด้วย **PromptPay QR** และ **เก็บเงินปลายทาง (COD)**

## Tech Stack

- **Next.js 16** (App Router, Turbopack, Server Components/Actions)
  - หมายเหตุ: Next 16 เปลี่ยน `middleware.ts` → **`proxy.ts`**, และ `cookies()` เป็น **async**
- **Supabase** (PostgreSQL, Auth, Storage, RLS)
- **Tailwind CSS v4** (คอนฟิกผ่าน `@theme` ใน `globals.css`)
- **TypeScript**, **Zod**, **Zustand**, **lucide-react**, **qrcode.react**

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev        # http://localhost:3000
```

แอปรันได้ทันทีด้วย **mock data** (`src/lib/mock-data.ts`) — ตะกร้าสินค้าและ checkout ทำงานผ่าน Zustand (`src/hooks/use-cart.ts`) รวมถึงสร้าง PromptPay QR ได้จริง โดยยังไม่ต้องต่อฐานข้อมูล

## เชื่อมต่อ Supabase

1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com)
2. รัน SQL ใน **SQL Editor** ตามลำดับ:
   - `supabase/migrations/001_initial_schema.sql` (ตาราง + RLS + triggers)
   - `supabase/seed.sql` (ข้อมูลตัวอย่าง)
3. คัดลอกค่าจาก **Project Settings → API** มาใส่ใน `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PROMPTPAY_MERCHANT_ID=0812345678     # เบอร์พร้อมเพย์ หรือเลขบัตร ปชช. 13 หลัก
PROMPTPAY_MERCHANT_NAME=MyShop
```

4. ตั้งผู้ใช้เป็นแอดมิน: `update profiles set is_admin = true where id = '<user-id>';`

### สลับจาก mock → ฐานข้อมูลจริง

หน้า storefront ใช้ `src/lib/mock-data.ts` อยู่ ให้เปลี่ยนไปเรียก Server Actions ที่เตรียมไว้แล้ว:
- `src/app/actions/products.ts` — `getProducts`, `getProductBySlug`, `getCategories`, `getFeaturedProducts`
- `src/app/actions/cart.ts` — ตะกร้าฝั่งเซิร์ฟเวอร์ (รองรับ guest ผ่าน cookie session)
- `src/app/actions/checkout.ts` — `createOrder` (สร้าง PromptPay payload + ตัดสต็อก)
- `src/app/actions/auth.ts` — สมัคร/เข้าสู่ระบบ/OAuth/รีเซ็ตรหัสผ่าน

## โครงสร้างหลัก

```
src/
├── app/
│   ├── (shop)/          # หน้าร้าน: home, products, [slug], cart, checkout, categories
│   ├── (auth)/          # login, register
│   ├── api/auth/callback/  # OAuth callback
│   └── actions/         # Server Actions
├── components/
│   ├── ui/              # button, input, card, badge, modal, toast, dropdown, loading
│   ├── layout/          # header, footer, mobile-menu
│   └── shop/            # product-card/grid/detail, cart-drawer, promptpay-qr, hero
├── hooks/               # use-cart (zustand), use-toast
├── lib/
│   ├── supabase/        # client, server, middleware, admin
│   ├── promptpay.ts     # สร้าง EMVCo QR payload + CRC16
│   ├── currency.ts      # ฟอร์แมตเงินบาท
│   └── validations.ts   # Zod schemas
└── proxy.ts             # (เดิมคือ middleware) refresh session + ป้องกัน route
```

## PromptPay

`src/lib/promptpay.ts` สร้าง payload มาตรฐาน EMVCo ของธนาคารแห่งประเทศไทย พร้อม CRC16-CCITT
แล้วเรนเดอร์เป็น QR ด้วย `qrcode.react` ในคอมโพเนนต์ `PromptPayQR` — สแกนจ่ายได้จากแอปธนาคารไทย

## Deploy

- **Vercel**: เชื่อม repo, ใส่ env ทั้งหมด, deploy
- ตั้ง **Redirect URL** ของ Supabase Auth เป็น `https://your-domain.com/api/auth/callback`
- ตั้ง `NEXT_PUBLIC_SITE_URL` เป็นโดเมนจริง

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm start        # run production build
npm run lint     # eslint
```
