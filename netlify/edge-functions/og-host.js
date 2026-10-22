// WhatsApp and other link crawlers don't run JS, so the preview has to be
// swapped in the HTML before it leaves Netlify. ?host=bride gets the bride's
// cover and title; anything else keeps the defaults baked into index.html.
export default async (request, context) => {
  const host = (new URL(request.url).searchParams.get("host") || "").toLowerCase();
  const response = await context.next();
  if (host !== "bride") return response;

  const html = (await response.text())
    .replace("photos/og-cover.jpg", "photos/og-cover-bride.jpg")
    .replace(/Prashasy &amp; Garima — Wedding on 7th December/g,
             "Garima &amp; Prashasy — Wedding on 7th December");

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, { status: response.status, headers });
};

export const config = { path: ["/", "/index.html"] };
