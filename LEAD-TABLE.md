# Lead Table einrichten

> Damit die Profile aus dem Portal wirklich im Bewerberpool ankommen. Danach die Webhook-URLs in `config/webhooks.json` eintragen, `node build.mjs --pages`, committen – fertig.

## 1. Kunde anlegen

Einen eigenen Kunden **„Bewerberpool“** anlegen. Der Pool gehört keinem Betrieb, sondern uns – so bleibt er getrennt von den Kacheln der Kundenbetriebe.

## 2. Kacheln anlegen

**Empfohlen: eine Kachel pro Jobrichtung** (15 Stück). Dann ist der Pool von Anfang an nach Richtungen sortiert, und der Talent Scout kann eine Richtung am Stück abarbeiten.

| Kachel-Name | Key in `config/webhooks.json` |
|---|---|
| Pool · Metall & Maschinenbau | `metall` |
| Pool · Elektro & Mechatronik | `elektro` |
| Pool · Sanitär, Heizung & Klima | `shk` |
| Pool · Bau & Ausbau | `bau` |
| Pool · Holz & Innenausbau | `holz` |
| Pool · Kfz & Fahrzeugtechnik | `kfz` |
| Pool · Produktion & Montage | `produktion` |
| Pool · Lager & Logistik | `lager` |
| Pool · Fahrer & Transport | `fahrer` |
| Pool · Technik & Meister | `technik` |
| Pool · Büro & Verwaltung | `buero` |
| Pool · Vertrieb & Kundenservice | `vertrieb` |
| Pool · IT & Digitales | `it` |
| Pool · Haustechnik & Gebäudeservice | `gebaeude` |
| Pool · Helfer & Quereinsteiger | `helfer` |

**Schneller Start: eine einzige Kachel** „Pool · Alle“. Ihre URL kommt unter `fallback`, alle anderen Felder bleiben leer. Jedes Profil trägt die Richtung im Feld `berufskategorie`, man kann also danach filtern. Später auf 15 Kacheln aufzuteilen ist möglich, verschiebt aber die vorhandenen Leads nicht automatisch.

## 3. Webhook je Kachel

Pro Kachel den **generischen Webhook** aktivieren und die URL kopieren (Form: `https://api-v2.lead-table.com/api/webhook/generic/…`). Das ist derselbe Webhook-Typ wie bei den bisherigen Karriereseiten.

## 4. Felder

Standardfelder: `vorname`, `nachname`, `telefon`, `email`.

Zusatzfelder, die jedes Profil mitschickt:

`berufskategorie` · `beruf` · `abschluss` · `erfahrung` · `plz` · `ort` · `fahrweg` · `verfuegbarkeit` · `gehalt` · `schicht` · `fuehrerschein` · `deutsch` · `lebenslauf` · `sperrliste` · `erreichbarkeit` · `einwilligung` · `datum` · `quelle` · `seite` · `utm_source` · `utm_medium` · `utm_campaign` · `utm_content` · `utm_term`

Falls Zusatzfelder in der Lead Table vorher angelegt werden müssen: genau diese Namen verwenden. Was die Felder enthalten, steht in `SCHEMA.md`.

## 5. Status für den Talent Scout

Vorschlag für die Status-Spalte im Pool:

| Status | Bedeutung |
|---|---|
| Neu | Profil ist angekommen |
| Match | Passt zu einer offenen Stelle |
| Angerufen | Talent Scout hat versucht zu erreichen |
| Geprüft | Telefon-Check bestanden, Bewerber will vorgestellt werden |
| Übergeben | Liegt beim Betrieb |
| Im Gespräch | Termin mit dem Betrieb steht |
| Eingestellt | Erfolg |
| Kein Interesse / Passt nicht | Mit Grund in der Notiz |

„Geprüft“, „Übergeben“, „Im Gespräch“ und „Eingestellt/Abgesagt“ sind dieselben Status, die der Kunde in der Onboarding-Präsentation gezeigt bekommt.

## 6. Testen

1. URLs in `config/webhooks.json` eintragen, `node build.mjs --pages`, committen und pushen.
2. Auf der Seite ein Testprofil abschicken (Name „Test Test“).
3. Prüfen, ob es in der richtigen Kachel mit allen Feldern ankommt – dann löschen.

## Gut zu wissen

- Die Webhook-URLs stehen danach im Code der Seite (`assets/config.js`) und sind damit öffentlich lesbar – das ist bei jedem Formular so, das direkt an einen Webhook sendet (auch bei den bisherigen Karriereseiten).
- Das Matching zwischen Pool und den Stellen der Kundenbetriebe ist ein eigener Schritt. Welche Regeln gelten, steht in `MATCHING.md`. Wie es technisch in der Lead Table umgesetzt wird, hängt davon ab, was die Lead Table dafür anbietet.
