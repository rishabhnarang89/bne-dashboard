import { corsHeaders, handleError, validateFields } from './_utils';

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const { method } = request;
    const url = new URL(request.url);

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        switch (method) {
            case 'GET': {
                try {
                    const { results } = await env.DB.prepare('SELECT * FROM tasks ORDER BY week_id, created_at').all();
                    const parsedResults = results.map((task: any) => {
                        let assignees = [];
                        try {
                            assignees = task.assignees ? JSON.parse(task.assignees) : [];
                        } catch (e) {
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
                } catch (dbError: any) {
                    if (dbError.message?.includes('no such table')) {
                        console.error('DATABASE TABLE MISSING in production:', dbError.message);
                        return Response.json([], { headers: corsHeaders }); // Return empty rather than 500
                    }
                    throw dbError;
                }
            }

            case 'POST': {
                try {
                    const task = await request.json() as any;

                    // ✅ Input Validation
                    const requiredFields = ['title', 'priority'];
                    const missing = requiredFields.filter(field => !task[field]);

                    if (missing.length > 0) {
                        return Response.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400, headers: corsHeaders });
                    }

                    // Normalize ID: If it's a local 'custom_' ID, let's allow it as a string, or generate a UUID if needed
                    // ideally we should treat ID as TEXT in D1 as per schema.
                    if (!task.id) {
                        task.id = crypto.randomUUID();
                    }

                    // Normalize week_id
                    task.week_id = task.week_id ? parseInt(String(task.week_id)) : 1;

                    console.log('SYNC TASK PAYLOAD:', JSON.stringify(task));

                    // Handle assignees
                    let assignees = task.assignees || [];
                    if (task.assignee) {
                        assignees = [task.assignee];
                    }

                    // Backward compatible assignee (must match old check constraint: rishabh, tung, johannes, all)
                    const validAssignees = ['rishabh', 'tung', 'johannes', 'all'];

                    // Logic to extract legacy assignee if array has one clear item
                    let legacyAssignee = null;
                    if (Array.isArray(assignees) && assignees.length > 0) {
                        const first = assignees[0];
                        if (validAssignees.includes(first)) {
                            legacyAssignee = first;
                        }
                    } else if (typeof task.assignee === 'string' && validAssignees.includes(task.assignee)) {
                        legacyAssignee = task.assignee;
                    }

                    // Log calculated values
                    console.log('SYNC TASK Calculated:', { id: task.id, week_id: task.week_id, legacyAssignee, assignees });

                    const result = await env.DB.prepare(`
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
                        task.created_at || new Date().toISOString(),
                        task.isDefault ? 1 : 0,
                        JSON.stringify(task.subtasks || []),
                        task.linked_interview_id || null,
                        task.linked_teacher_id || null,
                        legacyAssignee,
                        JSON.stringify(assignees),
                        task.lastModifiedBy || null
                    ).run();

                    console.log('SYNC TASK DB RESULT:', JSON.stringify(result));

                    // Log Activity
                    try {
                        await env.DB.prepare(`
                            INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                            VALUES (?, 'CREATE', 'TASK', ?, ?, ?)
                        `).bind(
                            task.lastModifiedBy || 'Unknown User',
                            task.id,
                            task.title,
                            JSON.stringify({ priority: task.priority, due_date: task.due_date, assignees, linked_teacher_id: task.linked_teacher_id })
                        ).run();
                    } catch (logError) {
                        console.error('Failed to log update:', logError);
                    }

                    return Response.json({ success: true }, { headers: corsHeaders });
                } catch (dbError: any) {
                    if (dbError.message?.includes('no such table')) {
                        console.error('DATABASE TABLE MISSING in production:', dbError.message);
                        return Response.json({ error: 'Database table missing' }, { status: 503, headers: corsHeaders });
                    }
                    throw dbError;
                }
            }

            case 'DELETE': {
                const taskId = url.searchParams.get('id');
                if (!taskId) return Response.json({ error: 'Missing task ID' }, { status: 400, headers: corsHeaders });

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
        return handleError(error, 'Tasks API', request);
    }
};
