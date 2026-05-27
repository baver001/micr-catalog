/**
 * micr.fun — Micro App PWA Bridge
 * Adds "Back to Catalog" and PWA support to individual apps.
 */

(function () {
    // 1. Add Home Button if opened standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    // Only show home button if not in iframe
    if (window.self === window.top) {
        const homeBtn = document.createElement('a');
        homeBtn.href = '/';
        homeBtn.className = 'micr-home-btn';
        homeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>В каталог</span>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .micr-home-btn {
                position: fixed;
                top: 16px;
                left: 16px;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                background: rgba(9, 9, 11, 0.8);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #fafafa;
                text-decoration: none;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                transition: transform 0.2s, background 0.2s;
            }
            .micr-home-btn:hover {
                background: rgba(9, 9, 11, 0.95);
                transform: translateY(-2px);
            }
            @media (max-width: 480px) {
                .micr-home-btn span { display: none; }
                .micr-home-btn { padding: 10px; border-radius: 50%; }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(homeBtn);
    }

    // 2. Register Service Worker (shared for the domain)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.log('SW registration failed: ', err);
            });
        });
    }
})();
