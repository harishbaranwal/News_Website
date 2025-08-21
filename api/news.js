// /api/news.js
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const {
      q = 'news',
      page = '1',
      pageSize = '12',
      language = 'en',
      from = '',
      sortBy = 'publishedAt'
    } = req.query;

    // Add CORS headers for local development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', q);
    url.searchParams.set('page', page);
    url.searchParams.set('pageSize', pageSize);
    url.searchParams.set('language', language);
    if (from) url.searchParams.set('from', from);
    url.searchParams.set('sortBy', sortBy);

    const upstream = await fetch(url.toString(), {
      headers: { 'X-Api-Key': process.env.NEWS_API_KEY }
    });

    const data = await upstream.json();

    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Proxy error', error: String(err) });
  }
}
