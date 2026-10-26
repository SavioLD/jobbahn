# Jobbahn – Bewerberportal

Bewerberseite des neuen Modells von Ländle Digital: Bewerber aus Handwerk, Industrie und Büro legen in zwei Minuten ein Kurzprofil an, das Profil landet im Bewerberpool (Lead Table), ein Talent Scout ruft bei einem Match an. Keine Regionsgrenze – gesucht wird „in deiner Nähe“, abgeglichen über PLZ und Fahrweg.

Design: schlicht und ruhig für Erwachsene (30–45) – Nachtblau, ruhiges Blau als Akzent, helle Flächen, feine Umlaufbahnen als einziges Schmuckelement; Schrift Plus Jakarta Sans. Keine Farben von Ländle Digital.

**„Jobbahn“ ist der Arbeitsname (vorher „Passtjob“), Marke und Domain sind noch nicht geprüft.** Alles Markenbezogene steht in `config/marke.json` und lässt sich dort in einer Zeile tauschen. Technische Namen (Worker `passtjob-vergleicher`, Datenbank `passtjob-eu`) bleiben bewusst, damit nichts kaputtgeht. Besucher sehen sie nicht.

## Inhalt

| Pfad | Was |
|---|---|
| `config/marke.json` | Name, Claim, Betreiber, Kontakt, Farben (hell + dunkel), Schriften, Logo, Figur |
| `config/berufe.json` | 15 Jobrichtungen mit Unterberufen, Deeplink-Aliasen und Texten der Richtungsseiten |
| `config/webhooks.json` | Eine Lead-Table-Kachel pro Jobrichtung + Rückfall-URL |
| `schema/felder.json` | **Das Feldschema** – eine Quelle für Formular, Payload und späteren Onboarding-Bogen |
| `src/inhalt.mjs` | Alle Texte aller Seiten |
| `src/vorlagen.mjs` | HTML-Vorlagen |
| `assets/` | `style.css`, `profil.js` (Formular), `fonts/` (selbst gehostet) |
| `build.mjs` | Baut alles nach `dist/` und erzeugt `CONTENT.md` + `SCHEMA.md` |
| `test/formular-test.cjs` | Browser-Test fürs Formular |
| `CONTENT.md` | Alle Texte in einer Datei – **zur Freigabe durchs Team** |
| `SCHEMA.md` | Feldschema als Tabelle |
| `MATCHING.md` | Regeln fürs spätere Matching in der Lead Table |
| `LEAD-TABLE.md` | Was in der Lead Table eingerichtet werden muss |
| `vergleicher/` | **Der Vergleicher**: Stellen-Steckbrief, automatischer Abgleich Bewerber ↔ Stellen, Übergabe an die Firmen (eigene Anleitung: `vergleicher/README.md`) |
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

Build-Befehl `node build.mjs`, Ausgabeverzeichnis `dist`. Die Seite lädt nichts von fremden Servern – die Schrift (Plus Jakarta Sans, SIL Open Font License) liegen in `assets/fonts/`. `sitemap.xml` und `robots.txt` entstehen aus `domain` in `config/marke.json`.

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: Hero mit Beispiel-Match, Ablauf, Vertraulich, Vergleich, 15 Richtungen, Fragen |
| `metall.html` … `helfer.html` | Eine Seite pro Jobrichtung, Ziel für die Anzeigen der jeweiligen Richtung |
| `profil.html` | Kurzprofil (Formular) |
| `datenschutz.html` | **Entwurf** – Freigabe durch Anwalt |
| `impressum.html` | Platzhalter |

## Marke einsetzen

`config/marke.json` ändern, `node build.mjs` – fertig. Name und Platzhalter wie `{marke}` in den Texten ziehen automatisch nach, Farben und Schriften werden als CSS-Variablen nach `assets/marke.css` geschrieben.

- `logo`: Pfad zu einer Datei in `assets/` (z. B. `"assets/logo.svg"`). Leer = Wortmarke mit Platzhalter-Symbol.
- `figur`: Pfad zum Bild der Figur. Leer = nur die Beispiel-Karte im Hero.
- Neue Schrift: Familie und Gewichte eintragen und die passenden `.woff2` als `<familie>-<gewicht>.woff2` nach `assets/fonts/` legen.

## Jobrichtungen pflegen

Bewusst Überbegriffe statt Einzelberufe: Viele Betriebe suchen nicht den einen Beruf, sondern jemanden für eine Richtung. Den genauen Beruf fragt das Formular trotzdem ab (mit „Anderer Beruf“ als Freitext).

| Key | Richtung |
|---|---|
| `metall` | Metall & Maschinenbau |
| `elektro` | Elektro & Mechatronik |
| `shk` | Sanitär, Heizung & Klima |
| `bau` | Bau & Ausbau |
| `holz` | Holz & Innenausbau |
| `kfz` | Kfz & Fahrzeugtechnik |
| `produktion` | Produktion & Montage |
| `lager` | Lager & Logistik |
| `fahrer` | Fahrer & Transport |
| `technik` | Technik & Meister |
| `buero` | Büro & Verwaltung |
| `vertrieb` | Vertrieb & Kundenservice |
| `it` | IT & Digitales |
| `gebaeude` | Haustechnik & Gebäudeservice |
| `helfer` | Helfer & Quereinsteiger |

Ein Eintrag in `config/berufe.json` = eine Richtung mit eigener Seite, eigener Kachel im Formular und eigenem Webhook-Eintrag. Überschrift und Einleitung der Richtungsseite entstehen aus der Vorlage in `src/inhalt.mjs` und dem Feld `ob`. Der Build bricht mit einer klaren Meldung ab, wenn ein Pflichtfeld fehlt.

## Deeplinks für die Anzeigen

| Link | Wirkung | Schritte |
|---|---|---|
| `profil.html` | Start mit Auswahl der Richtung | 14 |
| `profil.html?beruf=metall` | Richtung vorgewählt, Auswahl übersprungen | 13 |
| `profil.html?beruf=elektro&als=mechatroniker` | Richtung **und** Beruf vorgewählt | 12 |
| `profil.html?beruf=cnc` | Aliase aus `config/berufe.json` funktionieren auch (auch die alten Links `zerspanung`, `metall-montage`, `produktion-logistik`) | 13 |

UTM-Parameter (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) werden übernommen und im Payload mitgeschickt. Statt `?beruf=` geht auch `#metall`.

## Das Formular

- **Eine Frage pro Schritt**, große Antwortflächen. Einfache Fragen gehen nach dem Tippen von selbst weiter.
- **Keine K.-o.-Abbrüche.** Jedes vollständige Profil kommt in den Pool, gefiltert wird erst im Matching.
- **Kein Lebenslauf-Upload, keine Altersabfrage** (AGG). Gefragt wird nur, ob ein Lebenslauf nachgereicht werden kann.
- **Sperrliste:** Bewerber können Betriebe ausschließen, z. B. den jetzigen Arbeitgeber. Macht das Versprechen „Dein Chef erfährt nichts“ haltbar.
- **Honeypot** gegen Bots: Ein unsichtbares Feld, das nur Bots ausfüllen – dann wird nichts gesendet.

### Mobile Laufruhe

Beim Schrittwechsel wird nur eine Klasse gewechselt – kein `scrollTo`, kein `scrollIntoView`, kein `focus()`, kein Reload. Der Schrittbereich bekommt per JavaScript die Höhe des höchsten Fragenschritts bei der aktuellen Breite (der Berufsschritt wird dafür mit der längsten Berufsliste gemessen). Die Fehlerzeile hat immer ihren Platz. Dadurch ist jeder Fragenschritt gleich hoch und die Seite kann beim Wechsel nicht springen. Nur der letzte Schritt (Kontakt) ist höher. Die Navigation mit dem Weiter-Button klebt unten am Bildschirm, wenn ein Schritt länger ist als das Handy hoch – sie ist also immer ohne Scrollen erreichbar.

Nachgemessen mit `test/formular-test.cjs` (Chromium, Touch-Emulation), jeweils fünf Wege (ohne Deeplink, Richtung, Richtung + Beruf, Alias, Büro):

| Viewport | Sprünge beim Schrittwechsel | Höhe Fragenschritte | Weiter-Button im Bild |
|---|---|---|---|
| 360 × 640 | 0 | 557–575 px (650 ohne Deeplink) | in jedem Schritt |
| 375 × 667 | 0 | 557–575 px (650 ohne Deeplink) | in jedem Schritt |
| 390 × 844 | 0 | 557–575 px (650 ohne Deeplink) | in jedem Schritt |
| 414 × 896 | 0 | 557–575 px (650 ohne Deeplink) | in jedem Schritt |

Ohne Deeplink ist der erste Schritt (15 Richtungen) der höchste und bestimmt die Höhe aller Schritte. Auf kleinen Handys reichen die Antworten dann unter die klebende Navigation – man scrollt, der Button bleibt sichtbar. Die Werte sind im Vorschau-Modus gemessen. Der Vorschau-Hinweis oben kostet rund 80 px, die live wegfallen.

Test laufen lassen:

```bash
node build.mjs && NODE_PATH=$(npm root -g) node test/formular-test.cjs
```

Der Test prüft außerdem, dass keine Seite auf 360 px seitlich überläuft, Pflichtfeld-Fehler, die erzwungene Einwilligung, die PLZ-Bereinigung („D-70173“ → „70173“), den „Anderer Beruf“-Weg, UTM-Übernahme und dass jedes Payload-Feld gefüllt ist.

## Vergleicher (Matching)

Das Portal ist die Bewerberseite. Die Firmenseite und das automatische Zuordnen übernimmt der **Vergleicher** in `vergleicher/` – ein kleiner Server bei Cloudflare mit eigener Datenbank:

1. Ländle Digital legt im Onboarding für jede Stelle einen **Stellen-Steckbrief** an (dieselben Fragen wie im Bewerberformular, je Punkt Muss/Wunsch/Egal).
2. Jeder neue Bewerber wird sofort mit allen offenen Stellen verglichen, jede neue Stelle mit dem ganzen Pool.
3. Treffer landen in der Lead-Table-Kachel „Matches“ – der Talent Scout ruft an.
4. Sagt der Bewerber ja: Knopf „An Firma übergeben“ → Kachel der Firma.

Ist `api` in `config/webhooks.json` gesetzt, schickt das Portal an den Vergleicher statt direkt an die Lead Table. Einrichtung: `vergleicher/README.md`.

## Lead Table

Gesendet wird **nur** ein vollständiges Profil, per `POST` als flaches JSON – jedes Feld genau einmal, Vor- und Nachname getrennt, kein kombiniertes `name`. Bei CORS-Problemen fällt der Versand auf `no-cors` mit `text/plain` zurück.

Die URL kommt aus `config/webhooks.json`: zuerst die Kachel der gewählten Richtung, sonst `fallback`. Einrichtung Schritt für Schritt: `LEAD-TABLE.md`. **Solange keine URL eingetragen ist, läuft der Vorschau-Modus:** Oben im Formular steht ein Hinweis, und nach dem Absenden zeigt die Seite den Payload an, statt ihn zu senden.

```json
{
  "vorname": "Max",
  "nachname": "Mustermann",
  "telefon": "0151 23456789",
  "email": "max@beispiel.de",
  "berufskategorie": "Metall & Maschinenbau",
  "beruf": "Zerspanungsmechaniker / CNC",
  "abschluss": "Abgeschlossene Ausbildung",
  "erfahrung": "3 bis 5 Jahre",
  "plz": "70173",
  "ort": "Stuttgart",
  "fahrweg": "Bis 30 km",
  "verfuegbarkeit": "In 2 bis 3 Monaten",
  "gehalt": "3.300 bis 3.800 €",
  "schicht": "Vollzeit tagsüber, 2-Schicht",
  "fuehrerschein": "Klasse B",
  "deutsch": "Muttersprache",
  "lebenslauf": "Ja",
  "sperrliste": "Muster GmbH",
  "erreichbarkeit": "Abends",
  "einwilligung": "Ja (ENTWURF 2026-10, 22.10.2026 14:05)",
  "datum": "22.10.2026",
  "quelle": "Bewerberportal Jobbahn",
  "seite": "https://jobbahn.de/profil?beruf=metall&utm_source=meta",
  "utm_source": "meta"
}
```

Alle Felder mit Fragen und Antworten: `SCHEMA.md`.

## Noch zu tun

Siehe `OFFENE-PUNKTE.md` – vor allem Name prüfen, Rechtstexte vom Anwalt, Webhook-URLs eintragen.
