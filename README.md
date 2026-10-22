# Passtjob – Bewerberportal

Bewerberseite des neuen Modells von Ländle Digital: Fachkräfte aus Industrie und Handwerk legen in zwei Minuten ein Kurzprofil an, das Profil landet im Bewerberpool (Lead Table), ein Talent Scout ruft bei einem Match an.

**„Passtjob“ ist ein Arbeitstitel.** Alles Markenbezogene steht in `config/marke.json` und lässt sich dort in einer Zeile tauschen.

## Inhalt

| Pfad | Was |
|---|---|
| `config/marke.json` | Name, Claim, Betreiber, Regionen, Kontakt, Farben (hell + dunkel), Schriften, Logo, Figur |
| `config/berufe.json` | Berufskategorien mit Unterberufen, Deeplink-Aliasen und Texten der Berufsseiten |
| `config/webhooks.json` | Eine Lead-Table-Kachel pro Kategorie + Rückfall-URL |
| `schema/felder.json` | **Das Feldschema** – eine Quelle für Formular, Payload und späteren Onboarding-Bogen |
| `src/inhalt.mjs` | Alle Texte aller Seiten |
| `src/vorlagen.mjs` | HTML-Vorlagen |
| `assets/` | `style.css`, `profil.js` (Formular), `fonts/` (selbst gehostet) |
| `build.mjs` | Baut alles nach `dist/` und erzeugt `CONTENT.md` + `SCHEMA.md` |
| `test/formular-test.cjs` | Browser-Test fürs Formular |
| `CONTENT.md` | Alle Texte in einer Datei – **zur Freigabe durchs Team** |
| `SCHEMA.md` | Feldschema als Tabelle |
| `MATCHING.md` | Regeln fürs spätere Matching in der Lead Table |
| `OFFENE-PUNKTE.md` | Was noch entschieden oder geprüft werden muss |

## Bauen und ansehen

Nur Node ≥ 18 nötig, keine Pakete.

```bash
node build.mjs                    # → dist/
python3 -m http.server -d dist    # → http://localhost:8000
```

`node build.mjs --artifact` baut eine Variante für die Vorschau als Claude-Artifact (`dist-artifact/`, Schriften von Google Fonts statt lokal).

## Vorschau über GitHub Pages

Repo-Settings → **Pages** → Source: **Deploy from a branch**, Branch: `main` / `/root`. Nach ein paar Minuten unter `https://saviold.github.io/jobkollege/` erreichbar.

GitHub Pages zeigt nur fertige Dateien. Deshalb liegen die gebauten Seiten (`index.html`, die Berufsseiten, `profil.html` …, `assets/marke.css`, `assets/config.js`) direkt im Hauptordner. **Nach jeder Änderung an Config, Texten oder Vorlagen:**

```bash
node build.mjs --pages   # schreibt die Seiten in den Hauptordner
git add -A && git commit -m "…" && git push
```

Diese Vorschau ist für Suchmaschinen gesperrt (`noindex`, `robots.txt`), weil Impressum und Datenschutz noch Platzhalter bzw. Entwürfe sind. Das Formular läuft im Vorschau-Modus, solange keine Webhook-URL eingetragen ist – es wird nichts gesendet.

## Live schalten (Cloudflare Pages)

Build-Befehl `node build.mjs`, Ausgabeverzeichnis `dist`. Die Seite lädt nichts von fremden Servern – Schriften (Barlow, Barlow Condensed, IBM Plex Mono, alle SIL Open Font License) liegen in `assets/fonts/`. `sitemap.xml` und `robots.txt` entstehen aus `domain` in `config/marke.json`.

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: Hero mit Beispiel-Match, Ablauf, Vertraulich, Vergleich, Berufe, Fragen |
| `zerspanung.html` … `produktion-logistik.html` | Eine Seite pro Kategorie, Ziel für die Anzeigen der jeweiligen Berufsgruppe |
| `profil.html` | Kurzprofil (Formular) |
| `datenschutz.html` | **Entwurf** – Freigabe durch Anwalt |
| `impressum.html` | Platzhalter |

## Marke einsetzen

`config/marke.json` ändern, `node build.mjs` – fertig. Name und Platzhalter wie `{marke}` in den Texten ziehen automatisch nach, Farben und Schriften werden als CSS-Variablen nach `assets/marke.css` geschrieben.

- `logo`: Pfad zu einer Datei in `assets/` (z. B. `"assets/logo.svg"`). Leer = Wortmarke mit Platzhalter-Symbol.
- `figur`: Pfad zum Bild der Figur. Leer = nur die Beispiel-Karte im Hero.
- Neue Schrift: Familie und Gewichte eintragen und die passenden `.woff2` als `<familie>-<gewicht>.woff2` nach `assets/fonts/` legen.

## Berufe pflegen

Ein Eintrag in `config/berufe.json` = eine Kategorie mit eigener Seite, eigener Kachel im Formular und eigenem Webhook-Eintrag. Der Build bricht mit einer klaren Meldung ab, wenn ein Pflichtfeld fehlt.

## Deeplinks für die Anzeigen

| Link | Wirkung | Schritte |
|---|---|---|
| `profil.html` | Start mit Kategorie-Auswahl | 14 |
| `profil.html?beruf=zerspanung` | Kategorie vorgewählt, Auswahl übersprungen | 13 |
| `profil.html?beruf=zerspanung&als=cnc-fraeser` | Kategorie **und** Beruf vorgewählt | 12 |
| `profil.html?beruf=cnc` | Aliase aus `config/berufe.json` funktionieren auch | 13 |

UTM-Parameter (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) werden übernommen und im Payload mitgeschickt. Statt `?beruf=` geht auch `#zerspanung`.

## Das Formular

- **Eine Frage pro Schritt**, große Antwortflächen. Einfache Fragen gehen nach dem Tippen von selbst weiter.
- **Keine K.-o.-Abbrüche.** Jedes vollständige Profil kommt in den Pool, gefiltert wird erst im Matching.
- **Kein Lebenslauf-Upload, keine Altersabfrage** (AGG). Gefragt wird nur, ob ein Lebenslauf nachgereicht werden kann.
- **Sperrliste:** Bewerber können Betriebe ausschließen, z. B. den jetzigen Arbeitgeber. Macht das Versprechen „Dein Chef erfährt nichts“ haltbar.
- **Honeypot** gegen Bots: Ein unsichtbares Feld, das nur Bots ausfüllen – dann wird nichts gesendet.

### Mobile Laufruhe

Beim Schrittwechsel wird nur eine Klasse gewechselt – kein `scrollTo`, kein `scrollIntoView`, kein `focus()`, kein Reload. Der Schrittbereich bekommt per JavaScript die Höhe des höchsten Fragenschritts bei der aktuellen Breite (der Berufsschritt wird dafür mit der längsten Berufsliste gemessen). Die Fehlerzeile hat immer ihren Platz. Dadurch steht der Weiter-Button in allen Fragenschritten an derselben Stelle. Nur der letzte Schritt (Kontakt) ist höher.

Nachgemessen mit `test/formular-test.cjs` (Chromium, Touch-Emulation), jeweils alle vier Deeplink-Wege:

| Viewport | Sprünge beim Schrittwechsel | Höhe Fragenschritte | Weiter-Button |
|---|---|---|---|
| 360 × 640 | 0 | 562 px (604 ohne Deeplink) | fix (±1 px Rundung) |
| 375 × 667 | 0 | 562 px (604 ohne Deeplink) | fix |
| 390 × 844 | 0 | 511–551 px (604 ohne Deeplink) | fix |
| 414 × 896 | 0 | 511–551 px (604 ohne Deeplink) | fix |

Auf 360 × 640 passt ein Fragenschritt nicht komplett ins Bild: Der Weiter-Button liegt unter dem sichtbaren Bereich. Bei Fragen mit einer Antwort ist das egal (sie gehen von selbst weiter), bei Mehrfachauswahl muss kurz gescrollt werden. Die Werte sind im Vorschau-Modus gemessen. Der Vorschau-Hinweis oben kostet rund 80 px, die live wegfallen.

Test laufen lassen:

```bash
node build.mjs && NODE_PATH=$(npm root -g) node test/formular-test.cjs
```

Der Test prüft außerdem Pflichtfeld-Fehler, die erzwungene Einwilligung, die PLZ-Bereinigung („D-70173“ → „70173“), den „Anderer Beruf“-Weg, UTM-Übernahme und dass jedes Payload-Feld gefüllt ist.

## Lead Table

Gesendet wird **nur** ein vollständiges Profil, per `POST` als flaches JSON – jedes Feld genau einmal, Vor- und Nachname getrennt, kein kombiniertes `name`. Bei CORS-Problemen fällt der Versand auf `no-cors` mit `text/plain` zurück.

Die URL kommt aus `config/webhooks.json`: zuerst die Kachel der gewählten Kategorie, sonst `fallback`. **Solange keine URL eingetragen ist, läuft der Vorschau-Modus:** Oben im Formular steht ein Hinweis, und nach dem Absenden zeigt die Seite den Payload an, statt ihn zu senden.

```json
{
  "vorname": "Max",
  "nachname": "Mustermann",
  "telefon": "0151 23456789",
  "email": "max@beispiel.de",
  "berufskategorie": "Zerspanung",
  "beruf": "CNC-Fräser",
  "abschluss": "Abgeschlossene Ausbildung",
  "erfahrung": "3 bis 5 Jahre",
  "plz": "70173",
  "ort": "Stuttgart",
  "fahrweg": "Bis 30 km",
  "verfuegbarkeit": "In 2 bis 3 Monaten",
  "gehalt": "3.300 bis 3.800 €",
  "schicht": "Nur Tagschicht, 2-Schicht",
  "fuehrerschein": "Klasse B",
  "deutsch": "Muttersprache",
  "lebenslauf": "Ja",
  "sperrliste": "Muster GmbH",
  "erreichbarkeit": "Abends",
  "einwilligung": "Ja (ENTWURF 2026-10, 22.10.2026 14:05)",
  "datum": "22.10.2026",
  "quelle": "Bewerberportal Passtjob",
  "seite": "https://passtjob.de/profil?beruf=zerspanung&utm_source=meta",
  "utm_source": "meta"
}
```

Alle Felder mit Fragen und Antworten: `SCHEMA.md`.

## Noch zu tun

Siehe `OFFENE-PUNKTE.md` – vor allem Name prüfen, Rechtstexte vom Anwalt, Webhook-URLs eintragen.
