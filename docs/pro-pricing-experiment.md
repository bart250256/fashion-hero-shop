# FashionHero Pro — eksperyment cenowy (dry-wallet)

Jednostronicowe podsumowanie na spotkanie. Status: walidacja popytu w v1, bez backendu billingu.

## Co testujemy

Czy sprzedawcy realnie zapłacą **199 zł/mies** za płatny tier panelu „Ceny i popyt", **zanim** zbudujemy kosztowny pipeline danych (baza 2,4 mln kupujących, rekomendacje cen).

### Freemium vs Pro

| | Darmowy | Pro (199 zł/mies) |
|---|---|---|
| Dane | demo / przykładowe | realna baza 2,4 mln kupujących |
| Mediana cen kategorii | ✅ | ✅ |
| CR vs kategoria | ✅ | ✅ |
| Co teraz kupują (7 dni) | ✅ | ✅ |
| Trendy 90 dni | 🔒 | ✅ |
| Rekomendacje cen (per produkt) | 🔒 | ✅ |
| Alerty cenowe (ruchy konkurencji) | 🔒 | ✅ |

Różnica: darmowy mówi **gdzie jesteś**, Pro mówi **co zrobić** — na realnych danych.

## Metoda: dry-wallet (pre-sell / fake-door)

Sprzedawca „aktywuje" Pro podając pełne dane karty, ale **nie pobieramy żadnych środków** (tryb setup, `charged: false`). Logujemy zdarzenie: kto + kiedy + która funkcja.

**Dlaczego:** klik „interesuje mnie" jest tani i zawyża popyt. Wpisanie karty to najsilniejszy sygnał intencji bez budowania realnego billingu. Walidujemy popyt przed inwestycją.

## Co mierzymy — lejek

Mierzymy drop-off na każdym etapie (nie tylko końcowy commitment), żeby odróżnić **słaby popyt** od **słabego UX lejka**.

| # | Etap | Sygnał |
|---|---|---|
| 1 | Wejście na zakładkę „Ceny i popyt" | `pricing_tab_viewed` |
| 2 | Zobaczenie sekcji Pro (scroll) | `pro_section_viewed` |
| 3 | Klik w funkcję Pro | `pro_feature_clicked` (+ `feature`) |
| 4 | Rozpoczęcie wpisywania karty | `card_form_started` |
| 5 | **Commitment** (zapis karty) | `commitment_logged` |
| — | Porzucenie modala bez zapisu | `modal_abandoned` |

**Kluczowa metryka:** commitment rate liczony **od tych, którzy dotarli do paywalla (etap 2)**, nie od wszystkich sprzedawców — oddziela popyt na Pro od problemu dystrybucji w panelu.

Dodatkowo: **który `feature`** ma najwyższy klik→commitment → to definiuje MVP.

## Kryteria sukcesu / porażki

Progi proponowane, do zatwierdzenia na spotkaniu (commitment rate = etap 5 / etap 2):

| Wynik | Próg | Decyzja |
|---|---|---|
| ✅ Sukces | ≥ 10–15% | Budujemy realny pipeline danych |
| 🟡 Strefa szara | 5–10% | Iteracja ceny/pakowania, retest |
| ❌ Porażka | < 5% | Popyt zbyt słaby — nie inwestujemy |

### Interpretacja drop-offu (gdzie odpadają → co robimy)

- **Widzą Pro, nie klikają (2→3):** problem wartości/ceny → test niższej ceny, lepszy framing/preview.
- **Klikają, nie wpisują karty (3→4):** bariera 199 zł lub „karta" → test tańszego planu lub „lista oczekujących" zamiast karty.
- **Zaczynają, nie kończą (4→5):** friction formularza → mniej pól, mocniejsza reasekuracja „0 zł dziś".

## Ograniczenia v1

- Dane w panelu są demo — nie ma realnego pipeline'u do bazy 2,4 mln.
- Commitmenty i eventy w `localStorage`, bez backendu — wystarczy do walidacji, nie do skali.
- Próbka jednego sprzedawcy testowego; potrzebny realny ruch do wniosków.
