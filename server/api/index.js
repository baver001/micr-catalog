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
        url: '/laziness.html'
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

app.listen(port, () => {
    console.log(`micr.fun API listening at http://localhost:${port}`);
});
