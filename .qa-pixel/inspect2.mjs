import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.goto("http://localhost:5199/weeks/new", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 600));
const texts = await page.$$eval("button, a", els => els.map(e => e.textContent?.trim()).filter(Boolean));
console.log(JSON.stringify(texts));
await browser.close();
