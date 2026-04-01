// Proxy for GitHub Stats card
// Vercel CDN caches the response for 1 hour (s-maxage=3600)
// and serves stale content for up to 24 h while revalidating in the background.
module.exports = async function handler(req, res) {
  const username = process.env.GITHUB_USERNAME || 'P-P-programer';

  const params = new URLSearchParams({
    username,
    show_icons: 'true',
    theme: 'dark',
    count_private: 'true',
    hide_border: 'true',
    include_all_commits: 'true',
  });

  // If a personal GitHub token is configured, forward it so the upstream
  // service uses a higher rate-limit quota.
  if (process.env.GITHUB_TOKEN) {
    params.set('PAT_1', process.env.GITHUB_TOKEN);
  }

  const url = `https://github-readme-stats.vercel.app/api?${params}`;

  try {
    const upstream = await fetch(url);
    const svg = await upstream.text();

    if (!upstream.ok) {
      console.error(`Upstream stats error ${upstream.status}: ${svg}`);
      return res.status(502).send('Upstream stats service returned an error');
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(svg);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(502).send('Error fetching stats');
  }
};
