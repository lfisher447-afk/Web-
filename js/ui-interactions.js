// Handle notification bell
const notificationBtn = document.getElementById('notificationBtn');
if (notificationBtn) {
  notificationBtn.addEventListener('click', () => {
    console.log('Notifications clicked');
  });
}

// Handle settings button
const settingsBtn = document.getElementById('settingsBtn');
if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    console.log('Settings clicked');
  });
}

// Auto-update metrics
setInterval(() => {
  if (dashboard) dashboard.updateCharts();
}, 5000);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    document.getElementById('commandPaletteModal')?.classList.add('active');
  }
});