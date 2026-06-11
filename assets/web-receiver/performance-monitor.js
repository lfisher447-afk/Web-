/**
 * Performance Monitor - FPS, Memory, CPU tracking
 */
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.fps = 0;
        this.lastFrameTime = performance.now();
        this.memory = {};
        this.metrics = [];
        this.init();
    }

    init() {
        this.startFPSCounter();
        this.startMemoryMonitor();
    }

    startFPSCounter() {
        const updateFPS = () => {
            const now = performance.now();
            const deltaTime = now - this.lastFrameTime;
            
            if (deltaTime >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / deltaTime);
                this.frameCount = 0;
                this.lastFrameTime = now;
                document.getElementById('fps-counter').textContent = this.fps;
            }
            
            this.frameCount++;
            requestAnimationFrame(updateFPS);
        };
        requestAnimationFrame(updateFPS);
    }

    startMemoryMonitor() {
        setInterval(() => {
            if (performance.memory) {
                this.memory = {
                    usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
                    totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
                    jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)
                };
            }
        }, 1000);
    }

    recordMetric(name, value) {
        this.metrics.push({ name, value, timestamp: Date.now() });
    }

    getReport() {
        return {
            fps: this.fps,
            memory: this.memory,
            metrics: this.metrics
        };
    }
}

window.performanceMonitor = new PerformanceMonitor();