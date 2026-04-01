export default async function handler(req, res) {
  const username = "P-P-programer";
  const token = process.env.GITHUB_TOKEN;
  const cacheSeconds = 600;

  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        "User-Agent": "P-P-programer-top-langs",
        Accept: "application/vnd.github+json",
      }
    : {
        "User-Agent": "P-P-programer-top-langs",
        Accept: "application/vnd.github+json",
      };

  try {
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&type=owner&sort=updated`,
      { headers }
    );

    if (!reposRes.ok) {
      const txt = await reposRes.text();
      res.status(reposRes.status).send(`GitHub API error: ${txt}`);
      return;
    }

    const repos = await reposRes.json();

    const languageTotals = {};

    for (const repo of repos) {
      if (repo.fork) continue;
      if (!repo.languages_url) continue;

      const langRes = await fetch(repo.languages_url, { headers });
      if (!langRes.ok) continue;

      const langs = await langRes.json();
      for (const [lang, bytes] of Object.entries(langs)) {
        languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
      }
    }

    const entries = Object.entries(languageTotals)
      .filter(([, bytes]) => bytes > 0)
      .sort((a, b) => b[1] - a[1]);

    const top = entries.slice(0, 5);
    const total = top.reduce((acc, [, bytes]) => acc + bytes, 0) || 1;

    const colors = ["#38bdf8", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444"];

    const bars = top
      .map(([lang, bytes], i) => {
        const pct = (bytes / total) * 100;
        const width = Math.max(8, (pct / 100) * 440);
        const y = 82 + i * 32;
        const color = colors[i % colors.length];
        return `
          <text x="36" y="${y + 12}" fill="#e2e8f0" font-size="14" font-family="Segoe UI, Inter, Arial, sans-serif">${lang}</text>
          <rect x="180" y="${y}" width="440" height="14" rx="7" fill="rgba(255,255,255,0.08)" />
          <rect x="180" y="${y}" width="${width.toFixed(2)}" height="14" rx="7" fill="${color}" />
          <text x="632" y="${y + 12}" fill="#cbd5e1" font-size="12" font-family="Segoe UI, Inter, Arial, sans-serif">${pct.toFixed(1)}%</text>
        `;
      })
      .join("");

    const updated = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const svg = `
      <svg width="760" height="280" viewBox="0 0 760 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="760" y2="280" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0b1220"/>
            <stop offset="1" stop-color="#111827"/>
          </linearGradient>
          <linearGradient id="accent" x1="0" y1="0" x2="760" y2="0" gradientUnits="userSpaceOnUse">
            <stop stop-color="#38bdf8"/>
            <stop offset="1" stop-color="#8b5cf6"/>
          </linearGradient>
        </defs>

        <rect width="760" height="280" rx="24" fill="url(#bg)"/>
        <rect x="20" y="20" width="720" height="240" rx="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
        <rect x="20" y="20" width="720" height="6" rx="3" fill="url(#accent)"/>

        <text x="36" y="58" fill="#ffffff" font-size="26" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">Top Languages</text>
        <text x="36" y="78" fill="#94a3b8" font-size="13" font-family="Segoe UI, Inter, Arial, sans-serif">Summed from public repositories using GitHub language bytes</text>

        ${bars}

        <text x="36" y="246" fill="#94a3b8" font-size="12" font-family="Segoe UI, Inter, Arial, sans-serif">Updated via Vercel · ${updated} · Cache ${cacheSeconds}s</text>
      </svg>
    `.trim();

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=1200`);
    res.status(200).send(svg);
  } catch (error) {
    res.status(500).send(`Error generating top-langs SVG: ${error.message}`);
  }
}
