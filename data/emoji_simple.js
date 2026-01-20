// Simple, everyday emoji objects for dementia-friendly recognition.
// Keep categories broad, icons obvious, avoid flags/abstract symbols.

export const EMOJI_BANK = [
  // Food (very recognizable)
  "🍎","🍌","🍊","🍉","🍓","🍇","🍐","🍑","🍒","🥝","🍋","🥭",
  "🥕","🌽","🥔","🍞","🧀","🥚","🍗","🍔","🍕","🍟","🥪","🍚","🍜",

  // Animals (common)
  "🐶","🐱","🐭","🐰","🦊","🐻","🐼","🐨","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐟","🐢",

  // Home objects (everyday)
  "🏠","🪑","🛏️","🛋️","🚪","🪟","💡","🔑","🔒","📺","📱","☎️","⌚","🔔","🧸","🎁",

  // Clothing (simple)
  "👕","👖","👟","🧢",

  // Hygiene (simple)
  "🪥","🧼","🧻",

  // Kitchen items
  "🍽️","🥄","🍴","🥤","🫖",

  // School/office (simple)
  "📖","✏️","🖍️","📌",

  // Transport (common)
  "🚗","🚌","🚕","🚑","🚒","🚓","🚲","🛵","🚂","✈️","🚁",

  // Weather/nature (simple)
  "☀️","🌙","⭐","☁️","🌧️","❄️","🌈","💧","🔥",

  // Sports/toys (simple)
  "⚽","🏀","🎈"
];

// A smaller "core" set for target prompts (keeps language naming easy).
// These are the items we will ask the user to find.
export const TARGETS = [
  "🍎","🍌","🐱","🐶","🚗","🏠","☀️","💧","📱","⌚","🔑","📺","🧼","🪥","👟","👕","🥚","🍞","🧸","⚽"
];

// Names for TARGETS in three languages.
// Arabic is intentionally simple / Egyptian-friendly.
// (We only need names for target items, not all distractors.)
export const TARGET_NAMES = {
  "🍎": { en:"apple",  es:"la manzana", ar:"تفاحة" },
  "🍌": { en:"banana", es:"الموز",      ar:"موزة" },
  "🐱": { en:"cat",    es:"el gato",    ar:"قطة" },
  "🐶": { en:"dog",    es:"el perro",   ar:"كلب" },
  "🚗": { en:"car",    es:"el carro",   ar:"عربية" },
  "🏠": { en:"house",  es:"la casa",    ar:"بيت" },
  "☀️": { en:"sun",    es:"el sol",     ar:"شمس" },
  "💧": { en:"water",  es:"el agua",    ar:"ماية" },
  "📱": { en:"phone",  es:"el teléfono",ar:"موبايل" },
  "⌚": { en:"watch",  es:"el reloj",   ar:"ساعة" },
  "🔑": { en:"key",    es:"la llave",   ar:"مفتاح" },
  "📺": { en:"TV",     es:"la tele",    ar:"تليفزيون" },
  "🧼": { en:"soap",   es:"el jabón",   ar:"صابون" },
  "🪥": { en:"toothbrush", es:"el cepillo de dientes", ar:"فرشة أسنان" },
  "👟": { en:"shoe",   es:"el zapato",  ar:"جزمة" },
  "👕": { en:"shirt",  es:"la camisa",  ar:"تي-شيرت" },
  "🥚": { en:"egg",    es:"el huevo",   ar:"بيضة" },
  "🍞": { en:"bread",  es:"el pan",     ar:"عيش" },
  "🧸": { en:"teddy bear", es:"el osito", ar:"دبدوب" },
  "⚽": { en:"soccer ball", es:"la pelota", ar:"كورة" }
};
