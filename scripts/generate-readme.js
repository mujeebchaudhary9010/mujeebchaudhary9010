const fs = require('fs');
const https = require('https');

const USER = 'mujeebchaudhary9010';
const README_PATH = 'README.md';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Authorization: process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

(async () => {
  try {
    const repos = await fetchJson(`https://api.github.com/users/${USER}/repos?per_page=100`);
    const featured = repos
      .filter(repo => !repo.fork && repo.name !== 'mujeebchaudhary9010')
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 4);

    const featuredMarkdown = featured.map(repo => {
      const description = repo.description ? repo.description.replace(/\n/g, ' ') : 'No description available.';
      return `- [${repo.name}](${repo.html_url}) — ${description}`;
    }).join('\n');

    const skills = [...new Set(
      repos
        .map(repo => repo.language)
        .filter(Boolean)
    )].slice(0, 8);

    const skillsMarkdown = skills.map(skill => `- ${skill}`).join('\n');

    let readme = fs.readFileSync(README_PATH, 'utf8');
    readme = readme.replace(/<!-- SKILLS_START -->[\s\S]*<!-- SKILLS_END -->/, `<!-- SKILLS_START -->\n${skillsMarkdown}\n<!-- SKILLS_END -->`);
    readme = readme.replace(/<!-- PROJECTS_START -->[\s\S]*<!-- PROJECTS_END -->/, `<!-- PROJECTS_START -->\n${featuredMarkdown}\n<!-- PROJECTS_END -->`);
    fs.writeFileSync(README_PATH, readme);

    console.log('README updated successfully.');
  } catch (err) {
    console.error('Failed to update README:', err);
    process.exit(1);
  }
})();
