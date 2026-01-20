export function launchConfetti(durationMs = 1600){
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  function resize(){
    canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
    canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
  }
  resize();
  window.addEventListener("resize", resize, { passive:true });

  const W = ()=>canvas.width, H = ()=>canvas.height;
  const colors = ["#ff3b30","#ffcc00","#34c759","#007aff","#af52de","#ff2d55"];

  const count = Math.min(220, Math.floor((window.innerWidth * window.innerHeight)/9000) + 120);

  const parts = Array.from({length: count}).map(()=>({
    x: Math.random()*W(),
    y: -Math.random()*H()*0.25,
    vx: (Math.random()-0.5) * 3.0 * devicePixelRatio,
    vy: (Math.random()*2.0 + 2.6) * devicePixelRatio,
    size: (Math.random()*6 + 6) * devicePixelRatio,
    rot: Math.random()*Math.PI,
    vr: (Math.random()-0.5)*0.2,
    color: colors[Math.floor(Math.random()*colors.length)],
    shape: Math.random() < 0.5 ? "rect" : "circle"
  }));

  const start = performance.now();
  function tick(now){
    const t = now - start;
    ctx.clearRect(0,0,W(),H());

    for(const p of parts){
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04 * devicePixelRatio;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if(p.shape === "rect"){
        ctx.fillRect(-p.size/2, -p.size/3, p.size, p.size*0.7);
      } else {
        ctx.beginPath();
        ctx.arc(0,0,p.size*0.35,0,Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }

    if(t < durationMs){
      requestAnimationFrame(tick);
    } else {
      window.removeEventListener("resize", resize);
      canvas.remove();
    }
  }
  requestAnimationFrame(tick);
}
