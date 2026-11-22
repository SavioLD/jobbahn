# Feldschema

> Erzeugt von `build.mjs` aus `schema/felder.json`. Eine Quelle für Bewerberformular, Lead-Table-Payload und den späteren Onboarding-Bogen der Betriebe.

| # | Feld (Payload) | Frage an Bewerber | Antworten | Frage an Betrieb (Onboarding) | Matching |
|---|---|---|---|---|---|
| 1 | `berufskategorie` | In welchem Bereich arbeitest du? | Metall & Maschinenbau · Elektro & Mechatronik · Sanitär, Heizung & Klima · Bau & Ausbau · Holz & Innenausbau · Kfz & Fahrzeugtechnik · Produktion & Montage · Lager & Logistik · Fahrer & Transport · Technik & Meister · Büro & Verwaltung · Vertrieb & Kundenservice · IT & Digitales · Haustechnik & Gebäudeservice · Helfer & Quereinsteiger | In welchem Bereich ist die Stelle? | Pflicht – sortiert den Pool |
| 2 | `beruf` | Was ist dein Beruf? | Berufe der Kategorie · Anderer Beruf | Welcher Beruf wird gesucht? | Muss |
| 3 | `taetigkeit` | Was machst du in deinem Job hauptsächlich? | An der Maschine (bedienen / einrichten) · Montage / Zusammenbau · Programmieren (CNC / SPS / Roboter) · Instandhaltung / Wartung / Reparatur · Qualitätsprüfung / Messtechnik · Konstruktion / Entwicklung / Planung · Projekt- oder Teamleitung · Kundendienst / Service beim Kunden · Handwerk auf der Baustelle · Lager / Logistik / Fahren · Büro / Kaufmännisch / Vertrieb · IT / Software · Helfertätigkeiten | Was macht die Person in der Stelle hauptsächlich? | Muss oder Wunsch – mindestens eine Tätigkeit muss übereinstimmen |
| 4 | `aufgaben` | Beschreib kurz, was du genau machst. | Freitext, freiwillig | Aufgaben der Stelle | Info fürs Telefonat |
| 5 | `wunsch_taetigkeit` | Was willst du im neuen Job unbedingt machen? | An der Maschine (bedienen / einrichten) · Montage / Zusammenbau · Programmieren (CNC / SPS / Roboter) · Instandhaltung / Wartung / Reparatur · Qualitätsprüfung / Messtechnik · Konstruktion / Entwicklung / Planung · Projekt- oder Teamleitung · Kundendienst / Service beim Kunden · Handwerk auf der Baustelle · Lager / Logistik / Fahren · Büro / Kaufmännisch / Vertrieb · IT / Software · Helfertätigkeiten | Was macht die Person in der Stelle hauptsächlich? | Muss – mindestens eine Tätigkeit der Stelle muss die Person machen wollen |
| 6 | `wunsch_aufgaben` | Welche Aufgabe oder Position willst du neu übernehmen? | Freitext, freiwillig | – | Info fürs Telefonat |
| 7 | `abschluss` | Was ist dein höchster Abschluss in dem Beruf? | Abgeschlossene Ausbildung · Meister · Techniker · Studium · Kein Abschluss, aber Berufserfahrung · Noch in Ausbildung | Welcher Abschluss ist mindestens nötig? | Muss oder Wunsch |
| 8 | `erfahrung` | Wie viele Jahre Berufserfahrung hast du? | Unter 1 Jahr · 1 bis 3 Jahre · 3 bis 5 Jahre · 5 bis 10 Jahre · Über 10 Jahre | Wie viel Berufserfahrung ist nötig? | Muss oder Wunsch |
| 9 | `plz`, `ort` | Wo wohnst du? | PLZ (5 Ziffern) + Ort | Wo ist der Einsatzort? | Muss – zusammen mit Fahrweg |
| 10 | `fahrweg` | Wie weit würdest du zur Arbeit fahren? | Bis 10 km · Bis 20 km · Bis 30 km · Bis 50 km · Egal, wenn der Job passt | Bis zu welchem Fahrweg kommen Bewerber in Frage? | Muss |
| 11 | `verfuegbarkeit` | Ab wann könntest du anfangen? | Sofort · In 1 Monat · In 2 bis 3 Monaten · Später als 3 Monate · Weiß ich noch nicht | Ab wann soll die Person anfangen? | Wunsch |
| 12 | `gehalt` | Was willst du im Monat verdienen? | Bis 2.800 € · 2.800 bis 3.300 € · 3.300 bis 3.800 € · 3.800 bis 4.300 € · Über 4.300 € · Lieber am Telefon | Gehaltsrahmen von – bis (brutto/Monat) | Muss – Wunsch muss im Rahmen liegen |
| 13 | `schicht` | Welche Arbeitszeiten gehen für dich? | Vollzeit tagsüber · Teilzeit · 2-Schicht · 3-Schicht · Wochenende okay · Montage / auswärts okay | Arbeitszeitmodell der Stelle | Muss |
| 14 | `fuehrerschein` | Welche Führerscheine hast du? | Keinen · Klasse B · Klasse BE · Klasse C / CE · Staplerschein | Welcher Führerschein ist nötig? | Muss oder Wunsch |
| 15 | `deutsch` | Wie gut sprichst du Deutsch? | Muttersprache · Sehr gut · Gut – im Alltag kein Problem · Grundkenntnisse | Welche Deutschkenntnisse sind nötig? | Muss oder Wunsch |
| 16 | `lebenslauf` | Hast du einen Lebenslauf, den du nachreichen könntest? | Ja · Nein · Kann ich schnell machen | Lebenslauf vor dem Gespräch nötig? | Info – kein Kriterium |
| 17 | `sperrliste` | Gibt es Betriebe, bei denen wir dich nicht vorstellen sollen? | Freitext, freiwillig | – | Ausschluss – dort nie vorschlagen |
| 18 | `vorname`, `nachname`, `telefon`, `email`, `erreichbarkeit`, `einwilligung` | Wie erreichen wir dich? | Vorname · Nachname · Handynummer · E-Mail · Erreichbarkeit · Einwilligung | – | – |

Mehrfachantworten kommen kommagetrennt in einem Feld an. Leere freiwillige Felder werden als `–` gesendet.

## Zusatzfelder im Payload

| Feld | Inhalt |
|---|---|
| `richtung` | Key der Jobrichtung, z. B. `buero` (für den Vergleicher) |
| `berufskategorie` | Name der Jobrichtung (bestimmt auch die Lead-Table-Kachel) |
| `datum` | TT.MM.JJJJ |
| `quelle` | „Bewerberportal Fachkräfte Kompass“ |
| `seite` | URL, über die das Profil abgeschickt wurde |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | nur wenn in der URL vorhanden |
