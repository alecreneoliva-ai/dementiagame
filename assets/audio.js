async function ensureAudioContext(ctx){
  try{
    if(ctx.state === "suspended"){
      await ctx.resume();
    }
  }catch(e){}
}

export async function playSuccessDing(enabled=true){
  if(!enabled) return;
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    await ensureAudioContext(ctx);
    const now = ctx.currentTime;

    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "sine";
    o.frequency.setValueAtTime(880, now);
    o.frequency.setValueAtTime(1175, now+0.08);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.22, now+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now+0.25);

    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now+0.28);

    setTimeout(()=>ctx.close(), 500);
  }catch(e){}
}

export async function playWinJingle(enabled=true){
  if(!enabled) return;
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    await ensureAudioContext(ctx);
    const start = ctx.currentTime;

    // Longer + brighter (~2s)
    const melody = [
      523.25, 659.25, 783.99, 1046.50,
      987.77, 1046.50, 1174.66, 1318.51,
      1174.66, 1046.50, 1318.51, 1567.98
    ];
    const dur = [
      0.12,0.12,0.12,0.18,
      0.12,0.12,0.12,0.18,
      0.12,0.12,0.16,0.28
    ];

    // Gentle chord pad
    const chordNotes = [523.25, 659.25, 783.99];
    const chordStart = start + 0.02;
    const chordEnd   = start + 2.1;

    chordNotes.forEach((f)=>{
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, chordStart);

      g.gain.setValueAtTime(0.0001, chordStart);
      g.gain.exponentialRampToValueAtTime(0.05, chordStart + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, chordEnd);

      o.connect(g).connect(ctx.destination);
      o.start(chordStart);
      o.stop(chordEnd + 0.05);
    });

    let t = 0;
    melody.forEach((f, i)=>{
      const a = start + t;
      const d = dur[i];

      const o1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      o1.type = "square";
      o1.frequency.setValueAtTime(f, a);

      g1.gain.setValueAtTime(0.0001, a);
      g1.gain.exponentialRampToValueAtTime(0.12, a + 0.015);
      g1.gain.exponentialRampToValueAtTime(0.0001, a + d);

      o1.connect(g1).connect(ctx.destination);
      o1.start(a);
      o1.stop(a + d + 0.03);

      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.type = "sine";
      o2.frequency.setValueAtTime(f * 2, a);

      g2.gain.setValueAtTime(0.0001, a);
      g2.gain.exponentialRampToValueAtTime(0.03, a + 0.01);
      g2.gain.exponentialRampToValueAtTime(0.0001, a + d);

      o2.connect(g2).connect(ctx.destination);
      o2.start(a);
      o2.stop(a + d + 0.02);

      t += d;
    });

    setTimeout(()=>ctx.close(), 2800);
  }catch(e){}
}
