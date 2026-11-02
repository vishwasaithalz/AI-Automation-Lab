import { NextResponse } from 'next/server';

export type JsonObject = Record<string, unknown>;

export function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

/**
 * API routes are additionally protected by Vercel SSO at the deployment edge.
 * This helper enforces same-origin JSON POSTs and a strict request-size limit.
 */
export async function readJsonObject(
  request: Request,
  maxBytes = 16_384,
): Promise<JsonObject | NextResponse> {
  const origin = request.headers.get('origin');
  const expectedOrigin = new URL(request.url).origin;

  if (!origin || origin !== expectedOrigin) {
    return jsonNoStore({ error: 'Request origin is not allowed.' }, 403);
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonNoStore({ error: 'Send a JSON request body.' }, 415);
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return jsonNoStore({ error: 'Request body is too large.' }, 413);
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    return jsonNoStore({ error: 'Request body is too large.' }, 413);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return jsonNoStore({ error: 'Request body must contain valid JSON.' }, 400);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return jsonNoStore({ error: 'Request body must be a JSON object.' }, 400);
  }

  return parsed as JsonObject;
}
