import { getSettings, getProgress, setSettings } from "../assets/app.js";
import { launchConfetti } from "../assets/confetti.js";
import { playWinJingle } from "../assets/audio.js";
import { EMOJI_BANK, TARGETS, TARGET_NAMES } from "../data/emoji_simple.js";

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
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function strings(lang){
  if(lang === "es"){
    return {
      title:"Encuentra la imagen",
      subtitle:"Toca la imagen correcta.",
      findLabel:"Encuentra:",
      next:"Siguiente",
      hint:"Consejo: Toca 🔊 para escuchar la pregunta.",
      good:"¡Bien!",
      bad:"Intenta otra vez.",
      prompt: (name)=>`¿Dónde está ${name}?`
    };
  }
  if(lang === "ar"){
    return {
      title:"دور على الصورة",
      subtitle:"اختار الصورة الصح.",
      findLabel:"دور على:",
      next:"التالي",
      hint:"نصيحة: دوس 🔊 عشان تسمع السؤال.",
      good:"شطّور!",
      bad:"جرّب تاني.",
      prompt: (name)=>`فين ${name}؟`
    };
  }
  return {
    title:"Find the picture",
    subtitle:"Tap the correct picture.",
    findLabel:"Find:",
    next:"Next",
    hint:"Tip: Tap 🔊 to hear the question.",
    good:"Nice!",
    bad:"Try again.",
    prompt: (name)=>`Where is the ${name}?`
  };
}

// Level -> number of choices (more distractors as it gets harder)
function choicesForLevel(lv){
  if(lv <= 2) return 2;     // very easy
  if(lv <= 4) return 4;     // easy
  if(lv <= 6) return 6;     // medium
  if(lv <= 8) return 8;     // harder
  return 10;                // hardest
}

// Progression rules
function correctNeededForLevelUp(lv){
  if(lv <= 2) return 3;
  if(lv <= 5) return 4;
  if(lv <= 8) return 5;
  return 6;
}

let settings = getSettings();
let progress = getProgress();

let currentTargetEmoji = null;
let currentPrompt = "";
let lock = false;

// Track correct streak within the current level (in-memory)
let correctCountThisLevel = 0;

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

function updateUIStatic(){
  const s = strings(settings.lang);
  setRTL(settings.lang);

  document.getElementById("title").textContent = s.title;
  document.getElementById("subtitle").textContent = s.subtitle;
  document.getElementById("promptLabel").textContent = s.findLabel;
  document.getElementById("nextBtn").textContent = s.next;
  document.getElementById("hint").textContent = s.hint;
}

function updateLevelPill(){
  const lv = progress.find.level;
  document.getElementById("levelPill").textContent = `Lv ${lv}`;
}

function buildRound(){
  const lv = progress.find.level;
  const n = choicesForLevel(lv);

  // pick a target from TARGETS
  currentTargetEmoji = pick(TARGETS);

  const name = TARGET_NAMES[currentTargetEmoji]?.[settings.lang] || currentTargetEmoji;
  const s = strings(settings.lang);
  currentPrompt = s.prompt(name);

  // Distractors: from bank excluding target
  const pool = EMOJI_BANK.filter(e => e !== currentTargetEmoji);
  const distractors = shuffle(pool).slice(0, n - 1);

  const all = shuffle([currentTargetEmoji, ...distractors]);

  // Layout grid: 2 columns for small, 3-5 columns for bigger sets
  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";

  let cols = 2;
  if(n >= 6) cols = 3;
  if(n >= 8) cols = 4;
  if(n >= 10) cols = 5;
  choicesEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  all.forEach(emoji=>{
    const btn = document.createElement("button");
    btn.className = "tileBtn";
    btn.type = "button";
    btn.textContent = emoji;

    btn.onclick = ()=> onChoice(emoji);

    choicesEl.appendChild(btn);
  });

  document.getElementById("promptText").textContent = name;

  // Auto-read prompt
  speak(currentPrompt, settings.sound, settings.lang);
}

async function celebrateLevelUp(){
  launchConfetti(1500);
  await playWinJingle(settings.sound);
}

function maybeLevelUp(){
  const lv = progress.find.level;
  const need = correctNeededForLevelUp(lv);

  if(correctCountThisLevel >= need){
    correctCountThisLevel = 0;
    progress.find.level = Math.min(10, lv + 1);
    // store progress
    localStorage.setItem("ba2_progress", JSON.stringify(progress));
    updateLevelPill();
    celebrateLevelUp();
  }
}

function onChoice(emoji){
  if(lock) return;
  lock = true;

  const s = strings(settings.lang);

  if(emoji === currentTargetEmoji){
    setStatus("good", s.good);
    correctCountThisLevel += 1;
    maybeLevelUp();
    setTimeout(()=>{
      lock = false;
      clearStatus();
      buildRound();
    }, 650);
  } else {
    setStatus("bad", s.bad);
    setTimeout(()=>{
      lock = false;
      // allow another try without changing the round
      clearStatus();
    }, 450);
  }
}

function wireButtons(){
  document.getElementById("repeatBtn").onclick = ()=>{
    speak(currentPrompt, settings.sound, settings.lang);
  };

  document.getElementById("nextBtn").onclick = ()=>{
    clearStatus();
    buildRound();
  };

  document.getElementById("levelUp").onclick = ()=>{
    progress.find.level = Math.min(10, progress.find.level + 1);
    localStorage.setItem("ba2_progress", JSON.stringify(progress));
    correctCountThisLevel = 0;
    updateLevelPill();
    buildRound();
  };

  document.getElementById("levelDown").onclick = ()=>{
    progress.find.level = Math.max(1, progress.find.level - 1);
    localStorage.setItem("ba2_progress", JSON.stringify(progress));
    correctCountThisLevel = 0;
    updateLevelPill();
    buildRound();
  };
}

function init(){
  settings = getSettings();
  progress = getProgress();

  // Ensure find exists (if older stored data missing)
  if(!progress.find) progress.find = { level: 1 };

  updateUIStatic();
  updateLevelPill();
  wireButtons();
  buildRound();
}

init();
