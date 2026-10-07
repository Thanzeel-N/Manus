export async function POST(request) {
  if (!process.env.DJANGO_API_URL)
    return Response.json(
      { detail: "Email verification is unavailable. Please try again later." },
      { status: 503 },
    );
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host"))
    return Response.json({ detail: "Invalid origin" }, { status: 403 });
  try {
    const body = await request.json();
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/verification/send/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: body.email }),
        signal: AbortSignal.timeout(15000),
      },
    );
    return Response.json(await response.json(), { status: response.status });
  } catch {
    return Response.json(
      {
        detail: "Unable to send a verification code. Please try again shortly.",
      },
      { status: 503 },
    );
  }
}
