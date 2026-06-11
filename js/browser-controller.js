class BrowserController {
  constructor() {
    this.browserSessions = [
      { name: 'Chrome - Tab 1', url: 'https://localhost:8080', uptime: '2h 34m' },
      { name: 'Firefox - Tab 2', url: 'https://admin.jetty.local', uptime: '1h 12m' },
    ];
    this.init();
  }

  init() {
    this.renderBrowserUI();
  }

  renderBrowserUI() {
    const container = document.querySelector('.browser-container');
    if (!container) return;

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <div class="security-card glass-container">
          <h3>🌐 Active Sessions</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${this.browserSessions.map(session => `
              <li style="padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; margin-bottom: 0.5rem;">
                <strong>${session.name}</strong><br>
                <small>${session.url}</small><br>
                <small style="color: #94a3b8;">Uptime: ${session.uptime}</small>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }
}

const browser = new BrowserController();