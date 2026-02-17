import { corsHeaders, handleError } from './_utils';

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const { method } = request;

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

                // Security Note: All inputs are bound via .bind() to prevent SQL Injection
                const now = new Date().toISOString();

                // Fetch current values or defaults for UPSERT logic
                const current = await env.DB.prepare('SELECT * FROM goals WHERE id = 1').first() as any || {
                    target_interviews: 10,
                    target_high_scores: 5,
                    target_pilots: 3,
                    target_setup_time: 180,
                    price_point: 180
                };

                const data = {
                    target_interviews: updates.targetInterviews ?? updates.target_interviews ?? current.target_interviews,
                    target_high_scores: updates.targetHighScores ?? updates.target_high_scores ?? current.target_high_scores,
                    target_pilots: updates.targetPilots ?? updates.target_pilots ?? current.target_pilots,
                    target_setup_time: updates.targetSetupTime ?? updates.target_setup_time ?? current.target_setup_time,
                    price_point: updates.pricePoint ?? updates.price_point ?? current.price_point
                };

                // ✅ Use atomic INSERT OR REPLACE (UPSERT) to prevent race conditions
                await env.DB.prepare(`
                    INSERT OR REPLACE INTO goals (id, target_interviews, target_high_scores, target_pilots, target_setup_time, price_point)
                    VALUES (1, ?, ?, ?, ?, ?)
                `).bind(
                    data.target_interviews,
                    data.target_high_scores,
                    data.target_pilots,
                    data.target_setup_time,
                    data.price_point
                ).run();

                return Response.json({ success: true }, { headers: corsHeaders });
            }

            default:
                return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }
    } catch (error) {
        return handleError(error, 'Goals API', request);
    }
};
