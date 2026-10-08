# Payment Edge Functions

These functions keep the Paystack secret on the server and credit Game Naira only after a verified `charge.success` webhook. Paystack recommends server-side initialization, amount verification, and webhook/signature validation for digital value such as wallet credit.

Set Supabase secrets:
- PAYSTACK_SECRET_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SITE_URL (e.g. https://your-render-site.onrender.com)

Deploy both functions with the Supabase CLI, then set the Paystack webhook URL to:
`https://YOUR_PROJECT.supabase.co/functions/v1/paystack-webhook`
