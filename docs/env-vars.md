# Zmienne środowiskowe - wszystkie moduły

## payments/stripe-service.ts

```env
STRIPE_SECRET_KEY=sk_live_...          # Klucz prywatny Stripe (server-side only)
STRIPE_WEBHOOK_SECRET=whsec_...        # Secret do weryfikacji webhooków Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Klucz publiczny (frontend)
```

**Gdzie pobrać:** https://dashboard.stripe.com/apikeys  
**Webhook URL:** `https://twoja-domena.pl/api/webhooks/stripe`  
**Wymagane eventy:** `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## payments/paynow-service.ts (BLIK, mBank)

```env
PAYNOW_ACCESS_KEY=...      # Klucz dostępu z panelu PayNow
PAYNOW_SIGNATURE_KEY=...   # Klucz do podpisywania żądań
PAYNOW_SANDBOX=true        # true = środowisko testowe, false = produkcja
```

**Gdzie pobrać:** https://panel.paynow.pl → Ustawienia → Klucze API  
**Webhook URL:** `https://twoja-domena.pl/api/webhooks/paynow`

---

## payments/zen-service.ts (BLIK, karta, Google Pay, Apple Pay)

```env
ZEN_API_KEY=...            # Klucz API Zen.com
ZEN_MERCHANT_ID=...        # ID merchantu
ZEN_SANDBOX=true           # true = środowisko testowe
```

**Gdzie pobrać:** https://dashboard.zen.com → API Keys

---

## email/resend-email.ts

```env
RESEND_API_KEY=re_...      # Klucz API Resend
```

**Gdzie pobrać:** https://resend.com/api-keys  
**Uwaga:** Domena `ofshore.dev` jest już zweryfikowana w Resend - klucz działa dla wszystkich subdomen.

---

## analytics/meta-capi-service.ts

```env
META_PIXEL_ID=...          # ID Pixela Meta (Facebook)
META_CAPI_TOKEN=...        # Token dostępu do Conversions API
META_TEST_EVENT_CODE=...   # Opcjonalnie: kod testowy z Meta Events Manager
```

**Gdzie pobrać:** https://business.facebook.com/events_manager → Ustawienia → Conversions API

---

## sync/baselinker-service.ts

```env
BASELINKER_TOKEN=...       # Token API Baselinker
```

**Gdzie pobrać:** https://panel.baselinker.com → Moje konto → API

---

## utils/infakt-service.ts (Faktury VAT)

```env
INFAKT_API_KEY=...         # Klucz API inFakt
```

**Gdzie pobrać:** https://app.infakt.pl → Ustawienia → API

---

## auth/admin-login-rate-limit.ts

```env
ADMIN_EMAIL=admin@twoja-domena.pl     # Email admina
ADMIN_PASSWORD_HASH=...               # SHA-256 hash hasła admina
# Generuj hash: echo -n "TwojeHaslo" | sha256sum
```

---

## Wspólne zmienne (wszystkie projekty ofshore.dev)

```env
# Automatycznie wstrzykiwane przez Coolify/Manus:
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
JWT_SECRET=...
DATABASE_URL=...
RESEND_API_KEY=...         # Już skonfigurowane dla kamila.ofshore.dev
```
