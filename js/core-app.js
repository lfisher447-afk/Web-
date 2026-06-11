class JettyCommandCenter {
  constructor() {
    this.currentSection = 'dashboard';
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.init();
  }

  init() {
    this.setupTheme();
    this.setupNavigation();
    this.setupSearch();
    this.setupUserMenu();
    this.setupCommandPalette();
    this.setupLiveUpdates();
  }

  setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }
    
    themeToggle?.addEventListener('click', () => {
      this.isDarkMode = !this.isDarkMode;
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', this.isDarkMode);
    });
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        
        navLinks.forEach(l => l.classList.remove('active'));
        contentSections.forEach(s => s.classList.remove('active'));
        
        link.classList.add('active');
        const section = document.getElementById(sectionId);
        if (section) {
          section.classList.add('active');
          this.currentSection = sectionId;
          document.getElementById('breadcrumb').textContent = link.textContent.trim();
        }
      });
    });
  }

  setupSearch() {
    const searchBox = document.getElementById('searchBox');
    searchBox?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      // Search implementation
      console.log('Search:', query);
    });
  }

  setupUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    userMenuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown?.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      userDropdown?.classList.remove('active');
    });
  }

  setupCommandPalette() {
    const cmdBtn = document.getElementById('commandPaletteBtn');
    const cmdModal = document.getElementById('commandPaletteModal');
    const cmdInput = document.getElementById('commandInput');

    const commands = [
      { name: 'Dashboard', action: () => this.switchSection('dashboard'), icon: '📊' },
      { name: 'Metrics', action: () => this.switchSection('metrics'), icon: '📈' },
      { name: 'Security', action: () => this.switchSection('security'), icon: '🔒' },
      { name: 'SSL/TLS', action: () => this.switchSection('ssl'), icon: '🔐' },
      { name: 'Casting', action: () => this.switchSection('casting'), icon: '📡' },
    ];

    cmdBtn?.addEventListener('click', () => cmdModal?.classList.add('active'));
    
    cmdModal?.addEventListener('click', (e) => {
      if (e.target === cmdModal) cmdModal.classList.remove('active');
    });

    cmdInput?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const results = document.getElementById('commandResults');
      if (!results) return;
      
      const filtered = commands.filter(cmd => cmd.name.toLowerCase().includes(query));
      results.innerHTML = filtered.map(cmd => 
        `<li onclick="app.executeCommand(() => { ${cmd.action.toString()}; })">${cmd.icon} ${cmd.name}</li>`
      ).join('');
    });
  }

  switchSection(sectionId) {
    const link = document.querySelector(`[data-section="${sectionId}"]`);
    if (link) link.click();
  }

  executeCommand(action) {
    action();
    document.getElementById('commandPaletteModal')?.classList.remove('active');
  }

  setupLiveUpdates() {
    setInterval(() => {
      this.updateMetrics();
    }, 5000);
  }

  updateMetrics() {
    // Simulate live metric updates
    const threads = document.querySelector('[data-metric="threads"]');
    if (threads) {
      const current = Math.floor(Math.random() * 200) + 300;
      threads.textContent = current;
    }
  }
}

const app = new JettyCommandCenter();