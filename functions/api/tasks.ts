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

                    // Normalize input (handle snake_case vs camelCase)
                    const title = task.title;
                    const notes = task.notes || null;
                    const priority = task.priority || 'medium';
                    const weekId = task.week_id ? parseInt(String(task.week_id)) : (task.weekId ? parseInt(String(task.weekId)) : 1);
                    const dueDate = task.due_date || task.dueDate || null;
                    const isDefault = task.is_default !== undefined ? task.is_default : (task.isDefault !== undefined ? task.isDefault : false);
                    const completed = task.completed !== undefined ? task.completed : false;
                    const completedAt = task.completed_at || task.completedAt || null;
                    const createdAt = task.created_at || task.createdAt || new Date().toISOString();
                    const subtasks = task.subtasks || [];
                    const linkedInterviewId = task.linked_interview_id || task.linkedInterviewId || null;
                    const linkedTeacherId = task.linked_teacher_id || task.linkedTeacherId || null;
                    const lastModifiedBy = task.last_modified_by || task.lastModifiedBy || null;

                    // ✅ Input Validation
                    if (!title) {
                        return Response.json({ error: `Missing required field: title` }, { status: 400, headers: corsHeaders });
                    }

                    // Normalize ID: If it's a local 'custom_' ID, let's allow it as a string, or generate a UUID if needed
                    if (!task.id) {
                        task.id = crypto.randomUUID();
                    }

                    console.log('SYNC TASK PAYLOAD (Normalized):', JSON.stringify({
                        id: task.id, title, priority, weekId, isDefault, assignees: task.assignees
                    }));

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

                    const result = await env.DB.prepare(`
                        INSERT INTO tasks (id, title, notes, week_id, priority, due_date, completed, completed_at, created_at, is_default, subtasks, linked_interview_id, linked_teacher_id, assignee, assignees, last_modified_by)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        task.id,
                        title,
                        notes,
                        weekId,
                        priority,
                        dueDate,
                        completed ? 1 : 0,
                        completedAt,
                        createdAt,
                        isDefault ? 1 : 0,
                        JSON.stringify(subtasks),
                        linkedInterviewId,
                        linkedTeacherId,
                        legacyAssignee,
                        JSON.stringify(assignees),
                        lastModifiedBy
                    ).run();

                    console.log('SYNC TASK DB RESULT:', JSON.stringify(result));

                    // Log Activity
                    try {
                        await env.DB.prepare(`
                            INSERT INTO activity_logs (user_name, action_type, entity_type, entity_id, entity_name, details)
                            VALUES (?, 'CREATE', 'TASK', ?, ?, ?)
                        `).bind(
                            lastModifiedBy || 'Unknown User',
                            task.id,
                            title,
                            JSON.stringify({ priority, due_date: dueDate, assignees, linked_teacher_id: linkedTeacherId })
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
