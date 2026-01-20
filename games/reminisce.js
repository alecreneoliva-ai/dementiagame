import { getSettings, getProgress } from "../assets/app.js";
import { launchConfetti } from "../assets/confetti.js";
import { playWinJingle } from "../assets/audio.js";
import { CLEAN_ITEMS, USE_BY_ID, USES_BY_GROUP } from "../data/association_bank.js";

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

function uiStrings(lang){
  if(lang === "es"){
    return {
      title:"Asociación",
      subtitle:"¿Para qué se usa?",
      hint:"Consejo: Toca 🔊 para escuchar la pregunta.",
      next:"Siguiente",
      easier:"⬅️ Más fácil",
      harder:"➡️ Más difícil",
      good:"¡Bien!",
      bad:"Intenta otra vez.",
      q:"¿Para qué se usa esto?"
    };
  }
  if(lang === "ar"){
    return {
      title:"توصيل المعنى",
      subtitle:"بنستخدمه في إيه؟",
      hint:"نصيحة: دوس 🔊 عشان تسمع السؤال.",
      next:"التالي",
      easier:"⬅️ أسهل",
      harder:"➡️ أصعب",
      good:"شطّور!",
      bad:"جرّب تاني.",
      q:"بنستخدم ده في إيه؟"
    };
  }
  return {
    title:"Association",
    subtitle:"What is it used for?",
    hint:"Tip: Tap 🔊 to hear the question.",
    next:"Next",
    easier:"⬅️ Easier",
    harder:"➡️ Harder",
    good:"Nice!",
    bad:"Try again.",
    q:"What do you use this for?"
  };
}

// Level controls:
// 1–3: distractors from OTHER groups (very easy)
// 4–6: 1 distractor from same group + 2 from other groups (medium)
// 7–10: all distractors from same group (hard)
function buildChoices(correctUseId, level){
  const correct = USE_BY_ID[correctUseId];
  const group = correct.group;

  const sameGroup = (USES_BY_GROUP[group] || []).filter(id => id !== correctUseId);
  const otherGroups = Object.keys(USE_BY_ID).filter(id => id !== correctUseId && USE_BY_ID[id].group !== group);

  const pickMany = (pool, n) => shuffle(pool).slice(0, n);

  if(level <= 3){
    const d = pickMany(otherGroups, 3);
    return shuffle([correctUseId, ...d]);
  }

  if(level <= 6){
    const oneSame = pickMany(sameGroup.length ? sameGroup : otherGroups, 1);
    const twoOther = pickMany(otherGroups.filter(x => !oneSame.includes(x)), 2);
    return shuffle([correctUseId, ...oneSame, ...twoOther]);
  }

  // 7–10
  const threeSame = pickMany(sameGroup.length >= 3 ? sameGroup : otherGroups, 3);
  return shuffle([correctUseId, ...threeSame]);
}

function setSizeForLevel(lv){
  if(lv <= 3) return 5;
  if(lv <= 6) return 6;
  return 7;
}

let settings;
let progress;
let t;

let totalInSet = 5;
let indexInSet = 0;
let correctInSet = 0;

let currentItem = null;
let currentChoices = [];
let currentSpoken = "";
let locked = false;

// Keep a “recent” history to avoid repeats (helps engagement)
const RECENT_MAX = 12;
let recentEmojis = [];

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

function labelForUse(useId){
  const u = USE_BY_ID[useId];
  if(settings.lang === "es") return u.es;
  if(settings.lang === "ar") return u.ar;
  return u.en;
}

function renderPill(){
  const lv = progress.assoc.level;
  document.getElementById("countPill").textContent = `Lv ${lv} • ${indexInSet+1} / ${totalInSet}`;
}

function pickNonRecentItem(){
  // Try a few times to avoid repeats
  for(let i=0;i<20;i++){
    const it = pick(CLEAN_ITEMS);
    if(!recentEmojis.includes(it.e)){
      recentEmojis.push(it.e);
      if(recentEmojis.length > RECENT_MAX) recentEmojis.shift();
      return it;
    }
  }
  // fallback
  const it = pick(CLEAN_ITEMS);
  recentEmojis.push(it.e);
  if(recentEmojis.length > RECENT_MAX) recentEmojis.shift();
  return it;
}

function buildPrompt(){
  locked = false;
  clearStatus();

  currentItem = pickNonRecentItem();

  const lv = progress.assoc.level;
  currentChoices = buildChoices(currentItem.use, lv);

  // Simple question only (object is the icon)
  currentSpoken = t.q;

  document.getElementById("emojiBig").textContent = currentItem.e;
  document.getElementById("questionText").textContent = t.q;

  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";
  choicesEl.style.gridTemplateColumns = "repeat(1, 1fr)";

  currentChoices.forEach((useId)=>{
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choiceBtn";
    btn.textContent = labelForUse(useId);
    btn.onclick = ()=> onAnswer(useId);
    choicesEl.appendChild(btn);
  });

  renderPill();
  speak(currentSpoken, settings.sound, settings.lang);
}

async function celebrateSet(){
  launchConfetti(1700);
  await playWinJingle(settings.sound);
}

function startNewSet(){
  totalInSet = setSizeForLevel(progress.assoc.level);
  indexInSet = 0;
  correctInSet = 0;
  buildPrompt();
}

function nextQuestion(){
  indexInSet += 1;

  if(indexInSet >= totalInSet){
    // Gentle level up if “most” correct
    if(correctInSet >= Math.ceil(totalInSet * 0.6)){
      progress.assoc.level = Math.min(10, progress.assoc.level + 1);
      saveProgress();
      celebrateSet();
      setStatus("good", "🎉");
    } else {
      setStatus("good", "✅");
    }

    setTimeout(()=> startNewSet(), 850);
    return;
  }

  buildPrompt();
}

function onAnswer(chosenUseId){
  if(locked) return;
  locked = true;

  if(chosenUseId === currentItem.use){
    correctInSet += 1;
    setStatus("good", t.good);
    setTimeout(()=> nextQuestion(), 520);
  } else {
    // Wrong: retry allowed (dementia-friendly)
    setStatus("bad", t.bad);
    setTimeout(()=>{
      locked = false;
      clearStatus();
    }, 430);
  }
}

function init(){
  settings = getSettings();
  progress = getProgress();

  // Ensure assoc exists in stored progress
  if(!progress.assoc) progress.assoc = { level: 1 };

  t = uiStrings(settings.lang);
  setRTL(settings.lang);

  document.getElementById("title").textContent = t.title;
  document.getElementById("subtitle").textContent = t.subtitle;
  document.getElementById("hint").textContent = t.hint;
  document.getElementById("nextBtn").textContent = t.next;

  // Speak
  document.getElementById("speakBtn").onclick = ()=>{
    speak(currentSpoken, settings.sound, settings.lang);
  };

  // Skip (caregiver-friendly)
  document.getElementById("nextBtn").onclick = ()=> nextQuestion();

  // Level buttons (must exist in HTML)
  const up = document.getElementById("levelUp");
  const down = document.getElementById("levelDown");
  if(up && down){
    up.textContent = t.harder;
    down.textContent = t.easier;

    up.onclick = ()=>{
      progress.assoc.level = Math.min(10, progress.assoc.level + 1);
      saveProgress();
      startNewSet();
    };

    down.onclick = ()=>{
      progress.assoc.level = Math.max(1, progress.assoc.level - 1);
      saveProgress();
      startNewSet();
    };
  }

  startNewSet();
}

init();
