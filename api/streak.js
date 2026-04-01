// Proxy for GitHub Streak card (streak-stats.demolab.com)
// Vercel CDN caches the response for 1 hour (s-maxage=3600)
// and serves stale content for up to 24 h while revalidating in the background.
module.exports = async function handler(req, res) {
  const username = process.env.GITHUB_USERNAME || 'P-P-programer';

  const params = new URLSearchParams({
    user: username,
    theme: 'dark',
    hide_border: 'true',
    date_format: 'j M[ Y]',
  });

  const url = `https://streak-stats.demolab.com?${params}`;

  try {
    const upstream = await fetch(url);
    const svg = await upstream.text();

    if (!upstream.ok) {
      console.error(`Upstream streak error ${upstream.status}: ${svg}`);
      return res.status(502).send('Upstream streak service returned an error');
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(svg);
  } catch (err) {
    console.error('Error fetching streak:', err);
    res.status(502).send('Error fetching streak');
  }
};
