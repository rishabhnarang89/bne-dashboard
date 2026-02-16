// Cloudflare Functions API for Knowledge Hub
// Handles CRUD operations for knowledge_cards and knowledge_items

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
                // Fetch all cards
                const { results: cards } = await env.DB.prepare(
                    'SELECT * FROM knowledge_cards ORDER BY sort_order, created_at DESC'
                ).all();

                // Fetch all items  
                const { results: items } = await env.DB.prepare(
                    'SELECT * FROM knowledge_items ORDER BY sort_order, created_at DESC'
                ).all();

                // Map items to cards
                const structuredData = cards.map((card: any) => ({
                    ...card,
                    items: items.filter((item: any) => item.card_id === card.id)
                }));

                return Response.json(structuredData, { headers: corsHeaders });
            }

            case 'POST': {
                const payload = await request.json() as any;
                const { entityType } = payload; // 'card' or 'item'

                if (entityType === 'card') {
                    await env.DB.prepare(`
                        INSERT INTO knowledge_cards (id, title, description, icon, color, sort_order)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `).bind(
                        payload.id,
                        payload.title,
                        payload.description || null,
                        payload.icon || 'Folder',
                        payload.color || 'blue',
                        payload.sort_order || 0
                    ).run();

                } else if (entityType === 'item') {
                    await env.DB.prepare(`
                        INSERT INTO knowledge_items (id, card_id, type, title, url, content, sort_order)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        payload.id,
                        payload.card_id,
                        payload.type,
                        payload.title,
                        payload.url || null,
                        payload.content || null,
                        payload.sort_order || 0
                    ).run();
                } else {
                    return new Response('Invalid entityType', { status: 400, headers: corsHeaders });
                }

                return Response.json({ success: true }, { headers: corsHeaders });
            }

            case 'PUT': {
                const payload = await request.json() as any;
                const { entityType, id } = payload;

                if (!id) return new Response('Missing ID', { status: 400, headers: corsHeaders });

                if (entityType === 'card') {
                    const setClauses = [];
                    const values = [];
                    if (payload.title !== undefined) { setClauses.push('title = ?'); values.push(payload.title); }
                    if (payload.description !== undefined) { setClauses.push('description = ?'); values.push(payload.description); }
                    if (payload.icon !== undefined) { setClauses.push('icon = ?'); values.push(payload.icon); }
                    if (payload.color !== undefined) { setClauses.push('color = ?'); values.push(payload.color); }
                    if (payload.sort_order !== undefined) { setClauses.push('sort_order = ?'); values.push(payload.sort_order); }

                    if (setClauses.length > 0) {
                        await env.DB.prepare(`UPDATE knowledge_cards SET ${setClauses.join(', ')} WHERE id = ?`)
                            .bind(...values, id)
                            .run();
                    }
                } else if (entityType === 'item') {
                    const setClauses = [];
                    const values = [];
                    if (payload.card_id !== undefined) { setClauses.push('card_id = ?'); values.push(payload.card_id); }
                    if (payload.type !== undefined) { setClauses.push('type = ?'); values.push(payload.type); }
                    if (payload.title !== undefined) { setClauses.push('title = ?'); values.push(payload.title); }
                    if (payload.url !== undefined) { setClauses.push('url = ?'); values.push(payload.url); }
                    if (payload.content !== undefined) { setClauses.push('content = ?'); values.push(payload.content); }
                    if (payload.sort_order !== undefined) { setClauses.push('sort_order = ?'); values.push(payload.sort_order); }

                    if (setClauses.length > 0) {
                        await env.DB.prepare(`UPDATE knowledge_items SET ${setClauses.join(', ')} WHERE id = ?`)
                            .bind(...values, id)
                            .run();
                    }
                }

                return Response.json({ success: true }, { headers: corsHeaders });
            }

            case 'DELETE': {
                const id = url.searchParams.get('id');
                const entityType = url.searchParams.get('entityType'); // 'card' or 'item'

                if (!id || !entityType) return new Response('Missing ID or entityType', { status: 400, headers: corsHeaders });

                if (entityType === 'card') {
                    await env.DB.prepare('DELETE FROM knowledge_cards WHERE id = ?').bind(id).run();
                } else if (entityType === 'item') {
                    await env.DB.prepare('DELETE FROM knowledge_items WHERE id = ?').bind(id).run();
                }

                return Response.json({ success: true }, { headers: corsHeaders });
            }

            default:
                return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }
    } catch (error) {
        console.error('Knowledge Hub API error:', error);
        return Response.json({ error: (error as Error).message }, { status: 500, headers: corsHeaders });
    }
};
