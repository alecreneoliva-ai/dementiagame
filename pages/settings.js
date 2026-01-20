import { getSettings, setSettings, resetProgress } from "../assets/app.js";
import { launchConfetti } from "../assets/confetti.js";
import { playWinJingle } from "../assets/audio.js";

function updateSoundButton(){
  const s = getSettings();
  document.getElementById("toggleSoundBtn").textContent = s.sound ? "Sound: On" : "Sound: Off";
}

function saveLocationFromInputs(){
  const s = getSettings();
  const city = document.getElementById("cityInput").value.trim() || "—";
  const state = document.getElementById("stateInput").value.trim() || "—";

  const next = {
    ...s,
    location: { city, state }
  };
  setSettings(next);
}

function init(){
  const s = getSettings();

  // Fill inputs
  document.getElementById("cityInput").value = s.location?.city || "";
  document.getElementById("stateInput").value = s.location?.state || "";

  // Auto-save on typing (caretaker-friendly)
  document.getElementById("cityInput").addEventListener("input", saveLocationFromInputs);
  document.getElementById("stateInput").addEventListener("input", saveLocationFromInputs);

  // Sound toggle
  updateSoundButton();
  document.getElementById("toggleSoundBtn").onclick = ()=>{
    const cur = getSettings();
    setSettings({ ...cur, sound: !cur.sound });
    updateSoundButton();
  };

  // Reset progress
  document.getElementById("resetProgressBtn").onclick = ()=>{
    resetProgress();
    launchConfetti(900);
  };

  // Test celebration
  document.getElementById("testCelebrateBtn").onclick = async ()=>{
    const cur = getSettings();
    launchConfetti(1400);
    await playWinJingle(cur.sound);
  };
}

init();
