// Terminal Portfolio - jpdck
// Theme management, repo rendering, and easter egg commands

document.addEventListener('DOMContentLoaded', () => {
  const asciiArt = document.querySelector('.ascii-art');
  const reposContainer = document.getElementById('repos-container');
  const commandInput = document.getElementById('command-input');
  const themeButtons = document.querySelectorAll('.theme-toggle button');
  const root = document.documentElement;

  // ASCII art banner
  const banner = `
     _           _      _
    (_)_ __   __| | ___| | __
    | | '_ \\ / _\` |/ __| |/ /
    | | |_) | (_| | (__|   <
   _/ | .__/ \\__,_|\\___|_|\\_\\
  |__/|_|
  `;

  asciiArt.textContent = banner;

  // Theme Management
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('preferred-theme', theme);

    themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('preferred-theme') || 'dark';
    setTheme(savedTheme);
  }

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.theme);
    });
  });

  // Load and render repos from JSON
  let lastRepoData = null;
  async function loadRepos() {
    try {
      const response = await fetch('repos.json?t=' + Date.now());
      if (!response.ok) {
        throw new Error(`Failed to load repos: ${response.status}`);
      }
      const data = await response.json();
      const dataStr = JSON.stringify(data);

      // Only re-render if data actually changed
      if (dataStr !== lastRepoData) {
        lastRepoData = dataStr;
        renderRepos(data);
      }
    } catch (error) {
      console.error('Error loading repos:', error);
      reposContainer.innerHTML = '<p class="error">Failed to load projects. Check repos.json</p>';
    }
  }

  // Poll for changes every 2 seconds (only in dev)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setInterval(loadRepos, 2000);
  }

  function renderRepos(data) {
    reposContainer.innerHTML = '';

    // Render featured repos
    if (data.featured && data.featured.length > 0) {
      const featuredTitle = document.createElement('div');
      featuredTitle.innerHTML = '<strong style="color: var(--pink);">Featured Projects:</strong>';
      reposContainer.appendChild(featuredTitle);

      data.featured.forEach(repo => {
        reposContainer.appendChild(createRepoElement(repo));
      });
    }

    // Render interesting repos
    if (data.interesting && data.interesting.length > 0) {
      const interestingTitle = document.createElement('div');
      interestingTitle.innerHTML = '<strong style="color: var(--cyan); margin-top: 20px; display: block;">Other Interesting Projects:</strong>';
      reposContainer.appendChild(interestingTitle);

      data.interesting.forEach(repo => {
        reposContainer.appendChild(createRepoElement(repo));
      });
    }

    if (!data.featured?.length && !data.interesting?.length) {
      reposContainer.innerHTML = '<p>No projects configured. Edit repos.json to add some.</p>';
    }
  }

  function createRepoElement(repo) {
    const item = document.createElement('div');
    item.className = `repo-item${repo.highlight ? ' highlight' : ''}`;

    const name = document.createElement('div');
    name.className = 'repo-name';
    name.innerHTML = `<a href="${repo.url}" target="_blank" rel="noopener noreferrer">${repo.name}</a>`;
    item.appendChild(name);

    const description = document.createElement('div');
    description.className = 'repo-description';
    description.textContent = repo.description || 'No description provided.';
    item.appendChild(description);

    if (repo.tags && repo.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'repo-tags';
      repo.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag';
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
      });
      item.appendChild(tagsContainer);
    }

    return item;
  }

  // Easter Egg Command System
  const commands = {
    'help': () => {
      return `Available commands:
  help       - Show this help message
  clear      - Clear command history
  whoami     - About me
  contact    - Get in touch
  konami     - ???
  matrix     - Enter the matrix
  hack       - Hacker mode activated

Try typing anything to discover more...`;
    },

    'clear': () => {
      const output = document.querySelector('.output');
      const inputLine = document.querySelector('.input-line');
      output.innerHTML = '';
      output.appendChild(inputLine);
      return null;
    },

    'whoami': () => {
      return `jpdck - Developer, tinkerer, homelab enthusiast.
Building things one commit at a time.`;
    },

    'contact': () => {
      return `> GitHub: https://github.com/jpdck
> Feel free to reach out via GitHub issues or discussions.`;
    },

    'konami': () => {
      return `↑ ↑ ↓ ↓ ← → ← → B A
You've unlocked... absolutely nothing. But nice try!`;
    },

    'matrix': () => {
      const chars = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789';
      let output = '';
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 40; j++) {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
        output += '\n';
      }
      return output + '\nWake up, Neo...';
    },

    'hack': () => {
      return `> Accessing mainframe...
> Bypassing firewall...
> Downloading the internet...
> [################] 100%

Just kidding. I'm a developer, not a movie hacker.`;
    },

    'ls': () => {
      return `projects/    easter-eggs/    README.md`;
    },

    'cat': () => {
      return `Usage: cat [file]
Try: cat README.md`;
    },

    'cat readme.md': () => {
      return `# jpdck's Portfolio

Welcome to my corner of the internet.
Check out my projects above, or type 'help' for fun commands.`;
    },

    'pwd': () => {
      return `/home/jpdck/github.io`;
    },

    'sudo': () => {
      return `Nice try. You're not getting root access to my portfolio.`;
    },

    'exit': () => {
      return `You can't exit. You're here forever. Muahaha!
(Just close the tab if you really want to leave.)`;
    },

    'date': () => {
      return new Date().toString();
    },

    'echo': (args) => {
      return args.join(' ') || '';
    }
  };

  function executeCommand(input) {
    const [cmd, ...args] = input.toLowerCase().trim().split(/\s+/);

    if (commands[input.toLowerCase()]) {
      return commands[input.toLowerCase()](args);
    } else if (commands[cmd]) {
      return commands[cmd](args);
    } else if (input.trim()) {
      return `Command not found: ${cmd}
Type 'help' for available commands.`;
    }
    return null;
  }

  function addCommandToHistory(command, output) {
    const outputDiv = document.querySelector('.output');
    const inputLine = document.querySelector('.input-line');

    // Add command line
    const commandLine = document.createElement('div');
    commandLine.className = 'prompt-line';
    commandLine.innerHTML = `<span class="prompt">&gt;</span> <span style="color: var(--fg);">${escapeHtml(command)}</span>`;
    outputDiv.insertBefore(commandLine, inputLine);

    // Add output if exists
    if (output) {
      const outputBlock = document.createElement('div');
      outputBlock.className = 'command-output';
      outputBlock.textContent = output;
      outputDiv.insertBefore(outputBlock, inputLine);
    }

    // Scroll to bottom
    outputDiv.parentElement.scrollTop = outputDiv.parentElement.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = commandInput.value;
      const output = executeCommand(command);

      if (output !== null) {
        addCommandToHistory(command, output);
      }

      commandInput.value = '';
    }
  });

  // Initialize
  initTheme();
  loadRepos();
});
