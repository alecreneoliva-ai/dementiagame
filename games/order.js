import { getSettings, getProgress } from "../assets/app.js";
import { launchConfetti } from "../assets/confetti.js";
import { playWinJingle } from "../assets/audio.js";

function setRTL(lang){
  document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

function speak(text, enabled, lang){
  if(!enabled) return;
  try{ window.speechSynthesis.cancel(); }catch(e){}
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  u.pitch = 1.0;
  u.lang = (lang === "es") ? "es" : (lang === "ar" ? "ar" : "en-US");
  try{ window.speechSynthesis.speak(u); }catch(e){}
}

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function strings(lang){
  if(lang === "es"){
    return {
      title:"Ordenar números",
      subtitle:"Toca los números en orden.",
      rule:"Toca los números en orden.",
      hint:"Consejo: Toca 🔊 para escuchar instrucciones.",
      newBoard:"Nuevo tablero",
      next:"Siguiente",
      bad:"No. Busca el siguiente número.",
      speak: (last, step) => {
        if(step === 1) return `Toca los números en orden, desde 1 hasta ${last}.`;
        return `Toca los números en orden, contando de ${step} en ${step}. Empezando en 1, hasta ${last}.`;
      }
    };
  }
  if(lang === "ar"){
    return {
      title:"رتب الأرقام",
      subtitle:"دوس على الأرقام بالترتيب.",
      rule:"دوس على الأرقام بالترتيب.",
      hint:"نصيحة: دوس 🔊 عشان تسمع التعليمات.",
      newBoard:"لوحة جديدة",
      next:"التالي",
      bad:"لا. دور على الرقم اللي بعده.",
      speak: (last, step) => {
        if(step === 1) return `دوس على الأرقام بالترتيب من ١ لحد ${last}.`;
        return `دوس على الأرقام بالترتيب. كل مرة زوّد ${step}. ابدأ من ١ لحد ${last}.`;
      }
    };
  }
  return {
    title:"Order numbers",
    subtitle:"Tap the numbers in order.",
    rule:"Tap the numbers in order.",
    hint:"Tip: Tap 🔊 to hear instructions.",
    newBoard:"New board",
    next:"Next",
    bad:"Not that one. Find the next number.",
    speak: (last, step) => {
      if(step === 1) return `Tap the numbers in order, from 1 to ${last}.`;
      return `Tap the numbers in order, counting by ${step}s. Start at 1 and go to ${last}.`;
    }
  };
}

// Level -> grid size (max 5x5)
function gridSizeForLevel(lv){
  if(lv <= 2) return 2;  // 4 tiles
  if(lv <= 4) return 3;  // 9 tiles
  if(lv <= 6) return 4;  // 16 tiles
  return 5;              // 25 tiles
}

// NEW: Level -> step size for skipping numbers (logic difficulty)
function stepForLevel(lv){
  if(lv <= 3) return 1;   // 1,2,3...
  if(lv <= 6) return 2;   // 1,3,5...
  if(lv <= 8) return 3;   // 1,4,7...
  return 5;               // 1,6,11...
}

let settings = getSettings();
let progress = getProgress();

let gridN = 2;

// sequence we want user to tap in order (e.g., [1,3,5,7...])
let sequence = [];
let stepSize = 1;

// board values (shuffled sequence)
let boardValues = [];

// index in sequence for the next expected tap
let nextIndex = 0;

let doneSet = new Set();
let lock = false;

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

function saveProgress(){
  localStorage.setItem("ba2_progress", JSON.stringify(progress));
}

function updateHeaderText(){
  const s = strings(settings.lang);
  setRTL(settings.lang);

  document.getElementById("title").textContent = s.title;
  document.getElementById("subtitle").textContent = s.subtitle;
  document.getElementById("ruleLine").textContent = s.rule;
  document.getElementById("hint").textContent = s.hint;
  document.getElementById("newBtn").textContent = s.newBoard;
}

function updateLevelPill(){
  document.getElementById("levelPill").textContent = `Lv ${progress.order.level}`;
}

function currentNextValue(){
  return sequence[nextIndex];
}

function updateNextLine(){
  const s = strings(settings.lang);
  document.getElementById("nextLine").textContent = `${s.next}: ${currentNextValue()}`;
}

function buildSequence(){
  const count = gridN * gridN;
  stepSize = stepForLevel(progress.order.level);

  // start at 1 always for predictability
  // sequence length equals number of tiles (count)
  sequence = Array.from({ length: count }, (_, i) => 1 + i * stepSize);

  // board is a shuffled copy of the sequence
  boardValues = shuffle(sequence);

  nextIndex = 0;
  doneSet = new Set();
  lock = false;

  updateNextLine();
}

function render(){
  const board = document.getElementById("board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${gridN}, 1fr)`;

  const nextVal = currentNextValue();

  boardValues.forEach((val)=>{
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "numTile";
    btn.textContent = val;

    if(doneSet.has(val)){
      btn.classList.add("done");
      btn.disabled = true;
    }

    // Gentle cue: highlight the next expected value
    if(val === nextVal && !doneSet.has(val)){
      btn.classList.add("hintNext");
    }

    btn.onclick = ()=> onTap(val);

    board.appendChild(btn);
  });
}

async function celebrateWin(){
  launchConfetti(1700);
  await playWinJingle(settings.sound);
}

function speakInstructions(){
  const s = strings(settings.lang);
  const last = sequence[sequence.length - 1];
  const sentence = s.speak(last, stepSize);

  speak(sentence, settings.sound, settings.lang);

  document.getElementById("repeatBtn").onclick = ()=>{
    speak(sentence, settings.sound, settings.lang);
  };
}

function startNewBoard(){
  settings = getSettings();
  progress = getProgress();
  if(!progress.order) progress.order = { level: 1 };

  updateHeaderText();
  updateLevelPill();

  gridN = gridSizeForLevel(progress.order.level);

  buildSequence();
  clearStatus();
  render();
  speakInstructions();
}

function onTap(val){
  if(lock) return;

  const s = strings(settings.lang);
  const expected = currentNextValue();

  if(val === expected){
    clearStatus();
    doneSet.add(val);

    // if that was the final value, WIN
    if(nextIndex === sequence.length - 1){
      progress.order.level = Math.min(10, progress.order.level + 1);
      saveProgress();
      updateLevelPill();

      celebrateWin();

      lock = true;
      setTimeout(()=>{
        lock = false;
        startNewBoard();
      }, 900);

      return;
    }

    // otherwise move to next expected number
    nextIndex += 1;
    updateNextLine();
    render();
    return;
  }

  // Wrong tap: calm feedback only
  setStatus("bad", s.bad);
  setTimeout(()=> clearStatus(), 600);
}

function wireButtons(){
  document.getElementById("newBtn").onclick = ()=> startNewBoard();

  document.getElementById("levelUp").onclick = ()=>{
    progress.order.level = Math.min(10, progress.order.level + 1);
    saveProgress();
    startNewBoard();
  };

  document.getElementById("levelDown").onclick = ()=>{
    progress.order.level = Math.max(1, progress.order.level - 1);
    saveProgress();
    startNewBoard();
  };
}

function init(){
  settings = getSettings();
  progress = getProgress();
  if(!progress.order) progress.order = { level: 1 };

  wireButtons();
  startNewBoard();
}

init();
