export default async function handler(req, res) {
  const username = "P-P-programer";
  const token = process.env.GITHUB_TOKEN;
  const cacheSeconds = 300;

  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        "User-Agent": "P-P-programer-stats",
        Accept: "application/vnd.github+json",
      }
    : {
        "User-Agent": "P-P-programer-stats",
        Accept: "application/vnd.github+json",
      };

  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).send(`GitHub API error: ${errorText}`);
      return;
    }

    const data = await response.json();

    const name = data.name || data.login || username;
    const followers = data.followers ?? 0;
    const following = data.following ?? 0;
    const publicRepos = data.public_repos ?? 0;
    const publicGists = data.public_gists ?? 0;
    const updatedAt = data.updated_at
      ? new Date(data.updated_at).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

    const svg = `
      <svg width="760" height="240" viewBox="0 0 760 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="760" y2="240" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0f172a"/>
            <stop offset="1" stop-color="#111827"/>
          </linearGradient>
          <linearGradient id="accent" x1="0" y1="0" x2="760" y2="0" gradientUnits="userSpaceOnUse">
            <stop stop-color="#38bdf8"/>
            <stop offset="1" stop-color="#8b5cf6"/>
          </linearGradient>
        </defs>

        <rect width="760" height="240" rx="24" fill="url(#bg)"/>
        <rect x="20" y="20" width="720" height="200" rx="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
        <rect x="20" y="20" width="720" height="6" rx="3" fill="url(#accent)"/>

        <text x="40" y="68" fill="#ffffff" font-size="28" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${name}</text>
        <text x="40" y="94" fill="#cbd5e1" font-size="15" font-family="Segoe UI, Inter, Arial, sans-serif">GitHub Profile Overview</text>

        <text x="40" y="142" fill="#e2e8f0" font-size="16" font-family="Segoe UI, Inter, Arial, sans-serif">Followers</text>
        <text x="40" y="176" fill="#38bdf8" font-size="32" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${followers}</text>

        <text x="180" y="142" fill="#e2e8f0" font-size="16" font-family="Segoe UI, Inter, Arial, sans-serif">Repos públicos</text>
        <text x="180" y="176" fill="#8b5cf6" font-size="32" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${publicRepos}</text>

        <text x="350" y="142" fill="#e2e8f0" font-size="16" font-family="Segoe UI, Inter, Arial, sans-serif">Siguiendo</text>
        <text x="350" y="176" fill="#22c55e" font-size="32" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${following}</text>

        <text x="490" y="142" fill="#e2e8f0" font-size="16" font-family="Segoe UI, Inter, Arial, sans-serif">Gists</text>
        <text x="490" y="176" fill="#f59e0b" font-size="32" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${publicGists}</text>

        <text x="40" y="214" fill="#94a3b8" font-size="13" font-family="Segoe UI, Inter, Arial, sans-serif">Última actualización del perfil: ${updatedAt}</text>
      </svg>
    `.trim();

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=600`);
    res.status(200).send(svg);
  } catch (error) {
    res.status(500).send(`Error generating SVG: ${error.message}`);
  }
}
