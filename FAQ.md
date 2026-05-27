# FAQ - Часто задаваемые вопросы

## Общие вопросы

### Почему отказались от Supabase?

1. **Полный контроль** - Cloudflare Workers дают полный контроль над API
2. **Стоимость** - Free tier Cloudflare очень щедрый
3. **Производительность** - Edge computing быстрее
4. **Простота** - Wrangler CLI проще в использовании
5. **Интеграция** - Всё в одном месте (Workers + D1 + DNS + CDN)

### Можно ли вернуться на Supabase?

Да, можно. Старый код в `js/supabase.js` сохранен. Просто:
1. Верните импорты в `store.js`
2. Установите `@supabase/supabase-js`
3. Удалите `js/api.js`

### Сколько это стоит?

**$0/месяц** на Free tier:
- Cloudflare Workers: 100,000 запросов/день
- D1 Database: 5M чтений/день, 100K записей/день
- Netlify: 100GB трафика/месяц
- Cloudflare DNS/CDN: безлимит

Для большинства проектов этого более чем достаточно!

## Развертывание

### Не могу создать D1 базу

**Проблема**: `wrangler d1 create` не работает

**Решение**:
1. Проверьте что вы вошли: `wrangler whoami`
2. Если нет, войдите: `wrangler login`
3. Проверьте версию: `wrangler --version` (должна быть 3.0+)
4. Обновите: `npm install -g wrangler@latest`

### Database ID не подставляется

**Проблема**: После `wrangler d1 create` не знаю куда вставить ID

**Решение**:
1. Скопируйте `database_id` из вывода команды
2. Откройте `wrangler.toml`
3. Найдите строку `database_id = ""`
4. Вставьте ID: `database_id = "ваш-id-здесь"`

### Worker не деплоится

**Проблема**: `wrangler deploy` выдает ошибку

**Решение**:
1. Проверьте что `database_id` заполнен в `wrangler.toml`
2. Проверьте что база создана: `wrangler d1 list`
3. Проверьте синтаксис `worker/index.js`
4. Попробуйте `wrangler deploy --dry-run` для проверки

### DNS не работает

**Проблема**: `api.micr.fun` не открывается

**Решение**:
1. Проверьте что CNAME запись создана
2. Проверьте что Proxy включен (оранжевое облако)
3. Подождите 5-10 минут (DNS propagation)
4. Проверьте: `nslookup api.micr.fun`
5. Очистите DNS кеш: `ipconfig /flushdns` (Windows) или `sudo dscacheutil -flushcache` (Mac)

### Netlify не собирается

**Проблема**: Build fails на Netlify

**Решение**:
1. Проверьте что локально работает: `npm run build`
2. Проверьте Node.js версию в Netlify (должна быть 18+)
3. Проверьте что все зависимости в `package.json`
4. Проверьте логи сборки в Netlify Dashboard
5. Попробуйте очистить кеш: Settings → Build & deploy → Clear cache

## Разработка

### Как работать локально?

**Frontend**:
```bash
npm run dev
# Откроется на http://localhost:5173
```

**Worker**:
```bash
npm run worker:dev
# Откроется на http://localhost:8787
```

**Важно**: Измените `API_BASE_URL` в `js/api.js` на `http://localhost:8787/api`

### Как добавить новое приложение?

**Через админку**:
1. Откройте `/admin/`
2. Войдите (пароль: `admin123`)
3. Одобрите заявку из списка

**Напрямую в БД**:
```bash
wrangler d1 execute micr-db --command="
INSERT INTO apps (id, slug, name, description, category, icon, color, url, views, status)
VALUES (
  '550e8400-e29b-41d4-a716-446655440099',
  'my-app',
  'My Cool App',
  'Description',
  'games',
  'gamepad-2',
  'from-blue-500 to-cyan-500',
  'https://example.com',
  0,
  'published'
)"
```

### Как изменить пароль админа?

1. Откройте `js/store.js`
2. Найдите `const ADMIN_PASSWORD = 'admin123'`
3. Измените на свой пароль
4. Пересоберите: `npm run build`
5. Переразверните: `netlify deploy --prod`

### Как добавить новую категорию?

1. Откройте `js/store.js`
2. Найдите `const CATEGORIES`
3. Добавьте новую категорию:
```javascript
"новая": {
  "name": "Новая категория",
  "icon": "star",
  "class": "cat-новая",
  "color": "#ff0000"
}
```
4. Пересоберите и переразверните

## База данных

### Как посмотреть данные в БД?

```bash
# Все приложения
wrangler d1 execute micr-db --command="SELECT * FROM apps"

# Количество приложений
wrangler d1 execute micr-db --command="SELECT COUNT(*) FROM apps"

# Заявки
wrangler d1 execute micr-db --command="SELECT * FROM submissions"
```

### Как сделать бэкап БД?

```bash
# Экспорт в SQL
wrangler d1 export micr-db --output=backup.sql

# Или через команду
wrangler d1 execute micr-db --command=".dump" > backup.sql
```

### Как восстановить БД из бэкапа?

```bash
wrangler d1 execute micr-db --file=backup.sql
```

### Как применить миграцию?

1. Создайте файл `worker/migrations/2024-01-07-add-feature.sql`
2. Напишите SQL:
```sql
ALTER TABLE apps ADD COLUMN featured BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_apps_featured ON apps(featured);
```
3. Примените:
```bash
wrangler d1 execute micr-db --file=worker/migrations/2024-01-07-add-feature.sql
```

## Производительность

### Сайт медленно загружается

**Проверьте**:
1. Cloudflare CDN включен
2. Кеширование настроено в `netlify.toml`
3. Изображения оптимизированы
4. Используется сжатие (Gzip/Brotli)

**Оптимизация**:
```bash
# Проверьте размер сборки
npm run build
# Посмотрите размеры файлов в dist/
```

### API медленно отвечает

**Проверьте**:
1. Логи Worker: `npm run worker:tail`
2. Индексы в БД созданы (см. `schema.sql`)
3. Количество запросов к БД (оптимизируйте запросы)

**Оптимизация**:
- Добавьте кеширование в Worker
- Используйте индексы для частых запросов
- Минимизируйте количество SQL запросов

### Много запросов к API

**Решение**:
1. Добавьте кеширование на фронтенде
2. Используйте `appsCache` в `store.js`
3. Добавьте debounce для поиска
4. Используйте Service Worker для офлайн кеша

## Безопасность

### Как защитить админку?

**Текущее решение**: Простой пароль в коде

**Лучшие решения**:
1. Cloudflare Access (бесплатно до 50 пользователей)
2. HTTP Basic Auth через Netlify
3. JWT токены в Worker
4. OAuth через Google/GitHub

### Как защититься от спама в форме?

**Добавьте**:
1. reCAPTCHA
2. Rate limiting в Worker
3. Honeypot поля
4. Email верификацию

### Как защитить API от злоупотреблений?

**В Worker добавьте**:
```javascript
// Rate limiting
const RATE_LIMIT = 100; // requests per minute
const clientIP = request.headers.get('CF-Connecting-IP');
// Проверка лимита...
```

## Мониторинг

### Как смотреть логи?

**Worker**:
```bash
npm run worker:tail
# или
wrangler tail
```

**Netlify**:
```bash
netlify logs
# или в Dashboard → Functions → Logs
```

### Как настроить алерты?

**Cloudflare**:
1. Dashboard → Notifications
2. Создайте алерт для Worker errors
3. Добавьте email/webhook

**Netlify**:
1. Site settings → Notifications
2. Настройте Deploy notifications
3. Добавьте Slack/email

### Как отследить ошибки?

**Добавьте Sentry**:
```javascript
// В worker/index.js
import * as Sentry from '@sentry/cloudflare';

Sentry.init({ dsn: 'ваш-dsn' });
```

## Разное

### Можно ли использовать другой домен?

Да! Просто измените DNS записи на ваш домен.

### Можно ли добавить больше языков?

Да! Откройте `js/i18n.js` и добавьте переводы.

### Можно ли изменить дизайн?

Да! Все стили в `styles/main.css` и inline в HTML.

### Можно ли добавить аналитику?

Да! Добавьте Google Analytics или используйте Cloudflare Analytics (бесплатно).

### Нужен ли SSL сертификат?

Нет! Cloudflare и Netlify предоставляют бесплатные SSL сертификаты автоматически.

## Поддержка

### Где получить помощь?

1. Проверьте документацию в репозитории
2. Cloudflare Docs: https://developers.cloudflare.com
3. Netlify Docs: https://docs.netlify.com
4. Cloudflare Community: https://community.cloudflare.com
5. Stack Overflow с тегами `cloudflare-workers`, `netlify`

### Как сообщить об ошибке?

Создайте issue в GitHub репозитории с:
- Описанием проблемы
- Шагами для воспроизведения
- Ожидаемым и фактическим результатом
- Логами (если есть)

### Как предложить улучшение?

Создайте Pull Request или issue с описанием предложения!
