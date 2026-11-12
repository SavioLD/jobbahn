/* =====================================================================
   ALLE TEXTE DES PORTALS
   Platzhalter in geschweiften Klammern ersetzt der Build aus
   config/marke.json: {marke} {betreiber} {email} {telefon} {anzahl}.
   ==Wort== hebt ein Wort in Überschriften in der Akzentfarbe hervor.
   Fehlende Fakten stehen in [eckigen Klammern] und bleiben sichtbar.
   CONTENT.md wird aus dieser Datei erzeugt – hier ändern, nicht dort.
   ===================================================================== */

export const startseite = {
  meta: {
    titel: "{marke} – Jobs in deiner Nähe",
    beschreibung: "Leg in zwei Minuten ein Kurzprofil an. {marke} sucht passende Jobs in deiner Nähe – im Handwerk, in der Industrie und im Büro – und ruft dich an, wenn einer passt. Kostenlos und vertraulich."
  },
  hero: {
    eyebrow: "Kostenlose Jobvermittlung",
    h1: "Dein Job passt nicht mehr? ==Wir finden einen besseren.==",
    lead: "Trag dich in 2 Minuten ein. Wir suchen für dich den Betrieb in deiner Nähe, der besser passt – und rufen dich an. Bewerben musst du dich nirgends.",
    schritteTitel: "So einfach geht’s",
    cta: "Jetzt in 2 Minuten eintragen",
    cta2: "So läuft’s",
    schritte: [
      { titel: "Du trägst dich ein", text: "2 Minuten, ohne Lebenslauf" },
      { titel: "Wir suchen für dich", text: "Betriebe in deiner Nähe, die besser passen" },
      { titel: "Wir rufen dich an", text: "Nur wenn ein Job wirklich passt" }
    ],
    fakten: ["Kostenlos", "Ohne Lebenslauf", "Dein Chef erfährt nichts"],
    mass: "2 Minuten · ohne Lebenslauf",
    foto: "assets/team-headset.jpg",
    fotoAlt: "Ein Berater aus dem Jobbahn-Team",
    fotoKarte: { titel: "Wir rufen dich an.", text: "Persönlich – kein Callcenter, kein Bot." },
    fotoMatch: { label: "Neuer Treffer", text: "Zerspaner · 18 km · Tagschicht" },
    /* Überschrift passend zur Anzeige: ?t=pendeln oder utm_content=1-pendeln */
    themen: {
      pendeln: { h1: "Schluss mit ==1 Stunde Stau.==", lead: "Trag dich in 2 Minuten ein. Wir suchen gute Jobs in deiner Nähe – du sagst, wie weit du fahren willst. Passt einer, rufen wir dich an." },
      gehalt: { h1: "Mehr Arbeit? ==Dann auch mehr Lohn.==", lead: "Trag dich in 2 Minuten ein und sag uns, was du verdienen willst. Wir suchen Betriebe in deiner Nähe, die das zahlen – und rufen dich an." },
      chef: { h1: "Gute Leute verdienen ==einen guten Chef.==", lead: "Trag dich in 2 Minuten ein. Wir suchen den Betrieb, in dem du dich wohlfühlst – und rufen dich an. Dein jetziger Chef erfährt nichts." },
      montag: { h1: "Wieder Lust ==auf Montag.==", lead: "Trag dich in 2 Minuten ein. Wir suchen einen Job in deiner Nähe, auf den du dich wieder freust. Passt einer, rufen wir dich an." },
      verantwortung: { h1: "Du kannst mehr. ==Zeig es woanders.==", lead: "Trag dich in 2 Minuten ein. Wir suchen Betriebe, die dir mehr zutrauen – und mehr Verantwortung geben. Passt einer, rufen wir dich an." },
      trott: { h1: "Zeit für ==was Neues.==", lead: "Trag dich in 2 Minuten ein – ohne Anschreiben, ohne Lebenslauf. Wir suchen den passenden Job in deiner Nähe und rufen dich an." }
    }
  },
  kennst: {
    eyebrow: "Kennst du das?",
    h2: "Kommt dir davon ==was bekannt vor?==",
    text: "Die meisten, die sich bei uns melden, haben einen Job. Nur eben nicht den richtigen.",
    punkte: [
      { icon: "auto", titel: "Jeden Tag im Stau", text: "Eine Stunde hin, eine zurück – und das fünfmal die Woche." },
      { icon: "geld", titel: "Zu wenig Gehalt", text: "Du machst mehr als früher. Auf dem Lohnzettel merkst du davon nichts." },
      { icon: "chef", titel: "Chef und Kollegen nerven", text: "Kein Danke, schlechte Stimmung, immer dieselben Diskussionen." },
      { icon: "treppe", titel: "Kein Weiterkommen", text: "Mehr Verantwortung? Gibt’s nicht – oder nur ohne mehr Geld." },
      { icon: "kreis", titel: "Seit Jahren dasselbe", text: "Gleiche Halle, gleiche Aufgaben, gleicher Trott." },
      { icon: "uhr", titel: "Schicht passt nicht zum Leben", text: "Familie, Hobby, Feierabend – alles muss sich nach dem Plan richten." }
    ],
    schluss: "Trifft eins davon zu? Dann suchen wir den Betrieb, der besser passt.",
    cta: "Jetzt Kurzprofil anlegen"
  },
  team: {
    eyebrow: "Wer hinter Jobbahn steckt",
    h2: "Echte Menschen. ==Kein Bot.==",
    text: "Bei uns landest du nicht in einem Postfach, das nie antwortet. Wir rufen dich persönlich an, hören zu und schauen mit dir, welcher Betrieb wirklich passt.",
    punkte: ["Ein fester Ansprechpartner für dich", "Ehrliche Einschätzung statt Massenmails", "Wir melden uns nur, wenn es passt"],
    bilder: [
      { src: "assets/team-gruppe.jpg", alt: "Das Jobbahn-Team bei der Arbeit", w: 1200, h: 800 },
      { src: "assets/team-ansprechpartner.jpg", alt: "Ein Berater aus dem Jobbahn-Team", w: 800, h: 1000 },
      { src: "assets/team-laptop.jpg", alt: "Ein Kollege aus dem Jobbahn-Team am Laptop", w: 800, h: 1000 },
      { src: "assets/team-handy.jpg", alt: "Ein Kollege aus dem Jobbahn-Team am Telefon", w: 800, h: 1000 }
    ]
  },
  matchkarte: {
    label: "Beispiel",
    status: "Neuer Match",
    titel: "Zerspanungsmechaniker (m/w/d)",
    ort: "Betrieb in deiner Nähe",
    zeilen: [
      ["Fahrweg", "18 km", "du: bis 30 km"],
      ["Arbeitszeit", "Tagschicht", "wie gewünscht"],
      ["Gehalt", "im Rahmen", "deines Wunsches"],
      ["Start", "in 2–3 Monaten", "passt zur Kündigungsfrist"]
    ],
    fuss: "Nächster Schritt: Wir rufen dich an."
  },
  ablauf: {
    eyebrow: "So läuft’s",
    h2: "Den ersten Schritt machst du. Den Rest wir.",
    schritte: [
      { titel: "Kurzprofil anlegen", text: "Beruf, Erfahrung, Wohnort, Wunschgehalt. Zwei Minuten, kein Anschreiben, kein Lebenslauf." },
      { titel: "Wir gleichen ab", text: "Wir legen dein Profil neben offene Stellen in deiner Nähe: Fahrweg, Schicht, Gehalt, Start." },
      { titel: "Wir rufen dich an", text: "Passt ein Job, sprechen wir zuerst mit dir. Du erfährst, um welchen Betrieb es geht und was er bietet." },
      { titel: "Du entscheidest", text: "Willst du, stellen wir dich vor und machen den Termin mit dem Betrieb aus. Willst du nicht, passiert nichts." }
    ]
  },
  vertraulich: {
    eyebrow: "Vertraulich",
    h2: "Dein Chef erfährt nichts.",
    text: "Viele, die sich bei uns melden, haben einen Job. Sie wollen nur wissen, ob es woanders besser ist. Darum ist dein Profil bei uns nicht öffentlich.",
    punkte: [
      { titel: "Kein öffentliches Profil", text: "Keine Jobbörse, keine Suchmaschine. Dein Profil sehen nur wir." },
      { titel: "Erst reden wir mit dir", text: "Kein Betrieb erfährt deinen Namen, bevor wir mit dir telefoniert haben und du einverstanden bist." },
      { titel: "Du sperrst Betriebe", text: "Sag uns, wo wir dich nicht vorstellen sollen. Zum Beispiel bei deinem jetzigen Arbeitgeber." },
      { titel: "Jederzeit löschen", text: "Eine Mail genügt, und dein Profil ist weg." }
    ]
  },
  vergleich: {
    eyebrow: "Der Unterschied",
    h2: "Bewerben wie immer – oder einmal Profil anlegen.",
    spalten: ["", "Klassisch bewerben", "Mit {marke}"],
    zeilen: [
      ["Aufwand", "Anschreiben und Lebenslauf für jede Stelle", "Ein Kurzprofil, zwei Minuten"],
      ["Gehalt und Schicht", "Erfährst du oft erst im Vorstellungsgespräch", "Gleichen wir vorher mit deinen Wünschen ab"],
      ["Rückmeldung", "Oft lange gar nichts", "Wir rufen an, sobald ein Job passt"],
      ["Wer dich sieht", "Jeder Betrieb, bei dem du dich bewirbst", "Nur Betriebe, denen du zugestimmt hast"]
    ]
  },
  berufe: {
    eyebrow: "Berufe",
    h2: "{anzahl} Richtungen. Eine ==passt.==",
    text: "Von der Werkstatt über die Baustelle bis ins Büro. Wähl die Richtung, die am besten passt – deinen genauen Beruf fragen wir im Profil. Ist er nicht dabei, schreibst du ihn einfach rein."
  },
  faq: {
    eyebrow: "Fragen",
    h2: "Was du wissen willst.",
    eintraege: [
      { frage: "Kostet mich das was?", antwort: "Nein. Für dich ist {marke} kostenlos. Bezahlt werden wir von den Betrieben." },
      { frage: "Erfährt mein jetziger Chef davon?", antwort: "Nein. Dein Profil ist nicht öffentlich, und du kannst Betriebe ausschließen. Bevor wir dich irgendwo vorstellen, sprechen wir mit dir." },
      { frage: "Brauche ich einen Lebenslauf?", antwort: "Für das Kurzprofil nicht. Will ein Betrieb vor dem Gespräch einen sehen, sagen wir dir Bescheid." },
      { frage: "Wann meldet ihr euch?", antwort: "Sobald ein Job dabei ist, der zu deinem Profil passt. Das kann schnell gehen oder etwas dauern – je nachdem, was in deinem Beruf und deiner Gegend gerade frei ist. Wir rufen nur an, wenn es passt." },
      { frage: "Was passiert mit meinen Daten?", antwort: "Wir speichern dein Profil, um es mit offenen Stellen abzugleichen. An einen Betrieb geht es erst, wenn wir telefoniert haben und du einverstanden bist. Löschen lassen kannst du es jederzeit." },
      { frage: "Ich weiß nicht genau, wo ich reinpasse.", antwort: "Wähl die Richtung, die am nächsten dran ist. Viele Betriebe suchen nicht den einen Beruf, sondern jemanden, der zu ihnen passt. Den Rest klären wir am Telefon." },
      { frage: "Wer steckt dahinter?", antwort: "{marke} ist ein Angebot von {betreiber} – wir sind Einstellungspartner für Betriebe in ganz Deutschland und bringen sie mit Fachkräften in ihrer Nähe zusammen." }
    ]
  },
  cta: {
    h2: "Zwei Minuten. Dann ==suchen wir.==",
    text: "Kostenlos, vertraulich und ohne Lebenslauf.",
    button: "Kurzprofil anlegen"
  }
};

export const berufsseite = {
  meta: {
    titel: "Jobs {kategorie} – {marke}",
    beschreibung: "Jobs in deiner Nähe: {kurz}. Leg in zwei Minuten ein Kurzprofil an, wir rufen dich an, wenn ein Job passt. Kostenlos und vertraulich."
  },
  eyebrow: "Jobs · {kategorie}",
  h1: "{kategorie}: Jobs, die ==passen.==",
  hook: "Ob {ob}: Sag uns, was du kannst und was du willst. Wir suchen den passenden Job in deiner Nähe.",
  cta: "Kurzprofil anlegen",
  berufeH2: "Diese Berufe suchen wir",
  berufeText: "Tipp deinen Beruf an, dann geht’s direkt los. Nicht dabei? Im Profil gibt es „Anderer Beruf“.",
  fragenH2: "Darüber sprechen wir am Telefon",
  fragenText: "Damit nur Jobs kommen, die wirklich passen, fragen wir im Gespräch genauer nach. Zum Beispiel:",
  ablaufH2: "So läuft’s",
  vertraulichH2: "Vertraulich",
  vertraulichText: "Dein Profil ist nicht öffentlich. Kein Betrieb erfährt deinen Namen, bevor wir mit dir telefoniert haben und du einverstanden bist.",
  ctaH2: "Zwei Minuten. Dann ==suchen wir.==",
  ctaButton: "Profil für {kategorie} anlegen",
  zurueck: "Alle Berufe"
};

export const profil = {
  meta: {
    titel: "Kurzprofil anlegen – {marke}",
    beschreibung: "Leg in zwei Minuten dein Kurzprofil an. Kostenlos, vertraulich, ohne Lebenslauf."
  },
  kopf: "Kurzprofil",
  abbrechen: "Zur Startseite",
  vorschau: "Vorschau-Modus: Das Formular ist noch nicht mit der Lead Table verbunden. Nach dem Absenden siehst du, was ankommen würde.",
  schritt: "Schritt {n} von {gesamt}",
  weiter: "Weiter",
  zurueck: "Zurück",
  ueberspringen: "Überspringen",
  senden: "Profil absenden",
  sendet: "Wird gesendet …",
  andererBeruf: "Anderer Beruf",
  andererBerufLabel: "Welcher Beruf?",
  plzLabel: "Postleitzahl",
  ortLabel: "Ort",
  erreichbarkeitLabel: "Wann erreichen wir dich am besten?",
  fehler: {
    auswahl: "Bitte wähl eine Antwort aus.",
    mehrfach: "Bitte wähl mindestens eine Antwort aus.",
    beruf: "Bitte schreib deinen Beruf kurz dazu.",
    aufgaben: "Bitte beschreib kurz, was du in deinem Job machst – ein, zwei Sätze reichen.",
    plz: "Bitte gib eine Postleitzahl mit fünf Ziffern ein.",
    ort: "Bitte gib deinen Wohnort ein.",
    vorname: "Bitte gib deinen Vornamen ein.",
    nachname: "Bitte gib deinen Nachnamen ein.",
    telefon: "Bitte gib eine Telefonnummer ein, unter der wir dich erreichen.",
    email: "Bitte prüf deine E-Mail-Adresse.",
    einwilligung: "Ohne dein Okay dürfen wir dein Profil nicht speichern.",
    senden: "Das hat nicht geklappt. Bitte prüf deine Verbindung und tipp noch mal auf „Profil absenden“."
  },
  einwilligung: "Ich bin einverstanden, dass {betreiber} mein Profil speichert, mit offenen Stellen abgleicht und mich dazu anruft oder anschreibt. An einen Betrieb geht mein Profil erst, wenn wir telefoniert haben und ich zugestimmt habe. Ich kann das jederzeit widerrufen.",
  einwilligungLink: "Datenschutz",
  einwilligungVersion: "ENTWURF 2026-10",
  danke: {
    h1: "Danke, {vorname}. Dein Profil ist angelegt.",
    schritte: [
      "Wir gleichen dein Profil mit offenen Stellen in deiner Nähe ab.",
      "Passt ein Job, rufen wir dich an{erreichbarkeit}.",
      "Erst wenn du einverstanden bist, erfährt ein Betrieb von dir."
    ],
    loeschen: "Profil löschen lassen: kurze Mail an {email}.",
    vorschauH: "Vorschau-Modus: Das käme in der Lead Table an",
    vorschauText: "Kachel: {kachel}",
    nochmal: "Weiteres Profil anlegen"
  }
};

export const datenschutz = {
  meta: { titel: "Datenschutz – {marke}", beschreibung: "Datenschutzhinweise für das Bewerberportal {marke}." },
  hinweis: "ENTWURF – Freigabe durch Anwalt. Dieser Text ist ein Arbeitsstand und noch nicht rechtlich geprüft.",
  h1: "Datenschutz",
  abschnitte: [
    { h: "Wer verantwortlich ist", t: ["{betreiber} (HRB 807018), Königstr. 26, 78628 Rottweil, [Vertretungsberechtigte Person]. E-Mail: {email}, Telefon: {telefon}."] },
    { h: "Welche Daten wir speichern", t: ["Die Angaben aus deinem Kurzprofil: Beruf, Abschluss, Erfahrung, Wohnort, Fahrweg, Verfügbarkeit, Gehaltswunsch, Arbeitszeiten, Führerscheine, Deutschkenntnisse, ob du einen Lebenslauf hast, deine Sperrliste und deine Kontaktdaten. Dazu, über welche Seite und welche Anzeige du gekommen bist."] },
    { h: "Wofür wir sie nutzen", t: ["Wir gleichen dein Profil mit offenen Stellen unserer Kundenbetriebe ab und melden uns bei dir, wenn ein Job passt.", "An einen Betrieb geben wir dein Profil erst weiter, nachdem wir mit dir telefoniert haben und du zugestimmt hast. Betriebe auf deiner Sperrliste bekommen es nie."] },
    { h: "Rechtsgrundlage", t: ["Deine Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. [Anwalt: prüfen, ob für die Weitergabe an den Betrieb eine gesonderte, dokumentierte Einwilligung nötig ist.]"] },
    { h: "Wie lange wir sie speichern", t: ["[x] Monate nach deinem letzten Kontakt mit uns, danach löschen wir dein Profil automatisch. Du kannst es jederzeit früher löschen lassen."] },
    { h: "Wer die Daten sonst verarbeitet", t: ["Website: GitHub Pages (GitHub Inc., USA). Bewerberverwaltung und Abgleich mit offenen Stellen: unser Recruiting OS auf Servern der Hetzner Online GmbH (Deutschland), Datenbank bei Supabase Inc. (Speicherort Frankfurt am Main). Übergangsweise außerdem: unser bisheriges Abgleichsprogramm bei Cloudflare Inc. und die Bewerberverwaltung LeadTable. [Prüfen: Mit allen Anbietern besteht ein Vertrag zur Auftragsverarbeitung.] [Anwalt: Drittlandübermittlung prüfen – GitHub, Cloudflare und Supabase sind US-Unternehmen.]"] },
    { h: "Automatischer Abgleich", t: ["Ein Programm vergleicht dein Profil mit den Anforderungen offener Stellen (Beruf, Entfernung, Gehalt, Arbeitszeit und ähnliches) und schlägt passende Stellen vor. Entschieden wird nicht vom Programm: Ein Mensch prüft jeden Vorschlag und spricht mit dir, bevor etwas passiert."] },
    { h: "Deine Rechte", t: ["Du kannst Auskunft verlangen, Angaben berichtigen oder löschen lassen und deine Einwilligung jederzeit widerrufen. Eine kurze Mail an {email} genügt. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel beim Landesbeauftragten für den Datenschutz Baden-Württemberg."] },
    { h: "Cookies und Statistik", t: ["Diese Seite setzt derzeit keine Cookies und lädt keine Inhalte von fremden Servern. [Werden später Meta-Pixel oder Statistik eingebunden, hier ergänzen und vorher ein Einwilligungs-Banner einbauen.]"] }
  ],
  einwilligungH: "Der Einwilligungstext im Formular"
};

export const impressum = {
  meta: { titel: "Impressum – {marke}", beschreibung: "Impressum des Bewerberportals {marke}." },
  h1: "Impressum",
  zeilen: [
    "{marke} ist ein Angebot von:",
    "{betreiber}",
    "[Anschrift]",
    "[Vertretungsberechtigte Person]",
    "E-Mail: {email}",
    "Telefon: {telefon}",
    "Handelsregister: HRB 807018, [Registergericht]",
    "USt-IdNr.: [USt-IdNr.]"
  ]
};

export const allgemein = {
  nav: [
    { text: "So läuft’s", href: "./#ablauf" },
    { text: "Berufe", href: "./#berufe" },
    { text: "Vertraulich", href: "./#vertraulich" },
    { text: "Fragen", href: "./#fragen" }
  ],
  navCta: "Profil anlegen",
  footer: {
    betreiber: "Ein Angebot von {betreiber} · HRB 807018",
    fuerBetriebe: "Für Betriebe",
    impressum: "Impressum",
    datenschutz: "Datenschutz",
    zeile: "Jobs in deiner Nähe – im Handwerk, in der Industrie und im Büro."
  }
};
