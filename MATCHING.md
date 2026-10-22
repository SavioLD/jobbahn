# Matching – Spezifikation

> Gilt für das spätere Matching in der Lead Table. Das Portal liefert dafür die Profile, der Onboarding-Bogen die Stellen – beide mit denselben Feldern aus `schema/felder.json` (Übersicht in `SCHEMA.md`).

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
| `berufskategorie` | gleich der Kategorie der Stelle (sortiert den Pool, ist immer Muss) |
| `beruf` | in der Liste der Berufe, die der Betrieb akzeptiert. „Anderer Beruf“-Freitext prüft der Talent Scout von Hand |
| `abschluss` | mindestens die geforderte Stufe. Vorschlag für die Reihenfolge: in Ausbildung < ohne Abschluss mit Erfahrung < Ausbildung < Meister = Techniker < Studium |
| `erfahrung` | Untergrenze der gewählten Spanne ≥ geforderte Jahre |
| `plz` + `fahrweg` | Entfernung Wohnort → Einsatzort ≤ gewählter Fahrweg. „Egal“ = kein Limit |
| `verfuegbarkeit` | Start des Bewerbers ≤ gewünschter Start des Betriebs (als Wunsch empfohlen, nicht als Muss) |
| `gehalt` | Wunsch-Spanne überschneidet sich mit dem Gehaltsrahmen der Stelle. „Lieber am Telefon“ = nicht filtern, Talent Scout klärt |
| `schicht` | Das Arbeitszeitmodell der Stelle ist in der Auswahl des Bewerbers enthalten |
| `fuehrerschein` | Geforderte Klasse ist enthalten |
| `deutsch` | mindestens die geforderte Stufe |
| `lebenslauf` | kein Kriterium – nur Info, ob der Talent Scout ihn anfordern muss |

## Offene Fragen

- **PLZ → Entfernung:** Die Lead Table braucht eine Entfernungsberechnung. Möglichkeiten: PLZ-Mittelpunkte (OpenGeoDB, frei) und Luftlinie mal Faktor 1,3 als Fahrweg-Schätzung – oder ein Routing-Dienst. Luftlinie reicht für den Filter, der Talent Scout prüft im Gespräch.
- **Mehrere Muss bei Mehrfachfeldern:** Fordert ein Betrieb z. B. Führerschein B **und** Staplerschein, müssen beide in der Auswahl stehen.
- **Pool-Größe sichtbar machen:** Für das Onboarding (Folie „Was wirklich zählt“) wäre eine Zahl hilfreich: Wie viele Profile bleiben bei diesen Muss-Kriterien übrig?
