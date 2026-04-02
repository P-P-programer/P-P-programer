export default async function handler(req, res) {
  const username = "P-P-programer";
  const token = process.env.GITHUB_TOKEN;
  const cacheSeconds = 600;

  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        "User-Agent": "P-P-programer-profile",
        Accept: "application/vnd.github+json",
      }
    : {
        "User-Agent": "P-P-programer-profile",
        Accept: "application/vnd.github+json",
      };

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=owner&sort=updated`, { headers }),
    ]);

    if (!userRes.ok) {
      const txt = await userRes.text();
      res.status(userRes.status).send(`GitHub user API error: ${txt}`);
      return;
    }

    if (!reposRes.ok) {
      const txt = await reposRes.text();
      res.status(reposRes.status).send(`GitHub repos API error: ${txt}`);
      return;
    }

    const user = await userRes.json();
    const repos = await reposRes.json();

    const name = user.name || user.login || username;
    const followers = user.followers ?? 0;
    const following = user.following ?? 0;
    const publicRepos = user.public_repos ?? 0;
    const publicGists = user.public_gists ?? 0;
    const bio = user.bio || "Backend Developer | Laravel | PHP";

    // Top languages reales: sumando languages_url de cada repo
    const languageTotals = {};
    for (const repo of repos) {
      if (repo.fork || !repo.languages_url) continue;

      const langRes = await fetch(repo.languages_url, { headers });
      if (!langRes.ok) continue;

      const langs = await langRes.json();
      for (const [lang, bytes] of Object.entries(langs)) {
        languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
      }
    }

    const topLangs = Object.entries(languageTotals)
      .filter(([, bytes]) => bytes > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const totalBytes = topLangs.reduce((acc, [, bytes]) => acc + bytes, 0) || 1;
    const langText = topLangs.length
      ? topLangs
          .map(([lang, bytes]) => `${lang} ${((bytes / totalBytes) * 100).toFixed(0)}%`)
          .join("  •  ")
      : "No languages found";

    const updatedAt = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const svg = `
      <svg width="980" height="320" viewBox="0 0 980 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="980" y2="320" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0f172a"/>
            <stop offset="1" stop-color="#111827"/>
          </linearGradient>
          <linearGradient id="accent" x1="0" y1="0" x2="980" y2="0" gradientUnits="userSpaceOnUse">
            <stop stop-color="#38bdf8"/>
            <stop offset="1" stop-color="#8b5cf6"/>
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur"/>
            <feColorMatrix in="blur" type="matrix"
              values="0 0 0 0 0.22
                      0 0 0 0 0.77
                      0 0 0 0 1
                      0 0 0 0.35 0"/>
          </filter>
        </defs>

        <rect width="980" height="320" rx="28" fill="url(#bg)"/>
        <rect x="18" y="18" width="944" height="284" rx="22" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
        <rect x="18" y="18" width="944" height="7" rx="3.5" fill="url(#accent)"/>

        <circle cx="112" cy="110" r="54" fill="url(#accent)" filter="url(#shadow)"/>
        <text x="112" y="118" text-anchor="middle" fill="#ffffff" font-size="28" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${name.slice(0,1)}</text>

        <text x="190" y="78" fill="#ffffff" font-size="30" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${name}</text>
        <text x="190" y="108" fill="#cbd5e1" font-size="16" font-family="Segoe UI, Inter, Arial, sans-serif">${bio}</text>
        <text x="190" y="134" fill="#94a3b8" font-size="13" font-family="Segoe UI, Inter, Arial, sans-serif">Focused on clean backend development, Laravel, PHP and real-world solutions.</text>

        <rect x="190" y="160" width="560" height="1" fill="rgba(255,255,255,0.08)"/>

        <text x="190" y="196" fill="#e2e8f0" font-size="15" font-family="Segoe UI, Inter, Arial, sans-serif">Followers</text>
        <text x="190" y="226" fill="#38bdf8" font-size="30" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${followers}</text>

        <text x="330" y="196" fill="#e2e8f0" font-size="15" font-family="Segoe UI, Inter, Arial, sans-serif">Repos</text>
        <text x="330" y="226" fill="#8b5cf6" font-size="30" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${publicRepos}</text>

        <text x="450" y="196" fill="#e2e8f0" font-size="15" font-family="Segoe UI, Inter, Arial, sans-serif">Following</text>
        <text x="450" y="226" fill="#22c55e" font-size="30" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${following}</text>

        <text x="590" y="196" fill="#e2e8f0" font-size="15" font-family="Segoe UI, Inter, Arial, sans-serif">Gists</text>
        <text x="590" y="226" fill="#f59e0b" font-size="30" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">${publicGists}</text>

        <text x="760" y="84" fill="#ffffff" font-size="18" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">Top Languages</text>
        <text x="760" y="112" fill="#cbd5e1" font-size="13" font-family="Segoe UI, Inter, Arial, sans-serif">${langText}</text>

        <rect x="760" y="132" width="182" height="110" rx="16" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)"/>
        ${topLangs.map(([, bytes], i) => {
          const colors = ["#38bdf8", "#8b5cf6", "#22c55e"];
          const pct = ((bytes / totalBytes) * 100).toFixed(0);
          const y = 160 + i * 26;
          return `
            <rect x="780" y="${y}" width="${Math.max(20, pct * 1.2)}" height="12" rx="6" fill="${colors[i % colors.length]}"/>
          `;
        }).join("")}

        <text x="40" y="272" fill="#94a3b8" font-size="13" font-family="Segoe UI, Inter, Arial, sans-serif">Última actualización del perfil: ${updatedAt}</text>
        <text x="760" y="272" fill="#94a3b8" font-size="13" font-family="Segoe UI, Inter, Arial, sans-serif">Cache via Vercel: ${cacheSeconds}s</text>
      </svg>
    `.trim();

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=1200`);
    res.status(200).send(svg);
  } catch (error) {
    res.status(500).send(`Error generating profile SVG: ${error.message}`);
  }
}
