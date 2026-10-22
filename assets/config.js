/* Erzeugt von build.mjs – nicht von Hand ändern. */
window.PASSTJOB = {
  "marke": {
    "name": "Passtjob"
  },
  "texte": {
    "meta": {
      "titel": "Kurzprofil anlegen – Passtjob",
      "beschreibung": "Leg in zwei Minuten dein Kurzprofil an. Kostenlos, vertraulich, ohne Lebenslauf."
    },
    "kopf": "Kurzprofil",
    "abbrechen": "Zur Startseite",
    "vorschau": "Vorschau-Modus: Das Formular ist noch nicht mit der Lead Table verbunden. Nach dem Absenden siehst du, was ankommen würde.",
    "schritt": "Schritt {n} von {gesamt}",
    "weiter": "Weiter",
    "zurueck": "Zurück",
    "ueberspringen": "Überspringen",
    "senden": "Profil absenden",
    "sendet": "Wird gesendet …",
    "andererBeruf": "Anderer Beruf",
    "andererBerufLabel": "Welcher Beruf?",
    "plzLabel": "Postleitzahl",
    "ortLabel": "Ort",
    "erreichbarkeitLabel": "Wann erreichen wir dich am besten?",
    "fehler": {
      "auswahl": "Bitte wähl eine Antwort aus.",
      "mehrfach": "Bitte wähl mindestens eine Antwort aus.",
      "beruf": "Bitte schreib deinen Beruf kurz dazu.",
      "plz": "Bitte gib eine Postleitzahl mit fünf Ziffern ein.",
      "ort": "Bitte gib deinen Wohnort ein.",
      "vorname": "Bitte gib deinen Vornamen ein.",
      "nachname": "Bitte gib deinen Nachnamen ein.",
      "telefon": "Bitte gib eine Telefonnummer ein, unter der wir dich erreichen.",
      "email": "Bitte prüf deine E-Mail-Adresse.",
      "einwilligung": "Ohne dein Okay dürfen wir dein Profil nicht speichern.",
      "senden": "Das hat nicht geklappt. Bitte prüf deine Verbindung und tipp noch mal auf „Profil absenden“."
    },
    "einwilligung": "Ich bin einverstanden, dass Ländle Digital mein Profil speichert, mit offenen Stellen abgleicht und mich dazu anruft oder anschreibt. An einen Betrieb geht mein Profil erst, wenn wir telefoniert haben und ich zugestimmt habe. Ich kann das jederzeit widerrufen.",
    "einwilligungLink": "Datenschutz",
    "einwilligungVersion": "ENTWURF 2026-10",
    "danke": {
      "h1": "Danke, {vorname}. Dein Profil ist angelegt.",
      "schritte": [
        "Wir gleichen dein Profil mit offenen Stellen in deiner Region ab.",
        "Passt ein Job, rufen wir dich an{erreichbarkeit}.",
        "Erst wenn du einverstanden bist, erfährt ein Betrieb von dir."
      ],
      "loeschen": "Profil löschen lassen: kurze Mail an [E-Mail-Adresse].",
      "vorschauH": "Vorschau-Modus: Das käme in der Lead Table an",
      "vorschauText": "Kachel: {kachel}",
      "nochmal": "Weiteres Profil anlegen"
    }
  },
  "berufe": [
    {
      "key": "zerspanung",
      "name": "Zerspanung",
      "kurz": "Dreher, Fräser, Zerspaner",
      "aliase": [
        "cnc",
        "fraeser",
        "fraesen",
        "dreher",
        "drehen",
        "zerspaner"
      ],
      "berufe": [
        "Zerspanungsmechaniker",
        "CNC-Fräser",
        "CNC-Dreher",
        "Einrichter CNC",
        "Schleifer"
      ]
    },
    {
      "key": "metall-montage",
      "name": "Metall und Montage",
      "kurz": "Industriemechaniker, Schlosser, Schweißer",
      "aliase": [
        "metall",
        "montage",
        "schlosser",
        "schweisser",
        "industriemechaniker"
      ],
      "berufe": [
        "Industriemechaniker",
        "Konstruktionsmechaniker",
        "Schlosser",
        "Schweißer",
        "Monteur"
      ]
    },
    {
      "key": "elektro",
      "name": "Elektro",
      "kurz": "Elektroniker, Mechatroniker",
      "aliase": [
        "elektriker",
        "elektroniker",
        "mechatroniker"
      ],
      "berufe": [
        "Elektroniker für Betriebstechnik",
        "Elektroniker für Energie- und Gebäudetechnik",
        "Elektroniker für Automatisierungstechnik",
        "Mechatroniker",
        "Servicetechniker"
      ]
    },
    {
      "key": "shk",
      "name": "SHK",
      "kurz": "Anlagenmechaniker Sanitär, Heizung, Klima",
      "aliase": [
        "sanitaer",
        "heizung",
        "klima",
        "anlagenmechaniker"
      ],
      "berufe": [
        "Anlagenmechaniker SHK",
        "Kundendiensttechniker",
        "Heizungsbauer",
        "Installateur"
      ]
    },
    {
      "key": "technik",
      "name": "Technik",
      "kurz": "Techniker, Meister",
      "aliase": [
        "techniker",
        "meister"
      ],
      "berufe": [
        "Industriemeister",
        "Handwerksmeister",
        "Staatlich geprüfter Techniker",
        "Arbeitsvorbereitung",
        "Qualitätssicherung"
      ]
    },
    {
      "key": "produktion-logistik",
      "name": "Produktion und Logistik",
      "kurz": "Anlagenführer, Produktion, Lager",
      "aliase": [
        "produktion",
        "logistik",
        "lager",
        "stapler"
      ],
      "berufe": [
        "Maschinen- und Anlagenführer",
        "Produktionsmitarbeiter",
        "Fachkraft für Lagerlogistik",
        "Staplerfahrer",
        "Versand"
      ]
    }
  ],
  "felder": [
    {
      "key": "berufskategorie",
      "typ": "kategorie",
      "frage": "In welchem Bereich arbeitest du?",
      "kurz": "Berufskategorie",
      "betrieb": "In welchem Bereich ist die Stelle?",
      "matching": "Pflicht – sortiert den Pool",
      "pflicht": true
    },
    {
      "key": "beruf",
      "typ": "beruf",
      "frage": "Was ist dein Beruf?",
      "kurz": "Beruf",
      "betrieb": "Welcher Beruf wird gesucht?",
      "matching": "Muss",
      "pflicht": true
    },
    {
      "key": "abschluss",
      "typ": "einfach",
      "frage": "Was ist dein höchster Abschluss in dem Beruf?",
      "kurz": "Abschluss",
      "betrieb": "Welcher Abschluss ist mindestens nötig?",
      "matching": "Muss oder Wunsch",
      "pflicht": true,
      "optionen": [
        "Abgeschlossene Ausbildung",
        "Meister",
        "Techniker",
        "Studium",
        "Kein Abschluss, aber Berufserfahrung",
        "Noch in Ausbildung"
      ]
    },
    {
      "key": "erfahrung",
      "typ": "einfach",
      "frage": "Wie viele Jahre Berufserfahrung hast du?",
      "kurz": "Berufserfahrung",
      "betrieb": "Wie viel Berufserfahrung ist nötig?",
      "matching": "Muss oder Wunsch",
      "pflicht": true,
      "optionen": [
        "Unter 1 Jahr",
        "1 bis 3 Jahre",
        "3 bis 5 Jahre",
        "5 bis 10 Jahre",
        "Über 10 Jahre"
      ]
    },
    {
      "key": "wohnort",
      "typ": "plz-ort",
      "frage": "Wo wohnst du?",
      "kurz": "Wohnort (PLZ, Ort)",
      "betrieb": "Wo ist der Einsatzort?",
      "matching": "Muss – zusammen mit Fahrweg",
      "pflicht": true,
      "hinweis": "Damit wir nur Jobs in deiner Nähe vorschlagen."
    },
    {
      "key": "fahrweg",
      "typ": "einfach",
      "frage": "Wie weit würdest du zur Arbeit fahren?",
      "kurz": "Fahrweg max.",
      "betrieb": "Bis zu welchem Fahrweg kommen Bewerber in Frage?",
      "matching": "Muss",
      "pflicht": true,
      "optionen": [
        "Bis 10 km",
        "Bis 20 km",
        "Bis 30 km",
        "Bis 50 km",
        "Egal, wenn der Job passt"
      ]
    },
    {
      "key": "verfuegbarkeit",
      "typ": "einfach",
      "frage": "Ab wann könntest du anfangen?",
      "kurz": "Verfügbar ab",
      "betrieb": "Ab wann soll die Person anfangen?",
      "matching": "Wunsch",
      "pflicht": true,
      "hinweis": "Denk an deine Kündigungsfrist.",
      "optionen": [
        "Sofort",
        "In 1 Monat",
        "In 2 bis 3 Monaten",
        "Später als 3 Monate",
        "Weiß ich noch nicht"
      ]
    },
    {
      "key": "gehalt",
      "typ": "einfach",
      "frage": "Was willst du im Monat verdienen?",
      "kurz": "Gehaltswunsch (brutto/Monat)",
      "betrieb": "Gehaltsrahmen von – bis (brutto/Monat)",
      "matching": "Muss – Wunsch muss im Rahmen liegen",
      "pflicht": true,
      "hinweis": "Brutto pro Monat in Vollzeit. Gib ehrlich an, was du willst – dann kommen nur Jobs, die sich für dich lohnen.",
      "optionen": [
        "Bis 2.800 €",
        "2.800 bis 3.300 €",
        "3.300 bis 3.800 €",
        "3.800 bis 4.300 €",
        "Über 4.300 €",
        "Lieber am Telefon"
      ]
    },
    {
      "key": "schicht",
      "typ": "mehrfach",
      "frage": "Welche Arbeitszeiten gehen für dich?",
      "kurz": "Arbeitszeit / Schicht",
      "betrieb": "Arbeitszeitmodell der Stelle",
      "matching": "Muss",
      "pflicht": true,
      "hinweis": "Mehrere Antworten möglich.",
      "optionen": [
        "Nur Tagschicht",
        "2-Schicht",
        "3-Schicht",
        "Wochenende okay",
        "Montage / auswärts okay"
      ]
    },
    {
      "key": "fuehrerschein",
      "typ": "mehrfach",
      "frage": "Welche Führerscheine hast du?",
      "kurz": "Führerschein",
      "betrieb": "Welcher Führerschein ist nötig?",
      "matching": "Muss oder Wunsch",
      "pflicht": true,
      "hinweis": "Mehrere Antworten möglich.",
      "optionen": [
        "Keinen",
        "Klasse B",
        "Klasse BE",
        "Klasse C / CE",
        "Staplerschein"
      ],
      "exklusiv": "Keinen"
    },
    {
      "key": "deutsch",
      "typ": "einfach",
      "frage": "Wie gut sprichst du Deutsch?",
      "kurz": "Deutschkenntnisse",
      "betrieb": "Welche Deutschkenntnisse sind nötig?",
      "matching": "Muss oder Wunsch",
      "pflicht": true,
      "optionen": [
        "Muttersprache",
        "Sehr gut",
        "Gut – im Alltag kein Problem",
        "Grundkenntnisse"
      ]
    },
    {
      "key": "lebenslauf",
      "typ": "einfach",
      "frage": "Hast du einen Lebenslauf, den du nachreichen könntest?",
      "kurz": "Lebenslauf",
      "betrieb": "Lebenslauf vor dem Gespräch nötig?",
      "matching": "Info – kein Kriterium",
      "pflicht": true,
      "hinweis": "Fürs Profil brauchst du keinen. Will ein Betrieb vor dem Gespräch einen sehen, sagen wir dir Bescheid.",
      "optionen": [
        "Ja",
        "Nein",
        "Kann ich schnell machen"
      ]
    },
    {
      "key": "sperrliste",
      "typ": "text",
      "frage": "Gibt es Betriebe, bei denen wir dich nicht vorstellen sollen?",
      "kurz": "Sperrliste",
      "betrieb": "–",
      "matching": "Ausschluss – dort nie vorschlagen",
      "pflicht": false,
      "platzhalter": "z. B. dein jetziger Arbeitgeber",
      "hinweis": "Freiwillig. Bei diesen Betrieben taucht dein Profil nie auf."
    },
    {
      "key": "kontakt",
      "typ": "kontakt",
      "frage": "Wie erreichen wir dich?",
      "kurz": "Kontakt",
      "betrieb": "–",
      "matching": "–",
      "pflicht": true,
      "hinweis": "Wir rufen nur an, wenn ein Job passt.",
      "felder": [
        {
          "key": "vorname",
          "label": "Vorname",
          "typ": "text",
          "autocomplete": "given-name"
        },
        {
          "key": "nachname",
          "label": "Nachname",
          "typ": "text",
          "autocomplete": "family-name"
        },
        {
          "key": "telefon",
          "label": "Handynummer",
          "typ": "tel",
          "autocomplete": "tel"
        },
        {
          "key": "email",
          "label": "E-Mail",
          "typ": "email",
          "autocomplete": "email"
        }
      ],
      "erreichbarkeit": [
        "Vormittags",
        "Mittags",
        "Nachmittags",
        "Abends"
      ]
    }
  ],
  "webhooks": {
    "fallback": "",
    "zerspanung": "",
    "metall-montage": "",
    "elektro": "",
    "shk": "",
    "technik": "",
    "produktion-logistik": ""
  }
};
