#version 300 es
// Post-Processing Effects Pipeline
// Bloom, Motion Blur, Depth of Field, Chromatic Aberration, Vignetting
// Copyright 2025 - Advanced Visual Effects

precision highp float;
precision highp sampler2D;

#define PI 3.14159265359
#define BLUR_SAMPLES 16
#define MAX_BLUR_RADIUS 20.0

// Input uniforms
uniform sampler2D uSceneTexture;
uniform sampler2D uDepthTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uVelocityTexture;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMousePos;

// Effect toggles and parameters
uniform float uBloomStrength;
uniform float uBloomThreshold;
uniform float uMotionBlurAmount;
uniform float uDOFDistance;
uniform float uDOFFalloff;
uniform float uVignetteAmount;
uniform float uChromaticAberrationAmount;
uniform float uGrainAmount;
uniform bool uEnableBloom;
uniform bool uEnableMotionBlur;
uniform bool uEnableDOF;
uniform bool uEnableVignette;
uniform bool uEnableChromaticAberration;
uniform bool uEnableGrain;

in vec2 vTexCoord;
out vec4 FragColor;

// ========== Utility Functions ==========

// Pseudo-random number generator
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Gaussian blur kernel
float gaussianKernel(float distance, float sigma) {
    float coefficient = 1.0 / (sqrt(2.0 * PI) * sigma);
    return coefficient * exp(-(distance * distance) / (2.0 * sigma * sigma));
}

// Sample blur
vec3 sampleBlurredColor(sampler2D tex, vec2 center, vec2 direction, float strength, int samples) {
    vec3 result = vec3(0.0);
    float totalWeight = 0.0;
    
    for (int i = 0; i < samples; i++) {
        float offset = (float(i) - float(samples) / 2.0) * strength;
        vec2 sampleCoord = center + direction * offset;
        
        if (sampleCoord.x >= 0.0 && sampleCoord.x <= 1.0 &&
            sampleCoord.y >= 0.0 && sampleCoord.y <= 1.0) {
            
            float weight = gaussianKernel(offset, 1.0);
            result += texture(tex, sampleCoord).rgb * weight;
            totalWeight += weight;
        }
    }
    
    return result / max(totalWeight, 0.001);
}

// ========== BLOOM EFFECT ==========

// Kawase bloom (efficient separable bloom)
vec3 bloomEffect(sampler2D tex, vec2 uv) {
    vec2 pixelSize = 1.0 / uResolution;
    
    vec3 bloom = vec3(0.0);
    float samples = 0.0;
    
    // Threshold
    vec3 original = texture(tex, uv).rgb;
    float brightness = dot(original, vec3(0.299, 0.587, 0.114));
    
    if (brightness < uBloomThreshold) return vec3(0.0);
    
    // Gather bright pixels
    for (int x = -3; x <= 3; x++) {
        for (int y = -3; y <= 3; y++) {
            vec2 offset = vec2(float(x), float(y)) * pixelSize * 2.0;
            vec3 sampleColor = texture(tex, uv + offset).rgb;
            float sampleBrightness = dot(sampleColor, vec3(0.299, 0.587, 0.114));
            
            if (sampleBrightness > uBloomThreshold) {
                bloom += sampleColor;
                samples += 1.0;
            }
        }
    }
    
    return (bloom / max(samples, 1.0)) * uBloomStrength;
}

// ========== MOTION BLUR ==========

vec3 motionBlurEffect(sampler2D sceneTex, sampler2D velocityTex, vec2 uv) {
    if (uMotionBlurAmount < 0.01) return texture(sceneTex, uv).rgb;
    
    vec3 velocity = texture(velocityTex, uv).rgb;
    vec2 motionVector = velocity.xy * uMotionBlurAmount;
    
    vec3 blurred = vec3(0.0);
    for (int i = 0; i < BLUR_SAMPLES; i++) {
        float t = float(i) / float(BLUR_SAMPLES - 1);
        vec2 sampleUv = uv + motionVector * (t - 0.5);
        
        if (sampleUv.x >= 0.0 && sampleUv.x <= 1.0 &&
            sampleUv.y >= 0.0 && sampleUv.y <= 1.0) {
            blurred += texture(sceneTex, sampleUv).rgb;
        }
    }
    
    return blurred / float(BLUR_SAMPLES);
}

// ========== DEPTH OF FIELD ==========

vec3 depthOfFieldEffect(sampler2D sceneTex, sampler2D depthTex, vec2 uv) {
    float depth = texture(depthTex, uv).r;
    float blur = abs(depth - uDOFDistance) * uDOFFalloff;
    blur = clamp(blur, 0.0, MAX_BLUR_RADIUS / uResolution.x);
    
    return sampleBlurredColor(sceneTex, uv, vec2(1.0, 0.0), blur, BLUR_SAMPLES);
}

// ========== CHROMATIC ABERRATION ==========

vec3 chromaticAberrationEffect(sampler2D tex, vec2 uv) {
    if (uChromaticAberrationAmount < 0.001) return texture(tex, uv).rgb;
    
    vec2 fromCenter = uv - vec2(0.5);
    float distance = length(fromCenter);
    
    float r = texture(tex, uv + fromCenter * uChromaticAberrationAmount * 0.02).r;
    float g = texture(tex, uv).g;
    float b = texture(tex, uv - fromCenter * uChromaticAberrationAmount * 0.02).b;
    
    return vec3(r, g, b);
}

// ========== VIGNETTING ==========

vec3 vignetteEffect(vec3 color, vec2 uv) {
    if (uVignetteAmount < 0.001) return color;
    
    vec2 fromCenter = abs(uv - vec2(0.5));
    float vignette = 1.0 - dot(fromCenter, fromCenter) * uVignetteAmount;
    vignette = smoothstep(0.0, 1.0, vignette);
    
    return color * vignette;
}

// ========== FILM GRAIN ==========

vec3 filmGrainEffect(vec3 color, vec2 uv) {
    if (uGrainAmount < 0.001) return color;
    
    float grain = random(uv + uTime * 0.5) * 2.0 - 1.0;
    return color + vec3(grain) * uGrainAmount * 0.1;
}

// ========== MAIN ==========

void main() {
    vec3 color = texture(uSceneTexture, vTexCoord).rgb;
    
    // Apply effects in order
    if (uEnableBloom) {
        color += bloomEffect(uSceneTexture, vTexCoord);
    }
    
    if (uEnableMotionBlur) {
        color = motionBlurEffect(uSceneTexture, uVelocityTexture, vTexCoord);
    }
    
    if (uEnableDOF) {
        color = depthOfFieldEffect(uSceneTexture, uDepthTexture, vTexCoord);
    }
    
    if (uEnableChromaticAberration) {
        color = chromaticAberrationEffect(uSceneTexture, vTexCoord);
    }
    
    if (uEnableVignette) {
        color = vignetteEffect(color, vTexCoord);
    }
    
    if (uEnableGrain) {
        color = filmGrainEffect(color, vTexCoord);
    }
    
    FragColor = vec4(color, 1.0);
}
