// Cloudflare Pages Function types
// This file provides TypeScript types for Cloudflare Pages Functions

declare global {
    interface Env {
        DB: D1Database;
    }

    type PagesFunction<Env = unknown> = (context: EventContext<Env, any, any>) => Response | Promise<Response>;

    interface EventContext<Env, P extends string, Data> {
        request: Request;
        env: Env;
        params: Record<P, string>;
        data: Data;
        waitUntil(promise: Promise<any>): void;
        passThroughOnException(): void;
    }
}

export { };
