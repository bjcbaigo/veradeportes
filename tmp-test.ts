import { generateDraftImage, deleteDraftImage, promoteDraftImage } from "/dev-server/src/lib/product-content-ai.server.ts";
const ref = "https://lh3.googleusercontent.com/d/1x"; // placeholder replaced below
const url = process.env.REF_URL!;
const r1 = await generateDraftImage("catalogo", { imagen_url: url, marca: "Adidas", modelo: "Test" });
console.log("gen1", r1.path, r1.previewUrl.includes("token") ? "SIGNED" : "NO-TOKEN");
// privacidad: URL pública debe fallar
const pub = `${process.env.SUPABASE_URL}/storage/v1/object/public/ai-drafts/${r1.path}`;
console.log("public access status", (await fetch(pub)).status);
console.log("signed access status", (await fetch(r1.previewUrl)).status);
const r2 = await generateDraftImage("catalogo", { imagen_url: url });
await deleteDraftImage(r1.path);
console.log("old draft after regen+delete", (await fetch(r1.previewUrl)).status);
const p = await promoteDraftImage(r2.path);
console.log("promoted", p.url, (await fetch(p.url)).status, "expira?", /token=/.test(p.url) ? "SI" : "NO");
console.log("draft removed after promote", (await fetch(r2.previewUrl)).status);
// hardening
for (const bad of ["http://127.0.0.1/a.png","http://169.254.169.254/x.png","file:///etc/passwd","http://10.0.0.5/a.png","http://[::1]/a.png"]) {
  try { await generateDraftImage("catalogo", { imagen_url: bad }); console.log("FAIL not blocked", bad); }
  catch (e) { console.log("blocked", bad, "->", (e as Error).message); }
}
