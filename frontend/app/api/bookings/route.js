export async function POST(request) {
  if (!process.env.DJANGO_API_URL)
    return Response.json(
      {
        detail:
          "Online booking is not connected yet. Please contact the showroom.",
      },
      { status: 503 },
    );
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host"))
    return Response.json({ detail: "Invalid origin" }, { status: 403 });
  try {
    const body = await request.json();
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/bookings/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: request.headers.get('cookie') || '', 'X-CSRFToken': request.headers.get('x-csrftoken') || '' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      },
    );
    return Response.json(await response.json(), { status: response.status });
  } catch {
    return Response.json(
      { detail: "Unable to reach the showroom. Please try again shortly." },
      { status: 503 },
    );
  }
}
