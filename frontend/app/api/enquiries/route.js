export async function POST(request) {
  if (!process.env.DJANGO_API_URL)
    return Response.json({ detail: "Enquiries are not connected yet. Please try again later." }, { status: 503 });
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host"))
    return Response.json({ detail: "Invalid origin" }, { status: 403 });
  try {
    const body = await request.json();
    const response = await fetch(`${process.env.DJANGO_API_URL}/api/enquiries/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    return Response.json(await response.json(), { status: response.status });
  } catch {
    return Response.json({ detail: "Unable to send your enquiry. Please try again shortly." }, { status: 503 });
  }
}
