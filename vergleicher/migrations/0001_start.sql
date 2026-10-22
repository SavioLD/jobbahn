-- Vergleicher: Bewerberpool, offene Stellen und die Treffer dazwischen.

CREATE TABLE IF NOT EXISTS bewerber (
  id           TEXT PRIMARY KEY,
  erstellt     TEXT NOT NULL,
  aktualisiert TEXT NOT NULL,
  richtung     TEXT NOT NULL,
  email        TEXT,
  telefon      TEXT,
  plz          TEXT,
  lat          REAL,
  lon          REAL,
  daten        TEXT NOT NULL,           -- der komplette Payload aus dem Portal (JSON)
  lt_gesendet  INTEGER NOT NULL DEFAULT 0  -- 1 = in der Pool-Kachel der Lead Table angekommen
);
CREATE INDEX IF NOT EXISTS bewerber_richtung ON bewerber (richtung);
CREATE INDEX IF NOT EXISTS bewerber_email ON bewerber (email);

CREATE TABLE IF NOT EXISTS stellen (
  id           TEXT PRIMARY KEY,
  erstellt     TEXT NOT NULL,
  aktualisiert TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'offen',   -- offen | pausiert | besetzt
  firma        TEXT NOT NULL,
  titel        TEXT NOT NULL,
  richtung     TEXT NOT NULL,
  plz          TEXT,
  lat          REAL,
  lon          REAL,
  daten        TEXT NOT NULL            -- der Stellen-Steckbrief (JSON)
);
CREATE INDEX IF NOT EXISTS stellen_richtung ON stellen (richtung, status);

CREATE TABLE IF NOT EXISTS matches (
  id            TEXT PRIMARY KEY,
  erstellt      TEXT NOT NULL,
  bewerber_id   TEXT NOT NULL,
  stelle_id     TEXT NOT NULL,
  punkte        INTEGER NOT NULL,
  max_punkte    INTEGER NOT NULL,
  entfernung_km INTEGER,
  gruende       TEXT NOT NULL,          -- JSON-Liste der geprüften Kriterien
  status        TEXT NOT NULL DEFAULT 'neu',  -- neu | angerufen | uebergeben | kein_interesse | passt_nicht | gesperrt
  notiz         TEXT,
  lt_gesendet   INTEGER NOT NULL DEFAULT 0,   -- 1 = in der Lead-Table-Kachel „Matches“ angekommen
  UNIQUE (bewerber_id, stelle_id)
);
CREATE INDEX IF NOT EXISTS matches_ausgang ON matches (lt_gesendet, status);
CREATE INDEX IF NOT EXISTS matches_stelle ON matches (stelle_id);
CREATE INDEX IF NOT EXISTS matches_bewerber ON matches (bewerber_id);

CREATE TABLE IF NOT EXISTS einstellungen (
  schluessel TEXT PRIMARY KEY,
  wert       TEXT NOT NULL
);
