# Инструкция по развертыванию micr.fun

## Шаг 1: Установка Wrangler

```bash
npm install -g wrangler
```

## Шаг 2: Авторизация в Cloudflare

```bash
wrangler login
```

## Шаг 3: Создание D1 базы данных

```bash
wrangler d1 create micr-db
```

После создания скопируйте `database_id` и вставьте его в `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "micr-db"
database_id = "ВАШ_DATABASE_ID_ЗДЕСЬ"
```

## Шаг 4: Применение схемы базы данных

```bash
wrangler d1 execute micr-db --file=worker/schema.sql
```

## Шаг 5: Добавление тестовых данных (опционально)

Создайте файл `worker/seed.sql` с тестовыми данными и выполните:

```bash
wrangler d1 execute micr-db --file=worker/seed.sql
```

## Шаг 6: Развертывание Worker

```bash
wrangler deploy
```

## Шаг 7: Настройка DNS в Cloudflare

1. Войдите в панель Cloudflare
2. Выберите домен `micr.fun`
3. Перейдите в раздел **DNS**
4. Добавьте CNAME запись:
   - **Type**: CNAME
   - **Name**: api
   - **Target**: ваш-worker.workers.dev (получите после deploy)
   - **Proxy status**: Proxied (оранжевое облако)

## Шаг 8: Настройка Netlify

### Вариант A: Через Netlify CLI

```bash
# Установка Netlify CLI
npm install -g netlify-cli

# Авторизация
netlify login

# Инициализация сайта
netlify init

# Развертывание
netlify deploy --prod
```

### Вариант B: Через GitHub

1. Загрузите проект на GitHub
2. Войдите в [Netlify](https://app.netlify.com)
3. Нажмите "New site from Git"
4. Выберите ваш репозиторий
5. Настройки сборки:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

## Шаг 9: Настройка кастомного домена в Netlify

1. В панели Netlify перейдите в **Domain settings**
2. Нажмите **Add custom domain**
3. Введите `micr.fun`
4. В Cloudflare DNS добавьте записи:
   - **Type**: A
   - **Name**: @ (или micr.fun)
   - **Value**: IP адрес из Netlify
   - **Proxy status**: DNS only (серое облако)
   
   ИЛИ используйте CNAME:
   - **Type**: CNAME
   - **Name**: @ (или www)
   - **Target**: ваш-сайт.netlify.app
   - **Proxy status**: DNS only

## Шаг 10: Проверка

1. Откройте `https://micr.fun` - должен открыться фронтенд
2. Откройте `https://api.micr.fun/api/apps` - должен вернуть JSON с приложениями

## Переменные окружения

Если нужно изменить API URL в production, обновите `js/api.js`:

```javascript
const API_BASE_URL = 'https://api.micr.fun/api';
```

## Обновление Worker

После изменений в `worker/index.js`:

```bash
wrangler deploy
```

## Обновление фронтенда

После изменений в фронтенде:

```bash
npm run build
netlify deploy --prod
```

## Миграции базы данных

Для применения новых миграций:

```bash
wrangler d1 execute micr-db --file=worker/migrations/YYYY-MM-DD-название.sql
```

## Просмотр логов Worker

```bash
wrangler tail
```

## Локальная разработка

### Worker (локально)

```bash
wrangler dev
```

### Фронтенд (локально)

```bash
npm run dev
```

Для локальной разработки измените `API_BASE_URL` в `js/api.js` на:

```javascript
const API_BASE_URL = 'http://localhost:8787/api';
```

## Troubleshooting

### Worker не отвечает

- Проверьте логи: `wrangler tail`
- Убедитесь что database_id правильный в wrangler.toml
- Проверьте что схема применена: `wrangler d1 execute micr-db --command="SELECT * FROM apps LIMIT 1"`

### CORS ошибки

- Убедитесь что CORS headers настроены в `worker/index.js`
- Проверьте что домен правильно настроен в Cloudflare

### Netlify не собирается

- Проверьте что `npm run build` работает локально
- Убедитесь что все зависимости установлены
- Проверьте логи сборки в Netlify Dashboard
