class CastController {
  constructor() {
    this.devices = [
      { name: 'Living Room TV', type: 'tv', status: 'connected', ip: '192.168.1.100' },
      { name: 'Bedroom Speaker', type: 'speaker', status: 'available', ip: '192.168.1.101' },
      { name: 'Kitchen Display', type: 'display', status: 'offline', ip: '192.168.1.102' },
    ];
    this.init();
  }

  init() {
    this.renderCastUI();
  }

  renderCastUI() {
    const container = document.querySelector('.casting-container');
    if (!container) return;

    container.innerHTML = this.devices.map(device => `
      <div class="cast-device ${device.status === 'connected' ? 'connected' : ''}">
        <div class="cast-device-header">
          <div class="cast-icon">🎬</div>
          <div class="cast-info">
            <h3>${device.name}</h3>
            <p class="cast-status">${device.status.toUpperCase()} • ${device.ip}</p>
          </div>
        </div>
        <div class="cast-controls">
          <button class="cast-btn">Connect</button>
          <button class="cast-btn">Settings</button>
        </div>
        ${device.status === 'connected' ? `
          <div class="media-control">
            <button class="media-btn">⏮️</button>
            <button class="media-btn">⏸️</button>
            <button class="media-btn">⏭️</button>
          </div>
        ` : ''}
      </div>
    `).join('');
  }
}

const cast = new CastController();