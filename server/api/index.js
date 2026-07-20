const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Catalog data
let catalog = [
    { 
        id: 1, 
        name: 'Лень', 
        description: 'Фундаментальная модель блокировки действия и внутреннего конфликта.',
        url: '/laziness/',
        category: 'cells'
    }
];

// MCP/Agent-friendly endpoint to get the catalog
app.get('/api/catalog', (req, res) => {
    res.json(catalog);
});

// MCP/Agent-friendly endpoint to add an app
app.post('/api/catalog', (req, res) => {
    const newApp = { id: catalog.length + 1, ...req.body };
    catalog.push(newApp);
    res.status(201).json(newApp);
});

// Feedback endpoint
const fs = require('fs');
const path = require('path');
const FEEDBACK_DIR = '/var/www/micr.fun/data';
const FEEDBACK_FILE = path.join(FEEDBACK_DIR, 'feedback.json');

app.post('/api/feedback', (req, res) => {
    const { text, contact } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Text is required' });
    }
    try {
        if (!fs.existsSync(FEEDBACK_DIR)) fs.mkdirSync(FEEDBACK_DIR, { recursive: true });
        let feedback = [];
        if (fs.existsSync(FEEDBACK_FILE)) {
            feedback = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
        }
        feedback.push({
            id: Date.now(),
            text: text.trim(),
            contact: contact || null,
            page: req.headers['referer'] || '/laziness/',
            created: new Date().toISOString()
        });
        fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedback, null, 2));
        res.status(201).json({ ok: true });
    } catch (err) {
        console.error('Feedback save error:', err);
        res.status(500).json({ error: 'Internal error' });
    }
});

// Inbox: GET feedback (key = ?key=smysl2026 or header x-inbox-key)
app.get('/api/feedback', (req, res) => {
    const key = req.query.key || req.headers['x-inbox-key'];
    if (key !== 'smysl2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        if (!fs.existsSync(FEEDBACK_FILE)) return res.json([]);
        const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Internal error' });
    }
});

app.listen(port, '127.0.0.1', () => {
    console.log(`micr.fun API listening at http://localhost:${port}`);
});
