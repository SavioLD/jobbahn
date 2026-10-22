# Vergleicher

Bringt Bewerber und Stellen zusammen – automatisch, in beide Richtungen.

```
Bewerber füllt Portal aus ──┐
                            ├──►  VERGLEICHER  ──►  Lead Table, Kachel „Matches“
Stellen-Steckbrief ─────────┘     (Cloudflare)          │
                                                        ▼
                                              Talent Scout ruft Bewerber an
                                                        │ Bewerber sagt ja
                                                        ▼
                                              „An Firma übergeben“ → Kachel der Firma
```

- **Neuer Bewerber** → wird gespeichert, in die Pool-Kachel der Lead Table kopiert und sofort mit allen offenen Stellen seiner Richtung verglichen.
- **Neue Stelle** (Steckbrief im internen Bereich) → wird sofort mit dem ganzen Pool verglichen.
- **Jeder Treffer** landet in der Lead-Table-Kachel „Matches“ – mit Firma, Entfernung und Begründung („✓ 19 km Fahrweg · ✓ Gehalt · ✗ Staplerschein (Wunsch)“).
- **Übergabe** nach dem Telefonat: ein Knopf im internen Bereich schickt den Bewerber in die Lead-Table-Kachel der Firma.

Die Regeln (Muss filtert, Wunsch gibt Punkte, ein Mensch entscheidet) stehen in `../MATCHING.md` und im Code in `src/matching.js`.

## Was wo liegt

| Pfad | Was |
|---|---|
| `src/index.js` | Der Worker: Bewerber annehmen, Stellen speichern, vergleichen, an die Lead Table senden, Wartung |
| `src/matching.js` | Die Vergleichsregeln (reine Funktionen) |
| `src/intern.html` | Interne Oberfläche: Stellen, Steckbrief, Treffer, Übergabe, Einstellungen |
| `src/intern-seite.js` | Aus `intern.html` erzeugt (`node seite-bauen.mjs`) – nicht von Hand ändern |
| `migrations/` | Datenbank-Tabellen (Cloudflare D1) |
| `daten/plz-de.json` | Koordinaten aller 8.298 deutschen PLZ (Quelle: [WZB, plz_geocoord](https://github.com/WZBSocialScienceCenter/plz_geocoord), Apache 2.0) |
| `test/` | Tests (Regeln + kompletter Ablauf mit Datenbank) |
| `lokal.mjs` | Den Vergleicher ohne Cloudflare auf dem eigenen Rechner starten |
| `wrangler.toml` | Cloudflare-Konfiguration |

## Einrichten (einmalig, ca. 15 Minuten)

Der Deploy läuft automatisch über GitHub, sobald drei Secrets hinterlegt sind.

**1. Cloudflare-Konto.** Das Konto, auf dem laendle-digital.com läuft, reicht. Der kostenlose Tarif genügt für den Start.

**2. API-Token in Cloudflare anlegen.**
- Oben rechts auf das Profil → **My Profile** → **API Tokens** → **Create Token**
- Vorlage **„Edit Cloudflare Workers“** wählen
- Unter *Permissions* eine Zeile ergänzen: **Account · D1 · Edit**
- Erstellen und den Token kopieren (wird nur einmal angezeigt)

**3. Account-ID kopieren.** In Cloudflare links **Workers & Pages** öffnen – rechts steht die **Account ID**.

**4. Secrets in GitHub eintragen.** Im Repo `jobkollege`: **Settings → Secrets and variables → Actions → New repository secret**

| Name | Inhalt |
|---|---|
| `CLOUDFLARE_API_TOKEN` | der Token aus Schritt 2 |
| `CLOUDFLARE_ACCOUNT_ID` | die ID aus Schritt 3 |
| `VERGLEICHER_PASSWORT` | ein langes Passwort für den internen Bereich (selbst ausdenken, z. B. 4 zufällige Wörter) |

**5. Starten.** Im Repo **Actions → Vergleicher → Run workflow**. Der Lauf legt die Datenbank an, deployt und setzt das Passwort. Im Log von „Deploy“ steht die Adresse, z. B. `https://passtjob-vergleicher.<name>.workers.dev`.

**6. Portal verbinden.** Die Adresse in `config/webhooks.json` unter `"api"` eintragen, `node build.mjs --pages`, committen. Ab dann schickt das Portal jedes Profil an den Vergleicher.

**7. Lead Table eintragen.** `https://…workers.dev/intern` öffnen, mit dem Passwort anmelden, unter **Einstellungen** die Kachel-Adressen eintragen (siehe `../LEAD-TABLE.md`).

Danach läuft jede Änderung an `vergleicher/`, `config/berufe.json` oder `schema/felder.json` automatisch: Tests, dann Deploy.

## Lokal ausprobieren

```bash
cd vergleicher
npm run lokal          # → http://localhost:8787/intern, Passwort „lokal“
npm test               # 21 Tests: Regeln und kompletter Ablauf
```

Lokal nutzt der Vergleicher statt D1 eine SQLite-Datei (`lokal.sqlite`, nicht im Repo). Lead-Table-Adressen müssen mit `https://` beginnen; zum Testen gegen einen lokalen Server `LOKALE_ZIELE=1` setzen.

## Was geprüft ist – und was nicht

Geprüft:
- 21 automatische Tests: alle Regeln einzeln und der ganze Ablauf (Einstellungen → Stelle → Bewerber → Treffer → Übergabe → Löschen → Wartung, Ausfall der Lead Table, Sperrliste, Doppel-Anmeldungen).
- Ende-zu-Ende im Browser: interne Oberfläche bedienen, Bewerber über das Portal am Handy, Treffer und Übergabe kommen in einer nachgebauten Lead Table an.
- In der echten Cloudflare-Laufzeit lokal (`wrangler dev` mit D1): Seite, Passwortschutz, Stelle, Bewerber, Treffer, Cron.

**Nicht geprüft:** der Deploy in ein echtes Cloudflare-Konto und die echte Lead Table – dafür fehlt hier der Zugang. Beim ersten Lauf von Schritt 5 also kurz ins Log schauen.

## Gut zu wissen

- **Grenzen im kostenlosen Tarif:** 100.000 Anfragen am Tag und 10 ms Rechenzeit pro Anfrage. Für einen Pool mit einigen hundert Bewerbern pro Richtung reicht das. Wird der Pool groß und das Speichern einer Stelle bricht mit einem Fehler ab, auf **Workers Paid** wechseln (5 $ im Monat, 30 s Rechenzeit).
- **Lead Table ausgefallen?** Treffer bleiben im Ausgang und werden alle 15 Minuten nachgeschickt. Der letzte Fehler steht oben in der Übersicht.
- **Passwortschutz:** Der interne Bereich hat ein Passwort. Wer mehr will, schaltet **Cloudflare Access** davor (Login per E-Mail-Code, bis 50 Personen kostenlos).
- **Datenschutz:** Der Vergleicher speichert Bewerberdaten bei Cloudflare. Das gehört in den Datenschutztext und in die Auftragsverarbeitung (Anwalt). Profile werden nach der Löschfrist (Einstellungen, Standard 12 Monate) automatisch gelöscht; auf Anfrage einzeln unter Einstellungen → „Bewerber löschen“.
