import puppeteer from "puppeteer";
import path from "path";

const [,, filePath, outPath, widthArg] = process.argv;
const width = widthArg ? parseInt(widthArg, 10) : 1400;

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width, height: 1200, deviceScaleFactor: 1 });
await page.goto("file://" + path.resolve(filePath), { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log("saved", outPath);
