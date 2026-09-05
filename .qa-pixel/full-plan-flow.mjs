import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1200 });
await page.evaluateOnNewDocument(() => {
  try { localStorage.setItem("zoned-theme", "dark"); } catch(e) {}
  try { localStorage.setItem("zoned-planViewMode", "weekly"); } catch(e) {}
});
await page.goto("http://localhost:5199/plan/new/prebuilt", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 600));
const links = await page.$$eval("a[href^='/plan/prebuilt/']", as => as.map(a => a.getAttribute("href")));
await page.goto("http://localhost:5199" + links[3], { waitUntil: "networkidle0" }); // semi-marathon-ish, index 3+
await new Promise(r => setTimeout(r, 600));
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button,a")).find(el => /utiliser ce plan/i.test(el.textContent||""));
  if (b) b.click();
});
await new Promise(r => setTimeout(r, 1500));
console.log("plan url:", page.url());
// dismiss modal
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find(el => /j'ai compris/i.test(el.textContent||""));
  if (b) b.click();
});
await new Promise(r => setTimeout(r, 400));
// ensure Semaine view
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find(el => (el.textContent||"").trim() === "Semaine");
  if (b) b.click();
});
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: "/home/andrea/projets/github/zoned/.qa-pixel/plan-view-live-dark.png", fullPage: true });
await browser.close();
