# Matching – Spezifikation

> **Umgesetzt im Vergleicher** (`vergleicher/src/matching.js`, getestet in `vergleicher/test/matching.test.mjs`). Das Portal liefert die Profile, der Stellen-Steckbrief im Vergleicher die Stellen – beide mit denselben Feldern aus `schema/felder.json` (Übersicht in `SCHEMA.md`). Die Treffer gehen in die Lead-Table-Kachel „Matches“.

## Grundsatz

**Muss-Kriterien filtern. Wunsch-Kriterien geben Punkte. Ein Mensch entscheidet.**

Das Matching ist bewusst regelbasiert. Keine KI bewertet oder sortiert Bewerber nach eigenem Ermessen – nach dem EU-KI-Gesetz wäre das ein Hochrisiko-System mit deutlich mehr Pflichten. Die Software schlägt vor, der Talent Scout entscheidet und ruft an.

## Ablauf

1. **Ausschluss:** Steht der Betrieb auf der Sperrliste des Bewerbers (`sperrliste`), wird das Profil für diese Stelle nie angezeigt.
2. **Filter (Muss):** Jedes Feld, das der Betrieb im Onboarding als Muss markiert hat, muss erfüllt sein. Sonst kein Match.
3. **Punkte (Wunsch):** Jedes erfüllte Wunsch-Kriterium gibt einen Punkt. Die Punkte bestimmen nur die Reihenfolge der Vorschläge.
4. **Telefon-Check:** Der Talent Scout ruft in der Reihenfolge an, prüft die Angaben und fragt, ob der Bewerber vorgestellt werden will.
5. **Übergabe:** Erst nach dem Ja geht das Profil an den Betrieb.

## Regeln je Feld

| Feld | Muss erfüllt, wenn … |
|---|---|
| `berufskategorie` | gleich der Richtung der Stelle (sortiert den Pool, ist immer Muss) |
| `beruf` | in der Liste der Berufe, die der Betrieb akzeptiert – **oder „egal“**: Viele Betriebe suchen nur in einer Richtung, nicht den einen Beruf. Dann filtert nur die Richtung. „Anderer Beruf“-Freitext prüft der Talent Scout von Hand |
| `abschluss` | mindestens die geforderte Stufe. Vorschlag für die Reihenfolge: in Ausbildung < ohne Abschluss mit Erfahrung < Ausbildung < Meister = Techniker < Studium |
| `erfahrung` | Untergrenze der gewählten Spanne ≥ geforderte Jahre |
| `plz` + `fahrweg` | Entfernung Wohnort → Einsatzort ≤ gewählter Fahrweg. „Egal“ = kein Limit |
| `verfuegbarkeit` | Start des Bewerbers ≤ gewünschter Start des Betriebs (als Wunsch empfohlen, nicht als Muss) |
| `gehalt` | Wunsch-Spanne überschneidet sich mit dem Gehaltsrahmen der Stelle. „Lieber am Telefon“ = nicht filtern, Talent Scout klärt |
| `schicht` | Das Arbeitszeitmodell der Stelle ist in der Auswahl des Bewerbers enthalten (inkl. „Teilzeit“ und „Vollzeit tagsüber“) |
| `fuehrerschein` | Geforderte Klasse ist enthalten |
| `deutsch` | mindestens die geforderte Stufe |
| `lebenslauf` | kein Kriterium – nur Info, ob der Talent Scout ihn anfordern muss |

## Offene Fragen

- **PLZ → Entfernung (gelöst):** Mittelpunkte aller 8.298 deutschen PLZ (WZB, Apache 2.0), Luftlinie × 1,3 als geschätzte Fahrstrecke. Unbekannte neue PLZ: Mittel der PLZ mit gleichem Anfang. Unklare Entfernung schließt nicht aus, sondern wird als „?“ markiert.
- **Mehrere Muss bei Mehrfachfeldern (so umgesetzt):** Fordert ein Betrieb z. B. Führerschein B **und** Staplerschein, müssen beide in der Auswahl stehen.
- **Sperrliste (so umgesetzt):** Steht ein markantes Wort des Firmennamens (ab 4 Zeichen, Rechtsform ignoriert, Umlaute egal) auf der Sperrliste des Bewerbers, wird er für diese Firma ausgeschlossen. Lieber einmal zu viel sperren. Ausgeschlossene sieht man im Vergleicher eingeklappt unter der Stelle.
- **Unklare Angaben** (eigener Beruf als Freitext, „Gehalt lieber am Telefon“, unbekannte Verfügbarkeit) schließen nie aus – sie stehen als „?“ in der Spalte `pruefen` für das Telefonat.
- **Pool-Größe sichtbar machen:** Für das Onboarding (Folie „Was wirklich zählt“) wäre eine Zahl hilfreich: Wie viele Profile bleiben bei diesen Muss-Kriterien übrig?
