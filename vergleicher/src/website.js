/* =====================================================================
   Kurzinfo zu einer Firma von ihrer Website: Titel und die Beschreibung,
   die die Firma selbst für Google hinterlegt hat (meta description /
   og:description). Keine KI – nur auslesen. Der Text ist ein Vorschlag,
   den ein Mensch im Steckbrief prüft und ergänzt.
   ===================================================================== */

const ENTITAETEN = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", auml: "ä", ouml: "ö", uuml: "ü", Auml: "Ä", Ouml: "Ö", Uuml: "Ü", szlig: "ß", ndash: "–", mdash: "—", bdquo: "„", ldquo: "“", rdquo: "”", hellip: "…" };
const dekodieren = (s) => String(s)
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => ENTITAETEN[n] ?? m);
const sauber = (s) => dekodieren(String(s || "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

function meta(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const n = /\b(?:name|property)\s*=\s*["']([^"']+)["']/i.exec(tag);
    if (n && n[1].toLowerCase() === name) {
      const c = /\bcontent\s*=\s*"([^"]*)"|\bcontent\s*=\s*'([^']*)'/i.exec(tag);
      if (c) return sauber(c[1] ?? c[2]);
    }
  }
  return "";
}

/* Auf höchstens etwa max Zeichen kürzen, möglichst am Satzende. */
function kuerzen(text, max = 320) {
  if (text.length <= max) return text;
  const teil = text.slice(0, max);
  const ende = Math.max(teil.lastIndexOf(". "), teil.lastIndexOf("! "));
  return ende > max * 0.5 ? teil.slice(0, ende + 1) : teil.replace(/\s+\S*$/, "") + " …";
}

export function ausHtml(html) {
  html = String(html || "").slice(0, 400000);
  const titel = meta(html, "og:site_name") || sauber((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html) || [])[1]);
  let text = meta(html, "description") || meta(html, "og:description");
  if (!text) {
    /* Keine Beschreibung hinterlegt: erster längerer Absatz der Seite. */
    const ohneSkripte = html.replace(/<(script|style|nav|header|footer)\b[\s\S]*?<\/\1>/gi, " ");
    for (const p of ohneSkripte.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) || []) {
      const t = sauber(p);
      if (t.length >= 80 && !/cookie|datenschutz|javascript/i.test(t)) { text = t; break; }
    }
  }
  return { titel: kuerzen(titel, 120), text: kuerzen(text) };
}

/* Adresse vervollständigen und nur öffentliche http(s)-Ziele zulassen. */
export function websiteAdresse(eingabe) {
  let u = String(eingabe || "").trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const url = new URL(u);
    if (!/^https?:$/.test(url.protocol)) return "";
    if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[)/i.test(url.hostname) || !url.hostname.includes(".")) return "";
    return url.toString();
  } catch { return ""; }
}

export async function holeWebsiteInfo(eingabe) {
  const url = websiteAdresse(eingabe);
  if (!url) return { ok: false, fehler: "Keine gültige Website-Adresse" };
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Jobbahn-Vergleicher)", "Accept": "text/html", "Accept-Language": "de" },
      signal: AbortSignal.timeout(7000)
    });
    if (!res.ok) return { ok: false, url, fehler: `Website antwortet mit HTTP ${res.status}` };
    const info = ausHtml(await res.text());
    if (!info.text) return { ok: false, url, titel: info.titel, fehler: "Auf der Startseite steht keine Kurzbeschreibung – bitte selbst 1–2 Sätze eintragen" };
    return { ok: true, url, ...info };
  } catch (err) {
    return { ok: false, url, fehler: "Website nicht erreichbar" };
  }
}
