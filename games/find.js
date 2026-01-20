import { STR, initHeader, loadProg, markCorrect, markWrong, speak } from "../assets/app.js";
import { playSuccessDing, playWinJingle } from "../assets/audio.js";
import { launchConfetti } from "../assets/confetti.js";

const { lang, sound } = initHeader({ game:"find" });
const s = STR[lang];

document.getElementById("modeText").textContent = s.find;
document.getElementById("backBtn").textContent = s.back;
document.getElementById("nextBtn").textContent = s.next;
document.getElementById("repeatBtn").title = s.repeat;
document.getElementById("tipText").textContent = s.tip;

let lastPrompt = "";
let currentPrompt = "";
let locked = false;

const symbolNames = {
  "🍎": { en:"apple",  es:"la manzana", ar:"التفاحة" },
  "🍌": { en:"banana", es:"el plátano", ar:"الموزة" },
  "🐱": { en:"cat",    es:"el gato",    ar:"القطة" },
  "🚗": { en:"car",    es:"el carro",   ar:"العربية" },
  "🏠": { en:"house",  es:"la casa",    ar:"البيت" },
  "☀️": { en:"sun",    es:"el sol",     ar:"الشمس" },
  "💧": { en:"water",  es:"el agua",    ar:"الماية" },
  "⌚": { en:"watch",  es:"el reloj",   ar:"الساعة" },
  "📱": { en:"phone",  es:"el teléfono",ar:"الموبايل" }
};

// Big, simple pool for distractors
const allSymbols = [
  "🍎","🍌","🍊","🍉","🍓","🍇","🍍","🥝","🍐","🍑","🍒","🥭","🍋","🥥",
  "🥕","🌽","🥔","🍞","🥖","🥨","🧀","🥚","🍗","🍔","🍕","🍟","🥪","🌮",
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🐟","🐢",
  "🚗","🚌","🚑","🚒","🚓","🚕","🚲","🛵","🚂","✈️","🚀","🚁",
  "🏠","🏥","🏫","🏪","🏬","⛪","🏦",
  "☀️","🌙","⭐","☁️","🌧️","❄️","🌈","💧","🔥",
  "⌚","📱","☎️","📺","💡","🔑","🔒","🔔","🎵",
  "🧸","⚽","🏀","🎈","🎁"
];

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function makePrompt(sym){
  const name = (symbolNames[sym]?.[lang]) || sym;
  if(lang==="ar") return `فين ${name}؟`;
  if(lang==="es") return `¿Dónde está ${name}?`;
  return `Where is the ${name}?`;
}

function buildQuestion(){
  const prog = loadProg();
  const lv = prog.find.level;

  // up to level 10: 2 → 3 → 4 choices
  const nChoices = (lv<=3) ? 2 : (lv<=6 ? 3 : 4);

  const answers = Object.keys(symbolNames);
  const answer = pick(answers);

  const distractPool = allSymbols.filter(x=>x!==answer);
  const distractors = shuffle(distractPool).slice(0, nChoices-1);
  const choices = shuffle([answer, ...distractors]);

  return { prompt: makePrompt(answer), answer, choices };
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

function render(){
  locked = false;
  clearStatus();

  const prog = loadProg();
  document.getElementById("levelPill").textContent = `Lv ${prog.find.level}`;

  let q = buildQuestion();
  let guard = 0;
  while(q.prompt === lastPrompt && guard < 8){
    q = buildQuestion();
    guard++;
  }
  lastPrompt = q.prompt;
  currentPrompt = q.prompt;

  const promptEl = document.getElementById("promptText");
  const choicesEl = document.getElementById("choices");
  promptEl.textContent = q.prompt;

  choicesEl.innerHTML = "";
  choicesEl.style.gridTemplateColumns = `repeat(${q.choices.length}, 1fr)`;

  q.choices.forEach(sym=>{
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = sym;

    tile.onclick = () => {
      if(locked) return;
      locked = true;

      // Disable taps while we show feedback
      document.querySelectorAll(".tile").forEach(t=>t.style.pointerEvents="none");

      const before = loadProg().find.level;

      if(sym === q.answer){
        setStatus("good", s.good);

        // Sound feedback (don’t await — keeps UI responsive)
        playSuccessDing(sound);

        // Update progress
        const p = loadProg();
        markCorrect(p, "find");
        const after = loadProg().find.level;

        // Celebrate ONLY on level-up
        if(after > before){
          playWinJingle(sound);
          launchConfetti(1400);
        }

        // Move to next question quickly
        setTimeout(render, 650);
      } else {
        setStatus("bad", s.bad);
        const p = loadProg();
        markWrong(p, "find");

        // Re-enable choices after a brief pause so they can try again
        setTimeout(()=>{
          locked = false;
          document.querySelectorAll(".tile").forEach(t=>t.style.pointerEvents="auto");
        }, 450);
      }
    };

    choicesEl.appendChild(tile);
  });

  // Auto-speak prompt
  speak(q.prompt, lang, sound);

  document.getElementById("repeatBtn").onclick = ()=> speak(currentPrompt, lang, sound);
  document.getElementById("nextBtn").onclick = ()=> render();
}

render();
