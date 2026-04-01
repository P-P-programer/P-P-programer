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

    const followers = data.followers ?? 0;
    const following = data.following ?? 0;
    const publicRepos = data.public_repos ?? 0;
    const publicGists = data.public_gists ?? 0;
    const name = data.name || data.login || username;
    const avatar = data.avatar_url;
    const updatedAt = data.updated_at
      ? new Date(data.updated_at).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

    const svg = `
      <svg width="760" height="260" viewBox="0 0 760 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="760" y2="260" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0f172a"/>
            <stop offset="1" stop-color="#111827"/>
          </linearGradient>
          <linearGradient id="accent" x1="0" y1="0" x2="760" y2="0" gradientUnits="userSpaceOnUse">
            <stop stop-color="#38bdf8"/>
            <stop offset="1" stop-color="#8b5cf6"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feColorMatrix in="blur" type="matrix"
              values="1 0 0 0 0.22
                      0 1 0 0 0.77
                      0 0 1 0 1
                      0 0 0 0.5 0" />
          </filter>
        </defs>

        <rect x="0" y="0" width="760" height="260" rx="24" fill="url(#bg)"/>
        <rect x="20" y="20" width="720" height="220" rx="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>

        <circle cx="120" cy="110" r="54" fill="url(#accent)" filter="url(#glow)"/>
        <clipPath id="avatarClip">
          <circle cx="120" cy="110" r="48"/>
        </clipPath>
        <image href="${avatar}" x="72" y="62" width="96" height="96" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>

        <text x="200" y="78" fill="#ffffff" font-size="28" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${name}</text>
        <text x="200" y="108" fill="#cbd5e1" font-size="16" font-family="Segoe UI, Inter, Arial, sans-serif">GitHub Profile Stats</text>

        <text x="200" y="150" fill="#e2e8f0" font-size="18" font-family="Segoe UI, Inter, Arial, sans-serif">Followers</text>
        <text x="200" y="182" fill="#38bdf8" font-size="30" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${followers}</text>

        <text x="320" y="150" fill="#e2e8f0" font-size="18" font-family="Segoe UI, Inter, Arial, sans-serif">Repos públicos</text>
        <text x="320" y="182" fill="#8b5cf6" font-size="30" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${publicRepos}</text>

        <text x="485" y="150" fill="#e2e8f0" font-size="18" font-family="Segoe UI, Inter, Arial, sans-serif">Siguiendo</text>
        <text x="485" y="182" fill="#22c55e" font-size="30" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${following}</text>

        <text x="620" y="150" fill="#e2e8f0" font-size="18" font-family="Segoe UI, Inter, Arial, sans-serif">Gists</text>
        <text x="620" y="182" fill="#f59e0b" font-size="30" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${publicGists}</text>

        <text x="200" y="228" fill="#94a3b8" font-size="14" font-family="Segoe UI, Inter, Arial, sans-serif">Última actividad del perfil: ${updatedAt}</text>
        <text x="560" y="228" fill="#94a3b8" font-size="14" font-family="Segoe UI, Inter, Arial, sans-serif">Actualizado vía Vercel • Cache: ${cacheSeconds}s</text>
      </svg>
    `.trim();

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=600`);
    res.status(200).send(svg);
  } catch (error) {
    res.status(500).send(`Error generating SVG: ${error.message}`);
  }
}
