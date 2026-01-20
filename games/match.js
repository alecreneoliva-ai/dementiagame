import { getSettings, getProgress } from "../assets/app.js";
import { launchConfetti } from "../assets/confetti.js";
import { playWinJingle } from "../assets/audio.js";
import { EMOJI_BANK } from "../data/emoji_simple.js";

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
      title:"Emparejar pares",
      subtitle:"Toca dos tarjetas para encontrar un par.",
      rule:"Encuentra dos iguales.",
      hint:"Consejo: Toca 🔊 para escuchar instrucciones.",
      newBoard:"Nuevo tablero",
      good:"¡Bien!",
      bad:"No es par. Intenta otra vez.",
      speak: (n, free) => `Empareja las imágenes iguales. Toca dos tarjetas. Tablero de ${n} por ${n}. Intentos gratis: ${free}.`
    };
  }
  if(lang === "ar"){
    return {
      title:"طابق الاتنين",
      subtitle:"دوس على كرتين عشان تلاقي زوج.",
      rule:"طابق نفس الصور.",
      hint:"نصيحة: دوس 🔊 عشان تسمع التعليمات.",
      newBoard:"لوحة جديدة",
      good:"شطّور!",
      bad:"مش نفس الصورة. جرّب تاني.",
      speak: (n, free) => `طابق الصور اللي زي بعض. دوس على كرتين. اللوحة ${n} في ${n}. محاولات غلط مجانية: ${free}.`
    };
  }
  return {
    title:"Match pairs",
    subtitle:"Tap two cards to find a pair.",
    rule:"Match the same pictures.",
    hint:"Tip: Tap 🔊 to hear instructions.",
    newBoard:"New board",
    good:"Nice!",
    bad:"Not a match. Try again.",
    speak: (n, free) => `Match the same pictures. Tap two cards. Board is ${n} by ${n}. Free wrong tries: ${free}.`
  };
}

// Even grid sizes only, mapped to level (max 10).
// Lv 1–3: 2x2
// Lv 4–5: 4x4
// Lv 6–7: 6x6
// Lv 8–10: 8x8  (kept phone-friendly)
function gridSizeForLevel(lv){
  if(lv <= 3) return 2;
  if(lv <= 5) return 4;
  if(lv <= 7) return 6;
  return 8;
}

// “Freebies” scale with difficulty (wrong tries allowed before leveling down)
function freeWrongForGrid(n){
  if(n === 2) return 2;
  if(n === 4) return 10;
  if(n === 6) return 18;
  return 28; // n === 8
}

let settings = getSettings();
let progress = getProgress();

let gridN = 2;
let freeWrong = 2;
let wrongCount = 0;

let firstPickIndex = null;
let lock = false;

let cards = []; // each card: { emoji, matched, faceUp }

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
  document.getElementById("levelPill").textContent = `Lv ${progress.match.level}`;
}

function updateCounters(){
  document.getElementById("triesLine").textContent = `Free wrong tries: ${freeWrong}`;
  document.getElementById("wrongLine").textContent = `Wrong tries: ${wrongCount}`;
}

function buildDeck(){
  // how many unique emojis do we need?
  const totalCards = gridN * gridN;
  const pairsNeeded = totalCards / 2;

  const pool = shuffle(EMOJI_BANK);
  const chosen = pool.slice(0, pairsNeeded);

  const doubled = shuffle([...chosen, ...chosen]);

  cards = doubled.map(e=>({ emoji:e, matched:false, faceUp:false }));
  firstPickIndex = null;
  lock = false;
  wrongCount = 0;

  updateCounters();
}

function renderBoard(){
  const board = document.getElementById("board");
  board.innerHTML = "";

  // columns match grid size
  board.style.gridTemplateColumns = `repeat(${gridN}, 1fr)`;

  cards.forEach((c, idx)=>{
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cardTile";

    if(c.matched){
      btn.classList.add("matched");
      btn.textContent = c.emoji;
    } else if(c.faceUp){
      btn.textContent = c.emoji;
    } else {
      btn.classList.add("faceDown");
      btn.textContent = "❓";
    }

    btn.onclick = ()=> onCardTap(idx);

    board.appendChild(btn);
  });
}

function countMatched(){
  return cards.filter(c=>c.matched).length;
}

async function celebrateWin(){
  launchConfetti(1700);
  await playWinJingle(settings.sound);
}

function handleWrongTry(){
  wrongCount += 1;
  updateCounters();

  // Only level down AFTER exceeding freebies
  if(wrongCount > freeWrong){
    // level down gently
    progress.match.level = Math.max(1, progress.match.level - 1);
    saveProgress();
    updateLevelPill();

    // rebuild board at new level
    startNewBoard();
  }
}

function onCardTap(idx){
  if(lock) return;

  const card = cards[idx];
  if(card.matched) return;
  if(card.faceUp) return;

  clearStatus();

  card.faceUp = true;

  // first pick
  if(firstPickIndex === null){
    firstPickIndex = idx;
    renderBoard();
    return;
  }

  // second pick
  const first = cards[firstPickIndex];
  renderBoard();

  if(first.emoji === card.emoji){
    // match!
    const s = strings(settings.lang);
    setStatus("good", s.good);

    first.matched = true;
    card.matched = true;

    // keep them faceUp
    first.faceUp = true;
    card.faceUp = true;

    firstPickIndex = null;

    renderBoard();

    // win condition
    if(countMatched() === cards.length){
      // level up on win
      progress.match.level = Math.min(10, progress.match.level + 1);
      saveProgress();
      updateLevelPill();

      celebrateWin();

      // start a new board after short delay
      setTimeout(()=> startNewBoard(), 900);
    }

    return;
  }

  // not a match — allow learning (no punishment except tracking wrong tries)
  const s = strings(settings.lang);
  setStatus("bad", s.bad);

  lock = true;
  handleWrongTry();

  // flip both back down after a moment (but keep game calm)
  setTimeout(()=>{
    first.faceUp = false;
    card.faceUp = false;
    firstPickIndex = null;
    lock = false;
    renderBoard();
  }, 650);
}

function buildAndSpeakInstructions(){
  const s = strings(settings.lang);
  const sentence = s.speak(gridN, freeWrong);
  speak(sentence, settings.sound, settings.lang);

  document.getElementById("repeatBtn").onclick = ()=>{
    speak(sentence, settings.sound, settings.lang);
  };
}

function startNewBoard(){
  settings = getSettings();
  progress = getProgress();
  if(!progress.match) progress.match = { level: 1 };

  updateHeaderText();
  updateLevelPill();

  // apply current level -> grid size -> freebies
  gridN = gridSizeForLevel(progress.match.level);
  freeWrong = freeWrongForGrid(gridN);

  buildDeck();
  renderBoard();
  buildAndSpeakInstructions();
  clearStatus();
}

function wireButtons(){
  document.getElementById("newBtn").onclick = ()=> startNewBoard();

  document.getElementById("levelUp").onclick = ()=>{
    progress.match.level = Math.min(10, progress.match.level + 1);
    saveProgress();
    startNewBoard();
  };

  document.getElementById("levelDown").onclick = ()=>{
    progress.match.level = Math.max(1, progress.match.level - 1);
    saveProgress();
    startNewBoard();
  };
}

function init(){
  settings = getSettings();
  progress = getProgress();
  if(!progress.match) progress.match = { level: 1 };

  wireButtons();
  startNewBoard();
}

init();
