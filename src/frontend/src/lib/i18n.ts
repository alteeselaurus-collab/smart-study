import { LEVELS } from "@/types";

/** Interface languages supported by the app. French is the default. */
export type Language = "fr" | "en" | "ar" | "es";

export const DEFAULT_LANGUAGE: Language = "fr";

const SUPPORTED: Language[] = ["fr", "en", "ar", "es"];

/** Normalize any stored language value to a supported interface language. */
export function normalizeLanguage(value: string | null | undefined): Language {
  if (value && (SUPPORTED as string[]).includes(value)) {
    return value as Language;
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Normalize any stored level value against the LEVELS vocabulary.
 * An out-of-vocabulary value (e.g. "6e") falls back to a valid level so
 * lesson queries never blank out.
 */
export function normalizeLevel(
  value: string | null | undefined,
  fallback = "college",
): string {
  if (value && LEVELS.some((l) => l.value === value)) return value;
  return fallback;
}

type Dict = Record<string, string>;

const fr: Dict = {
  "nav.home": "Accueil",
  "nav.subjects": "Matières",
  "nav.revisions": "Révisions",
  "nav.progress": "Progression",
  "nav.profile": "Profil",
  "nav.main": "Navigation principale",
  "nav.mobile": "Navigation mobile",
  "nav.quick": "Navigation rapide",
  "nav.openMenu": "Ouvrir le menu",
  "header.points": "Points gagnés",
  "footer.tagline": "SMART STUDY — ton compagnon d'étude, où que tu sois.",
  "home.greeting": "Bonjour, prêt à apprendre ?",
  "home.slogan": "Apprendre. Comprendre. Maîtriser.",
  "home.explore": "Explorer les matières",
  "home.revise": "Réviser maintenant",
  "home.duration.title": "Apprendre en un temps choisi",
  "home.duration.hint":
    "Choisis une durée : on te prépare un parcours condensé de la leçon.",
  "home.method.title": "La méthode en 7 étapes",
  "home.method.subtitle": "De la découverte à la maîtrise, pas à pas.",
  "home.subjects.title": "Tes matières",
  "home.subjects.seeAll": "Tout voir",
  "home.subjects.empty": "Aucune matière disponible",
  "home.subjects.emptyHint":
    "Les matières apparaîtront ici dès qu'elles seront prêtes.",
  "home.progress.title": "Ta progression",
  "home.program.title": "Ton programme",
  "home.program.subtitle":
    "Adapte le contenu à ton pays, ton programme et ta langue.",
  "home.continue": "Continuer",
  "home.level": "Niveau",
  "home.student": "élève",
  "profile.country": "Pays",
  "profile.curriculum": "Programme",
  "profile.language": "Langue",
  "profile.chooseCountry": "Choisir un pays",
  "profile.chooseCurriculum": "Choisir un programme",
  "profile.chooseLanguage": "Choisir une langue",
  "rewards.points": "Points",
  "rewards.level": "Niveau",
  "rewards.badges": "Badges",
  "rewards.empty": "Réussis tes premières activités pour débloquer des badges.",
  "subject.all": "Toutes les matières",
  "subject.filterLevel": "Filtrer par niveau",
  "subject.openLesson": "Ouvrir la leçon",
  "subject.mastery": "Maîtrise",
  "subject.notStarted": "Pas encore commencé",
  "subject.explanation": "Explication",
  "subject.example": "Exemple",
  "subject.keyPoints": "Points clés",
  "subject.empty": "Aucun cours pour ce niveau",
  "subject.emptyHint": "Essaie un autre niveau pour découvrir d'autres leçons.",
  "subject.error": "Impossible de charger les cours",
  "subject.errorHint": "Vérifie ta connexion puis réessaie.",
  "subject.retry": "Réessayer",
};

const en: Dict = {
  "nav.home": "Home",
  "nav.subjects": "Subjects",
  "nav.revisions": "Revision",
  "nav.progress": "Progress",
  "nav.profile": "Profile",
  "nav.main": "Main navigation",
  "nav.mobile": "Mobile navigation",
  "nav.quick": "Quick navigation",
  "nav.openMenu": "Open menu",
  "header.points": "Points earned",
  "footer.tagline": "SMART STUDY — your study companion, wherever you are.",
  "home.greeting": "Hello, ready to learn?",
  "home.slogan": "Learn. Understand. Master.",
  "home.explore": "Explore subjects",
  "home.revise": "Revise now",
  "home.duration.title": "Learn in the time you have",
  "home.duration.hint":
    "Pick a duration: we build a condensed path through the lesson.",
  "home.method.title": "The 7-step method",
  "home.method.subtitle": "From discovery to mastery, step by step.",
  "home.subjects.title": "Your subjects",
  "home.subjects.seeAll": "See all",
  "home.subjects.empty": "No subjects available",
  "home.subjects.emptyHint":
    "Subjects will appear here as soon as they're ready.",
  "home.progress.title": "Your progress",
  "home.program.title": "Your curriculum",
  "home.program.subtitle":
    "Adapt the content to your country, curriculum and language.",
  "home.continue": "Continue",
  "home.level": "Level",
  "home.student": "student",
  "profile.country": "Country",
  "profile.curriculum": "Curriculum",
  "profile.language": "Language",
  "profile.chooseCountry": "Choose a country",
  "profile.chooseCurriculum": "Choose a curriculum",
  "profile.chooseLanguage": "Choose a language",
  "rewards.points": "Points",
  "rewards.level": "Level",
  "rewards.badges": "Badges",
  "rewards.empty": "Complete your first activities to unlock badges.",
  "subject.all": "All subjects",
  "subject.filterLevel": "Filter by level",
  "subject.openLesson": "Open lesson",
  "subject.mastery": "Mastery",
  "subject.notStarted": "Not started yet",
  "subject.explanation": "Explanation",
  "subject.example": "Example",
  "subject.keyPoints": "Key points",
  "subject.empty": "No lessons for this level",
  "subject.emptyHint": "Try another level to discover more lessons.",
  "subject.error": "Could not load lessons",
  "subject.errorHint": "Check your connection and try again.",
  "subject.retry": "Retry",
};

const ar: Dict = {
  "nav.home": "الرئيسية",
  "nav.subjects": "المواد",
  "nav.revisions": "المراجعة",
  "nav.progress": "التقدم",
  "nav.profile": "الملف الشخصي",
  "nav.main": "التنقل الرئيسي",
  "nav.mobile": "تنقل الجوال",
  "nav.quick": "تنقل سريع",
  "nav.openMenu": "فتح القائمة",
  "header.points": "النقاط المكتسبة",
  "footer.tagline": "SMART STUDY — رفيقك في الدراسة أينما كنت.",
  "home.greeting": "مرحبًا، هل أنت مستعد للتعلم؟",
  "home.slogan": "تعلّم. افهم. أتقن.",
  "home.explore": "استكشف المواد",
  "home.revise": "راجع الآن",
  "home.duration.title": "تعلّم في الوقت الذي تختاره",
  "home.duration.hint": "اختر مدة: نجهّز لك مسارًا مختصرًا للدرس.",
  "home.method.title": "الطريقة في 7 خطوات",
  "home.method.subtitle": "من الاكتشاف إلى الإتقان، خطوة بخطوة.",
  "home.subjects.title": "موادك",
  "home.subjects.seeAll": "عرض الكل",
  "home.subjects.empty": "لا توجد مواد متاحة",
  "home.subjects.emptyHint": "ستظهر المواد هنا بمجرد أن تصبح جاهزة.",
  "home.progress.title": "تقدمك",
  "home.program.title": "برنامجك",
  "home.program.subtitle": "كيّف المحتوى حسب بلدك وبرنامجك ولغتك.",
  "home.continue": "متابعة",
  "home.level": "المستوى",
  "home.student": "طالب",
  "profile.country": "البلد",
  "profile.curriculum": "البرنامج",
  "profile.language": "اللغة",
  "profile.chooseCountry": "اختر بلدًا",
  "profile.chooseCurriculum": "اختر برنامجًا",
  "profile.chooseLanguage": "اختر لغة",
  "rewards.points": "النقاط",
  "rewards.level": "المستوى",
  "rewards.badges": "الشارات",
  "rewards.empty": "أكمل أنشطتك الأولى لفتح الشارات.",
  "subject.all": "كل المواد",
  "subject.filterLevel": "تصفية حسب المستوى",
  "subject.openLesson": "افتح الدرس",
  "subject.mastery": "الإتقان",
  "subject.notStarted": "لم يبدأ بعد",
  "subject.explanation": "الشرح",
  "subject.example": "مثال",
  "subject.keyPoints": "النقاط الأساسية",
  "subject.empty": "لا توجد دروس لهذا المستوى",
  "subject.emptyHint": "جرّب مستوى آخر لاكتشاف دروس أخرى.",
  "subject.error": "تعذّر تحميل الدروس",
  "subject.errorHint": "تحقق من اتصالك ثم أعد المحاولة.",
  "subject.retry": "إعادة المحاولة",
};

const es: Dict = {
  "nav.home": "Inicio",
  "nav.subjects": "Materias",
  "nav.revisions": "Repaso",
  "nav.progress": "Progreso",
  "nav.profile": "Perfil",
  "nav.main": "Navegación principal",
  "nav.mobile": "Navegación móvil",
  "nav.quick": "Navegación rápida",
  "nav.openMenu": "Abrir el menú",
  "header.points": "Puntos ganados",
  "footer.tagline":
    "SMART STUDY — tu compañero de estudio, dondequiera que estés.",
  "home.greeting": "Hola, ¿listo para aprender?",
  "home.slogan": "Aprender. Comprender. Dominar.",
  "home.explore": "Explorar materias",
  "home.revise": "Repasar ahora",
  "home.duration.title": "Aprende en el tiempo que elijas",
  "home.duration.hint":
    "Elige una duración: preparamos un recorrido condensado de la lección.",
  "home.method.title": "El método en 7 pasos",
  "home.method.subtitle": "Del descubrimiento al dominio, paso a paso.",
  "home.subjects.title": "Tus materias",
  "home.subjects.seeAll": "Ver todo",
  "home.subjects.empty": "No hay materias disponibles",
  "home.subjects.emptyHint":
    "Las materias aparecerán aquí en cuanto estén listas.",
  "home.progress.title": "Tu progreso",
  "home.program.title": "Tu programa",
  "home.program.subtitle":
    "Adapta el contenido a tu país, tu programa y tu idioma.",
  "home.continue": "Continuar",
  "home.level": "Nivel",
  "home.student": "estudiante",
  "profile.country": "País",
  "profile.curriculum": "Programa",
  "profile.language": "Idioma",
  "profile.chooseCountry": "Elegir un país",
  "profile.chooseCurriculum": "Elegir un programa",
  "profile.chooseLanguage": "Elegir un idioma",
  "rewards.points": "Puntos",
  "rewards.level": "Nivel",
  "rewards.badges": "Insignias",
  "rewards.empty":
    "Completa tus primeras actividades para desbloquear insignias.",
  "subject.all": "Todas las materias",
  "subject.filterLevel": "Filtrar por nivel",
  "subject.openLesson": "Abrir la lección",
  "subject.mastery": "Dominio",
  "subject.notStarted": "Aún no empezado",
  "subject.explanation": "Explicación",
  "subject.example": "Ejemplo",
  "subject.keyPoints": "Puntos clave",
  "subject.empty": "No hay lecciones para este nivel",
  "subject.emptyHint": "Prueba otro nivel para descubrir más lecciones.",
  "subject.error": "No se pudieron cargar las lecciones",
  "subject.errorHint": "Comprueba tu conexión e inténtalo de nuevo.",
  "subject.retry": "Reintentar",
};

const DICTIONARIES: Record<Language, Dict> = { fr, en, ar, es };

/** Translate a key for the given interface language, falling back to French. */
export function translate(language: Language, key: string): string {
  return DICTIONARIES[language]?.[key] ?? fr[key] ?? key;
}

/** Build a translator bound to one interface language. */
export function createTranslator(language: Language) {
  return (key: string) => translate(language, key);
}

/** Whether the language renders right-to-left. */
export function isRtl(language: Language): boolean {
  return language === "ar";
}
