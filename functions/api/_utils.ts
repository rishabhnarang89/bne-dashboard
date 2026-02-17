// Shared API Utilities

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Standardized error handler with logging
 */
export function handleError(error: unknown, context: string, request?: Request) {
    const errorId = crypto.randomUUID();
    const err = error as Error;

    console.error(`[${errorId}] ${context} error:`, {
        message: err.message,
        stack: err.stack,
        url: request?.url,
        method: request?.method
    });

    return Response.json({
        error: 'Internal server error',
        message: err.message, // Optional: only for development, consider hiding in prod
        errorId
    }, {
        status: 500,
        headers: corsHeaders
    });
}

/**
 * Basic input validation helper
 */
export function validateFields(data: any, required: string[]): string[] {
    const errors: string[] = [];
    for (const field of required) {
        if (data[field] === undefined || data[field] === null || (typeof data[field] === 'string' && data[field].trim() === '')) {
            errors.push(`${field} is required`);
        }
    }
    return errors;
}

/**
 * Security note:
 * All SQL statements in this API use Parameterized Binding via D1Database.prepare().bind().
 * This provides robust protection against SQL Injection by ensuring user input is 
 * never interpreted as SQL commands.
 */
