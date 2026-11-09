-- „Fahrweg egal“ gilt jetzt bis 75 km (oder bis zum Umkreis der Firma, falls größer).
-- Unbearbeitete Treffer, die weiter weg sind, entfernen – bearbeitete bleiben dokumentiert.
DELETE FROM matches
WHERE status IN ('neu', 'gesperrt') AND entfernung_km > 75
  AND entfernung_km > COALESCE((SELECT CAST(json_extract(s.daten, '$.umkreis') AS REAL) FROM stellen s WHERE s.id = matches.stelle_id), 0);
