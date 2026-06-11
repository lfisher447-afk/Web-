class SSLManager {
  constructor() {
    this.certificates = [
      { subject: 'CN=jetty.company.com', issuer: 'Let\'s Encrypt', validUntil: '2025-04-15', daysLeft: 89, status: 'valid' },
      { subject: 'CN=backup.company.com', issuer: 'DigiCert', validUntil: '2024-11-20', daysLeft: 12, status: 'expiring' },
    ];
    this.init();
  }

  init() {
    this.renderSSLUI();
  }

  renderSSLUI() {
    const container = document.querySelector('.ssl-container');
    if (!container) return;

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        ${this.certificates.map((cert, idx) => `
          <div class="security-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 style="margin: 0;">🔐 Certificate ${idx + 1}</h3>
              <span class="threat-level-indicator threat-level-${cert.daysLeft > 30 ? 'low' : (cert.daysLeft > 7 ? 'medium' : 'critical')}">
                ${cert.daysLeft} days
              </span>
            </div>
            <p><strong>Subject:</strong> ${cert.subject}</p>
            <p><strong>Issuer:</strong> ${cert.issuer}</p>
            <p><strong>Valid Until:</strong> ${cert.validUntil}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
}

const ssl = new SSLManager();