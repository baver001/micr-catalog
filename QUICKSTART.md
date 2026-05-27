# Быстрый старт для micr.fun

## Что нужно сделать

### 1. Установить Wrangler глобально
```bash
npm install -g wrangler
```

### 2. Войти в Cloudflare
```bash
wrangler login
```

### 3. Создать D1 базу данных
```bash
wrangler d1 create micr-db
```

**Важно!** Скопируйте `database_id` из вывода и вставьте в `wrangler.toml`:
```toml
database_id = "ваш-id-здесь"
```

### 4. Применить схему БД
```bash
wrangler d1 execute micr-db --file=worker/schema.sql
```

### 5. Добавить тестовые данные
```bash
wrangler d1 execute micr-db --file=worker/seed.sql
```

### 6. Развернуть Worker
```bash
wrangler deploy
```

### 7. Настроить DNS в Cloudflare

В панели Cloudflare для домена `micr.fun`:

**Для API (Worker):**
- Type: CNAME
- Name: `api`
- Target: `ваш-worker.workers.dev` (из вывода wrangler deploy)
- Proxy: ✅ Proxied

**Для сайта (Netlify):**
- Type: A или CNAME
- Name: `@` (или `www`)
- Target: IP от Netlify или `ваш-сайт.netlify.app`
- Proxy: ⚠️ DNS only (для Netlify)

### 8. Развернуть фронтенд на Netlify

```bash
# Установить Netlify CLI
npm install -g netlify-cli

# Войти
netlify login

# Инициализировать
netlify init

# Развернуть
netlify deploy --prod
```

### 9. Проверить

- Сайт: https://micr.fun
- API: https://api.micr.fun/api/apps

## Локальная разработка

### Frontend
```bash
npm install
npm run dev
```
Откроется на http://localhost:5173

### Worker (локально)
```bash
wrangler dev
```
Откроется на http://localhost:8787

**Не забудьте** изменить `API_BASE_URL` в `js/api.js` на `http://localhost:8787/api` для локальной разработки!

## Что изменилось

✅ Убрали Supabase  
✅ Добавили Cloudflare Workers + D1  
✅ Настроили Netlify для фронтенда  
✅ Упростили аутентификацию (простой пароль)  
✅ Все работает на домене micr.fun  

## Если что-то не работает

1. Проверьте логи Worker: `wrangler tail`
2. Проверьте что database_id правильный в wrangler.toml
3. Убедитесь что DNS записи настроены правильно
4. Проверьте что API_BASE_URL в js/api.js указывает на правильный адрес

Подробнее см. [DEPLOYMENT.md](./DEPLOYMENT.md)
