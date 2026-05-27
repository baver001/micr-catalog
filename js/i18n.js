// micr.fun — Internationalization (i18n)
// Extensible translation system with external locale files

// Inline translations (fallback + preload for fast initial render)
const inlineTranslations = {
    ru: {
        searchPlaceholder: 'Найти',
        suggest: 'Предложить',
        toggleTheme: 'Переключить тему',
        heroSubtitle: 'Коллекция микро игр и приложений',
        appsCount: 'Приложений',
        viewsCount: 'Просмотров',
        recommended: 'Рекомендуем',
        open: 'Открыть',
        allApps: 'Все приложения',
        all: 'All',
        popular: 'Популярные',
        newest: 'Новые',
        byName: 'По имени',
        games: 'Игры',
        tools: 'Инструменты',
        creative: 'Креатив',
        learning: 'Обучение',
        fun: 'Развлечения',
        social: 'Социальные',
        nothingFound: 'Ничего не найдено',
        tryChangingFilters: 'Попробуйте изменить фильтры',
        suggestApp: 'Предложить приложение',
        madeWith: 'Сделано с',
        back: 'Назад',
        share: 'Поделиться',
        fullscreen: 'Полный экран',
        install: 'Установить',
        copiedToClipboard: 'Скопировано!',
        submitTitle: 'Предложить приложение',
        appName: 'Название приложения',
        appDescription: 'Описание',
        category: 'Категория',
        selectCategory: 'Выберите категорию',
        icon: 'Иконка',
        color: 'Цвет',
        appUrl: 'URL приложения',
        authorEmail: 'Ваш email',
        submit: 'Отправить',
        submissionSuccess: 'Приложение отправлено на модерацию!',
        language: 'Язык',
        russian: 'Русский',
        english: 'English',
        theme: 'Тема оформления',
        heroTitle: 'Всё самое лучшее в одном месте',
        settings: 'Настройки',
        settingsDesc: 'Управление внешним видом приложения',
        noResultsDesc: 'Попробуйте изменить параметры поиска или фильтры'
    },
    en: {
        searchPlaceholder: 'Search',
        suggest: 'Suggest',
        toggleTheme: 'Toggle theme',
        heroSubtitle: 'Collection of micro games and apps',
        appsCount: 'Apps',
        viewsCount: 'Views',
        recommended: 'Featured',
        open: 'Open',
        allApps: 'All apps',
        all: 'All',
        popular: 'Popular',
        newest: 'Newest',
        byName: 'By name',
        games: 'Games',
        tools: 'Tools',
        creative: 'Creative',
        learning: 'Learning',
        fun: 'Fun',
        social: 'Social',
        nothingFound: 'Nothing found',
        tryChangingFilters: 'Try changing the filters',
        suggestApp: 'Suggest an app',
        madeWith: 'Made with',
        back: 'Back',
        share: 'Share',
        fullscreen: 'Fullscreen',
        install: 'Install',
        copiedToClipboard: 'Copied!',
        submitTitle: 'Suggest an app',
        appName: 'App name',
        appDescription: 'Description',
        category: 'Category',
        selectCategory: 'Select category',
        icon: 'Icon',
        color: 'Color',
        appUrl: 'App URL',
        authorEmail: 'Your email',
        submit: 'Submit',
        submissionSuccess: 'App submitted for review!',
        language: 'Language',
        russian: 'Russian',
        english: 'English',
        theme: 'Theme',
        heroTitle: 'All the Best in One Place',
        settings: 'Settings',
        settingsDesc: 'Manage application appearance',
        noResultsDesc: 'Try changing your search terms or filters'
    },
    es: {
        searchPlaceholder: 'Buscar...',
        suggest: 'Sugerir',
        toggleTheme: 'Cambiar tema',
        heroSubtitle: 'Colección de micro juegos y apps',
        appsCount: 'Apps',
        viewsCount: 'Vistas',
        recommended: 'Recomendado',
        open: 'Abrir',
        allApps: 'Todas las apps',
        all: 'Todo',
        popular: 'Popular',
        newest: 'Más nuevos',
        byName: 'Por nombre',
        games: 'Juegos',
        tools: 'Herramientas',
        creative: 'Creativo',
        learning: 'Aprendizaje',
        fun: 'Diversión',
        social: 'Social',
        nothingFound: 'No se encontró nada',
        tryChangingFilters: 'Intenta cambiar los filtros',
        suggestApp: 'Sugerir una app',
        madeWith: 'Hecho con',
        back: 'Atrás',
        share: 'Compartir',
        fullscreen: 'Pantalla completa',
        install: 'Instalar',
        copiedToClipboard: '¡Copiado!',
        submitTitle: 'Sugerir una app',
        appName: 'Nombre de la app',
        appDescription: 'Descripción',
        category: 'Categoría',
        selectCategory: 'Seleccionar categoría',
        icon: 'Icono',
        color: 'Color',
        appUrl: 'URL de la app',
        authorEmail: 'Tu email',
        submit: 'Enviar',
        submissionSuccess: '¡App enviada para revisión!',
        language: 'Idioma',
        theme: 'Tema',
        heroTitle: 'Todo lo mejor en un solo lugar',
        settings: 'Ajustes',
        noResultsDesc: 'Intenta cambiar tus términos de búsqueda o filtros'
    },
    de: {
        searchPlaceholder: 'Suchen...',
        suggest: 'Vorschlagen',
        toggleTheme: 'Design umschalten',
        heroSubtitle: 'Sammlung von Mikrojpielen und Apps',
        appsCount: 'Apps',
        viewsCount: 'Aufrufe',
        recommended: 'Ausgewählt',
        open: 'Öffnen',
        allApps: 'Alle Apps',
        all: 'Alle',
        popular: 'Beliebt',
        newest: 'Neueste',
        byName: 'Nach Name',
        games: 'Spiele',
        tools: 'Werkzeuge',
        creative: 'Kreativ',
        learning: 'Bildung',
        fun: 'Spaß',
        social: 'Soziales',
        nothingFound: 'Nichts gefunden',
        tryChangingFilters: 'Versuchen Sie, die Filter zu ändern',
        suggestApp: 'App vorschlagen',
        madeWith: 'Gepumpt mit',
        back: 'Zurück',
        share: 'Teilen',
        fullscreen: 'Vollbild',
        install: 'Installieren',
        copiedToClipboard: 'Kopiert!',
        submitTitle: 'App vorschlagen',
        appName: 'App-Name',
        appDescription: 'Beschreibung',
        category: 'Kategorie',
        selectCategory: 'Kategorie auswählen',
        icon: 'Icon',
        color: 'Farbe',
        appUrl: 'App URL',
        authorEmail: 'Deine E-Mail',
        submit: 'Einreichen',
        submissionSuccess: 'App zur Überprüfung eingereicht!',
        language: 'Sprache',
        theme: 'Design',
        heroTitle: 'Alles Beste an einem Ort',
        settings: 'Einstellungen',
        noResultsDesc: 'Versuchen Sie, Ihre Suchbegriffe oder Filter zu ändern'
    },
    fr: {
        searchPlaceholder: 'Rechercher...',
        suggest: 'Suggérer',
        toggleTheme: 'Basculer le thème',
        heroSubtitle: 'Collection de micro-jeux et applis',
        appsCount: 'Applis',
        viewsCount: 'Vues',
        recommended: 'Recommandé',
        open: 'Ouvrir',
        allApps: 'Toutes les applis',
        all: 'Tout',
        popular: 'Populaire',
        newest: 'Le plus récent',
        byName: 'Par nom',
        games: 'Jeux',
        tools: 'Outils',
        creative: 'Créatif',
        learning: 'Apprentissage',
        fun: 'Amusement',
        social: 'Social',
        nothingFound: 'Rien trouvé',
        tryChangingFilters: 'Essayez de changer les filtres',
        suggestApp: 'Suggérer une appli',
        madeWith: 'Fait avec',
        back: 'Retour',
        share: 'Partager',
        fullscreen: 'Plein écran',
        install: 'Installer',
        copiedToClipboard: 'Copié !',
        submitTitle: 'Suggérer une appli',
        appName: 'Nom de l’appli',
        appDescription: 'Description',
        category: 'Catégorie',
        selectCategory: 'Sélectionner une catégorie',
        icon: 'Icône',
        color: 'Couleur',
        appUrl: 'URL de l’appli',
        authorEmail: 'Votre e-mail',
        submit: 'Soumettre',
        submissionSuccess: 'Appli soumise pour révision !',
        language: 'Langue',
        theme: 'Thème',
        heroTitle: 'Tout le meilleur au même endroit',
        settings: 'Paramètres',
        noResultsDesc: 'Essayez de modifier vos termes de recherche ou vos filtres'
    },
    zh: {
        searchPlaceholder: '搜索...',
        suggest: '建议',
        toggleTheme: '切换主题',
        heroSubtitle: '微型游戏和应用合集',
        appsCount: '应用',
        viewsCount: '浏览量',
        recommended: '推荐',
        open: '打开',
        allApps: '所有应用',
        all: '全部',
        popular: '热门',
        newest: '最新',
        byName: '按名称',
        games: '游戏',
        tools: '工具',
        creative: '创意',
        learning: '学习',
        fun: '娱乐',
        social: '社交',
        nothingFound: '什么也没找到',
        tryChangingFilters: '尝试更改过滤器',
        suggestApp: '建议应用',
        madeWith: '使用...制作',
        back: '返回',
        share: '分享',
        fullscreen: '全屏',
        install: '安装',
        copiedToClipboard: '已复制！',
        submitTitle: '建议应用',
        appName: '应用名称',
        appDescription: '描述',
        category: '类别',
        selectCategory: '选择类别',
        icon: '图标',
        color: '颜色',
        appUrl: '应用URL',
        authorEmail: '您的电子邮件',
        submit: '提交',
        submissionSuccess: '应用已提交以供审核！',
        language: '语言',
        theme: '主题',
        heroTitle: '最好的都在这里',
        settings: '设置',
        noResultsDesc: '尝试更改您的搜索词或过滤器'
    },
    ja: {
        searchPlaceholder: '検索...',
        suggest: '提案する',
        toggleTheme: 'テーマを切り替える',
        heroSubtitle: 'マイクロゲームとアプリのコレクション',
        appsCount: 'アプリ',
        viewsCount: '閲覧数',
        recommended: 'おすすめ',
        open: '開く',
        allApps: 'すべてのアプリ',
        all: 'すべて',
        popular: '人気',
        newest: '最新',
        byName: '名前順',
        games: 'ゲーム',
        tools: 'ツール',
        creative: 'クリエイティブ',
        learning: '学習',
        fun: 'お楽しみ',
        social: 'ソーシャル',
        nothingFound: '何も見つかりませんでした',
        tryChangingFilters: 'フィルターを変更してみてください',
        suggestApp: 'アプリを提案する',
        madeWith: '作られた',
        back: '戻る',
        share: '共有',
        fullscreen: '全画面表示',
        install: 'インストール',
        copiedToClipboard: 'コピーしました！',
        submitTitle: 'アプリを提案する',
        appName: 'アプリ名',
        appDescription: '説明',
        category: 'カテゴリー',
        selectCategory: 'カテゴリーを選択',
        icon: 'アイコン',
        color: '色',
        appUrl: 'アプリのURL',
        authorEmail: 'あなたのメール',
        submit: '送信',
        submissionSuccess: 'アプリが審査のために送信されました！',
        language: '言語',
        theme: 'テーマ',
        heroTitle: '最高なものを一箇所に',
        settings: '設定',
        noResultsDesc: '検索ワードやフィルターを変更してみてください'
    }
};

// Extended translations loaded from files
let extendedTranslations = {};

// Current language
let currentLang = 'ru';

// Available languages registry
const languageRegistry = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
];

/**
 * Get translation by key
 * Supports nested keys like 'header.title'
 */
export function t(key) {
    // Try extended translations first (nested structure)
    const ext = extendedTranslations[currentLang];
    if (ext) {
        const nested = getNestedValue(ext, key);
        if (nested) return nested;
    }
    
    // Fallback to inline translations
    return inlineTranslations[currentLang]?.[key] || 
           inlineTranslations.ru[key] || 
           key;
}

/**
 * Get nested value from object by dot-notation key
 */
function getNestedValue(obj, key) {
    return key.split('.').reduce((o, k) => o?.[k], obj);
}

/**
 * Get current language code
 */
export function getLang() {
    return currentLang;
}

/**
 * Set language
 */
export function setLang(lang) {
    const langInfo = languageRegistry.find(l => l.code === lang);
    if (langInfo) {
        currentLang = lang;
        localStorage.setItem('micr-lang', lang);
        document.documentElement.lang = lang;
        return true;
    }
    return false;
}

/**
 * Get available languages
 */
export function getAvailableLanguages() {
    return languageRegistry.map(l => ({
        code: l.code,
        name: l.name,
        flag: l.flag
    }));
}

/**
 * Register a new language
 * @param {Object} langInfo - { code, name, flag, translations }
 */
export function registerLanguage(langInfo) {
    const exists = languageRegistry.find(l => l.code === langInfo.code);
    if (!exists) {
        languageRegistry.push({
            code: langInfo.code,
            name: langInfo.name,
            flag: langInfo.flag || '🌐',
            file: langInfo.file || null
        });
    }
    
    if (langInfo.translations) {
        extendedTranslations[langInfo.code] = langInfo.translations;
        
        // Also merge into inline for t() fallback
        if (!inlineTranslations[langInfo.code]) {
            inlineTranslations[langInfo.code] = {};
        }
        flattenTranslations(langInfo.translations, inlineTranslations[langInfo.code]);
    }
}

/**
 * Flatten nested translations object
 */
function flattenTranslations(obj, target, prefix = '') {
    for (const key in obj) {
        const val = obj[key];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            flattenTranslations(val, target, prefix + key + '.');
        } else {
            // Use last part of key for backward compatibility
            const simpleKey = key;
            target[simpleKey] = val;
        }
    }
}

/**
 * Load language file dynamically
 */
export async function loadLanguage(langCode) {
    const langInfo = languageRegistry.find(l => l.code === langCode);
    if (!langInfo?.file) return false;
    
    try {
        const response = await fetch(langInfo.file);
        if (response.ok) {
            const data = await response.json();
            extendedTranslations[langCode] = data;
            return true;
        }
    } catch (e) {
        console.warn(`Failed to load language file: ${langInfo.file}`, e);
    }
    return false;
}

/**
 * Initialize language from saved preference
 */
export function initLang() {
    const saved = localStorage.getItem('micr-lang');
    const langExists = languageRegistry.some(l => l.code === saved);
    
    if (saved && langExists) {
        currentLang = saved;
    } else {
        // Detect browser language
        const browserLang = navigator.language.slice(0, 2);
        const browserLangExists = languageRegistry.some(l => l.code === browserLang);
        currentLang = browserLangExists ? browserLang : 'ru';
    }
    
    document.documentElement.lang = currentLang;
    return currentLang;
}

/**
 * Get all translation keys for debugging
 */
export function getAllKeys() {
    return Object.keys(inlineTranslations[currentLang] || {});
}
