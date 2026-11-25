// Halftone Signal field. Shader source: assets/shaders/halftone.frag (bundled from src/halftone.glsl
// with the shader-art-coding library). One WebGL2 context, paused off-screen and in hidden tabs.
const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export async function initField(canvas, { still = false } = {}) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) return;
  const src = await (await fetch('/assets/shaders/halftone.frag')).text();
  const frag = `#version 300 es
precision highp float;
uniform vec3 iResolution; uniform float iTime; uniform vec4 iMouse; uniform int iFrame;
out vec4 outColor;
${src}
void main() { vec4 c; mainImage(c, gl_FragCoord.xy); outColor = c; }`;
  const sh = (type, code) => { const s = gl.createShader(type); gl.shaderSource(s, code); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = { res: gl.getUniformLocation(prog, 'iResolution'), time: gl.getUniformLocation(prog, 'iTime'), mouse: gl.getUniformLocation(prog, 'iMouse'), frame: gl.getUniformLocation(prog, 'iFrame') };

  const small = matchMedia('(max-width: 767px)').matches;
  const scale = small ? 0.6 : Math.min(window.devicePixelRatio || 1, 1.5); // phones: fewer fragments, CSS upscales
  let w = 0, h = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width * scale)); h = Math.max(1, Math.round(r.height * scale));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    if (!running) draw(performance.now());
  };
  const m = { x: 0, y: 0, z: 0, tz: 0 };
  addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    m.x = (e.clientX - r.left) * scale; m.y = (r.bottom - e.clientY) * scale; m.tz = inside ? 1 : 0;
  }, { passive: true });

  let frame = 0, running = false, raf = 0, visible = false;
  const t0 = performance.now();
  function draw(now) {
    m.z += (m.tz - m.z) * 0.06;
    gl.uniform3f(u.res, w, h, 1);
    gl.uniform1f(u.time, still ? 8 : (now - t0) / 1000);
    gl.uniform4f(u.mouse, m.x, m.y, still ? 0 : m.z, 0);
    gl.uniform1i(u.frame, frame++);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  let last = 0;
  const step = small ? 1000 / 30 : 0; // phones draw at 30 fps
  const loop = (now) => { if (now - last >= step - 1) { last = now; draw(now); } raf = requestAnimationFrame(loop); };
  const update = () => {
    const should = visible && !document.hidden && !still;
    if (should && !running) { running = true; raf = requestAnimationFrame(loop); }
    if (!should && running) { running = false; cancelAnimationFrame(raf); }
  };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; update(); }).observe(canvas.parentElement);
  document.addEventListener('visibilitychange', update);
  new ResizeObserver(resize).observe(canvas);
  resize();
  canvas.classList.add('is-live');
}
