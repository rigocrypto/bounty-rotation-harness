
## Stripe Test Mode End-to-End Validation

This checklist validates that your webhook handler correctly processes real Stripe events, handles signatures, and updates billing state. Run this once before considering billing production-ready.

**When:** After CI passes, before Billing Portal integration.  
**Time:** ~30 minutes.  
**Environment:** Local test mode (Stripe test keys only).  

### Prerequisites

1. Have Stripe test keys available:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli

2. Fresh or known billing DB state:
   ```bash
   npm run billing:migrate
   npm run billing:seed
   ```

3. Verify starting state:
   ```bash
   npm run billing:status -- --client example
   ```
   Should show: status=`active`, plan=`growth` (from seed)

---

### Step 1: Start Webhook Server

**Terminal 1:**
```bash
npm run billing:webhook-server
```

Expected output:
```
[billing:migrate] migration complete
Webhook server running on http://localhost:4000
Endpoints:
  GET  /health
  POST /api/webhooks/stripe
```

Leave this running for all remaining tests.

---

### Step 2: Start Stripe CLI Forwarder

**Terminal 2:**
```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Expected output:
```
> Ready! Your webhook signing secret is: whsec_test_...
```

**Copy the signing secret** and set it:
```bash
$env:STRIPE_WEBHOOK_SECRET='whsec_test_...'
```

Leave this running for all remaining tests.

---

### Step 3: Test checkout.session.completed

**Terminal 3:**
```bash
stripe trigger checkout.session.completed
```

Expected webhook server output:
```
✓ POST /api/webhooks/stripe
✓ checkout.session.completed
✓ Account updated / created
```

Verify in DB:
```bash
npm run billing:status -- --client example
```

Check: Account should still be active (seed state preserved or updated based on event payload).

✅ **Test 1 passed:** Event received, signature verified, DB updated.

---

### Step 4: Test invoice.paid

**Terminal 3:**
```bash
stripe trigger invoice.paid
```

Expected webhook server output:
```
✓ POST /api/webhooks/stripe
✓ invoice.paid
✓ Billing status updated to: active
```

Verify:
```bash
npm run billing:status -- --client example
```

Check:
- status = `active`
- `last_payment_at` is recent
- provisioning_log has an `enabled` or `payment_received` entry

✅ **Test 2 passed:** Invoice event processed, status set to active, audit logged.

---

### Step 5: Test invoice.payment_failed

**Terminal 3:**
```bash
stripe trigger invoice.payment_failed
```

Expected webhook server output:
```
✓ POST /api/webhooks/stripe
✓ invoice.payment_failed
✓ Billing status updated to: past_due
```

Verify:
```bash
npm run billing:status -- --client example
```

Check:
- status = `past_due`
- `allowed` = `false` (managed access blocked)
- provisioning_log includes action explaining payment failure

✅ **Test 3 passed:** Payment failure correctly gates access.

---

### Step 6: Test customer.subscription.deleted

**Terminal 3:**
```bash
stripe trigger customer.subscription.deleted
```

Expected webhook server output:
```
✓ POST /api/webhooks/stripe
✓ customer.subscription.deleted
✓ Billing status updated to: canceled
```

Verify:
```bash
npm run billing:status -- --client example
```

Check:
- status = `canceled`
- `allowed` = `false` (blocked from new runs)
- provisioning_log has `disabled` entry

✅ **Test 4 passed:** Cancellation correctly blocks new execution.

---

### Step 7: Test duplicate event idempotency

**Terminal 3 (repeat any trigger):**
```bash
stripe trigger invoice.paid
stripe trigger invoice.paid
```

Verify no duplicate mutations:
```bash
sqlite3 data/billing.db "SELECT COUNT(*) as event_count FROM stripe_events WHERE event_type='invoice.paid';"
```

Expected:
- Only **1** event row (not 2, despite sending twice)
- Provisioning log entry count does not double

✅ **Test 5 passed:** Duplicate delivery correctly deduplicated via stripe_event_id.

---

### Step 8: Test invalid signature rejection

**Terminal 2 (stop Stripe CLI):**
```
Ctrl+C
```

Set wrong webhook secret:
```bash
$env:STRIPE_WEBHOOK_SECRET='whsec_invalid_test_key'
```

Restart Stripe CLI:
```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

**Terminal 3:**
```bash
stripe trigger invoice.paid
```

Expected webhook server output:
```
✗ POST /api/webhooks/stripe
✗ Invalid signature
✗ 400 Bad Request
```

Verify no DB mutation:
```bash
npm run billing:status -- --client example
```

Should show status unchanged from before this test.

✅ **Test 6 passed:** Invalid signatures rejected, state preserved.

Restore correct webhook secret:
```bash
$env:STRIPE_WEBHOOK_SECRET='whsec_test_...'
```

---

### Validation Summary

Record results:

```markdown
## Stripe CLI Validation Results

**Date:** [today]  
**Tester:** [your name]  
**Environment:** local test mode  

| Test | Result | Notes |
|------|--------|-------|
| checkout.session.completed | ✅ PASS | Event received, account state updated |
| invoice.paid | ✅ PASS | Status → active, audit logged |
| invoice.payment_failed | ✅ PASS | Status → past_due, access blocked |
| customer.subscription.deleted | ✅ PASS | Status → canceled, runs blocked |
| duplicate event idempotency | ✅ PASS | stripe_event_id deduplication works |
| invalid signature rejection | ✅ PASS | 400 returned, no DB mutation |

**Overall:** ✅ PASS — Ready for Billing Portal integration.
```
