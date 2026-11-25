// Halftone Signal: a rotated print screen whose dot sizes follow a slow fBm field,
// with a soft bloom and ripple around the pointer.
// iMouse.xy = pointer in pixels (origin bottom-left), iMouse.z = hover strength 0..1 (smoothed by the host page).

#define DEBUG_MODE 0              // 0 final, 1 field, 5 dot mask

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
