import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1200 });
await page.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem("zoned-theme", "dark");
    localStorage.setItem("zoned-hint-plan-calendar-seen", "true");
    localStorage.setItem("zoned-storage-warning-seen", "true");
  } catch(e) {}
});
await page.goto("http://localhost:5199/plan/new/prebuilt", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 600));
const links = await page.$$eval("a[href^='/plan/prebuilt/']", as => as.map(a => a.getAttribute("href")));
await page.goto("http://localhost:5199" + links[4], { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 600));
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button,a")).find(el => /utiliser ce plan/i.test(el.textContent||""));
  if (b) b.click();
});
await new Promise(r => setTimeout(r, 1500));
const planUrl = page.url();
console.log("plan url:", planUrl);
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find(el => /j'ai compris/i.test(el.textContent||""));
  if (b) b.click();
});
await new Promise(r => setTimeout(r, 400));

async function scrollThrough() {
  await page.evaluate(async () => {
    const total = document.body.scrollHeight;
    for (let y = 0; y < total; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 300));
}

// A real Puppeteer ElementHandle.click() (proper mouse event) — Radix's
// Tabs sometimes ignores a synthetic page.evaluate(() => el.click()).
async function clickButtonWithText(text) {
  const handles = await page.$$("button");
  for (const el of handles) {
    const content = await page.evaluate((e) => e.textContent.trim(), el);
    if (content === text) {
      await el.click();
      return true;
    }
  }
  return false;
}

async function shot(viewLabel, outName) {
  const clicked = await clickButtonWithText(viewLabel);
  await new Promise(r => setTimeout(r, 800));
  await scrollThrough();
  await page.screenshot({ path: `/home/andrea/projets/github/zoned/.qa-pixel/${outName}.png`, fullPage: true });
  console.log(outName, "clicked:", clicked);
}

await shot("Calendrier", "plan-calendar-live-dark");
await shot("Mois", "plan-month-live-dark");
await shot("Liste", "plan-list-live-dark");

// stats tab
const statsClicked = await clickButtonWithText("Statistiques");
await new Promise(r => setTimeout(r, 600));
await scrollThrough();
await page.screenshot({ path: "/home/andrea/projets/github/zoned/.qa-pixel/plan-stats-live-dark.png", fullPage: true });
console.log("plan-stats-live-dark clicked:", statsClicked);

await browser.close();
