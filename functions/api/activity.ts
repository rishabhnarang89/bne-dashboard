// Cloudflare Functions API for Activity Logs
// Handles fetching activity logs

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const { method } = request;
    const url = new URL(request.url);

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        if (method === 'GET') {
            const limit = parseInt(url.searchParams.get('limit') || '50');
            const { results } = await env.DB.prepare(
                'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?'
            ).bind(limit).all();

            // Parse details if it's a JSON string
            const parsedResults = results.map((log: any) => ({
                ...log,
                details: log.details && (log.details.startsWith('{') || log.details.startsWith('['))
                    ? JSON.parse(log.details)
                    : log.details
            }));

            return Response.json(parsedResults, { headers: corsHeaders });
        }

        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    } catch (error) {
        console.error('Activity API error:', error);
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
};
