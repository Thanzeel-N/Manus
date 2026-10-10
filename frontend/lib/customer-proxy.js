export async function customerProxy(request, path) {
  if (!process.env.DJANGO_API_URL) return Response.json({ detail: 'Customer sign-in is unavailable.' }, { status: 503 });
  const origin = request.headers.get('origin');
  if (request.method !== 'GET' && (!origin || new URL(origin).host !== request.headers.get('host'))) return Response.json({ detail: 'Invalid origin' }, { status: 403 });
  try {
    const response = await fetch(`${process.env.DJANGO_API_URL}/api/${path}/`, {
      method: request.method, cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('cookie') || '', 'X-CSRFToken': request.headers.get('x-csrftoken') || '' },
      ...(request.method !== 'GET' ? { body: await request.text() } : {}),
      signal: AbortSignal.timeout(15000),
    });
    const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    for (const cookie of response.headers.getSetCookie()) headers.append('Set-Cookie', cookie);
    const text = await response.text();
    try { JSON.parse(text); } catch { return Response.json({ detail: 'The request could not be completed. Reload the page and try again.' }, { status: response.ok ? 502 : response.status }); }
    return new Response(text, { status: response.status, headers });
  } catch { return Response.json({ detail: 'Unable to reach the showroom. Please try again.' }, { status: 503 }); }
}
