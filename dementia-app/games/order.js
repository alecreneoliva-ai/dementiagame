import { STR, initHeader, loadProg, markCorrect, markWrong, speak } from "../assets/app.js";
import { playWinJingle } from "../assets/audio.js";
import { launchConfetti } from "../assets/confetti.js";

const { lang, sound } = initHeader({ game:"order" });
const s = STR[lang];

document.getElementById("modeText").textContent = s.order;
document.getElementById("backBtn").textContent = s.back;
document.getElementById("nextBtn").textContent = s.next;
document.getElementById("repeatBtn").title = s.repeat;
document.getElementById("tipText").textContent = s.tip;

let prog = loadProg();
let target = [];
let idx = 0;

function promptText(){
  if(lang==="ar") return "رتّب من الصغير للكبير";
  if(lang==="es") return "Ordena pequeño → grande";
  return "Order small → big";
}

function setStatus(type, text){
  const box = document.getElementById("statusBox");
  box.className = "status " + type;
  box.textContent = text;
}
function clearStatus(){
  const box = document.getElementById("statusBox");
  box.className = "status";
  box.textContent = "";
}

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function gridForLevel(lv){
  if(lv <= 2) return 2;     // 2x2
  if(lv <= 4) return 3;     // 3x3
  if(lv <= 6) return 4;     // 4x4
  return 5;                 // 5x5 (Lv 7-10)
}

function styleForGrid(g){
  if(g <= 2) return { fontSize:"34px", minHeight:"84px" };
  if(g === 3) return { fontSize:"28px", minHeight:"74px" };
  if(g === 4) return { fontSize:"22px", minHeight:"60px" };
  return { fontSize:"18px", minHeight:"52px" };
}

function buildNumbers(count, lv){
  // Increase range with level so values feel varied
  const maxNum = 10 + (lv * 6); // up to 70 at lv10
  const set = new Set();
  while(set.size < count){
    set.add(1 + Math.floor(Math.random() * maxNum));
  }
  return Array.from(set);
}

function render(){
  prog = loadProg();
  const lv = prog.order.level;
  document.getElementById("levelPill").textContent = `Lv ${lv}`;

  clearStatus();
  const p = promptText();
  document.getElementById("promptText").textContent = p;

  const grid = gridForLevel(lv);
  const total = grid * grid;

  const nums = buildNumbers(total, lv);
  target = [...nums].sort((a,b)=>a-b);
  idx = 0;

  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";
  choicesEl.style.gridTemplateColumns = `repeat(${grid}, 1fr)`;

  const style = styleForGrid(grid);

  shuffle(nums).forEach(n=>{
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = String(n);
    tile.style.fontSize = style.fontSize;
    tile.style.minHeight = style.minHeight;

    tile.onclick = async ()=>{
      const expected = target[idx];
      if(n === expected){
        tile.style.borderColor = "rgba(26,127,55,.6)";
        tile.style.pointerEvents = "none";
        idx++;

        if(idx >= target.length){
          // WIN
          await playWinJingle(sound);
          launchConfetti(1800);
          setStatus("good", s.good);
          markCorrect(loadProg(), "order");
          setTimeout(()=>render(), 1400);
        } else {
          clearStatus();
        }
      } else {
        setStatus("bad", s.bad);
        markWrong(loadProg(), "order");
      }
    };

    choicesEl.appendChild(tile);
  });

  speak(p, lang, sound);
  document.getElementById("repeatBtn").onclick = ()=> speak(p, lang, sound);
  document.getElementById("nextBtn").onclick = ()=> render();
}

render();
