const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const [url, expected] of [['https://micr.fun/color-life/', '#step'], ['https://micr.fun/life-3d/', '#step']]) {
    const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    const toolbar = await page.locator('.toolbar').evaluate(el => getComputedStyle(el).position);
    if (toolbar !== 'fixed') throw new Error(`${url}: toolbar is not overlay`);
    const before = Number(await page.locator('#generation').textContent());
    await page.click(expected);
    const after = Number(await page.locator('#generation').textContent());
    if (after !== before + 1) throw new Error(`${url}: step did not advance`);
    if (url.includes('life-3d')) {
      const follow = await page.locator('#follow').textContent();
      if (!follow.includes('Следить')) throw new Error('3D follow control missing');
      const maxLayer = await page.locator('#layer').getAttribute('max');
      if (Number(maxLayer) < 1) throw new Error('3D layer slider did not grow');
    } else {
      await page.mouse.wheel(0, -400);
      const pop = Number(await page.locator('#population').textContent());
      if (!Number.isFinite(pop)) throw new Error('2D infinite field status invalid');
    }
    console.log(url, { toolbar, before, after });
  }
  await browser.close();
})();
