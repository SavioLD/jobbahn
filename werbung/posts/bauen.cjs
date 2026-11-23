// Baut die 12 Instagram-Profil-Posts (1080x1350) für Fachkräfte Kompass.
// Aufruf: node werbung/posts/bauen.cjs   →  Bilder landen in werbung/posts/fertig/
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const DIR = __dirname;
const OUT = path.join(DIR, "fertig");
fs.mkdirSync(OUT, { recursive: true });

const CSS = `
@font-face{font-family:"PJS";font-weight:400 800;src:url("img/plus-jakarta-sans-var.woff2") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
:root{--schatten:#2B59C3}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:"PJS",sans-serif;color:#fff;background:#0F1B2D;position:relative}
.bg{position:absolute;inset:0;background:radial-gradient(circle at 85% 8%, rgba(43,89,195,.55), transparent 42%),radial-gradient(circle at 5% 95%, rgba(43,89,195,.35), transparent 40%),#0F1B2D}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(127,162,240,.16) 2.2px, transparent 2.8px);background-size:24px 24px;-webkit-mask-image:linear-gradient(160deg,#000 0%,transparent 55%,#000 100%)}
.wrap{position:absolute;inset:0;padding:78px 76px 0}
.kicker{display:inline-block;background:#7FA2F0;color:#0F1B2D;font-weight:800;font-size:26px;letter-spacing:3px;padding:12px 22px;border-radius:10px;transform:rotate(-2deg);box-shadow:6px 6px 0 var(--schatten)}
h1{font-weight:800;font-size:104px;line-height:.98;letter-spacing:-3px;margin-top:34px}
h1 em{font-style:normal;color:#7FA2F0}
.sub{font-weight:600;font-size:36px;line-height:1.3;color:#C9D6F5;margin-top:26px}
.sub b{color:#fff;font-weight:800}
.panel{position:absolute;border:10px solid #fff;border-radius:14px;overflow:hidden;box-shadow:20px 20px 0 var(--schatten),0 30px 60px rgba(0,0,0,.45);background:#0F1B2D}
.panel img{display:block;width:100%;height:100%;object-fit:cover}
.burst{position:absolute;display:grid;place-items:center;text-align:center}
.burst svg{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(8px 8px 0 #0B1426)}
.burst span{position:relative;font-weight:800;color:#0F1B2D;line-height:1;letter-spacing:-1px}
.foot{position:absolute;left:76px;right:76px;bottom:70px;display:flex;align-items:center;justify-content:space-between}
.foot img{height:42px}
.foot .url{font-weight:700;font-size:28px;color:#7FA2F0;letter-spacing:.5px}
/* Posts 7–12: Textmarker-Überschriften und drei Farbwelten */
body.markiert h1{text-shadow:6px 6px 0 rgba(0,0,0,.35);line-height:1.14}
body.markiert h1 em{color:#0F1B2D;background:#7FA2F0;padding:0 14px;border-radius:10px;-webkit-box-decoration-break:clone;box-decoration-break:clone;text-shadow:none}
body.kobalt{background:#2B59C3;--schatten:#0F1B2D}
body.kobalt .bg{background:radial-gradient(circle at 85% 8%, rgba(127,162,240,.55), transparent 45%),radial-gradient(circle at 5% 95%, rgba(15,27,45,.45), transparent 45%),#2B59C3}
body.kobalt .dots{background-image:radial-gradient(rgba(15,27,45,.22) 2.4px, transparent 3px)}
body.kobalt h1 em{background:#fff;color:#2B59C3}
body.kobalt .kicker{background:#0F1B2D;color:#fff;box-shadow:6px 6px 0 #7FA2F0}
body.kobalt .sub{color:#EAF0FB}
body.kobalt .foot .url{color:#fff}
body.hell{background:#EAF0FB;color:#0F1B2D}
body.hell .bg{background:radial-gradient(circle at 85% 8%, rgba(127,162,240,.55), transparent 45%),radial-gradient(circle at 5% 95%, rgba(127,162,240,.35), transparent 45%),#EAF0FB}
body.hell .dots{background-image:radial-gradient(rgba(43,89,195,.18) 2.4px, transparent 3px)}
body.hell h1{color:#0F1B2D;text-shadow:5px 5px 0 rgba(43,89,195,.25)}
body.hell h1 em{background:#2B59C3;color:#fff}
body.hell .kicker{background:#0F1B2D;color:#fff;box-shadow:6px 6px 0 #7FA2F0}
body.hell .sub,body.hell [style*="color:#C9D6F5"]{color:#2B3A55 !important}
body.hell .txt b{color:#0F1B2D !important}
body.hell .foot .url{color:#2B59C3}
`;

function burst(w, h, color, text, size, rot, extra = "") {
  const pts = [];
  const n = 16;
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? 0.78 : 1;
    const a = (Math.PI * i) / n;
    pts.push(`${50 + 50 * r * Math.cos(a)},${50 + 50 * r * Math.sin(a)}`);
  }
  return `<div class="burst" style="width:${w}px;height:${h}px;transform:rotate(${rot}deg);${extra}">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="${pts.join(" ")}" fill="${color}" stroke="#fff" stroke-width="1.6"/></svg>
    <span style="font-size:${size}px">${text}</span></div>`;
}

const FOOT = (t) => `<div class="foot"><img src="img/${t.includes("hell") ? "fachkraefte-kompass-logo-nachtblau.png" : "fachkraefte-kompass-logo-weiss.png"}" alt=""><span class="url">Link in der Bio</span></div>`;
const page = (inner, t = "") => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body class="${t}"><div class="bg"></div><div class="dots"></div><div class="wrap">${inner}</div>${FOOT(t)}</body></html>`;

const posts = {};

/* ===================== Posts 1–6 ===================== */

/* 1 – So einfach geht's */
const step = (n, t, s, y, rot) => `
  <div style="position:absolute;left:76px;right:76px;top:${y}px;transform:rotate(${rot}deg);background:#16263F;border:6px solid #fff;border-radius:22px;
    box-shadow:14px 14px 0 var(--schatten);display:flex;align-items:center;gap:30px;padding:26px 34px">
    <div style="flex:none;width:112px;height:112px;border-radius:50%;background:#7FA2F0;border:6px solid #fff;display:grid;place-items:center;
      color:#0F1B2D;font-weight:800;font-size:66px">${n}</div>
    <div><div style="font-weight:800;font-size:46px;letter-spacing:-1px">${t}</div>
    <div style="font-weight:600;font-size:30px;color:#C9D6F5;margin-top:6px">${s}</div></div></div>`;
posts["1-so-einfach"] = page(`
  <span class="kicker">IN 3 SCHRITTEN</span>
  <h1>So einfach<br><em>geht's.</em></h1>
  ${step(1, "Kurzprofil ausfüllen", "2 Minuten. Ohne Lebenslauf.", 520, -1.2)}
  ${step(2, "Wir suchen für dich", "Bei Betrieben in deiner Nähe.", 740, 0.8)}
  ${step(3, "Du entscheidest", "Wir rufen an – du sagst Ja oder Nein.", 960, -0.8)}
  ${burst(260, 260, "#7FA2F0", "100 %<br>KOSTEN-<br>LOS", 38, 12, "position:absolute;right:60px;top:150px")}
`);

/* 2 – Kein Lebenslauf */
const paper = (label, x, y, rot, z) => `
  <div style="position:absolute;left:${x}px;top:${y}px;width:360px;height:470px;background:#F6F7F9;border-radius:12px;transform:rotate(${rot}deg);
    box-shadow:12px 12px 0 var(--schatten),0 20px 40px rgba(0,0,0,.4);z-index:${z};padding:36px 34px;color:#0F1B2D">
    <div style="font-weight:800;font-size:34px;letter-spacing:1px">${label}</div>
    ${[90, 70, 82, 60, 76, 88, 55, 72].map(w => `<div style="height:16px;width:${w}%;background:#C8D0DC;border-radius:8px;margin-top:22px"></div>`).join("")}
  </div>`;
posts["2-kein-lebenslauf"] = page(`
  <span class="kicker">BEWERBEN OHNE STRESS</span>
  <h1>Kein Lebenslauf.<br><em>Kein Anschreiben.</em></h1>
  <div class="sub">Nur ein <b>2-Minuten-Kurzprofil</b>. Den Rest machen wir.</div>
  ${paper("LEBENSLAUF", 90, 640, -9, 1)}
  ${paper("ANSCHREIBEN", 360, 610, 3, 2)}
  ${paper("ZEUGNISSE", 620, 650, 11, 3)}
  <div style="position:absolute;left:150px;top:780px;z-index:5;transform:rotate(-14deg);border:12px solid #7FA2F0;border-radius:20px;padding:18px 34px;
    color:#7FA2F0;font-weight:800;font-size:68px;letter-spacing:2px;background:rgba(15,27,45,.88);box-shadow:0 20px 50px rgba(0,0,0,.5)">BRAUCHST DU<br>NICHT!</div>
  ${burst(230, 230, "#7FA2F0", "NUR<br>2 MIN", 46, -10, "position:absolute;right:56px;top:470px;z-index:6")}
`);

/* 3 – Dein Chef erfährt nichts */
posts["3-chef-erfaehrt-nichts"] = page(`
  <span class="kicker">100 % DISKRET</span>
  <h1>Dein Chef<br>erfährt <em>nichts.</em></h1>
  <div class="panel" style="left:96px;top:560px;width:888px;height:560px;transform:rotate(-2deg)"><img src="img/chef.jpg" style="object-position:50% 30%"></div>
  <div style="position:absolute;left:470px;top:462px;z-index:4;white-space:nowrap;background:#fff;color:#0F1B2D;border-radius:40px;padding:26px 34px;font-weight:800;font-size:40px;
    transform:rotate(3deg);box-shadow:10px 10px 0 var(--schatten)">„Alles wie immer …“ 🙈
    <div style="position:absolute;left:70px;bottom:-34px;width:0;height:0;border-left:22px solid transparent;border-right:22px solid transparent;border-top:40px solid #fff"></div></div>
  <div style="position:absolute;left:76px;right:76px;top:1150px;font-weight:600;font-size:32px;color:#C9D6F5;line-height:1.3">
    Dein Profil sieht ein Betrieb erst, <b style="color:#fff">wenn du Ja sagst.</b></div>
`);

/* 4 – Kostenlos */
posts["4-kostenlos"] = page(`
  <span class="kicker">FÜR BEWERBER</span>
  <h1>Was kostet<br>dich <em>das?</em></h1>
  <div style="position:absolute;left:56px;top:560px;font-weight:800;font-size:320px;line-height:1;letter-spacing:-14px;color:#7FA2F0;
    text-shadow:14px 14px 0 #2B59C3, 28px 28px 0 rgba(0,0,0,.35)">0&nbsp;€</div>
  <div class="panel" style="left:650px;top:560px;width:340px;height:420px;transform:rotate(5deg)"><img src="img/gehalt.jpg" style="object-position:40% 50%"></div>
  <div style="position:absolute;left:76px;top:1000px;width:560px;font-weight:600;font-size:36px;line-height:1.3;color:#C9D6F5">
    <b style="color:#fff">Nichts.</b> Die Betriebe zahlen uns – nicht du.</div>
  ${burst(210, 210, "#7FA2F0", "100 %<br>GRATIS", 38, -12, "position:absolute;right:40px;top:96px")}
`);

/* 5 – Einstellungspartner vs Jobportal */
const vsPanel = (x, rot, img, grau, titel, punkte, farbe) => `
  <div style="position:absolute;left:${x}px;top:560px;width:430px;transform:rotate(${rot}deg)">
    <div class="panel" style="position:relative;width:430px;height:330px;${grau ? "box-shadow:16px 16px 0 #3A4558" : ""}">
      <img src="img/${img}.jpg" style="${grau ? "filter:grayscale(1) brightness(.7)" : ""};object-position:50% 40%"></div>
    <div style="margin-top:36px;font-weight:800;font-size:38px;letter-spacing:-1px;color:${farbe}">${titel}</div>
    ${punkte.map(p => `<div style="font-weight:700;font-size:29px;margin-top:14px;color:${grau ? "#A3AEBF" : "#fff"}">${p}</div>`).join("")}
  </div>`;
posts["5-einstellungspartner"] = page(`
  <span class="kicker">WER WIR SIND</span>
  <h1 style="font-size:92px">Einstellungs&shy;partner.<br><em>Kein Jobportal.</em></h1>
  ${vsPanel(66, -2, "trott", true, "Jobportal", ["✕ 50 Bewerbungen", "✕ Keine Antwort", "✕ Alles selbst machen"], "#A3AEBF")}
  ${vsPanel(584, 2, "treppe", false, "Fachkräfte Kompass", ["✓ 2-Min-Kurzprofil", "✓ Wir rufen dich an", "✓ Wir suchen für dich"], "#7FA2F0")}
  ${burst(170, 170, "#7FA2F0", "VS", 64, -8, "position:absolute;left:455px;top:640px;z-index:5")}
`);

/* 6 – Du entscheidest */
posts["6-du-entscheidest"] = page(`
  <span class="kicker">OHNE DRUCK</span>
  <h1>Du entscheidest.<br><em>Immer.</em></h1>
  <div class="sub">Wir stellen dir passende Betriebe vor – <b>du sagst Ja oder Nein.</b></div>
  <div class="panel" style="left:96px;top:600px;width:888px;height:500px;transform:rotate(1.5deg)"><img src="img/treppe.jpg" style="object-position:50% 25%"></div>
  <div style="position:absolute;left:120px;top:1050px;z-index:4;display:flex;gap:26px;transform:rotate(-2deg)">
    <div style="background:#2B59C3;border:6px solid #fff;border-radius:999px;padding:18px 46px;font-weight:800;font-size:46px;box-shadow:10px 10px 0 #0B1426">JA ✓</div>
    <div style="background:#0F1B2D;border:6px solid #fff;border-radius:999px;padding:18px 46px;font-weight:800;font-size:46px;box-shadow:10px 10px 0 #0B1426">NEIN ✕</div>
  </div>
`);

/* ===================== Posts 7–12 ===================== */
const hero = (img, h, pos = "50% 50%") => `
  <div style="position:absolute;left:0;top:0;width:1080px;height:${h}px;overflow:hidden;transform:skewY(-2.5deg);transform-origin:0 0;border-bottom:12px solid #fff;box-shadow:0 14px 0 var(--schatten)">
    <img src="${img}" style="width:100%;height:115%;object-fit:cover;object-position:${pos};transform:skewY(2.5deg);transform-origin:0 0">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,27,45,.0) 55%,rgba(15,27,45,.55) 100%)"></div></div>`;
const kick = (t, top) => `<span class="kicker" style="position:absolute;left:76px;top:${top}px;z-index:6">${t}</span>`;
const H = (html, top, size = 84) => `<h1 style="position:absolute;left:76px;right:76px;top:${top}px;margin:0;font-size:${size}px;z-index:5">${html}</h1>`;
const thumb = (img, w, h, rot, pos = "50% 50%") => `<div class="panel" style="position:relative;flex:none;width:${w}px;height:${h}px;transform:rotate(${rot}deg);border-width:7px;box-shadow:10px 10px 0 var(--schatten)"><img src="${img}" style="object-position:${pos}"></div>`;
const kompass = (size) => {
  const R = 300, ring = 72, L = (R - ring) * 0.86, W = L * 0.36, a = 35 * Math.PI / 180;
  const pt = (dx, dy) => `${(dx * Math.cos(a) - dy * Math.sin(a)).toFixed(1)},${(dx * Math.sin(a) + dy * Math.cos(a)).toFixed(1)}`;
  return `<svg width="${size}" height="${size}" viewBox="-320 -320 640 640"><circle r="${R - ring / 2}" fill="none" stroke="#2B59C3" stroke-width="${ring}"/>
    <path fill="#2B59C3" d="M${pt(0, L)}L${pt(W, 0)}L${pt(-W, 0)}Z"/><path fill="#7FA2F0" d="M${pt(0, -L)}L${pt(W, 0)}L${pt(-W, 0)}Z"/><circle r="${(W * 0.42).toFixed(1)}" fill="#fff"/></svg>`;
};

/* 7 – 5 Zeichen */
const zeichen = ["Sonntag schon Bauchweh", "Kein Danke vom Chef", "Lohn steht still", "Keine Weiterbildung", "Nur noch Dienst nach Vorschrift"];
posts["7-fuenf-zeichen"] = page(`
  ${hero("img/sonntag.jpg", 640, "50% 40%")}
  ${kick("CHECK DICH SELBST", 40)}
  ${H("5 Zeichen, dass es Zeit ist für <em>was Neues.</em>", 690, 80)}
  <div style="position:absolute;left:76px;right:60px;top:900px;display:flex;flex-wrap:wrap;gap:16px 16px">
    ${zeichen.map((z, i) => `<div style="display:flex;align-items:center;gap:12px;background:#16263F;border:4px solid #fff;border-radius:999px;padding:10px 22px 10px 12px;box-shadow:6px 6px 0 var(--schatten);transform:rotate(${i % 2 ? 1 : -1}deg)">
      <span style="width:40px;height:40px;border-radius:50%;background:#7FA2F0;color:#0F1B2D;display:grid;place-items:center;font-weight:800;font-size:26px">✓</span>
      <span style="font-weight:700;font-size:28px">${z}</span></div>`).join("")}
  </div>
  <div style="position:absolute;left:76px;top:1145px;font-weight:700;font-size:30px;color:#C9D6F5">Mehr als 2 Haken? <b style="color:#fff">Dann reden wir.</b></div>
`, "markiert");

/* 8 – Mythen */
const mythos = (img, pos, m, w, y, rot) => `
  <div style="position:absolute;left:66px;right:66px;top:${y}px;display:flex;align-items:center;gap:30px;transform:rotate(${rot}deg)">
    ${thumb(img, 210, 210, rot * -2, pos)}
    <div style="flex:1;background:#16263F;border:5px solid #fff;border-radius:20px;box-shadow:10px 10px 0 var(--schatten);padding:20px 24px">
      <div style="font-weight:800;font-size:20px;letter-spacing:2px;color:#A3AEBF">MYTHOS</div>
      <div style="font-weight:700;font-size:27px;color:#A3AEBF;text-decoration:line-through;text-decoration-color:#7FA2F0;text-decoration-thickness:4px;margin-top:2px">${m}</div>
      <div style="font-weight:800;font-size:20px;letter-spacing:2px;color:#7FA2F0;margin-top:12px">WAHRHEIT</div>
      <div style="font-weight:800;font-size:31px;margin-top:2px;line-height:1.15">${w}</div></div></div>`;
posts["8-mythen"] = page(`
  <span class="kicker">JOBWECHSEL-MYTHEN</span>
  <h1 style="font-size:90px">Stimmt das <em>überhaupt?</em></h1>
  ${mythos("img/trott.jpg", "48% 30%", "„Mit über 40 nimmt mich keiner.“", "Erfahrung ist gerade sehr gefragt.", 360, -0.8)}
  ${mythos("img/stau.jpg", "18% 30%", "„Ohne Lebenslauf geht nichts.“", "Bei uns reicht ein Kurzprofil.", 630, 0.8)}
  ${mythos("img/treppe.jpg", "45% 25%", "„Wechseln ist ein Risiko.“", "Bleiben, wo du unglücklich bist, auch.", 900, -0.6)}
`, "markiert kobalt");

/* 9 – Echter Mensch */
posts["9-echter-mensch"] = page(`
  <span class="kicker">KEIN BOT. KEIN CALLCENTER.</span>
  <h1 style="font-size:84px">Bei uns ruft ein <em>echter Mensch</em> an.</h1>
  <div style="position:absolute;left:330px;top:420px;width:410px;height:720px;transform:rotate(-6deg);background:#0B1426;border:12px solid #fff;border-radius:64px;box-shadow:22px 22px 0 var(--schatten),0 40px 80px rgba(0,0,0,.5);overflow:hidden">
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,#2B59C3,#0F1B2D 70%)"></div>
    <div style="position:absolute;left:50%;top:18px;transform:translateX(-50%);width:120px;height:26px;border-radius:20px;background:#000"></div>
    <div style="position:absolute;left:0;right:0;top:80px;text-align:center;font-weight:600;font-size:26px;color:#C9D6F4">Eingehender Anruf …</div>
    <div style="position:absolute;left:50%;top:140px;transform:translateX(-50%);width:170px;height:170px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 0 0 14px rgba(127,162,240,.35),0 0 0 30px rgba(127,162,240,.15)">${kompass(130)}</div>
    <div style="position:absolute;left:0;right:0;top:350px;text-align:center;font-weight:800;font-size:40px;line-height:1.05;color:#fff">Fachkräfte<br>Kompass</div>
    <div style="position:absolute;left:0;right:0;top:455px;text-align:center;font-weight:600;font-size:25px;color:#C9D6F4">Dein Einstellungspartner</div>
    <div style="position:absolute;left:58px;bottom:60px;width:104px;height:104px;border-radius:50%;background:#E5484D;display:grid;place-items:center;font-size:50px">✕</div>
    <div style="position:absolute;right:58px;bottom:60px;width:104px;height:104px;border-radius:50%;background:#30A46C;display:grid;place-items:center;font-size:50px;box-shadow:0 0 0 12px rgba(48,164,108,.3)">📞</div>
  </div>
  <div style="position:absolute;left:600px;top:600px;z-index:6;background:#fff;color:#0F1B2D;border-radius:36px;padding:22px 28px;font-weight:800;font-size:32px;line-height:1.2;width:380px;transform:rotate(3deg);box-shadow:10px 10px 0 var(--schatten)">
    „Hallo! Erzähl mal – was suchst du?“
    <div style="position:absolute;left:-34px;top:50px;width:0;height:0;border-top:20px solid transparent;border-bottom:20px solid transparent;border-right:40px solid #fff"></div></div>
  ${burst(190, 190, "#7FA2F0", "RING<br>RING", 40, -14, "position:absolute;left:90px;top:520px;z-index:6")}
  <div class="txt" style="position:absolute;left:76px;top:900px;width:250px;font-weight:600;font-size:29px;line-height:1.35;color:#C9D6F5;z-index:6">Wir hören zu und suchen <b style="color:#fff">gezielt für dich.</b></div>
`, "markiert hell");

/* 10 – Nochmal wählen */
posts["10-nochmal-waehlen"] = page(`
  ${hero("img/stau.jpg", 760, "40% 35%")}
  ${kick("EHRLICHE FRAGE", 40)}
  ${H("Würdest du deinen Job <em>nochmal wählen?</em>", 800, 88)}
  <div style="position:absolute;left:76px;top:1030px;display:flex;gap:24px;align-items:center;transform:rotate(-1.5deg)">
    <div style="background:#2B59C3;border:6px solid #fff;border-radius:999px;padding:14px 38px;font-weight:800;font-size:40px;box-shadow:8px 8px 0 #0B1426">JA 👍</div>
    <div style="background:#0F1B2D;border:6px solid #fff;border-radius:999px;padding:14px 38px;font-weight:800;font-size:40px;box-shadow:8px 8px 0 #0B1426">NEIN 👎</div>
    <div style="font-weight:700;font-size:28px;color:#C9D6F5;margin-left:8px">Ab in die<br>Kommentare 👇</div>
  </div>
`, "markiert");

/* 11 – Gesucht-Plakate */
const wanted = (img, label, x, y, rot, pos = "50% 40%") => `
  <div style="position:absolute;left:${x}px;top:${y}px;width:300px;transform:rotate(${rot}deg);background:#F2E8D5;border-radius:8px;padding:14px 14px 16px;box-shadow:12px 12px 0 var(--schatten),0 20px 40px rgba(0,0,0,.45)">
    <div style="text-align:center;font-weight:800;font-size:38px;letter-spacing:4px;color:#0F1B2D;line-height:1">GESUCHT</div>
    <div style="margin-top:10px;height:230px;border:4px solid #0F1B2D;overflow:hidden"><img src="${img}" style="width:100%;height:100%;object-fit:cover;object-position:${pos}"></div>
    <div style="text-align:center;font-weight:800;font-size:26px;color:#2B59C3;margin-top:10px">${label}</div></div>`;
posts["11-marktwert"] = page(`
  <span class="kicker">GUT ZU WISSEN</span>
  <h1 style="font-size:84px">Fachkräfte wie du sind gerade <em>Gold wert.</em></h1>
  ${wanted("img/trott.jpg", "Schlosser", 90, 470, -5, "50% 25%")}
  ${wanted("img/stau.jpg", "Monteur", 400, 440, 3, "20% 20%")}
  ${wanted("img/sonntag.jpg", "Elektronikerin", 700, 480, -3, "25% 30%")}
  ${wanted("img/treppe.jpg", "Handwerker", 250, 830, 4, "45% 15%")}
  ${wanted("img/chef.jpg", "Meister", 570, 820, -4, "50% 25%")}
  ${burst(220, 220, "#7FA2F0", "DEIN<br>MARKT-<br>WERT ↑", 34, 10, "position:absolute;right:30px;top:860px;z-index:8")}
`, "markiert hell");

/* 12 – 3 Tipps */
const tipp = (img, pos, n, t, s, y, rot) => `
  <div style="position:absolute;left:66px;right:66px;top:${y}px;display:flex;align-items:center;gap:28px;transform:rotate(${rot}deg)">
    <div style="position:relative">${thumb(img, 220, 200, rot * -2, pos)}
      <div style="position:absolute;left:-18px;top:-22px;width:78px;height:78px;border-radius:50%;background:#7FA2F0;border:5px solid #fff;display:grid;place-items:center;color:#0F1B2D;font-weight:800;font-size:44px;z-index:3">${n}</div></div>
    <div><div style="font-weight:800;font-size:40px;letter-spacing:-1px">${t}</div><div style="font-weight:600;font-size:27px;color:#C9D6F5;margin-top:6px;line-height:1.3">${s}</div></div></div>`;
posts["12-drei-tipps"] = page(`
  <span class="kicker">SPEICHERN 📌</span>
  <h1 style="font-size:84px">3 Tipps fürs <em>Vorstellungs&shy;gespräch.</em></h1>
  ${tipp("img/gehalt.jpg", "45% 55%", 1, "Kenn deine Zahl", "Überleg vorher, was du verdienen willst.", 440, -0.6)}
  ${tipp("img/chef.jpg", "50% 30%", 2, "Frag nach dem Chef", "Wie ist der Umgang im Team wirklich?", 690, 0.6)}
  ${tipp("img/stau.jpg", "70% 40%", 3, "Mehr als Geld", "Arbeitszeit, Fahrtweg und Weiterbildung zählen auch.", 940, -0.6)}
`, "markiert kobalt");

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  const tmp = path.join(DIR, "_seite.html");
  for (const [k, html] of Object.entries(posts)) {
    fs.writeFileSync(tmp, html);
    await p.goto("file://" + tmp);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(250);
    await p.screenshot({ path: path.join(OUT, `fachkraefte-kompass-post-${k}.jpg`), type: "jpeg", quality: 92 });
    console.log("ok", k);
  }
  fs.unlinkSync(tmp);
  await b.close();
})();
