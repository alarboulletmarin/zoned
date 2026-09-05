import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1600, deviceScaleFactor: 1 });
await page.evaluateOnNewDocument(() => { try { localStorage.setItem("zoned-theme", "dark"); } catch (e) {} });
page.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
page.on("console", (msg) => { if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text()); });

const draftId = "CUSTOM-adapted-test";
await page.goto(`http://localhost:5199/workout/builder/${draftId}?from=VMA-001`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1200));

console.log("url:", page.url());
const blocks = await page.evaluate(() =>
  Array.from(document.querySelectorAll("span")).filter((s) => /^Bloc \d+/.test(s.textContent.trim())).map((s) => s.textContent.trim())
);
console.log("blocks:", JSON.stringify(blocks, null, 2));

// Open the main-set block(s) to trigger the complex-repeat fallback rendering
await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll("button")).filter((b) => b.textContent.trim() === "Modifier");
  for (const btn of buttons) {
    const row = btn.closest(".py-4");
    if (row && row.textContent.includes("Corps de séance")) { btn.click(); break; }
  }
});
await new Promise((r) => setTimeout(r, 500));

await page.screenshot({ path: "/home/andrea/projets/github/zoned/.qa-pixel/adapted-complex-repeat-dark.png", fullPage: true });
console.log("saved");
await browser.close();
