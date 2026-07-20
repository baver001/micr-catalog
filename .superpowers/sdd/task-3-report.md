# Task 3 Verification Report — micr.fun Mobile Catalog

## Status

**Verified complete.** The local catalog and the deployed `https://micr.fun/` catalog pass the requested responsive browser checks after deploying the already-pushed `HEAD`. No source regression was found in local `index.html`, so `index.html` was not modified and no no-op verification commit was created.

The deployed copy was initially stale and failed the mobile overflow check. Running the documented `./infra/deploy.sh` deployed the existing verified tree; the same production checks then passed.

## Scope and files

- Brief read first: `.superpowers/sdd/task-3-brief.md`.
- Test artifact: `/tmp/micr-fun-mobile-catalog-check.mjs` (not committed).
- Final screenshot: `/tmp/micr-fun-mobile-final.png` (not committed).
- Report: `.superpowers/sdd/task-3-report.md` (this file).
- Source files changed by Task 3: none.
- Existing implementation commits preserved: `c4d3756` and `18fe326`.

## Static checks

Command:

```bash
cd /root/projects/micr.fun
git diff --check && python3 - <<'PY'
from pathlib import Path
s = Path('index.html').read_text()
assert 'id="search"' in s
assert 'class="app-grid"' in s
assert 'prefers-reduced-motion' in s
print('static checks: OK')
PY
node --check /tmp/micr-fun-mobile-catalog-check.mjs
python3 - <<'PY'
from pathlib import Path
from struct import unpack
for p in sorted(Path('data/previews').glob('*.png')):
    b=p.read_bytes()
    assert b[:8]==b'\x89PNG\r\n\x1a\n'
    w,h=unpack('>II',b[16:24])
    assert w>1000 and h>500, (p,w,h)
    print(f'{p}: {w}x{h}')
PY
```

Output:

```text
static checks: OK
data/previews/breathing.png: 1280x800
data/previews/cameravox.png: 1280x800
data/previews/laziness.png: 1280x800
data/previews/mapmapmaps.png: 1280x800
data/previews/reaction-test.png: 1280x800
data/previews/reaction.png: 1280x800
```

`git diff --check` and `node --check` produced no errors.

Local server command and HTTP check:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
curl -sS -o /dev/null -w 'local HTTP %{http_code}\\n' http://127.0.0.1:4173/
```

Output:

```text
local HTTP 200
```

## Browser verification

The Playwright harness opened the page at `390x844` and `1440x900`, captured `pageerror` and console error events, checked HTTP status, responsive metrics, image raster dimensions and alt text, first-card navigation, desktop columns, and reduced motion.

Command:

```bash
node /tmp/micr-fun-mobile-catalog-check.mjs
```

Local output:

```text
mobile: OK
mobile metrics: {"bodyWidth":390,"viewportWidth":390,"searchWidth":358,"filtersWidth":358,"filterWrap":"nowrap","filterOverflow":"auto","filterScrollWidth":358,"previewWidth":356,"previewHeight":222.5,"cards":6,"images":[six images, each naturalWidth 1280, naturalHeight 800, non-empty screenshot alt],"gridColumns":"358px","reducedTransition":"0s","reducedAnimation":"0s","reducedScroll":"auto"}
desktop: OK
desktop metrics: {"bodyWidth":1440,"viewportWidth":1440,"searchWidth":220,"filtersWidth":361,"filterWrap":"wrap","filterOverflow":"visible","filterScrollWidth":361,"previewWidth":352.65625,"previewHeight":120,"cards":6,"images":[six images, each naturalWidth 1280, naturalHeight 800, non-empty screenshot alt],"gridColumns":"354.656px 354.672px 354.656px","reducedTransition":"0s","reducedAnimation":"0s","reducedScroll":"auto"}
mobile: OK
mobile metrics: {"bodyWidth":390,"viewportWidth":390,"searchWidth":358,"filtersWidth":358,"filterWrap":"nowrap","filterOverflow":"auto","filterScrollWidth":358,"previewWidth":356,"previewHeight":222.5,"cards":6,"images":[six images, each naturalWidth 1280, naturalHeight 800, non-empty screenshot alt],"gridColumns":"358px","reducedTransition":"1e-05s","reducedAnimation":"1e-05s","reducedScroll":"auto"}
images: OK
routes: OK (laziness -> /laziness/)
console: OK
```

The six image URLs verified were:

- `/data/previews/laziness.png?v=20260720`
- `/data/previews/breathing.png?v=20260720`
- `/data/previews/reaction.png?v=20260720`
- `/data/previews/reaction-test.png?v=20260720`
- `/data/previews/mapmapmaps.png?v=20260720`
- `/data/previews/cameravox.png?v=20260720`

All loaded as `1280x800` PNGs with non-empty Russian screenshot alt text. The mobile preview ratio was `356 / 222.5 = 1.6`, within the required `1.45..1.75` range. The desktop grid resolved to three columns. Reduced-motion computed transition/animation durations were `1e-05s` and scroll behavior was `auto`.

The harness initially asserted that the filter content itself must be wider than the viewport. That assertion was too strong for the current four filters, which fit exactly; the actual required horizontal-scroll behavior is present (`flex-wrap: nowrap`, `overflow-x: auto`). The harness was corrected to assert valid scroll metrics (`scrollWidth >= client width`) and was rerun successfully. This was a test-harness correction, not a site fix.

## Screenshot and visual inspection

Capture command:

```bash
node - <<'NODE'
const { chromium } = require('/root/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true}); const p=await b.newPage({viewport:{width:390,height:844}}); await p.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'}); await p.screenshot({path:'/tmp/micr-fun-mobile-final.png',fullPage:false}); await b.close(); console.log('screenshot: /tmp/micr-fun-mobile-final.png');})();
NODE
```

Output:

```text
screenshot: /tmp/micr-fun-mobile-final.png
screenshot bytes: 78181
```

The screenshot was visually inspected with the image analyzer. It shows the micr.fun logo, full-width search field, a single horizontal filter row, the full first large screenshot, its title and description, and the beginning of the second card. No horizontal clipping or body overflow is visible.

## Production verification and deployment

Push command:

```bash
GIT_SSH_COMMAND='ssh -i /root/.ssh/id_rsa -o IdentitiesOnly=yes' git push origin main
```

Output:

```text
To github.com:baver001/micr-catalog.git
   1d008d1..18fe326  main -> main
```

Initial production HTTP check:

```bash
curl -fsS -o /dev/null -w 'production HTTP %{http_code}\\n' https://micr.fun/
```

Output:

```text
production HTTP 200
```

The first production Playwright run exposed a concrete deployed-version failure: at `390x844`, `body.scrollWidth` was `468` and the search input was only `220px` wide at `x=247.5`, extending to `x=467.5`. This was the old deployed catalog CSS, not local `HEAD`.

The documented deployment command was then run:

```bash
./infra/deploy.sh
```

Relevant output:

```text
📄 Copying index.html...
📦 Copying apps...
📋 Copying static pages and cells...
✅ Verifying...
-rw-r--r-- 1 www-data www-data 15225 Jul 20 21:20 /var/www/micr.fun/index.html
[PM2] [micr-api](0) ✓
🎉 Deploy complete!
```

After deployment, production was rerun with the same full harness:

```bash
BASE_URL=https://micr.fun/ node /tmp/micr-fun-mobile-catalog-check.mjs
```

Final production output matched the local result:

```text
mobile: OK
... bodyWidth 390, searchWidth 358, filterWrap nowrap, filterOverflow auto, previewWidth 356, previewHeight 222.5, cards 6 ...
desktop: OK
... bodyWidth 1440, gridColumns "354.656px 354.672px 354.656px" ...
mobile: OK
... reducedTransition "1e-05s", reducedAnimation "1e-05s", reducedScroll "auto" ...
images: OK
routes: OK (laziness -> /laziness/)
console: OK
```

Focused production asset/route checks:

```bash
for u in https://micr.fun/laziness/ https://micr.fun/data/styles/cells.css https://micr.fun/data/i18n/en.json https://micr.fun/data/graph.json https://micr.fun/data/previews/laziness.png; do curl -sS -o /dev/null -w "$u %{http_code} %{content_type}\\n" "$u"; done
```

Output:

```text
https://micr.fun/laziness/ 200 text/html
https://micr.fun/data/styles/cells.css 403 text/html
https://micr.fun/data/i18n/en.json 403 text/html
https://micr.fun/data/graph.json 403 text/html
https://micr.fun/data/previews/laziness.png 200 image/png
```

The catalog route itself returns 200, all catalog previews return and render, and the first-card navigation reaches `/laziness/`. The existing laziness app requests three `/data/...` assets that return 403 in production; these are outside the catalog redesign and were not changed because Task 3 permits only a narrowly scoped `index.html` source fix and no local source regression existed.

HEAD/remote verification:

```bash
git rev-parse HEAD && git ls-remote origin refs/heads/main
```

Output:

```text
18fe326f7c9a991a592be3e2d500c45439490a7a
18fe326f7c9a991a592be3e2d500c45439490a7a\trefs/heads/main
```

## Commits

- No Task 3 commit was created.
- Existing final implementation commit remains `18fe326f7c9a991a592be3e2d500c45439490a7a` (`feat: make catalog cards visual-first on mobile`).
- Remote `main` matches local `HEAD`.
- No `index.html` source change was needed.

## Self-review

- Re-read the Task 3 brief and checked every requested viewport and behavior.
- Verified local and production HTTP 200 responses.
- Verified no catalog console errors or page errors in local or production runs.
- Verified mobile body width is exactly 390px, search width is 358px, filters are non-wrapping with horizontal auto overflow, and mobile cards are one column.
- Verified mobile preview ratio is 1.6 and all six active previews are real 1280x800 PNGs with meaningful alt text.
- Verified first-card navigation changes to `/laziness/`.
- Verified desktop grid has exactly three columns.
- Verified reduced-motion behavior.
- Visually inspected `/tmp/micr-fun-mobile-final.png`.
- Preserved the two feature commits and did not introduce a no-op verification commit.

## Concerns

1. Production was stale after the Git push until the documented local deployment script was run. The final deployed catalog now matches the verified local tree.
2. `/laziness/` itself returns 200 but has pre-existing production 403 responses for `/data/styles/cells.css`, `/data/i18n/en.json`, and `/data/graph.json`. The catalog’s own route, scripts, preview assets, console, and page-error checks pass. Fixing those app assets would violate the Task 3 scope, so they are documented rather than changed.
3. The four visible filter buttons fit within 358px at 390px; horizontal scrolling is implemented via `nowrap` + `overflow-x:auto`, but there is no excess scroll distance until more filters are added. This is consistent with the requested CSS behavior and is not a source regression.

## Final-review fixes (Task 3 follow-up)

**Status:** Implemented and verified locally and in production. This follow-up modified only `index.html` plus this appended report section; catalog data and individual apps were preserved.

### Changes

- Reordered existing header controls to logo → search → filters in source order. The mobile layout now renders the logo, full-width search, and non-wrapping horizontal filter row; desktop remains a three-column card grid.
- Increased the desktop `.card-preview` height from `120px` to `160px`; the mobile `16 / 10` aspect-ratio override remains in place.
- Replaced category-SVG substitution in `onerror` with a neutral `Предпросмотр недоступен` placeholder span. Valid PNG sources remain unchanged.
- Changed active preview alt text to the approved `Screenshot: ${app.name}` format.
- Added explicit `:focus-visible` rules for `#search` and `.filter-btn` with `2px` accent outline and `3px` offset.

### Exact verification commands and outputs

```bash
cd /root/projects/micr.fun

git diff --check
# exit 0; no output

python3 - <<'PY'
from pathlib import Path
from struct import unpack
p=Path('data/previews')
files=sorted(p.glob('*.png'))
assert len(files)==6, files
for f in files:
    b=f.read_bytes(); assert b[:8]==b'\x89PNG\r\n\x1a\n'
    w,h=unpack('>II',b[16:24]); assert w>0 and h>0
    print(f'{f.name}: {w}x{h}')
PY
# breathing.png: 1280x800
# cameravox.png: 1280x800
# laziness.png: 1280x800
# mapmapmaps.png: 1280x800
# reaction-test.png: 1280x800
# reaction.png: 1280x800

node --check /tmp/micr-fun-final-review-check.cjs
# exit 0

python3 -m http.server 4173 --bind 127.0.0.1
curl -fsS -o /dev/null -w 'local HTTP %{http_code}\\n' http://127.0.0.1:4173/
# local HTTP 200

node /tmp/micr-fun-final-review-check.cjs
# mobile and desktop assertions passed; 6 PNGs each at 1280x800; no console/page errors;
# mobile 390px body width, search 358px, filter nowrap/auto, order logo→search→filters,
# mobile preview 356x222.5 (16:10), neutral missing-preview state, focus rule;
# desktop 1440px body width, preview 160px, gridColumns 354.656px 354.672px 354.656px,
# navigation to /laziness/

./infra/deploy.sh
# exit 0; Deploy complete!; deployed index.html size 15786 bytes

curl -fsS -o /dev/null -w 'production HTTP %{http_code}\\n' https://micr.fun/
# production HTTP 200
BASE_URL=https://micr.fun/ node /tmp/micr-fun-final-review-check.cjs
# mobile and desktop assertions passed with the same metrics; no console/page errors;
# all six production PNGs loaded at 1280x800; navigation to /laziness/

curl -fsS -o /dev/null -w 'https://micr.fun/data/previews/laziness.png %{http_code}\\n' https://micr.fun/data/previews/laziness.png
# https://micr.fun/data/previews/laziness.png 200
curl -fsS -o /dev/null -w 'https://micr.fun/laziness/ %{http_code}\\n' https://micr.fun/laziness/
# https://micr.fun/laziness/ 200
```

### Self-review

- Re-read all five final-review requirements against the diff.
- Confirmed only the existing header markup order changed; desktop controls remain inline and the app grid remains three columns.
- Confirmed mobile override still owns the preview ratio, while desktop computes to exactly 160px.
- Confirmed no category SVG appears in the image fallback and the fallback creates no fake PNG URL.
- Confirmed all six active PNGs remain real raster previews and use the approved alt format.
- Confirmed local and production catalog checks report zero console errors and zero page errors.

### Concerns

- The four current filter labels fit exactly within the 358px mobile filter viewport, so `scrollWidth` equals `clientWidth`; the required `nowrap` + `overflow-x:auto` behavior is present but has no extra scroll distance until additional filters are added.
- The production `/laziness/` route returns 200 and catalog navigation works. Existing app-internal production `/data/...` 403 behavior documented above remains outside this scoped catalog fix.

**Commit hash:** 7716953ef3a6d7d5f5ae13a8efcbe623e98fe531
