# API Documentation

Base URL: `https://api.micr.fun/api`

## Endpoints

### Apps

#### Get All Apps
```http
GET /apps
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "slug": "spend-elons-money",
    "name": "Потрать деньги Илона",
    "description": "Симулятор траты состояния Илона Маска",
    "category": "games",
    "icon": "dollar-sign",
    "color": "from-emerald-500 to-green-500",
    "url": "https://neal.fun/spend/",
    "image": null,
    "views": 1250,
    "status": "published",
    "created_at": "2024-01-07T10:00:00.000Z",
    "updated_at": "2024-01-07T10:00:00.000Z"
  }
]
```

#### Increment Views
```http
POST /apps/increment-views
Content-Type: application/json

{
  "app_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response:**
```json
{
  "success": true
}
```

### Submissions

#### Get All Submissions
```http
GET /submissions
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "My Cool App",
    "description": "An awesome app",
    "category": "games",
    "url": "https://example.com",
    "author_name": "John Doe",
    "author_email": "john@example.com",
    "status": "pending",
    "submitted_at": "2024-01-07T10:00:00.000Z",
    "reviewed_at": null
  }
]
```

#### Create Submission
```http
POST /submissions
Content-Type: application/json

{
  "name": "My Cool App",
  "description": "An awesome app",
  "category": "games",
  "url": "https://example.com",
  "author_name": "John Doe",
  "author_email": "john@example.com"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "name": "My Cool App",
  "description": "An awesome app",
  "category": "games",
  "url": "https://example.com",
  "author_name": "John Doe",
  "author_email": "john@example.com",
  "status": "pending"
}
```

#### Update Submission Status
```http
PUT /submissions/:id
Content-Type: application/json

{
  "status": "approved"
}
```

**Response:**
```json
{
  "success": true
}
```

**Status values:**
- `pending` - Ожидает проверки
- `approved` - Одобрено
- `rejected` - Отклонено

#### Delete Submission
```http
DELETE /submissions/:id
```

**Response:**
```json
{
  "success": true
}
```

## Categories

Available categories:
- `games` - Игры
- `tools` - Инструменты
- `creative` - Креатив
- `learning` - Обучение
- `fun` - Развлечения
- `social` - Социальные

## Error Responses

### 400 Bad Request
```json
{
  "error": "app_id is required"
}
```

### 404 Not Found
```json
{
  "error": "Not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error message"
}
```

## CORS

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## Rate Limiting

Currently no rate limiting is implemented. This may change in the future.

## Authentication

Currently no authentication is required for read operations. Write operations (POST, PUT, DELETE) are open but should be protected in production.

## Examples

### JavaScript (Fetch)

```javascript
// Get all apps
const apps = await fetch('https://api.micr.fun/api/apps')
  .then(res => res.json());

// Increment views
await fetch('https://api.micr.fun/api/apps/increment-views', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ app_id: '550e8400-e29b-41d4-a716-446655440001' })
});

// Submit app
const submission = await fetch('https://api.micr.fun/api/submissions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My App',
    description: 'Cool app',
    category: 'games',
    url: 'https://example.com',
    author_name: 'John',
    author_email: 'john@example.com'
  })
}).then(res => res.json());
```

### cURL

```bash
# Get all apps
curl https://api.micr.fun/api/apps

# Increment views
curl -X POST https://api.micr.fun/api/apps/increment-views \
  -H "Content-Type: application/json" \
  -d '{"app_id":"550e8400-e29b-41d4-a716-446655440001"}'

# Submit app
curl -X POST https://api.micr.fun/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "name":"My App",
    "description":"Cool app",
    "category":"games",
    "url":"https://example.com",
    "author_name":"John",
    "author_email":"john@example.com"
  }'
```
