# Шпаргалка по командам micr.fun

## Разработка

### Frontend
```bash
npm run dev                 # Запустить dev сервер (http://localhost:5173)
npm run build              # Собрать для production
npm run preview            # Предпросмотр production сборки
```

### Worker (API)
```bash
npm run worker:dev         # Запустить Worker локально (http://localhost:8787)
npm run worker:tail        # Смотреть логи Worker в реальном времени
npm run worker:deploy      # Развернуть Worker
```

## База данных (D1)

```bash
# Создать базу
wrangler d1 create micr-db

# Применить схему
wrangler d1 execute micr-db --file=worker/schema.sql

# Добавить тестовые данные
wrangler d1 execute micr-db --file=worker/seed.sql

# Выполнить SQL запрос
wrangler d1 execute micr-db --command="SELECT * FROM apps"

# Применить миграцию
wrangler d1 execute micr-db --file=worker/migrations/2024-01-07-add-featured.sql

# Посмотреть список баз
wrangler d1 list

# Информация о базе
wrangler d1 info micr-db
```

## Развертывание

```bash
# Только Worker
npm run worker:deploy

# Только Frontend
npm run deploy

# Всё сразу
npm run deploy:all

# Или через скрипт (PowerShell)
.\deploy.ps1
```

## Netlify

```bash
# Войти
netlify login

# Инициализировать сайт
netlify init

# Развернуть (draft)
netlify deploy

# Развернуть (production)
netlify deploy --prod

# Открыть админку
netlify open

# Посмотреть логи
netlify logs
```

## Cloudflare

```bash
# Войти
wrangler login

# Выйти
wrangler logout

# Информация о текущем аккаунте
wrangler whoami

# Список Workers
wrangler deployments list

# Удалить Worker
wrangler delete
```

## Git

```bash
# Инициализировать репозиторий
git init

# Добавить все файлы
git add .

# Коммит
git commit -m "Initial commit"

# Добавить remote
git remote add origin https://github.com/username/micr-frontend.git

# Запушить
git push -u origin main
```

## Полезные команды

```bash
# Проверить версии
node --version
npm --version
wrangler --version
netlify --version

# Установить зависимости
npm install

# Обновить зависимости
npm update

# Очистить кеш
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Переменные окружения

Создайте `.env.local` для локальной разработки:

```env
VITE_API_URL=http://localhost:8787/api
```

Для production используйте:

```env
VITE_API_URL=https://api.micr.fun/api
```

## Troubleshooting

### Worker не запускается
```bash
# Проверить логи
npm run worker:tail

# Проверить конфигурацию
cat wrangler.toml
```

### Frontend не собирается
```bash
# Очистить и переустановить
rm -rf node_modules dist
npm install
npm run build
```

### База данных не работает
```bash
# Проверить подключение
wrangler d1 execute micr-db --command="SELECT 1"

# Проверить таблицы
wrangler d1 execute micr-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### CORS ошибки
Проверьте что в `worker/index.js` правильно настроены CORS headers:
```javascript
'Access-Control-Allow-Origin': '*'
```

## Полезные ссылки

- Cloudflare Dashboard: https://dash.cloudflare.com
- Netlify Dashboard: https://app.netlify.com
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/
- D1 Docs: https://developers.cloudflare.com/d1/
