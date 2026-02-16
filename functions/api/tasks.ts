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
                const parsedResults = results.map((task: any) => {
                    let assignees = [];
                    try {
                        assignees = task.assignees ? JSON.parse(task.assignees) : [];
                    } catch (e) {
                        // Fallback for legacy data if migration didn't catch everything or during transition
                        if (task.assignee) assignees = [task.assignee];
                    }

                    return {
                        ...task,
                        completed: task.completed === 1,
                        is_default: task.is_default === 1,
                        subtasks: typeof task.subtasks === 'string' ? JSON.parse(task.subtasks) : (task.subtasks || []),
                        assignees: assignees
                    };
                });
                return Response.json(parsedResults, { headers: corsHeaders });
            }

            case 'POST': {
                // Create new task
                const task = await request.json();

                // Handle assignees
                let assignees = task.assignees || [];
                // Backwards compatibility for payload
                if (!task.assignees && task.assignee) {
                    assignees = [task.assignee];
                }

                await env.DB.prepare(`
          INSERT INTO tasks (id, title, notes, week_id, priority, due_date, completed, completed_at, created_at, is_default, subtasks, linked_interview_id, linked_teacher_id, assignee, assignees, last_modified_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    task.linked_teacher_id || null,
                    assignees.length > 0 ? assignees[0] : null, // Keep assignee for legacy compatibility if needed
                    JSON.stringify(assignees),
                    task.lastModifiedBy || task.last_modified_by || null
                ).run();

                // Log Activity
                try {
                    await env.DB.prepare(`
                        INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                        VALUES (?, 'CREATE', 'TASK', ?, ?, ?)
                    `).bind(
                        task.lastModifiedBy || task.last_modified_by || 'Unknown User',
                        task.id,
                        task.title,
                        JSON.stringify({ priority: task.priority, due_date: task.due_date, assignees, linked_teacher_id: task.linked_teacher_id })
                    ).run();
                } catch (logError) {
                    console.error('Failed to log activity:', logError);
                }

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
                if (updates.linked_teacher_id !== undefined) { setClauses.push('linked_teacher_id = ?'); values.push(updates.linked_teacher_id || null); }

                // Handle assignees update
                if (updates.assignees !== undefined) {
                    setClauses.push('assignees = ?');
                    values.push(JSON.stringify(updates.assignees));

                    // Sync legacy column
                    setClauses.push('assignee = ?');
                    values.push(updates.assignees.length > 0 ? updates.assignees[0] : null);
                } else if (updates.assignee !== undefined) {
                    // Legacy payload support
                    setClauses.push('assignee = ?');
                    values.push(updates.assignee || null);

                    setClauses.push('assignees = ?');
                    values.push(updates.assignee ? JSON.stringify([updates.assignee]) : '[]');
                }

                if (updates.lastModifiedBy !== undefined) { setClauses.push('last_modified_by = ?'); values.push(updates.lastModifiedBy || null); }

                if (setClauses.length > 0) {
                    await env.DB.prepare(`UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`)
                        .bind(...values, taskId)
                        .run();

                    // Log Activity
                    try {
                        const userName = updates.lastModifiedBy || updates.last_modified_by || 'Unknown User';
                        // Check if completed status changed specially
                        let actionType = 'UPDATE';
                        if (updates.completed === true) actionType = 'COMPLETE';

                        await env.DB.prepare(`
                            INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                            VALUES (?, ?, 'TASK', ?, ?, ?)
                        `).bind(
                            userName,
                            actionType,
                            taskId,
                            updates.title || `Task ID ${taskId}`,
                            JSON.stringify(updates)
                        ).run();
                    } catch (logError) {
                        console.error('Failed to log activity:', logError);
                    }
                }

                return Response.json({ success: true }, { headers: corsHeaders });
            }

            case 'DELETE': {
                // Delete task
                const taskId = url.searchParams.get('id');

                // Fetch task title before deleting for the activity log
                let taskTitle = `Task ID ${taskId}`;
                try {
                    const existing = await env.DB.prepare('SELECT title FROM tasks WHERE id = ?').bind(taskId).first() as any;
                    if (existing) taskTitle = existing.title;
                } catch (_) { /* ignore */ }

                await env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(taskId).run();

                // Log Activity
                try {
                    await env.DB.prepare(`
                        INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                        VALUES (?, 'DELETE', 'TASK', ?, ?, NULL)
                    `).bind(
                        url.searchParams.get('user') || 'Unknown User',
                        taskId,
                        taskTitle
                    ).run();
                } catch (logError) {
                    console.error('Failed to log activity:', logError);
                }

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
