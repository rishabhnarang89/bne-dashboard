// Cloudflare Functions API for Teachers
// Handles CRUD operations for teachers table in D1

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
                const { results } = await env.DB.prepare('SELECT * FROM teachers ORDER BY created_at DESC').all();
                return Response.json(results, { headers: corsHeaders });
            }

            case 'POST': {
                const teacher = await request.json() as any;
                const result = await env.DB.prepare(`
          INSERT INTO teachers (name, designation, department, school, school_type, email, linkedin_url, request_sent_date, status, notes, created_at, contact_method, response_date, last_contact_date, next_follow_up_date, linkedin_message_sent, email_sent, phone_call_made)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
                    teacher.name,
                    teacher.designation || null,
                    teacher.department || null,
                    teacher.school,
                    teacher.schoolType || teacher.school_type, // Handle both camelCase and snake_case
                    teacher.email || null,
                    teacher.linkedinUrl || teacher.linkedin_url || null,
                    teacher.requestSentDate || teacher.request_sent_date || null,
                    teacher.status,
                    teacher.notes || null,
                    teacher.createdAt || teacher.created_at || new Date().toISOString(),
                    teacher.contactMethod || teacher.contact_method || null,
                    teacher.responseDate || teacher.response_date || null,
                    teacher.lastContactDate || teacher.last_contact_date || null,
                    teacher.nextFollowUpDate || teacher.next_follow_up_date || null,
                    teacher.linkedinMessageSent || teacher.linkedin_message_sent ? 1 : 0,
                    teacher.emailSent || teacher.email_sent ? 1 : 0,
                    teacher.phoneCallMade || teacher.phone_call_made ? 1 : 0
                ).run();

                return Response.json({ success: true, id: result.meta.last_row_id }, { headers: corsHeaders });
            }

            case 'PUT': {
                const teacherId = url.searchParams.get('id');
                const updates = await request.json() as any;

                const setClauses = [];
                const values = [];

                if (updates.name !== undefined) { setClauses.push('name = ?'); values.push(updates.name); }
                if (updates.designation !== undefined) { setClauses.push('designation = ?'); values.push(updates.designation || null); }
                if (updates.department !== undefined) { setClauses.push('department = ?'); values.push(updates.department || null); }
                if (updates.school !== undefined) { setClauses.push('school = ?'); values.push(updates.school); }
                if (updates.schoolType !== undefined || updates.school_type !== undefined) {
                    setClauses.push('school_type = ?');
                    values.push(updates.schoolType || updates.school_type);
                }
                if (updates.email !== undefined) { setClauses.push('email = ?'); values.push(updates.email || null); }
                if (updates.linkedinUrl !== undefined || updates.linkedin_url !== undefined) {
                    setClauses.push('linkedin_url = ?');
                    values.push(updates.linkedinUrl || updates.linkedin_url || null);
                }
                if (updates.requestSentDate !== undefined || updates.request_sent_date !== undefined) {
                    setClauses.push('request_sent_date = ?');
                    values.push(updates.requestSentDate || updates.request_sent_date || null);
                }
                if (updates.status !== undefined) { setClauses.push('status = ?'); values.push(updates.status); }
                if (updates.notes !== undefined) { setClauses.push('notes = ?'); values.push(updates.notes || null); }
                if (updates.contactMethod !== undefined || updates.contact_method !== undefined) {
                    setClauses.push('contact_method = ?');
                    values.push(updates.contactMethod || updates.contact_method || null);
                }
                if (updates.responseDate !== undefined || updates.response_date !== undefined) {
                    setClauses.push('response_date = ?');
                    values.push(updates.responseDate || updates.response_date || null);
                }
                if (updates.lastContactDate !== undefined || updates.last_contact_date !== undefined) {
                    setClauses.push('last_contact_date = ?');
                    values.push(updates.lastContactDate || updates.last_contact_date || null);
                }
                if (updates.nextFollowUpDate !== undefined || updates.next_follow_up_date !== undefined) {
                    setClauses.push('next_follow_up_date = ?');
                    values.push(updates.nextFollowUpDate || updates.next_follow_up_date || null);
                }
                if (updates.linkedinMessageSent !== undefined || updates.linkedin_message_sent !== undefined) {
                    setClauses.push('linkedin_message_sent = ?');
                    values.push((updates.linkedinMessageSent || updates.linkedin_message_sent) ? 1 : 0);
                }
                if (updates.emailSent !== undefined || updates.email_sent !== undefined) {
                    setClauses.push('email_sent = ?');
                    values.push((updates.emailSent || updates.email_sent) ? 1 : 0);
                }
                if (updates.phoneCallMade !== undefined || updates.phone_call_made !== undefined) {
                    setClauses.push('phone_call_made = ?');
                    values.push((updates.phoneCallMade || updates.phone_call_made) ? 1 : 0);
                }

                if (setClauses.length > 0) {
                    await env.DB.prepare(`UPDATE teachers SET ${setClauses.join(', ')} WHERE id = ?`)
                        .bind(...values, teacherId)
                        .run();
                }

                return Response.json({ success: true }, { headers: corsHeaders });
            }

            case 'DELETE': {
                const teacherId = url.searchParams.get('id');
                await env.DB.prepare('DELETE FROM teachers WHERE id = ?').bind(teacherId).run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }

            default:
                return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }
    } catch (error) {
        console.error('Teachers API error:', error);
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
};
