# Expense Tracker Dashboard

Frontend dashboard untuk aplikasi Expense Tracker. Dashboard ini dipakai untuk login user, sinkronisasi akun Clerk, melihat ringkasan keuangan, mengelola transaksi, dan membaca kategori transaksi dari API.

## Project Overview

Expense Tracker Dashboard adalah aplikasi frontend terpisah yang terhubung ke Expense Tracker API. Aplikasi ini memakai Clerk untuk autentikasi dan memakai API backend untuk menyimpan data user, kategori, transaksi, dan summary.

Dashboard ini memiliki alur utama:

1. User login melalui Clerk.
2. Dashboard mengirim token Clerk ke API.
3. API melakukan sinkronisasi user.
4. Dashboard mengambil data kategori, transaksi, dan ringkasan keuangan berdasarkan user aktif.

## Tech Stack

- Nuxt
- Vue 3
- TypeScript
- Clerk Nuxt
- TanStack Vue Query
- Tailwind CSS
- Lucide Vue Icons
- ApexCharts
- Vercel

## Main Features

- Login dengan Clerk.
- Register dengan Clerk.
- Sinkronisasi user ke backend.
- Proteksi halaman dashboard.
- Redirect user login ke halaman dashboard utama.
- Ambil user aktif dari Clerk session.
- Ambil kategori transaksi dari API.
- Tambah transaksi baru.
- Lihat daftar transaksi.
- Lihat ringkasan bulanan.
- Lihat dashboard insight sederhana.
- Responsive layout untuk desktop dan mobile.

## Authentication Flow

### Login Flow

1. User membuka `/auth/login`.
2. User login melalui Clerk.
3. Clerk mengarahkan user ke `/auth/sync`.
4. `AuthSyncClient.client.vue` mengambil token Clerk.
5. Dashboard mengirim request ke API:

```txt
POST /auth/clerk/sync
```

6. API membuat atau membaca user lokal.
7. Jika berhasil, dashboard redirect ke `/`.

### Protected Page Flow

Halaman dashboard diproteksi oleh middleware.

Protected pages:

```txt
/
/transactions
/transactions/create
/monthly-summary
```

Jika user belum login, user diarahkan ke:

```txt
/auth/login
```

## API Integration

Semua request protected harus memakai `useApi().apiFetch`.

`useApi` bertugas untuk:

1. Mengambil Clerk token dari `useAuth()`.
2. Menambahkan header `Authorization`.
3. Mengirim request ke API base URL.

Format header:

```txt
Authorization: Bearer <clerk_token>
```

## Main Routes

| Route | Description | Auth |
|---|---|---|
| `/auth/login` | Login page Clerk | Public |
| `/auth/register` | Register page Clerk | Public |
| `/auth/sync` | Sync user Clerk ke API | Clerk |
| `/` | Dashboard utama | Protected |
| `/transactions` | Daftar transaksi | Protected |
| `/transactions/create` | Tambah transaksi | Protected |
| `/monthly-summary` | Ringkasan bulanan | Protected |

## Environment Variables

Buat file `.env` untuk local development.

```env
NUXT_PUBLIC_API_BASE="http://localhost:5172"
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_or_pk_live_xxx"
NUXT_CLERK_SECRET_KEY="sk_test_or_sk_live_xxx"
```

Untuk production di Vercel:

```env
NUXT_PUBLIC_API_BASE="https://your-api-domain.vercel.app"
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_or_pk_live_xxx"
NUXT_CLERK_SECRET_KEY="sk_test_or_sk_live_xxx"
```

Notes:

- Jangan commit file `.env`.
- `NUXT_PUBLIC_API_BASE` harus mengarah ke domain API.
- Jangan gunakan slash akhir pada API base URL.
- Clerk publishable key frontend harus berasal dari project Clerk yang sama dengan backend secret key.

## Folder Structure

```txt
expense-tracker-dashboard/
├─ app/
│  ├─ assets/
│  ├─ components/
│  │  ├─ auth/
│  │  │  ├─ AuthSyncClient.client.vue
│  │  │  ├─ LoginComponent.vue
│  │  │  └─ RegisterComponent.vue
│  │  └─ dashboard/
│  │     ├─ AppHeader.vue
│  │     ├─ AppLogo.vue
│  │     ├─ AppSidebar.vue
│  │     └─ TemplateMenu.vue
│  ├─ composables/
│  │  ├─ useApi.ts
│  │  ├─ useDashboard.ts
│  │  ├─ useSummary.ts
│  │  └─ useTransactions.ts
│  ├─ layouts/
│  │  ├─ auth.vue
│  │  └─ default.vue
│  ├─ middleware/
│  │  ├─ auth.global.ts
│  │  ├─ clerk-auth.ts
│  │  └─ guest.ts
│  ├─ pages/
│  │  ├─ auth/
│  │  │  ├─ login/[...slug].vue
│  │  │  ├─ register/[...slug].vue
│  │  │  ├─ complete-profile.vue
│  │  │  └─ sync.vue
│  │  ├─ transactions/
│  │  │  ├─ create.vue
│  │  │  └─ index.vue
│  │  ├─ index.vue
│  │  └─ monthly-summary.vue
│  ├─ plugins/
│  │  ├─ apexCharts.client.ts
│  │  ├─ axiosInstance.ts
│  │  └─ vueQuery.ts
│  ├─ utils/
│  ├─ app.config.ts
│  └─ app.vue
├─ nuxt.config.ts
├─ package.json
└─ pnpm-lock.yaml
```

## Important Composables

### `useApi.ts`

Dipakai sebagai API client utama untuk endpoint protected.

Responsibilities:

- Ambil Clerk token.
- Validasi token tersedia.
- Set `Authorization` header.
- Gunakan `config.public.apiBase` sebagai base URL.

### `useTransactions.ts`

Mengelola data transaksi dan kategori.

Main functions:

- `useTransactionsQuery()`
- `useCategoriesQuery()`
- `useMonthlyHistoryRangeQuery()`
- `useCreateTransactionMutation()`

### `useSummary.ts`

Mengambil summary keuangan berdasarkan user dan bulan.

Main function:

- `useSummaryQuery(month)`

### `useDashboard.ts`

Menggabungkan data transactions, summary, dan monthly history untuk dashboard.

## Local Setup

Install dependencies:

```bash
pnpm install
```

Run development server:

```bash
pnpm dev
```

Default local dashboard:

```txt
http://localhost:3000
```

## Production Build

```bash
pnpm build
```

Preview production build:

```bash
pnpm preview
```

## Vercel Deployment Notes

Tambahkan environment variables di Vercel dashboard project:

```env
NUXT_PUBLIC_API_BASE="https://your-api-domain.vercel.app"
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_or_pk_live_xxx"
NUXT_CLERK_SECRET_KEY="sk_test_or_sk_live_xxx"
```

Pastikan API Vercel juga memiliki env berikut:

```env
FRONTEND_URL="https://your-dashboard-domain.vercel.app"
CLERK_AUTHORIZED_PARTIES="https://your-dashboard-domain.vercel.app"
```

Jika env berubah, redeploy dashboard dan API.

## Common Issues

### Failed to Fetch on `/auth/clerk/sync`

Penyebab umum:

- API crash.
- CORS API belum mengizinkan domain dashboard.
- `NUXT_PUBLIC_API_BASE` salah.
- API belum redeploy setelah env berubah.

### 401 on `/auth/clerk/sync`

Penyebab umum:

- Token Clerk tidak terkirim.
- Publishable key dan secret key Clerk tidak berasal dari project yang sama.
- Backend guard menolak token.

### 500 on `/categories`, `/transactions`, or `/summary`

Penyebab umum:

- API gagal membaca user lokal.
- User belum tersinkronisasi.
- Backend guard belum set `req.user`.
- Prisma atau database bermasalah di API.

### Warning Clerk Development Keys

Warning ini muncul jika aplikasi memakai `pk_test_` atau `sk_test_` di production.

Untuk production real, gunakan Clerk production keys.

## Recommended Commit Format

Gunakan Conventional Commit.

```bash
feat(dashboard): add Clerk auth pages
fix(auth): protect dashboard routes
refactor(dashboard): use Clerk token for API requests
fix(transaction): trigger native date picker
chore(dashboard): configure Vercel environment
```

## Status

Dashboard sudah disiapkan untuk terhubung dengan Expense Tracker API, Clerk Auth, dan deployment Vercel.
