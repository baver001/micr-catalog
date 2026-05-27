# Миграция с Supabase на Cloudflare + Netlify

## ✅ Что сделано

### 1. Инфраструктура
- ✅ Создан Cloudflare Worker для API (`worker/index.js`)
- ✅ Настроена D1 база данных (схема в `worker/schema.sql`)
- ✅ Добавлены тестовые данные (`worker/seed.sql`)
- ✅ Настроен Netlify для хостинга фронтенда
- ✅ Создан конфиг Wrangler (`wrangler.toml`)

### 2. API
- ✅ Создан API клиент (`js/api.js`)
- ✅ Реализованы все endpoints:
  - GET /api/apps
  - POST /api/apps/increment-views
  - GET /api/submissions
  - POST /api/submissions
  - PUT /api/submissions/:id
  - DELETE /api/submissions/:id
- ✅ Настроены CORS headers
- ✅ Добавлена поддержка переменных окружения

### 3. Frontend
- ✅ Обновлен `store.js` для работы с новым API
- ✅ Убрана зависимость от Supabase
- ✅ Упрощена аутентификация (простой пароль вместо Supabase Auth)
- ✅ Обновлен `package.json` (убран @supabase/supabase-js)

### 4. Конфигурация
- ✅ Обновлен `netlify.toml` с redirects и headers
- ✅ Расширен `.gitignore`
- ✅ Добавлены скрипты в `package.json`
- ✅ Создан `.env.example`

### 5. Документация
- ✅ `README.md` - описание проекта
- ✅ `DEPLOYMENT.md` - полная инструкция по развертыванию
- ✅ `QUICKSTART.md` - быстрый старт
- ✅ `COMMANDS.md` - шпаргалка по командам
- ✅ `API.md` - документация API

### 6. Скрипты
- ✅ `deploy.sh` - bash скрипт для развертывания
- ✅ `deploy.ps1` - PowerShell скрипт для Windows
- ✅ npm скрипты для разработки и деплоя

## 📋 Что нужно сделать

### Обязательно

1. **Установить Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Войти в Cloudflare**
   ```bash
   wrangler login
   ```

3. **Создать D1 базу**
   ```bash
   wrangler d1 create micr-db
   ```
   Скопировать `database_id` в `wrangler.toml`

4. **Применить схему**
   ```bash
   wrangler d1 execute micr-db --file=worker/schema.sql
   wrangler d1 execute micr-db --file=worker/seed.sql
   ```

5. **Развернуть Worker**
   ```bash
   wrangler deploy
   ```

6. **Настроить DNS в Cloudflare**
   - Добавить CNAME для `api.micr.fun` → Worker URL
   - Настроить A/CNAME для `micr.fun` → Netlify

7. **Развернуть на Netlify**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

### Опционально

- Изменить пароль админа в `js/store.js` (сейчас `admin123`)
- Добавить свои приложения в базу данных
- Настроить кастомные домены
- Добавить аналитику
- Настроить CI/CD через GitHub Actions

## 🔄 Изменения в коде

### Удалено
- `js/supabase.js` - больше не нужен
- Зависимость `@supabase/supabase-js` из package.json
- Supabase Auth (заменен на простой пароль)

### Добавлено
- `worker/` - Cloudflare Worker
- `js/api.js` - новый API клиент
- Документация и скрипты

### Изменено
- `js/store.js` - использует новый API
- `package.json` - новые скрипты
- `netlify.toml` - расширенная конфигурация
- `.gitignore` - добавлены паттерны

## 🌐 Архитектура

```
┌─────────────────┐
│   micr.fun      │  ← Netlify (Frontend)
│   (Vite + PWA)  │
└────────┬────────┘
         │
         │ API Calls
         ↓
┌─────────────────┐
│ api.micr.fun    │  ← Cloudflare Worker
│   (Worker API)  │
└────────┬────────┘
         │
         │ SQL Queries
         ↓
┌─────────────────┐
│   D1 Database   │  ← Cloudflare D1
│  (SQLite-based) │
└─────────────────┘
```

## 📊 Сравнение

| Аспект | Было (Supabase) | Стало (Cloudflare + Netlify) |
|--------|-----------------|-------------------------------|
| База данных | Supabase Postgres | Cloudflare D1 (SQLite) |
| API | Supabase REST API | Cloudflare Worker |
| Аутентификация | Supabase Auth | Простой пароль |
| Хостинг | Supabase? | Netlify |
| Стоимость | $0-25/мес | $0 (Free tier) |
| Управление | Supabase Dashboard | Wrangler CLI + Cloudflare Dashboard |

## 🎯 Преимущества

- ✅ Полный контроль над API
- ✅ Бесплатный tier Cloudflare очень щедрый
- ✅ Отличная производительность (edge computing)
- ✅ Простое управление через Wrangler
- ✅ Netlify для фронтенда - проверенное решение
- ✅ Всё на домене micr.fun

## ⚠️ Важные моменты

1. **Database ID**: Обязательно вставьте правильный `database_id` в `wrangler.toml` после создания базы

2. **DNS**: Для API используйте Proxied (оранжевое облако), для Netlify - DNS only (серое облако)

3. **Пароль админа**: Измените `ADMIN_PASSWORD` в `js/store.js` перед продакшеном

4. **API URL**: В production должен быть `https://api.micr.fun/api`, для локальной разработки - `http://localhost:8787/api`

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи: `wrangler tail`
2. Проверьте базу: `wrangler d1 execute micr-db --command="SELECT * FROM apps LIMIT 1"`
3. Проверьте DNS настройки в Cloudflare
4. См. раздел Troubleshooting в `DEPLOYMENT.md`

## 🚀 Следующие шаги

1. Запустите команды из раздела "Что нужно сделать"
2. Проверьте что всё работает локально
3. Разверните на production
4. Настройте DNS
5. Проверьте что сайт открывается на micr.fun

Удачи! 🎉
