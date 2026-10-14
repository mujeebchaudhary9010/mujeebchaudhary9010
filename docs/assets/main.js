const typeText = document.getElementById('typewriter');
const phrases = [
  "Full-stack developer",
  "Game developer",
  "Interactive UI builder",
  "Creative problem solver"
];

let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function tickType() {
  const current = phrases[phraseIndex];
  if (!deleting) {
    typeText.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(tickType, 1200);
      return;
    }
  } else {
    typeText.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }

  const speed = deleting ? 35 : 90;
  setTimeout(tickType, speed);
}

tickType();

async function loadProjects() {
  const projectsEl = document.getElementById('projects');

  try {
    const response = await fetch('https://api.github.com/users/mujeebchaudhary9010/repos?sort=updated&per_page=20');
    const repos = await response.json();

    if (!Array.isArray(repos)) throw new Error('Invalid repository response');

    const featured = repos
      .filter((repo) => !repo.fork && repo.name !== 'mujeebchaudhary9010')
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 4);

    projectsEl.innerHTML = featured.map(repo => `
      <article class="project-card">
        <h3>${repo.name}</h3>
        <p>${repo.description || 'No description yet.'}</p>
        <a class="project-link" href="${repo.html_url}" target="_blank" rel="noreferrer">View repo →</a>
      </article>
    `).join('');
  } catch (error) {
    projectsEl.innerHTML = `
      <article class="project-card">
        <h3>Project data unavailable</h3>
        <p>GitHub API request failed. Please try again later.</p>
      </article>
    `;
  }
}

loadProjects();
