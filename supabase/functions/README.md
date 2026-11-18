# Supabase Edge Functions: payments and resume emails

The site is static (GitHub Pages), so the payment server code runs as three Supabase Edge Functions.
The Razorpay **key secret lives only in Supabase's secrets**: never in this repository or the website.

| Function | Called by | What it does |
|---|---|---|
| `create-order` | the Lab, when a signed-in learner clicks Unlock | Looks up the price in `products`, creates a Razorpay order, stores a `created` purchase, returns `{ order_id, amount, currency, key_id }` |
| `verify-payment` | the Lab, after Razorpay Checkout succeeds | Checks `HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)`, confirms the payment with Razorpay (capturing it if needed) and marks the purchase `paid` |
| `razorpay-webhook` | Razorpay's servers | Safety net: marks the purchase paid on `payment.captured` / `order.paid` even if the buyer closed the page |
| `admin` | the Lab's admin page (`learn.html#/admin`) | Admins only (`public.admins`, see `supabase/admin.sql`): sales, accounts and progress; refunds through Razorpay; free course grants |

## 1. Secrets
Supabase Dashboard → **Edge Functions → Secrets** → add:

| Name | Value |
|---|---|
| `RAZORPAY_KEY_ID` | `rzp_test_…` (Razorpay → Account & Settings → API Keys) |
| `RAZORPAY_KEY_SECRET` | the matching key secret |
| `RAZORPAY_WEBHOOK_SECRET` | any long random text you also enter in step 3 |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to functions automatically.

## 2. Deploy the functions
**Dashboard (no tools needed):** Edge Functions → **Deploy a new function → Via Editor**. Name it exactly
`create-order`, replace the sample code with `create-order/index.ts`, and click **Deploy**. Repeat for
`verify-payment`, `razorpay-webhook` and `admin`. Then open each function → **Details / Settings** and turn **off**
"Verify JWT" (each function checks the sign-in itself; Razorpay's webhook has no Supabase token).

**Or with the Supabase CLI:**
```bash
supabase login
supabase link --project-ref jiwvwgrtxgmrinikmgyb
supabase secrets set --env-file .env          # .env holds RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
supabase functions deploy create-order --no-verify-jwt
supabase functions deploy verify-payment --no-verify-jwt
supabase functions deploy razorpay-webhook --no-verify-jwt
supabase functions deploy admin --no-verify-jwt
```

## 3. Webhook
Razorpay Dashboard (Test mode) → **Account & Settings → Webhooks → Add New Webhook**:
URL `https://jiwvwgrtxgmrinikmgyb.supabase.co/functions/v1/razorpay-webhook`, secret = `RAZORPAY_WEBHOOK_SECRET`,
events **payment.captured** and **order.paid**.

## 4. Test (test mode, no real money)
Build the Lab with the paywall on, sign in, open a locked lesson and click **Unlock**. In the Razorpay window use
a test card such as `4111 1111 1111 1111` (any future expiry, any CVV) or UPI `success@razorpay`, and complete the
mock bank page. The course unlocks and the purchase appears as `paid` in Supabase → Table Editor → `purchases`.
Test cards: https://razorpay.com/docs/payments/payments/test-card-details/

Before going live: complete Razorpay KYC, generate **live** keys, replace both secrets, and add a live-mode webhook.

## Resume emails (`send-resume`)

The portfolio's **Get Resume** form calls `send-resume`, which emails the resume PDF from `resume@shivam-soni.com`
through Brevo (replies go to `hello@shivam-soni.com`). It limits each address to 3 emails a day, each visitor (IP) to
10 an hour and the whole site to 250 a day, keeping only hashed records for two days. Set it up **before** the site
change that uses it goes live:

1. **Table:** Supabase → SQL Editor → run `supabase/resume.sql`.
2. **Sender:** Brevo → Senders, Domains & Dedicated IPs → **Senders** → add `resume@shivam-soni.com`
   (the domain is already authenticated, so no confirmation email is needed).
3. **API key:** Brevo → SMTP & API → **API Keys** → generate one, then Supabase → Edge Functions → **Secrets** →
   add `BREVO_API_KEY`. Optional: `RESUME_FROM` and `RESUME_REPLY_TO` to change the two addresses.
4. **Deploy:** Edge Functions → Deploy a new function → Via Editor, named exactly `send-resume`, with
   `send-resume/index.ts`; then turn **off** "Verify JWT". Or: `supabase functions deploy send-resume --no-verify-jwt`.
5. **Check without sending anything:** a request with the hidden `company` field filled is accepted but sends no email:
   ```bash
   curl -s -X POST https://jiwvwgrtxgmrinikmgyb.supabase.co/functions/v1/send-resume -H 'Content-Type: application/json' -d '{"name":"Test","email":"test@example.com","company":"check"}'
   ```
   It should print `{"ok":true}`.
