# Nigeria Lifestyle

A Nigeria-focused multiplayer life simulator MVP for Abuja, designed around a free-to-play shared city and a fictional Game Naira economy.

## Business model
- Free browser game.
- Players earn Game Naira by working, studying and playing.
- Optional top-ups: ₦1,000 real money -> ₦10,000 Game Naira; ₦2,000 -> ₦20,000; ₦5,000 -> ₦50,000; ₦10,000 -> ₦100,000.
- Game Naira is fictional, has no cash-out value, and is not Nigerian legal tender.
- Business advertising inventory is built into the shared city.

## Stack
React + Vite + Supabase Auth/Postgres/Realtime + Paystack server-side Edge Functions.

## Local
npm install
npm run dev

Copy `.env.example` to `.env` and set the Supabase URL and publishable key.

## Supabase
1. Run `supabase-schema.sql` in the SQL editor.
2. Deploy `supabase/functions/paystack-create` and `supabase/functions/paystack-webhook`.
3. Set Supabase secrets `PAYSTACK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SITE_URL`.
4. Configure the Paystack webhook to your deployed `paystack-webhook` function.

Never put the Paystack secret key in Vite/frontend environment variables.

## Render
Build: `npm install && npm run build`
Publish directory: `dist`
Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
