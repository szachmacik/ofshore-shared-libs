# Moduły płatności

## Dostępne bramki

| Plik | Bramka | Metody | Status |
|---|---|---|---|
| `stripe-service.ts` | Stripe | Karta, Apple Pay, Google Pay | Gotowy - wymaga kluczy |
| `paynow-service.ts` | PayNow (mBank) | BLIK, Przelewy24, szybki przelew | Gotowy - wymaga kluczy |
| `zen-service.ts` | Zen.com | BLIK, karta, Apple Pay, Google Pay | Gotowy - wymaga kluczy |

## Użycie Stripe

```typescript
import { processStripePayment } from './stripe-service';

const result = await processStripePayment(
  149.99,        // kwota w PLN
  'PLN',         // waluta
  'ORD-2024-001', // ID zamówienia
  'klient@email.pl',
  'Speakbook Pack - materiały edukacyjne'
);

if (result.success && result.redirectUrl) {
  window.location.href = result.redirectUrl; // przekierowanie do Stripe Checkout
}
```

## Użycie PayNow (BLIK)

```typescript
import { processPayNowPayment } from './paynow-service';

const result = await processPayNowPayment(
  149.99,
  'ORD-2024-001',
  'klient@email.pl',
  'Speakbook Pack'
);

if (result.success && result.redirectUrl) {
  window.location.href = result.redirectUrl; // przekierowanie do PayNow
}
```

## Wymagane zmienne środowiskowe

Patrz `../docs/env-vars.md`
