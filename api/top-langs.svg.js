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

    // Sumamos tamaño por lenguaje principal de cada repo (aproximación rápida y estable)
    const byLang = {};
    for (const r of repos) {
      if (r.fork) continue; // opcional: ignorar forks
      const lang = r.language || "Other";
      const size = typeof r.size === "number" ? r.size : 0; // KB aproximados
      byLang[lang] = (byLang[lang] || 0) + size;
    }

    const entries = Object.entries(byLang)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);

    const top = entries.slice(0, 5);
    const total = top.reduce((acc, [, v]) => acc + v, 0) || 1;

    const palette = ["#38bdf8", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444"];

    const bars = top
      .map(([lang, val], i) => {
        const pct = ((val / total) * 100);
        const barW = Math.max(8, (pct / 100) * 440);
        const y = 80 + i * 34;
        const color = palette[i % palette.length];
        return `
          <text x="36" y="${y + 14}" fill="#e2e8f0" font-size="14" font-family="Segoe UI, Inter, Arial, sans-serif">${lang}</text>
          <rect x="170" y="${y}" width="440" height="16" rx="8" fill="rgba(255,255,255,0.08)" />
          <rect x="170" y="${y}" width="${barW.toFixed(2)}" height="16" rx="8" fill="${color}" />
          <text x="620" y="${y + 14}" fill="#cbd5e1" font-size="13" font-family="Segoe UI, Inter, Arial, sans-serif">${pct.toFixed(1)}%</text>
        `;
      })
      .join("");

    const legend = top
      .map(([lang, val], i) => {
        const pct = ((val / total) * 100).toFixed(1);
        const x = 36 + (i % 3) * 230;
        const y = 230 + Math.floor(i / 3) * 20;
        const color = palette[i % palette.length];
        return `
          <circle cx="${x}" cy="${y - 4}" r="5" fill="${color}" />
          <text x="${x + 12}" y="${y}" fill="#94a3b8" font-size="12" font-family="Segoe UI, Inter, Arial, sans-serif">${lang} · ${pct}%</text>
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
          <linearGradient id="bg2" x1="0" y1="0" x2="760" y2="280" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0b1220"/>
            <stop offset="1" stop-color="#111827"/>
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="760" height="280" rx="24" fill="url(#bg2)"/>
        <rect x="20" y="20" width="720" height="240" rx="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>

        <text x="36" y="54" fill="#ffffff" font-size="26" font-family="Segoe UI, Inter, Arial, sans-serif" font-weight="700">Top Languages</text>
        <text x="36" y="74" fill="#94a3b8" font-size="13" font-family="Segoe UI, Inter, Arial, sans-serif">Based on public repositories (size-weighted approximation)</text>

        ${bars}
        ${legend}

        <text x="520" y="252" fill="#94a3b8" font-size="12" font-family="Segoe UI, Inter, Arial, sans-serif">Updated via Vercel · ${updated} · Cache ${cacheSeconds}s</text>
      </svg>
    `.trim();

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader(
      "Cache-Control",
      `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=1200`
    );
    res.status(200).send(svg);
  } catch (error) {
    res.status(500).send(`Error generating top-langs SVG: ${error.message}`);
  }
}
