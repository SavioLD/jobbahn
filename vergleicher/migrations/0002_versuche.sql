-- Sicherung gegen Endlosschleifen: höchstens 3 Sendeversuche pro Bewerber/Treffer an die Lead Table.
ALTER TABLE bewerber ADD COLUMN lt_versuche INTEGER NOT NULL DEFAULT 0;
ALTER TABLE matches ADD COLUMN lt_versuche INTEGER NOT NULL DEFAULT 0;
-- Alle bisherigen Bewerber sind in der Pool-Kachel angekommen (zum Teil mehrfach) – nicht erneut senden.
UPDATE bewerber SET lt_gesendet = 1;
