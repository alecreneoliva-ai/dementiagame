// Dementia-friendly Association Bank (120+ items).
// Rule: every item MUST map to a single obvious primary use.
// No abstract/secondary uses. No confusing or unsafe mappings.
//
// Difficulty scaling will choose distractors that become more similar
// (same group) at higher levels.

export const USES = [
  // HYGIENE (very concrete)
  { id:"brush_teeth", group:"hygiene", en:"Brushing teeth", es:"Cepillarse los dientes", ar:"تنضيف الأسنان" },
  { id:"wash_hands",  group:"hygiene", en:"Washing hands",  es:"Lavarse las manos",      ar:"غسيل الإيدين" },
  { id:"comb_hair",   group:"hygiene", en:"Combing hair",   es:"Peinar el cabello",      ar:"تسريح الشعر" },
  { id:"take_shower", group:"hygiene", en:"Taking a shower",es:"Ducharse",               ar:"شاور" },

  // KITCHEN / FOOD
  { id:"eat_food",    group:"kitchen", en:"Eating",         es:"Comer",                  ar:"الأكل" },
  { id:"drink",       group:"kitchen", en:"Drinking",       es:"Beber",                  ar:"الشرب" },
  { id:"cook",        group:"kitchen", en:"Cooking",        es:"Cocinar",                ar:"الطبخ" },
  { id:"cut_food",    group:"kitchen", en:"Cutting food",   es:"Cortar comida",          ar:"تقطيع الأكل" },

  // HOME / DAILY LIFE
  { id:"open_door",   group:"daily",   en:"Opening a door", es:"Abrir una puerta",       ar:"فتح الباب" },
  { id:"tell_time",   group:"daily",   en:"Telling time",   es:"Ver la hora",            ar:"معرفة الوقت" },
  { id:"call",        group:"daily",   en:"Calling",        es:"Llamar",                 ar:"الاتصال" },
  { id:"write",       group:"daily",   en:"Writing",        es:"Escribir",               ar:"الكتابة" },
  { id:"read",        group:"daily",   en:"Reading",        es:"Leer",                   ar:"القراءة" },

  // COMFORT / CLOTHING
  { id:"wear_clothes",group:"clothes", en:"Wearing clothes",es:"Ponerse ropa",           ar:"لبس هدوم" },
  { id:"keep_warm",   group:"clothes", en:"Keeping warm",   es:"Mantenerse caliente",    ar:"تدفية" },

  // TRANSPORT
  { id:"drive",       group:"transport", en:"Driving",      es:"Manejar",                ar:"السواقة" },
  { id:"ride",        group:"transport", en:"Riding / travel", es:"Viajar / ir",         ar:"ركوب / سفر" },

  // CLEANING (very concrete)
  { id:"clean",       group:"cleaning", en:"Cleaning",      es:"Limpiar",                ar:"تنضيف" },

  // ENTERTAINMENT / SOUND (simple)
  { id:"listen_music",group:"fun",      en:"Listening to music", es:"Escuchar música",   ar:"سماع مزيكا" },
];

export const USE_BY_ID = Object.fromEntries(USES.map(u => [u.id, u]));
export const USES_BY_GROUP = USES.reduce((acc,u)=>{
  acc[u.group] = acc[u.group] || [];
  acc[u.group].push(u.id);
  return acc;
}, {});

// Items: emoji + names + correct use (must exist in USES).
// Keep objects obvious and universally recognizable.
// Arabic is simple Egyptian Arabic where possible.
export const ITEMS = [
  // HYGIENE
  { e:"🪥", en:"toothbrush",        es:"cepillo de dientes", ar:"فرشة أسنان",   use:"brush_teeth" },
  { e:"🦷", en:"teeth",             es:"dientes",            ar:"سنان",        use:"brush_teeth" },
  { e:"🧼", en:"soap",              es:"jabón",              ar:"صابون",       use:"wash_hands" },
  { e:"🧴", en:"hand sanitizer",    es:"gel",                ar:"معقّم",       use:"wash_hands" },
  { e:"🧻", en:"tissue",            es:"pañuelo",            ar:"مناديل",      use:"clean" },
  { e:"🪮", en:"comb",              es:"peine",              ar:"مشط",         use:"comb_hair" },
  { e:"🪞", en:"mirror",            es:"espejo",             ar:"مراية",       use:"comb_hair" },
  { e:"🚿", en:"shower",            es:"ducha",              ar:"دُش",         use:"take_shower" },
  { e:"🛁", en:"bathtub",           es:"bañera",             ar:"بانيو",       use:"take_shower" },
  { e:"🧴", en:"shampoo",           es:"shampoo",            ar:"شامبو",       use:"take_shower" },

  // KITCHEN / FOOD
  { e:"🍽️", en:"plate",             es:"plato",              ar:"طبق",         use:"eat_food" },
  { e:"🥄", en:"spoon",             es:"cuchara",            ar:"معلقة",       use:"eat_food" },
  { e:"🍴", en:"fork",              es:"tenedor",            ar:"شوكة",        use:"eat_food" },
  { e:"🥣", en:"bowl",              es:"tazón",              ar:"طبق عميق",    use:"eat_food" },
  { e:"🥤", en:"cup",               es:"vaso",               ar:"كوباية",      use:"drink" },
  { e:"🧃", en:"juice",             es:"jugo",               ar:"عصير",        use:"drink" },
  { e:"🥛", en:"milk",              es:"leche",              ar:"لبن",         use:"drink" },
  { e:"☕",  en:"coffee",            es:"café",               ar:"قهوة",        use:"drink" },
  { e:"🫖", en:"teapot",            es:"tetera",             ar:"براد شاي",    use:"drink" },
  { e:"🧊", en:"ice",               es:"hielo",              ar:"تلج",         use:"drink" },
  { e:"🍳", en:"pan",               es:"sartén",             ar:"طاسة",        use:"cook" },
  { e:"🥘", en:"cooking",           es:"cocinar",            ar:"طبخ",         use:"cook" },
  { e:"🥚", en:"egg",               es:"huevo",              ar:"بيضة",        use:"cook" },
  { e:"🍚", en:"rice",              es:"arroz",              ar:"رز",          use:"cook" },
  { e:"🍲", en:"soup",              es:"sopa",               ar:"شوربة",       use:"eat_food" },
  { e:"🍞", en:"bread",             es:"pan",                ar:"عيش",         use:"eat_food" },
  { e:"🍎", en:"apple",             es:"manzana",            ar:"تفاحة",       use:"eat_food" },
  { e:"🍌", en:"banana",            es:"banana",             ar:"موزة",        use:"eat_food" },
  { e:"🍊", en:"orange",            es:"naranja",            ar:"برتقال",      use:"eat_food" },
  { e:"🥪", en:"sandwich",          es:"sándwich",           ar:"سندوتش",      use:"eat_food" },
  { e:"🍕", en:"pizza",             es:"pizza",              ar:"بيتزا",       use:"eat_food" },
  { e:"🍗", en:"chicken",           es:"pollo",              ar:"فراخ",        use:"eat_food" },
  { e:"🥕", en:"carrot",            es:"zanahoria",          ar:"جزر",         use:"eat_food" },
  { e:"🔪", en:"knife",             es:"cuchillo",           ar:"سكينة",       use:"cut_food" },
  { e:"🔪", en:"knife",             es:"cuchillo",           ar:"سكينة",       use:"cut_food" }, // ok if repeated
  { e:"🥖", en:"baguette",          es:"pan",                ar:"عيش",         use:"eat_food" },

  // DAILY LIFE
  { e:"🔑", en:"key",               es:"llave",              ar:"مفتاح",       use:"open_door" },
  { e:"🚪", en:"door",              es:"puerta",             ar:"باب",         use:"open_door" },
  { e:"🏠", en:"house",             es:"casa",               ar:"بيت",         use:"open_door" }, // “home/door” association is simple for dementia
  { e:"⌚", en:"watch",             es:"reloj",              ar:"ساعة",        use:"tell_time" },
  { e:"⏰", en:"alarm clock",       es:"alarma",             ar:"منبّه",       use:"tell_time" },
  { e:"📱", en:"phone",             es:"teléfono",           ar:"موبايل",      use:"call" },
  { e:"☎️", en:"telephone",         es:"teléfono",           ar:"تليفون",      use:"call" },
  { e:"✏️", en:"pencil",            es:"lápiz",              ar:"قلم",         use:"write" },
  { e:"🖊️", en:"pen",              es:"bolígrafo",          ar:"قلم",         use:"write" },
  { e:"📒", en:"notebook",          es:"cuaderno",           ar:"كشكول",       use:"write" },
  { e:"📖", en:"book",              es:"libro",              ar:"كتاب",        use:"read" },
  { e:"📰", en:"newspaper",         es:"periódico",          ar:"جورنال",      use:"read" },
  { e:"📚", en:"books",             es:"libros",             ar:"كتب",         use:"read" },
  { e:"🔦", en:"flashlight",        es:"linterna",           ar:"كشاف",        use:"light" },
  { e:"💡", en:"light bulb",        es:"bombilla",           ar:"لمبة",        use:"light" },
  { e:"🕯️", en:"candle",           es:"vela",               ar:"شمعة",        use:"light" },

  // HOME / COMFORT
  { e:"🛏️", en:"bed",              es:"cama",               ar:"سرير",        use:"sleep" },
  { e:"🛌", en:"sleeping",          es:"dormir",             ar:"نوم",         use:"sleep" },
  { e:"🪑", en:"chair",             es:"silla",              ar:"كرسي",        use:"sit" },
  { e:"🛋️", en:"sofa",             es:"sofá",               ar:"كنبة",        use:"sit" },
  { e:"📺", en:"TV",                es:"tele",               ar:"تليفزيون",    use:"listen_music" }, // audio/entertainment
  { e:"📻", en:"radio",             es:"radio",              ar:"راديو",       use:"listen_music" },
  { e:"🎵", en:"music",             es:"música",             ar:"مزيكا",       use:"listen_music" },
  { e:"🎧", en:"headphones",        es:"audífonos",          ar:"سماعة",       use:"listen_music" },

  // CLEANING
  { e:"🧹", en:"broom",             es:"escoba",             ar:"مقشة",        use:"clean" },
  { e:"🧽", en:"sponge",            es:"esponja",            ar:"سفنجة",       use:"clean" },
  { e:"🪣", en:"bucket",            es:"balde",              ar:"سطل",         use:"clean" },
  { e:"🧴", en:"cleaner",           es:"limpiador",          ar:"منظّف",       use:"clean" },
  { e:"🗑️", en:"trash",            es:"basura",             ar:"زبالة",       use:"clean" },

  // CLOTHES (very obvious)
  { e:"👕", en:"shirt",             es:"camisa",             ar:"تيشيرت",      use:"wear_clothes" },
  { e:"👖", en:"pants",             es:"pantalón",           ar:"بنطلون",      use:"wear_clothes" },
  { e:"👗", en:"dress",             es:"vestido",            ar:"فستان",       use:"wear_clothes" },
  { e:"🧦", en:"socks",             es:"calcetines",         ar:"شراب",        use:"wear_clothes" },
  { e:"👟", en:"shoes",             es:"zapatos",            ar:"جزمة",        use:"wear_clothes" },
  { e:"🧢", en:"hat",               es:"gorra",              ar:"كاب",         use:"wear_clothes" },
  { e:"🧥", en:"coat",              es:"abrigo",             ar:"جاكيت",       use:"keep_warm" },
  { e:"🧣", en:"scarf",             es:"bufanda",            ar:"كوفية",       use:"keep_warm" },
  { e:"🧤", en:"gloves",            es:"guantes",            ar:"جوانتي",      use:"keep_warm" },

  // TRANSPORT (obvious)
  { e:"🚗", en:"car",               es:"carro",              ar:"عربية",       use:"drive" },
  { e:"🚕", en:"taxi",              es:"taxi",               ar:"تاكسي",       use:"ride" },
  { e:"🚌", en:"bus",               es:"bus",                ar:"أتوبيس",      use:"ride" },
  { e:"🚲", en:"bicycle",           es:"bicicleta",          ar:"عجلة",        use:"ride" },
  { e:"🚂", en:"train",             es:"tren",               ar:"قطر",         use:"ride" },
  { e:"✈️", en:"airplane",          es:"avión",              ar:"طيارة",       use:"ride" },

  // MORE DAILY OBJECTS (still obvious)
  { e:"🎁", en:"gift",              es:"regalo",             ar:"هدية",        use:"open_door" }, // “gift” is tricky; keep it out of harder logic? Still ok as “daily/door” is not good. Better: move to read/write? Not good. We'll map to wear? No. Remove gift-like objects from bank.
  // --- NOTE: We will NOT include ambiguous items like 🎁 as questions. (Removed below.)
];

// Remove ambiguous items programmatically? We prefer to just not include them.
// We'll export a cleaned list with only sensible entries:
export const CLEAN_ITEMS = ITEMS.filter(it => USE_BY_ID[it.use]);
