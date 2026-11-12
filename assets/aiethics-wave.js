/* AIethics Resonance — independent Canvas2D animation.
   Copyright (c) 2026 AIethics.international. No third-party runtime.
   Draws a responsive layered luminous waveform and stepped observation frames.
*/
(() => {
  'use strict';
  const canvas = document.getElementById('aiethics-wave');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let w = 1, h = 1, dpr = 1;
  let running = false, visible = true, frame = 0, lastFrame = 0;
  let elapsedBeforePause = 0;
  const small = () => window.innerWidth < 700;
  const TAU = Math.PI * 2;
  function resize() {
    const box = canvas.getBoundingClientRect();
    if (box.width < 4 || box.height < 4) return;
    w = box.width; h = box.height;
    dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.25 : 1.65);
    canvas.width = Math.max(2, Math.floor(w * dpr));
    canvas.height = Math.max(2, Math.floor(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render(elapsedBeforePause);
  }
  const gaussian = (x, center, spread) => Math.exp(-Math.pow((x - center) / spread, 2));
  const waveY = (u, t) => {
    const center = 0.54 + Math.sin(t * 0.13) * 0.035;
    const hill = 0.34 * gaussian(u, center, 0.30);
    const swell = 0.045 * gaussian(u, 0.78, 0.18) * Math.cos(t * 0.25 + u * 4.8);
    return h * (0.70 - hill - swell + 0.023 * Math.sin(u * TAU * 1.8 - t * 0.34) + 0.009 * Math.sin(u * 19 + t * 0.22));
  };
  const rand = n => { const a = Math.sin(n * 127.1 + 17.2) * 43758.5453; return a - Math.floor(a); };
  function buildLine(offset, index, time) {
    const count = small() ? 100 : 154;
    ctx.beginPath();
    for (let k = 0; k <= count; k++) {
      const u = k / count;
      const xx = u * w;
      const drift = Math.sin(u * 9.2 - time * 0.28 + index * 0.14) * h * 0.014;
      const billow = Math.sin(u * 5.8 + time * 0.16 + index * 0.37) * h * 0.013;
      const edge = 0.60 + gaussian(u, 0.55, 0.40) * 0.65;
      const yy = waveY(u, time) + offset * h * edge + drift + billow;
      if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
  }
  function paintFrames(time) {
    ctx.save();
    const cols = small() ? 9 : 13;
    const unit = w / cols;
    for (let i = -1; i <= cols; i++) {
      const x = i * unit + (rand(i + 10) - .5) * unit * .31;
      const width = unit * (.73 + rand(i + 20) * .95);
      const u = Math.max(0, Math.min(1, (x + width * .5) / w));
      const y = waveY(u, time) - h * (.08 + rand(i + 34) * .11);
      const ht = h * (.12 + rand(i + 50) * .22);
      const energy = gaussian(u, .59, .47);
      ctx.fillStyle = 'rgba(128,202,218,' + (.018 + .045 * energy).toFixed(3) + ')';
      ctx.fillRect(x, y, width, ht);
      ctx.lineWidth = .9;
      ctx.strokeStyle = 'rgba(180,226,233,' + (.085 + .20 * energy).toFixed(3) + ')';
      ctx.strokeRect(x + .5, y + .5, width, ht);
      ctx.strokeStyle = 'rgba(215,248,250,' + (.06 + .24 * energy).toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(x, y + .5); ctx.lineTo(x + width, y + .5); ctx.stroke();
    }
    for (let i = 0; i < 7; i++) {
      const u = (i + .3) / 7;
      const x = u * w + Math.sin(i * 4.4) * 18;
      const ww = w * (.085 + .03 * rand(i + 90));
      const y = waveY(u, time) + h * (.035 + rand(i + 100) * .065);
      ctx.strokeStyle = 'rgba(114,174,192,.095)';
      ctx.strokeRect(x, y, ww, h * (.11 + rand(i + 110) * .13));
    }
    ctx.restore();
  }
  function paintGlow(t) {
    const cx = w * (.53 + .025 * Math.sin(t * .15));
    const cy = h * .41;
    const radius = Math.max(w, h) * .59;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, 'rgba(91,179,197,.10)');
    grad.addColorStop(.35, 'rgba(69,143,164,.05)');
    grad.addColorStop(1, 'rgba(9,26,39,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  }
  function paintRibbon(t) {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const n = small() ? 20 : 31;
    for (let j = 0; j < n; j++) {
      const f = j / (n - 1);
      const off = (f - .5) * .185;
      const alpha = .028 + .065 * Math.pow(Math.sin(Math.PI * f), 2);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(98,158,176,' + alpha * .35 + ')');
      grad.addColorStop(.32, 'rgba(175,228,235,' + alpha * .72 + ')');
      grad.addColorStop(.57, 'rgba(230,248,248,' + alpha + ')');
      grad.addColorStop(.81, 'rgba(153,218,230,' + alpha * .82 + ')');
      grad.addColorStop(1, 'rgba(96,159,178,' + alpha * .24 + ')');
      ctx.lineWidth = 1.15 + (1 - Math.abs(f - .5) * 2) * .38;
      ctx.strokeStyle = grad;
      buildLine(off, j, t); ctx.stroke();
    }
    for (let j = 0; j < 4; j++) {
      const off = -.017 + j * .010;
      ctx.save(); ctx.globalAlpha = .29 - Math.abs(j - 1.5) * .04;
      ctx.strokeStyle = j === 1 ? '#e7f5f5' : '#9fdae5';
      ctx.lineWidth = j === 1 ? 2.5 : 1.2;
      ctx.shadowColor = '#9de4eb'; ctx.shadowBlur = j === 1 ? 13 : 5;
      buildLine(off, j + 48, t); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  function render(ms) {
    if (w <= 2 || h <= 2) return;
    const t = ms / 1000;
    ctx.clearRect(0, 0, w, h);
    paintGlow(t); paintFrames(t); paintRibbon(t);
  }
  function tick(now) {
    if (!running) return;
    if (!lastFrame || now - lastFrame > (small() ? 42 : 35)) {
      elapsedBeforePause += lastFrame ? Math.min(now - lastFrame, 100) : 35;
      render(elapsedBeforePause); lastFrame = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function stop() { running = false; cancelAnimationFrame(frame); lastFrame = 0; }
  function start() {
    if (running || !visible || document.hidden || reduceMotion.matches) return;
    running = true; frame = requestAnimationFrame(tick);
  }
  function onPreferenceChange() { stop(); render(2000); start(); }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }, { threshold: .02 }).observe(canvas);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onPreferenceChange);
  else if (reduceMotion.addListener) reduceMotion.addListener(onPreferenceChange);
  resize(); render(2000); start();
})();