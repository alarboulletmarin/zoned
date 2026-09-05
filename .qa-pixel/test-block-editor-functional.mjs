import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1600 });
await page.evaluateOnNewDocument(() => { try { localStorage.setItem("zoned-theme", "dark"); } catch (e) {} });
page.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
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
const fnSrc = setNativeValue.toString();

async function setValue(selector, value) {
  await page.evaluate((sel, val, src) => {
    const fn = new Function("return " + src)();
    const el = document.querySelector(sel);
    if (el) fn(el, val);
  }, selector, value, fnSrc);
}

async function clickByText(text) {
  return page.evaluate((txt) => {
    const el = Array.from(document.querySelectorAll("button")).find((b) => (b.textContent || "").trim() === txt);
    if (el) { el.click(); return true; }
    return false;
  }, text);
}

async function clickRowAction(phaseText, actionText, occurrence = 0) {
  return page.evaluate((phase, action, occ) => {
    const buttons = Array.from(document.querySelectorAll("button")).filter((b) => b.textContent.trim() === action);
    const matches = buttons.filter((btn) => {
      const row = btn.closest(".py-4");
      return row && row.textContent.includes(phase);
    });
    if (matches[occ]) { matches[occ].click(); return true; }
    return false;
  }, phaseText, actionText, occurrence);
}

async function dumpBlocks() {
  return page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll("span")).filter((s) => /^Bloc \d+/.test(s.textContent.trim()));
    return spans.map((s) => s.textContent.trim());
  });
}

async function activeCardText() {
  return page.evaluate(() => {
    const card = document.querySelector(".bg-card");
    return card ? card.querySelector("span").textContent.trim() : null;
  });
}

// Step 1: add a 2nd main-set block ("Continu") so main has 2 items
await clickByText("Continu");
await new Promise((r) => setTimeout(r, 300));
console.log("after adding 2nd main block:", await dumpBlocks());

// close it
await page.evaluate(() => document.querySelector('[aria-label="Terminer l\'édition"]')?.click());
await new Promise((r) => setTimeout(r, 300));

// Step 2: open the LAST main block (2nd 'Corps de séance' row) for edit
console.log("before opening 2nd corps row:", await dumpBlocks());
const opened = await clickRowAction("Corps de séance", "Modifier", 1);
console.log("opened 2nd corps row:", opened);
await new Promise((r) => setTimeout(r, 300));
console.log("active card now:", await activeCardText());

// Step 3: remove the FIRST main block (index 0) while a later one is active
const removed = await clickRowAction("Corps de séance", "Retirer", 0);
console.log("removed 1st corps row:", removed);
await new Promise((r) => setTimeout(r, 300));
console.log("blocks after removal:", await dumpBlocks());
console.log("active card after removal (should still be the surviving block, same content):", await activeCardText());

// Step 4: duplicate the warm-up block (different section, should not affect active)
const duped = await clickRowAction("Échauffement", "Dupliquer", 0);
console.log("duplicated warmup:", duped);
await new Promise((r) => setTimeout(r, 300));
console.log("blocks after warmup duplicate:", await dumpBlocks());
console.log("active card unaffected:", await activeCardText());

// Step 5: move the active block up via the chevron control
await page.evaluate(() => {
  const card = document.querySelector(".bg-card");
  const btn = card.querySelector('button[aria-label="Monter le bloc"]');
  if (btn) btn.click();
});
await new Promise((r) => setTimeout(r, 300));
console.log("blocks after moving active up:", await dumpBlocks());

// Step 6: undo everything, verify no crash and history walks back
for (let i = 0; i < 6; i++) {
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) => b.getAttribute("aria-label") === "Annuler");
    if (btn && !btn.disabled) btn.click();
  });
  await new Promise((r) => setTimeout(r, 150));
}
console.log("blocks after undoing:", await dumpBlocks());

const errors = await page.evaluate(() => window.__consoleErrors || []);
console.log("done. page errors captured:", errors);

await browser.close();
