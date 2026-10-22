# Offene Punkte

## Entscheiden

- [ ] **Name.** „Passtjob“ ist Arbeitstitel. Domain und Marke beim DPMA prüfen. Austausch: eine Zeile in `config/marke.json`.
- [ ] **Logo und Figur.** Aktuell Platzhalter-Symbol (Welle in der Bohrung = Passung). Logo-Datei und später die Figur in `config/marke.json` eintragen (`logo`, `figur`, Pfad z. B. `assets/figur.png`). Die Figur erscheint dann im Hero hinter der Beispiel-Karte (Hochformat, freigestellt, ca. 4:5). Der Bild-Slot ist gebaut, aber mangels Bild noch nicht im Browser geprüft.
- [ ] **15 Jobrichtungen.** Richtungen und Unterberufe sind ein Vorschlag. Kürzen, ergänzen oder umbenennen in `config/berufe.json`.
- [ ] **Gehaltsspannen.** Die fünf Spannen im Formular (bis 2.800 € bis über 4.300 €) sind gesetzt, nicht recherchiert. Mit echten Stellen abgleichen.
- [ ] **Zusage im Text.** Die Seite verspricht: „Kein Betrieb erfährt deinen Namen, bevor wir mit dir telefoniert haben und du einverstanden bist.“ Das muss im Ablauf des Talent Scouts fest so laufen.
- [ ] **„Für Betriebe“-Link** im Footer zeigt auf laendle-digital.com. Eigene Seite für Betriebe gewünscht?

## Recht – vor dem Livegang

- [ ] Einwilligungstext und Datenschutz sind **Entwürfe** (Version „ENTWURF 2026-10“). Anwalt: Talentpool-Einwilligung, Löschfrist, gesonderte Einwilligung für die Weitergabe an den Betrieb, Auftragsverarbeitung.
- [ ] Impressum: Anschrift, Rechtsform, Registerdaten fehlen.
- [ ] Das Wort „Vermittlung“ kommt bewusst nicht vor, bis geklärt ist, wie wir uns rechtlich aufstellen (Gewerbe, SGB III).
- [ ] Meta-Pixel und Statistik sind **nicht** eingebaut. Vor dem Einbau ein Einwilligungs-Banner einsetzen. Der Aufruf `fbq("track", "Lead")` beim Absenden ist vorbereitet und greift nur, wenn der Pixel geladen ist.

## Technik

- [ ] Lead Table einrichten (siehe `LEAD-TABLE.md`) und die Webhook-URLs in `config/webhooks.json` eintragen (eine pro Richtung oder nur `fallback`). Solange leer: Vorschau-Modus.
- [ ] Hosting auf Cloudflare Pages einrichten (Build-Befehl `node build.mjs`, Ausgabe `dist`).
- [ ] Social-Vorschaubild (`og:image`) fehlt – kommt mit der Marke.
- [ ] Bestätigungs-SMS oder -Mail nach dem Absenden? Aktuell nicht vorgesehen, der Danke-Screen sagt, was als Nächstes passiert.

## Bewusst nicht in Version 1

Finale Marke und Figur · Onboarding-Bogen für Betriebe (nutzt später dieselben Felder) · Matching-Logik (Spezifikation in `MATCHING.md`) · Anzeigen-Creatives · Lebenslauf-Upload · Login oder Bewerberkonto.
