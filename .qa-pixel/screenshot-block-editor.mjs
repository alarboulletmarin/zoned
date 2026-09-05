import puppeteer from "puppeteer";

const [, , theme = "dark", widthArg = "1400", outSuffix = ""] = process.argv;
const width = parseInt(widthArg, 10);

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width, height: 1400, deviceScaleFactor: 1 });
await page.evaluateOnNewDocument((t) => {
  try { localStorage.setItem("zoned-theme", t); } catch (e) {}
}, theme);

await page.goto("http://localhost:5199/workout/builder", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 500));

await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("a,button")).find((el) => /^Créer$/i.test((el.textContent || "").trim()));
  if (b) b.click();
});
await new Promise((r) => setTimeout(r, 800));

function setNativeValue(el, value) {
  const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}
const setNativeValueSrc = setNativeValue.toString();

async function setValue(selector, value) {
  await page.evaluate((sel, val, fnSrc) => {
    const fn = new Function("return " + fnSrc)();
    const el = document.querySelector(sel);
    if (el) fn(el, val);
  }, selector, value, setNativeValueSrc);
}

async function setNumberInputsInActiveCard(values) {
  await page.evaluate((vals, fnSrc) => {
    const fn = new Function("return " + fnSrc)();
    const card = document.querySelector('[aria-label="Terminer l\'édition"]').closest(".bg-card");
    const nums = card.querySelectorAll('input[type="number"]');
    vals.forEach((v, i) => { if (nums[i] != null && v != null) fn(nums[i], String(v)); });
  }, values, setNativeValueSrc);
}

async function clickByText(text) {
  return page.evaluate((txt) => {
    const el = Array.from(document.querySelectorAll("button")).find((b) => (b.textContent || "").trim() === txt);
    if (el) { el.click(); return true; }
    return false;
  }, text);
}

/** Clicks `actionText` (Modifier/Retirer/...) within the compact row whose
 *  phase label contains `phaseText`. Only safe while that phase has exactly
 *  one matching row. */
async function clickRowAction(phaseText, actionText) {
  return page.evaluate((phase, action) => {
    const buttons = Array.from(document.querySelectorAll("button")).filter((b) => b.textContent.trim() === action);
    for (const btn of buttons) {
      const row = btn.closest(".py-4");
      if (row && row.textContent.includes(phase)) { btn.click(); return true; }
    }
    return false;
  }, phaseText, actionText);
}

async function closeActiveCard() {
  await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Terminer l\'édition"]');
    if (btn) btn.click();
  });
}

async function clickNthZoneButton(zoneText, occurrenceIndex) {
  await page.evaluate((zone, idx) => {
    const card = document.querySelector(".bg-card");
    const matches = Array.from(card.querySelectorAll("button")).filter((b) => b.textContent.trim() === zone);
    if (matches[idx]) matches[idx].click();
  }, zoneText, occurrenceIndex);
}

// Name
await setValue("#workout-name", "Seuil long — 2 × 15'");
await new Promise((r) => setTimeout(r, 200));

// Edit the pre-seeded warm-up block: 10min Z1 -> 15min Z2
await clickRowAction("Échauffement", "Modifier");
await new Promise((r) => setTimeout(r, 250));
await setNumberInputsInActiveCard([15, 0]);
await clickNthZoneButton("Z2", 0);
await new Promise((r) => setTimeout(r, 150));
await closeActiveCard();
await new Promise((r) => setTimeout(r, 250));

// Edit the pre-seeded cool-down block: 5min Z1 -> 10min Z1
await clickRowAction("Retour au calme", "Modifier");
await new Promise((r) => setTimeout(r, 250));
await setNumberInputsInActiveCard([10, 0]);
await closeActiveCard();
await new Promise((r) => setTimeout(r, 250));

// Replace the pre-seeded main-set segment with an interval block
await clickRowAction("Corps de séance", "Retirer");
await new Promise((r) => setTimeout(r, 250));
await clickByText("Intervalles");
await new Promise((r) => setTimeout(r, 300));
await setNumberInputsInActiveCard([2, 15, 0, 3, 0]);
await clickNthZoneButton("Z2", 1); // recovery zone picker is the 2nd on the card
await new Promise((r) => setTimeout(r, 150));
await setValue('.bg-card input[type="text"]', "Tenir 4:12/km, respiration contrôlée.");
await new Promise((r) => setTimeout(r, 300));

if (process.argv.includes("--save")) {
  await clickByText("Enregistrer");
  await new Promise((r) => setTimeout(r, 500));
}

console.log("url:", page.url());
const out = `/home/andrea/projets/github/zoned/.qa-pixel/block-editor-live-${theme}${outSuffix}.png`;
await page.screenshot({ path: out, fullPage: true });
console.log("saved", out);
await browser.close();
