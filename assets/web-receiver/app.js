/**
 * Main Application - Orchestrates all receiver components
 */
class WebReceiverApp {
    constructor() {
        this.cast = window.castFramework;
        this.media = window.mediaEngine;
        this.network = window.networkHandler;
        this.perf = window.performanceMonitor;
        this.debugLogs = [];
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Web Receiver Application');
        
        this.setupUI();
        this.setupEventHandlers();
        this.setupDebugConsole();
        this.startStatusUpdater();
        
        // Setup Cast protocol handlers
        this.setupCastHandlers();
    }

    setupUI() {
        document.getElementById('btn-play').addEventListener('click', () => this.handlePlay());
        document.getElementById('btn-pause').addEventListener('click', () => this.handlePause());
        document.getElementById('btn-stop').addEventListener('click', () => this.handleStop());
        document.getElementById('btn-fullscreen').addEventListener('click', () => this.handleFullscreen());
        document.getElementById('volume-slider').addEventListener('input', (e) => this.handleVolumeChange(e));
    }

    setupEventHandlers() {
        this.cast.on('LOAD_MEDIA', (data) => this.media.loadMedia(data));
        this.cast.on('PLAY', () => this.media.videoElement.play());
        this.cast.on('PAUSE', () => this.media.videoElement.pause());
        this.cast.on('STOP', () => this.handleStop());
    }

    setupCastHandlers() {
        window.addEventListener('message', (event) => {
            if (event.data.type === 'CAST_MESSAGE') {
                this.cast.handleMessage(event.data.payload);
            }
        });
    }

    handlePlay() {
        this.media.videoElement.play();
        this.log('▶️  Play');
    }

    handlePause() {
        this.media.videoElement.pause();
        this.log('⏸️  Pause');
    }

    handleStop() {
        this.media.videoElement.pause();
        this.media.videoElement.src = '';
        this.log('⏹️  Stop');
    }

    handleFullscreen() {
        if (this.media.videoElement.requestFullscreen) {
            this.media.videoElement.requestFullscreen();
            this.log('⛶ Fullscreen');
        }
    }

    handleVolumeChange(event) {
        const volume = event.target.value;
        this.media.videoElement.volume = volume / 100;
        document.getElementById('volume-value').textContent = volume;
        this.cast.setVolume(volume);
    }

    setupDebugConsole() {
        window.castDebugLog = (message) => this.log(message);
        
        document.getElementById('debug-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeDebugCommand(e.target.value);
                e.target.value = '';
            }
        });
    }

    executeDebugCommand(command) {
        try {
            const result = eval(command);
            this.log(`> ${command}\n< ${JSON.stringify(result, null, 2)}`);
        } catch (error) {
            this.log(`❌ Error: ${error.message}`);
        }
    }

    startStatusUpdater() {
        setInterval(() => {
            const latency = this.network.latency.toFixed(0);
            document.getElementById('latency-meter').textContent = latency + 'ms';
            
            const status = this.media.videoElement.paused ? 'Paused' : 'Playing';
            document.getElementById('media-status').textContent = status;
        }, 1000);
    }

    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        this.debugLogs.push(logEntry);
        
        const debugLog = document.getElementById('debug-log');
        debugLog.textContent = this.debugLogs.slice(-10).join('\n');
        debugLog.scrollTop = debugLog.scrollHeight;
    }
}

// Start application
window.app = new WebReceiverApp();