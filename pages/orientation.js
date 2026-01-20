import { getSettings } from "../assets/app.js";
import { playWinJingle } from "../assets/audio.js";
import { launchConfetti } from "../assets/confetti.js";

function isArabic(lang){ return lang === "ar"; }

function setRTL(lang){
  document.documentElement.dir = isArabic(lang) ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

function timeOfDay(){
  const h = new Date().getHours();
  if(h < 12) return "morning";
  if(h < 17) return "afternoon";
  return "evening";
}

function formatDate(lang){
  const d = new Date();
  const locale = lang === "es" ? "es" : (lang === "ar" ? "ar" : "en");
  return d.toLocaleDateString(locale, { weekday:"long", year:"numeric", month:"long", day:"numeric" });
}

function formatTime(lang){
  const d = new Date();
  const locale = lang === "es" ? "es" : (lang === "ar" ? "ar" : "en");
  return d.toLocaleTimeString(locale, { hour:"numeric", minute:"2-digit" });
}

function strings(lang){
  if(lang === "es"){
    return {
      title: "Orientación diaria",
      subtitle: "Fecha, hora y lugar.",
      today: "Hoy es",
      time: "Hora",
      place: "Lugar",
      home: "Casa",
      refresh: "Actualizar",
      hint: "Consejo: Toca 🔊 para leer en voz alta.",
      tod: { morning:"mañana", afternoon:"tarde", evening:"noche" },
      speakSentence: (date, time, tod, loc) =>
        `Hoy es ${date}. Son las ${time}. Es ${tod}. Estás en casa, en ${loc.city}, ${loc.state}.`
    };
  }
  if(lang === "ar"){
    return {
      title: "معرفة اليوم",
      subtitle: "التاريخ والوقت والمكان.",
      today: "النهارده",
      time: "الوقت",
      place: "المكان",
      home: "البيت",
      refresh: "تحديث",
      hint: "نصيحة: دوس على 🔊 عشان يقرا بصوت.",
      tod: { morning:"الصبح", afternoon:"الضهر", evening:"بالليل" },
      speakSentence: (date, time, tod, loc) =>
        `النهارده ${date}. الساعة ${time}. دلوقتي ${tod}. إنت في البيت، في ${loc.city}، ${loc.state}.`
    };
  }
  return {
    title: "Daily Orientation",
    subtitle: "Date, time, and place.",
    today: "Today is",
    time: "Time",
    place: "Place",
    home: "Home",
    refresh: "Refresh",
    hint: "Tip: Tap 🔊 to read out loud.",
    tod: { morning:"morning", afternoon:"afternoon", evening:"evening" },
    speakSentence: (date, time, tod, loc) =>
      `Today is ${date}. The time is ${time}. It is ${tod}. You are at home, in ${loc.city}, ${loc.state}.`
  };
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

function render(){
  const settings = getSettings();
  const lang = settings.lang;
  const loc = settings.location;

  setRTL(lang);

  const t = strings(lang);

  document.getElementById("title").textContent = t.title;
  document.getElementById("subtitle").textContent = t.subtitle;

  document.getElementById("labelToday").textContent = t.today;
  document.getElementById("labelTime").textContent = t.time;
  document.getElementById("labelPlace").textContent = t.place;

  // SHOW: Home + City + State
  document.getElementById("placeLine").textContent = `${t.home}, ${loc.city}, ${loc.state}`;

  document.getElementById("refreshBtn").textContent = t.refresh;
  document.getElementById("hint").textContent = t.hint;

  const date = formatDate(lang);
  const time = formatTime(lang);
  const tod = t.tod[timeOfDay()];

  document.getElementById("dateLine").textContent = date;
  document.getElementById("timeLine").textContent = time;

  const sentence = t.speakSentence(date, time, tod, loc);

  document.getElementById("speakBtn").onclick = ()=>{
    speak(sentence, settings.sound, lang);
  };

  document.getElementById("refreshBtn").onclick = ()=>{
    render();
  };

  document.getElementById("celebrateBtn").onclick = async ()=>{
    launchConfetti(1300);
    await playWinJingle(settings.sound);
  };

  // Try to speak on load (some phones require a tap first, that’s okay)
  speak(sentence, settings.sound, lang);
}

render();
