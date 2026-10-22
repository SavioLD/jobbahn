/* Nachbau der Cloudflare-D1-Schnittstelle auf node:sqlite – nur für Tests und den
   lokalen Server. Unterstützt genau das, was der Worker nutzt:
   prepare().bind().first()/all()/run() und batch(). */
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";

const MIGRATIONEN = new URL("../migrations/", import.meta.url);

export function lokaleD1(datei = ":memory:") {
  const db = new DatabaseSync(datei);
  for (const f of readdirSync(MIGRATIONEN).filter(f => f.endsWith(".sql")).sort()) {
    db.exec(readFileSync(new URL(f, MIGRATIONEN), "utf8"));
  }
  const flach = (r) => (r ? { ...r } : null);

  class Anweisung {
    constructor(sql, werte = []) { this.sql = sql; this.werte = werte; }
    bind(...werte) {
      for (const w of werte) if (w === undefined) throw new Error("D1: undefined kann nicht gebunden werden");
      return new Anweisung(this.sql, werte);
    }
    async first(spalte) { const r = flach(db.prepare(this.sql).get(...this.werte)); return r && spalte ? r[spalte] : r; }
    async all() { return { success: true, results: db.prepare(this.sql).all(...this.werte).map(flach) }; }
    async run() { const r = db.prepare(this.sql).run(...this.werte); return { success: true, meta: { changes: r.changes } }; }
    ausfuehren() { db.prepare(this.sql).run(...this.werte); }
  }

  return {
    prepare: (sql) => new Anweisung(sql),
    async batch(liste) {
      db.exec("BEGIN");
      try { for (const a of liste) a.ausfuehren(); db.exec("COMMIT"); }
      catch (e) { db.exec("ROLLBACK"); throw e; }
      return liste.map(() => ({ success: true }));
    },
    roh: db
  };
}
