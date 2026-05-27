const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { ListToolsRequestSchema, CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const axios = require('axios');

const server = new Server({
    name: micr-fun-mcp,
    version: 1.0.0
}, {
    capabilities: {
        tools: {}
    }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: get_catalog,
            description: Get the current list of micro-apps,
            inputSchema: { type: object, properties: {} }
        },
        {
            name: add_app,
            description: Add a new app to the catalog,
            inputSchema: {
                type: object,
                properties: {
                    name: { type: string },
                    description: { type: string }
                },
                required: [name, description]
            }
        }
    ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === get_catalog) {
        const response = await axios.get('http://localhost:3000/api/catalog');
        return { content: [{ type: text, text: JSON.stringify(response.data) }] };
    }
    if (request.params.name === add_app) {
        const response = await axios.post('http://localhost:3000/api/catalog', request.params.arguments);
        return { content: [{ type: text, text: App added successfully }] };
    }
    throw new Error(Tool not found);
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

run().catch(console.error);
