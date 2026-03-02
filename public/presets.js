/* presets.js - library of visual starter presets (separate from QUESTIONS) */

const PRESET_LIBRARY = [
  {
    id: 'basketball_arc',
    title: 'כדורסל',
    templateId: 'quad_abcd',
    params: { a: -0.35, b: 1.8, c: 0.2, d: 0, e: 0, f: 0 },
    instruction: 'נסו לשנות רק a ולראות מה קורה.',
    mission: 'ב-10 שניות: גרמו לשיפוע ליד x=1 להיות קרוב ל-0.'
  },
  {
    id: 'roller_coaster',
    title: 'רכבת הרים',
    templateId: 'quartic_abcd',
    params: { a: 0.08, b: -0.18, c: -1.25, d: 0.55, e: 0.4, f: 0 },
    instruction: 'נסו לשנות רק c ולראות מה קורה.',
    mission: 'ב-10 שניות: צרו אזור אחד לפחות עם שיפוע אפס.'
  },
  {
    id: 'waves',
    title: 'גלים',
    templateId: 'quintic_abcdef',
    params: { a: 0.03, b: -0.14, c: 0.21, d: -0.4, e: 0.9, f: 0.2 },
    instruction: 'נסו לשנות רק b ולראות מה קורה.',
    mission: 'ב-10 שניות: הזיזו את e כך ש-f(0) יהיה חיובי ברור.'
  },
  {
    id: 'bridge',
    title: 'גשר',
    templateId: 'quartic_abcd',
    params: { a: 0.05, b: 0, c: -0.9, d: 0, e: 2.2, f: 0 },
    instruction: 'נסו לשנות רק e ולראות מה קורה.',
    mission: 'ב-10 שניות: הורידו את הגשר כך שיחצה את ציר x.'
  },
  {
    id: 'satellite_dish',
    title: 'צלחת לוויין',
    templateId: 'quad_abcd',
    params: { a: 0.48, b: -0.6, c: -1.4, d: 0, e: 0, f: 0 },
    instruction: 'נסו לשנות רק b ולראות מה קורה.',
    mission: 'ב-10 שניות: מקמו קודקוד קרוב ל-x=0.'
  },
  {
    id: 'rocket_path',
    title: 'מסלול רקטה',
    templateId: 'cubic_abcd',
    params: { a: -0.08, b: 0.1, c: 1.6, d: -0.8, e: 0, f: 0 },
    instruction: 'נסו לשנות רק d ולראות מה קורה.',
    mission: 'ב-10 שניות: הזיזו את d כך שהגרף יעבור מעל הראשית.'
  },
  {
    id: 'city_ramp',
    title: 'רמפת עיר',
    templateId: 'line_ab',
    params: { a: 0, b: 0, c: 1.4, d: -1.2, e: 0, f: 0 },
    instruction: 'נסו לשנות רק c ולראות מה קורה.',
    mission: 'ב-10 שניות: הביאו את השיפוע ל-0.'
  },
  {
    id: 'snail_shell',
    title: 'ספירלה מדומה',
    templateId: 'quintic_abcdef',
    params: { a: -0.02, b: 0.12, c: -0.22, d: 0.25, e: 0.4, f: -0.3 },
    instruction: 'נסו לשנות רק a ולראות מה קורה.',
    mission: 'ב-10 שניות: הפכו את התנהגות הקצה הימנית.'
  },
  {
    id: 'bagrut_classic_1',
    title: 'בגרות קלאסי 1',
    templateId: 'quartic_abcd',
    params: { a: 0.04, b: 0.1, c: -0.7, d: -0.2, e: 1.2, f: 0 },
    instruction: 'נסו לשנות רק d ולראות מה קורה.',
    mission: 'ב-10 שניות: מצאו מיקום עם משיק אופקי.'
  },
  {
    id: 'bagrut_classic_2',
    title: 'בגרות קלאסי 2',
    templateId: 'cubic_abcd',
    params: { a: 0.16, b: -0.7, c: -0.5, d: 1.1, e: 0, f: 0 },
    instruction: 'נסו לשנות רק b ולראות מה קורה.',
    mission: 'ב-10 שניות: הזיזו כך שהגרף יעבור ב-(0,2) בערך.'
  },
  {
    id: 'bagrut_classic_3',
    title: 'בגרות קלאסי 3',
    templateId: 'line_ab',
    params: { a: 0, b: 0, c: -0.8, d: 2.4, e: 0, f: 0 },
    instruction: 'נסו לשנות רק d ולראות מה קורה.',
    mission: 'ב-10 שניות: הביאו חיתוך עם ציר y ל-0.'
  },
  {
    id: 'bagrut_classic_4',
    title: 'בגרות קלאסי 4',
    templateId: 'quad_abcd',
    params: { a: 0.6, b: 0.4, c: -2.2, d: 0, e: 0, f: 0 },
    instruction: 'נסו לשנות רק c ולראות מה קורה.',
    mission: 'ב-10 שניות: העלו את כל הפרבולה מעל ציר x.'
  }
];
