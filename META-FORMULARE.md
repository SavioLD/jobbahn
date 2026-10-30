# Meta-Sofortformulare → Vergleicher → Lead Table

Ziel: Wer ein Sofortformular (Instant Form) auf Facebook/Instagram ausfüllt, landet automatisch im Vergleicher – und von dort wie jedes Website-Profil in der Kachel **„Pool · Alle“** und bei einem Treffer in **„Matches“**. Nichts abtippen.

```
Meta-Sofortformular ──► Make.com ──► Vergleicher (/api/bewerber) ──► Lead Table (Pool, Matches)
```

Nicht direkt Meta → Lead Table verbinden: Dann sieht der Vergleicher den Lead nie und es gibt keine Treffer.

## 1. Das Formular in Meta

**Pflicht** (sonst kein Abgleich möglich):

| Frage im Formular | Art in Meta |
|---|---|
| Vorname, Nachname (oder „Vollständiger Name“) | vorausgefüllte Standardfrage |
| Telefonnummer | vorausgefüllte Standardfrage |
| E-Mail | vorausgefüllte Standardfrage |
| Postleitzahl | vorausgefüllte Standardfrage |

**Jobrichtung:** ein Formular pro Richtung (z. B. „Jobbahn Metall“). Die Richtung steht dann fest in Make, nicht im Formular.

**Empfohlen** (Mehrfachauswahl, Antworten **genau so** schreiben, sonst kann der Vergleicher sie nicht vergleichen):

| Frage | Antworten (wörtlich) | Feld in Make |
|---|---|---|
| Wie weit würdest du zur Arbeit fahren? | Bis 10 km · Bis 20 km · Bis 30 km · Bis 50 km · Egal, wenn der Job passt | `fahrweg` |
| Ab wann könntest du anfangen? | Sofort · In 1 Monat · In 2 bis 3 Monaten · Später als 3 Monate · Weiß ich noch nicht | `verfuegbarkeit` |
| Welche Arbeitszeiten gehen für dich? | Vollzeit tagsüber · Teilzeit · 2-Schicht · 3-Schicht · Wochenende okay · Montage / auswärts okay | `schicht` |
| Wie viele Jahre Berufserfahrung hast du? | Unter 1 Jahr · 1 bis 3 Jahre · 3 bis 5 Jahre · 5 bis 10 Jahre · Über 10 Jahre | `erfahrung` |
| Was ist dein Beruf? | die Berufe der Richtung (siehe `config/berufe.json`) | `beruf` |

Was fehlt, schließt niemanden aus – es steht beim Treffer unter „Prüfen“ und wird am Telefon geklärt.

**Datenschutz:** Im Formular den Link zur Datenschutzerklärung und einen eigenen Hinweis wie im Portal (Einwilligungstext aus `src/inhalt.mjs`) hinterlegen. Rechtstexte gehen ohnehin zum Anwalt.

## 2. Make.com einrichten (einmal pro Formular)

1. Auf make.com anmelden (kostenloser Plan reicht für den Anfang: 1.000 Vorgänge/Monat, pro Lead etwa 2).
2. **Create a new scenario**.
3. Erster Baustein: **Facebook Lead Ads → Watch Leads**. Mit dem Facebook-Konto verbinden, Seite und Formular wählen.
4. Zweiter Baustein: **HTTP → Make a request**:
   - **URL:** `https://passtjob-vergleicher.savio-roeckle.workers.dev/api/bewerber`
   - **Method:** `POST`
   - **Body type:** `Raw`, **Content type:** `JSON (application/json)`
   - **Request content:** die Vorlage unten; die Werte in `{{…}}` per Klick aus dem ersten Baustein einsetzen.
5. **Run once**, ein Test-Lead mit dem [Lead Ads Testing Tool](https://developers.facebook.com/tools/lead-ads-testing) schicken, prüfen: Lead im Vergleicher und in „Pool · Alle“.
6. Szenario auf **ON** stellen.

```json
{
  "first_name": "{{Vorname}}",
  "last_name": "{{Nachname}}",
  "email": "{{E-Mail}}",
  "phone_number": "{{Telefonnummer}}",
  "zip_code": "{{Postleitzahl}}",
  "richtung": "Metall & Maschinenbau",
  "fahrweg": "{{Wie weit würdest du zur Arbeit fahren?}}",
  "verfuegbarkeit": "{{Ab wann könntest du anfangen?}}",
  "schicht": "{{Welche Arbeitszeiten gehen für dich?}}",
  "erfahrung": "{{Wie viele Jahre Berufserfahrung hast du?}}",
  "beruf": "{{Was ist dein Beruf?}}",
  "einwilligung": "Ja (Meta-Sofortformular)",
  "quelle": "Meta-Sofortformular",
  "utm_source": "meta",
  "utm_campaign": "{{Campaign name}}"
}
```

Hinweise:
- Nicht genutzte Zeilen einfach löschen.
- `richtung` darf der Name („Metall & Maschinenbau“), das Kürzel (`metall`) oder ein gängiges Stichwort („Zerspaner“, „Elektriker“) sein.
- Statt Vor- und Nachname geht auch `"full_name": "{{Vollständiger Name}}"`.
- Die PLZ darf auch „D-78564“ o. Ä. sein – der Vergleicher nimmt die fünf Ziffern.
- Wer sich doppelt meldet (gleiche E-Mail oder Telefonnummer), wird aktualisiert statt doppelt angelegt.
