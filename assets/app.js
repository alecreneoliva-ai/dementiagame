export const STR = {
  en: {
    title:"Brain Activities",
    homeHint:"Pick a game.",
    find:"🔎 Find the picture",
    match:"🧠 Match pairs",
    order:"🔢 Order numbers",
    back:"← Back",
    repeat:"Repeat",
    next:"Next",
    tip:"Tip: one tap only. Slow and calm.",
    good:"Great! 👏",
    bad:"Not that one… try again",
    warm:"Starting."
  },
  es: {
    title:"Actividades Mentales",
    homeHint:"Elige un juego.",
    find:"🔎 Encuentra la imagen",
    match:"🧠 Empareja",
    order:"🔢 Ordena números",
    back:"← Volver",
    repeat:"Repetir",
    next:"Siguiente",
    tip:"Consejo: un toque. Despacio y tranquilo.",
    good:"¡Muy bien! 👏",
    bad:"No… intenta otra vez",
    warm:"Empezando."
  },
  ar: {
    title:"تمارين مخ بسيطة",
    homeHint:"اختار لعبة.",
    find:"🔎 اختار الصورة",
    match:"🧠 طابق الاتنين",
    order:"🔢 رتب الأرقام",
    back:"← رجوع",
    repeat:"كرر",
    next:"سؤال جديد",
    tip:"نصيحة: ضغطة واحدة. بالراحة.",
    good:"تمام! 👏",
    bad:"مش دي… جرّب تاني",
    warm:"يلا."
  }
};

export function getState(){
  const lang = localStorage.getItem("brain_lang") || "en";
  const sound = (localStorage.getItem("brain_sound") ?? "on") === "on";
  return { lang, sound };
}

export function setLang(lang){
  localStorage.setItem("brain_lang", lang);
}

export function setSound(on){
  localStorage.setItem("brain_sound", on ? "on" : "off");
}

export function applyDir(lang){
  const root = document.documentElement;
  if(lang === "ar"){ root.lang="ar"; root.dir="rtl"; }
  else { root.lang=lang; root.dir="ltr"; }
}

export function speak(text, lang, enabled=true){
  if(!enabled) return;
  try{
    if(!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = (lang==="ar") ? "ar-EG" : (lang==="es" ? "es-ES" : "en-US");
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }catch(e){}
}

const defaultProg = {
  find: { level:1, streak:0, misses:0 },
  match:{ level:1, streak:0, misses:0 },
  order:{ level:1, streak:0, misses:0 }
};

export function loadProg(){
  try{
    const raw = localStorage.getItem("brain_prog");
    if(!raw) return structuredClone(defaultProg);
    const p = JSON.parse(raw);
    return {
      find: { ...defaultProg.find, ...(p.find||{}) },
      match:{ ...defaultProg.match,...(p.match||{}) },
      order:{ ...defaultProg.order,...(p.order||{}) }
    };
  }catch(e){ return structuredClone(defaultProg); }
}

export function saveProg(prog){
  try{ localStorage.setItem("brain_prog", JSON.stringify(prog)); }catch(e){}
}

export function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }

export function markCorrect(prog, game){
  const p = prog[game];
  p.streak += 1;
  p.misses = 0;
  if(p.streak >= 3){
    p.level = clamp(p.level + 1, 1, 5);
    p.streak = 0;
  }
  saveProg(prog);
}

export function markWrong(prog, game){
  const p = prog[game];
  p.misses += 1;
  p.streak = 0;
  if(p.misses >= 3){
    p.level = clamp(p.level - 1, 1, 5);
    p.misses = 0;
  }
  saveProg(prog);
}

/**
 * Wire up the header controls. Requires elements:
 *  - #langSelect (select)
 *  - #soundBtn (button)
 *  - #levelPill (span) optional
 */
export function initHeader({ game=null } = {}){
  const { lang, sound } = getState();
  applyDir(lang);

  const langSelect = document.getElementById("langSelect");
  const soundBtn = document.getElementById("soundBtn");

  if(langSelect){
    langSelect.value = lang;
    langSelect.onchange = () => {
      setLang(langSelect.value);
      location.reload(); // simple + reliable across pages
    };
  }
  if(soundBtn){
    soundBtn.textContent = sound ? "🔊" : "🔇";
    soundBtn.onclick = () => {
      setSound(!sound);
      location.reload();
    };
  }

  // Title text if present
  const titleText = document.getElementById("titleText");
  if(titleText) titleText.textContent = STR[lang].title;

  // Level pill if present
  if(game){
    const prog = loadProg();
    const levelPill = document.getElementById("levelPill");
    if(levelPill) levelPill.textContent = `Lv ${prog[game].level}`;
  }

  return { lang, sound };
}
