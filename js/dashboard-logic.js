class DashboardManager {
  constructor() {
    this.charts = {};
    this.initCharts();
  }

  initCharts() {
    const latencyCtx = document.getElementById('latencyChart')?.getContext('2d');
    if (latencyCtx) {
      this.charts.latency = new Chart(latencyCtx, {
        type: 'line',
        data: {
          labels: ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30'],
          datasets: [{
            label: 'P95 Latency (ms)',
            data: [45, 52, 48, 61, 58, 55, 62],
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            tension: 0.4,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: getComputedStyle(document.body).color }
            },
            x: {
              ticks: { color: getComputedStyle(document.body).color }
            }
          }
        }
      });
    }

    const throughputCtx = document.getElementById('throughputChart')?.getContext('2d');
    if (throughputCtx) {
      this.charts.throughput = new Chart(throughputCtx, {
        type: 'bar',
        data: {
          labels: ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30'],
          datasets: [{
            label: 'Requests/sec',
            data: [2400, 2210, 2290, 2000, 2181, 2500, 2100],
            backgroundColor: ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#7c3aed', '#0ea5e9'],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: getComputedStyle(document.body).color }
            },
            x: {
              ticks: { color: getComputedStyle(document.body).color }
            }
          }
        }
      });
    }
  }

  updateCharts() {
    if (this.charts.latency) {
      this.charts.latency.data.datasets[0].data = [
        Math.floor(Math.random() * 50) + 40,
        Math.floor(Math.random() * 50) + 40,
        Math.floor(Math.random() * 50) + 40,
        Math.floor(Math.random() * 50) + 40,
        Math.floor(Math.random() * 50) + 40,
        Math.floor(Math.random() * 50) + 40,
        Math.floor(Math.random() * 50) + 40,
      ];
      this.charts.latency.update('none');
    }
  }
}

const dashboard = new DashboardManager();