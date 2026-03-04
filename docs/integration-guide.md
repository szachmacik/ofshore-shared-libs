# Przewodnik integracji - szybkie wdrożenie modułów

## Jak dodać płatności Stripe do projektu Next.js (15 minut)

1. Skopiuj `payments/stripe-service.ts` do `lib/integrations/stripe-service.ts`
2. Skopiuj `payments/stripe-webhook-route.ts` do `app/api/webhooks/stripe/route.ts`
3. Dodaj zmienne środowiskowe (patrz `docs/env-vars.md`)
4. W Stripe Dashboard dodaj webhook URL: `https://twoja-domena.pl/api/webhooks/stripe`
5. Wywołaj `processStripePayment(amount, currency, orderId, email, description)` w checkout

## Jak dodać BLIK (PayNow) do projektu Next.js (10 minut)

1. Skopiuj `payments/paynow-service.ts` do `lib/integrations/paynow-service.ts`
2. Dodaj zmienne środowiskowe PAYNOW_ACCESS_KEY i PAYNOW_SIGNATURE_KEY
3. Wywołaj `processPayNowPayment(amount, orderId, email, description)` w checkout
4. Skonfiguruj webhook w panelu PayNow: `https://twoja-domena.pl/api/webhooks/paynow`

## Jak dodać email przez Resend (5 minut)

1. Skopiuj `email/resend-email.ts` do `lib/email.ts`
2. Dodaj RESEND_API_KEY do zmiennych środowiskowych
3. Wywołaj `sendEmail({ to, subject, html })` z dowolnego miejsca server-side
4. Gotowe szablony: `orderConfirmationEmail()`, `adminPasswordResetEmail()`

## Jak dodać Meta CAPI (server-side tracking) (20 minut)

1. Skopiuj `analytics/meta-capi-service.ts` do `lib/integrations/meta-capi-service.ts`
2. Dodaj META_PIXEL_ID i META_CAPI_TOKEN
3. Wywołaj `trackMetaEvent('Purchase', { value, currency, email })` po każdym zakupie
4. Weryfikuj eventy w Meta Events Manager → Test Events

## Jak dodać Polaris-track pixel (5 minut)

1. Skopiuj `analytics/polaris-track-pixel.tsx` do `components/marketing/`
2. Dodaj `<PolarisTrackPixel />` do głównego layoutu
3. Pixel automatycznie śledzi UTM, źródła ruchu i konwersje
4. Dane widoczne w polaris-track.ofshore.dev

## Projekty i ich aktywne moduły

| Moduł | kamila.ofshore.dev | polaris-track | ai-control-center |
|---|---|---|---|
| Stripe | ✅ gotowy (brak kluczy) | ❌ | ❌ |
| PayNow BLIK | ✅ gotowy (brak kluczy) | ❌ | ❌ |
| Resend email | ✅ aktywny | ❌ | ❌ |
| Meta CAPI | ✅ gotowy (brak kluczy) | ❌ | ❌ |
| Polaris pixel | ⚠️ do dodania | ✅ natywny | ❌ |
| Rate limiting | ✅ aktywny | ❌ | ❌ |
| Admin auth | ✅ aktywny | ❌ | ✅ Manus OAuth |
