// 3 Logo-Varianten „Fachkräfte Kompass“ zur Auswahl (Plus Jakarta Sans 800, Markenfarben).
// Aufruf: node werbung/logo/varianten/bauen.cjs → PNGs + Übersicht in werbung/logo/varianten/
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname;
const font = path.join(D, "..", "..", "posts", "img", "plus-jakarta-sans-var.woff2");
const N = "#0F1B2D", K = "#2B59C3", H = "#7FA2F0", M = "#5A85E6", Wt = "#FFFFFF", HB = "#EAF0FB";
// Kompass-Zeichen: Ring + Nadel (Nord/Süd)
const kompass = (ring, nord, sued, mitte, rw = 72) => {
  const R = 300, L = (R - rw) * 0.86, Wd = L * 0.36, a = 35 * Math.PI / 180;
  const pt = (dx, dy) => `${(dx * Math.cos(a) - dy * Math.sin(a)).toFixed(1)},${(dx * Math.sin(a) + dy * Math.cos(a)).toFixed(1)}`;
  return `<circle r="${R - rw / 2}" fill="none" stroke="${ring}" stroke-width="${rw}"/>
    <path fill="${sued}" d="M${pt(0, L)}L${pt(Wd, 0)}L${pt(-Wd, 0)}Z"/><path fill="${nord}" d="M${pt(0, -L)}L${pt(Wd, 0)}L${pt(-Wd, 0)}Z"/>
    <circle r="${(Wd * 0.42).toFixed(1)}" fill="${mitte}"/>`;
};
// Kompass als Buchstabe „o“ (in Schrifthöhe)
const oKompass = (ring, nord, sued, mitte) =>
  `<svg class="o" viewBox="-300 -300 600 600">${kompass(ring, nord, sued, mitte, 92)}</svg>`;
const kompassWort = (farbe, ring, nord, sued, mitte) =>
  `<span style="color:${farbe}">k${oKompass(ring, nord, sued, mitte)}mpass</span>`;

const varianten = {
  // A) Gestapeltes Emblem: Kompass oben, Schrift darunter
  "A-emblem": (dunkel) => {
    const t = dunkel ? Wt : N, a = dunkel ? H : K;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:26px;padding:50px 70px">
      <svg width="210" height="210" viewBox="-400 -400 800 800">${kompass(a, dunkel ? Wt : N, dunkel ? H : M, dunkel ? N : Wt)}</svg>
      <div style="text-align:center;line-height:1">
        <div style="font-size:34px;letter-spacing:.42em;margin-right:-.42em;color:${a};font-weight:700">FACHKRÄFTE</div>
        <div style="font-size:112px;letter-spacing:-.02em;color:${t};margin-top:6px">kompass</div>
      </div></div>`;
  },
  // B) Zeichen links + zweizeilig
  "B-zweizeilig": (dunkel) => {
    const t = dunkel ? Wt : N, a = dunkel ? H : K;
    return `<div style="display:flex;align-items:center;gap:30px;padding:40px 60px">
      <svg width="190" height="190" viewBox="-400 -400 800 800"><rect x="-400" y="-400" width="800" height="800" rx="190" fill="${dunkel ? K : N}"/>${kompass(dunkel ? Wt : M, Wt, dunkel ? H : M, dunkel ? K : N)}</svg>
      <div style="line-height:.9;letter-spacing:-.025em">
        <div style="font-size:96px;color:${a}">fachkräfte</div>
        <div style="font-size:96px;color:${t}">kompass</div>
      </div></div>`;
  },
  // C) Einzeilig, Kompass ersetzt das „o“, zweifarbig
  "C-einzeilig": (dunkel) => {
    const t = dunkel ? Wt : N, a = dunkel ? H : K;
    return `<div style="padding:50px 60px;font-size:120px;letter-spacing:-.025em;line-height:1;white-space:nowrap">
      <span style="color:${t}">fachkräfte</span> ${kompassWort(a, a, dunkel ? Wt : N, dunkel ? H : M, dunkel ? N : Wt)}</div>`;
  },
};
const css = `@font-face{font-family:PJS;src:url("file://${font}") format("woff2");font-weight:200 800}
  body{margin:0;font-family:PJS;font-weight:800}
  .o{height:.6em;width:.6em;vertical-align:-.03em;margin:0 .02em}`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2400, height: 1400 } });
  const tmp = path.join(D, "_tmp.html");
  const render = async (html, datei, bg) => {
    fs.writeFileSync(tmp, `<html><head><style>${css}</style></head><body style="background:${bg || "transparent"}"><div id="x" style="display:inline-block;background:${bg || "transparent"}">${html}</div></body></html>`);
    await p.goto("file://" + tmp); await p.evaluate(() => document.fonts.ready);
    await (await p.$("#x")).screenshot({ path: path.join(D, datei), omitBackground: !bg });
  };
  // Einzeldateien (transparent)
  for (const [name, f] of Object.entries(varianten)) {
    await render(f(false), `logo-${name}-hell.png`);
    await render(f(true), `logo-${name}-dunkel.png`);
  }
  // Übersicht
  const titel = { "A-emblem": "A · Emblem", "B-zweizeilig": "B · Zeichen + zweizeilig", "C-einzeilig": "C · Einzeilig, Kompass als „o“" };
  const zeilen = Object.entries(varianten).map(([n, f]) => `
    <div style="font-size:40px;color:${N};margin:50px 0 18px">${titel[n]}</div>
    <div style="display:flex;gap:30px">
      <div style="flex:1;background:${HB};border-radius:28px;display:grid;place-items:center;min-height:420px">${f(false)}</div>
      <div style="flex:1;background:${N};border-radius:28px;display:grid;place-items:center;min-height:420px">${f(true)}</div>
    </div>`).join("");
  await render(`<div style="width:2300px;padding:10px 50px 60px;box-sizing:border-box;zoom:1">${zeilen.replace(/font-size:120px/g, "font-size:84px")}</div>`, "uebersicht-logos.jpg", "#FFFFFF");
  fs.unlinkSync(tmp); await b.close(); console.log("fertig");
})();
