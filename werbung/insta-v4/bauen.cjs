// 9 Instagram-Posts „Vorstellung & Ablauf“ im Stil der ersten Profil-Posts – moderner und aufgeräumter.
// Format 4:5 (1080×1350). Aufruf: node werbung/insta-v4/bauen.cjs → fertig/
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname, OUT = path.join(D, "fertig");
const IMG = path.join(D, "..", "posts", "img"), TEAM = path.join(D, "..", "insta-posts", "team-hd");
fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1350;
const u = f => `file://${f}`;

const CSS = `@font-face{font-family:PJS;font-weight:400 800;src:url("${u(IMG + "/plus-jakarta-sans-var.woff2")}") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
:root{--s:#2B59C3;--n:#0F1B2D;--h:#7FA2F0}
html,body{width:${W}px;height:${H}px;overflow:hidden;font-family:PJS,sans-serif;color:#fff;background:var(--n);-webkit-font-smoothing:antialiased}
.bg{position:absolute;inset:0;background:radial-gradient(70% 45% at 92% 4%,rgba(43,89,195,.6),transparent 70%),radial-gradient(60% 40% at 0% 100%,rgba(43,89,195,.35),transparent 70%),linear-gradient(180deg,#13223A,#0B1526)}
.raster{position:absolute;inset:0;background-image:radial-gradient(rgba(127,162,240,.13) 1.6px,transparent 2px);background-size:26px 26px;-webkit-mask-image:linear-gradient(180deg,#000,transparent 60%)}
.korn{position:absolute;inset:0;opacity:.06;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.wrap{position:absolute;inset:0;padding:84px 80px 0}
.kicker{display:inline-flex;align-items:center;gap:12px;background:var(--h);color:var(--n);font-weight:800;font-size:24px;letter-spacing:2.5px;padding:12px 22px;border-radius:999px;box-shadow:5px 5px 0 var(--s)}
h1{font-weight:800;font-size:96px;line-height:1;letter-spacing:-3.5px;margin-top:30px}
h1 em{font-style:normal;color:var(--h)}
.sub{font-weight:600;font-size:34px;line-height:1.32;color:#C9D6F5;margin-top:22px}
.sub b{color:#fff}
.panel{position:absolute;border:7px solid #fff;border-radius:24px;overflow:hidden;box-shadow:16px 16px 0 var(--s),0 30px 60px rgba(0,0,0,.45);background:var(--n)}
.panel img{display:block;width:100%;height:100%;object-fit:cover}
.karte{position:absolute;background:rgba(22,38,63,.92);border:2px solid rgba(255,255,255,.14);border-radius:26px;box-shadow:12px 12px 0 var(--s);backdrop-filter:blur(6px)}
.blase{position:absolute;background:#fff;color:var(--n);border-radius:32px;padding:22px 30px;font-weight:800;font-size:36px;line-height:1.15;box-shadow:10px 10px 0 var(--s);white-space:nowrap}
.burst{position:absolute;display:grid;place-items:center;text-align:center}
.burst svg{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(8px 8px 0 #0B1426)}
.burst span{position:relative;font-weight:800;color:var(--n);line-height:1;letter-spacing:-.5px}
.chip{display:inline-flex;align-items:center;gap:12px;background:rgba(22,38,63,.9);border:2px solid rgba(127,162,240,.5);border-radius:999px;padding:14px 24px;font-weight:700;font-size:28px}
.chip i{font-style:normal;width:34px;height:34px;border-radius:50%;background:var(--h);color:var(--n);display:grid;place-items:center;font-size:20px;font-weight:800}
.fuss{position:absolute;left:80px;right:80px;bottom:62px;display:flex;align-items:center;justify-content:space-between}
.fuss img{height:38px}.fuss span{font-weight:700;font-size:26px;color:var(--h)}
.nr{position:absolute;right:80px;top:96px;font-weight:800;font-size:26px;letter-spacing:.14em;color:rgba(255,255,255,.45)}`;

function burst(w, txt, size, rot, pos) {
  const pts = []; for (let i = 0; i < 32; i++) { const r = i % 2 ? .8 : 1, a = Math.PI * i / 16; pts.push(`${50 + 50 * r * Math.cos(a)},${50 + 50 * r * Math.sin(a)}`); }
  return `<div class="burst" style="width:${w}px;height:${w}px;transform:rotate(${rot}deg);${pos}"><svg viewBox="0 0 100 100"><polygon points="${pts.join(" ")}" fill="#7FA2F0" stroke="#fff" stroke-width="1.6"/></svg><span style="font-size:${size}px">${txt}</span></div>`;
}
const handy = (inhalt, pos) => `<div style="position:absolute;${pos};width:410px;height:740px;border-radius:60px;background:#0B1220;border:12px solid #fff;box-shadow:18px 18px 0 var(--s),0 40px 80px rgba(0,0,0,.5);overflow:hidden">
  <div style="position:absolute;left:50%;top:18px;transform:translateX(-50%);width:130px;height:34px;border-radius:20px;background:#000"></div>${inhalt}</div>`;
const seite = (nr, inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="bg"></div><div class="raster"></div><div class="korn"></div>
  <div class="wrap">${inner}</div><span class="nr">${String(nr).padStart(2, "0")} / 09</span>
  <div class="fuss"><img src="${u(IMG + "/fachkraefte-kompass-logo-weiss.png")}"><span>Link in der Bio</span></div></body></html>`;

const P = [];
// 1 – Wer wir sind (Team)
P.push(`<span class="kicker">👋 HI, WIR SIND</span>
  <h1>Fachkräfte<br><em>Kompass.</em></h1>
  <div class="sub">Dein <b>Einstellungspartner</b> – wir finden den Job, der zu dir passt.</div>
  <div class="panel" style="left:80px;top:610px;width:600px;height:500px;transform:rotate(-3deg)"><img src="${u(TEAM + "/team-gruppe.jpg")}" style="object-position:30% 40%"></div>
  <div class="panel" style="left:610px;top:560px;width:330px;height:420px;transform:rotate(4deg)"><img src="${u(TEAM + "/team-ansprechpartner.jpg")}" style="object-position:50% 20%"></div>
  ${burst(210, "AUS<br>ROTT-<br>WEIL", 34, 12, "right:56px;top:960px")}`);
// 2 – Problem
P.push(`<span class="kicker">KENNST DU DAS?</span>
  <h1>Dein Job<br><em>passt nicht mehr?</em></h1>
  <div class="panel" style="left:80px;top:500px;width:920px;height:470px;transform:rotate(-1.5deg)"><img src="${u(IMG + "/trott.jpg")}" style="object-position:50% 45%"></div>
  <div style="position:absolute;left:80px;right:80px;top:1040px;display:flex;flex-wrap:wrap;gap:14px">
    ${["Lohn steht still", "Kein Danke vom Chef", "Jeden Tag Stau", "Samstag schon wieder"].map(t => `<span class="chip"><i>✓</i>${t}</span>`).join("")}</div>`);
// 3 – Lösung
P.push(`<span class="kicker">UNSER JOB</span>
  <h1>Wir finden einen,<br><em>der passt.</em></h1>
  <div class="sub">Für dich gesucht – <b>in deiner Nähe.</b></div>
  <div class="panel" style="left:80px;top:580px;width:920px;height:520px;transform:rotate(1.5deg)"><img src="${u(IMG + "/treppe.jpg")}" style="object-position:50% 40%"></div>
  ${burst(220, "BESSER<br>ALS<br>VORHER", 32, -12, "right:40px;top:470px")}`);
// 4 – Schritt 1
P.push(`<span class="kicker">SCHRITT 1</span>
  <h1>Kurzprofil<br><em>in 2 Minuten.</em></h1>
  <div class="sub">Ohne Lebenslauf.<br>Ohne Anschreiben.</div>
  ${handy(`<div style="padding:80px 32px 0">
     <div style="font-weight:800;font-size:30px">Dein Kurzprofil</div>
     <div style="height:10px;border-radius:5px;background:#1A2438;margin:18px 0 30px"><div style="width:62%;height:100%;border-radius:5px;background:var(--h)"></div></div>
     ${["Beruf", "Was du machst", "Wohnort", "Kontakt"].map((t, i) => `<div style="margin-top:14px;font-size:19px;font-weight:700;color:#A3AEBF">${t}</div><div style="height:54px;border-radius:14px;margin-top:6px;background:${i < 2 ? "#1B2A4A" : "#121B2C"};border:2px solid ${i < 2 ? "var(--h)" : "#26324A"};display:flex;align-items:center;padding:0 18px;font-size:22px;font-weight:700;color:${i < 2 ? "#fff" : "#4A5568"}">${["Elektroniker ✓", "Schaltschränke ✓", "…", "…"][i]}</div>`).join("")}
     <div style="margin-top:24px;height:64px;border-radius:999px;background:var(--h);color:var(--n);display:grid;place-items:center;font-weight:800;font-size:26px">Weiter →</div></div>`, "right:96px;top:420px;transform:rotate(5deg)")}
  ${burst(220, "NUR<br>2 MIN", 46, -10, "left:90px;top:760px")}`);
// 5 – Schritt 2 WhatsApp
const b = (wer, t) => `<div style="max-width:300px;align-self:${wer === "du" ? "flex-end" : "flex-start"};background:${wer === "du" ? "#2B59C3" : "#1A2438"};border-radius:22px;${wer === "du" ? "border-bottom-right-radius:6px" : "border-bottom-left-radius:6px"};padding:14px 18px;font-size:21px;font-weight:600;line-height:1.3">${t}</div>`;
P.push(`<span class="kicker">SCHRITT 2</span>
  <h1>Kurz per<br><em>WhatsApp.</em></h1>
  <div class="sub">Ein paar Fragen –<br><b>mehr nicht.</b></div>
  ${handy(`<div style="padding:70px 0 0"><div style="display:flex;align-items:center;gap:14px;padding:12px 22px 16px;border-bottom:1px solid #26324A">
      <div style="width:50px;height:50px;border-radius:50%;background:var(--h);display:grid;place-items:center;color:var(--n);font-weight:800;font-size:22px">FK</div>
      <div><div style="font-weight:800;font-size:22px">Fachkräfte Kompass</div><div style="font-size:16px;color:#7FA2F0">online</div></div></div>
    <div style="display:flex;flex-direction:column;gap:12px;padding:22px 20px">
      ${b("fk", "Hi Max 👋 Danke für dein Profil! Ab wann könntest du starten?")}${b("du", "In 3 Monaten")}
      ${b("fk", "Top! Und welche Arbeitszeiten gehen für dich?")}${b("du", "Tagschicht, gern Gleitzeit")}
      ${b("fk", "Perfekt – wir rufen dich morgen kurz an 📞")}</div></div>`, "right:90px;top:430px;transform:rotate(-4deg)")}
  ${burst(210, "2 MIN<br>FERTIG", 38, 10, "left:90px;top:780px")}`);
// 6 – Schritt 3 Anruf (Team)
P.push(`<span class="kicker">SCHRITT 3</span>
  <h1>Wir rufen<br><em>dich an.</em></h1>
  <div class="sub">Ein echter Mensch. <b>Kein Bot.</b></div>
  <div class="panel" style="left:80px;top:590px;width:920px;height:540px;transform:rotate(-2deg)"><img src="${u(TEAM + "/team-headset.jpg")}" style="object-position:50% 64%"></div>
  <div class="blase" style="right:70px;top:520px;transform:rotate(3deg)">„Hallo! Erzähl mal –<br>was suchst du?“
    <div style="position:absolute;left:60px;bottom:-30px;border-left:20px solid transparent;border-right:20px solid transparent;border-top:34px solid #fff"></div></div>`);
// 7 – Schritt 4 Du entscheidest
P.push(`<span class="kicker">SCHRITT 4</span>
  <h1>Du<br><em>entscheidest.</em></h1>
  <div class="sub">Wir stellen dir passende Betriebe vor – <b>du sagst Ja oder Nein.</b></div>
  <div class="panel" style="left:80px;top:640px;width:920px;height:440px;transform:rotate(1.5deg)"><img src="${u(TEAM + "/team-handy.jpg")}" style="object-position:50% 30%"></div>
  <div style="position:absolute;right:110px;top:1035px;display:flex;gap:22px;transform:rotate(-2deg)">
    <span style="background:var(--s);border:6px solid #fff;border-radius:999px;padding:18px 44px;font-weight:800;font-size:44px;box-shadow:8px 8px 0 #0B1426">JA ✓</span>
    <span style="background:var(--n);border:6px solid #fff;border-radius:999px;padding:18px 44px;font-weight:800;font-size:44px;box-shadow:8px 8px 0 #0B1426">NEIN ✕</span></div>`);
// 8 – Kostenlos
P.push(`<span class="kicker">FÜR DICH</span>
  <h1>Was kostet<br>dich <em>das?</em></h1>
  <div style="position:absolute;left:60px;top:520px;font-weight:800;font-size:330px;line-height:1;letter-spacing:-14px;color:var(--h);text-shadow:14px 14px 0 #2B59C3,28px 28px 0 rgba(0,0,0,.35)">0&nbsp;€</div>
  <div class="panel" style="left:640px;top:540px;width:350px;height:430px;transform:rotate(5deg)"><img src="${u(IMG + "/gehalt.jpg")}" style="object-position:40% 50%"></div>
  <div style="position:absolute;left:80px;top:1000px;width:560px;font-weight:600;font-size:36px;line-height:1.3;color:#C9D6F5"><b style="color:#fff">Nichts.</b> Die Betriebe zahlen uns – nicht du.</div>
  ${burst(200, "100 %<br>GRATIS", 36, -12, "right:56px;top:980px")}`);
// 9 – Chef erfährt nichts
P.push(`<span class="kicker">🔒 100 % DISKRET</span>
  <h1>Dein Chef<br>erfährt <em>nichts.</em></h1>
  <div class="panel" style="left:80px;top:560px;width:920px;height:520px;transform:rotate(-2deg)"><img src="${u(IMG + "/chef.jpg")}" style="object-position:50% 30%"></div>
  <div class="blase" style="right:70px;top:480px;transform:rotate(3deg)">„Alles wie immer …“ 🙈
    <div style="position:absolute;left:60px;bottom:-30px;border-left:20px solid transparent;border-right:20px solid transparent;border-top:34px solid #fff"></div></div>
  <div style="position:absolute;left:80px;right:80px;top:1120px;font-weight:600;font-size:32px;color:#C9D6F5">Dein Profil sieht ein Betrieb erst, <b style="color:#fff">wenn du Ja sagst.</b></div>`);

(async () => {
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: W, height: H } });
  const tmp = path.join(D, "_tmp.html");
  for (let i = 0; i < P.length; i++) {
    fs.writeFileSync(tmp, seite(i + 1, P[i]));
    await pg.goto(u(tmp)); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(150);
    await pg.screenshot({ path: path.join(OUT, `fk-post-${String(i + 1).padStart(2, "0")}.jpg`), type: "jpeg", quality: 93 });
  }
  fs.unlinkSync(tmp); await br.close(); console.log("fertig");
})();
