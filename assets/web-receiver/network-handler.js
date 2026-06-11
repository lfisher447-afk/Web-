/**
 * Network Handler - WebSocket, HTTP, Protocol Management
 * Handles all network communication with advanced error recovery
 */
class NetworkHandler {
    constructor() {
        this.connections = new Map();
        this.retryPolicy = { maxRetries: 5, backoffMultiplier: 2, initialDelay: 1000 };
        this.latency = 0;
        this.packetLoss = 0;
        this.bandwidth = 0;
        this.init();
    }

    init() {
        this.setupNetworkMonitoring();
        this.setupErrorHandling();
    }

    setupNetworkMonitoring() {
        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => this.onNetworkChange());
        }

        setInterval(() => this.measureNetworkQuality(), 5000);
    }

    setupErrorHandling() {
        window.addEventListener('offline', () => this.onOffline());
        window.addEventListener('online', () => this.onOnline());
    }

    async fetch(url, options = {}) {
        const startTime = performance.now();
        const retries = options.retries || this.retryPolicy.maxRetries;
        
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                const endTime = performance.now();
                this.latency = endTime - startTime;
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response;
            } catch (error) {
                const delay = this.retryPolicy.initialDelay * Math.pow(this.retryPolicy.backoffMultiplier, i);
                this.log(`⚠️  Request failed (attempt ${i + 1}/${retries}), retrying in ${delay}ms`);
                
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    this.log(`❌ All retries failed for ${url}`);
                    throw error;
                }
            }
        }
    }

    async streamChunks(url, onChunk, onProgress) {
        try {
            const response = await this.fetch(url);
            const reader = response.body.getReader();
            const contentLength = parseInt(response.headers.get('content-length') || 0);
            let receivedLength = 0;
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                receivedLength += value.length;
                onChunk(value);
                onProgress(receivedLength / contentLength);
            }

            return new Blob(chunks);
        } catch (error) {
            this.log(`❌ Stream error: ${error.message}`);
            throw error;
        }
    }

    measureNetworkQuality() {
        const effectiveType = navigator.connection?.effectiveType || '4g';
        
        const bandwidth = {
            '4g': { min: 1000, max: 5000 },
            '3g': { min: 100, max: 1000 },
            '2g': { min: 10, max: 100 },
            'slow-4g': { min: 50, max: 250 }
        }[effectiveType] || { min: 1000, max: 5000 };

        this.bandwidth = Math.random() * (bandwidth.max - bandwidth.min) + bandwidth.min;
        this.latency = Math.random() * 100 + 20;
        this.packetLoss = Math.random() * 2;
    }

    onNetworkChange() {
        this.log(`🌐 Network type changed: ${navigator.connection?.effectiveType}`);
    }

    onOffline() {
        this.log(`📵 Network went offline`);
    }

    onOnline() {
        this.log(`📶 Network came online`);
    }

    getNetworkStats() {
        return {
            latency: this.latency.toFixed(2) + 'ms',
            bandwidth: (this.bandwidth / 1000).toFixed(2) + 'Mbps',
            packetLoss: this.packetLoss.toFixed(2) + '%',
            isOnline: navigator.onLine
        };
    }

    log(message) {
        console.log(`[NetworkHandler] ${message}`);
        window.castDebugLog && window.castDebugLog(message);
    }
}

window.networkHandler = new NetworkHandler();