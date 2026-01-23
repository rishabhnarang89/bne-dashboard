// Cloudflare Functions API for Tasks
// Handles CRUD operations for tasks table in D1

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const { method } = request;
    const url = new URL(request.url);

    // CORS headers
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
                // Get all tasks
                const { results } = await env.DB.prepare('SELECT * FROM tasks ORDER BY week_id, created_at').all();
                return Response.json(results, { headers: corsHeaders });
            }

            case 'POST': {
                // Create new task
                const task = await request.json();
                await env.DB.prepare(`
          INSERT INTO tasks (id, title, notes, week_id, priority, due_date, completed, completed_at, created_at, is_default, subtasks, linked_interview_id, assignee)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
                    task.id,
                    task.title,
                    task.notes || null,
                    task.week_id,
                    task.priority,
                    task.due_date || null,
                    task.completed ? 1 : 0,
                    task.completed_at || null,
                    task.created_at,
                    task.is_default ? 1 : 0,
                    JSON.stringify(task.subtasks || []),
                    task.linked_interview_id || null,
                    task.assignee || null
                ).run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }

            case 'PUT': {
                // Update task
                const taskId = url.searchParams.get('id');
                const updates = await request.json();

                const setClauses = [];
                const values = [];

                if (updates.title !== undefined) { setClauses.push('title = ?'); values.push(updates.title); }
                if (updates.notes !== undefined) { setClauses.push('notes = ?'); values.push(updates.notes || null); }
                if (updates.week_id !== undefined) { setClauses.push('week_id = ?'); values.push(updates.week_id); }
                if (updates.priority !== undefined) { setClauses.push('priority = ?'); values.push(updates.priority); }
                if (updates.due_date !== undefined) { setClauses.push('due_date = ?'); values.push(updates.due_date || null); }
                if (updates.completed !== undefined) { setClauses.push('completed = ?'); values.push(updates.completed ? 1 : 0); }
                if (updates.completed_at !== undefined) { setClauses.push('completed_at = ?'); values.push(updates.completed_at || null); }
                if (updates.subtasks !== undefined) { setClauses.push('subtasks = ?'); values.push(JSON.stringify(updates.subtasks)); }
                if (updates.linked_interview_id !== undefined) { setClauses.push('linked_interview_id = ?'); values.push(updates.linked_interview_id || null); }
                if (updates.assignee !== undefined) { setClauses.push('assignee = ?'); values.push(updates.assignee || null); }

                if (setClauses.length > 0) {
                    await env.DB.prepare(`UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`)
                        .bind(...values, taskId)
                        .run();
                }

                return Response.json({ success: true }, { headers: corsHeaders });
            }

            case 'DELETE': {
                // Delete task
                const taskId = url.searchParams.get('id');
                await env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(taskId).run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }

            default:
                return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }
    } catch (error) {
        console.error('Tasks API error:', error);
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
};
