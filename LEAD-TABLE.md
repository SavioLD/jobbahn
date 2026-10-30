# Lead Table einrichten

> In der Lead Table gibt es drei Arten von Kacheln. Bewerber und Firmen werden **nicht** in der Lead Table verglichen, sondern im **Vergleicher** (`vergleicher/`). Die Lead Table bekommt die Ergebnisse.

```
Lead Table
│
├── Bewerberpool                        ← NEUER Kunde, gehört uns
│   ├── Pool · Metall & Maschinenbau      ┐
│   ├── Pool · Büro & Verwaltung          │ alle Bewerber aus dem Portal
│   ├── … (bis zu 15, oder eine „Pool · Alle“) ┘
│   └── Matches                         ← jeder Treffer: Bewerber + passende Firma + Begründung
│
├── Müller GmbH                         ← Firma, angelegt WIE BISHER
│   └── Mechatroniker                   ← nur geprüfte Bewerber nach dem Telefonat
│
└── Schmidt KG
    └── Buchhaltung
```

## 1. Kunde „Bewerberpool“ anlegen

Ein eigener Kunde, der keinem Betrieb gehört.

## 2. Pool-Kacheln anlegen

**Empfohlen: eine pro Jobrichtung.** Dann ist der Pool von Anfang an sortiert.

Pool · Metall & Maschinenbau · Pool · Elektro & Mechatronik · Pool · Sanitär, Heizung & Klima · Pool · Bau & Ausbau · Pool · Holz & Innenausbau · Pool · Kfz & Fahrzeugtechnik · Pool · Produktion & Montage · Pool · Lager & Logistik · Pool · Fahrer & Transport · Pool · Technik & Meister · Pool · Büro & Verwaltung · Pool · Vertrieb & Kundenservice · Pool · IT & Digitales · Pool · Haustechnik & Gebäudeservice · Pool · Helfer & Quereinsteiger

**Schneller Start: eine Kachel „Pool · Alle“.** Jedes Profil trägt die Richtung im Feld `berufskategorie`.

## 3. Kachel „Matches“ anlegen

Ebenfalls unter „Bewerberpool“. Das ist die **Arbeitsliste des Talent Scouts**: Jede Zeile ist ein Bewerber, der zu einer offenen Stelle passt.

Felder einer Zeile: Name, Telefon, E-Mail · `match` (ein Satz: „Passt zu: Stelle bei Firma in Ort · 12 km entfernt · 2 von 3 Wünschen“) · `passende_firma` · `passende_stelle` · `stellen_ort` · `entfernung` · `passung` (z. B. „2 von 3 Wünschen“) · `pruefen` (was am Telefon zu klären ist) · `gruende` (✓/✗ je Kriterium) · alle Angaben des Bewerbers · `benefits` der Stelle (fürs Telefonat) · `bearbeiten` (Link zur Stelle im Vergleicher).

## 4. Firmen anlegen – wie bisher

Pro Firma ein Kunde, pro Stelle eine Kachel. Die **Webhook-Adresse dieser Kachel** kommt in den Stellen-Steckbrief im Vergleicher (Feld „Lead-Table-Kachel der Firma“). Dorthin schickt der Knopf **„An Firma übergeben“** den Bewerber – nur mit den Angaben, die die Firma braucht (keine Sperrliste, keine Herkunftsdaten), plus der Notiz aus dem Telefonat.

## 5. Webhooks eintragen

Pro Kachel den **generischen Webhook** aktivieren und die Adresse kopieren (Form: `https://api-v2.lead-table.com/api/webhook/generic/…`).

| Kachel | Wohin eintragen |
|---|---|
| Pool-Kacheln, „Matches“ | Vergleicher → `/intern` → **Einstellungen** |
| Kachel einer Firma | Vergleicher → Stellen-Steckbrief der Stelle → „Lead-Table-Kachel der Firma“ |

Weil die Adressen im Vergleicher liegen, stehen sie **nicht** öffentlich im Code der Website.

> Ohne Vergleicher funktioniert das Portal auch: Dann die Pool-Kacheln direkt in `config/webhooks.json` eintragen. Es wird aber nichts verglichen.

## 6. Status für den Talent Scout

Der Status eines Treffers wird im Vergleicher gepflegt (Neu → Angerufen → Übergeben / Kein Interesse / Passt nicht). In der Lead Table kann die Kachel „Matches“ dieselben Status als Spalte bekommen, wenn ihr dort arbeiten wollt.

„Übergeben“, „Im Gespräch“ und „Eingestellt“ in der Kachel der Firma sind die Status, die der Kunde in der Onboarding-Präsentation gezeigt bekommt.

## 7. Testen

1. Im Vergleicher eine Test-Stelle anlegen (Firma „Test“, Firmen-Kachel = eine Test-Kachel).
2. Im Portal ein Profil abschicken, das passt (Name „Test Test“).
3. Prüfen: Zeile in der Pool-Kachel, Zeile in „Matches“. Im Vergleicher „An Firma übergeben“ → Zeile in der Test-Kachel.
4. Alles wieder löschen (Vergleicher: Einstellungen → Bewerber löschen; Lead Table von Hand).
