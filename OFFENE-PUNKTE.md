# Offene Punkte

## Entscheiden

- [ ] **Name.** „Passtjob“ ist Arbeitstitel. Domain und Marke beim DPMA prüfen. Austausch: eine Zeile in `config/marke.json`.
- [ ] **Logo und Figur.** Aktuell Platzhalter-Symbol (Welle in der Bohrung = Passung). Logo-Datei und später die Figur in `config/marke.json` eintragen (`logo`, `figur`, Pfad z. B. `assets/figur.png`). Die Figur erscheint dann im Hero hinter der Beispiel-Karte (Hochformat, freigestellt, ca. 4:5). Der Bild-Slot ist gebaut, aber mangels Bild noch nicht im Browser geprüft.
- [ ] **15 Jobrichtungen.** Richtungen und Unterberufe sind ein Vorschlag. Kürzen, ergänzen oder umbenennen in `config/berufe.json`.
- [ ] **Gehaltsspannen.** Die fünf Spannen im Formular (bis 2.800 € bis über 4.300 €) sind gesetzt, nicht recherchiert. Mit echten Stellen abgleichen.
- [ ] **Zusage im Text.** Die Seite verspricht: „Kein Betrieb erfährt deinen Namen, bevor wir mit dir telefoniert haben und du einverstanden bist.“ Das muss im Ablauf des Talent Scouts fest so laufen.
- [ ] **„Für Betriebe“-Link** im Footer zeigt auf laendle-digital.com. Eigene Seite für Betriebe gewünscht?

## Recht – vor dem Livegang

- [ ] Einwilligungstext und Datenschutz sind **Entwürfe** (Version „ENTWURF 2026-10“). Anwalt: Talentpool-Einwilligung, Löschfrist, gesonderte Einwilligung für die Weitergabe an den Betrieb, Auftragsverarbeitung (Cloudflare für den Vergleicher, Lead Table).
- [ ] Die Weitergabe-Zustimmung holt der Talent Scout am Telefon ein (der Vergleicher fragt vor jeder Übergabe nach). Mit dem Anwalt klären, wie sie dokumentiert wird – aktuell als Notiz zum Treffer.
- [ ] Impressum: Anschrift, Rechtsform, Registerdaten fehlen.
- [ ] Das Wort „Vermittlung“ kommt bewusst nicht vor, bis geklärt ist, wie wir uns rechtlich aufstellen (Gewerbe, SGB III).
- [ ] Meta-Pixel und Statistik sind **nicht** eingebaut. Vor dem Einbau ein Einwilligungs-Banner einsetzen. Der Aufruf `fbq("track", "Lead")` beim Absenden ist vorbereitet und greift nur, wenn der Pixel geladen ist.

## Technik

**Stand 23.10.2026:**
- Portal live auf GitHub Pages: https://saviold.github.io/jobkollege/ (noindex, bis Marke und Recht stehen).
- Vergleicher live: https://passtjob-vergleicher.savio-roeckle.workers.dev/intern (Cloudflare-Konto Ländle Digital, D1-Datenbank `passtjob-eu` in der EU). Das Portal sendet an ihn (`api` in `config/webhooks.json`).
- GitHub-Secrets `CLOUDFLARE_API_TOKEN` und `VERGLEICHER_PASSWORT` sind gesetzt. Jeder Deploy prüft danach Erreichbarkeit, Passwortschutz und Datenbank (Schritt „Läuft er?“).
- In der Lead Table gibt es den Kunden „Bewerberpool“ mit den Kacheln „Pool · Alle“ und „Matches“.

Offen:
- [ ] Die beiden Kachel-Adressen im Vergleicher unter **Einstellungen** eintragen (nicht in `config/webhooks.json` – das Repo ist öffentlich), dann den Test aus `LEAD-TABLE.md` Abschnitt 7 machen.
- [ ] Cloudflare-API-Token erneuern (war auf einem Screenshot zu sehen): Cloudflare → My Profile → API Tokens → beim Token „Roll“ → neuen Wert in GitHub als Secret `CLOUDFLARE_API_TOKEN` überschreiben.
- [ ] Alte, leere D1-Datenbank `passtjob` (Region ENAM, aus dem ersten Lauf) in Cloudflare löschen: Storage & Databases → D1 → `passtjob` → Settings → Delete. **Nicht** `passtjob-eu`.
- [ ] Erste echte Firmen: pro Firma Kunde + Kachel in der Lead Table wie bisher, Stelle im Vergleicher mit „Neue Stelle“ anlegen, Webhook der Firmen-Kachel in den Steckbrief.
- [ ] Eigene Domain: später Hosting auf Cloudflare Pages (Build-Befehl `node build.mjs`, Ausgabe `dist`), Domain in `ERLAUBTE_ORIGINS` (`vergleicher/wrangler.toml`) steht schon für passtjob.de.
- [ ] Social-Vorschaubild (`og:image`) fehlt – kommt mit der Marke.
- [ ] Bestätigungs-SMS oder -Mail nach dem Absenden? Aktuell nicht vorgesehen, der Danke-Screen sagt, was als Nächstes passiert.

## Bewusst nicht in Version 1

Finale Marke und Figur · Anzeigen-Creatives · Lebenslauf-Upload · Login oder Bewerberkonto für Bewerber · Steckbrief, den die Firma selbst ausfüllt (aktuell füllt ihn Ländle Digital im Onboarding aus).
