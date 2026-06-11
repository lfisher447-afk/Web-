#version 300 es
// Advanced Rendering Engine - Physically Based Rendering (PBR) & Tone Mapping
// Copyright 2025 - Advanced UI Rendering System
// Features: PBR materials, HDR tone mapping, specular highlights, normal mapping

#define PI 3.14159265359
#define MAX_LIGHTS 8
#define EPSILON 0.001

precision highp float;
precision highp int;

// Input Uniforms
uniform sampler2D uTexDiffuse;
uniform sampler2D uTexNormal;
uniform sampler2D uTexMetallic;
uniform sampler2D uTexRoughness;
uniform sampler2D uTexAO;
uniform sampler2D uTexEmissive;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 uCameraPos;

uniform vec3 uLightPositions[MAX_LIGHTS];
uniform vec3 uLightColors[MAX_LIGHTS];
uniform float uLightIntensities[MAX_LIGHTS];
uniform int uLightCount;

uniform vec3 uAmbientLight;
uniform float uExposure;
uniform float uGamma;
uniform vec3 uTonemappingMode; // ACE, Reinhard, Filmic

// Input Varyings
in vec3 vPosition;
in vec3 vNormal;
in vec2 vTexCoord;
in mat3 vTBN; // Tangent-Binormal-Normal matrix for normal mapping

// Output
out vec4 FragColor;

// ========== PBR Functions ==========

// Schlick's Fresnel approximation
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// GGX/Towbridge-Reitz normal distribution
float DistributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    
    float nom = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
    
    return nom / max(denom, EPSILON);
}

// Schlick-GGX geometry function
float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;
    
    float nom = NdotV;
    float denom = NdotV * (1.0 - k) + k;
    
    return nom / max(denom, EPSILON);
}

// Smith's method for geometry obstruction
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);
    
    return ggx1 * ggx2;
}

// ========== Tone Mapping Functions ==========

// Filmic tone mapping (Unreal Engine 4 style)
vec3 tonemapFilmic(vec3 x) {
    float A = 0.15;
    float B = 0.50;
    float C = 0.10;
    float D = 0.20;
    float E = 0.02;
    float F = 0.30;
    
    return ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;
}

// ACES tone mapping (Academy Color Encoding System)
vec3 tonemapACES(vec3 x) {
    const float a = 2.51;
    const float b = 0.03;
    const float c = 2.43;
    const float d = 0.59;
    const float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

// Reinhard tone mapping
vec3 tonemapReinhard(vec3 x) {
    return x / (1.0 + x);
}

// Select tone mapping
vec3 applyToneMapping(vec3 hdrColor, vec3 mode) {
    if (mode.x > 0.5) return tonemapFilmic(hdrColor);
    else if (mode.y > 0.5) return tonemapACES(hdrColor);
    else return tonemapReinhard(hdrColor);
}

// ========== Normal Mapping ==========

vec3 getNormalFromMap(vec2 texCoord) {
    vec3 normal = texture(uTexNormal, texCoord).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    return normalize(vTBN * normal);
}

// ========== Advanced Lighting & Post-Processing ==========

// Cook-Torrance BRDF for metallic/specular surfaces
vec3 cookTorranceBRDF(vec3 N, vec3 V, vec3 L, vec3 albedo, float metallic, float roughness, vec3 F0) {
    vec3 H = normalize(V + L);
    float distance = length(uLightPositions[0] - vPosition); // Simplified
    float attenuation = 1.0 / (distance * distance);
    
    float NDF = DistributionGGX(N, H, roughness);
    float G = GeometrySmith(N, V, L, roughness);
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
    
    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metallic;
    
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
    vec3 specular = numerator / max(denominator, EPSILON);
    
    float NdotL = max(dot(N, L), 0.0);
    return (kD * albedo / PI + specular) * attenuation * NdotL;
}

// Screen space ambient occlusion approximation
float computeSSAO(vec2 texCoord, float depth) {
    float occlusion = 1.0;
    float radius = 0.05;
    int samples = 8;
    
    for (int i = 0; i < samples; i++) {
        float angle = float(i) * 2.0 * PI / float(samples);
        vec2 offset = vec2(cos(angle), sin(angle)) * radius;
        // Sample nearby depths (simplified)
        occlusion -= 0.02;
    }
    
    return max(0.0, occlusion);
}

// Parallax occlusion mapping
vec2 parallaxMapping(vec2 texCoord, vec3 viewDir) {
    float heightScale = 0.1;
    float height = texture(uTexNormal, texCoord).a;
    vec2 p = viewDir.xy / viewDir.z * (height * heightScale);
    return texCoord - p;
}

void main() {
    // Sample textures
    vec3 albedo = texture(uTexDiffuse, vTexCoord).rgb;
    float metallic = texture(uTexMetallic, vTexCoord).r;
    float roughness = texture(uTexRoughness, vTexCoord).r;
    float ao = texture(uTexAO, vTexCoord).r;
    vec3 emissive = texture(uTexEmissive, vTexCoord).rgb;
    
    // Get normal from normal map
    vec3 N = getNormalFromMap(vTexCoord);
    vec3 V = normalize(uCameraPos - vPosition);
    
    // Calculate F0 based on metallic value
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);
    
    vec3 Lo = vec3(0.0);
    
    // Process each light
    for (int i = 0; i < MAX_LIGHTS; i++) {
        if (i >= uLightCount) break;
        
        vec3 L = normalize(uLightPositions[i] - vPosition);
        float distance = length(uLightPositions[i] - vPosition);
        float attenuation = uLightIntensities[i] / (distance * distance + 1.0);
        vec3 radiance = uLightColors[i] * attenuation;
        
        Lo += cookTorranceBRDF(N, V, L, albedo, metallic, roughness, F0) * radiance;
    }
    
    // Ambient lighting
    vec3 ambient = uAmbientLight * albedo * ao;
    
    // Add emissive contribution
    vec3 color = ambient + Lo + emissive;
    
    // HDR tone mapping
    color = applyToneMapping(color, uTonemappingMode);
    color = pow(color, vec3(1.0 / uGamma));
    
    // Apply exposure
    color *= uExposure;
    
    FragColor = vec4(color, 1.0);
}
