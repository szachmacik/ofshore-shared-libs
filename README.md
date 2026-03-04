# ofshore-shared-libs

Wspólna biblioteka modułów dla wszystkich projektów ofshore.dev.

Każdy moduł jest samodzielny i gotowy do skopiowania do dowolnego projektu Next.js / Express / tRPC.

## Struktura

```
payments/     → Stripe, PayNow (BLIK), Zen.com
email/        → Resend (szablony, wysyłka)
auth/         → Manus OAuth, JWT, rate limiting
sync/         → Publigo BOX, WooCommerce, Baselinker
analytics/    → Meta CAPI, Polaris-track pixel, GA4
utils/        → slugify, formatPrice, generateOrderId
docs/         → Instrukcje wdrożenia, zmienne środowiskowe
```

## Projekty korzystające z tej biblioteki

| Projekt | URL | Moduły |
|---|---|---|
| educational-sales-site | kamila.ofshore.dev | payments, email, analytics, sync |
| polaris-track | polaris-track.ofshore.dev | analytics |
| ai-control-center | (wewnętrzny) | auth, email |
| sentinel | sentinel.ofshore.dev | auth |

## Jak używać

1. Skopiuj potrzebny plik do `lib/` lub `server/` swojego projektu
2. Zainstaluj zależności opisane w nagłówku pliku
3. Dodaj wymagane zmienne środowiskowe (patrz `docs/env-vars.md`)
4. Gotowe - nie musisz nic konfigurować od zera

## Zasady

- Każdy plik jest niezależny (brak cross-importów między modułami)
- Zmienne środowiskowe zawsze przez `process.env.*` (nie hardkodowane)
- Każdy moduł ma sekcję `// REQUIRED ENV VARS:` na górze
- Kod jest komentowany po polsku dla czytelności
