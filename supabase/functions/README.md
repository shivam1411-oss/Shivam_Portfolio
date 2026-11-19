# Supabase Edge Functions: payments and resume emails

The site is static (GitHub Pages), so the payment server code runs as three Supabase Edge Functions.
The Razorpay **key secret lives only in Supabase's secrets**: never in this repository or the website.

| Function | Called by | What it does |
|---|---|---|
| `create-order` | CodeJack, when a signed-in learner clicks Unlock | Looks up the price in `products`, creates a Razorpay order, stores a `created` purchase, returns `{ order_id, amount, currency, key_id }` |
| `verify-payment` | CodeJack, after Razorpay Checkout succeeds | Checks `HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)`, confirms the payment with Razorpay (capturing it if needed) and marks the purchase `paid` |
| `razorpay-webhook` | Razorpay's servers | Safety net: marks the purchase paid on `payment.captured` / `order.paid` even if the buyer closed the page |
| `admin` | CodeJack's admin page (`learn.html#/admin`) | Admins only (`public.admins`, see `supabase/admin.sql`): sales, accounts and progress; refunds through Razorpay; free course grants; the support inbox (list, reply, change status) |
| `support` | CodeJack's Help page (`learn.html#/support`) | Signed-in learners only: raise a support request, list their own requests, add a follow-up. Emails you and the learner through Brevo |

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
Build CodeJack with the paywall on, sign in, open a locked lesson and click **Unlock**. In the Razorpay window use
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
   add `BREVO_API_KEY`. Use an API key (`xkeysib-…`), not an SMTP key (`xsmtpsib-…`). Optional: `RESUME_FROM` and
   `RESUME_REPLY_TO` to change the two addresses.
4. **IP blocking off:** Brevo → Security → **Authorised IPs** (`https://app.brevo.com/security/authorised_ips`) →
   deactivate blocking of unknown IP addresses. Supabase sends from changing IPv6 addresses, so adding one address
   does not help: the next email comes from another and Brevo rejects it with
   `401 "We have detected you are using an unrecognised IP address"`.
5. **Deploy:** Edge Functions → Deploy a new function → Via Editor, named exactly `send-resume`, with
   `send-resume/index.ts`; then turn **off** "Verify JWT". Or: `supabase functions deploy send-resume --no-verify-jwt`.
6. **Check without sending anything:** a request with the hidden `company` field filled is accepted but sends no email:
   ```bash
   curl -s -X POST https://jiwvwgrtxgmrinikmgyb.supabase.co/functions/v1/send-resume -H 'Content-Type: application/json' -d '{"name":"Test","email":"test@example.com","company":"check"}'
   ```
   It should print `{"ok":true}`.
7. **Send one for real:** request the resume from the live site with your own address. If the form says "The email
   could not be sent", open Edge Functions → `send-resume` → **Logs** and find the line starting
   `Brevo rejected the email`: it gives Brevo's status code and reason (401 key or IP, 400 sender, 403 account or
   key permission).

## Support requests (`support`, and the `admin` function's inbox)

Signed-in learners raise requests from **Help** in CodeJack (`learn.html#/support`); you read and answer them in the
**Support** section of the admin page. Each request is a ticket numbered `CJ-0001`, with a thread of replies.

1. **Tables:** Supabase → SQL Editor → run `supabase/support.sql` (two tables, row-level security on, no policies:
   only the functions can read or write them).
2. **Sender:** in Brevo → Senders, domains & IPs → **Senders** → add `support@shivam-soni.com` (name "CodeJack
   Support"). The domain is already authenticated, so it is verified straight away. To use another address, set the
   secret `SUPPORT_FROM`.
3. **Where notifications go (optional):** new requests and learner follow-ups are emailed to `hello@shivam-soni.com`,
   with the learner as Reply-To. Set the secret `SUPPORT_INBOX` to change it. `BREVO_API_KEY` is already set.
4. **Deploy:** Edge Functions → Deploy a new function → Via Editor, name it `support`, paste
   `support/index.ts`, Deploy, then turn **off** "Verify JWT". Open the existing `admin` function and replace its
   code with the new `admin/index.ts` (it adds the inbox actions), then Deploy.
5. **Check:** sign in to CodeJack, open Help, raise a test request. You should get a notification email, the
   learner a confirmation, and it appears under Support on the admin page. Reply from there: the learner gets an
   email and sees the reply under "Your requests". If an email does not arrive, open the function's **Logs** and look
   for `Brevo rejected`.

To check the function logic without deploying: `node scripts/check-support.mts` (uses an in-memory stand-in
for Supabase and Brevo).

Limits: 5 new requests per learner a day, 10 open at once, 20 follow-up messages a day. Emails are best effort: if
Brevo fails, the request is still saved and shows in the admin page.

