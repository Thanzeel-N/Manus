export async function GET(request, { params }) {
  if (!process.env.DJANGO_API_URL)
    return Response.json(
      { detail: "Online booking is not connected yet." },
      { status: 503 },
    );
  const { slug } = await params;
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/api/cars/${encodeURIComponent(slug)}/slots/`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) },
    );
    return Response.json(await response.json(), { status: response.status });
  } catch {
    return Response.json(
      { detail: "Availability could not be loaded. Please try again." },
      { status: 503 },
    );
  }
}
