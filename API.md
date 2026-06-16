# API Documentation

Base URL: `https://micr.fun/api` (or `http://localhost:3000/api` for local dev)

## Endpoints

### GET /api/catalog

Returns the current catalog of apps.

**Response:**
```json
[
    {
        "id": 1,
        "name": "Лень",
        "description": "Фундаментальная модель блокировки действия и внутреннего конфликта.",
        "url": "/laziness.html"
    },
    {
        "id": 2,
        "name": "Sky Render",
        "description": "Интерактивная WebGL визуализация атмосферы.",
        "url": "/sky.html"
    }
]
```

**Note:** Data is in-memory only. Restarting the API server resets the catalog to defaults.

### POST /api/catalog

Add a new app to the catalog (non-persistent).

**Request:**
```json
{
    "name": "My App",
    "description": "What it does",
    "url": "/apps/my-app/index.html"
}
```

**Response:**
```json
{
    "id": 3,
    "name": "My App",
    "description": "What it does",
    "url": "/apps/my-app/index.html"
}
```

### GET /api/submissions

List pending app submissions. Currently returns empty array (not implemented).

**Response:**
```json
[]
```

## Error Responses

### 404 Not Found
```json
{ "error": "Not found" }
```

## CORS

API does not include CORS headers (same-origin access only via Nginx proxy).

## Authentication

No authentication. All endpoints are open.

## Local Development

The API server runs independently:

```bash
cd server/api
node index.js
# → http://localhost:3000
```

In production, Nginx proxies `/api/` to this server.

## MCP Integration

The MCP server (`mcp-server.js`) exposes the catalog to AI agents:

```bash
node server/api/mcp-server.js
# Communicates over stdio with the agent
```

Tools available:
- `get_catalog` — Returns current app list
- `add_app` — Adds app with name + description

## Examples

### cURL
```bash
# Get catalog
curl https://micr.fun/api/catalog

# Add app
curl -X POST https://micr.fun/api/catalog \
  -H 'Content-Type: application/json' \
  -d '{"name":"My App","description":"Cool thing","url":"/apps/my-app/"}'
```

### JavaScript
```javascript
// Get catalog
const apps = await fetch('/api/catalog').then(r => r.json());

// Add app
await fetch('/api/catalog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'My App', description: '...', url: '/apps/my-app/' })
});
```
