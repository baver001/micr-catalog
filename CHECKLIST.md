# ✅ Чеклист развертывания micr.fun

Используйте этот чеклист для пошагового развертывания проекта.

## Подготовка

- [ ] Node.js установлен (v18+)
- [ ] npm установлен
- [ ] Git установлен (опционально)
- [ ] Аккаунт Cloudflare создан
- [ ] Аккаунт Netlify создан
- [ ] Домен micr.fun добавлен в Cloudflare

## Шаг 1: Установка инструментов

- [ ] Установлен Wrangler: `npm install -g wrangler`
- [ ] Установлен Netlify CLI: `npm install -g netlify-cli`
- [ ] Установлены зависимости проекта: `npm install`

## Шаг 2: Cloudflare Worker

- [ ] Выполнен вход: `wrangler login`
- [ ] Создана база D1: `wrangler d1 create micr-db`
- [ ] Скопирован `database_id` в `wrangler.toml`
- [ ] Применена схема: `wrangler d1 execute micr-db --file=worker/schema.sql`
- [ ] Добавлены тестовые данные: `wrangler d1 execute micr-db --file=worker/seed.sql`
- [ ] Проверка данных: `wrangler d1 execute micr-db --command="SELECT COUNT(*) FROM apps"`
- [ ] Worker развернут: `wrangler deploy`
- [ ] Скопирован URL Worker (например: `micr-api.username.workers.dev`)

## Шаг 3: DNS настройка для API

В панели Cloudflare для домена `micr.fun`:

- [ ] Добавлена CNAME запись:
  - Type: `CNAME`
  - Name: `api`
  - Target: `<ваш-worker>.workers.dev`
  - Proxy status: ✅ Proxied (оранжевое облако)
- [ ] Проверка: `curl https://api.micr.fun/api/apps` возвращает JSON

## Шаг 4: Netlify

- [ ] Выполнен вход: `netlify login`
- [ ] Инициализирован сайт: `netlify init`
- [ ] Выбраны настройки:
  - Build command: `npm run build`
  - Publish directory: `dist`
- [ ] Проект собран локально: `npm run build`
- [ ] Развернут на Netlify: `netlify deploy --prod`
- [ ] Скопирован URL Netlify (например: `amazing-site-123.netlify.app`)

## Шаг 5: DNS настройка для сайта

В панели Cloudflare для домена `micr.fun`:

### Вариант A: CNAME (рекомендуется)
- [ ] Добавлена CNAME запись:
  - Type: `CNAME`
  - Name: `@` или `micr.fun`
  - Target: `<ваш-сайт>.netlify.app`
  - Proxy status: ⚠️ DNS only (серое облако)

### Вариант B: A Record
- [ ] Добавлена A запись:
  - Type: `A`
  - Name: `@`
  - Target: IP от Netlify
  - Proxy status: ⚠️ DNS only (серое облако)

## Шаг 6: Netlify Custom Domain

В панели Netlify:

- [ ] Открыта панель: `netlify open`
- [ ] Перейдено в Domain settings
- [ ] Добавлен custom domain: `micr.fun`
- [ ] Настроен SSL сертификат (автоматически)
- [ ] Проверка SSL: сертификат активен

## Шаг 7: Финальная проверка

- [ ] Сайт открывается: `https://micr.fun`
- [ ] API работает: `https://api.micr.fun/api/apps`
- [ ] Приложения загружаются на главной странице
- [ ] Поиск работает
- [ ] Фильтры работают
- [ ] Открытие приложения работает
- [ ] Форма отправки работает: `/submit.html`
- [ ] Админ панель работает: `/admin/` (пароль: `admin123`)

## Шаг 8: Безопасность

- [ ] Изменен пароль админа в `js/store.js`
- [ ] Пересобран проект: `npm run build`
- [ ] Переразвернут: `netlify deploy --prod`

## Шаг 9: Оптимизация (опционально)

- [ ] Настроены Cloudflare Page Rules для кеширования
- [ ] Включен Cloudflare CDN
- [ ] Настроен Cloudflare Analytics
- [ ] Добавлен Google Analytics (если нужно)

## Шаг 10: Мониторинг

- [ ] Настроены уведомления в Cloudflare
- [ ] Настроены уведомления в Netlify
- [ ] Добавлен мониторинг uptime (например, UptimeRobot)

## Troubleshooting

### Worker не отвечает
- [ ] Проверены логи: `wrangler tail`
- [ ] Проверен `database_id` в `wrangler.toml`
- [ ] Переразвернут Worker: `wrangler deploy`

### Сайт не открывается
- [ ] Проверены DNS записи (может занять до 24ч)
- [ ] Проверен SSL сертификат в Netlify
- [ ] Проверены логи сборки в Netlify

### CORS ошибки
- [ ] Проверены CORS headers в `worker/index.js`
- [ ] Очищен кеш браузера
- [ ] Проверен Network tab в DevTools

### База данных пустая
- [ ] Применена схема: `wrangler d1 execute micr-db --file=worker/schema.sql`
- [ ] Добавлены данные: `wrangler d1 execute micr-db --file=worker/seed.sql`
- [ ] Проверка: `wrangler d1 execute micr-db --command="SELECT * FROM apps"`

## Полезные команды для проверки

```bash
# Проверить Worker
curl https://api.micr.fun/api/apps

# Проверить DNS
nslookup api.micr.fun
nslookup micr.fun

# Проверить SSL
curl -I https://micr.fun

# Посмотреть логи Worker
wrangler tail

# Посмотреть логи Netlify
netlify logs

# Проверить базу данных
wrangler d1 execute micr-db --command="SELECT COUNT(*) FROM apps"
```

## Готово! 🎉

Если все пункты отмечены, ваш сайт micr.fun полностью развернут и работает!

Следующие шаги:
- Добавьте свои приложения через админ панель
- Настройте резервное копирование базы данных
- Добавьте больше функций
- Поделитесь с друзьями!
