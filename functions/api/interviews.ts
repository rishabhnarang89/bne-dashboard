// Cloudflare Functions API for Interviews
// Handles CRUD operations for interviews table in D1

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const { method } = request;
    const url = new URL(request.url);

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        switch (method) {
            case 'GET': {
                const { results } = await env.DB.prepare('SELECT * FROM interviews ORDER BY date DESC').all();
                const parsedResults = results.map((interview: any) => ({
                    ...interview,
                    questions: typeof interview.questions === 'string' ? JSON.parse(interview.questions) : (interview.questions || []),
                    key_insights: typeof interview.key_insights === 'string' ? JSON.parse(interview.key_insights) : (interview.key_insights || [])
                }));
                return Response.json(parsedResults, { headers: corsHeaders });
            }

            case 'POST': {
                const interview = await request.json();
                const result = await env.DB.prepare(`
          INSERT INTO interviews (teacher_id, date, scheduled_date, status, duration, time_spent, setup_time, success, score, commitment, price_reaction, notes, questions, key_insights, interviewer, observer, created_at, last_modified_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
                    interview.teacher_id || null,
                    interview.date || null,
                    interview.scheduled_date || null,
                    interview.status || null,
                    interview.duration || null,
                    interview.time_spent || null,
                    interview.setup_time || null,
                    interview.success || null,
                    interview.score || null,
                    interview.commitment || null,
                    interview.price_reaction || null,
                    interview.notes || null,
                    interview.questions ? JSON.stringify(interview.questions) : null,
                    interview.key_insights ? JSON.stringify(interview.key_insights) : null,
                    interview.interviewer || null,
                    interview.observer || null,
                    interview.created_at || new Date().toISOString(),
                    interview.lastModifiedBy || interview.last_modified_by || null
                ).run();

                // Log Activity
                try {
                    await env.DB.prepare(`
                        INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                        VALUES (?, 'CREATE', 'INTERVIEW', ?, ?, ?)
                    `).bind(
                        interview.lastModifiedBy || interview.last_modified_by || 'Unknown User',
                        result.meta.last_row_id,
                        `Interview for Teacher ID ${interview.teacher_id}`,
                        JSON.stringify({ status: interview.status, date: interview.date })
                    ).run();
                } catch (logError) {
                    console.error('Failed to log activity:', logError);
                }

                return Response.json({ success: true, id: result.meta.last_row_id }, { headers: corsHeaders });
            }

            case 'PUT': {
                const interviewId = url.searchParams.get('id');
                const updates = await request.json();

                const setClauses = [];
                const values = [];

                if (updates.teacher_id !== undefined) { setClauses.push('teacher_id = ?'); values.push(updates.teacher_id); }
                if (updates.date !== undefined) { setClauses.push('date = ?'); values.push(updates.date); }
                if (updates.scheduled_date !== undefined) { setClauses.push('scheduled_date = ?'); values.push(updates.scheduled_date || null); }
                if (updates.status !== undefined) { setClauses.push('status = ?'); values.push(updates.status); }
                if (updates.duration !== undefined) { setClauses.push('duration = ?'); values.push(updates.duration || null); }
                if (updates.time_spent !== undefined) { setClauses.push('time_spent = ?'); values.push(updates.time_spent || null); }
                if (updates.setup_time !== undefined) { setClauses.push('setup_time = ?'); values.push(updates.setup_time); }
                if (updates.success !== undefined) { setClauses.push('success = ?'); values.push(updates.success); }
                if (updates.score !== undefined) { setClauses.push('score = ?'); values.push(updates.score); }
                if (updates.commitment !== undefined) { setClauses.push('commitment = ?'); values.push(updates.commitment); }
                if (updates.price_reaction !== undefined) { setClauses.push('price_reaction = ?'); values.push(updates.price_reaction); }
                if (updates.notes !== undefined) { setClauses.push('notes = ?'); values.push(updates.notes || null); }
                if (updates.questions !== undefined) { setClauses.push('questions = ?'); values.push(JSON.stringify(updates.questions)); }
                if (updates.key_insights !== undefined) { setClauses.push('key_insights = ?'); values.push(JSON.stringify(updates.key_insights)); }
                if (updates.interviewer !== undefined) { setClauses.push('interviewer = ?'); values.push(updates.interviewer || null); }
                if (updates.observer !== undefined) { setClauses.push('observer = ?'); values.push(updates.observer || null); }
                if (updates.lastModifiedBy !== undefined) { setClauses.push('last_modified_by = ?'); values.push(updates.lastModifiedBy || null); }

                if (setClauses.length > 0) {
                    await env.DB.prepare(`UPDATE interviews SET ${setClauses.join(', ')} WHERE id = ?`)
                        .bind(...values, interviewId)
                        .run();

                    // Log Activity
                    try {
                        const userName = updates.lastModifiedBy || updates.last_modified_by || 'Unknown User';
                        await env.DB.prepare(`
                            INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                            VALUES (?, 'UPDATE', 'INTERVIEW', ?, ?, ?)
                        `).bind(
                            userName,
                            interviewId,
                            `Interview ID ${interviewId}`,
                            JSON.stringify(updates)
                        ).run();
                    } catch (logError) {
                        console.error('Failed to log activity:', logError);
                    }
                }

                return Response.json({ success: true }, { headers: corsHeaders });
            }

            case 'DELETE': {
                const interviewId = url.searchParams.get('id');
                await env.DB.prepare('DELETE FROM interviews WHERE id = ?').bind(interviewId).run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }

            default:
                return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }
    } catch (error) {
        console.error('Interviews API error:', error);
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
};
