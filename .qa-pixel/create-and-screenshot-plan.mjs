import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1200 });
await page.evaluateOnNewDocument(() => {
  try { localStorage.setItem("zoned-theme", "dark"); } catch(e) {}
});
await page.goto("http://localhost:5199/plan/new/prebuilt", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 800));
// click the first prebuilt plan card link
const links = await page.$$eval("a[href^='/plan/prebuilt/']", as => as.map(a => a.getAttribute("href")));
console.log("found prebuilt plans:", links.slice(0,3));
if (links.length === 0) { console.log("NO PREBUILT LINKS FOUND"); await browser.close(); process.exit(1); }
await page.goto("http://localhost:5199" + links[0], { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 800));
// find "take this plan" button - try common texts
const btnHandle = await page.evaluateHandle(() => {
  const candidates = Array.from(document.querySelectorAll("button, a"));
  return candidates.find(el => /utiliser ce plan/i.test(el.textContent || ""));
});
const el = btnHandle.asElement();
if (!el) { console.log("NO CTA BUTTON FOUND"); await browser.close(); process.exit(1); }
await el.click();
await new Promise(r => setTimeout(r, 1500));
console.log("current url:", page.url());
await page.screenshot({ path: "/home/andrea/projets/github/zoned/.qa-pixel/plan-view-live-dark.png", fullPage: true });
await browser.close();
