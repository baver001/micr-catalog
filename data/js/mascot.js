/**
 * Micr — cross-surface mascot (vanilla JS)
 */
(function (global) {
  'use strict';

  const EYE_WHITE = '#ffffff';

  const CATEGORY_STYLES = {
    all: { face: '#1c1c1f', mood: 'idle' },
    games: { face: '#c4922a', mood: 'play' },
    tools: { face: '#3d6fd4', mood: 'focus' },
    creative: { face: '#7c4dff', mood: 'idle' },
    knowledge: { face: '#2da87a', mood: 'calm' },
    fun: { face: '#e11d58', mood: 'play' },
    experiments: { face: '#0891b2', mood: 'idle' }
  };

  const SLUG_OVERRIDES = {
    breathing: { mood: 'calm', motionProfile: 'soft', faceRx: 20 },
    focus: { mood: 'focus', motionProfile: 'soft', faceRx: 9 },
    dice: { mood: 'play', motionProfile: 'bouncy', faceRx: 8 },
    reaction: { mood: 'play', faceRx: 10 },
    laziness: { mood: 'calm', motionProfile: 'soft', faceRx: 18 },
    palette: { categoryId: 'creative', faceRx: 17 },
    cameravox: { categoryId: 'tools', mood: 'play', faceRx: 16 },
    mapmapmaps: { categoryId: 'games', mood: 'play', faceShape: 'pin' },
    habits: { faceRx: 15 },
    elon: { faceRx: 12 }
  };

  /** Face silhouette — fixed across colors and states (viewBox units). */
  const FACE_SIZE = 44;
  const FACE_RX = 14;

  /** Symmetric map-pin — fully inside 44×44 viewBox (no head border-radius clip). */
  const PIN_FACE_D =
    'M22 5.5 C30.8 5.5 38.5 12.8 38.5 21 C38.5 26.2 30.5 35.5 22 38.5 C13.5 35.5 5.5 26.2 5.5 21 C5.5 12.8 13.2 5.5 22 5.5 Z';

  const PIN_EYE_GEOM = { w: 5.5, h: 10, rx: 2.2, lx: 14.5, rxPos: 24, y: 12 };

  /** Vertical pill eyes — fixed geometry for all states */
  const EYE_GEOM = { w: 9, h: 20, rx: 4, lx: 11, rxPos: 24, y: 12 };

  const reducedMotion =
    global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function normalizeCategory(id) {
    if (!id || id === 'all') return 'all';
    return CATEGORY_STYLES[id] ? id : 'all';
  }

  function resolveMascotVariant(context) {
    const ctx = context || {};
    const slug = ctx.appSlug;
    const slugHint =
      slug && SLUG_OVERRIDES[slug] ? SLUG_OVERRIDES[slug] : {};
    const categoryId = normalizeCategory(
      slugHint.categoryId || ctx.categoryId || 'all'
    );
    const base = CATEGORY_STYLES[categoryId] || CATEGORY_STYLES.all;

    const surface = ctx.surface || 'hub-home';
    let silhouette = 'default';
    if (surface === 'miniapp' || surface === 'hub-detail') silhouette = 'compact';

    const mood = slugHint.mood || ctx.mood || base.mood;
    let motionProfile = slugHint.motionProfile || 'snappy';
    if (mood === 'calm' || mood === 'focus') motionProfile = 'soft';

    return {
      silhouette,
      faceFill: ctx.accentColor || base.face,
      faceRx: slugHint.faceRx || ctx.faceRx || FACE_RX,
      faceShape: slugHint.faceShape || ctx.faceShape || 'rect',
      eyeYOffset: slugHint.eyeYOffset || ctx.eyeYOffset || 0,
      eyeFill: EYE_WHITE,
      motionProfile,
      mood,
      categoryId
    };
  }

  const NS = 'http://www.w3.org/2000/svg';

  /** Subtle animated white noise for «all categories» state. */
  function createNoiseEngine(canvas) {
    const dpr = Math.min(2, global.devicePixelRatio || 1);
    const logical = FACE_SIZE;
    const w = Math.round(logical * dpr);
    const h = Math.round(logical * dpr);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { alpha: false });
    const imageData = ctx.createImageData(w, h);
    const pixels = imageData.data;
    let raf = null;
    let lastFrame = 0;
    const frameGap = reducedMotion ? Infinity : 90;

    function paint() {
      const count = w * h;
      for (let i = 0; i < count; i += 1) {
        const roll = Math.random();
        const base = 22 + roll * 18;
        const spike = roll > 0.965 ? 55 + Math.random() * 140 : 0;
        const v = Math.min(255, base + spike);
        const idx = i * 4;
        pixels[idx] = v;
        pixels[idx + 1] = v;
        pixels[idx + 2] = v;
        pixels[idx + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    function loop(time) {
      if (time - lastFrame >= frameGap) {
        paint();
        lastFrame = time;
      }
      raf = global.requestAnimationFrame(loop);
    }

    return {
      start() {
        if (raf) return;
        paint();
        if (!reducedMotion) raf = global.requestAnimationFrame(loop);
      },
      stop() {
        if (raf) {
          global.cancelAnimationFrame(raf);
          raf = null;
        }
      }
    };
  }

  function buildHead() {
    const g = EYE_GEOM;
    const head = document.createElement('span');
    head.className = 'micr-head';

    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.className = 'micr-noise-canvas';
    head.appendChild(noiseCanvas);

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + FACE_SIZE + ' ' + FACE_SIZE);
    svg.setAttribute('width', String(FACE_SIZE));
    svg.setAttribute('height', String(FACE_SIZE));
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('role', 'presentation');

    const face = document.createElementNS(NS, 'rect');
    face.setAttribute('width', String(FACE_SIZE));
    face.setAttribute('height', String(FACE_SIZE));
    face.setAttribute('rx', String(FACE_RX));
    face.classList.add('micr-face');

    const left = document.createElementNS(NS, 'rect');
    left.classList.add('micr-eye', 'micr-eye-l');
    left.setAttribute('x', String(g.lx));
    left.setAttribute('y', String(g.y));
    left.setAttribute('width', String(g.w));
    left.setAttribute('height', String(g.h));
    left.setAttribute('rx', String(g.rx));

    const right = document.createElementNS(NS, 'rect');
    right.classList.add('micr-eye', 'micr-eye-r');
    right.setAttribute('x', String(g.rxPos));
    right.setAttribute('y', String(g.y));
    right.setAttribute('width', String(g.w));
    right.setAttribute('height', String(g.h));
    right.setAttribute('rx', String(g.rx));

    svg.append(face, left, right);
    head.appendChild(svg);

    const noise = createNoiseEngine(noiseCanvas);

    return {
      head,
      face,
      left,
      right,
      geom: g,
      noise
    };
  }

  function applyVariant(root, variant) {
    root.style.setProperty('--micr-face', variant.faceFill);
    root.style.setProperty('--micr-eye', variant.eyeFill);
    root.dataset.profile = variant.mood;
    root.dataset.motion = variant.motionProfile;
    root.dataset.category = variant.categoryId;
  }

  function applyFaceGeometry(root, parts, variant) {
    const shape = variant.faceShape || 'rect';
    root.dataset.shape = shape;
    const svg = parts.face.parentNode;

    if (shape === 'pin') {
      if (parts.face.tagName !== 'path') {
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', PIN_FACE_D);
        path.classList.add('micr-face');
        svg.replaceChild(path, parts.face);
        parts.face = path;
      } else {
        parts.face.setAttribute('d', PIN_FACE_D);
      }
      root.style.removeProperty('--micr-rx-ratio');
    } else {
      if (parts.face.tagName !== 'rect') {
        const rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('width', String(FACE_SIZE));
        rect.setAttribute('height', String(FACE_SIZE));
        rect.classList.add('micr-face');
        svg.replaceChild(rect, parts.face);
        parts.face = rect;
      }
      const rx = variant.faceRx || FACE_RX;
      parts.face.setAttribute('rx', String(rx));
      root.style.setProperty('--micr-rx-ratio', String(rx / FACE_SIZE));
    }

    const eyeY = parts.geom.y + (variant.eyeYOffset || 0);
    let eyeW = parts.geom.w;
    let eyeH = parts.geom.h;
    let eyeRx = parts.geom.rx;
    let lx = parts.geom.lx;
    let rxPos = parts.geom.rxPos;
    let y = eyeY;

    if (shape === 'pin') {
      const pg = PIN_EYE_GEOM;
      eyeW = pg.w;
      eyeH = pg.h;
      eyeRx = pg.rx;
      lx = pg.lx;
      rxPos = pg.rxPos;
      y = pg.y;
      clearPinClip(svg);
    } else {
      clearPinClip(svg);
    }

    parts.left.setAttribute('x', String(lx));
    parts.right.setAttribute('x', String(rxPos));
    parts.left.setAttribute('y', String(y));
    parts.right.setAttribute('y', String(y));
    parts.left.setAttribute('width', String(eyeW));
    parts.right.setAttribute('width', String(eyeW));
    parts.left.setAttribute('height', String(eyeH));
    parts.right.setAttribute('height', String(eyeH));
    parts.left.setAttribute('rx', String(eyeRx));
    parts.right.setAttribute('rx', String(eyeRx));
  }

  function clearPinClip(svg) {
    svg.removeAttribute('clip-path');
    var defs = svg.querySelector('defs');
    if (defs) defs.remove();
  }

  function applyFaceAppearance(root, parts, variant) {
    applyVariant(root, variant);
    applyFaceGeometry(root, parts, variant);
    const idleNoise = variant.categoryId === 'all';

    if (idleNoise) {
      root.classList.add('is-noise');
      parts.face.setAttribute('visibility', 'hidden');
      parts.noise.start();
    } else {
      root.classList.remove('is-noise');
      parts.noise.stop();
      parts.face.setAttribute('visibility', 'visible');
      parts.face.setAttribute('fill', variant.faceFill);
    }
  }

  const WORDMARK_HTML =
    '<img class="logo-wordmark" src="/logo-sm.png" alt="micr.fun" height="22" decoding="async">';

  function mountMascot(host, initialContext) {
    if (!host) return null;

    const size = host.dataset.size || 'md';
    const root = document.createElement('span');
    root.className = 'micr-mascot';
    root.dataset.size = size;

    let variant = resolveMascotVariant(initialContext);
    let parts = buildHead();
    applyFaceAppearance(root, parts, variant);
    root.appendChild(parts.head);

    host.innerHTML = '';
    host.appendChild(root);

    let context = Object.assign({ surface: 'hub-home' }, initialContext);
    let tracking = context.surface !== 'hub-detail' && context.surface !== 'miniapp';
    let blinkTimer = null;
    let destroyed = false;

    function resetEyePositions(dx, dy) {
      parts.left.setAttribute('x', String(parts.geom.lx + dx));
      parts.right.setAttribute('x', String(parts.geom.rxPos + dx));
      parts.left.setAttribute('y', String(parts.geom.y + dy));
      parts.right.setAttribute('y', String(parts.geom.y + dy));
    }

    function repositionEyes(clientX, clientY) {
      if (reducedMotion || !tracking) return;
      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-3, Math.min(3, (clientX - cx) / 40));
      const dy = Math.max(-2, Math.min(2, (clientY - cy) / 40));
      resetEyePositions(dx, dy);
    }

    function blink() {
      if (reducedMotion || destroyed) return;
      root.classList.add('is-blinking');
      global.setTimeout(() => root.classList.remove('is-blinking'), 120);
    }

    function scheduleBlink() {
      if (reducedMotion || destroyed) return;
      const delay = 2500 + Math.random() * 4000;
      blinkTimer = global.setTimeout(() => {
        blink();
        scheduleBlink();
      }, delay);
    }

    function onMove(e) {
      repositionEyes(e.clientX, e.clientY);
    }

    if (!reducedMotion && tracking) {
      global.addEventListener('mousemove', onMove, { passive: true });
      scheduleBlink();
    }

    function setContext(next) {
      context = Object.assign({}, context, next);
      if (next.appSlug === null || next.appSlug === '') {
        delete context.appSlug;
      }
      tracking =
        context.surface !== 'hub-detail' &&
        context.surface !== 'miniapp' &&
        !reducedMotion;
      variant = resolveMascotVariant(context);
      applyFaceAppearance(root, parts, variant);
    }

    function pulse() {
      blink();
    }

    function destroy() {
      destroyed = true;
      if (blinkTimer) global.clearTimeout(blinkTimer);
      global.removeEventListener('mousemove', onMove);
      if (parts.noise) parts.noise.stop();
      root.remove();
    }

    return { setContext, destroy, pulse, el: root };
  }

  function bootCellMascot() {
    const header = document.querySelector('.site-header .container');
    if (!header || header.querySelector('[data-micr-mascot]')) return;

    const pathMatch = global.location.pathname.match(/^\/([^/]+)\/?$/);
    const slug = pathMatch ? pathMatch[1] : null;
    if (!slug || slug === 'index.html') return;

    const host = document.createElement('a');
    host.href = '/';
    host.className = 'micr-mascot-host';
    host.setAttribute('data-size', 'sm');
    host.setAttribute('aria-label', 'micr.fun catalog');
    host.innerHTML =
      '<span data-micr-mascot data-size="sm"></span>' + WORDMARK_HTML;
    header.insertBefore(host, header.firstChild);

    const mount = (categoryId) => {
      mountMascot(host.querySelector('[data-micr-mascot]'), {
        surface: 'hub-detail',
        appSlug: slug,
        categoryId: categoryId
      });
    };

    fetch('/data/graph.json')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        const cell = data && data.cells && data.cells[slug];
        mount(cell && cell.category);
      })
      .catch(() => mount(undefined));
  }

  function bootMiniappWatermark(options) {
    const opts = options || {};
    const slug = opts.slug;
    if (!slug) return null;
    const wrap = document.createElement('a');
    wrap.href = '/';
    wrap.className = 'micr-mascot-watermark micr-mascot-host';
    wrap.setAttribute('aria-label', 'micr.fun');
    wrap.innerHTML = '<span data-micr-mascot data-size="sm"></span>';
    document.body.appendChild(wrap);
    return mountMascot(wrap.querySelector('[data-micr-mascot]'), {
      surface: 'miniapp',
      appSlug: slug,
      categoryId: opts.categoryId
    });
  }

  global.MicrMascot = {
    FACE: { size: FACE_SIZE, rx: FACE_RX },
    CATEGORY_STYLES,
    resolveMascotVariant,
    mountMascot,
    bootCellMascot,
    bootMiniappWatermark
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootCellMascot);
  } else {
    bootCellMascot();
  }
})(window);
