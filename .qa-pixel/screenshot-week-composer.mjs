import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1200 });
await page.evaluateOnNewDocument(() => {
  try { localStorage.setItem("zoned-theme", "dark"); } catch(e) {}
});
await page.goto("http://localhost:5199/weeks/new", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 600));
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("a,button")).find(el => /composer.*main|scratch|main\b/i.test(el.textContent||""));
  if (b) b.click();
});
await new Promise(r => setTimeout(r, 1000));
console.log("url after click:", page.url());
await page.screenshot({ path: "/home/andrea/projets/github/zoned/.qa-pixel/week-composer-live-dark.png", fullPage: true });
await browser.close();
