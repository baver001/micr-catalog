import {
    getAppsData,
    initTheme,
    toggleTheme as storeToggleTheme,
    sortApps,
    filterApps,
    getAppUrl,
    toggleFavorite
} from './store.js';
import { t, initLang, setLang, getLang, getAvailableLanguages } from './i18n.js';
import { createIcons, icons } from 'lucide';

// Helper to refresh icons
const refreshIcons = () => createIcons({ icons });

// State
let apps = [];
let categories = {};
let currentCategory = 'all';
let searchQuery = '';
let currentSort = 'popular';

/**
 * Update theme toggle UI and body class
 */
function updateThemeUI(theme) {
    document.body.className = `theme-${theme}`;
    
    const sunIcon = document.querySelector('.sun-icon-small');
    const moonIcon = document.querySelector('.moon-icon-small');
    const themeThumb = document.querySelector('.theme-toggle-thumb');
    
    if (theme === 'light') {
        sunIcon?.classList.remove('hidden');
        moonIcon?.classList.add('hidden');
    } else {
        sunIcon?.classList.add('hidden');
        moonIcon?.classList.remove('hidden');
    }
}

// Initialize Theme
const initialTheme = initTheme();
updateThemeUI(initialTheme);

// Initialize Icons
requestAnimationFrame(() => refreshIcons());

// Settings Modal Logic
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const themeToggleRow = document.getElementById('themeToggleRow');

if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    closeSettings?.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
        document.body.style.overflow = '';
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettings.click();
    });

    if (themeToggleRow) {
        themeToggleRow.addEventListener('click', (e) => {
            e.stopPropagation();
            const newTheme = storeToggleTheme();
            updateThemeUI(newTheme);
            refreshIcons();
        });
    }
}

/**
 * Language Selection
 */
function renderLanguageSelect() {
    const select = document.getElementById('languageSelect');
    if (!select) return;
    
    const langs = getAvailableLanguages();
    const current = getLang();
    
    select.innerHTML = langs.map(lang =>
        `<option value="${lang.code}" ${lang.code === current ? 'selected' : ''}>${lang.flag} ${lang.name}</option>`
    ).join('');
    
    select.onchange = () => {
        const langCode = select.value;
        if (langCode && setLang(langCode)) {
            updateUILanguage(langCode);
        }
    };
}

function updateUILanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    renderCategories();
    renderApps();
    refreshIcons();
}

// Init language
const currentLang = initLang();
updateUILanguage(currentLang);
renderLanguageSelect();

/**
 * Search Logic
 */
const searchTrigger = document.getElementById('searchTrigger');
const searchModal = document.getElementById('searchModal');
const modalSearchInput = document.getElementById('modalSearchInput');
const closeSearch = document.getElementById('closeSearch');
const searchResults = document.getElementById('searchResults');

if (searchTrigger) {
    searchTrigger.addEventListener('click', () => {
        searchModal.classList.remove('hidden');
        modalSearchInput.focus();
        document.body.style.overflow = 'hidden';
        renderSearchResults(modalSearchInput.value);
    });

    closeSearch?.addEventListener('click', () => {
        searchModal.classList.add('hidden');
        document.body.style.overflow = '';
    });

    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) closeSearch.click();
    });

    modalSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderSearchResults(searchQuery);
    });
}

function renderSearchResults(query) {
    if (!query.trim()) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
    }

    searchResults.style.display = 'block';
    const filtered = filterApps(apps, { search: query });
    
    if (filtered.length === 0) {
        searchResults.innerHTML = `<div class="p-8 text-center text-muted">${t('noResults')}</div>`;
        return;
    }

    searchResults.innerHTML = filtered.map(app => `
        <div class="settings-item" data-id="${app.id}">
            <div class="settings-item-info">
                <div class="viewer-icon" style="background: linear-gradient(135deg, ${getGradientColors(app.color)})">
                    <i data-lucide="${app.icon}"></i>
                </div>
                <div>
                    <div class="font-bold">${app.name}</div>
                    <div class="text-xs text-muted">${categories[app.category]?.name || app.category}</div>
                </div>
            </div>
        </div>
    `).join('');

    searchResults.querySelectorAll('[data-id]').forEach(item => {
        item.addEventListener('click', () => {
            closeSearch.click();
            openApp(item.dataset.id);
        });
    });
    refreshIcons();
}

/**
 * Particles System
 */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas?.getContext('2d');
let particles = [];
let mouse = { x: -100, y: -100 };

function initParticles() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < 40; i++) {
        const baseAlpha = Math.random() * 0.3 + 0.1;
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            size: Math.random() * 2 + 1,
            alpha: baseAlpha,
            baseAlpha: baseAlpha
        });
    }
}

function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const rgb = isLight ? '0, 0, 0' : '255, 255, 255';

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        
        // Attract to mouse and increase luminosity
        if (dist < 200) {
            const force = (200 - dist) / 200;
            p.vx += (dx / dist) * force * 0.05;
            p.vy += (dy / dist) * force * 0.05;
            p.alpha = Math.min(0.8, p.baseAlpha + (200 - dist) / 200);
        } else {
            p.alpha = Math.max(p.baseAlpha, p.alpha - 0.02);
        }

        // Inertia
        p.vx *= 0.98;
        p.vy *= 0.98;
        
        // Base random velocity
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;

        // Speed limit
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 1.5) {
            p.vx = (p.vx / speed) * 1.5;
            p.vy = (p.vy / speed) * 1.5;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = `rgba(${rgb}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect particles
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist2 = Math.hypot(p2.x - p.x, p2.y - p.y);
            if (dist2 < 120) {
                const lineAlpha = ((120 - dist2) / 120) * 0.15;
                ctx.strokeStyle = `rgba(${rgb}, ${lineAlpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', initParticles);
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
initParticles();
animateParticles();

/**
 * Mascot Logo System
 */
const leftEye = document.getElementById('leftEye');
const rightEye = document.getElementById('rightEye');
const logoSvg = document.getElementById('logoSvg');
const logoLink = document.getElementById('logoLink');

const baseLeftX = 11, baseRightX = 24, baseY = 12, baseHeight = 20;
let lastMove = Date.now(), isSleepy = false, isBlinking = false;

function setEyeState(heightRatio, centerOffset = 0) {
    if (!leftEye || !rightEye) return;
    const newHeight = baseHeight * heightRatio;
    const yOffset = (baseHeight - newHeight) / 2 + centerOffset;
    [leftEye, rightEye].forEach(eye => {
        eye.setAttribute('height', newHeight);
        eye.setAttribute('y', baseY + yOffset);
    });
}

function blink() {
    if (isBlinking) return;
    isBlinking = true;
    setEyeState(0.1);
    setTimeout(() => {
        setEyeState(isSleepy ? 0.5 : 1, isSleepy ? 2 : 0);
        isBlinking = false;
    }, 80);
}

function moveEyes(targetX, targetY) {
    if (!logoSvg || !leftEye || !rightEye) return;
    const rect = logoSvg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(targetY - centerY, targetX - centerX);
    const dist = Math.min(4, Math.hypot(targetX - centerX, targetY - centerY) / 80);
    const dx = Math.cos(angle) * dist, dy = Math.sin(angle) * dist * 1.2;

    leftEye.setAttribute('x', baseLeftX + dx);
    rightEye.setAttribute('x', baseRightX + dx);
    if (!isBlinking) {
        const h = parseFloat(leftEye.getAttribute('height')) || baseHeight;
        const y = baseY + (baseHeight - h) / 2 + dy;
        leftEye.setAttribute('y', y); rightEye.setAttribute('y', y);
    }
}

if (logoLink) {
    logoLink.addEventListener('mouseenter', () => { if(!isBlinking && !isSleepy) setEyeState(1.1, -1); });
    logoLink.addEventListener('mouseleave', () => { if(!isBlinking && !isSleepy) setEyeState(1); });
    logoLink.addEventListener('mousedown', (e) => { e.preventDefault(); if(!isBlinking) setEyeState(0.6, 2); });
    logoLink.addEventListener('mouseup', () => { if(!isBlinking && !isSleepy) { setEyeState(1.1, -1); setTimeout(() => { if(!isBlinking && !isSleepy) setEyeState(1); }, 200); } });
    
    // Scroll to top on click
    logoLink.addEventListener('click', (e) => {
        if (window.scrollY > 100) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

(function blinkLoop() {
    setTimeout(() => { blink(); if(Math.random()<0.2) setTimeout(blink, 200); blinkLoop(); }, 2000 + Math.random()*5000);
})();

setInterval(() => {
    if (Date.now() - lastMove > 15000 && !isSleepy && !isBlinking) { isSleepy = true; setEyeState(0.5, 2); }
    else if (Date.now() - lastMove > 4000 && !isSleepy) moveEyes(Math.random()*window.innerWidth, Math.random()*window.innerHeight);
}, 3000);

/**
 * UI Rendering & Logic
 */
const sortBtn = document.getElementById('sortBtn');
const sortDropdown = document.getElementById('sortDropdown');
const sortLabel = document.getElementById('sortLabel');
const mobileFilterTrigger = document.getElementById('mobileFilterTrigger');
const filtersModal = document.getElementById('filtersModal');
const closeFilters = document.getElementById('closeFilters');

if (mobileFilterTrigger && filtersModal) {
    mobileFilterTrigger.addEventListener('click', () => {
        filtersModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    closeFilters?.addEventListener('click', () => {
        filtersModal.classList.add('hidden');
        document.body.style.overflow = '';
    });

    filtersModal.addEventListener('click', (e) => {
        if (e.target === filtersModal) closeFilters.click();
    });
}

function updateSortActiveStates() {
    document.querySelectorAll('.sort-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.sort === currentSort);
    });
}

function renderSortOptions() {
    const sortOptions = [
        { id: 'popular', name: t('popular') || 'Популярные' },
        { id: 'newest', name: t('newest') || 'Новые' },
        { id: 'name', name: t('name') || 'По имени' }
    ];

    const modalSortContainer = document.getElementById('modalSortOptions');
    if (modalSortContainer) {
        modalSortContainer.innerHTML = sortOptions.map(opt => 
            `<button class="sort-option ${opt.id === currentSort ? 'active' : ''}" data-sort="${opt.id}">${opt.name}</button>`
        ).join('');
        
        modalSortContainer.querySelectorAll('.sort-option').forEach(option => {
            option.addEventListener('click', () => {
                currentSort = option.dataset.sort;
                if (sortLabel) {
                    const desktopMatch = Array.from(document.querySelectorAll('#sortDropdown .sort-option')).find(o => o.dataset.sort === currentSort);
                    if (desktopMatch) sortLabel.textContent = desktopMatch.textContent;
                }
                updateSortActiveStates();
                closeFilters?.click();
                renderApps();
            });
        });
    }
}

if (sortBtn) {
    sortBtn.addEventListener('click', () => sortDropdown.classList.toggle('hidden'));
    document.querySelectorAll('#sortDropdown .sort-option').forEach(option => {
        option.addEventListener('click', () => {
            currentSort = option.dataset.sort;
            sortLabel.textContent = option.textContent;
            sortDropdown.classList.add('hidden');
            updateSortActiveStates();
            renderApps();
        });
    });
    document.addEventListener('click', (e) => {
        if (!sortBtn.contains(e.target)) sortDropdown.classList.add('hidden');
    });
}

function renderSkeletons() {
    const grid = document.getElementById('appsGrid');
    if (!grid) return;
    grid.innerHTML = Array(6).fill(0).map(() => `<div class="skeleton-card"><div class="skeleton h-40"></div><div class="p-6"><div class="skeleton h-6 w-3/4 mb-4"></div><div class="skeleton h-4 w-full mb-2"></div><div class="skeleton h-4 w-2/3"></div></div></div>`).join('');
}

function renderCategories() {
    const container = document.getElementById('categoryFilters');
    const modalContainer = document.getElementById('modalCategoryFilters');
    
    const list = [{ id: 'all', name: t('all') || 'Все', color: '#8b5cf6' }, ...Object.entries(categories).map(([id, c]) => ({ id, ...c }))];
    const renderHtml = list.map(c => `<button class="filter-btn ${c.id === currentCategory ? 'active' : ''}" data-category="${c.id}" style="--cat-color: ${c.color}">${c.icon ? `<i data-lucide="${c.icon}"></i>` : ''}${c.name}</button>`).join('');
    
    if (container) {
        container.innerHTML = renderHtml;
        container.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => { currentCategory = btn.dataset.category; renderCategories(); renderApps(); }));
    }
    
    if (modalContainer) {
        modalContainer.innerHTML = renderHtml;
        modalContainer.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => { 
            currentCategory = btn.dataset.category; 
            renderCategories(); 
            renderApps();
            closeFilters?.click();
        }));
    }
    renderSortOptions();
    refreshIcons();
}

function renderApps() {
    const grid = document.getElementById('appsGrid');
    const empty = document.getElementById('emptyState');
    if (!grid) return;
    let filtered = filterApps(apps, { category: currentCategory, search: searchQuery });
    filtered = sortApps(filtered, currentSort);
    if (filtered.length === 0) {
        grid.innerHTML = ''; empty?.classList.remove('hidden');
    } else {
        empty?.classList.add('hidden');
        grid.innerHTML = filtered.map((app, i) => `
            <div class="app-card" data-app-id="${app.id}" style="animation-delay: ${i * 0.05}s; --cat-color: ${categories[app.category]?.color || '#8b5cf6'};">
                <div class="app-card-cover">
                    <img src="${app.image || `https://picsum.photos/seed/${app.id}/400/225`}" alt="${app.name}" loading="lazy">
                    <span class="category-badge" data-category="${app.category}" style="--cat-color: ${categories[app.category]?.color || '#8b5cf6'};">${categories[app.category]?.name || app.category}</span>
                </div>
                <div class="app-card-content">
                    <h3 class="app-card-title">${app.name}</h3>
                    <p class="app-card-desc">${app.description}</p>
                </div>
            </div>
        `).join('');
        grid.querySelectorAll('.app-card').forEach(card => card.addEventListener('click', () => openApp(card.dataset.appId)));
        grid.querySelectorAll('.category-badge').forEach(badge => badge.addEventListener('click', (e) => {
            e.stopPropagation();
            currentCategory = badge.dataset.category;
            renderCategories();
            renderApps();
        }));
    }
    refreshIcons();
}

/**
 * App Viewer Logic
 */
async function openApp(appId, pushState = true) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    const viewer = document.getElementById('appViewer');
    const frame = document.getElementById('viewerFrame');
    const icon = document.getElementById('viewerIcon');
    const title = document.getElementById('viewerTitle');
    const category = document.getElementById('viewerCategory');
    const loading = document.getElementById('viewerLoading');
    title.textContent = app.name;
    category.textContent = categories[app.category]?.name || app.category;
    icon.style.background = `linear-gradient(135deg, ${getGradientColors(app.color)})`;
    icon.innerHTML = `<i data-lucide="${app.icon}"></i>`;
    loading.classList.remove('hidden');
    viewer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    frame.src = app.url;
    frame.onload = () => loading.classList.add('hidden');
    if (pushState) history.pushState({ appId }, '', `/app.html?id=${appId}`);
    refreshIcons();
}

function closeApp(pushState = true) {
    const viewer = document.getElementById('appViewer');
    const frame = document.getElementById('viewerFrame');
    if (!viewer) return;
    viewer.classList.add('hidden');
    frame.src = '';
    document.body.style.overflow = '';
    if (pushState) history.pushState(null, '', '/');
}

document.getElementById('closeViewer')?.addEventListener('click', () => closeApp());
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.appId) openApp(e.state.appId, false);
    else closeApp(false);
});

// Extra Viewer Actions
document.getElementById('viewerShare')?.addEventListener('click', async () => {
    const text = `Посмотри ${document.getElementById('viewerTitle').textContent} на micr.fun!`;
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: 'micr.fun', text, url }); } catch(e) {} }
    else { navigator.clipboard.writeText(url); alert('Ссылка скопирована!'); }
});

document.getElementById('viewerFullscreen')?.addEventListener('click', () => {
    const frame = document.getElementById('viewerFrame');
    if (frame.requestFullscreen) frame.requestFullscreen();
    else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
});

function getGradientColors(colorClass) {
    const map = {
        'from-amber-500 to-orange-500': '#f59e0b, #f97316',
        'from-purple-500 to-pink-500': '#a855f7, #ec4899',
        'from-blue-500 to-cyan-500': '#3b82f6, #06b6d4',
        'from-rose-500 to-red-500': '#f43f5e, #ef4444',
        'from-emerald-500 to-green-500': '#10b981, #22c55e',
        'from-violet-500 to-purple-500': '#8b5cf6, #a855f7',
        'from-teal-500 to-emerald-500': '#14b8a6, #10b981',
        'from-red-500 to-rose-500': '#ef4444, #f43f5e',
        'from-red-400 to-orange-400': '#f87171, #fb923c',
        'from-indigo-500 to-blue-500': '#6366f1, #3b82f6',
        'from-yellow-400 to-amber-500': '#facc15, #f59e0b',
        'from-cyan-500 to-blue-500': '#06b6d4, #3b82f6',
        'from-slate-500 to-zinc-500': '#64748b, #71717a',
        'from-fuchsia-500 to-pink-500': '#d946ef, #ec4899',
        'from-green-500 to-emerald-500': '#22c55e, #10b981',
        'from-sky-500 to-blue-500': '#0ea5e9, #3b82f6'
    };
    return map[colorClass] || '#8b5cf6, #d946ef';
}

/**
 * Global Initialization
 */
async function init() {
    renderSkeletons();
    try {
        const data = await getAppsData();
        apps = data.apps || [];
        categories = data.categories || {};
        renderCategories();
        renderApps();
        const id = new URLSearchParams(window.location.search).get('id');
        if (id) setTimeout(() => openApp(id, false), 150);
    } catch (err) { console.error('Init failed', err); }
}

init();

document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchTrigger?.click(); }
    if (e.key === 'Escape') { closeSearch?.click(); closeApp(); }
});
