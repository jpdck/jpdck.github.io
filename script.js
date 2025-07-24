// script.js
// Fetch GitHub repositories for user jpdck and render them dynamically.

document.addEventListener('DOMContentLoaded', () => {
  const reposContainer = document.getElementById('repos');
  const languageFiltersContainer = document.getElementById('language-filters');
  const searchInput = document.getElementById('search');
  const yearSpan = document.getElementById('year');
  yearSpan.textContent = new Date().getFullYear().toString();

  let reposData = [];
  let currentLanguage = 'all';

  /**
   * Fetch public repositories for the given GitHub user.
   * This uses the GitHub REST API, which supports CORS for public requests.
   */
  async function fetchRepos() {
    try {
      const response = await fetch('https://api.github.com/users/jpdck/repos?per_page=100');
      if (!response.ok) {
        throw new Error(`GitHub API responded with status ${response.status}`);
      }
      const data = await response.json();
      // sort repositories by last update descending
      reposData = data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      generateLanguageFilters();
      renderRepos();
    } catch (error) {
      console.error('Error fetching repositories:', error);
      reposContainer.innerHTML = '<p>Failed to load repositories. Please try again later.</p>';
    }
  }

  /**
   * Generate unique language filter buttons based on the repository data.
   * Creates a button for each language and attaches an event listener.
   */
  function generateLanguageFilters() {
    const languages = new Set();
    reposData.forEach((repo) => {
      if (repo.language) {
        languages.add(repo.language);
      }
    });
    languages.forEach((lang) => {
      const btn = document.createElement('button');
      btn.classList.add('filter-button');
      btn.dataset.filter = lang;
      btn.textContent = lang;
      languageFiltersContainer.appendChild(btn);
      btn.addEventListener('click', () => {
        // remove active class from all filter buttons
        document.querySelectorAll('.filter-button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentLanguage = lang;
        searchInput.value = '';
        renderRepos();
      });
    });
  }

  /**
   * Filter repositories based on currently selected language and search text.
   * @returns {Array} filtered repository objects
   */
  function filterRepos() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    return reposData.filter((repo) => {
      const matchesLang = currentLanguage === 'all' || repo.language === currentLanguage;
      const name = repo.name.toLowerCase();
      const desc = (repo.description || '').toLowerCase();
      const matchesSearch = name.includes(searchTerm) || desc.includes(searchTerm);
      return matchesLang && matchesSearch;
    });
  }

  /**
   * Render repository cards to the DOM based on filtered data.
   */
  function renderRepos() {
    reposContainer.innerHTML = '';
    const filtered = filterRepos();
    if (filtered.length === 0) {
      reposContainer.innerHTML = '<p>No repositories match your criteria.</p>';
      return;
    }
    filtered.forEach((repo) => {
      const card = document.createElement('div');
      card.className = 'repo-card';
      // Title
      const titleDiv = document.createElement('div');
      titleDiv.className = 'repo-title';
      titleDiv.innerHTML = `<a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a>`;
      card.appendChild(titleDiv);
      // Description
      const descP = document.createElement('p');
      descP.className = 'repo-description';
      descP.textContent = repo.description || 'No description provided.';
      card.appendChild(descP);
      // Metadata section
      const metaDiv = document.createElement('div');
      metaDiv.className = 'repo-meta';
      // language tag
      if (repo.language) {
        const langSpan = document.createElement('span');
        langSpan.className = 'tag';
        langSpan.textContent = repo.language;
        metaDiv.appendChild(langSpan);
      }
      // star badge
      const starSpan = document.createElement('span');
      starSpan.className = 'badge';
      starSpan.innerHTML = `${starIcon()} ${repo.stargazers_count}`;
      metaDiv.appendChild(starSpan);
      // watchers badge
      const watchSpan = document.createElement('span');
      watchSpan.className = 'badge';
      watchSpan.innerHTML = `${eyeIcon()} ${repo.watchers_count}`;
      metaDiv.appendChild(watchSpan);
      card.appendChild(metaDiv);
      reposContainer.appendChild(card);
    });
  }

  /**
   * Returns inline SVG markup for a star icon.
   */
  function starIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17.27L18.18 21l-1.63-6.99L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.45 4.77L5.82 21z"></path></svg>';
  }
  /**
   * Returns inline SVG markup for an eye icon.
   */
  function eyeIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5c-7.28 0-11 7.5-11 7.5s3.72 7.5 11 7.5 11-7.5 11-7.5-3.72-7.5-11-7.5zm0 13c-3.02 0-5.5-2.48-5.5-5.5s2.48-5.5 5.5-5.5 5.5 2.48 5.5 5.5-2.48 5.5-5.5 5.5zm0-9c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5z"></path></svg>';
  }

  // Attach search listener
  searchInput.addEventListener('input', () => {
    // Keep the active state for the current language filter
    document.querySelectorAll('.filter-button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === currentLanguage);
    });
    renderRepos();
  });

  // Attach event listener for the static "All" filter button
  const allButton = document.querySelector('.filter-button[data-filter="all"]');
  if (allButton) {
    allButton.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-button').forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');
      currentLanguage = 'all';
      searchInput.value = '';
      renderRepos();
    });
  }

  // Kick off fetch
  fetchRepos();
});