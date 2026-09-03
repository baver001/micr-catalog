const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      const requestPath = decodeURIComponent(request.url.split('?')[0]);
      const file = path.resolve(root, requestPath === '/' ? 'index.html' : requestPath.slice(1));
      if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(response);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

(async () => {
  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'ru-RU' });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });

    const initialCards = await page.locator('.app-card').count();
    const mascot = page.locator('#mascot');
    if (await mascot.count() !== 1) throw new Error('mascot missing');
    if (await mascot.getAttribute('aria-label') !== 'Маскот micr.fun') throw new Error('mascot is not labelled');
    if (await mascot.locator('svg').count() !== 1) throw new Error('mascot is not inline SVG');

    await mascot.focus();
    if (!(await mascot.evaluate(el => el.classList.contains('is-happy')))) throw new Error('focus expression missing');

    const pupilStyle = () => mascot.evaluate(el => el.querySelector('[data-mascot-pupil]').getAttribute('style'));
    const before = await pupilStyle();
    await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 24, clientY: 780 })));
    const after = await pupilStyle();
    if (before === after) throw new Error('pupils did not follow click position');

    await page.locator('#search').fill('дых');
    if (await page.locator('.app-card').count() >= initialCards) throw new Error('search no longer filters cards');
    await page.locator('#search').fill('');
    await page.locator('[data-filter="games"]').click();
    if (await page.locator('.app-card').count() >= initialCards) throw new Error('filter no longer filters cards');

    await page.waitForTimeout(4300);
    if (await mascot.evaluate(el => el.classList.contains('is-blinking'))) throw new Error('blink did not finish');
    console.log(JSON.stringify({ initialCards, mascot: true, focusHappy: true, clickTracking: true, searchAndFilter: true, blink: true }));

    const reducedContext = await browser.newContext({ reducedMotion: 'reduce', locale: 'ru-RU' });
    const reduced = await reducedContext.newPage();
    await reduced.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
    const motion = await reduced.locator('#mascot').evaluate(el => ({ animation: getComputedStyle(el).animationName, transition: getComputedStyle(el.querySelector('[data-mascot-pupil]')).transitionDuration }));
    if (motion.animation !== 'none' || Number.parseFloat(motion.transition) > 0.001) throw new Error(`reduced motion not respected: ${JSON.stringify(motion)}`);
    console.log(JSON.stringify({ reducedMotion: motion }));
    await reducedContext.close();
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
