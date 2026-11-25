// Halftone Signal: a rotated print screen whose dot sizes follow a slow fBm field,
// with a soft bloom and ripple around the pointer.
// iMouse.xy = pointer in pixels (origin bottom-left), iMouse.z = hover strength 0..1 (smoothed by the host page).

#define DEBUG_MODE 0              // 0 final, 1 field, 5 dot mask

// Library code below is bundled from shader-skills (MIT): https://github.com/gokayfem/shader-skills
// ---- shader-skills library: common ----
const float TAU = 6.28318530717959;
// 2D rotation matrix. `rot2(a) * v` rotates v counter-clockwise by a radians. (cos, sin) is renormalized because GLSL ES leaves trig precision undefined: on SwiftShader and some mobile GPUs a raw cos/sin pair is far enough from unit length that rotations stop preserving distances.
mat2 rot2(float a) {
    vec2 cs = normalize(vec2(cos(a), sin(a)));
    return mat2(cs.x, cs.y, -cs.y, cs.x);
}

// ---- shader-skills library: hash ----
// PCG-style 1D integer hash.
uint pcgHash(uint v) {
    uint state = v * 747796405u + 2891336453u;
    uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}
// 3D integer hash, three decorrelated outputs.
uvec3 pcg3d(uvec3 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    return v;
}
// Map a uint to [0,1) using the top 24 bits, so the result can never round up to 1.0.
float uintToUnit(uint h) { return float(h >> 8u) * (1.0 / 16777216.0); }
vec2 uintToUnit(uvec2 h) { return vec2(h >> 8u) * (1.0 / 16777216.0); }
vec3 uintToUnit(uvec3 h) { return vec3(h >> 8u) * (1.0 / 16777216.0); }
vec4 uintToUnit(uvec4 h) { return vec4(h >> 8u) * (1.0 / 16777216.0); }
// Random float in [0,1) for an integer-valued 2D input.
float hash12(vec2 p) {
    uvec2 q = uvec2(ivec2(floor(p)));
    return uintToUnit(pcgHash(q.x + pcgHash(q.y)));
}
// Random vec2 in [0,1)^2 for an integer-valued 2D input.
vec2 hash22(vec2 p) {
    ivec2 q = ivec2(floor(p));
    return uintToUnit(pcg3d(uvec3(q.x, q.y, 0x2545u))).xy;
}

// ---- shader-skills library: noise ----
// Unit gradient for a 2D lattice point.
vec2 latticeGradient(vec2 cell) {
    float a = TAU * hash12(cell);
    return vec2(cos(a), sin(a));
}
// 2D simplex noise with analytic gradient. Returns vec3(value, d/dx, d/dy). Sums three radial kernels (0.5 - r^2)^4 on a triangular lattice instead of blending four square-cell corners, so it has fewer axis-aligned artifacts than gradientNoise. rotation (radians) spins every lattice gradient: animating it gives flow noise that churns in place instead of sliding (Perlin and Neyret 2001). Scaled so |value| <= 1 exactly.
vec3 simplexNoiseD(vec2 p, float rotation) {
    const float SKEW = 0.36602540378;     // (sqrt(3) - 1) / 2: square lattice -> triangle lattice
    const float UNSKEW = 0.21132486541;   // (3 - sqrt(3)) / 6
    vec2 cell = floor(p + (p.x + p.y) * SKEW);
    vec2 d0 = p - cell + (cell.x + cell.y) * UNSKEW;
    vec2 o = (d0.x > d0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);   // which of the cell's two triangles holds p
    vec2 corners[3] = vec2[3](cell, cell + o, cell + 1.0);
    vec2 offsets[3] = vec2[3](d0, d0 - o + UNSKEW, d0 - 1.0 + 2.0 * UNSKEW);
    mat2 spin = rot2(rotation);
    vec3 sum = vec3(0.0);
    for (int k = 0; k < 3; k++) {
        vec2 d = offsets[k];
        float t = max(0.5 - dot(d, d), 0.0);
        vec2 g = spin * latticeGradient(corners[k]);
        float gd = dot(g, d);
        float t3 = t * t * t;
        // value t^4 (g.d); gradient t^4 g - 8 t^3 (g.d) d
        sum += vec3(t3 * t * gd, t3 * t * g - 8.0 * t3 * gd * d);
    }
    return 99.2 * sum;   // 1 / max over the simplex of sum t^4 |d|
}
vec3 simplexNoiseD(vec2 p) { return simplexNoiseD(p, 0.0); }
// 2D simplex noise.
float simplexNoise(vec2 p) { return simplexNoiseD(p, 0.0).x; }

// ---- shader-skills library: color ----
// Exact sRGB decode (EOTF): encoded [0,1] -> linear.
vec3 srgbToLinear(vec3 c) {
    c = max(c, 0.0);
    return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
// Exact sRGB encode (OETF): linear -> display [0,1]. Apply exactly once, after tonemapping. pow(c, 1/2.2) is visibly wrong near black (0.001 encodes to 0.013 here vs 0.043 with 2.2).
vec3 linearToSrgb(vec3 c) {
    c = max(c, 0.0);
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

// ---- shader-skills library: post ----
// Triangular-PDF dither of +-1 LSB for 8-bit output. Add AFTER linearToSrgb, right before writing fragColor.
vec3 ditherTPDF(vec2 fragCoord, int frame) {
    vec2 r = hash22(vec2(floor(fragCoord) + 7919.0 * float(frame % 1024)));
    return vec3((r.x + r.y - 1.0) / 255.0);
}

// ---- shader ----
const float CELLS_Y      = 54.0;   // dot rows across the viewport height (scale)
const float SCREEN_ANGLE = 0.2618; // 15 degrees, a classic print screen angle
const float DRIFT        = 0.045;  // field drift speed (motion)
const float FIELD_SCALE  = 1.35;   // size of the light/dark patches
const float MAX_RADIUS   = 0.34;   // biggest dot radius in cell units (softness of the screen)
const float BLOOM_RADIUS = 0.42;   // pointer bloom radius in uv units
const float HOT_LEVEL    = 0.74;   // field level where dots turn signal colour

const vec3 INK_SRGB    = vec3(0.055, 0.051, 0.047);  // #0e0d0c
const vec3 BONE_SRGB   = vec3(0.250, 0.236, 0.220);  // dim bone dot
const vec3 SIGNAL_SRGB = vec3(0.760, 0.290, 0.180);  // muted vermilion dot

float field(vec2 p, float t) {
    float n = 0.0;
    float a = 0.5;
    vec2 q = p;
    for (int i = 0; i < 3; i++) {
        n += a * simplexNoise(q + vec2(0.7 * t, -t));
        q = q * 2.03 + vec2(1.7, 9.2);
        a *= 0.5;
    }
    return clamp(0.5 + 0.5 * n / 0.875, 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float cellPx = iResolution.y / CELLS_Y;
    float c = cos(SCREEN_ANGLE);
    float s = sin(SCREEN_ANGLE);
    mat2 rot = mat2(c, -s, s, c);
    mat2 inv = mat2(c, s, -s, c);

    vec2 g = rot * fragCoord / cellPx;
    vec2 id = floor(g) + 0.5;
    vec2 local = g - id;
    vec2 centerPx = inv * (id * cellPx);
    vec2 uv = (2.0 * centerPx - iResolution.xy) / iResolution.y;

    float t = iTime * DRIFT;
    float f = field(uv * FIELD_SCALE, t);
    f *= (1.0 - smoothstep(-0.4, 1.35, uv.y)) * 0.55 + 0.45;  // denser toward the bottom

    vec2 m = (2.0 * iMouse.xy - iResolution.xy) / iResolution.y;
    float d = length(uv - m);
    float bloom = exp(-(d * d) / (BLOOM_RADIUS * BLOOM_RADIUS)) * clamp(iMouse.z, 0.0, 1.0);
    float ripple = 0.5 + 0.5 * sin(d * 16.0 - iTime * 2.4);

    float level = clamp(f * f * 1.1 + bloom * (0.45 + 0.35 * ripple), 0.0, 1.0);
    float r = MAX_RADIUS * sqrt(level);
    float aa = 1.0 / cellPx;
    float dotMask = 1.0 - smoothstep(-aa, aa, length(local) - r);

    float hot = smoothstep(HOT_LEVEL, HOT_LEVEL + 0.14, f + bloom * 0.55);
    vec3 ink = srgbToLinear(INK_SRGB);
    vec3 dotCol = mix(srgbToLinear(BONE_SRGB), srgbToLinear(SIGNAL_SRGB), hot);
    vec3 col = mix(ink, dotCol, dotMask);

#if DEBUG_MODE == 1
    col = vec3(f);
#elif DEBUG_MODE == 5
    col = vec3(dotMask);
#endif

    col = linearToSrgb(col);
    col += ditherTPDF(fragCoord, iFrame);
    fragColor = vec4(col, 1.0);
}
