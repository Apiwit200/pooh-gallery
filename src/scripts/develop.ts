/**
 * Signal acquired: a frame resolves from coarse, posterised pixels to the photograph.
 * The canvas exists only while a frame is developing; at progress 1 it is removed and the
 * original <img> is shown untouched, so the photograph itself is never altered.
 */

const VERT = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;

const FRAG = `precision mediump float;
varying vec2 v;
uniform sampler2D tex;
uniform vec2 box;
uniform vec2 img;
uniform vec2 focus;
uniform vec3 ground;
uniform float progress;

void main(){
  // Cover-fit with object-position = focus, so the final frame matches the <img> exactly.
  float s=max(box.x/img.x,box.y/img.y);
  vec2 shown=img*s;
  vec2 offset=(box-shown)*focus;
  vec2 px=vec2(v.x,1.-v.y)*box;
  // Resolve: blocks shrink from 56px to one pixel while the palette widens from 3 levels to full.
  float t=clamp(progress,0.,1.);
  float block=max(1.,floor(mix(56.,1.,pow(t,.55))));
  vec2 cell=(floor(px/block)+.5)*block;
  vec2 uv=(cell-offset)/shown;
  vec3 c=texture2D(tex,uv).rgb;
  float levels=mix(3.,256.,t*t);
  c=floor(c*levels+.5)/levels;
  // The screen is dark until the signal arrives; blocks switch on in a scattered order.
  float h=fract(sin(dot(floor(px/56.),vec2(12.9898,78.233)))*43758.5453);
  float on=step(h,t*1.6);
  gl_FragColor=vec4(mix(ground,c,on),1.);
}`;

interface Developing {
  frame: HTMLElement;
  canvas: HTMLCanvasElement;
  draw: (p: number) => void;
  done: boolean;
}

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function groundColor(frame: HTMLElement): [number, number, number] {
  let el: HTMLElement | null = frame.parentElement;
  let bg = "rgb(53, 10, 255)";
  for (; el; el = el.parentElement) {
    const c = getComputedStyle(el).backgroundColor;
    if (c && !c.endsWith(", 0)") && c !== "transparent") {
      bg = c;
      break;
    }
  }
  const probe = bg.match(/[\d.]+/g)?.map(Number) ?? [53, 10, 255];
  return [probe[0]! / 255, probe[1]! / 255, probe[2]! / 255];
}

function prepare(frame: HTMLElement): Developing | null {
  const img = frame.querySelector("img");
  if (!img) return null;
  const canvas = document.createElement("canvas");
  canvas.className = "develop";
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

  const u = (n: string) => gl.getUniformLocation(prog, n);
  const [fx, fy] = getComputedStyle(img).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
  const rect = frame.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio, 1.5);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(u("box"), rect.width, rect.height);
  gl.uniform2f(u("img"), img.naturalWidth, img.naturalHeight);
  gl.uniform2f(u("focus"), fx ?? 0.5, fy ?? 0.5);
  gl.uniform3fv(u("ground"), groundColor(frame));
  const progress = u("progress");

  frame.append(canvas);
  frame.classList.add("is-developing");
  const draw = (p: number) => {
    gl.uniform1f(progress, p);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  draw(0);
  return { frame, canvas, draw, done: false };
}

function finish(d: Developing) {
  if (d.done) return;
  d.done = true;
  d.frame.classList.add("is-developed");
  d.frame.classList.remove("is-developing");
  d.canvas.getContext("webgl")?.getExtension("WEBGL_lose_context")?.loseContext();
  d.canvas.remove();
}

async function ready(frame: HTMLElement) {
  const img = frame.querySelector("img");
  if (!img) return false;
  if (!img.complete || !img.naturalWidth) await new Promise((r) => img.addEventListener("load", r, { once: true }));
  await img.decode().catch(() => undefined);
  return img.naturalWidth > 0;
}

/** Develops a frame over a fixed duration (used once, for the opening frame). */
export async function developOnce(frame: HTMLElement, duration = 3400) {
  const release = () => frame.classList.add("is-developed");
  // Never leave a held frame hidden: if anything below fails, show the photograph.
  const safety = setTimeout(release, 6000);
  if (reduce || !(await ready(frame))) return release();
  const d = prepare(frame);
  if (!d) return release();
  clearTimeout(safety);
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    d.draw(0.5 - Math.cos(Math.PI * t) / 2);
    if (t < 1) requestAnimationFrame(tick);
    else finish(d);
  };
  requestAnimationFrame(tick);
}

/** Develops a frame as it is scrolled into view; progress follows scroll and the canvas retires at 1. */
export async function developOnScroll(frame: HTMLElement, onProgress: (cb: (p: number) => void) => void) {
  if (reduce || !(await ready(frame))) return false;
  const d = prepare(frame);
  if (!d) return false;
  onProgress((p) => {
    if (d.done) return;
    d.draw(p);
    if (p >= 0.999) finish(d);
  });
  return true;
}
