export default async function handler(req, res) {
    const { GITHUB_TOKEN } = process.env;
    const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};
    const cacheDuration = 60 * 5; // Cache for 5 minutes
    const response = await fetch(`https://api.github.com/users/P-P-programer`, { headers });
    const data = await response.json();

    if (response.ok) {
        res.setHeader('Cache-Control', `public, max-age=${cacheDuration}`);
        res.status(200).json({
            login: data.login,
            name: data.name,
            avatar_url: data.avatar_url,
            followers: data.followers,
            following: data.following,
            public_repos: data.public_repos,
            public_gists: data.public_gists,
            updated_at: data.updated_at
        });
    } else {
        res.status(response.status).json({ message: data.message });
    }
}