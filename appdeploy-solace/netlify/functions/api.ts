import { InputError, modelInfo, scoreUrl } from '../../backend/index';

const apiPaths = [
    '/api/_healthcheck',
    '/api/v1/health',
    '/api/v1/model',
    '/api/v1/scans',
    '/api/v1/reports',
];

export const config = { path: apiPaths };

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'content-type': 'application/json; charset=utf-8' },
    });
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
    try {
        const body: unknown = await request.json();
        return body && typeof body === 'object' ? body as Record<string, unknown> : {};
    } catch {
        return {};
    }
}

export default async function handler(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.searchParams.get('route') || url.pathname;
    const method = request.method.toUpperCase();

    if (method === 'GET' && path === '/api/_healthcheck') {
        return json({ message: 'Success' });
    }

    if (method === 'GET' && path === '/api/v1/health') {
        return json({
            status: 'ok',
            service: 'SOLACE API',
            model_loaded: true,
            model_name: 'Random Forest (scikit-learn)',
        });
    }

    if (method === 'GET' && path === '/api/v1/model') {
        return json(modelInfo());
    }

    if (method === 'GET' && path === '/api/v1/scans') {
        return json({ items: [], count: 0 });
    }

    if (method === 'POST' && (path === '/api/v1/scans' || path === '/api/v1/reports')) {
        const body = await readBody(request);
        if (typeof body.url !== 'string' || !body.url.trim()) {
            return json({ error: 'Enter a URL.' }, 422);
        }

        if (path === '/api/v1/reports') {
            const category = typeof body.category === 'string' ? body.category.trim() : 'Community Report';
            const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
            if (category.length > 80) return json({ error: 'Category must be 80 characters or fewer.' }, 422);
            if (notes.length > 1000) return json({ error: 'Notes must be 1000 characters or fewer.' }, 422);
        }

        try {
            const result = scoreUrl(body.url);
            if (path === '/api/v1/reports') {
                return json({
                    ...result,
                    category: typeof body.category === 'string' && body.category.trim()
                        ? body.category.trim()
                        : 'Community Report',
                    notes: typeof body.notes === 'string' && body.notes.trim()
                        ? body.notes.trim()
                        : 'Community submitted indicator; not independently verified.',
                });
            }
            return json(result);
        } catch (cause) {
            if (cause instanceof InputError) return json({ error: cause.message }, 422);
            console.error('URL analysis failed.', cause);
            return json({ error: 'The URL could not be analyzed. Please try again.' }, 500);
        }
    }

    return json({ error: 'Not found.' }, 404);
}
