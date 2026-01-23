// Cloudflare Functions API for Goals
// Handles CRUD operations for goals table in D1

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const { method } = request;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        switch (method) {
            case 'GET': {
                const result = await env.DB.prepare('SELECT * FROM goals WHERE id = 1').first();
                return Response.json(result || {}, { headers: corsHeaders });
            }

            case 'PUT': {
                const updates = await request.json() as any;

                const setClauses = [];
                const values = [];

                // Handle both camelCase and snake_case
                if (updates.targetInterviews !== undefined || updates.target_interviews !== undefined) {
                    setClauses.push('target_interviews = ?');
                    values.push(updates.targetInterviews || updates.target_interviews);
                }
                if (updates.targetHighScores !== undefined || updates.target_high_scores !== undefined) {
                    setClauses.push('target_high_scores = ?');
                    values.push(updates.targetHighScores || updates.target_high_scores);
                }
                if (updates.targetPilots !== undefined || updates.target_pilots !== undefined) {
                    setClauses.push('target_pilots = ?');
                    values.push(updates.targetPilots || updates.target_pilots);
                }
                if (updates.targetSetupTime !== undefined || updates.target_setup_time !== undefined) {
                    setClauses.push('target_setup_time = ?');
                    values.push(updates.targetSetupTime || updates.target_setup_time);
                }
                if (updates.pricePoint !== undefined || updates.price_point !== undefined) {
                    setClauses.push('price_point = ?');
                    values.push(updates.pricePoint || updates.price_point);
                }

                if (setClauses.length > 0) {
                    setClauses.push('updated_at = ?');
                    values.push(new Date().toISOString());

                    // Check if row exists, if not insert it
                    const existing = await env.DB.prepare('SELECT id FROM goals WHERE id = 1').first();

                    if (!existing) {
                        // Insert default row
                        await env.DB.prepare(`
                            INSERT INTO goals (id, target_interviews, target_high_scores, target_pilots, target_setup_time, price_point, created_at, updated_at)
                            VALUES (1, 10, 5, 3, 180, 180, ?, ?)
                        `).bind(new Date().toISOString(), new Date().toISOString()).run();
                    }

                    await env.DB.prepare(`UPDATE goals SET ${setClauses.join(', ')} WHERE id = 1`)
                        .bind(...values)
                        .run();
                }

                return Response.json({ success: true }, { headers: corsHeaders });
            }

            default:
                return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }
    } catch (error) {
        console.error('Goals API error:', error);
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
};
