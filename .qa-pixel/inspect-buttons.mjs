import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1200 });
await page.goto("http://localhost:5199/plan/prebuilt/5k-debutant", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 800));
const texts = await page.$$eval("button, a", els => els.map(e => e.textContent?.trim()).filter(Boolean));
console.log(JSON.stringify(texts, null, 0));
await browser.close();
