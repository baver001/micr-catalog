const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURIComponent(req.url.split("?")[0]);
      if (reqPath.endsWith("/")) reqPath += "index.html";
      const cleanPath = reqPath.replace(/^\//, "");
      const filePath = path.resolve(root, cleanPath || "index.html");

      if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found: " + reqPath);
        return;
      }
      res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

(async () => {
  const server = await startServer();
  const port = server.address().port;
  const baseUrl = "http://127.0.0.1:" + port;
  const browser = await chromium.launch({ headless: true });

  const errors = [];
  function trackErrors(page, routeName) {
    page.on("pageerror", err => {
      errors.push({ route: routeName, type: "pageerror", message: err.message });
    });
    page.on("console", msg => {
      if (msg.type() === "error") {
        errors.push({ route: routeName, type: "console.error", message: msg.text() });
      }
    });
  }

  try {
    console.log("--- 1. Testing Language Auto-detection on Root ---");

    // 1a. Russian locale
    {
      const contextRu = await browser.newContext({ locale: "ru-RU", viewport: { width: 1280, height: 900 } });
      const page = await contextRu.newPage();
      trackErrors(page, "root-ru");
      await page.goto(baseUrl + "/", { waitUntil: "networkidle" });

      const title = await page.title();
      assert.ok(title.includes("Каталог"), "Expected Russian title, got: " + title);

      const searchPlaceholder = await page.locator("#search").getAttribute("placeholder");
      assert.strictEqual(searchPlaceholder, "Найти приложение...");

      const allBtn = await page.locator('[data-filter="all"]').textContent();
      assert.strictEqual(allBtn, "Все");

      const gamesBtn = await page.locator('[data-filter="games"]').textContent();
      assert.strictEqual(gamesBtn, "Игры");

      const mascot = page.locator("#mascot");
      assert.strictEqual(await mascot.count(), 1);
      assert.strictEqual(await mascot.getAttribute("aria-label"), "Маскот micr.fun");

      // Check card titles and preview images in RU
      const diceCard = page.locator('[data-id="dice"]');
      const diceTitle = await diceCard.locator(".card-title-overlay").textContent();
      assert.strictEqual(diceTitle, "Кости");

      const diceImgSrc = await diceCard.locator("img").getAttribute("src");
      assert.strictEqual(diceImgSrc, "/data/previews/dice.ru.png");

      const diceImgFallback = await diceCard.locator("img").getAttribute("data-fallback");
      assert.strictEqual(diceImgFallback, "/data/previews/dice.png");

      const diceNaturalWidth = await diceCard.locator("img").evaluate(img => img.naturalWidth);
      assert.ok(diceNaturalWidth > 0, "Dice image naturalWidth should be > 0, got " + diceNaturalWidth);

      await contextRu.close();
      console.log("✓ Russian auto-detection verified.");
    }

    // 1b. English locale
    {
      const contextEn = await browser.newContext({ locale: "en-US", viewport: { width: 1280, height: 900 } });
      const page = await contextEn.newPage();
      trackErrors(page, "root-en");
      await page.goto(baseUrl + "/", { waitUntil: "networkidle" });

      const title = await page.title();
      assert.ok(title.includes("catalog") || title.includes("Catalog"), "Expected English title, got: " + title);

      const searchPlaceholder = await page.locator("#search").getAttribute("placeholder");
      assert.strictEqual(searchPlaceholder, "Search apps...");

      const allBtn = await page.locator('[data-filter="all"]').textContent();
      assert.strictEqual(allBtn, "All");

      const gamesBtn = await page.locator('[data-filter="games"]').textContent();
      assert.strictEqual(gamesBtn, "Games");

      const mascot = page.locator("#mascot");
      assert.strictEqual(await mascot.count(), 1);
      assert.strictEqual(await mascot.getAttribute("aria-label"), "micr.fun mascot");

      const diceCard = page.locator('[data-id="dice"]');
      const diceTitle = await diceCard.locator(".card-title-overlay").textContent();
      assert.strictEqual(diceTitle, "Dice");

      const diceImgSrc = await diceCard.locator("img").getAttribute("src");
      assert.strictEqual(diceImgSrc, "/data/previews/dice.en.png");

      const diceNaturalWidth = await diceCard.locator("img").evaluate(img => img.naturalWidth);
      assert.ok(diceNaturalWidth > 0, "Dice image naturalWidth should be > 0, got " + diceNaturalWidth);

      await contextEn.close();
      console.log("✓ English auto-detection verified.");
    }

    // 1c. Unsupported locale fallback to English
    {
      const contextFr = await browser.newContext({ locale: "fr-FR", viewport: { width: 1280, height: 900 } });
      const page = await contextFr.newPage();
      trackErrors(page, "root-fr");
      await page.goto(baseUrl + "/", { waitUntil: "networkidle" });

      const searchPlaceholder = await page.locator("#search").getAttribute("placeholder");
      assert.strictEqual(searchPlaceholder, "Search apps...", "French locale should fallback to English");

      await contextFr.close();
      console.log("✓ Unsupported locale fallback to EN verified.");
    }

    console.log("--- 2. Testing Manual Language Override & Persistence ---");
    {
      const context = await browser.newContext({ locale: "ru-RU", viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      trackErrors(page, "root-override");
      await page.goto(baseUrl + "/", { waitUntil: "networkidle" });

      // Click EN button
      const enBtn = page.locator('.lang-switch .lang-btn[data-lang="en"]');
      await enBtn.click();

      // Check immediate UI switch
      assert.strictEqual(await page.locator("#search").getAttribute("placeholder"), "Search apps...");
      assert.strictEqual(await page.locator('[data-filter="games"]').textContent(), "Games");
      assert.strictEqual(await page.locator('[data-id="dice"] .card-title-overlay').textContent(), "Dice");
      assert.strictEqual(await page.locator('[data-id="reaction"] .card-title-overlay').textContent(), "Reaction");
      assert.strictEqual(await page.locator("#mascot").getAttribute("aria-label"), "micr.fun mascot");

      const storedLang = await page.evaluate(() => localStorage.getItem("micrfun_lang"));
      assert.strictEqual(storedLang, "en");

      // Reload page and check persistence
      await page.reload({ waitUntil: "networkidle" });
      assert.strictEqual(await page.locator("#search").getAttribute("placeholder"), "Search apps...");
      assert.strictEqual(await page.locator('[data-id="dice"] .card-title-overlay').textContent(), "Dice");

      // Switch back to RU
      const ruBtn = page.locator('.lang-switch .lang-btn[data-lang="ru"]');
      await ruBtn.click();
      assert.strictEqual(await page.locator("#search").getAttribute("placeholder"), "Найти приложение...");
      assert.strictEqual(await page.locator('[data-id="dice"] .card-title-overlay').textContent(), "Кости");
      assert.strictEqual(await page.locator("#mascot").getAttribute("aria-label"), "Маскот micr.fun");

      await context.close();
      console.log("✓ Manual override and persistence verified.");
    }

    console.log("--- 3. Testing Category Pages (e.g. /games/) & Mascot ---");
    {
      const context = await browser.newContext({ locale: "ru-RU", viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      trackErrors(page, "games-page");
      await page.goto(baseUrl + "/games/", { waitUntil: "networkidle" });

      const catTitle = await page.locator("#catTitle").textContent();
      assert.strictEqual(catTitle, "Игры");

      const backLink = await page.locator(".back-link").textContent();
      assert.strictEqual(backLink, "← micr.fun");

      // Mascot on /games/
      const mascot = page.locator("#mascot");
      assert.strictEqual(await mascot.count(), 1, "Mascot must be present on /games/");
      assert.strictEqual(await mascot.getAttribute("aria-label"), "Маскот micr.fun");
      assert.strictEqual(await mascot.locator("svg").count(), 1);

      // Mascot interaction: focus gives happy
      await mascot.focus();
      assert.ok(await mascot.evaluate(el => el.classList.contains("is-happy")), "Focus expression missing on /games/");

      // Pointer tracking
      const pupilStyle = () => mascot.evaluate(el => el.querySelector("[data-mascot-pupil]").getAttribute("style"));
      const before = await pupilStyle();
      await page.evaluate(() => document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 20, clientY: 700 })));
      const after = await pupilStyle();
      assert.notStrictEqual(before, after, "Pupils tracking on /games/ failed");

      // Check cards in /games/
      const cardIds = await page.locator(".app-card").evaluateAll(cards => cards.map(c => c.dataset.id));
      assert.deepStrictEqual(cardIds.sort(), ["dice", "mapmapmaps", "reaction"].sort());

      // Check preview naturalWidths for game cards
      for (const id of ["dice", "reaction", "mapmapmaps"]) {
        const card = page.locator('[data-id="' + id + '"]');
        const img = card.locator("img");
        assert.strictEqual(await img.count(), 1, "Image for " + id + " missing");
        const src = await img.getAttribute("src");
        assert.strictEqual(src, "/data/previews/" + id + ".ru.png");
        const naturalWidth = await img.evaluate(el => el.naturalWidth);
        const naturalHeight = await img.evaluate(el => el.naturalHeight);
        assert.ok(naturalWidth > 0, "Image for " + id + " has naturalWidth 0");
        assert.ok(naturalHeight > 0, "Image for " + id + " has naturalHeight 0");
      }

      // Switch language on category page
      await page.locator('.lang-switch .lang-btn[data-lang="en"]').click();
      assert.strictEqual(await page.locator("#catTitle").textContent(), "Games");
      assert.strictEqual(await page.locator('[data-id="dice"] .card-title-overlay').textContent(), "Dice");
      assert.strictEqual(await page.locator('[data-id="dice"] img').getAttribute("src"), "/data/previews/dice.en.png");
      assert.strictEqual(await page.locator("#mascot").getAttribute("aria-label"), "micr.fun mascot");

      await context.close();
      console.log("✓ Category page /games/ with mascot and previews verified.");
    }

    console.log("--- 4. Testing All Local Routes for Zero Page Errors ---");
    {
      const localRoutes = [
        "/",
        "/games/",
        "/tools/",
        "/experiments/",
        "/knowledge/",
        "/dice/",
        "/reaction/"
      ];

      for (const route of localRoutes) {
        const context = await browser.newContext({ locale: "ru-RU", viewport: { width: 1280, height: 900 } });
        const page = await context.newPage();
        trackErrors(page, route);
        const response = await page.goto(baseUrl + route, { waitUntil: "networkidle" });
        assert.strictEqual(response.status(), 200, "Route " + route + " returned status " + response.status());
        await context.close();
        console.log("  ✓ Route " + route + " OK");
      }
    }

    // Check collected errors
    if (errors.length > 0) {
      console.error("Captured errors during tests:", errors);
      throw new Error("Test failed with " + errors.length + " unexpected page/console errors.");
    }

    console.log("\n========================================");
    console.log("🎉 All multilang smoke tests PASSED!");
    console.log("========================================");

  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
