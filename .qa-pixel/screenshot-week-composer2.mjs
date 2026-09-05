import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1200 });
await page.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem("zoned-theme", "dark");
    localStorage.setItem("zoned-storage-warning-seen", "true");
  } catch(e) {}
});
await page.goto("http://localhost:5199/weeks/new", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 600));
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("a,button")).find(el => (el.textContent||"").trim().startsWith("Créer une semaine"));
  if (b) b.click();
});
await new Promise(r => setTimeout(r, 1200));
console.log("url:", page.url());
await page.evaluate(async () => {
  const total = document.body.scrollHeight;
  for (let y = 0; y < total; y += 400) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 40));
  }
  window.scrollTo(0, 0);
});
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: "/home/andrea/projets/github/zoned/.qa-pixel/week-composer-live-dark.png", fullPage: true });
await browser.close();
