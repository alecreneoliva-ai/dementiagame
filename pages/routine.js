import { getSettings } from "../assets/app.js";

function setRTL(lang){
  document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

function strings(lang){
  if(lang === "es"){
    return {
      title: "Rutina diaria",
      subtitle: "Un paso a la vez.",
      stepLabel: "Ahora:",
      hint: "Consejo: Usa Next ➡️ para avanzar.",
      back: "⬅️ Atrás",
      next: "Siguiente ➡️",
      open: "Abrir pantalla completa ↗",
      steps: [
        { name:"🧭 Orientación", url:"./orientation.html" },
        { name:"🔎 Encuentra", url:"../games/find.html" },
        { name:"🧠 Emparejar", url:"../games/match.html" },
        { name:"🔢 Números", url:"../games/order.html" },
        { name:"💬 Asociación", url:"../games/reminisce.html" }
      ]
    };
  }
  if(lang === "ar"){
    return {
      title: "روتين يومي",
      subtitle: "خطوة خطوة.",
      stepLabel: "دلوقتي:",
      hint: "نصيحة: استخدم Next ➡️ عشان تكمل.",
      back: "⬅️ رجوع",
      next: "التالي ➡️",
      open: "افتح كامل ↗",
      steps: [
        { name:"🧭 معرفة اليوم", url:"./orientation.html" },
        { name:"🔎 دور على الصورة", url:"../games/find.html" },
        { name:"🧠 طابق الاتنين", url:"../games/match.html" },
        { name:"🔢 رتب الأرقام", url:"../games/order.html" },
        { name:"💬 توصيل المعنى", url:"../games/reminisce.html" }
      ]
    };
  }
  return {
    title: "Daily Routine",
    subtitle: "One step at a time.",
    stepLabel: "Now:",
    hint: "Tip: Use Next ➡️ to move through the routine.",
    back: "⬅️ Back",
    next: "Next ➡️",
    open: "Open full screen ↗",
    steps: [
      { name:"🧭 Orientation", url:"./orientation.html" },
      { name:"🔎 Find", url:"../games/find.html" },
      { name:"🧠 Match", url:"../games/match.html" },
      { name:"🔢 Numbers", url:"../games/order.html" },
      { name:"💬 Association", url:"../games/reminisce.html" }
    ]
  };
}

const LS_KEY = "ba2_routine_step";

function getStep(){
  const raw = localStorage.getItem(LS_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  if(Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(4, n));
}
function setStep(n){
  localStorage.setItem(LS_KEY, String(n));
}

function render(){
  const settings = getSettings();
  const lang = settings.lang;
  setRTL(lang);

  const t = strings(lang);
  const step = getStep();

  document.getElementById("title").textContent = t.title;
  document.getElementById("subtitle").textContent = t.subtitle;
  document.getElementById("stepLabel").textContent = t.stepLabel;
  document.getElementById("hint").textContent = t.hint;
  document.getElementById("prevBtn").textContent = t.back;
  document.getElementById("nextBtn").textContent = t.next;
  document.getElementById("openFull").textContent = t.open;

  const stepObj = t.steps[step];

  document.getElementById("stepPill").textContent = `Step ${step+1} of ${t.steps.length}`;
  document.getElementById("stepName").textContent = stepObj.name;

  // Load the activity inside the iframe
  const frame = document.getElementById("routineFrame");
  frame.src = stepObj.url;

  // Open full screen link
  const open = document.getElementById("openFull");
  open.href = stepObj.url;

  document.getElementById("prevBtn").onclick = ()=>{
    setStep(Math.max(0, getStep() - 1));
    render();
  };

  document.getElementById("nextBtn").onclick = ()=>{
    const next = getStep() + 1;
    if(next >= t.steps.length){
      setStep(0);
    } else {
      setStep(next);
    }
    render();
  };
}

render();
