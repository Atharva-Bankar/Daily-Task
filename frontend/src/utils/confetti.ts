export function triggerConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const colors = ["#24376f", "#cf4d77", "#d7df77", "#eab1c5", "#e7ee85", "#263b79"];
  const particles = Array.from({ length: 70 }, () => ({
    x: width / 2 + (Math.random() - 0.5) * 300,
    y: height * 0.4 + (Math.random() - 0.5) * 100,
    vx: (Math.random() - 0.5) * 14,
    vy: (Math.random() - 0.8) * 15,
    size: Math.random() * 9 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI * 2,
    vRotation: (Math.random() - 0.5) * 0.2,
    opacity: 1,
  }));

  let frameId: number;
  const startTime = Date.now();

  function render() {
    if (!ctx) return;
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rotation += p.vRotation;
      p.opacity = Math.max(0, 1 - elapsed / 1800);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    if (elapsed < 1800) {
      frameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(frameId);
      canvas.remove();
    }
  }

  render();
}
