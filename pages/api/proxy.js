export default async function handler(req, res) {
  const { target } = req.query;

  if (!target) {
    return res.status(400).json({ error: "Missing target URL" });
  }

  try {
    const url = new URL(target);
    url.searchParams.set("key", process.env.GOOGLE_MAPS_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy failed", detail: error.message });
  }
}
