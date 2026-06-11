class ThemeSystem {
  constructor() {
    this.loadTheme();
    this.setupThemeToggle();
  }

  loadTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
      document.body.classList.add('dark-mode');
    }
  }

  setupThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
      });
    }
  }
}

new ThemeSystem();