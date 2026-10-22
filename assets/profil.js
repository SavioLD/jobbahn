/* =====================================================================
   Kurzprofil – baut die Schritte aus schema/felder.json (über
   assets/config.js) und schickt das fertige Profil an die Lead Table.

   Mobile Laufruhe: Beim Schrittwechsel wird nur eine Klasse gewechselt.
   Kein scrollTo, kein scrollIntoView, kein focus(), kein Reload. Der
   Schrittbereich hat eine feste Mindesthöhe (--form-min in style.css).
   ===================================================================== */
(function () {
  "use strict";

  var C = window.PASSTJOB;
  if (!C) return;
  var T = C.texte;

  var form = document.getElementById("profil-form");
  var schritteEl = document.getElementById("schritte");
  var btnZurueck = document.getElementById("btn-zurueck");
  var btnWeiter = document.getElementById("btn-weiter");
  var navEl = document.getElementById("formular-nav");
  var fortschrittEl = document.getElementById("fortschritt");
  var fortschrittText = document.getElementById("fortschritt-text");
  var fortschrittBalken = document.getElementById("fortschritt-balken");
  var ansage = document.getElementById("ansage");
  var dankeEl = document.getElementById("danke");
  var vorschauHinweis = document.getElementById("vorschau-hinweis");

  var ANDERER = "__anderer";
  var haken = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function slug(s) {
    return String(s).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function fuelle(text, werte) {
    return String(text).replace(/\{(\w+)\}/g, function (m, k) { return werte[k] != null ? werte[k] : m; });
  }
  function kategorie(key) {
    for (var i = 0; i < C.berufe.length; i++) if (C.berufe[i].key === key) return C.berufe[i];
    return null;
  }
  function findeKategorie(s) {
    s = slug(s || "");
    if (!s) return null;
    for (var i = 0; i < C.berufe.length; i++) {
      var b = C.berufe[i];
      if (b.key === s || (b.aliase || []).indexOf(s) > -1) return b;
    }
    return null;
  }
  function heute() {
    var d = new Date();
    return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear();
  }
  function zeitstempel() {
    var d = new Date();
    return heute() + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  function liste(arr) {
    if (arr.length < 2) return arr.join("");
    return arr.slice(0, -1).join(", ") + " oder " + arr[arr.length - 1];
  }

  /* ---------- Deeplink & Herkunft ---------- */
  var params = new URLSearchParams(location.search);
  var vorKat = findeKategorie(params.get("beruf") || location.hash.replace(/^#/, ""));
  var vorBeruf = null;
  if (vorKat && params.get("als")) {
    var als = slug(params.get("als"));
    vorKat.berufe.forEach(function (b) { if (slug(b) === als) vorBeruf = b; });
  }
  var utm = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
    var v = params.get(k);
    if (v) utm[k] = v.slice(0, 200);
  });

  /* ---------- Schritte bauen ---------- */
  var felder = C.felder.filter(function (f) {
    if (f.key === "berufskategorie" && vorKat) return false;
    if (f.key === "beruf" && vorBeruf) return false;
    return true;
  });

  function optionHtml(typ, name, wert, inhalt, id) {
    return '<label class="option" for="' + id + '"><input type="' + typ + '" id="' + id + '" name="' + name + '" value="' + esc(wert) + '">' +
      '<span class="option-flaeche"><span>' + inhalt + '</span><span class="option-marke">' + haken + "</span></span></label>";
  }

  function schrittHtml(f, i) {
    var kopf = '<legend class="frage" id="frage-' + f.key + '">' + esc(f.frage) + "</legend>" +
      (f.hinweis ? '<p class="hinweis">' + esc(f.hinweis) + "</p>" : "");
    var inner = "";

    if (f.typ === "kategorie") {
      inner = '<div class="optionen optionen-raster">' + C.berufe.map(function (b, j) {
        return optionHtml("radio", f.key, b.key, esc(b.name), f.key + "-" + j);
      }).join("") + "</div>";
    } else if (f.typ === "beruf") {
      inner = '<div class="optionen" data-berufe></div>' +
        '<div class="feld" data-anderer hidden><label for="beruf-anderer">' + esc(T.andererBerufLabel) + '</label>' +
        '<input type="text" id="beruf-anderer" name="beruf_anderer" maxlength="80" autocomplete="organization-title"></div>';
    } else if (f.typ === "einfach" || f.typ === "mehrfach") {
      var typ = f.typ === "einfach" ? "radio" : "checkbox";
      inner = '<div class="optionen">' + f.optionen.map(function (o, j) {
        return optionHtml(typ, f.key, o, esc(o), f.key + "-" + j);
      }).join("") + "</div>";
    } else if (f.typ === "plz-ort") {
      inner = '<div class="felder-2">' +
        '<div class="feld"><label for="plz">' + esc(T.plzLabel) + '</label><input type="text" id="plz" name="plz" inputmode="numeric" autocomplete="postal-code"></div>' +
        '<div class="feld"><label for="ort">' + esc(T.ortLabel) + '</label><input type="text" id="ort" name="ort" maxlength="60" autocomplete="address-level2"></div></div>';
    } else if (f.typ === "text") {
      inner = '<div class="feld"><label class="nur-sr" for="' + f.key + '">' + esc(f.frage) + '</label>' +
        '<textarea id="' + f.key + '" name="' + f.key + '" maxlength="400" placeholder="' + esc(f.platzhalter || "") + '"></textarea></div>';
    } else if (f.typ === "kontakt") {
      inner = '<div class="felder-kontakt">' + f.felder.map(function (k) {
        var mode = k.typ === "tel" ? ' inputmode="tel"' : k.typ === "email" ? ' inputmode="email"' : "";
        return '<div class="feld"><label for="' + k.key + '">' + esc(k.label) + '</label><input type="' + k.typ + '" id="' + k.key + '" name="' + k.key + '" autocomplete="' + k.autocomplete + '" maxlength="80"' + mode + "></div>";
      }).join("") + "</div>" +
        '<div class="feld"><span class="feld-label" id="erreichbarkeit-label">' + esc(T.erreichbarkeitLabel) + '</span>' +
        '<div class="chips-klein" role="group" aria-labelledby="erreichbarkeit-label">' + f.erreichbarkeit.map(function (e, j) {
          return optionHtml("checkbox", "erreichbarkeit", e, esc(e), "erreichbarkeit-" + j);
        }).join("") + "</div></div>" +
        '<label class="einwilligung" for="einwilligung"><input type="checkbox" id="einwilligung" name="einwilligung">' +
        "<span>" + esc(T.einwilligung) + ' <a href="datenschutz.html#einwilligung" target="_blank" rel="noopener">' + esc(T.einwilligungLink) + "</a></span></label>" +
        '<div class="honig" aria-hidden="true"><label for="firma_website">Website</label><input type="text" id="firma_website" name="firma_website" tabindex="-1" autocomplete="off"></div>';
    }

    return '<fieldset class="schritt" data-key="' + f.key + '" data-typ="' + f.typ + '" data-index="' + i + '">' +
      kopf + inner + '<p class="fehler" role="alert" data-fehler></p></fieldset>';
  }

  schritteEl.innerHTML = felder.map(schrittHtml).join("");
  var schritte = Array.prototype.slice.call(schritteEl.querySelectorAll(".schritt"));

  function schrittVon(key) {
    for (var i = 0; i < schritte.length; i++) if (schritte[i].getAttribute("data-key") === key) return schritte[i];
    return null;
  }

  /* Berufe hängen von der Kategorie ab */
  function berufeRendern(katKey) {
    var s = schrittVon("beruf");
    if (!s) return;
    var kat = kategorie(katKey);
    var box = s.querySelector("[data-berufe]");
    var opts = (kat ? kat.berufe : []).map(function (b, j) { return optionHtml("radio", "beruf", b, esc(b), "beruf-" + j); });
    opts.push(optionHtml("radio", "beruf", ANDERER, esc(T.andererBeruf), "beruf-anderer-option"));
    box.innerHTML = opts.join("");
    s.querySelector("[data-anderer]").hidden = true;
    hoeheFestlegen();
  }

  /* Feste Mindesthöhe = höchster Fragenschritt bei der aktuellen Breite.
     So steht der Weiter-Button in jedem Fragenschritt an derselben Stelle
     und die Seite kann beim Wechsel nicht springen. Der Kontaktschritt
     (der letzte) darf höher sein. */
  function hoeheFestlegen() {
    var max = 0;
    function miss(s) {
      s.classList.add("ist-messen");
      max = Math.max(max, s.offsetHeight);
      s.classList.remove("ist-messen");
    }
    schritte.forEach(function (s) {
      if (s.getAttribute("data-typ") === "kontakt") return;
      var anderer = s.querySelector("[data-anderer]"), warVersteckt = anderer && anderer.hidden;
      if (anderer) anderer.hidden = false;
      var box = s.querySelector("[data-berufe]");
      if (box && !vorKat) {
        /* Der Berufsschritt ist je nach Kategorie unterschiedlich lang – die längste Liste zählt. */
        var vorher = box.innerHTML, gewaehlt = (box.querySelector("input:checked") || {}).value;
        C.berufe.forEach(function (k) {
          box.innerHTML = k.berufe.concat([T.andererBeruf]).map(function (b, j) { return optionHtml("radio", "messen", b, esc(b), "messen-" + j); }).join("");
          miss(s);
        });
        box.innerHTML = vorher;
        if (gewaehlt) { var el = box.querySelector('input[value="' + gewaehlt.replace(/"/g, '\\"') + '"]'); if (el) el.checked = true; }
      } else {
        miss(s);
      }
      if (anderer) anderer.hidden = warVersteckt;
    });
    if (max) schritteEl.style.minHeight = max + "px";
  }
  var letzteBreite = 0;
  window.addEventListener("resize", function () {
    if (window.innerWidth === letzteBreite) return; /* Tastatur auf/zu ändert nur die Höhe */
    letzteBreite = window.innerWidth;
    hoeheFestlegen();
  });
  if (vorKat) berufeRendern(vorKat.key);

  /* ---------- Werte lesen ---------- */
  function gewaehlt(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }
  function alleGewaehlt(name) {
    return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (el) { return el.value; });
  }
  function wert(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }
  function katKey() { return vorKat ? vorKat.key : gewaehlt("berufskategorie"); }
  function beruf() {
    if (vorBeruf) return vorBeruf;
    var b = gewaehlt("beruf");
    return b === ANDERER ? wert("beruf-anderer") : b;
  }

  /* ---------- Prüfen ---------- */
  function fehler(s, text, feldId) {
    s.querySelector("[data-fehler]").textContent = text || "";
    Array.prototype.forEach.call(s.querySelectorAll(".feld.ist-fehler"), function (el) { el.classList.remove("ist-fehler"); });
    if (feldId) {
      var el = document.getElementById(feldId);
      if (el && el.closest(".feld")) el.closest(".feld").classList.add("ist-fehler");
    }
    return !text;
  }

  function pruefe(s) {
    var key = s.getAttribute("data-key"), typ = s.getAttribute("data-typ");
    var f = T.fehler;
    if (typ === "kategorie" || typ === "einfach") return fehler(s, gewaehlt(key) ? "" : f.auswahl);
    if (typ === "mehrfach") return fehler(s, alleGewaehlt(key).length ? "" : f.mehrfach);
    if (typ === "beruf") {
      if (!gewaehlt("beruf")) return fehler(s, f.auswahl);
      if (gewaehlt("beruf") === ANDERER && !wert("beruf-anderer")) return fehler(s, f.beruf, "beruf-anderer");
      return fehler(s, "");
    }
    if (typ === "plz-ort") {
      if (!/^\d{5}$/.test(wert("plz"))) return fehler(s, f.plz, "plz");
      if (wert("ort").length < 2) return fehler(s, f.ort, "ort");
      return fehler(s, "");
    }
    if (typ === "text") return fehler(s, "");
    if (typ === "kontakt") {
      if (!wert("vorname")) return fehler(s, f.vorname, "vorname");
      if (!wert("nachname")) return fehler(s, f.nachname, "nachname");
      if (wert("telefon").replace(/\D/g, "").length < 6) return fehler(s, f.telefon, "telefon");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert("email"))) return fehler(s, f.email, "email");
      if (!document.getElementById("einwilligung").checked) return fehler(s, f.einwilligung);
      return fehler(s, "");
    }
    return true;
  }

  /* ---------- Anzeigen ---------- */
  var idx = 0, sendet = false, weiterTimer = null;

  function zeige(i) {
    idx = Math.max(0, Math.min(i, schritte.length - 1));
    schritte.forEach(function (s, j) { s.classList.toggle("ist-aktiv", j === idx); });
    var s = schritte[idx];
    var gesamt = schritte.length;
    fortschrittText.textContent = fuelle(T.schritt, { n: idx + 1, gesamt: gesamt });
    fortschrittBalken.style.width = Math.round((idx / gesamt) * 100) + "%";
    if (idx === 0) btnZurueck.setAttribute("data-versteckt", ""); else btnZurueck.removeAttribute("data-versteckt");
    weiterBeschriften();
    ansage.textContent = fuelle(T.schritt, { n: idx + 1, gesamt: gesamt }) + ": " + s.querySelector("legend").textContent;
  }

  function weiterBeschriften() {
    var s = schritte[idx], typ = s.getAttribute("data-typ");
    if (typ === "kontakt") btnWeiter.textContent = sendet ? T.sendet : T.senden;
    else if (typ === "text" && !wert(s.getAttribute("data-key"))) btnWeiter.textContent = T.ueberspringen;
    else btnWeiter.textContent = T.weiter;
  }

  function weiter() {
    clearTimeout(weiterTimer);
    var s = schritte[idx];
    if (!pruefe(s)) return;
    if (s.getAttribute("data-typ") === "kontakt") { absenden(); return; }
    zeige(idx + 1);
  }

  /* ---------- Eingaben ---------- */
  form.addEventListener("change", function (e) {
    var el = e.target, s = el.closest(".schritt");
    if (!s) return;
    var typ = s.getAttribute("data-typ");
    fehler(s, "");

    if (typ === "kategorie") berufeRendern(el.value);

    if (typ === "beruf") {
      var anderer = el.value === ANDERER;
      s.querySelector("[data-anderer]").hidden = !anderer;
      if (anderer) return;
    }

    if (typ === "mehrfach") {
      var f = felder.filter(function (x) { return x.key === s.getAttribute("data-key"); })[0];
      if (f && f.exklusiv && el.checked) {
        Array.prototype.forEach.call(s.querySelectorAll("input"), function (x) {
          if (x !== el && (el.value === f.exklusiv || x.value === f.exklusiv)) x.checked = false;
        });
      }
      return;
    }

    /* Eine Antwort, ein Tipp: einfache Fragen gehen von selbst weiter. */
    if ((typ === "kategorie" || typ === "einfach" || typ === "beruf") && el.type === "radio") {
      clearTimeout(weiterTimer);
      weiterTimer = setTimeout(weiter, 220);
    }
  });

  form.addEventListener("input", function (e) {
    var s = e.target.closest(".schritt");
    if (s && s.getAttribute("data-typ") === "text") weiterBeschriften();
    if (e.target.id === "plz") e.target.value = e.target.value.replace(/\D/g, "").slice(0, 5);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!sendet) weiter();
  });

  btnZurueck.addEventListener("click", function () {
    clearTimeout(weiterTimer);
    if (idx > 0) zeige(idx - 1);
  });

  /* ---------- Absenden ---------- */
  function sammle() {
    var kat = kategorie(katKey());
    var erreichbar = alleGewaehlt("erreichbarkeit");
    var daten = {
      vorname: wert("vorname"),
      nachname: wert("nachname"),
      telefon: wert("telefon"),
      email: wert("email"),
      richtung: kat ? kat.key : "",
      berufskategorie: kat ? kat.name : "",
      beruf: beruf(),
      abschluss: gewaehlt("abschluss"),
      erfahrung: gewaehlt("erfahrung"),
      plz: wert("plz"),
      ort: wert("ort"),
      fahrweg: gewaehlt("fahrweg"),
      verfuegbarkeit: gewaehlt("verfuegbarkeit"),
      gehalt: gewaehlt("gehalt"),
      schicht: alleGewaehlt("schicht").join(", "),
      fuehrerschein: alleGewaehlt("fuehrerschein").join(", "),
      deutsch: gewaehlt("deutsch"),
      lebenslauf: gewaehlt("lebenslauf"),
      sperrliste: wert("sperrliste") || "–",
      erreichbarkeit: erreichbar.length ? erreichbar.join(", ") : "–",
      einwilligung: "Ja (" + T.einwilligungVersion + ", " + zeitstempel() + ")",
      datum: heute(),
      quelle: "Bewerberportal " + C.marke.name,
      seite: location.href
    };
    Object.keys(utm).forEach(function (k) { daten[k] = utm[k]; });
    return daten;
  }

  function absenden() {
    /* Honeypot: Bots füllen das versteckte Feld – still beenden, kein Lead. */
    if (document.getElementById("firma_website").value) { fertig(sammle(), "honig"); return; }
    var daten = sammle();
    var key = katKey();
    var api = (C.api || "").replace(/\/+$/, "");
    var url = api ? api + "/api/bewerber" : (C.webhooks[key] || C.webhooks.fallback || "");
    if (!url) { fertig(daten, null); return; }

    sendet = true; btnWeiter.disabled = true; weiterBeschriften();
    var body = JSON.stringify(daten);
    if (api) {
      /* Über den Vergleicher: er speichert, vergleicht und kopiert in die Lead Table. */
      fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body })
        .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); fertig(daten, url); })
        .catch(function () {
          sendet = false; btnWeiter.disabled = false; weiterBeschriften();
          fehler(schritte[idx], T.fehler.senden);
        });
      return;
    }
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body })
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); fertig(daten, url); })
      .catch(function () {
        /* Fallback für CORS-Preflight-Probleme: no-cors, text/plain. */
        return fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: body })
          .then(function () { fertig(daten, url); });
      })
      .catch(function () {
        sendet = false; btnWeiter.disabled = false; weiterBeschriften();
        fehler(schritte[idx], T.fehler.senden);
      });
  }

  function fertig(daten, url) {
    /* Platz für Conversion-Tracking – erst nach Einwilligung aktivieren. */
    if (typeof window.fbq === "function") window.fbq("track", "Lead");

    var d = T.danke;
    var erreichbar = daten.erreichbarkeit && daten.erreichbarkeit !== "–"
      ? " – am besten " + liste(daten.erreichbarkeit.split(", ").map(function (x) { return x.toLowerCase(); }))
      : "";
    var html = '<h1 class="frage">' + esc(fuelle(d.h1, { vorname: daten.vorname || "" })) + "</h1>" +
      '<ol class="danke-schritte">' + d.schritte.map(function (x) { return "<li>" + esc(fuelle(x, { erreichbarkeit: erreichbar })) + "</li>"; }).join("") + "</ol>" +
      '<p class="hinweis">' + esc(d.loeschen) + "</p>";
    if (!url) {
      var kat = kategorie(katKey());
      html += '<div class="payload"><p><strong>' + esc(d.vorschauH) + "</strong></p>" +
        '<p class="hinweis">' + esc(fuelle(d.vorschauText, { kachel: kat ? kat.name : "–" })) + "</p>" +
        "<pre>" + esc(JSON.stringify(daten, null, 2)) + "</pre></div>";
    }
    html += '<p><a class="btn btn-sekundaer btn-klein" href="profil.html">' + esc(d.nochmal) + "</a></p>";

    schritte.forEach(function (s) { s.classList.remove("ist-aktiv"); });
    schritteEl.hidden = true; navEl.hidden = true; fortschrittEl.hidden = true;
    dankeEl.innerHTML = html; dankeEl.hidden = false;
    ansage.textContent = fuelle(d.h1, { vorname: daten.vorname || "" });
  }

  /* ---------- Start ---------- */
  var irgendeineUrl = !!C.api || Object.keys(C.webhooks).some(function (k) { return C.webhooks[k]; });
  if (!irgendeineUrl) vorschauHinweis.hidden = false;
  letzteBreite = window.innerWidth;
  hoeheFestlegen();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(hoeheFestlegen);
  zeige(0);
})();
