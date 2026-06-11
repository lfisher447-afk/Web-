// Advanced WebGL2 Rendering Engine
// Features: Shader compilation, pipeline management, buffer pooling, texture atlasing
// Copyright 2025 - Advanced Graphics Pipeline

class ShaderCompiler {
    constructor(gl) {
        this.gl = gl;
        this.shaderCache = new Map();
        this.programCache = new Map();
        this.activeProgram = null;
    }

    compileShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const error = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error(`Shader compilation error: ${error}`);
        }
        return shader;
    }

    createProgram(vertexSource, fragmentSource, name = '') {
        const cacheKey = `${name}:${vertexSource.length}:${fragmentSource.length}`;
        if (this.programCache.has(cacheKey)) {
            return this.programCache.get(cacheKey);
        }

        const vertShader = this.compileShader(vertexSource, this.gl.VERTEX_SHADER);
        const fragShader = this.compileShader(fragmentSource, this.gl.FRAGMENT_SHADER);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertShader);
        this.gl.attachShader(program, fragShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const error = this.gl.getProgramInfoLog(program);
            this.gl.deleteProgram(program);
            throw new Error(`Program linking error: ${error}`);
        }

        this.gl.deleteShader(vertShader);
        this.gl.deleteShader(fragShader);

        this.programCache.set(cacheKey, program);
        return program;
    }

    useProgram(program) {
        if (this.activeProgram !== program) {
            this.gl.useProgram(program);
            this.activeProgram = program;
        }
    }
}

class BufferManager {
    constructor(gl) {
        this.gl = gl;
        this.buffers = new Map();
        this.vaos = new Map();
        this.pooledBuffers = [];
    }

    createBuffer(data, target = this.gl.ARRAY_BUFFER, usage = this.gl.STATIC_DRAW) {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(target, buffer);
        this.gl.bufferData(target, data, usage);
        return buffer;
    }

    createVAO(layout) {
        const vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
        
        let offset = 0;
        for (const attr of layout) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attr.buffer);
            this.gl.vertexAttribPointer(attr.location, attr.size, attr.type, false, attr.stride, offset);
            this.gl.enableVertexAttribArray(attr.location);
            offset += attr.size * (attr.type === this.gl.FLOAT ? 4 : 2);
        }
        
        return vao;
    }

    poolBuffer() {
        if (this.pooledBuffers.length > 0) {
            return this.pooledBuffers.pop();
        }
        return this.gl.createBuffer();
    }

    releaseBuffer(buffer) {
        this.pooledBuffers.push(buffer);
    }
}

class TextureManager {
    constructor(gl) {
        this.gl = gl;
        this.textures = new Map();
        this.atlases = [];
    }

    createTexture(data, width, height, format = this.gl.RGBA, type = this.gl.UNSIGNED_BYTE) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, format, width, height, 0, format, type, data);

        // Set filtering and wrapping
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        // Generate mipmaps
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

        return texture;
    }

    createCubemap(faces) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);

        const targets = [
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        for (let i = 0; i < 6; i++) {
            this.gl.texImage2D(targets[i], 0, this.gl.RGBA, faces[i].width, faces[i].height, 0,
                this.gl.RGBA, this.gl.UNSIGNED_BYTE, faces[i].data);
        }

        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        return texture;
    }

    createTextureAtlas(images, atlasDimension = 2048) {
        // Pack multiple textures into single atlas for better performance
        const canvas = document.createElement('canvas');
        canvas.width = atlasDimension;
        canvas.height = atlasDimension;
        const ctx = canvas.getContext('2d');

        let x = 0, y = 0, maxHeight = 0;
        const uvMap = new Map();

        for (const img of images) {
            if (x + img.width > atlasDimension) {
                x = 0;
                y += maxHeight;
                maxHeight = 0;
            }

            ctx.drawImage(img, x, y);
            uvMap.set(img.id, {
                x: x / atlasDimension,
                y: y / atlasDimension,
                width: img.width / atlasDimension,
                height: img.height / atlasDimension
            });

            x += img.width;
            maxHeight = Math.max(maxHeight, img.height);
        }

        const imageData = ctx.getImageData(0, 0, atlasDimension, atlasDimension);
        const texture = this.createTexture(imageData.data, atlasDimension, atlasDimension);

        this.atlases.push({ texture, uvMap });
        return { texture, uvMap };
    }
}

class FramebufferManager {
    constructor(gl) {
        this.gl = gl;
        this.framebuffers = new Map();
    }

    createFramebuffer(width, height, attachments = ['color']) {
        const fb = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb);

        const textures = {};
        let colorIndex = 0;

        for (const attachment of attachments) {
            if (attachment === 'color') {
                const texture = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0,
                    this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

                this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, 
                    this.gl.COLOR_ATTACHMENT0 + colorIndex, 
                    this.gl.TEXTURE_2D, texture, 0);

                textures[`color${colorIndex}`] = texture;
                colorIndex++;
            } else if (attachment === 'depth') {
                const depthTexture = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, depthTexture);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT24, width, height, 0,
                    this.gl.DEPTH_COMPONENT, this.gl.UNSIGNED_INT, null);

                this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT,
                    this.gl.TEXTURE_2D, depthTexture, 0);

                textures.depth = depthTexture;
            }
        }

        if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
            console.error('Framebuffer incomplete');
        }

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        return { fb, textures };
    }
}

class RenderPipeline {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2', {
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: true
        });

        this.shaderCompiler = new ShaderCompiler(this.gl);
        this.bufferManager = new BufferManager(this.gl);
        this.textureManager = new TextureManager(this.gl);
        this.framebufferManager = new FramebufferManager(this.gl);

        this.renderQueue = [];
        this.renderTargets = new Map();
    }

    setupViewport(width, height) {
        this.gl.viewport(0, 0, width, height);
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
    }

    queueRender(mesh, material, transform) {
        this.renderQueue.push({ mesh, material, transform });
    }

    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for (const item of this.renderQueue) {
            this.renderItem(item);
        }

        this.renderQueue = [];
    }

    renderItem(item) {
        const { mesh, material, transform } = item;

        this.shaderCompiler.useProgram(material.program);

        const mvpMatrix = this.calculateMVP(transform);
        const mvpLoc = this.gl.getUniformLocation(material.program, 'uMVP');
        this.gl.uniformMatrix4fv(mvpLoc, false, mvpMatrix);

        this.gl.bindVertexArray(mesh.vao);
        this.gl.drawElements(this.gl.TRIANGLES, mesh.indexCount, this.gl.UNSIGNED_INT, 0);
    }

    calculateMVP(transform) {
        // Placeholder - implement proper matrix math
        return new Float32Array(16);
    }

    createRenderTarget(name, width, height) {
        const rt = this.framebufferManager.createFramebuffer(width, height);
        this.renderTargets.set(name, rt);
        return rt;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ShaderCompiler,
        BufferManager,
        TextureManager,
        FramebufferManager,
        RenderPipeline
    };
}
