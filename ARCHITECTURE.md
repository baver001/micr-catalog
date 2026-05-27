# Архитектура micr.fun

## Общая схема

```
┌─────────────────────────────────────────────────────────────┐
│                         ПОЛЬЗОВАТЕЛЬ                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTPS
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE DNS                            │
│                      (micr.fun)                              │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               │ micr.fun                 │ api.micr.fun
               │ (CNAME/A)                │ (CNAME, Proxied)
               ↓                          ↓
┌──────────────────────────┐   ┌──────────────────────────────┐
│      NETLIFY             │   │   CLOUDFLARE WORKER          │
│   (Frontend Hosting)     │   │      (API Server)            │
│                          │   │                              │
│  ┌────────────────────┐  │   │  ┌────────────────────────┐  │
│  │   Static Files     │  │   │  │   REST API Endpoints   │  │
│  │   - HTML           │  │   │  │   - GET /apps          │  │
│  │   - CSS            │  │   │  │   - POST /increment    │  │
│  │   - JavaScript     │  │   │  │   - GET /submissions   │  │
│  │   - Images         │  │   │  │   - POST /submissions  │  │
│  │   - PWA Manifest   │  │   │  │   - PUT /submissions   │  │
│  └────────────────────┘  │   │  │   - DELETE /submissions│  │
│                          │   │  └────────────────────────┘  │
│  ┌────────────────────┐  │   │                              │
│  │   Vite Build       │  │   │  ┌────────────────────────┐  │
│  │   - Bundling       │  │   │  │   CORS Handling        │  │
│  │   - Minification   │  │   │  │   Error Handling       │  │
│  │   - PWA Generation │  │   │  │   JSON Responses       │  │
│  └────────────────────┘  │   │  └────────────────────────┘  │
└──────────────────────────┘   └──────────────┬───────────────┘
                                              │
                                              │ SQL Queries
                                              ↓
                               ┌──────────────────────────────┐
                               │   CLOUDFLARE D1              │
                               │   (SQLite Database)          │
                               │                              │
                               │  ┌────────────────────────┐  │
                               │  │   Tables:              │  │
                               │  │   - apps               │  │
                               │  │   - submissions        │  │
                               │  └────────────────────────┘  │
                               │                              │
                               │  ┌────────────────────────┐  │
                               │  │   Indexes:             │  │
                               │  │   - status             │  │
                               │  │   - category           │  │
                               │  │   - views              │  │
                               │  └────────────────────────┘  │
                               └──────────────────────────────┘
```

## Поток данных

### 1. Загрузка главной страницы

```
Пользователь → Cloudflare DNS → Netlify → index.html
                                         ↓
                                    JavaScript загружается
                                         ↓
                                    API запрос к api.micr.fun
                                         ↓
                                    Cloudflare Worker
                                         ↓
                                    D1 Database (SELECT * FROM apps)
                                         ↓
                                    JSON ответ
                                         ↓
                                    Рендеринг приложений
```

### 2. Просмотр приложения

```
Клик на приложение → incrementAppViews(id)
                            ↓
                    POST /api/apps/increment-views
                            ↓
                    Cloudflare Worker
                            ↓
                    UPDATE apps SET views = views + 1
                            ↓
                    D1 Database
                            ↓
                    { success: true }
```

### 3. Отправка приложения

```
Форма submit.html → submitNewApp(data)
                          ↓
                  POST /api/submissions
                          ↓
                  Cloudflare Worker
                          ↓
                  INSERT INTO submissions
                          ↓
                  D1 Database
                          ↓
                  { id: "...", status: "pending" }
```

## Компоненты проекта

### Frontend (Netlify)
```
micr-frontend/
├── index.html          # Главная страница
├── app.html            # Просмотр приложения
├── submit.html         # Форма отправки
├── admin/              # Админ панель
│   ├── index.html      # Список заявок
│   └── review.html     # Проверка заявки
├── js/
│   ├── api.js          # API клиент
│   ├── store.js        # State management
│   └── i18n.js         # Переводы
├── styles/
│   └── main.css        # Стили
└── public/             # Статические файлы
```

### Backend (Cloudflare)
```
worker/
├── index.js            # Worker endpoints
├── schema.sql          # Схема БД
├── seed.sql            # Тестовые данные
└── migrations/         # Миграции
```

## Технологии

### Frontend
- **Vite** - Сборщик модулей
- **Vanilla JavaScript** - Без фреймворков
- **PWA** - Progressive Web App
- **Lucide Icons** - Иконки

### Backend
- **Cloudflare Workers** - Serverless функции
- **Cloudflare D1** - SQL база данных (SQLite)
- **Wrangler** - CLI для управления

### Хостинг
- **Netlify** - Frontend hosting
- **Cloudflare** - Worker + Database + DNS + CDN

## Безопасность

```
┌─────────────────────────────────────────┐
│           Cloudflare WAF                │
│     (Web Application Firewall)          │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│         CORS Headers                    │
│   Access-Control-Allow-Origin: *        │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      Netlify Security Headers           │
│   - X-Frame-Options: DENY               │
│   - X-Content-Type-Options: nosniff     │
│   - X-XSS-Protection: 1; mode=block     │
└─────────────────────────────────────────┘
```

## Производительность

### Кеширование
```
Static Assets (Netlify)
  ↓
Cache-Control: public, max-age=31536000, immutable
  ↓
Cloudflare CDN
  ↓
Edge Locations по всему миру
```

### Edge Computing
```
Запрос пользователя
  ↓
Ближайший Cloudflare Edge Location
  ↓
Worker выполняется на Edge
  ↓
D1 Database (региональная)
  ↓
Быстрый ответ (<50ms)
```

## Масштабирование

- **Cloudflare Workers**: Автоматическое масштабирование
- **D1 Database**: До 10GB на Free tier
- **Netlify**: Автоматическое масштабирование
- **CDN**: Глобальная сеть Cloudflare

## Стоимость (Free Tier)

| Сервис | Лимит | Стоимость |
|--------|-------|-----------|
| Cloudflare Workers | 100,000 req/day | $0 |
| Cloudflare D1 | 5M reads/day | $0 |
| Netlify | 100GB bandwidth/month | $0 |
| Cloudflare DNS | Unlimited | $0 |
| Cloudflare CDN | Unlimited | $0 |

**Итого: $0/месяц** для малых и средних проектов!
