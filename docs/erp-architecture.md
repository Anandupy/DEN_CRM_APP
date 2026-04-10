# Gym ERP SaaS Architecture

## App Router structure

```text
src/app/
  (auth)/
  (owner)/owner/
  (senior)/senior/
  (trainer)/trainer/
  (member)/member/
  api/auth/session/
  api/notifications/whatsapp/
```

## RBAC flow

1. User signs in with Supabase Auth.
2. Client syncs access and refresh tokens into secure cookies via `/api/auth/session`.
3. `middleware.ts` validates the session against Supabase and reads role from `profiles`.
4. User is redirected to role home:
   - `/owner/dashboard`
   - `/senior/dashboard`
   - `/trainer/dashboard`
   - `/member/dashboard`

## Low-cost WhatsApp architecture

- Provider options:
  - Meta WhatsApp Cloud API
  - Twilio WhatsApp Sandbox
  - WATI trial
- Trigger layer:
  - fee due
  - fee paid
  - membership expiring
- Current implementation:
  - `src/lib/notifications/templates.ts`
  - `src/lib/notifications/whatsapp.ts`
  - `src/app/api/notifications/whatsapp/route.ts`
  - notification logs stored in `public.notifications`

## Reusable UI layer

- `src/components/ui/DataTable.tsx`
- `src/components/ui/FormInput.tsx`
- `src/components/ui/SearchSelect.tsx`
- `src/components/ui/DashboardCard.tsx`
- `src/components/ui/ChartCard.tsx`
