import { STR, initHeader, loadProg, markCorrect, markWrong, speak } from "../assets/app.js";
import { playSuccessDing, playWinJingle } from "../assets/audio.js";
import { launchConfetti } from "../assets/confetti.js";

const { lang, sound } = initHeader({ game:"match" });
const s = STR[lang];

document.getElementById("modeText").textContent = s.match;
document.getElementById("backBtn").textContent = s.back;
document.getElementById("nextBtn").textContent = s.next;
document.getElementById("repeatBtn").title = s.repeat;
document.getElementById("tipText").textContent = s.tip;

let prog = loadProg();

// Expanded, dementia-friendly icon pool (simple, recognizable)
const SYMBOL_POOL = [
  "🍎","🍌","🍊","🍉","🍓","🍇","🍍","🥝","🍐","🍑","🍒","🥭","🍋","🥥",
  "🥕","🌽","🥔","🍞","🥖","🥨","🧀","🥚","🍗","🍔","🍕","🍟","🥪","🌮","🍚","🍜",
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🐟","🐢",
  "🚗","🚌","🚑","🚒","🚓","🚕","🚲","🛵","🚂","✈️","🚀","🚁",
  "🏠","🏥","🏫","🏪","🏬","⛪","🏦",
  "☀️","🌙","⭐","☁️","🌧️","❄️","🌈","💧","🔥",
  "⌚","📱","☎️","📺","💡","🔑","🔒","🔔","🎵",
  "🧸","⚽","🏀","🎈","🎁",
  "👕","👖","👟","🧢",
  "🪥","🧼","🧻",
  "🍽️","🥄","🍴","🥤",
  "📖","✏️","🖍️",
  "🧲","🔨","🪛",
  // extras (still simple):
  "🍩","🍪","🍫","🍯","🥛","🧃",
  "🌻","🌷","🌲","🌵",
  "🧤","🧣","🧦",
  "🕶️","🎩","👛",
  "🪑","🛏️","🚪",
  "🧯","🧰"
];

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function promptText(){
  if(lang==="ar") return "طابق الاتنين";
  if(lang==="es") return "Empareja iguales";
  return "Match the same";
}

// -------- Difficulty → Grid mapping (EVEN ONLY)
function gridForLevel(lv){
  if(lv <= 3) return 2;    // 2x2
  if(lv <= 5) return 4;    // 4x4
  if(lv <= 7) return 6;    // 6x6
  if(lv <= 9) return 8;    // 8x8
  return 10;               // 10x10 (Level 10)
}

// -------- Free mismatch allowance by grid size
function freebiesForGrid(grid){
  if(grid === 2) return 2;    // 2x2
  if(grid === 4) return 10;   // 4x4
  if(grid === 6) return 20;   // 6x6
  if(grid === 8) return 35;   // 8x8
  return 60;                  // 10x10
}

// -------- Tile sizing for phone readability
function tileStyle(grid){
  if(grid <= 2) return { fontSize:"46px", minHeight:"92px" };
  if(grid <= 4) return { fontSize:"32px", minHeight:"76px" };
  if(grid <= 6) return { fontSize:"24px", minHeight:"60px" };
  if(grid <= 8) return { fontSize:"20px", minHeight:"52px" };
  return { fontSize:"16px", minHeight:"44px" };
}

// -------- Confetti (lightweight, no libraries)
 let open = [];
let found = new Set();
let tiles = [];
let freebiesRemaining = 0;

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

function render(){
  prog = loadProg();
  const lv = prog.match.level;
  document.getElementById("levelPill").textContent = `Lv ${lv}`;

  clearStatus();
  open = [];
  found = new Set();

  const grid = gridForLevel(lv);
  const totalTiles = grid * grid;
  const pairs = totalTiles / 2;

  freebiesRemaining = freebiesForGrid(grid);

  const symbols = shuffle(SYMBOL_POOL).slice(0, pairs);
  tiles = shuffle([...symbols, ...symbols]);

  const p = promptText();
  document.getElementById("promptText").textContent = p;

  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";
  choicesEl.style.gridTemplateColumns = `repeat(${grid}, 1fr)`;

  const style = tileStyle(grid);

  tiles.forEach((sym, idx)=>{
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = "❓";
    tile.style.fontSize = style.fontSize;
    tile.style.minHeight = style.minHeight;
    tile.onclick = ()=>flip(idx, tile);
    choicesEl.appendChild(tile);
  });

  speak(p, lang, sound);
  document.getElementById("repeatBtn").onclick = ()=> speak(p, lang, sound);
  document.getElementById("nextBtn").onclick = ()=> render();
}

function flip(idx, tileEl){
  if(found.has(idx)) return;
  if(open.includes(idx)) return;
  if(open.length >= 2) return;

  tileEl.textContent = tiles[idx];
  open.push(idx);

  if(open.length === 2){
    const [a,b] = open;
    const els = document.querySelectorAll(".tile");

    if(tiles[a] === tiles[b]){
      found.add(a); found.add(b);
      playSuccessDing(sound);
      setStatus("good", s.good);
      open = [];

      if(found.size === tiles.length){
        // WIN: longer brighter jingle + confetti burst
        playWinJingle(sound);
        launchConfetti(1850);
        markCorrect(prog, "match");
        setTimeout(()=>render(), 1400);
      }
    } else {
      // mismatch
      if(freebiesRemaining > 0){
        freebiesRemaining -= 1;
        open = [];
        setTimeout(()=>{
          els[a].textContent = "❓";
          els[b].textContent = "❓";
          clearStatus();
        }, 650);
      } else {
        setStatus("bad", s.bad);
        markWrong(prog, "match");
        setTimeout(()=>{
          els[a].textContent = "❓";
          els[b].textContent = "❓";
          open = [];
          clearStatus();
        }, 800);
      }
    }
  }
}

render();
