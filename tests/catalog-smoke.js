const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('https://micr.fun/', { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => ['color-life', 'life-3d'].map(id => {
    const card = Array.from(document.querySelectorAll('[data-id]')).find(el => el.dataset.id === id);
    const image = card && card.querySelector('img');
    return { id, exists: Boolean(image), naturalWidth: image ? image.naturalWidth : 0 };
  }));
  console.log(JSON.stringify(result));
  await browser.close();
  if (result.some(item => !item.exists || item.naturalWidth < 1000)) process.exit(1);
})().catch(error => { console.error(error); process.exit(1); });
