// micr.fun — App Store Utilities
import {
    getApps,
    incrementViews,
    submitApp,
    getSubmissions as getSubmissionsAPI,
    updateSubmissionStatus as updateSubmissionStatusAPI,
    deleteSubmission as deleteSubmissionAPI
} from './api.js';

const STORAGE_KEYS = {
    FAVORITES: 'micr_favorites',
    SUBMISSIONS: 'micr_submissions',
    ADMIN_AUTH: 'micr_admin_auth',
    THEME: 'micr_theme'
};

const CATEGORIES = {
    "games": { "name": "Игры", "icon": "gamepad-2", "class": "cat-games", "color": "#E9B33D" },
    "tools": { "name": "Инструменты", "icon": "wrench", "class": "cat-tools", "color": "#4F86F7" },
    "creative": { "name": "Креатив", "icon": "palette", "class": "cat-creative", "color": "#9D5FFB" },
    "learning": { "name": "Обучение", "icon": "book-open", "class": "cat-learning", "color": "#3EC193" },
    "fun": { "name": "Развлечения", "icon": "sparkles", "class": "cat-fun", "color": "#FF4E72" },
    "social": { "name": "Социальные", "icon": "message-circle", "class": "cat-social", "color": "#22D3EE" }
};

// Theme management
export function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
}

export function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEYS.THEME, next);
    return next;
}

// Favorites management
export function getFavorites() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
}

export function toggleFavorite(appId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(appId);
    if (index === -1) {
        favorites.push(appId);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return favorites;
}

export function isFavorite(appId) {
    return getFavorites().includes(appId);
}

// Submissions management
export async function submitNewApp(submission) {
    try {
        const data = await submitApp(submission);
        return data;
    } catch (err) {
        console.error("Submission failed:", err);
        throw err;
    }
}

export async function getSubmissions() {
    return await getSubmissionsAPI();
}

export async function updateSubmissionStatus(submissionId, status) {
    return await updateSubmissionStatusAPI(submissionId, status);
}

export async function deleteSubmission(submissionId) {
    return await deleteSubmissionAPI(submissionId);
}

// Admin authentication - Simple password-based
const ADMIN_PASSWORD = 'admin123'; // Change this in production!

export function isAdminAuthenticated() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

export function adminLogin(password) {
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
        return true;
    }
    return false;
}

export function adminLogout() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
}

// Apps data fetching
let appsCache = null;

const LOCAL_APPS = [
    // Demo apps with real cover images
    {
        id: 'demo-snake',
        name: 'Змейка',
        description: 'Классическая игра Змейка. Собирай еду и не врезайся в стены!',
        category: 'games',
        icon: 'gamepad-2',
        color: '#f59e0b',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=200&fit=crop',
        url: '#demo',
        views: 15420,
        status: 'published',
        created_at: '2024-01-15'
    },
    {
        id: 'demo-tetris',
        name: 'Тетрис',
        description: 'Легендарная головоломка. Собирай линии и набирай очки!',
        category: 'games',
        icon: 'grid-3x3',
        color: '#ef4444',
        image: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400&h=200&fit=crop',
        url: '#demo',
        views: 12300,
        status: 'published',
        created_at: '2024-01-20'
    },
    {
        id: 'demo-2048',
        name: '2048',
        description: 'Соединяй числа и доберись до 2048!',
        category: 'games',
        icon: 'hash',
        color: '#f97316',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&h=200&fit=crop',
        url: '#demo',
        views: 9800,
        status: 'published',
        created_at: '2024-02-01'
    },
    {
        id: 'demo-pomodoro',
        name: 'Помодоро Таймер',
        description: 'Техника продуктивности: 25 минут работы, 5 минут отдыха',
        category: 'tools',
        icon: 'timer',
        color: '#3b82f6',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop',
        url: '#demo',
        views: 8500,
        status: 'published',
        created_at: '2024-01-10'
    },
    {
        id: 'demo-notes',
        name: 'Быстрые заметки',
        description: 'Простой блокнот для быстрых записей',
        category: 'tools',
        icon: 'sticky-note',
        color: '#0ea5e9',
        image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=200&fit=crop',
        url: '#demo',
        views: 7200,
        status: 'published',
        created_at: '2024-01-25'
    },
    {
        id: 'demo-calculator',
        name: 'Калькулятор',
        description: 'Стильный калькулятор для повседневных расчетов',
        category: 'tools',
        icon: 'calculator',
        color: '#6366f1',
        image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=400&h=200&fit=crop',
        url: '#demo',
        views: 6100,
        status: 'published',
        created_at: '2024-02-05'
    },
    {
        id: 'demo-pixel',
        name: 'Пиксель Арт',
        description: 'Рисуй пиксельные картинки и сохраняй их',
        category: 'creative',
        icon: 'brush',
        color: '#a855f7',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
        url: '#demo',
        views: 5400,
        status: 'published',
        created_at: '2024-01-18'
    },
    {
        id: 'demo-palette',
        name: 'Генератор Палитр',
        description: 'Создавай красивые цветовые палитры',
        category: 'creative',
        icon: 'palette',
        color: '#d946ef',
        image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=200&fit=crop',
        url: '#demo',
        views: 4800,
        status: 'published',
        created_at: '2024-02-10'
    },
    {
        id: 'demo-typing',
        name: 'Тренажер Печати',
        description: 'Улучшай скорость и точность печати',
        category: 'learning',
        icon: 'keyboard',
        color: '#10b981',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=200&fit=crop',
        url: '#demo',
        views: 6700,
        status: 'published',
        created_at: '2024-01-22'
    },
    {
        id: 'demo-quiz',
        name: 'Викторина',
        description: 'Проверь свои знания в разных областях',
        category: 'learning',
        icon: 'brain',
        color: '#14b8a6',
        image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=200&fit=crop',
        url: '#demo',
        views: 5100,
        status: 'published',
        created_at: '2024-02-08'
    },
    {
        id: 'demo-meme',
        name: 'Генератор Мемов',
        description: 'Создавай смешные мемы за секунды',
        category: 'fun',
        icon: 'smile',
        color: '#f43f5e',
        image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=200&fit=crop',
        url: '#demo',
        views: 11200,
        status: 'published',
        created_at: '2024-01-28'
    },
    {
        id: 'demo-fortune',
        name: 'Предсказания',
        description: 'Узнай что тебя ждет сегодня!',
        category: 'fun',
        icon: 'sparkles',
        color: '#ec4899',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
        url: '#demo',
        views: 8900,
        status: 'published',
        created_at: '2024-02-03'
    },
    {
        id: 'demo-chat',
        name: 'Анонимный Чат',
        description: 'Общайся с людьми со всего мира',
        category: 'social',
        icon: 'message-circle',
        color: '#06b6d4',
        image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=200&fit=crop',
        url: '#demo',
        views: 7800,
        status: 'published',
        created_at: '2024-01-30'
    },
    {
        id: 'demo-poll',
        name: 'Создатель Опросов',
        description: 'Создавай опросы и делись с друзьями',
        category: 'social',
        icon: 'bar-chart-3',
        color: '#22d3ee',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
        url: 'https://micr.fun/apps/poll/',
        views: 4500,
        status: 'published',
        created_at: '2024-02-12'
    },
    {
        id: 'demo-1010',
        name: '1010!',
        description: 'Захватывающая головоломка с блоками. Очищай линии и ставь рекорды!',
        category: 'games',
        icon: 'grid-2x2',
        color: '#facc15',
        image: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=400&h=200&fit=crop',
        url: 'https://micr.fun/apps/1010/',
        views: 18200,
        status: 'published',
        created_at: '2024-02-28'
    }
];

export async function getAppsData() {
    if (appsCache) return appsCache;

    try {
        const apps = await getApps();
        console.log('Store: Received apps from Supabase:', apps);

        let mergedApps = [...(apps || []), ...LOCAL_APPS];

        // Ensure all have correct URL properties
        mergedApps = mergedApps.map(app => ({
            ...app,
            url: app.url || app.path
        }));

        appsCache = {
            apps: mergedApps,
            categories: CATEGORIES
        };
        return appsCache;
    } catch (error) {
        console.error('Failed to load apps data:', error);

        // Fallback to local apps if DB fails
        const fallbackApps = LOCAL_APPS.map(app => ({
            ...app,
            url: app.url || app.path
        }));

        return { apps: fallbackApps, categories: CATEGORIES };
    }
}

export function formatViews(views) {
    if (!views) return '0';
    if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
}

// Increment views wrapper
export async function incrementAppViews(appId) {
    // Call Cloudflare Worker API
    await incrementViews(appId);
}

// Sort apps
export function sortApps(apps, sortType) {
    const sorted = [...apps];
    switch (sortType) {
        case 'popular':
            return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        case 'newest':
            return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return sorted;
    }
}

// Filter apps
export function filterApps(apps, { category = 'all', search = '', favoritesOnly = false }) {
    const favorites = getFavorites();

    return apps.filter(app => {
        const matchesCategory = category === 'all' || app.category === category;
        const matchesSearch = !search ||
            app.name.toLowerCase().includes(search.toLowerCase()) ||
            (app.description && app.description.toLowerCase().includes(search.toLowerCase()));

        // Use 'slug' or 'id' for favorites? 
        // The favorites logic used 'id' from JSON which was 'spend-elons-money'.
        // In DB, 'id' is UUID, 'slug' is 'spend-elons-money'.
        // We should probably favor 'id' (UUID) for future, BUT the existing favorites in localStorage are likely slugs.
        // Let's check if the 'id' passed to toggleFavorite was the slug.
        // Yes, in apps.json 'id' was 'spend-elons-money'.
        // So for backward compatibility, we should probably check both or migrate favorites?
        // Let's assume we use UUIDs now? 
        // Actually, let's look at the data I inserted. I inserted 'slug'='spend-elons-money'.
        // The 'id' will be a new UUID.
        // If I use UUID for favorites, the old favorites (slugs) will break.
        // I should probably update `toggleFavorite` to use UUID, and clear old favorites or handle them.
        // OR I can continue using SLUG as the key for favorites if it's unique.
        // The DB schema says slug is unique.
        // Let's stick to using the app 'id' (UUID) for consistency with DB, but I handle the migration of favorites?
        // No, let's just use the 'id' from the object we get.
        // In `getAppsData`, we get objects from DB. They have `id` (uuid) and `slug` (string).
        // I will update the favorite logic to use `id` (UUID). Users will lose favorites, that's acceptable for this stage.

        const matchesFavorites = !favoritesOnly || favorites.includes(app.id);
        const isPublished = app.status === 'published';

        return matchesCategory && matchesSearch && matchesFavorites && isPublished;
    });
}

// URL utilities
export function getAppUrl(appId) {
    // We navigate to /app.html?id=...
    // Should we use slug or UUID in URL?
    // Using slug is nicer: /app.html?id=spend-elons-money
    // But then we need to fetch by slug.
    // getApps() returns all. filterApps filters them.
    // If I use UUID in URL, it's safer.
    // Let's use UUID for now as it's the primary key.
    return `/app.html?id=${appId}`;
}

export function getAppIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}
