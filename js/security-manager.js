class SecurityManager {
  constructor() {
    this.blocklist = [
      { ip: '192.168.1.100', threats: 15, status: 'blocked' },
      { ip: '10.0.0.50', threats: 8, status: 'blocked' },
    ];
    this.whitelist = [
      { ip: '203.0.113.0/24', status: 'active' },
      { ip: '198.51.100.0/24', status: 'active' },
    ];
    this.init();
  }

  init() {
    this.renderSecurityUI();
  }

  renderSecurityUI() {
    const container = document.querySelector('.security-container');
    if (!container) return;

    container.innerHTML = `
      <div class="security-card">
        <h3>🛡️ DoS Protection</h3>
        <div class="security-status">
          <p><strong>Status:</strong> <span style="color: #10b981;">Active</span></p>
          <p><strong>Throttled:</strong> 142 requests</p>
          <p><strong>Rejected:</strong> 34 requests</p>
        </div>
      </div>
      <div class="security-card">
        <h3>🚫 Blocklist (${this.blocklist.length})</h3>
        <div class="ip-list-container">
          ${this.blocklist.map(entry => `
            <div class="ip-entry">
              <span>${entry.ip}</span>
              <span class="threat-level-indicator threat-level-${entry.threats > 10 ? 'critical' : 'high'}">${entry.threats} threats</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="security-card">
        <h3>✅ Whitelist (${this.whitelist.length})</h3>
        <div class="ip-list-container">
          ${this.whitelist.map(entry => `
            <div class="ip-entry">
              <span>${entry.ip}</span>
              <span style="color: #10b981;">Allowed</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

const security = new SecurityManager();