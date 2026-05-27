/**
 * Cloudflare Worker API for micr.fun
 */

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
function handleOptions() {
    return new Response(null, {
        headers: corsHeaders,
    });
}

// Add CORS headers to response
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    });
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // Keep-alive trigger via URL (optional, for manual testing)
        if (path === '/api/keep-alive' && request.method === 'GET') {
            await keepSupabaseAlive(env);
            return jsonResponse({ success: true, message: 'Supabase pinged' });
        }

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleOptions();
        }

        try {
            // Routes
            if (path === '/api/apps' && request.method === 'GET') {
                return await getApps(env);
            }

            if (path === '/api/apps/increment-views' && request.method === 'POST') {
                return await incrementViews(request, env);
            }

            if (path === '/api/submissions' && request.method === 'GET') {
                return await getSubmissions(env);
            }

            if (path === '/api/submissions' && request.method === 'POST') {
                return await createSubmission(request, env);
            }

            if (path.startsWith('/api/submissions/') && request.method === 'PUT') {
                const id = path.split('/').pop();
                return await updateSubmission(id, request, env);
            }

            if (path.startsWith('/api/submissions/') && request.method === 'DELETE') {
                const id = path.split('/').pop();
                return await deleteSubmission(id, env);
            }

            // 404
            return jsonResponse({ error: 'Not found' }, 404);
        } catch (error) {
            console.error('Worker error:', error);
            return jsonResponse({ error: error.message }, 500);
        }
    },

    // CRON Trigger for keep-alive
    async scheduled(event, env, ctx) {
        ctx.waitUntil(keepSupabaseAlive(env));
    },
};

// Get all published apps
async function getApps(env) {
    const { results } = await env.DB.prepare(
        'SELECT * FROM apps WHERE status = ? ORDER BY views DESC'
    )
        .bind('published')
        .all();

    return jsonResponse(results);
}

// Increment app views
async function incrementViews(request, env) {
    const { app_id } = await request.json();

    if (!app_id) {
        return jsonResponse({ error: 'app_id is required' }, 400);
    }

    await env.DB.prepare('UPDATE apps SET views = views + 1 WHERE id = ?')
        .bind(app_id)
        .run();

    return jsonResponse({ success: true });
}

// Get all submissions
async function getSubmissions(env) {
    const { results } = await env.DB.prepare(
        'SELECT * FROM submissions ORDER BY submitted_at DESC'
    ).all();

    return jsonResponse(results);
}

// Create submission
async function createSubmission(request, env) {
    const data = await request.json();
    const id = crypto.randomUUID();

    await env.DB.prepare(
        `INSERT INTO submissions (id, name, description, category, url, author_name, author_email, status)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
        .bind(
            id,
            data.name,
            data.description,
            data.category,
            data.url,
            data.author_name || null,
            data.author_email || null,
            'pending'
        )
        .run();

    return jsonResponse({ id, ...data, status: 'pending' }, 201);
}

// Update submission status
async function updateSubmission(id, request, env) {
    const { status } = await request.json();

    await env.DB.prepare(
        'UPDATE submissions SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
        .bind(status, id)
        .run();

    return jsonResponse({ success: true });
}

// Delete submission
async function deleteSubmission(id, env) {
    await env.DB.prepare('DELETE FROM submissions WHERE id = ?').bind(id).run();

    return jsonResponse({ success: true });
}

// Keep Supabase from pausing (Free tier)
async function keepSupabaseAlive(env) {
    const SUPABASE_URL = 'https://ymxcxqxohgyhyatnkpmg.supabase.co';
    const SUPABASE_KEY = env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlteGN4cXhvaGd5aHlhdG5rcG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDYwMjMsImV4cCI6MjA4MTM4MjAyM30.uuQjMXyd3Sp4tFNY7lDD_Iq94C_JgTPbhyjUMfE3B0o';

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/apps?select=id&limit=1`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        console.log('Supabase keep-alive status:', response.status);
    } catch (err) {
        console.error('Supabase keep-alive failed:', err);
    }
}
