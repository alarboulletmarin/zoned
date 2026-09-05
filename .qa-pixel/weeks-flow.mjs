import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
page.on("console", m => { if (m.type() === "error") console.log("PAGE ERROR:", m.text()); });
page.on("pageerror", e => console.log("PAGE EXCEPTION:", e.message));
await page.setViewport({ width: 1400, height: 1200 });
await page.evaluateOnNewDocument(() => { try { localStorage.setItem("zoned-theme","dark"); } catch(e){} });
await page.goto("http://localhost:5199/weeks/new/prebuilt", { waitUntil: "networkidle0" });
await new Promise(r=>setTimeout(r,600));
const links = await page.$$eval("a[href^='/weeks/prebuilt/']", as => as.map(a => a.getAttribute("href")));
console.log("prebuilt week links:", links.length);
await page.goto("http://localhost:5199" + links[0], { waitUntil: "networkidle0" });
await new Promise(r=>setTimeout(r,600));
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button,a")).find(el => /utiliser cette semaine/i.test(el.textContent||""));
  if (b) b.click();
});
await new Promise(r=>setTimeout(r,1200));
console.log("week url:", page.url());
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find(el => /j'ai compris/i.test(el.textContent||""));
  if (b) b.click();
});
await new Promise(r=>setTimeout(r,500));
await page.screenshot({ path: "/home/andrea/projets/github/zoned/.qa-pixel/week-view-live-dark.png", fullPage: true });
await browser.close();
