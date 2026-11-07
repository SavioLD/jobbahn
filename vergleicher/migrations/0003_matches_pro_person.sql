-- Kachel „Matches“: jede Person nur noch EINMAL – alle passenden Stellen in einem Eintrag.
-- matches_lt = 1: Person ist schon in der Kachel „Matches“ (weitere Treffer stehen im Vergleicher).
ALTER TABLE bewerber ADD COLUMN matches_lt INTEGER NOT NULL DEFAULT 0;
UPDATE bewerber SET matches_lt = 1 WHERE id IN (SELECT bewerber_id FROM matches WHERE lt_gesendet = 1);
