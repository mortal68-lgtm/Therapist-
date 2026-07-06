import { useState, useEffect, useRef } from "react";

// ─── Time-of-day palettes ─────────────────────────────────────────
// Morning 05:00-11:59 → warm pastel yellow / optimistic
// ─── Single dark navy/teal palette (Bit-style) ───────────────────
const PALETTE_BASE = {
  bg: "#07131C",
  surface: "#0D1E2B",
  ink: "#C8EDE8",
  inkSoft: "#7AB8B0",
  inkFaint: "#3A6868",
  primary: "#00C8B4",
  primaryDeep: "#007B6E",
  primarySoft: "#0A2830",
  lavender: "#00AECC",
  lavenderSoft: "#092030",
  accent: "#00B4A0",
  accentDeep: "#006E60",
  accentSoft: "#0A2830",
  warn: "#E04040",
  warnSoft: "#2A0A0A",
  gold: "#00C8B4",
  goldSoft: "#0A2830",
  border: "#1A3540",
  divider: "rgba(0,200,180,0.14)",
  gradStart: "#0D2E3A",
  gradEnd: "#0B1E2D",
};

const PALETTE_MORNING = { ...PALETTE_BASE, primary: "#00C8B4", primaryDeep: "#007B6E" };
const PALETTE_NOON    = { ...PALETTE_BASE, primary: "#00B4CC", primaryDeep: "#006E8A" };
const PALETTE_EVENING = { ...PALETTE_BASE, primary: "#00A896", primaryDeep: "#005E54" };


function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "noon";
  return "evening";
}

function getPalette(tod) {
  if (tod === "morning") return PALETTE_MORNING;
  if (tod === "noon") return PALETTE_NOON;
  return PALETTE_EVENING;
}

// Global reactive palette — all components read from this
let C = getPalette(getTimeOfDay());

const RADIUS_XL = 30;
const RADIUS_LG = 26;
const RADIUS_MD = 20;
const RADIUS_PILL = 999;

// ─── Mock Data ────────────────────────────────────────────────────
const BEHAVIORS = ["חרדה", "התפרצות זעם", "הימנעות", "בכי", "דחיינות", "אחר"];
const ANTECEDENTS = ["בבית", "בעבודה", "אחרי ויכוח", "לאחר שינה גרועה", "בחברה", "לבד"];
const CONSEQUENCES = ["עזבתי את המקום", "דיברתי עם מישהו", "נשמתי עמוק", "התעלמתי", "אחר"];
const MOODS = ["😔", "😟", "😐", "🙂", "😊", "😄", "🤩"];
const MOOD_LABELS = ["קשה מאוד", "קשה", "סביר", "בסדר", "טוב", "מצוין", "מעולה"];

const MOCK_PATIENTS = [
  {
    id: 1, name: "אביב כהן", initials: "אכ", age: 28, gender: "זכר",
    diagnosis: "הפרעת חרדה כללית, קשיי ויסות רגשי",
    therapyStart: "ינואר 2026", sessionCount: 14,
    streak: 7, points: 340, lastActive: "היום",
    nextSession: { date: "יום שלישי 08.07.2026", time: "16:00", location: "קליניקה" },
    lastSession: {
      date: "01.07.2026", duration: "50 דק׳",
      summary: "דנו בדפוס הימנעות חברתית שחזר השבוע. המטופל דיווח על קושי ביוזמה חברתית ועל חרדה ביחסים עם קולגות בעבודה. ביחד זיהינו טריגר ספציפי — ביקורת מהמנהל ביום שני.",
      anomalies: [
        { text: "התפרצות זעם ביום חמישי — עוצמה 5/5, הגבוהה ביותר מאז תחילת הטיפול", severity: "high" },
        { text: "שינה פחות מ-5 שעות שלושה לילות ברצף", severity: "medium" },
      ]
    },
    sessions: [
      { date: "01.07.2026", topic: "הימנעות חברתית ואסרטיביות", duration: "50 דק׳", summary: "דנו בדפוס הימנעות חברתית שחזר השבוע. זיהינו טריגר ספציפי — ביקורת מהמנהל. עבדנו על תגובה חלופית.", goals: "תרגול אסרטיביות פעם אחת עד הפגישה הבאה.", anomalies: "התפרצות זעם ביום חמישי — עוצמה 5/5.", mood: "3.2/5 ממוצע שבועי" },
      { date: "24.06.2026", topic: "ניהול זעם וטכניקות הפסקה", duration: "50 דק׳", summary: "למדנו טכניקת הפסקה לפני תגובה. המטופל דיווח על שיפור ביכולת לזהות את הגאות הרגשית לפני הפיצוץ.", goals: "שימוש ב-timeout לפחות פעמיים בשבוע.", anomalies: "אין חריגים.", mood: "3.5/5" },
      { date: "17.06.2026", topic: "מיפוי גורמים מקדימים לחרדה", duration: "50 דק׳", summary: "עבדנו על מיפוי A-B-C מלא. זיהינו 3 גורמים מקדימים עיקריים: עבודה, ביקורת, ויכוחים.", goals: "תיעוד אירועי ABC ב-5 ימים מתוך 7.", anomalies: "אין.", mood: "2.9/5" },
      { date: "10.06.2026", topic: "מבוא ל-ABA ויעדים לטיפול", duration: "50 דק׳", summary: "פגישת היכרות. הגדרנו יעדים ראשוניים: הפחתת תדירות התפרצויות ל-2 בשבוע (מ-5).", goals: "הורדת אפליקציה ומילוי צ׳ק-אין יומי.", anomalies: "אין.", mood: "לא נמדד" },
    ],
    pendingTasks: [
      { text: "תרגיל יומן ערב — 7 ימים ברצף", dueDate: "שוטף", status: "בתהליך", completedDays: 4, totalDays: 7, note: "הושלם ב-4 מתוך 7 ימים השבוע. נראה שיש קושי בסופ\"ש.", type: "journal" },
      { text: "תרגול נשימת קופסה לפחות פעם ביום", dueDate: "שוטף", status: "הושלם חלקית", completedDays: 5, totalDays: 7, note: "דיווח שהתרגיל עוזר בעיקר לאחר ויכוחים.", type: "breathing" },
      { text: "ניסוי אחד ביוזמה חברתית השבוע", dueDate: "08.07.2026", status: "ממתין", completedDays: 0, totalDays: 1, note: "טרם בוצע. יש לברר בפגישה מה עיכב.", type: "social" },
    ],
    discussionPoints: [
      { text: "מה קרה אחרי ויכוח יום חמישי — בדיקת A-B-C מלאה", priority: "high" },
      { text: "דפוס שינה גרוע — קשר ישיר לאיכות הויסות", priority: "high" },
      { text: "העלאת תדירות תרגילי הנשימה", priority: "medium" },
      { text: "הגדרת יעד מדיד להפחתת הימנעות חברתית", priority: "medium" },
    ],
    weekStats: { avgMood: 3.2, abcEvents: 7, checkinRate: "5/7", tasksCompleted: "3/7" },
  },
  {
    id: 2, name: "ברק לוי", initials: "בל", age: 34, gender: "זכר",
    diagnosis: "ADHD, דחיינות כרונית, חרדת ביצוע",
    therapyStart: "מרץ 2026", sessionCount: 8,
    streak: 3, points: 180, lastActive: "אתמול",
    nextSession: { date: "יום רביעי 09.07.2026", time: "10:00", location: "זום" },
    lastSession: {
      date: "25.06.2026", duration: "50 דק׳",
      summary: "התמקדנו בבניית מבנה יומי. המטופל מתקשה לפתוח משימות בלי גירוי חיצוני. ניסינו טכניקת פומודורו — דיווח על שיפור קל. החמצת 3 מתוך 5 משימות השבוע.",
      anomalies: [
        { text: "לא נכנס לאפליקציה שלושה ימים ברצף", severity: "medium" },
      ]
    },
    sessions: [
      { date: "25.06.2026", topic: "מבנה יומי וטכניקות ריכוז" },
      { date: "18.06.2026", topic: "זיהוי דפוסי דחיינות" },
      { date: "11.06.2026", topic: "קביעת יעדים SMART" },
    ],
    pendingTasks: [
      { text: "תרגיל פומודורו יומי — 25 דק׳ ריכוז", dueDate: "שוטף" },
      { text: "צ׳ק-אין בוקר — לפחות 5 ימים בשבוע", dueDate: "שוטף" },
    ],
    discussionPoints: [
      { text: "מה גרם לנפילה בתדירות הכניסה לאפליקציה", priority: "high" },
      { text: "סקירת הצלחות ונפילות בטכניקת פומודורו", priority: "medium" },
      { text: "האם מבנה היום שבנינו ישים בפועל?", priority: "medium" },
    ],
    weekStats: { avgMood: 2.8, abcEvents: 2, checkinRate: "3/7", tasksCompleted: "2/5" },
  },
  {
    id: 3, name: "גלית מזרחי", initials: "גמ", age: 22, gender: "נקבה",
    diagnosis: "חרדה חברתית, בדידות, קשיים בגבולות",
    therapyStart: "פברואר 2026", sessionCount: 18,
    streak: 12, points: 520, lastActive: "היום",
    nextSession: { date: "יום חמישי 10.07.2026", time: "14:00", location: "קליניקה" },
    lastSession: {
      date: "03.07.2026", duration: "50 דק׳",
      summary: "שבוע חיובי יחסית. המטופלת יצרה קשר חברתי ביוזמתה פעמיים — שיפור משמעותי. עדיין מתקשה לומר לא. עבדנו על תרחיש ספציפי עם חברה שמבקשת תמיכה מוגזמת.",
      anomalies: []
    },
    sessions: [
      { date: "03.07.2026", topic: "גבולות ואסרטיביות" },
      { date: "26.06.2026", topic: "יוזמה חברתית — צעד ראשון" },
      { date: "19.06.2026", topic: "מחשבות אוטומטיות ועיוות קוגניטיבי" },
    ],
    pendingTasks: [
      { text: "אחת ביוזמה חברתית בשבוע", dueDate: "שוטף" },
      { text: "תרגיל גבולות — לומר לא פעם אחת בשבוע", dueDate: "שוטף" },
      { text: "יומן מחשבות — 3 פעמים בשבוע", dueDate: "שוטף" },
    ],
    discussionPoints: [
      { text: "עדכון על יוזמות חברתיות מהשבוע", priority: "high" },
      { text: "איך הלך התרגיל של 'לומר לא'", priority: "high" },
      { text: "מעבר לשלב 3 בהיירארכיית החשיפה החברתית", priority: "medium" },
    ],
    weekStats: { avgMood: 4.1, abcEvents: 3, checkinRate: "6/7", tasksCompleted: "5/7" },
  },
];

const MOCK_EVENTS = [
  { id: 1, date: "שני", behavior: "חרדה", intensity: 3, antecedent: "בעבודה", consequence: "נשמתי עמוק", mood: 3, time: "09:14", note: "" },
  { id: 2, date: "שלישי", behavior: "הימנעות", intensity: 2, antecedent: "בחברה", consequence: "עזבתי את המקום", mood: 2, time: "14:32", note: "" },
  { id: 3, date: "שלישי", behavior: "חרדה", intensity: 4, antecedent: "אחרי ויכוח", consequence: "דיברתי עם מישהו", mood: 2, time: "19:05", note: "התקשרתי לאמא, עזר קצת" },
  { id: 4, date: "רביעי", behavior: "חרדה", intensity: 2, antecedent: "בבית", consequence: "נשמתי עמוק", mood: 4, time: "08:50", note: "" },
  { id: 5, date: "חמישי", behavior: "התפרצות זעם", intensity: 5, antecedent: "אחרי ויכוח", consequence: "עזבתי את המקום", mood: 1, time: "11:22", note: "ויכוח עם השותף לעבודה, הרגשתי לא מובן" },
  { id: 6, date: "שישי", behavior: "הימנעות", intensity: 3, antecedent: "בחברה", consequence: "התעלמתי", mood: 3, time: "16:40", note: "" },
  { id: 7, date: "שבת", behavior: "חרדה", intensity: 2, antecedent: "בבית", consequence: "נשמתי עמוק", mood: 5, time: "10:15", note: "" },
];

// ─── Morning check-in task definitions (assigned by Mor Tal) ────────
// Two types: "rating" (question + 1-5 scale + free text) | "yesno" (yes/no + explanation)
// ─── Check-in tasks — 3 separate periods, each with unique questions ─
// `enabled` simulates whether the therapist configured this period.
// In a real app this would come from the therapist's dashboard settings.
const CHECKIN_PERIODS = {
  morning: {
    id: "morning", label: "בוקר", icon: "🌅",
    timeRange: "06:00–11:00", startHour: 6, endHour: 11, enabled: true,
    tasks: [
      { id: "m1", title: "איך אתה מרגיש עכשיו", icon: "💙",
        description: "מור טל: כמה שאלות קצרות שעוזרות להבין איך אתה מרגיש בתחילת הבוקר.",
        type: "rating", question: "בסולם של 1-5, מה הכוח הפנימי שלך עכשיו?",
        ratingLabels: ["ריק לגמרי", "מעט כוח", "סביר", "יש כוח", "מוכן לכל"],
        choices: ["לא ישנתי טוב", "יש לי כבדות", "מרגיש סביר", "יש לי אנרגיה", "הרגשה טובה מאוד"],
        freePlaceholder: "רוצה להוסיף משהו?" },
      { id: "m2", title: "משהו שמעסיק אותך", icon: "💭",
        description: "מור טל: מחשבות שמגיעות בבוקר הן לרוב אלה שהכי משפיעות על היום.",
        type: "yesno", question: "האם יש משהו שכבר מעסיק אותך — מחשבה, אדם, או מצב?",
        yesLabel: "כן, יש משהו", noLabel: "לא, ראש פנוי",
        yesChoices: ["משהו בעבודה", "מישהו שאני חושב עליו", "משהו שקרה אתמול", "חרדה כללית", "ציפייה לאירוע"],
        explanationPlaceholder: "ספר — גם אם זה נראה קטן" },
      { id: "m3", title: "משימת מטפל — בוקר", icon: "✅",
        description: "מור טל הגדיר עבורך משימה לבוקר. מלא אותה — התשובות עוזרות לזהות דפוסים ולדייק את הטיפול.",
        type: "therapistTask",
        taskContent: {
          title: "מיפוי מצב פנימי — בוקר",
          instructions: "ענה על שלוש שאלות קצרות:\n\n1. באיזה מצב אתה קם הבוקר — מה ה'טמפרטורה' הרגשית שלך עכשיו?\n2. האם יש משהו מהיום הקודם שעדיין 'תקוע' בך?\n3. מה אתה מצפה לו הכי הרבה — ומה הכי פחות — מהיום הזה?",
          duration: "3-5 דקות",
          goal: "לזהות דפוסי פתיחת יום ומה משפיע על מצב הרוח הבוקרי."
        },
        question: "האם מילאת את המשימה?",
        yesLabel: "כן, מילאתי ✓", noLabel: "לא הצלחתי הפעם",
        noChoices: ["שכחתי", "לא הייתה הזדמנות", "לא ידעתי מה לכתוב"],
        explanationPlaceholder: "כתוב כאן את תשובותיך לשלוש השאלות — בחופשיות ובכנות" },
    ]
  },
  noon: {
    id: "noon", label: "צהריים", icon: "🌤️",
    timeRange: "11:00–17:00", startHour: 11, endHour: 17, enabled: true,
    tasks: [
      { id: "n1", title: "סיכום הבוקר", icon: "🔍",
        description: "מור טל: מבט לאחור על שעות הבוקר — מה קרה, מה הרגשת.",
        type: "rating", question: "איך היה הבוקר שלך בסך הכל?",
        ratingLabels: ["קשה מאוד", "קשה", "עבר", "בסדר", "טוב"],
        choices: ["היה לחוץ ומאתגר", "היה משעמם", "עבר בסדר", "היה פרודוקטיבי", "היה טוב מהרגיל"],
        freePlaceholder: "משהו שקרה הבוקר שרצית לסמן?" },
      { id: "n2", title: "רגע של תגובה חזקה", icon: "💥",
        description: "מור טל: זיהוי רגעי תגובה רגשית לאורך היום עוזר למפות דפוסים.",
        type: "yesno", question: "האם היה רגע שבו הרגשת תגובה חזקה?",
        yesLabel: "כן, היה משהו", noLabel: "לא, הכל רגוע",
        yesChoices: ["כעס", "חרדה פתאומית", "עצב", "תסכול", "בושה", "פחד"],
        explanationPlaceholder: "מה קרה? מתי? מה הרגשת?" },
    ]
  },
  evening: {
    id: "evening", label: "ערב", icon: "🌙",
    timeRange: "17:00–23:59", startHour: 17, endHour: 24, enabled: true,
    tasks: [
      { id: "e2", title: "דבר אחד שעבד", icon: "🌟",
        description: "מור טל: זיהוי הצלחות קטנות מחזק דפוסים חיוביים.",
        type: "yesno", question: "האם היה משהו היום שהרגשת שהצלחת בו?",
        yesLabel: "כן, היה משהו", noLabel: "לא הרגשתי כזה היום",
        yesChoices: ["התמודדתי עם קושי", "עשיתי משהו שדחיתי", "פתחתי שיחה", "שמרתי על שגרה", "עזרתי למישהו"],
        explanationPlaceholder: "ספר — כל הצלחה קטנה שווה לרשום" },
      { id: "e3", title: "משימת מטפל — ערב", icon: "✅",
        description: "מור טל הגדיר עבורך משימת ערב. מלא אותה — התשובות עוזרות לזהות דפוסים ולדייק את הטיפול.",
        type: "therapistTask",
        taskContent: {
          title: "סיכום התנהגותי — ערב",
          instructions: "ענה על שלוש שאלות על היום שעבר:\n\n1. דרג מ-1 עד 10 כמה שלטת בתגובות שלך היום — ומה הוריד/העלה את הציון?\n2. האם היה רגע שבו פעלת אחרת ממה שהיית עושה לפני שהתחלנו את הטיפול? תאר.\n3. מה דבר אחד שהיית רוצה לעשות שונה מחר?",
          duration: "3-5 דקות",
          goal: "לזהות שינויים התנהגותיים, דפוסי ויסות, ונקודות לפיתוח בטיפול."
        },
        question: "האם מילאת את המשימה?",
        yesLabel: "כן, מילאתי ✓", noLabel: "לא הצלחתי הפעם",
        noChoices: ["שכחתי", "הייתי עייף מדי", "לא ידעתי מה לכתוב"],
        explanationPlaceholder: "כתוב כאן את תשובותיך לשלוש השאלות — בחופשיות ובכנות" },
      { id: "e1", title: "סיכום יום", icon: "📓",
        description: "מור טל: סגירת יום מכוונת עוזרת לעיבוד רגשי ומשפרת את השינה.",
        type: "rating", question: "איך היה היום הזה בשבילך?",
        ratingLabels: ["קשה מאוד", "קשה", "סביר", "טוב", "מצוין"],
        choices: ["עייף ומותש", "היה קשה רגשית", "יום שגרתי", "הרגשתי טוב", "יום יוצא דופן לטובה"],
        freePlaceholder: "רגע אחד שבלט — לטוב או לרע" },
    ]
  }
};


// ─── Time-window helper ────────────────────────────────────────────

// ─── Safety system — detect crisis in user messages ──────────────
const CRISIS_KEYWORDS_HE = [
  "להתאבד", "אני רוצה למות", "לשים קץ", "לא רוצה להמשיך",
  "פגיעה עצמית", "לפגוע בעצמי", "לפגוע במישהו", "לפגוע באחרים",
  "לא שווה לחיות", "אין טעם לחיות", "כולם טוב יותר בלעדי",
  "אטה קורה לי", "התקף פאניקה", "לא יכול לנשום", "מת מפחד",
  "suicide", "self harm", "kill myself"
];

function detectCrisis(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS_HE.some(kw => lower.includes(kw.toLowerCase()));
}

const CRISIS_RESPONSE = `אני שם לב שכתבת משהו שמעיד על קושי גדול מאוד. זה אמיץ לשתף.

הדבר הכי חשוב עכשיו הוא שתדבר עם אדם אמיתי שיכול לעזור לך.

📞 **ער"ן — קו חירום נפשי: 1201** (פתוח 24/7, חינם, אנונימי)
📞 **מד"א: 101**
📞 **מור טל** — המטפל שלך זמין לך.

אתה לא צריך להתמודד עם זה לבד.`;


// ─── Unified Claude API service ──────────────────────────────────
async function callClaude({ system, messages, userPrompt, maxTokens = 1000 }) {
  const msgs = messages || [{ role: "user", content: userPrompt }];
  const body = { model: "claude-sonnet-4-6", max_tokens: maxTokens, messages: msgs };
  if (system) body.system = system;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": "REPLACE_WITH_KEY", "anthropic-version": "2023-06-01", "x-api-key": "REPLACE_WITH_KEY", "anthropic-version": "2023-06-01" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  return text;
}

async function callClaudeJSON({ system, userPrompt, maxTokens = 1000 }) {
  const raw = await callClaude({ system, userPrompt, maxTokens });
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in response");
  return JSON.parse(match[0]);
}

function getOpenPeriodId() {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "noon";
  if (h >= 17) return "evening";
  return null;
}

// ─── Hebrew day names (Sunday=0 … Saturday=6) ─────────────────────
const HEBREW_DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

// ─── DAILY_CORE_TASKS — always appended LAST (summary/reflection) ──
// These are end-of-day reflection tasks, shown after action tasks
const DAILY_CORE_TASKS = [
  { id: "daily-a", type: "journal", recurring: true, order: "last",
    title: "שני דברים טובים שקרו היום", icon: "✨",
    therapistNote: "מור טל: רישום דברים טובים מאמן את המוח להבחין בחיובי ומחזק עמידות רגשית.",
    prompt: "בחר מהרשימה או כתוב בעצמך — שני דברים, כל אחד במשפט אחד.",
    choices: ["שתיתי קפה בשקט", "צחקתי על משהו", "השלמתי משימה", "דיברתי עם מישהו שאני אוהב", "נהניתי מאוכל טוב", "הרגשתי שיפור קטן", "עשיתי משהו בשבילי"],
    multiSelect: true,
    placeholder: "או כתוב בעצמך — גם אם זה משהו קטן מאוד..." },
  { id: "daily-b", type: "journal", recurring: true, order: "last",
    title: "דבר אחד מאתגר שהיה היום", icon: "🌊",
    therapistNote: "מור טל: תיעוד אתגרים עוזר לעבד אותם ולבחון אותם בצורה רגועה יותר.",
    prompt: "בחר מהרשימה או תאר בעצמך.",
    choices: ["קושי עם בן אדם מסוים", "מחשבות קשות שחזרו", "קושי להתחיל משימה", "עייפות שמנעה ממני לתפקד", "תחושת חרדה ללא סיבה", "ויכוח או מתח עם מישהו", "קושי בהחלטה"],
    placeholder: "תאר מה קרה — איך הגבת?" },
  { id: "daily-c", type: "journal", recurring: true, order: "last",
    title: "מחשבה שרצית לרשום", icon: "📝",
    therapistNote: "מור טל: כתיבה חופשית מפנה מקום בראש ועוזרת לנו לראות דפוסים.",
    prompt: "בחר נושא התחלתי או כתוב בחופשיות.",
    choices: ["חשבתי על העתיד", "חשבתי על מישהו שחשוב לי", "הרגשתי שמשהו לא מסתדר", "הבנתי משהו חדש על עצמי", "יש לי משהו על הלב", "חשבתי על שיחה שהייתה לי"],
    placeholder: "כתוב בחופשיות, אין נכון או לא נכון..." },
];


const WEEKLY_TASKS = {
  "ראשון": [
    { id: 101, type: "journal", recurring: true,
      title: "יומן בוקר", icon: "📓",
      therapistNote: "מור טל: כתיבה יומית בבוקר עוזרת לארגן את המחשבות ולהתחיל את היום בצורה מכוונת.",
      prompt: "כתוב 3-5 משפטים — מה עולה לך בראש עכשיו? מה אתה מרגיש? מה מחכה לך היום?",
      placeholder: "כתוב בחופשיות, אין תשובה נכונה..." },
    { id: 102, type: "tip", recurring: false,
      title: "טיפ השבוע ממור טל", icon: "💡",
      therapistNote: "מור טל: קרא את הטיפ הזה לאט פעמיים.",
      tip: "כשאתה מרגיש שהרגש גואה — עצור לשנייה לפני שאתה מגיב. הפסקה של 10 שניות בין הגירוי לתגובה יכולה לשנות לגמרי את מה שקורה אחר כך." },
  ],
  "שני": [
    { id: 103, type: "cognitive", recurring: true,
      title: "בחינת מחשבה חוזרת", icon: "🔍",
      therapistNote: "מור טל: בחינת מחשבות אוטומטיות עוזרת לבדוק אם הן משקפות את המציאות.",
      question: "האם הייתה מחשבה שחזרה אליך שוב ושוב אתמול?",
      ratingLabel: "כמה היא השפיעה עליך? (1=בכלל לא, 5=מאוד)",
      freePlaceholder: "תאר את המחשבה — מה היא אמרה? האם יש עדות שסותרת אותה?" },
    { id: 104, type: "external", recurring: true,
      title: "שיחה חברתית קצרה", icon: "💬",
      therapistNote: "מור טל: חיבור חברתי, גם קצר, הוא מרכיב חיוני בוויסות רגשי.",
      question: "האם קיימת שיחה של לפחות 5 דקות עם אדם אחר היום?",
      freePlaceholder: "עם מי דיברת? איך הרגשת אחרי?" },
  ],
  "שלישי": [
    { id: 105, type: "journal", recurring: true,
      title: "יומן אמצע שבוע", icon: "📝",
      therapistNote: "מור טל: צ'ק-אין אמצע שבוע — רגע לבדוק איפה אתה עומד.",
      prompt: "איך היו הימים האחרונים? האם היה רגע שהרגשת בו שאיבדת קצת שליטה?",
      placeholder: "כתוב בחופשיות..." },
    { id: 106, type: "tip", recurring: false,
      title: "על הימנעות — מור טל מסביר", icon: "💡",
      therapistNote: "מור טל: טיפ חשוב שרצינו לדון בו.",
      tip: "הימנעות מעניקה הקלה מיידית — אבל מחזקת את הפחד לטווח ארוך. גישה הדרגתית, צעד קטן בכל פעם, היא הדרך." },
  ],
  "רביעי": [
    { id: 107, type: "cognitive", recurring: true,
      title: "סולם ערכים", icon: "⚖️",
      therapistNote: "מור טל: תרגיל זה עוזר לנו לבדוק אם ההתנהגות שלנו מתיישרת עם מה שחשוב לנו.",
      question: "בחר ערך אחד שחשוב לך מאוד. האם היום פעלת לפיו?",
      ratingLabel: "עד כמה פעלת לפי הערך הזה היום? (1=בכלל לא, 5=לחלוטין)",
      freePlaceholder: "פרט — מה עשית? מה היה קשה? מה הרגשת?" },
    { id: 108, type: "external", recurring: true,
      title: "הליכה של 15 דקות", icon: "🚶",
      therapistNote: "מור טל: פעילות גופנית קלה משחררת אנדורפינים ומפחיתה קורטיזול.",
      question: "האם יצאת להליכה של לפחות 15 דקות היום?",
      freePlaceholder: "איך הרגשת במהלך ואחרי?" },
  ],
  "חמישי": [
    { id: 113, type: "cognitive", recurring: true,
      title: "בדיקת מצב רוח — אמצע שבוע", icon: "🌡️",
      therapistNote: "מור טל: חמישי הוא זמן טוב לעצור ולבדוק איך השבוע עובר.",
      question: "איך אתה מרגיש ביחס לשבוע הזה בסך הכל?",
      ratingLabel: "1 = קשה מאוד, 5 = טוב מאוד",
      freePlaceholder: "מה עלה בשבוע? מה הפתיע אותך לטוב או לרע?" },
    { id: 109, type: "journal", recurring: true, order: "last",
      title: "יומן ערב — סיכום יום", icon: "🌙",
      therapistNote: "מור טל: סגירת יום מכוונת עוזרת לעיבוד רגשי ומשפרת את השינה.",
      prompt: "3 דברים שקרו היום. אחד שהיה מאתגר, ואחד שגרם לך להרגיש טוב — גם אם קטן.",
      placeholder: "כתוב כאן..." },
  ],
  "שישי": [
    { id: 110, type: "tip", recurring: false,
      title: "לקראת סוף השבוע", icon: "💡",
      therapistNote: "מור טל: כמה מילים לסיום השבוע.",
      tip: "שבועות יש בהם עליות ומורדות — זה חלק מהתהליך. מה שחשוב הוא שהמשכת. כל תיעוד שעשית, כל שאלה שענית — הם נתונים שעוזרים לנו ללמוד עליך ולדייק את הטיפול." },
    { id: 111, type: "cognitive", recurring: false, order: "last",
      title: "סיכום שבועי", icon: "📊",
      therapistNote: "מור טל: שאלות לסיכום שבועי — נדון בהן במפגש.",
      question: "מה היה הרגע הקשה ביותר השבוע? ומה עשית איתו?",
      ratingLabel: "איך היה השבוע הזה בסך הכל? (1=קשה מאוד, 5=טוב)",
      freePlaceholder: "תאר את הרגע — מה קרה, מה הרגשת, מה עשית אחר כך" },
  ],
  "שבת": [
    { id: 112, type: "external", recurring: false,
      title: "זמן לעצמי ללא מסכים", icon: "🌿",
      therapistNote: "מור טל: יום אחד בשבוע של נוכחות ללא מסך — אפילו שעה — מחדש את מאגרי הסבלנות.",
      question: "האם הפרשת לפחות שעה ביום זה שבה לא השתמשת בטלפון / מסך?",
      freePlaceholder: "מה עשית? איך הרגשת? קשה? קל? מפתיע?" },
  ],
};

function makeWelcomeMessages(firstName, gender) {
  const openQ = gender === "female" ? "מה עוברת עליך עכשיו?" : "מה עובר עליך עכשיו?";
  return [{
    id: 1, from: "bot",
    text: `היי ${firstName} 👋\n\nאני כאן כדי להקשיב — בלי שיפוטים, בלי מהירות. אפשר לשתף מה שעל הלב, גם אם זה לא נראה לך חשוב.\n\nמה שתשתף כאן מסייע להתאים לך טיפול מדויק יותר.\n\n${openQ}`,
    time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
  }];
}

// ─── Therapist weekly availability — fixed days/hours, simple slots ─
// ─── "להירגע עכשיו" — calming exercises by emotional state ─────────
const CALM_STATES = [
  {
    id: "anxiety", icon: "😰", label: "חרדה", color: "#2E5BFF",
    intro: "תרגיל נשימה לאיזון חרדה — נשימה 4-4-6 מרגיעה את מערכת העצבים",
    inhale: 4, hold: 4, exhale: 6, rounds: 5,
    tip: "נסה להניח יד אחת על הבטן ולהרגיש אותה עולה ויורדת עם הנשימה."
  },
  {
    id: "stress", icon: "😖", label: "לחץ", color: "#5170FF",
    intro: "נשימת קופסה (Box Breathing) — שיטה שמשמשת גם ספורטאים ואנשי כוחות מיוחדים להורדת לחץ מהיר",
    inhale: 4, hold: 4, exhale: 4, holdAfter: 4, rounds: 4,
    tip: "דמיין שאתה מצייר ריבוע באוויר עם כל נשימה."
  },
  {
    id: "focus", icon: "🌀", label: "ריכוז", color: "#7693FF",
    intro: "נשימה ממוקדת לחידוד ריכוז — נשימות קצרות ושוות מחזירות את תשומת הלב להווה",
    inhale: 3, hold: 2, exhale: 3, rounds: 6,
    tip: "נסה למקד את המבט בנקודה קבועה תוך כדי הנשימה."
  },
  {
    id: "sleep", icon: "🌙", label: "נדודי שינה", color: "#0B2A7A",
    intro: "נשימת 4-7-8 להרגעה לפני שינה — מאטה את קצב הלב ומכינה את הגוף למנוחה",
    inhale: 4, hold: 7, exhale: 8, rounds: 4,
    tip: "כדאי לתרגל בשכיבה, בחושך, עם עיניים עצומות."
  },
  {
    id: "anger", icon: "😠", label: "כעס", color: "#15399E",
    intro: "נשימה מאריכת נשיפה לוויסות כעס — נשיפה ארוכה מהשאיפה מרגיעה תגובת לחימה-או-בריחה",
    inhale: 4, hold: 2, exhale: 8, rounds: 5,
    tip: "אם אפשר, צא לרגע מהמרחב הפיזי של הטריגר לפני שמתחיל."
  },
  {
    id: "overwhelm", icon: "🌊", label: "עומס", color: "#3D6BF0",
    intro: "נשימה מאזנת 5-5 להקטנת תחושת עומס — קצב אחיד מחזיר תחושת שליטה",
    inhale: 5, hold: 0, exhale: 5, rounds: 6,
    tip: "אפשר לעצום עיניים ולספור בקול רך בראש."
  },
];

const WEEK_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"];
const AVAILABILITY = {
  "ראשון": ["09:00", "10:00", "13:00", "16:00"],
  "שני": ["11:00", "14:00", "15:00"],
  "שלישי": ["09:00", "10:00", "12:00", "17:00"],
  "רביעי": ["13:00", "14:00", "16:00"],
  "חמישי": ["09:00", "11:00", "15:00", "16:00"],
};
// Slots already booked (mocked) — shown as unavailable
const BOOKED_SLOTS = { "שלישי-10:00": true, "חמישי-15:00": true };

// ─── Helpers ──────────────────────────────────────────────────────
function useTimer() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (running) ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return { running, seconds, fmt, start: () => setRunning(true), stop: () => setRunning(false), reset: () => { setRunning(false); setSeconds(0); } };
}

function BarChart({ data, color = C.primary, height = 110 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{
            width: "100%", height: Math.max((d.value / max) * (height - 24), d.value > 0 ? 6 : 0),
            background: d.value > 0 ? color : C.border,
            borderRadius: 10, transition: "height 0.4s ease"
          }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: C.inkFaint }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function Sparkline({ data, color = C.primary }) {
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 280, h = 70;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 10) - 5}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 70 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((v - min) / range) * (h - 10) - 5} r="5" fill={color} stroke="#fff" strokeWidth="2" />
      ))}
    </svg>
  );
}

function MoodPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
      {MOODS.map((m, i) => (
        <button key={i} onClick={() => onChange(i)}
          style={{
            fontSize: 38, border: "3px solid", borderRadius: RADIUS_PILL,
            padding: "10px 12px", cursor: "pointer", transition: "all 0.15s",
            borderColor: value === i ? C.primary : "transparent",
            background: value === i ? C.primarySoft : C.bg,
            transform: value === i ? "scale(1.15)" : "scale(1)"
          }}>{m}</button>
      ))}
    </div>
  );
}

function IntensityPicker({ value, onChange }) {
  const colors = [C.lavenderSoft && "#9DB6FF", "#7693FF", "#5170FF", "#2E5BFF", C.primaryDeep];
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)}
          style={{
            width: 64, height: 64, borderRadius: RADIUS_PILL, border: "3px solid",
            fontWeight: 800, fontSize: 30, cursor: "pointer", transition: "all 0.15s",
            background: value >= n ? colors[n - 1] : C.bg,
            borderColor: value >= n ? colors[n - 1] : C.border,
            color: value >= n ? "#fff" : C.inkFaint,
            transform: value === n ? "scale(1.2)" : "scale(1)"
          }}>{n}</button>
      ))}
    </div>
  );
}

function Badge({ label, color = C.primary, bg }) {
  return (
    <span style={{
      fontSize: 18, fontWeight: 800, padding: "5px 14px", borderRadius: RADIUS_PILL,
      background: bg || color + "1F", color
    }}>{label}</span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.surface, borderRadius: RADIUS_XL, padding: 20,
      border: `1px solid ${C.divider}`,
      boxShadow: "0 4px 24px rgba(61,107,240,0.06)",
      ...style
    }}>{children}</div>
  );
}

function BigButton({ children, onClick, color = C.primary, disabled, style = {}, sub }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        width: "100%", padding: "22px 20px", borderRadius: RADIUS_PILL, border: "none",
        background: disabled ? C.border : color,
        color: disabled ? C.inkFaint : "#fff",
        fontSize: 24, fontWeight: 800, cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : `0 8px 24px ${color}55`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        transition: "transform 0.1s", ...style
      }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    >
      {children}
      {sub && <span style={{ fontSize: 18, fontWeight: 500, opacity: 0.85 }}>{sub}</span>}
    </button>
  );
}

// ─── Free-text field — used everywhere a user fills something in ───
// ─── Breathing timer — guided animated circle synced to phases ─────
function BreathingTimer({ state, onFinish }) {
  const phases = [];
  if (state.inhale)    phases.push({ name: "שאיפה",  type: "inhale",  seconds: state.inhale });
  if (state.hold)      phases.push({ name: "החזקה",  type: "hold",    seconds: state.hold });
  if (state.exhale)    phases.push({ name: "נשיפה",  type: "exhale",  seconds: state.exhale });
  if (state.holdAfter) phases.push({ name: "החזקה",  type: "hold",    seconds: state.holdAfter });

  const [round, setRound]         = useState(1);
  const [phaseIdx, setPhaseIdx]   = useState(0);
  const [fillPct, setFillPct]     = useState(0);    // 0–100, rAF driven
  const [displaySec, setDisplaySec] = useState(phases[0].seconds);
  const [running, setRunning]     = useState(true);
  const [done, setDone]           = useState(false);

  const rafRef       = useRef(null);
  const stateRef     = useRef({ phaseIdx: 0, round: 1, running: true, startTs: null });

  const SQUARE = 180;
  const CORNER = 18;

  const startPhase = (pIdx, rnd, ts) => {
    stateRef.current = { phaseIdx: pIdx, round: rnd, running: true, startTs: ts };
    const ph    = phases[pIdx];
    const durMs = ph.seconds * 1000;

    const tick = (now) => {
      const s = stateRef.current;
      if (!s.running) return;
      const elapsed = Math.min(now - s.startTs, durMs);
      const t = elapsed / durMs;                 // 0 → 1, perfectly linear

      // fill
      let fill = ph.type === "inhale" ? t * 100
               : ph.type === "exhale" ? (1 - t) * 100
               : 100;
      setFillPct(fill);
      setDisplaySec(Math.max(1, Math.ceil(ph.seconds * (1 - t))));

      if (elapsed < durMs) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // phase complete → advance
        const nextP = (pIdx + 1) % phases.length;
        const nextR = nextP === 0 ? rnd + 1 : rnd;
        if (nextP === 0 && rnd >= state.rounds) {
          setDone(true);
          return;
        }
        if (nextP === 0) setRound(nextR);
        setPhaseIdx(nextP);
        startPhase(nextP, nextR, performance.now());
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    startPhase(0, 1, performance.now());
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const togglePause = () => {
    const nowRunning = !stateRef.current.running;
    stateRef.current.running = nowRunning;
    setRunning(nowRunning);
    if (nowRunning) {
      const ph = phases[stateRef.current.phaseIdx];
      const progress = ph.type === "inhale" ? fillPct / 100
                     : ph.type === "exhale" ? 1 - fillPct / 100
                     : 0;
      const fakeStart = performance.now() - progress * ph.seconds * 1000;
      startPhase(stateRef.current.phaseIdx, stateRef.current.round, fakeStart);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
  };

  const currentPhase = phases[phaseIdx];
  const filledHeight = (fillPct / 100) * SQUARE;

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>🌿</div>
        <h3 style={{ fontSize: 24, fontWeight: 900, color: C.ink, margin: "0 0 6px" }}>כל הכבוד, סיימת!</h3>
        <p style={{ fontSize: 16, color: C.inkSoft, fontWeight: 600, marginBottom: 20 }}>{state.rounds} סבבים הושלמו</p>
        <BigButton color={state.color} onClick={onFinish}>סיום ✓</BigButton>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
        <div style={{
          width: SQUARE, height: SQUARE, borderRadius: CORNER,
          border: `3px solid ${state.color}`,
          position: "relative", overflow: "hidden",
          background: `${state.color}12`,
        }}>
          {/* Fill — no CSS transition, frame-perfect via rAF */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: `${filledHeight}px`,
            background: `linear-gradient(to top, ${state.color}, ${state.color}BB)`,
            borderRadius: `0 0 ${CORNER - 3}px ${CORNER - 3}px`,
          }} />
          {/* Text */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4
          }}>
            <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1,
              color: fillPct > 45 ? "#fff" : state.color }}>
              {displaySec}
            </span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: 1,
              color: fillPct > 45 ? "rgba(255,255,255,0.9)" : `${state.color}CC` }}>
              {currentPhase.name}
            </span>
          </div>
        </div>
      </div>

      {/* Phase dots */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
        {phases.map((p, i) => (
          <div key={i} style={{
            height: 5, borderRadius: 3,
            width: i === phaseIdx ? 28 : 5,
            background: i === phaseIdx ? state.color : `${state.color}44`,
          }} />
        ))}
      </div>

      <p style={{ fontSize: 14, color: C.inkFaint, fontWeight: 700, marginBottom: 18 }}>
        סבב {round} מתוך {state.rounds}
      </p>

      <button onClick={togglePause}
        style={{
          padding: "12px 32px", borderRadius: RADIUS_PILL,
          border: `2.5px solid ${state.color}`,
          background: running ? "none" : state.color,
          color: running ? state.color : "#fff",
          fontWeight: 800, fontSize: 16, cursor: "pointer"
        }}>
        {running ? "השהה" : "המשך"}
      </button>
    </div>
  );
}

// ─── ChoiceChips — quick-select pill buttons ───────────────────────
function ChoiceChips({ choices, selected, onToggle, multi = false }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
      {choices.map(c => {
        const active = multi ? (selected || []).includes(c) : selected === c;
        return (
          <button key={c} onClick={() => onToggle(c)}
            style={{
              padding: "8px 14px", borderRadius: RADIUS_PILL, border: `1.5px solid ${active ? C.primary : C.divider}`,
              background: active ? C.primarySoft : C.surface,
              color: active ? C.primary : C.inkSoft,
              fontWeight: active ? 800 : 600, fontSize: 15, cursor: "pointer",
              transition: "all 0.15s"
            }}>
            {active ? "✓ " : ""}{c}
          </button>
        );
      })}
    </div>
  );
}

function FreeText({ value, onChange, placeholder = "רוצה להוסיף משהו במילים שלך? (לא חובה)" }) {
  return (
    <div style={{ marginTop: 4 }}>
      <p style={{ fontSize: 18, color: C.inkFaint, fontWeight: 700, marginBottom: 8 }}>✍️ כתיבה חופשית</p>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: "100%", boxSizing: "border-box", border: `2.5px solid ${C.border}`,
          borderRadius: RADIUS_MD, padding: "14px 16px", fontSize: 20, fontWeight: 500,
          color: C.ink, background: C.bg, resize: "none", outline: "none",
          fontFamily: "inherit", direction: "rtl"
        }}
        onFocus={e => e.target.style.borderColor = C.primary}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

// ─── Home button — appears on every screen except home ─────────────
// ─── TopBar — persistent across all patient screens ────────────────
// Shows: 🏠 home | streak | points | tasks  fixed at top
function TopBar({ onHome, streak, points, doneTaskCount, tasksTotal, onStatClick }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 440, zIndex: 60,
      background: "#0B1E2D",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 16px 10px", boxSizing: "border-box", height: 56,
      borderBottom: "1px solid rgba(0,200,180,0.18)",
      boxShadow: "0 2px 20px rgba(0,0,0,0.45)"
    }}>
      {/* Home button — minimal circle */}
      <button onClick={onHome}
        style={{
          background: "rgba(0,200,180,0.12)", border: "1.5px solid rgba(0,200,180,0.3)",
          borderRadius: RADIUS_PILL, width: 36, height: 36, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, flexShrink: 0
        }}>
        🏠
      </button>

      {/* Stats — pill chips */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {[
          { icon: "🔥", val: streak, label: "רצף", key: "streak" },
          { icon: "⭐", val: points, label: "נק׳", key: "points" },
          { icon: "✅", val: `${doneTaskCount}/${tasksTotal}`, label: "משימות", key: "tasks" },
        ].map(s => (
          <button key={s.key} onClick={() => onStatClick(s.key)}
            style={{
              background: "rgba(0,200,180,0.08)",
              border: "1px solid rgba(0,200,180,0.22)",
              borderRadius: RADIUS_PILL,
              padding: "4px 12px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5
            }}>
            <span style={{ fontSize: 13, color: "#A8EDE8", fontWeight: 800 }}>{s.icon} {s.val}</span>
            <span style={{ fontSize: 11, color: "rgba(168,237,232,0.55)", fontWeight: 600 }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── HomeButton — kept for legacy internal use, replaced by TopBar ──
function HomeButton({ onClick }) {
  return null; // TopBar handles home navigation now
}

// ─── Floating SOS button — reachable from every screen ──────────────
function FloatingSOSButton({ onClick }) {
  return (
    <button onClick={onClick}
      style={{
        position: "fixed", bottom: 30, right: 22,
        zIndex: 40, width: 58, height: 58, borderRadius: RADIUS_PILL,
        background: C.warn, color: "#fff", border: "3px solid #fff",
        boxShadow: "0 10px 26px rgba(224,38,59,0.45)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900
      }}
      aria-label="SOS חירום"
    >
      SOS
    </button>
  );
}

// ─── Logo — bigger, more detailed therapist figure with glasses ────
// ─── Date / time bar — date on the right, time on the left ─────────
function DateTimeBar({ light = false }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  const dateStr = now.toLocaleDateString("he-IL", { day: "numeric", month: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const color = light ? "rgba(255,255,255,0.85)" : C.inkFaint;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 20px 8px", color }}>
      <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: 0.5 }}>{timeStr}</span>
      <span style={{ fontSize: 22, fontWeight: 700 }}>{dateStr}</span>
    </div>
  );
}

// ─── Info bubble — pops up briefly to explain a tile's purpose ─────
function InfoBubble({ text, onClose, onDontShowAgain }) {
  const [dontShow, setDontShow] = useState(false);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(14,37,84,0.35)",
      display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "70px 20px 0"
    }} onClick={() => (dontShow ? onDontShowAgain() : onClose())}>
      <div onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 380, width: "100%",
          background: C.primaryDeep, color: "#fff", borderRadius: RADIUS_XL,
          padding: "20px 22px", boxShadow: "0 16px 40px rgba(11,42,122,0.45)",
          position: "relative"
        }}>
        <button
          onClick={() => (dontShow ? onDontShowAgain() : onClose())}
          aria-label="סגירה"
          style={{
            position: "absolute", top: 12, left: 12, width: 32, height: 32, borderRadius: RADIUS_PILL,
            background: "rgba(255,255,255,0.18)", border: "none", color: "#fff",
            fontSize: 16, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>✕</button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16, paddingLeft: 38 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>💡</span>
          <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5 }}>{text}</span>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 16 }}>
          <input
            type="checkbox"
            checked={dontShow}
            onChange={e => setDontShow(e.target.checked)}
            style={{ width: 20, height: 20, cursor: "pointer", accentColor: "#fff" }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>אל תציג שוב את ההודעה הזו</span>
        </label>

        <button
          onClick={() => (dontShow ? onDontShowAgain() : onClose())}
          style={{
            width: "100%", padding: "12px 0", borderRadius: RADIUS_PILL, border: "none",
            background: "#fff", color: C.primaryDeep, fontSize: 16, fontWeight: 800, cursor: "pointer"
          }}>
          הבנתי
        </button>
      </div>
    </div>
  );
}

// ─── Points toast — confirms points earned ──────────────────────────
function PointsToast({ amount, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)",
      zIndex: 200, background: C.gold, color: "#fff", borderRadius: RADIUS_PILL,
      padding: "12px 26px", boxShadow: "0 10px 28px rgba(21,57,158,0.4)",
      fontSize: 18, fontWeight: 900
    }}>
      +{amount} ⭐ נקודות!
    </div>
  );
}

function Logo({ size = 84 }) {
  const s = size;
  const stroke = "#fff";
  const sw = s * 0.042; // stroke width scales with size
  return (
    <div style={{
      width: s, height: s,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        {/*
          Single continuous line:
          starts bottom-left → rises as a shoulder →
          curves up into a neck → head circle →
          descends as the other shoulder → bottom-right
          One unbroken stroke. Ultra-minimal.
        */}
        <path
          d="M10 82 Q22 82 30 72 Q36 62 40 56 Q44 50 50 46 Q56 42 54 32 Q52 22 50 20 Q48 18 50 20 Q52 22 52 30 Q52 40 56 50 Q60 58 64 68 Q70 80 78 82 L90 82"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* head — single clean circle */}
        <circle cx="50" cy="24" r="10" stroke={stroke} strokeWidth={sw} />
      </svg>
    </div>
  );
}

// ─── Bubble menu tile — pill/bubble style, huge text ────────────────
function BubbleTile({ icon, label, onClick, active, accentColor = C.primary }) {
  return (
    <button onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 6, padding: "16px 8px", borderRadius: RADIUS_LG,
        background: active ? accentColor : C.surface,
        border: `3px solid #000`,
        cursor: "pointer", width: "100%",
        boxShadow: active ? `0 8px 22px ${accentColor}55, 0 4px 12px rgba(0,0,0,0.5)` : "0 4px 12px rgba(0,0,0,0.35)",
        minHeight: 82, transition: "all 0.15s"
      }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <span style={{ fontSize: 30 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color: active ? "#fff" : C.ink, textAlign: "center", lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PATIENT APP
// ═══════════════════════════════════════════════════════════════════

function PatientAppInner({ onSwitch, sosOpen, setSosOpen, personalContact, pointsToast, setPointsToast, infoBubble, setInfoBubble, seenTiles, topBarData, setTopBarData, externalNav, clearExternalNav, user }) {
  // ── User context helpers ────────────────────────────────────────
  const firstName = user?.name?.split(" ")[0] || "אורח";
  const gender = user?.gender || "other"; // male | female | other
  // gender-aware suffixes: verb endings, adjective endings
  const g = {
    // "הצלחת" vs "הצלחת" (same) — but completion msgs differ
    completed:  gender === "female" ? "השלמת"  : "השלמת",
    ready:      gender === "female" ? "מוכנה"  : "מוכן",
    welcome:    gender === "female" ? "ברוכה הבאה" : "ברוך הבא",
    choose:     gender === "female" ? "בחרי"   : "בחר",
    write:      gender === "female" ? "כתבי"   : "כתוב",
    share:      gender === "female" ? "שתפי"   : "שתף",
    feel:       gender === "female" ? "מרגישה" : "מרגיש",
    did:        gender === "female" ? "עשית"   : "עשית",
    great:      gender === "female" ? "כל הכבוד" : "כל הכבוד",
  };

  const [screen, setScreen] = useState("home");
  // checkin answers keyed by period then task id: { morning: { m1: {done,rating,text}, ... }, noon: {...}, evening: {...} }
  const [checkinAnswers, setCheckinAnswers] = useState({ morning: {}, noon: {}, evening: {} });
  const [checkinModal, setCheckinModal] = useState(null); // { periodId, taskId }
  const [checkinPeriod, setCheckinPeriod] = useState(null); // which period screen is open
  const [abc, setAbc] = useState({ step: 0, behavior: "", intensity: 0, antecedent: "", consequence: "", note: "" });
  const [taskAnswers, setTaskAnswers] = useState({}); // { [taskId]: { done, text, rating, yesno } }
  const [taskModal, setTaskModal] = useState(null);   // task object currently open
  const todayName = HEBREW_DAY_NAMES[new Date().getDay()];
  const dayTasks = WEEKLY_TASKS[todayName] || [];
  // Action tasks first, then summary/reflection (order:"last") at the end
  const actionDayTasks = dayTasks.filter(t => t.order !== "last");
  const summaryDayTasks = dayTasks.filter(t => t.order === "last");
  const actionCore = DAILY_CORE_TASKS.filter(t => t.order !== "last");
  const summaryCore = DAILY_CORE_TASKS.filter(t => t.order === "last");
  const tasks = [...actionCore, ...actionDayTasks, ...summaryDayTasks, ...summaryCore];
  const doneTaskCount = tasks.filter(t => taskAnswers[t.id]?.done).length;
  const [statsScreen, setStatsScreen] = useState(null); // "streak" | "points" | "tasks"
  const [streak] = useState(7); // in real app computed from daily activity
  const [points, setPoints] = useState(340);
  const [calmState, setCalmState] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const timer = useTimer();
  // checkinDone = true if all ENABLED periods are fully completed
  const checkinDone = Object.entries(CHECKIN_PERIODS)
    .filter(([, p]) => p.enabled)
    .every(([pid, p]) => p.tasks.every(t => checkinAnswers[pid]?.[t.id]?.done));
  const [messages, setMessages] = useState(() => makeWelcomeMessages(firstName, gender));
  const [newMessage, setNewMessage] = useState("");
  const [chatTurns, setChatTurns] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  const addPoints = (p) => {
    setPoints(prev => prev + p);
    setPointsToast(p);
  };
  const goHome = () => setScreen("home");

  // Respond to TopBar home button / stat clicks
  useEffect(() => {
    if (!externalNav || externalNav === "home") return;
    if (externalNav === "__home__") { setScreen("home"); clearExternalNav(); }
    else if (externalNav.startsWith("__stats_")) {
      const key = externalNav.replace("__stats_", "").replace("__", "");
      setStatsScreen(key); setScreen("home"); clearExternalNav();
    }
  }, [externalNav]);

  // Sync TopBar stats whenever relevant state changes
  useEffect(() => {
    setTopBarData({ streak, points, doneTaskCount, tasksTotal: tasks.length });
  }, [streak, points, doneTaskCount, tasks.length]);

  // Show an explanatory bubble; if previously dismissed with "don't show again", stays hidden
  const showInfoOnce = (key, text) => {
    if (!seenTiles[key]) {
      setInfoBubble({ key, text });
    }
  };

  // ─── Claude API therapeutic chat ─────────────────────────────────
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const THERAPY_SYSTEM = `אתה כלי תמיכה דיגיטלי המלווה את ${firstName} (${gender === 'female' ? 'נקבה' : gender === 'male' ? 'זכר' : 'לא מוגדר'}) בין מפגשים עם מור טל.
תפקידך:
✔ להקשיב ולשקף מחשבות ורגשות
✔ לעזור בארגון וניסוח חוויות
✔ להזכיר משימות ויעדים שהוגדרו בטיפול
✔ להכין את ${firstName} למפגש הבא

גבולות ברורים:
✗ אינך מאבחן ואינך מטפל
✗ אינך מחליף את מור טל
✗ אינך מקבל החלטות טיפוליות
✗ אם עולה מצוקה חריגה — הפנה לעזרה מקצועית מיד

כללי שיחה:
- עברית בלבד, גוף שני זכר, שפה יומיומית
- 2-4 משפטים לתשובה — קצר וממוקד
- שאלה אחת ממשיכה בסוף כל תגובה
- טון: תומך, לא שיפוטי, מכיל
- זיהוי מצוקה: אם המשתמש מביע מחשבות פגיעה עצמית, אובדנות, או סכנה — הפסק את הנושא הרגיל, הבע דאגה, והפנה מיד למשאבי חירום
- סיים כל תשובה עם: <!--TAGS:{"topics":["..."],"emotions":["..."],"patterns":["..."]}-->`;

  const handleSend = async (text) => {
    const now = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    const patientMsg = { id: Date.now(), from: "patient", text, time: now };
    const updatedMessages = [...messages, patientMsg];
    setMessages(updatedMessages);
    setNewMessage("");
    setIsTyping(true);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Safety check — crisis detection before sending to AI
    if (detectCrisis(text)) {
      setMessages(m => [...m, {
        id: Date.now() + 1, from: "bot",
        text: CRISIS_RESPONSE,
        isCrisis: true,
        time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
      }]);
      setIsTyping(false);
      return;
    }

    try {
      const apiMessages = updatedMessages
        .filter(m => m.from === "patient" || m.from === "bot")
        .map(m => ({ role: m.from === "patient" ? "user" : "assistant", content: m.text }));

      const raw = await callClaude({ system: THERAPY_SYSTEM, messages: apiMessages });

      const tagsMatch = raw.match(/<!--TAGS:(.*?)-->/s);
      let tags = null;
      if (tagsMatch) { try { tags = JSON.parse(tagsMatch[1]); } catch (_) {} }
      const cleanText = raw.replace(/<!--TAGS:[\s\S]*?-->/g, "").trim();

      setMessages(m => [...m, {
        id: Date.now() + 1, from: "bot", text: cleanText || "אני כאן, תמשיך לשתף.", tags,
        time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
      }]);
      setChatTurns(t => { const n = t + 1; if (n % 2 === 0) addPoints(5); return n; });
    } catch {
      setMessages(m => [...m, {
        id: Date.now() + 1, from: "bot",
        text: "יש בעיית חיבור רגעית. נסה שוב בעוד רגע.", time: "עכשיו"
      }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 120);
    }
  };

  const abcSteps = [
    {
      label: "מה קרה?",
      sub: "בחר/י את ההתנהגות",
      content: (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {BEHAVIORS.map(b => (
              <button key={b} onClick={() => setAbc(a => ({ ...a, behavior: b }))}
                style={{
                  padding: "16px 22px", borderRadius: RADIUS_PILL, border: "3px solid",
                  borderColor: abc.behavior === b ? C.primary : C.border,
                  background: abc.behavior === b ? C.primary : C.surface,
                  color: abc.behavior === b ? "#fff" : C.ink,
                  fontWeight: 800, fontSize: 22, cursor: "pointer"
                }}>{b}</button>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <FreeText value={abc.note} onChange={v => setAbc(a => ({ ...a, note: v }))} placeholder="תאר/י במילים שלך מה קרה (לא חובה)" />
          </div>
        </>
      ),
      valid: !!abc.behavior
    },
    {
      label: "עוצמה",
      sub: "כמה עוצמה היה לאירוע?",
      content: (
        <div>
          <IntensityPicker value={abc.intensity} onChange={v => setAbc(a => ({ ...a, intensity: v }))} />
          <p style={{ textAlign: "center", marginTop: 16, color: C.inkSoft, fontSize: 22, fontWeight: 700 }}>
            {["", "נמוכה מאוד", "נמוכה", "בינונית", "גבוהה", "גבוהה מאוד"][abc.intensity] || "בחר/י עוצמה"}
          </p>
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <p style={{ fontSize: 19, color: C.inkFaint, marginBottom: 10, fontWeight: 600 }}>מדידת משך (אופציונלי)</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
              <span style={{ fontFamily: "monospace", fontSize: 40, fontWeight: 800, color: C.primary }}>
                {timer.fmt(timer.seconds)}
              </span>
              <button onClick={timer.running ? timer.stop : timer.start}
                style={{
                  padding: "12px 24px", borderRadius: RADIUS_PILL, border: "none",
                  background: timer.running ? C.primaryDeep : C.primary,
                  color: "#fff", fontWeight: 800, fontSize: 20, cursor: "pointer"
                }}>
                {timer.running ? "עצור" : "התחל"}
              </button>
            </div>
          </div>
        </div>
      ),
      valid: abc.intensity > 0
    },
    {
      label: "מה היה לפני?",
      sub: "מה קדם לאירוע?",
      content: (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ANTECEDENTS.map(a => (
              <button key={a} onClick={() => setAbc(prev => ({ ...prev, antecedent: a }))}
                style={{
                  padding: "18px 20px", borderRadius: RADIUS_PILL, border: "3px solid",
                  borderColor: abc.antecedent === a ? C.primary : C.border,
                  background: abc.antecedent === a ? C.primarySoft : C.surface,
                  color: abc.antecedent === a ? C.primaryDeep : C.ink,
                  fontWeight: abc.antecedent === a ? 800 : 600,
                  fontSize: 22, cursor: "pointer", textAlign: "right"
                }}>{a}</button>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <FreeText
              value={abc.antecedentNote || ""}
              onChange={v => setAbc(prev => ({ ...prev, antecedentNote: v }))}
              placeholder="או תאר/י במילים שלך מה קדם לאירוע — כל פרט עוזר"
            />
          </div>
        </>
      ),
      valid: !!abc.antecedent || !!(abc.antecedentNote && abc.antecedentNote.trim())
    },
    {
      label: "מה עשית אחרי?",
      sub: "מה הייתה התגובה שלך?",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CONSEQUENCES.map(cns => (
            <button key={cns} onClick={() => setAbc(prev => ({ ...prev, consequence: cns }))}
              style={{
                padding: "18px 20px", borderRadius: RADIUS_PILL, border: "3px solid",
                borderColor: abc.consequence === cns ? C.accentDeep : C.border,
                background: abc.consequence === cns ? C.accentSoft : C.surface,
                color: abc.consequence === cns ? C.accentDeep : C.ink,
                fontWeight: abc.consequence === cns ? 800 : 600,
                fontSize: 22, cursor: "pointer", textAlign: "right"
              }}>{cns}</button>
          ))}
          <div style={{ marginTop: 6 }}>
            <FreeText
              value={abc.consequenceNote || ""}
              onChange={v => setAbc(prev => ({ ...prev, consequenceNote: v }))}
              placeholder="או פרט/י במילים שלך מה עשית אחרי — כל פרט עוזר"
            />
          </div>
        </div>
      ),
      valid: !!abc.consequence || !!(abc.consequenceNote && abc.consequenceNote.trim())
    }
  ];

  if (screen === "done") {
    return (
      <div style={{ minHeight: "100vh", background: C.primary, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, direction: "rtl", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}><DateTimeBar light /></div>
        <div style={{ fontSize: 100, marginTop: 14 }}>🎉</div>
        <h2 style={{ color: "#fff", marginTop: 10, fontSize: 36, fontWeight: 900 }}>נשמר בהצלחה!</h2>
        <p style={{ color: "rgba(255,255,255,0.85)", textAlign: "center", fontSize: 21, fontWeight: 600 }}>התיעוד נשלח למטפל שלך</p>
        <div style={{ background: "#fff", borderRadius: RADIUS_PILL, padding: "16px 36px", margin: "24px 0", textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: C.gold }}>+20 ⭐</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 20, fontWeight: 600, marginBottom: 28 }}>
          סה"כ {points} נקודות
        </p>
        <button onClick={() => { setScreen("home"); setAbc({ step: 0, behavior: "", intensity: 0, antecedent: "", consequence: "", note: "" }); timer.reset(); }}
          style={{ padding: "18px 44px", borderRadius: RADIUS_PILL, background: "#fff", color: C.primary, border: "none", fontSize: 23, fontWeight: 900, cursor: "pointer" }}>
          חזרה לבית
        </button>
      </div>
    );
  }

  if (screen === "abc") {
    const step = abcSteps[abc.step];
    return (
      <div style={{ minHeight: "100vh", background: C.bg, direction: "rtl" }}>
        <DateTimeBar />
        <div style={{ background: C.primary, padding: "20px 22px 30px", color: "#fff", borderRadius: `0 0 ${RADIUS_XL}px ${RADIUS_XL}px` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={() => { setScreen("home"); setAbc({ step: 0, behavior: "", intensity: 0, antecedent: "", consequence: "", note: "" }); timer.reset(); }}
              style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: RADIUS_PILL, padding: "8px 16px", cursor: "pointer", fontSize: 19, fontWeight: 700 }}>
              ← ביטול
            </button>
            <span style={{ fontSize: 19, fontWeight: 700, opacity: 0.85 }}>{abc.step + 1} / {abcSteps.length}</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 34, fontWeight: 900 }}>{step.label}</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.85, fontSize: 21, fontWeight: 600 }}>{step.sub}</p>
          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.3)", borderRadius: RADIUS_PILL, height: 8 }}>
            <div style={{ height: 8, background: "#fff", borderRadius: RADIUS_PILL, width: `${((abc.step + 1) / abcSteps.length) * 100}%`, transition: "width 0.3s" }} />
          </div>
        </div>

        <div style={{ padding: 22, paddingBottom: 110 }}>
          <Card style={{ marginBottom: 20 }}>{step.content}</Card>

          <BigButton
            disabled={!step.valid}
            onClick={() => {
              if (abc.step < abcSteps.length - 1) setAbc(a => ({ ...a, step: a.step + 1 }));
              else { addPoints(20); setScreen("done"); }
            }}>
            {abc.step < abcSteps.length - 1 ? "הבא ←" : "שמור תיעוד ✓"}
          </BigButton>

          {abc.step > 0 && (
            <button onClick={() => setAbc(a => ({ ...a, step: a.step - 1 }))}
              style={{ width: "100%", marginTop: 12, padding: 16, borderRadius: RADIUS_PILL, border: `2px solid ${C.border}`, background: "none", color: C.inkSoft, fontSize: 21, fontWeight: 700, cursor: "pointer" }}>
              → חזרה
            </button>
          )}
        </div>
        <HomeButton onClick={goHome} />
      </div>
    );
  }

  if (screen === "checkin") {
    // ── Period-picker home ──────────────────────────────────────────
    if (!checkinPeriod) {
      return (
        <div style={{ minHeight: "100vh", background: C.bg, direction: "rtl", paddingTop: 72, paddingBottom: 110 }}>
          <div style={{ margin: "0 0 0" }}><DateTimeBar /></div>
          <div style={{ padding: "16px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ color: C.ink, margin: 0, fontSize: 30, fontWeight: 900 }}>צ'ק-אין ☀️</h2>
            <button onClick={() => setScreen("home")} style={{ background: "none", border: `1px solid ${C.divider}`, color: C.inkFaint, cursor: "pointer", fontSize: 20, width: 38, height: 38, borderRadius: RADIUS_PILL, display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
          </div>

          <div style={{ padding: "0 22px" }}>
            <p style={{ color: C.inkSoft, fontSize: 17, fontWeight: 600, marginBottom: 22 }}>
              בחר את חלק היום הרלוונטי עכשיו
            </p>
            {Object.values(CHECKIN_PERIODS).map(period => {
              const openId = getOpenPeriodId();
              const isTimeOpen = openId === period.id;
              const isEnabled = period.enabled && isTimeOpen;
              const isFuture = period.enabled && !isTimeOpen && openId !== null && Object.keys(CHECKIN_PERIODS).indexOf(period.id) > Object.keys(CHECKIN_PERIODS).indexOf(openId);
              const isPast = period.enabled && !isTimeOpen && !isFuture;
              const periodAnswers = checkinAnswers[period.id] || {};
              const done = isEnabled && period.tasks.every(t => periodAnswers[t.id]?.done);
              const partial = isEnabled && period.tasks.some(t => periodAnswers[t.id]?.done);

              return (
                <button key={period.id}
                  disabled={!isEnabled}
                  onClick={() => isEnabled && setCheckinPeriod(period.id)}
                  style={{
                    width: "100%", marginBottom: 14,
                    padding: "20px 22px", borderRadius: RADIUS_XL,
                    border: `3px solid ${done ? C.primary : isEnabled ? C.divider : C.divider}`,
                    background: done ? C.primarySoft : isEnabled ? C.surface : C.bg,
                    display: "flex", alignItems: "center", gap: 16,
                    cursor: isEnabled ? "pointer" : "not-allowed",
                    boxShadow: isEnabled ? "0 4px 18px rgba(0,0,0,0.07)" : "none",
                    opacity: isEnabled ? 1 : 0.45, textAlign: "right"
                  }}>
                  {/* Status circle */}
                  <div style={{
                    width: 44, height: 44, borderRadius: RADIUS_PILL, flexShrink: 0,
                    border: `3px solid ${done ? C.primary : isEnabled ? C.divider : C.divider}`,
                    background: done ? C.primary : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
                  }}>
                    {done ? <span style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>✓</span> : period.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "nowrap", overflow: "hidden" }}>
                      <span style={{ fontWeight: 900, fontSize: 20, color: done ? C.primaryDeep : isEnabled ? C.ink : C.inkFaint }}>
                        {period.label}
                      </span>
                      <span style={{ fontSize: 13, color: C.inkFaint, fontWeight: 600, background: C.border, padding: "2px 10px", borderRadius: RADIUS_PILL, whiteSpace: "nowrap", flexShrink: 0 }}>
                        {period.timeRange}
                      </span>
                      {!period.enabled && <span style={{ fontSize: 12, color: C.inkFaint, fontWeight: 600 }}>לא הוגדר</span>}
                      {period.enabled && isFuture && <span style={{ fontSize: 13 }}>🔒</span>}
                      {done && <Badge label="הושלם" color={C.primary} />}
                      {isPast && !done && <Badge label="הזמן עבר" color={C.inkFaint} />}
                    </div>
                    <span style={{ fontSize: 14, color: C.inkFaint, fontWeight: 600 }}>
                      {isEnabled ? (done ? `${period.tasks.length} שאלות הושלמו` : `${period.tasks.length} שאלות פתוחות עכשיו`) :
                       isFuture ? `נפתח ב-${period.timeRange.split("–")[0]}` :
                       isPast ? "הזמן חלף" : "לא הוגדר"}
                    </span>
                  </div>
                  {isEnabled && !done && <span style={{ color: C.inkFaint, fontSize: 20 }}>←</span>}
                </button>
              );
            })}
          </div>
          <HomeButton onClick={goHome} />
        </div>
      );
    }

    // ── Per-period task list ────────────────────────────────────────
    const period = CHECKIN_PERIODS[checkinPeriod];
    const periodAnswers = checkinAnswers[checkinPeriod] || {};
    const allDone = period.tasks.every(t => periodAnswers[t.id]?.done);
    const doneCount = period.tasks.filter(t => periodAnswers[t.id]?.done).length;
    const activeTask = checkinModal ? period.tasks.find(t => t.id === checkinModal.taskId) : null;
    const draft = checkinModal ? (periodAnswers[checkinModal.taskId] || {}) : {};

    const saveDraft = () => {
      if (!activeTask) return;
      if (activeTask.type === "rating" && !draft.rating) return;
      if (activeTask.type === "yesno" && draft.yesno === undefined) return;
      if (activeTask.type === "therapistTask" && draft.yesno === undefined) return;
      setCheckinAnswers(prev => ({
        ...prev,
        [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, done: true } }
      }));
      setCheckinModal(null);
      addPoints(5);
    };

    const canSave = activeTask
      ? (activeTask.type === "rating" ? !!draft.rating : draft.yesno !== undefined)
      : false;

    return (
      <div style={{ minHeight: "100vh", background: C.bg, direction: "rtl", paddingTop: 72, paddingBottom: 110 }}>
        <div style={{ margin: "-22px -22px 18px" }}><DateTimeBar /></div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <button onClick={() => setCheckinPeriod(null)}
            style={{ background: "none", border: `1px solid ${C.divider}`, color: C.inkFaint, cursor: "pointer", fontWeight: 700, fontSize: 15, padding: "8px 18px", borderRadius: RADIUS_PILL }}>
            → חזרה
          </button>
          <h2 style={{ color: C.ink, margin: 0, fontSize: 26, fontWeight: 900 }}>{period.icon} {period.label}</h2>
          <button onClick={() => { setCheckinPeriod(null); setScreen("home"); }}
            style={{ background: C.surface, border: "none", color: C.inkFaint, cursor: "pointer", fontSize: 24, width: 40, height: 40, borderRadius: RADIUS_PILL, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>✕</button>
        </div>

        <Card style={{ marginBottom: 20, background: C.primary }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 17 }}>הושלמו</span>
            <span style={{ fontWeight: 900, fontSize: 26 }}>{doneCount}/{period.tasks.length}</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.3)", borderRadius: RADIUS_PILL, height: 8 }}>
            <div style={{ height: 8, background: "#fff", borderRadius: RADIUS_PILL,
              width: `${(doneCount / period.tasks.length) * 100}%`, transition: "width 0.4s" }} />
          </div>
        </Card>

        {period.tasks.map(task => {
          const answer = periodAnswers[task.id];
          const isDone = answer?.done;
          return (
            <button key={task.id}
              onClick={() => {
                setCheckinModal({ periodId: checkinPeriod, taskId: task.id });
                setCheckinAnswers(prev => ({
                  ...prev,
                  [checkinPeriod]: { ...prev[checkinPeriod], [task.id]: prev[checkinPeriod]?.[task.id] || {} }
                }));
              }}
              style={{
                width: "100%", marginBottom: 14, padding: "18px 20px", borderRadius: RADIUS_XL,
                border: `3px solid ${isDone ? C.primary : C.border}`,
                background: isDone ? C.primarySoft : C.surface,
                display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
                boxShadow: "0 4px 18px rgba(0,0,0,0.06)", textAlign: "right"
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: RADIUS_PILL, flexShrink: 0,
                border: `3px solid ${isDone ? C.primary : C.border}`,
                background: isDone ? C.primary : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {isDone && <span style={{ color: "#fff", fontSize: 18, fontWeight: 900 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 20 }}>{task.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: isDone ? C.primaryDeep : C.ink }}>{task.title}</span>
                </div>
                {isDone ? (
                  <span style={{ fontSize: 13, color: C.primary, fontWeight: 700 }}>
                    {task.type === "rating"
                      ? `דירוג: ${answer.rating}/5${answer.text ? " · " + answer.text.slice(0, 28) + (answer.text.length > 28 ? "..." : "") : ""}`
                      : `${answer.yesno ? "✓ כן" : "✗ לא"}${answer.text ? " · " + answer.text.slice(0, 28) + (answer.text.length > 28 ? "..." : "") : ""}`
                    }
                  </span>
                ) : (
                  <span style={{ fontSize: 14, color: C.inkFaint, fontWeight: 600 }}>לחץ כדי למלא ←</span>
                )}
              </div>
              {!isDone && <span style={{ fontSize: 20, color: C.inkFaint }}>←</span>}
            </button>
          );
        })}

        <BigButton color={C.primary} disabled={!allDone}
          onClick={() => { setCheckinPeriod(null); addPoints(10); }}>
          {allDone ? `סיום צ'ק-אין ${period.label} ✓` : `ממתין לסיום (${doneCount}/${period.tasks.length})`}
        </BigButton>

        {/* Task modal */}
        {checkinModal && activeTask && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 120,
            display: "flex", alignItems: "flex-end", justifyContent: "center"
          }} onClick={() => setCheckinModal(null)}>
            <div onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 440, background: C.surface,
                borderRadius: `${RADIUS_XL}px ${RADIUS_XL}px 0 0`,
                padding: "24px 22px 36px", boxShadow: "0 -10px 40px rgba(0,0,0,0.3)",
                maxHeight: "88vh", overflowY: "auto"
              }}>
              <div style={{ width: 48, height: 6, background: C.border, borderRadius: 3, margin: "0 auto 20px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 34 }}>{activeTask.icon}</span>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.ink }}>{activeTask.title}</h3>
              </div>
              <div style={{ background: C.primarySoft, borderRadius: RADIUS_MD, padding: "14px 16px", marginBottom: 22 }}>
                <p style={{ margin: 0, fontSize: 15, color: C.inkSoft, fontWeight: 600, lineHeight: 1.6 }}>
                  💬 {activeTask.description}
                </p>
              </div>
              <p style={{ fontSize: 19, fontWeight: 800, color: C.ink, marginBottom: 16 }}>{activeTask.question}</p>

              {activeTask.type === "rating" && (
                <>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n}
                        onClick={() => setCheckinAnswers(prev => ({
                          ...prev,
                          [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, rating: n } }
                        }))}
                        style={{
                          flex: 1, padding: "16px 0", borderRadius: RADIUS_PILL,
                          border: `2px solid ${draft.rating === n ? C.primary : C.border}`,
                          background: draft.rating === n ? C.primary : C.bg,
                          color: draft.rating === n ? "#fff" : C.ink,
                          fontWeight: 900, fontSize: 20, cursor: "pointer"
                        }}>{n}</button>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: 13, color: C.inkFaint, fontWeight: 600 }}>{activeTask.ratingLabels[0]}</span>
                    <span style={{ fontSize: 13, color: C.inkFaint, fontWeight: 600 }}>{activeTask.ratingLabels[4]}</span>
                  </div>
                  {activeTask.choices && (
                    <>
                      <p style={{ fontSize: 15, color: C.inkSoft, fontWeight: 700, marginBottom: 8 }}>בחר תיאור מהיר (לא חובה):</p>
                      <ChoiceChips
                        choices={activeTask.choices}
                        selected={draft.choices || []}
                        multi={true}
                        onToggle={c => { const cur = draft.choices || []; const next = cur.includes(c) ? cur.filter(x=>x!==c) : [...cur,c]; setCheckinAnswers(prev => ({ ...prev, [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, choices: next } } })); }}
                      />
                    </>
                  )}
                  <FreeText
                    value={draft.text || ""}
                    onChange={v => setCheckinAnswers(prev => ({
                      ...prev,
                      [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, text: v } }
                    }))}
                    placeholder={activeTask.freePlaceholder}
                  />
                </>
              )}

              {activeTask.type === "therapistTask" && (
                <>
                  {/* Task card — show what to do */}
                  <div style={{ background: "rgba(0,200,180,0.07)", border: `1.5px solid ${C.primary}`, borderRadius: RADIUS_XL, padding: "18px 16px", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 20 }}>📋</span>
                      <span style={{ fontWeight: 900, fontSize: 17, color: C.primary }}>{activeTask.taskContent.title}</span>
                      <span style={{ fontSize: 13, color: C.inkFaint, fontWeight: 600, marginRight: "auto" }}>⏱ {activeTask.taskContent.duration}</span>
                    </div>
                    <div style={{ background: C.bg, borderRadius: RADIUS_MD, padding: "12px 14px", marginBottom: 10 }}>
                      {activeTask.taskContent.instructions.split("\n").map((line, i) => (
                        <p key={i} style={{ margin: "0 0 6px", fontSize: 16, color: C.ink, fontWeight: 600, lineHeight: 1.5 }}>{line}</p>
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: C.inkSoft, fontWeight: 600, fontStyle: "italic" }}>
                      🎯 {activeTask.taskContent.goal}
                    </p>
                  </div>

                  {/* After reading/doing — confirm */}
                  <p style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 14 }}>{activeTask.question}</p>
                  <div style={{ display: "flex", gap: 12, marginBottom: draft.yesno === false ? 14 : 0 }}>
                    <button onClick={() => setCheckinAnswers(prev => ({ ...prev, [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, yesno: true } } }))}
                      style={{ flex: 1, padding: "16px 0", borderRadius: RADIUS_PILL, border: `2px solid ${draft.yesno === true ? C.primary : C.border}`, background: draft.yesno === true ? C.primary : C.bg, color: draft.yesno === true ? "#fff" : C.ink, fontWeight: 900, fontSize: 17, cursor: "pointer" }}>
                      {activeTask.yesLabel}
                    </button>
                    <button onClick={() => setCheckinAnswers(prev => ({ ...prev, [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, yesno: false } } }))}
                      style={{ flex: 1, padding: "16px 0", borderRadius: RADIUS_PILL, border: `2px solid ${draft.yesno === false ? C.primaryDeep : C.border}`, background: draft.yesno === false ? C.primarySoft : C.bg, color: draft.yesno === false ? C.primaryDeep : C.ink, fontWeight: 900, fontSize: 17, cursor: "pointer" }}>
                      {activeTask.noLabel}
                    </button>
                  </div>
                  {draft.yesno === false && activeTask.noChoices && (
                    <>
                      <p style={{ fontSize: 15, color: C.inkSoft, fontWeight: 700, marginBottom: 8 }}>למה לא? (בחר כמה שתרצה):</p>
                      <ChoiceChips
                        choices={activeTask.noChoices}
                        selected={draft.choices || []}
                        multi={true}
                        onToggle={ch => { const cur = draft.choices || []; const next = cur.includes(ch) ? cur.filter(x=>x!==ch) : [...cur,ch]; setCheckinAnswers(prev => ({ ...prev, [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, choices: next } } })); }}
                      />
                    </>
                  )}
                  <FreeText
                    value={draft.text || ""}
                    onChange={v => setCheckinAnswers(prev => ({ ...prev, [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, text: v } } }))}
                    placeholder={activeTask.explanationPlaceholder}
                  />
                </>
              )}

              {activeTask.type === "yesno" && (
                <>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <button onClick={() => setCheckinAnswers(prev => ({
                      ...prev,
                      [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, yesno: true } }
                    }))}
                      style={{
                        flex: 1, padding: "16px 0", borderRadius: RADIUS_PILL,
                        border: `2px solid ${draft.yesno === true ? C.primary : C.border}`,
                        background: draft.yesno === true ? C.primary : C.bg,
                        color: draft.yesno === true ? "#fff" : C.ink,
                        fontWeight: 900, fontSize: 18, cursor: "pointer"
                      }}>{activeTask.yesLabel}</button>
                    <button onClick={() => setCheckinAnswers(prev => ({
                      ...prev,
                      [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, yesno: false } }
                    }))}
                      style={{
                        flex: 1, padding: "16px 0", borderRadius: RADIUS_PILL,
                        border: `2px solid ${draft.yesno === false ? C.primaryDeep : C.border}`,
                        background: draft.yesno === false ? C.primarySoft : C.bg,
                        color: draft.yesno === false ? C.primaryDeep : C.ink,
                        fontWeight: 900, fontSize: 18, cursor: "pointer"
                      }}>{activeTask.noLabel}</button>
                  </div>
                  {/* Contextual chips based on yes/no selection */}
                  {draft.yesno === true && activeTask.yesChoices && (
                    <>
                      <p style={{ fontSize: 15, color: C.inkSoft, fontWeight: 700, marginBottom: 8 }}>מה בדיוק? (בחר מהיר):</p>
                      <ChoiceChips
                        choices={activeTask.yesChoices}
                        selected={draft.choices || []}
                        multi={true}
                        onToggle={c => { const cur = draft.choices || []; const next = cur.includes(c) ? cur.filter(x=>x!==c) : [...cur,c]; setCheckinAnswers(prev => ({ ...prev, [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, choices: next } } })); }}
                      />
                    </>
                  )}
                  {draft.yesno === false && activeTask.noChoices && (
                    <>
                      <p style={{ fontSize: 15, color: C.inkSoft, fontWeight: 700, marginBottom: 8 }}>למה לא? (בחר מהיר):</p>
                      <ChoiceChips
                        choices={activeTask.noChoices}
                        selected={draft.choices || []}
                        multi={true}
                        onToggle={c => { const cur = draft.choices || []; const next = cur.includes(c) ? cur.filter(x=>x!==c) : [...cur,c]; setCheckinAnswers(prev => ({ ...prev, [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, choices: next } } })); }}
                      />
                    </>
                  )}
                  <FreeText
                    value={draft.text || ""}
                    onChange={v => setCheckinAnswers(prev => ({
                      ...prev,
                      [checkinPeriod]: { ...prev[checkinPeriod], [checkinModal.taskId]: { ...draft, text: v } }
                    }))}
                    placeholder={activeTask.explanationPlaceholder}
                  />
                </>
              )}

              <div style={{ marginTop: 22 }}>
                <BigButton color={C.primary} disabled={!canSave} onClick={saveDraft}>
                  {canSave ? "שמירה ✓ — המשימה תסתמן" : "יש למלא את השאלה לפני השמירה"}
                </BigButton>
              </div>
              <button onClick={() => setCheckinModal(null)}
                style={{ width: "100%", marginTop: 10, padding: "12px 0", borderRadius: RADIUS_PILL,
                  border: "none", background: "none", color: C.inkFaint, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
                ביטול
              </button>
            </div>
          </div>
        )}

        <HomeButton onClick={goHome} />
      </div>
    );
  }

  if (screen === "tasks") {
    const todayIdx = new Date().getDay();
    const taskDraft = taskModal ? (taskAnswers[taskModal.id] || {}) : {};

    const saveTaskDraft = () => {
      if (!taskModal) return;
      const t = taskModal;
      let valid = false;
      if (t.type === "journal") valid = !!(taskDraft.text && taskDraft.text.trim().length > 2) || (taskDraft.choices?.length >= 1);
      if (t.type === "tip") valid = true;
      if (t.type === "cognitive") valid = !!taskDraft.rating;
      if (t.type === "external") valid = taskDraft.yesno !== undefined;
      if (!valid) return;
      setTaskAnswers(prev => ({ ...prev, [t.id]: { ...taskDraft, done: true } }));
      setTaskModal(null);
      addPoints(8);
    };

    const canSaveTask = taskModal ? (() => {
      const t = taskModal;
      if (t.type === "journal") return !!(taskDraft.text && taskDraft.text.trim().length > 2) || (taskDraft.choices?.length >= 1);
      if (t.type === "tip") return true;
      if (t.type === "cognitive") return !!taskDraft.rating;
      if (t.type === "external") return taskDraft.yesno !== undefined;
      return false;
    })() : false;

    return (
      <div style={{ minHeight: "100vh", background: C.bg, direction: "rtl", paddingTop: 72, paddingBottom: 110 }}>
        <div style={{ margin: "0" }}><DateTimeBar /></div>
        <div style={{ padding: "16px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ color: C.ink, margin: 0, fontSize: 30, fontWeight: 900 }}>משימות השבוע 📋</h2>
          <button onClick={() => setScreen("home")} style={{ background: "none", border: `1px solid ${C.divider}`, color: C.inkFaint, cursor: "pointer", fontSize: 20, width: 38, height: 38, borderRadius: RADIUS_PILL, display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>

        <div style={{ padding: "0 18px" }}>
          {/* Progress card */}
          <Card style={{ marginBottom: 18, background: C.primary }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, opacity: 0.85, fontSize: 15, fontWeight: 700 }}>הושלמו היום ({todayName})</p>
                <p style={{ margin: 0, fontSize: 40, fontWeight: 900 }}>{doneTaskCount}/{tasks.length}</p>
              </div>
              <div style={{ fontSize: 52 }}>{doneTaskCount === tasks.length ? "🏆" : doneTaskCount > 0 ? "⭐" : "💪"}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.3)", borderRadius: RADIUS_PILL, height: 8, marginTop: 14 }}>
              <div style={{ height: 8, background: "#fff", borderRadius: RADIUS_PILL, width: `${tasks.length ? (doneTaskCount / tasks.length) * 100 : 0}%`, transition: "width 0.4s" }} />
            </div>
          </Card>

          {/* Today's tasks */}
          <p style={{ fontWeight: 800, color: C.ink, fontSize: 18, marginBottom: 12 }}>היום — יום {todayName}</p>
          {tasks.length === 0 && (
            <Card style={{ textAlign: "center", padding: 28 }}>
              <p style={{ fontSize: 18, color: C.inkFaint, fontWeight: 600 }}>מור טל לא הגדיר משימות להיום ✓</p>
            </Card>
          )}
          {tasks.map(task => {
            const answer = taskAnswers[task.id];
            const isDone = answer?.done;
            const TYPE_COLORS = { journal: C.lavender, tip: C.gold, cognitive: C.primary, external: C.accentDeep };
            const TYPE_LABELS = { journal: "יומן", tip: "טיפ", cognitive: "תרגיל מחשבתי", external: "בעולם האמיתי" };
            const col = TYPE_COLORS[task.type] || C.primary;

            return (
              <button key={task.id} onClick={() => setTaskModal(task)}
                style={{
                  width: "100%", marginBottom: 14, padding: "18px 20px", borderRadius: RADIUS_XL,
                  border: `3px solid ${isDone ? col : C.border}`,
                  background: isDone ? col + "18" : C.surface,
                  display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.06)", textAlign: "right"
                }}>
                {/* Checkbox */}
                <div style={{
                  width: 38, height: 38, borderRadius: RADIUS_PILL, flexShrink: 0,
                  border: `3px solid ${isDone ? col : C.border}`,
                  background: isDone ? col : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {isDone && <span style={{ color: "#fff", fontSize: 18, fontWeight: 900 }}>✓</span>}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{task.icon}</span>
                    <span style={{ fontWeight: 800, fontSize: 18, color: isDone ? col : C.ink }}>{task.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: col, background: col + "1F", padding: "2px 8px", borderRadius: RADIUS_PILL }}>
                      {TYPE_LABELS[task.type]}
                    </span>
                  </div>
                  {isDone ? (
                    <span style={{ fontSize: 13, color: col, fontWeight: 700 }}>
                      {task.type === "journal" && answer.text ? `"${answer.text.slice(0, 36)}..."` : ""}
                      {task.type === "tip" ? "נקרא ✓" : ""}
                      {task.type === "cognitive" && answer.rating ? `דירוג ${answer.rating}/5` : ""}
                      {task.type === "external" ? (answer.yesno ? "✓ כן, בוצע" : "✗ לא הצלחתי") : ""}
                    </span>
                  ) : (
                    <span style={{ fontSize: 14, color: C.inkFaint, fontWeight: 600 }}>לחץ כדי לבצע ←</span>
                  )}
                </div>
                {!isDone && <span style={{ fontSize: 20, color: C.inkFaint }}>←</span>}
              </button>
            );
          })}

          {/* Other days — locked */}
          {HEBREW_DAY_NAMES.filter((d, i) => i !== todayIdx).map(day => {
            const dayTasks = WEEKLY_TASKS[day] || [];
            const dayIdx = HEBREW_DAY_NAMES.indexOf(day);
            const isPast = dayIdx < todayIdx;
            if (dayTasks.length === 0) return null;
            return (
              <Card key={day} style={{ marginBottom: 12, opacity: isPast ? 0.7 : 0.45, borderRadius: RADIUS_XL }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 17, color: C.ink }}>יום {day}</span>
                  {isPast
                    ? <span style={{ fontSize: 13, color: C.inkFaint, fontWeight: 600 }}>{dayTasks.filter(t => taskAnswers[t.id]?.done).length}/{dayTasks.length} הושלמו</span>
                    : <span style={{ fontSize: 20 }}>🔒</span>
                  }
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 14, color: C.inkFaint, fontWeight: 600 }}>
                  {dayTasks.map(t => t.title).join(" · ")}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Task modal */}
        {taskModal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 120,
            display: "flex", alignItems: "flex-end", justifyContent: "center"
          }} onClick={() => setTaskModal(null)}>
            <div onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 440, background: C.surface,
                borderRadius: `${RADIUS_XL}px ${RADIUS_XL}px 0 0`,
                padding: "24px 22px 36px", boxShadow: "0 -10px 40px rgba(0,0,0,0.3)",
                maxHeight: "90vh", overflowY: "auto"
              }}>
              <div style={{ width: 48, height: 6, background: C.border, borderRadius: 3, margin: "0 auto 20px" }} />

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 36 }}>{taskModal.icon}</span>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.ink }}>{taskModal.title}</h3>
              </div>

              {/* Therapist note bubble */}
              <div style={{ background: C.primarySoft, borderRadius: RADIUS_MD, padding: "14px 16px", marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 15, color: C.inkSoft, fontWeight: 600, lineHeight: 1.6 }}>
                  💬 {taskModal.therapistNote}
                </p>
              </div>

              {/* ── JOURNAL ── */}
              {taskModal.type === "journal" && (
                <>
                  <p style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 14 }}>{taskModal.prompt}</p>
                  {taskModal.choices && (
                    <>
                      <p style={{ fontSize: 15, color: C.inkSoft, fontWeight: 700, marginBottom: 8 }}>
                        {taskModal.multiSelect ? "בחר כמה שתרצה:" : "בחר או כתוב:"}
                      </p>
                      <ChoiceChips
                        choices={taskModal.choices}
                        selected={taskDraft.choices || []}
                        multi={true}
                        onToggle={c => {
                          const cur = taskDraft.choices || [];
                          const next = cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c];
                          setTaskAnswers(prev => ({ ...prev, [taskModal.id]: { ...taskDraft, choices: next } }));
                        }}
                      />
                    </>
                  )}
                  <p style={{ fontSize: 15, color: C.inkSoft, fontWeight: 700, marginBottom: 8 }}>
                    {taskModal.choices ? "או פרט במילים שלך:" : ""}
                  </p>
                  <textarea
                    value={taskDraft.text || ""}
                    onChange={e => setTaskAnswers(prev => ({ ...prev, [taskModal.id]: { ...taskDraft, text: e.target.value } }))}
                    placeholder={taskModal.placeholder}
                    rows={4}
                    style={{
                      width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.divider}`,
                      borderRadius: RADIUS_MD, padding: "14px 16px", fontSize: 16, fontWeight: 500,
                      color: C.ink, background: C.bg, resize: "none", outline: "none",
                      fontFamily: "inherit", direction: "rtl", lineHeight: 1.6
                    }}
                    onFocus={e => e.target.style.borderColor = C.primary}
                    onBlur={e => e.target.style.borderColor = C.divider}
                  />
                  <p style={{ fontSize: 13, color: C.inkFaint, fontWeight: 600, marginTop: 8 }}>
                    {(taskDraft.text || "").length > 0 ? `${(taskDraft.text || "").length} תווים` : (taskDraft.choices?.length >= 1 ? "✓ ניתן לשמור" : "בחר מהרשימה או כתוב כמה מילים")}
                  </p>
                </>
              )}

              {/* ── TIP ── */}
              {taskModal.type === "tip" && (
                <div style={{ background: C.lavenderSoft || C.primarySoft, borderRadius: RADIUS_LG, padding: "20px 18px" }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: C.ink, lineHeight: 1.7, margin: 0 }}>
                    "{taskModal.tip}"
                  </p>
                </div>
              )}

              {/* ── COGNITIVE ── */}
              {taskModal.type === "cognitive" && (
                <>
                  <p style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 16 }}>{taskModal.question}</p>
                  <p style={{ fontSize: 15, color: C.inkSoft, fontWeight: 700, marginBottom: 10 }}>{taskModal.ratingLabel}</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n}
                        onClick={() => setTaskAnswers(prev => ({ ...prev, [taskModal.id]: { ...taskDraft, rating: n } }))}
                        style={{
                          flex: 1, padding: "16px 0", borderRadius: RADIUS_PILL,
                          border: `3px solid ${taskDraft.rating === n ? C.primary : C.border}`,
                          background: taskDraft.rating === n ? C.primary : C.bg,
                          color: taskDraft.rating === n ? "#fff" : C.ink,
                          fontWeight: 900, fontSize: 20, cursor: "pointer"
                        }}>{n}</button>
                    ))}
                  </div>
                  <FreeText
                    value={taskDraft.text || ""}
                    onChange={v => setTaskAnswers(prev => ({ ...prev, [taskModal.id]: { ...taskDraft, text: v } }))}
                    placeholder={taskModal.freePlaceholder}
                  />
                </>
              )}

              {/* ── EXTERNAL ── */}
              {taskModal.type === "external" && (
                <>
                  <p style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 16 }}>{taskModal.question}</p>
                  <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                    <button onClick={() => setTaskAnswers(prev => ({ ...prev, [taskModal.id]: { ...taskDraft, yesno: true } }))}
                      style={{
                        flex: 1, padding: "18px 0", borderRadius: RADIUS_PILL,
                        border: `3px solid ${taskDraft.yesno === true ? C.primary : C.border}`,
                        background: taskDraft.yesno === true ? C.primary : C.bg,
                        color: taskDraft.yesno === true ? "#fff" : C.ink,
                        fontWeight: 900, fontSize: 18, cursor: "pointer"
                      }}>כן, עשיתי</button>
                    <button onClick={() => setTaskAnswers(prev => ({ ...prev, [taskModal.id]: { ...taskDraft, yesno: false } }))}
                      style={{
                        flex: 1, padding: "18px 0", borderRadius: RADIUS_PILL,
                        border: `3px solid ${taskDraft.yesno === false ? C.primaryDeep : C.border}`,
                        background: taskDraft.yesno === false ? C.primarySoft : C.bg,
                        color: taskDraft.yesno === false ? C.primaryDeep : C.ink,
                        fontWeight: 900, fontSize: 18, cursor: "pointer"
                      }}>לא הצלחתי</button>
                  </div>
                  <FreeText
                    value={taskDraft.text || ""}
                    onChange={v => setTaskAnswers(prev => ({ ...prev, [taskModal.id]: { ...taskDraft, text: v } }))}
                    placeholder={taskModal.freePlaceholder}
                  />
                </>
              )}

              {/* Save */}
              <div style={{ marginTop: 24 }}>
                <BigButton color={C.primary} disabled={!canSaveTask} onClick={saveTaskDraft}>
                  {canSaveTask ? "סיום ✓ — המשימה תסתמן" : "יש למלא לפני השמירה"}
                </BigButton>
              </div>
              <button onClick={() => setTaskModal(null)}
                style={{ width: "100%", marginTop: 10, padding: "12px 0", borderRadius: RADIUS_PILL,
                  border: "none", background: "none", color: C.inkFaint, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
                ביטול
              </button>
            </div>
          </div>
        )}

        <HomeButton onClick={goHome} />
      </div>
    );
  }

  if (screen === "calm") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, direction: "rtl", paddingTop: 72, paddingBottom: 130 }}>
        <DateTimeBar />
        <div style={{ padding: "16px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: C.ink, margin: 0, fontSize: 30, fontWeight: 900 }}>להירגע עכשיו 🌿</h2>
          <button onClick={() => { setScreen("home"); setCalmState(null); setSessionStarted(false); }} style={{ background: C.surface, border: "none", color: C.inkFaint, cursor: "pointer", fontSize: 28, width: 44, height: 44, borderRadius: RADIUS_PILL, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>✕</button>
        </div>

        {!calmState ? (
          <div style={{ padding: "20px 22px 0" }}>
            <p style={{ fontSize: 18, color: C.inkSoft, fontWeight: 600, marginBottom: 18, textAlign: "center" }}>
              מה הכי מתאר את מה שאתה מרגיש עכשיו?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {CALM_STATES.map(s => (
                <button key={s.id}
                  onClick={() => {
                    showInfoOnce(`calm-${s.id}`, s.tip);
                    setCalmState(s);
                  }}
                  style={{
                    padding: "22px 14px", borderRadius: RADIUS_XL, border: "none",
                    background: C.surface, boxShadow: "0 6px 20px rgba(61,107,240,0.10)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    cursor: "pointer"
                  }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: RADIUS_PILL, background: `${s.color}1A`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32
                  }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize: 19, fontWeight: 800, color: C.ink }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: "20px 22px 0" }}>
            <Card style={{ borderRadius: RADIUS_XL, marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: RADIUS_PILL, background: `${calmState.color}1A`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0
                }}>
                  {calmState.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 22, color: C.ink }}>{calmState.label}</p>
                  <p style={{ margin: 0, fontSize: 14, color: C.inkFaint, fontWeight: 600 }}>תרגיל נשימה מותאם</p>
                </div>
              </div>
              <p style={{ fontSize: 16, color: C.inkSoft, fontWeight: 600, lineHeight: 1.5, marginBottom: 0 }}>
                {calmState.intro}
              </p>
            </Card>

            {!sessionStarted ? (
              <Card style={{ borderRadius: RADIUS_XL, textAlign: "center", padding: 28 }}>
                <div style={{ fontSize: 52, marginBottom: 10 }}>🧘</div>
                <p style={{ fontSize: 18, color: C.inkSoft, fontWeight: 700, marginBottom: 22, lineHeight: 1.5 }}>
                  קח/י רגע להתיישב בנוחות.<br />כשתהיה/י מוכן/ה, נתחיל יחד.
                </p>
                <BigButton color={calmState.color} onClick={() => setSessionStarted(true)}>
                  אני מוכן/ה, בוא נתחיל
                </BigButton>
              </Card>
            ) : (
              <Card style={{ borderRadius: RADIUS_XL }}>
                <BreathingTimer
                  key={calmState.id}
                  state={calmState}
                  onFinish={() => { addPoints(10); setCalmState(null); setSessionStarted(false); }}
                />
              </Card>
            )}

            <button onClick={() => { setCalmState(null); setSessionStarted(false); }}
              style={{ width: "100%", marginTop: 14, padding: 14, borderRadius: RADIUS_PILL, border: `2px solid ${C.border}`, background: "none", color: C.inkSoft, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              → בחירת מצב אחר
            </button>
          </div>
        )}

        <HomeButton onClick={goHome} />
      </div>
    );
  }

  if (screen === "messages") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, direction: "rtl", display: "flex", flexDirection: "column" }}>
        <DateTimeBar />
        <div style={{ background: C.primary, padding: "16px 22px 22px", color: "#fff", borderRadius: `0 0 ${RADIUS_XL}px ${RADIUS_XL}px`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, opacity: 0.8, fontSize: 16, fontWeight: 600 }}>שיחה אישית</p>
            <h2 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 900 }}>דבר איתי בכל רגע 💬</h2>
            <p style={{ margin: "2px 0 0", fontSize: 13, opacity: 0.85, fontWeight: 600 }}>כאן בשבילך</p>
          </div>
          <button onClick={() => setScreen("home")}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: RADIUS_PILL, width: 40, height: 40, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: "18px 18px 200px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.from === "patient" ? "flex-start" : "flex-end" }}>
              {m.from !== "patient" && (
                <span style={{ fontSize: 12, color: C.inkFaint, fontWeight: 600, marginBottom: 4, paddingRight: 4 }}>
                  כלי תמיכה
                </span>
              )}

              {/* Crisis card — special high-visibility layout */}
              {m.isCrisis ? (
                <div style={{
                  maxWidth: "92%", padding: "20px", borderRadius: RADIUS_XL,
                  background: "#1A0A0A", border: "2px solid #E04040",
                  boxShadow: "0 8px 28px rgba(224,64,64,0.3)"
                }}>
                  {m.text.split("\n").map((line, i) => (
                    <p key={i} style={{ margin: "0 0 8px", fontSize: 16, fontWeight: line.startsWith("📞") ? 800 : 600, color: line.startsWith("📞") ? "#FF8080" : "rgba(255,220,220,0.9)", lineHeight: 1.5 }}>
                      {line}
                    </p>
                  ))}
                  <p style={{ margin: "10px 0 0", fontSize: 12, opacity: 0.5, color: "#fff" }}>{m.time}</p>
                </div>
              ) : (
                <div style={{
                  maxWidth: "82%", padding: "14px 18px",
                  borderRadius: m.from === "patient"
                    ? `${RADIUS_XL}px ${RADIUS_XL}px ${RADIUS_XL}px 6px`
                    : `${RADIUS_XL}px ${RADIUS_XL}px 6px ${RADIUS_XL}px`,
                  background: m.from === "patient" ? C.primary : C.surface,
                  color: m.from === "patient" ? "#fff" : C.ink,
                  border: m.from === "patient" ? "none" : `1px solid ${C.divider}`,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                }}>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 500, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{m.text}</p>
                  <p style={{ margin: "5px 0 0", fontSize: 12, opacity: 0.5, fontWeight: 600, textAlign: m.from === "patient" ? "left" : "right" }}>{m.time}</p>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 24, height: 24, borderRadius: 12, background: C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🌿</div>
                <span style={{ fontSize: 13, color: C.inkFaint, fontWeight: 600 }}>כותב...</span>
              </div>
              <div style={{ background: C.surface, borderRadius: `${RADIUS_XL}px ${RADIUS_XL}px 6px ${RADIUS_XL}px`, padding: "16px 20px", boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 10, height: 10, borderRadius: 5, background: C.inkFaint,
                      animation: `bounce 1.2s ${i * 0.2}s infinite`,
                      opacity: 0.6
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }`}</style>

        <div style={{ position: "fixed", bottom: 100, left: 0, right: 0, maxWidth: 440, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", gap: 8, background: C.surface, borderRadius: RADIUS_PILL, padding: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && newMessage.trim() && !isTyping) { handleSend(newMessage); } }}
              placeholder="שתף מה על לבך..."
              disabled={isTyping}
              style={{ flex: 1, border: "none", outline: "none", background: "none", padding: "12px 14px", fontSize: 19, color: C.ink, fontFamily: "inherit", direction: "rtl", opacity: isTyping ? 0.5 : 1 }}
            />
            <button
              onClick={() => { if (newMessage.trim() && !isTyping) handleSend(newMessage); }}
              disabled={isTyping || !newMessage.trim()}
              style={{ background: isTyping ? C.inkFaint : C.primary, color: "#fff", border: "none", borderRadius: RADIUS_PILL, width: 46, height: 46, fontSize: 22, cursor: isTyping ? "not-allowed" : "pointer", flexShrink: 0, transition: "background 0.2s" }}>
              ➤
            </button>
          </div>
        </div>
        <HomeButton onClick={goHome} />
      </div>
    );
  }

  if (screen === "schedule") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, direction: "rtl", paddingTop: 72, paddingBottom: 130 }}>
        <DateTimeBar />
        <div style={{ background: C.primary, padding: "16px 22px 24px", color: "#fff", borderRadius: `0 0 ${RADIUS_XL}px ${RADIUS_XL}px`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, opacity: 0.8, fontSize: 18, fontWeight: 600 }}>קביעת פגישה</p>
            <h2 style={{ margin: "4px 0 0", fontSize: 30, fontWeight: 900 }}>הלו"ז של מור טל 🗓️</h2>
          </div>
          <button onClick={() => setScreen("home")} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: RADIUS_PILL, width: 40, height: 40, fontSize: 23, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: 18 }}>
          {bookedAppointment ? (
            <Card style={{ borderRadius: RADIUS_XL, textAlign: "center", padding: 28 }}>
              <div style={{ fontSize: 60, marginBottom: 8 }}>✅</div>
              <h3 style={{ fontSize: 26, fontWeight: 900, color: C.ink, margin: "0 0 8px" }}>הפגישה נקבעה!</h3>
              <p style={{ fontSize: 21, fontWeight: 700, color: C.primaryDeep, margin: "0 0 4px" }}>
                יום {bookedAppointment.day}, בשעה {bookedAppointment.time}
              </p>
              <p style={{ fontSize: 16, color: C.inkFaint, fontWeight: 600, marginBottom: 28 }}>
                עם מור טל · מנתח התנהגות
              </p>

              {/* Add to calendar button */}
              <button
                onClick={() => {
                  // Build iCal event — find the next occurrence of this weekday
                  const dayMap = { "ראשון": 0, "שני": 1, "שלישי": 2, "רביעי": 3, "חמישי": 4, "שישי": 5, "שבת": 6 };
                  const targetDay = dayMap[bookedAppointment.day];
                  const now = new Date();
                  const diff = (targetDay - now.getDay() + 7) % 7 || 7;
                  const eventDate = new Date(now);
                  eventDate.setDate(now.getDate() + diff);
                  const [hh, mm] = bookedAppointment.time.split(":").map(Number);
                  eventDate.setHours(hh, mm, 0, 0);
                  const endDate = new Date(eventDate);
                  endDate.setMinutes(endDate.getMinutes() + 50);

                  const pad = n => String(n).padStart(2, "0");
                  const fmt = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

                  const ical = [
                    "BEGIN:VCALENDAR",
                    "VERSION:2.0",
                    "PRODID:-//PocketTherapy//HE",
                    "BEGIN:VEVENT",
                    `DTSTART:${fmt(eventDate)}`,
                    `DTEND:${fmt(endDate)}`,
                    `SUMMARY:פגישה עם מור טל`,
                    `DESCRIPTION:פגישה עם מור טל\\, מנתח התנהגות`,
                    `LOCATION:קליניקה`,
                    "BEGIN:VALARM",
                    "TRIGGER:-PT60M",
                    "ACTION:DISPLAY",
                    "DESCRIPTION:תזכורת — פגישה עם מור טל בעוד שעה",
                    "END:VALARM",
                    "END:VEVENT",
                    "END:VCALENDAR"
                  ].join("\r\n");

                  const blob = new Blob([ical], { type: "text/calendar;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "appointment.ics";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  width: "100%", padding: "18px 0", borderRadius: RADIUS_PILL, border: "none",
                  background: C.primary, color: "#fff",
                  fontSize: 18, fontWeight: 800, cursor: "pointer",
                  boxShadow: `0 8px 24px ${C.primary}55`,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  marginBottom: 14
                }}>
                📅 הוסף ליומן הטלפון
              </button>

              <BigButton color={C.surface} style={{ color: C.primaryDeep, boxShadow: "none", border: `2px solid ${C.border}` }}
                onClick={() => { setBookedAppointment(null); setSelectedSlot(null); }}>
                קביעת פגישה נוספת
              </BigButton>
            </Card>
          ) : (
            <>
              <p style={{ fontSize: 18, color: C.inkSoft, fontWeight: 600, marginBottom: 16, textAlign: "center" }}>
                בחר/י יום ושעה פנויים מהלו"ז השבועי הקבוע
              </p>
              {WEEK_DAYS.map(day => (
                <Card key={day} style={{ marginBottom: 14, borderRadius: RADIUS_XL }}>
                  <p style={{ fontWeight: 800, fontSize: 21, color: C.ink, marginBottom: 12 }}>יום {day}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {AVAILABILITY[day].map(time => {
                      const key = `${day}-${time}`;
                      const isBooked = BOOKED_SLOTS[key];
                      const isSelected = selectedSlot && selectedSlot.day === day && selectedSlot.time === time;
                      return (
                        <button key={time}
                          disabled={isBooked}
                          onClick={() => setSelectedSlot({ day, time })}
                          style={{
                            padding: "14px 20px", borderRadius: RADIUS_PILL, border: "3px solid",
                            borderColor: isSelected ? C.primaryDeep : isBooked ? C.border : C.primarySoft,
                            background: isSelected ? C.primaryDeep : isBooked ? C.bg : C.primarySoft,
                            color: isSelected ? "#fff" : isBooked ? C.inkFaint : C.primaryDeep,
                            fontWeight: 800, fontSize: 18,
                            cursor: isBooked ? "not-allowed" : "pointer",
                            textDecoration: isBooked ? "line-through" : "none",
                            opacity: isBooked ? 0.55 : 1
                          }}>
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              ))}

              <BigButton
                disabled={!selectedSlot}
                onClick={() => { setBookedAppointment(selectedSlot); addPoints(15); }}>
                {selectedSlot ? `קביעת פגישה ליום ${selectedSlot.day}, ${selectedSlot.time}` : "בחר/י מועד"}
              </BigButton>
            </>
          )}
        </div>
        <HomeButton onClick={goHome} />
      </div>
    );
  }

  // HOME
  // HOME

  if (statsScreen) {
    const STATS_INFO = {
      streak: {
        title: "🔥 ימים ברצף",
        what: "ספירת הימים הרצופים שבהם פתחת את האפליקציה ותיעדת לפחות פעולה אחת.",
        why: "עקביות היא אחד המנבאים החזקים ביותר להצלחה בטיפול. גם יום קשה שבו תיעדת דבר אחד — נחשב.",
        how: "כל יום שבו אתה ממלא צ'ק-אין, מסמן משימה, מתעד אירוע, או מדבר בצ'אט — מוסיף יום לרצף.",
        reset: "הרצף מתאפס אם עוברות 24 שעות ללא שום פעולה.",
        current: `${streak} ימים ברצף`,
        milestones: ["3 ימים — מדבקת 'מתחיל'", "7 ימים — 🏆 שבוע שלם!", "14 ימים — 🌟 שבועיים", "30 ימים — 💎 חודש"],
      },
      points: {
        title: "⭐ נקודות",
        what: "נקודות שאתה צובר על כל פעולה שאתה עושה באפליקציה.",
        why: "הנקודות הן לא רק סמל — הן מדד לעומק המעורבות שלך בתהליך הטיפולי. ככל שאתה מעורב יותר, יש יותר נתונים שעוזרים למור טל לדייק את הטיפול. ",
        how: "כל פעולה מזכה אותך:\n• צ'ק-אין בוקר — 5 נקודות לשאלה\n• סיום צ'ק-אין — 10 נקודות\n• משימה שהושלמה — 8 נקודות\n• תרגיל נשימה — 10 נקודות\n• קביעת פגישה — 15 נקודות\n• שיחה בצ'אט — 5 נקודות כל 2 פניות",
        reset: "הנקודות לא פגות — הן מצטברות לאורך כל הטיפול.",
        current: `${points} נקודות`,
        milestones: ["100 נקודות — 🌱 מתחיל", "300 נקודות — ⭐ מעורב", "500 נקודות — 🌟 עקבי", "1000 נקודות — 💎 מחויב"],
      },
      tasks: {
        title: "✅ משימות",
        what: "מספר המשימות שהשלמת היום מתוך כלל המשימות שמור טל הגדיר.",
        why: "משימות הן הגרעין של הטיפול. הן לא עוד 'רשימת מטלות' — הן תרגול ממשי של מיומנויות שנבחרו בשבילך.",
        how: "משימות נפתחות רק ביום שלהן. לוחצים על המשימה, ממלאים בפועל (כותבים, מדרגים, מאשרים) — והבוקס נסגר אוטומטית.",
        reset: "מאפס כל יום — המשימות של מחר יהיו חדשות.",
        current: `${doneTaskCount} מתוך ${tasks.length} היום`,
        milestones: ["כל משימות היום — 🏆 יום מלא!", "5 ימים רצופים עם כל המשימות — מדבקת 'מחויב'"],
      },
    };

    const info = STATS_INFO[statsScreen];
    return (
      <div style={{ minHeight: "100vh", background: C.bg, direction: "rtl", paddingTop: 72, paddingBottom: 110 }}>
        <DateTimeBar />
        <div style={{ background: `linear-gradient(135deg, ${C.primaryDeep}, ${C.primary})`, padding: "16px 22px 28px", color: "#fff", borderRadius: `0 0 ${RADIUS_XL}px ${RADIUS_XL}px` }}>
          <button onClick={() => setStatsScreen(null)}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: RADIUS_PILL, padding: "8px 16px", cursor: "pointer", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
            → חזרה
          </button>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>{info.title}</h2>
          <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 900, opacity: 0.95 }}>{info.current}</p>
        </div>

        <div style={{ padding: "22px 20px 0" }}>
          <Card style={{ marginBottom: 14, borderRadius: RADIUS_XL }}>
            <p style={{ fontWeight: 900, color: C.primaryDeep, fontSize: 17, marginBottom: 8 }}>מה זה?</p>
            <p style={{ color: C.ink, fontSize: 17, fontWeight: 600, lineHeight: 1.6, margin: 0 }}>{info.what}</p>
          </Card>

          <Card style={{ marginBottom: 14, borderRadius: RADIUS_XL, background: C.primarySoft }}>
            <p style={{ fontWeight: 900, color: C.primaryDeep, fontSize: 17, marginBottom: 8 }}>למה זה חשוב?</p>
            <p style={{ color: C.ink, fontSize: 17, fontWeight: 600, lineHeight: 1.6, margin: 0 }}>{info.why}</p>
          </Card>

          <Card style={{ marginBottom: 14, borderRadius: RADIUS_XL }}>
            <p style={{ fontWeight: 900, color: C.primaryDeep, fontSize: 17, marginBottom: 10 }}>איך צוברים?</p>
            {info.how.split("\n").map((line, i) => (
              <p key={i} style={{ color: C.ink, fontSize: 16, fontWeight: line.startsWith("•") ? 700 : 600, margin: "0 0 6px", lineHeight: 1.5 }}>{line}</p>
            ))}
          </Card>

          <Card style={{ marginBottom: 14, borderRadius: RADIUS_XL }}>
            <p style={{ fontWeight: 900, color: C.primaryDeep, fontSize: 17, marginBottom: 10 }}>ציוני דרך 🏆</p>
            {info.milestones.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < info.milestones.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 16, color: C.ink, fontWeight: 700 }}>{m}</span>
              </div>
            ))}
          </Card>

          <Card style={{ borderRadius: RADIUS_XL, background: C.lavenderSoft || C.primarySoft }}>
            <p style={{ fontWeight: 900, color: C.primaryDeep, fontSize: 16, marginBottom: 6 }}>🔄 איפוס</p>
            <p style={{ color: C.ink, fontSize: 16, fontWeight: 600, margin: 0 }}>{info.reset}</p>
          </Card>
        </div>
        <HomeButton onClick={goHome} />
      </div>
    );
  }
  return (
    <div style={{ minHeight: "100vh", background: C.bg, direction: "rtl", paddingBottom: 28, paddingTop: 72 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primaryDeep}, ${C.primary})`, padding: "0 22px 40px", color: "#fff", borderRadius: `0 0 ${RADIUS_XL + 8}px ${RADIUS_XL + 8}px`, transition: "background 1.2s ease" }}>
        <DateTimeBar light />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, marginTop: 16 }}>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p className="greeting-line" style={{ margin: 0, color: "#fff" }}>
              {(() => { const h = new Date().getHours(); return h < 5 ? "לילה טוב" : h < 12 ? "בוקר טוב" : h < 17 ? "צהריים טובים" : "ערב טוב"; })()}, {firstName} 👋
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onSwitch}
              style={{ background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.35)", color: "#fff", borderRadius: RADIUS_PILL, padding: "8px 16px", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>
              מטפל
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 18px", marginTop: -20 }}>
        {/* Single big CTA — leads to today's missions */}
        {(() => {
          const openPeriod = getOpenPeriodId();
          const pendingTasks = tasks.filter(t => !taskAnswers[t.id]?.done);
          const checkinPending = openPeriod &&
            !CHECKIN_PERIODS[openPeriod].tasks.every(t => checkinAnswers[openPeriod]?.[t.id]?.done);
          const totalPending = pendingTasks.length + (checkinPending ? 1 : 0);
          const allDone = totalPending === 0;

          return (
            <button
              onClick={() => checkinPending
                ? (setCheckinPeriod(openPeriod), setScreen("checkin"))
                : setScreen("tasks")}
              style={{
                width: "100%", padding: "30px 20px 26px",
                borderRadius: RADIUS_XL, border: "4px solid #000",
                background: allDone
                  ? `linear-gradient(135deg, ${C.accentDeep}, ${C.accent})`
                  : `linear-gradient(135deg, ${C.primaryDeep}, ${C.primary})`,
                color: "#fff", cursor: "pointer", marginBottom: 14,
                boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8
              }}>
              <span style={{ fontSize: 38 }}>{allDone ? "🏆" : "📋"}</span>
              <span style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.3 }}>
                {allDone ? "כל המשימות הושלמו!" : "המשימות שלי היום"}
              </span>
              <span style={{ fontSize: 15, opacity: 0.88, fontWeight: 600 }}>
                {allDone
                  ? `כל הכבוד, ${firstName} 🎉`
                  : totalPending === 1
                    ? "נשארה עוד משימה אחת"
                    : `${totalPending} פריטים ממתינים — ${gender === "female" ? "לחצי" : "לחץ"} לפירוט`}
              </span>
            </button>
          );
        })()}

        <button onClick={() => { showInfoOnce("talkChat", "שיחה אישית שמסייעת להתאים לך טיפול מדויק יותר. שתף מה שעל הלב — הכל בסדר."); setScreen("messages"); }}
          style={{
            width: "100%", padding: "28px 20px", borderRadius: RADIUS_PILL,
            border: "4px solid #000",
            background: `linear-gradient(135deg, ${C.primaryDeep}, ${C.primary})`,
            color: "#fff", fontSize: 26, fontWeight: 900, cursor: "pointer",
            boxShadow: "0 12px 32px rgba(0,0,0,0.55)", marginBottom: 14,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6
          }}>
          💬 דבר איתי בכל רגע
          <span style={{ fontSize: 16, opacity: 0.9, fontWeight: 600 }}>כאן בשבילך</span>
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <BubbleTile icon={checkinDone ? "✅" : "☀️"} label="צ'ק-אין" onClick={() => { showInfoOnce("checkin", "כמה שאלות קצרות שעוזרות לנו להבין איך אתה מתחיל את היום."); setCheckinPeriod(null); setScreen("checkin"); }} active={checkinDone} accentColor={C.accentDeep} />
          <BubbleTile icon={doneTaskCount === tasks.length ? "🏆" : "📋"} label="משימות" onClick={() => { showInfoOnce("tasks", "כאן תמצא את המשימות שמור טל הגדיר עבורך השבוע. כל משימה שתסמן מקרבת אותך ליעד ומזכה אותך בנקודות."); setScreen("tasks"); }} active={doneTaskCount === tasks.length} accentColor={C.accentDeep} />
          <BubbleTile icon="🌿" label="להירגע עכשיו" onClick={() => { showInfoOnce("calmHome", "להירגע עכשיו: בחר/י את הרגש שהכי מתאר את מה שאתה מרגיש, ותקבל/י תרגיל נשימה מודרך שמותאם בדיוק אליו."); setScreen("calm"); }} accentColor={C.accent} />
          <BubbleTile icon="🗓️" label="פגישה" onClick={() => { showInfoOnce("schedule", "כאן תוכל לבחור יום ושעה פנויים מתוך הלו\"ז הקבוע של מור טל ולקבוע פגישה תוך שניות."); setScreen("schedule"); }} accentColor={C.primaryDeep} />
        </div>
      </div>
    </div>
  );
}

// ─── SOS overlay — emergency quick-dial, lives outside screen switch ─
function SOSOverlay({ sosOpen, setSosOpen, personalContact, setPersonalContact }) {
  const [editingContact, setEditingContact] = useState(false);
  const [contactDraft, setContactDraft] = useState(personalContact);

  if (!sosOpen && !editingContact) return null;

  return (
    <>
      {sosOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(14,37,84,0.55)", zIndex: 100,
          display: "flex", alignItems: "flex-end", justifyContent: "center"
        }} onClick={() => setSosOpen(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 440, background: C.surface,
              borderRadius: `${RADIUS_XL}px ${RADIUS_XL}px 0 0`, padding: "26px 22px 34px",
              boxShadow: "0 -10px 40px rgba(0,0,0,0.3)"
            }}>
            <div style={{ width: 48, height: 6, background: C.border, borderRadius: 3, margin: "0 auto 18px" }} />
            <h2 style={{ margin: 0, textAlign: "center", fontSize: 28, fontWeight: 900, color: C.warn }}>🆘 מסך חירום</h2>
            <p style={{ textAlign: "center", color: C.inkSoft, fontSize: 18, fontWeight: 600, margin: "8px 0 22px" }}>
              בחר/י את מי להתקשר אליו עכשיו
            </p>

            <a href="tel:1201" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: RADIUS_PILL, border: "none", border: `1.5px solid ${C.divider}`, background: C.primarySoft, color: C.primaryDeep, fontSize: 20, fontWeight: 800, cursor: "pointer", marginBottom: 12 }}>
                <span style={{ fontSize: 30 }}>💬</span>
                <span style={{ flex: 1, textAlign: "right" }}>ער"ן — תמיכה נפשית · 1201</span>
              </button>
            </a>

            <a href="tel:100" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: RADIUS_PILL, border: "none", border: `1.5px solid ${C.divider}`, background: C.primarySoft, color: C.primaryDeep, fontSize: 20, fontWeight: 800, cursor: "pointer", marginBottom: 12 }}>
                <span style={{ fontSize: 30 }}>🚓</span>
                <span style={{ flex: 1, textAlign: "right" }}>משטרה · 100</span>
              </button>
            </a>

            <a href="tel:101" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: RADIUS_PILL, border: "none", border: `1.5px solid ${C.divider}`, background: C.primarySoft, color: C.primaryDeep, fontSize: 20, fontWeight: 800, cursor: "pointer", marginBottom: 12 }}>
                <span style={{ fontSize: 30 }}>🚑</span>
                <span style={{ flex: 1, textAlign: "right" }}>מד"א · 101</span>
              </button>
            </a>

            <a href={`tel:${personalContact.phone.replace(/-/g, "")}`} style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: RADIUS_PILL, border: `3px solid ${C.primaryDeep}`, background: C.primaryDeep, color: "#fff", fontSize: 20, fontWeight: 800, cursor: "pointer", marginBottom: 18 }}>
                <span style={{ fontSize: 30 }}>📞</span>
                <span style={{ flex: 1, textAlign: "right" }}>
                  {personalContact.name || "איש קשר אישי"}
                  <br />
                  <span style={{ fontSize: 15, fontWeight: 600, opacity: 0.85 }}>{personalContact.phone || "לא הוגדר"}</span>
                </span>
              </button>
            </a>

            <button onClick={() => { setContactDraft(personalContact); setEditingContact(true); }}
              style={{ width: "100%", padding: "12px 0", borderRadius: RADIUS_PILL, border: `2px solid ${C.border}`, background: "none", color: C.inkSoft, fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 6 }}>
              ✏️ עריכת איש קשר אישי
            </button>

            <button onClick={() => setSosOpen(false)}
              style={{ width: "100%", padding: "14px 0", borderRadius: RADIUS_PILL, border: "none", background: C.bg, color: C.inkSoft, fontSize: 18, fontWeight: 700, cursor: "pointer" }}>
              סגירה
            </button>
          </div>
        </div>
      )}

      {editingContact && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(14,37,84,0.55)", zIndex: 110,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24
        }} onClick={() => setEditingContact(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 380, background: C.surface, borderRadius: RADIUS_XL, padding: 26 }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 24, fontWeight: 900, color: C.ink, textAlign: "center" }}>איש קשר לחירום</h3>
            <p style={{ fontSize: 16, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>שם איש הקשר</p>
            <input
              value={contactDraft.name}
              onChange={e => setContactDraft(c => ({ ...c, name: e.target.value }))}
              placeholder="לדוגמה: אמא – רותי"
              style={{ width: "100%", boxSizing: "border-box", border: `2.5px solid ${C.border}`, borderRadius: RADIUS_MD, padding: "14px 16px", fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 16, outline: "none", fontFamily: "inherit", direction: "rtl" }}
            />
            <p style={{ fontSize: 16, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>מספר נייד</p>
            <input
              value={contactDraft.phone}
              onChange={e => setContactDraft(c => ({ ...c, phone: e.target.value }))}
              placeholder="050-1234567"
              style={{ width: "100%", boxSizing: "border-box", border: `2.5px solid ${C.border}`, borderRadius: RADIUS_MD, padding: "14px 16px", fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 22, outline: "none", fontFamily: "inherit", direction: "ltr", textAlign: "right" }}
            />
            <BigButton onClick={() => { setPersonalContact(contactDraft); setEditingContact(false); }}>
              שמירה
            </BigButton>
            <button onClick={() => setEditingContact(false)}
              style={{ width: "100%", marginTop: 10, padding: "12px 0", borderRadius: RADIUS_PILL, border: "none", background: "none", color: C.inkFaint, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              ביטול
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Patient app wrapper — owns SOS state shared across all screens ─
function PatientApp({ onSwitch, user }) {
  const [sosOpen, setSosOpen] = useState(false);
  const [personalContact, setPersonalContact] = useState({ name: "אמא – רותי", phone: "050-1234567" });
  const [pointsToast, setPointsToast] = useState(null);
  const [infoBubble, setInfoBubble] = useState(null);
  const [seenTiles, setSeenTiles] = useState({});
  // Shared display state for TopBar — updated by PatientAppInner via callbacks
  const [topBarData, setTopBarData] = useState({ streak: 7, points: 340, doneTaskCount: 0, tasksTotal: 5 });
  const [screen, setScreenGlobal] = useState("home");

  return (
    <>
      <TopBar
        onHome={() => setScreenGlobal("__home__")}
        streak={topBarData.streak}
        points={topBarData.points}
        doneTaskCount={topBarData.doneTaskCount}
        tasksTotal={topBarData.tasksTotal}
        onStatClick={(key) => setScreenGlobal(`__stats_${key}__`)}
      />
      <PatientAppInner
        onSwitch={onSwitch}
        sosOpen={sosOpen} setSosOpen={setSosOpen}
        personalContact={personalContact}
        pointsToast={pointsToast} setPointsToast={setPointsToast}
        infoBubble={infoBubble} setInfoBubble={setInfoBubble}
        seenTiles={seenTiles}
        topBarData={topBarData} setTopBarData={setTopBarData}
        externalNav={screen} clearExternalNav={() => setScreenGlobal("home")}
        user={user}
      />
      <SOSOverlay sosOpen={sosOpen} setSosOpen={setSosOpen} personalContact={personalContact} setPersonalContact={setPersonalContact} />
      {pointsToast && <PointsToast amount={pointsToast} onDone={() => setPointsToast(null)} />}
      {infoBubble && (
        <InfoBubble
          text={infoBubble.text}
          onClose={() => setInfoBubble(null)}
          onDontShowAgain={() => { setSeenTiles(s => ({ ...s, [infoBubble.key]: true })); setInfoBubble(null); }}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// THERAPIST DASHBOARD
// ═══════════════════════════════════════════════════════════════════

function TherapistApp({ onSwitch }) {
  const [selected, setSelected] = useState(null);
  const [subTab, setSubTab] = useState("overview");
  const [discussionModal, setDiscussionModal] = useState(null);
  const [drillLoading, setDrillLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  const patients = [...MOCK_PATIENTS].sort((a, b) => a.name.localeCompare(b.name, "he"));

  const PRIORITY_COLOR = { high: "#E04040", medium: C.primary, low: C.inkFaint };
  const PRIORITY_LABEL = { high: "דחוף", medium: "חשוב", low: "שוטף" };

  // ── Patient list ─────────────────────────────────────────────────
  if (!selected) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, direction: "rtl", paddingBottom: 40 }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(160deg, #0B1E2D, #0D2E3A)`, padding: "52px 22px 28px", borderBottom: "1px solid rgba(0,200,180,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, color: "rgba(200,237,232,0.6)", fontSize: 14, fontWeight: 600 }}>ממשק מטפל</p>
              <h1 style={{ margin: "4px 0 0", color: "#C8EDE8", fontSize: 28, fontWeight: 900 }}>מור טל</h1>
              <p style={{ margin: "2px 0 0", color: "rgba(200,237,232,0.5)", fontSize: 14, fontWeight: 600 }}>מנתח התנהגות · {patients.length} מטופלים</p>
            </div>
            <button onClick={onSwitch} style={{ background: "rgba(0,200,180,0.12)", border: "1px solid rgba(0,200,180,0.3)", color: "#A8EDE8", borderRadius: RADIUS_PILL, padding: "8px 18px", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
              → מטופל
            </button>
          </div>
        </div>

        <div style={{ padding: "22px 18px 0" }}>
          <p style={{ color: C.inkFaint, fontSize: 14, fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
            מטופלים — לפי א׳-ב׳
          </p>
          {patients.map(p => {
            const hasCritical = p.lastSession.anomalies.some(a => a.severity === "high");
            return (
              <button key={p.id} onClick={() => { setSelected(p); setSubTab("overview"); setAiAnalysis(null); }}
                style={{
                  width: "100%", marginBottom: 12, padding: "18px 18px",
                  background: C.surface, borderRadius: RADIUS_XL,
                  border: `1.5px solid ${hasCritical ? "rgba(224,64,64,0.4)" : "rgba(0,200,180,0.14)"}`,
                  display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                  boxShadow: hasCritical ? "0 4px 18px rgba(224,64,64,0.15)" : "0 2px 12px rgba(0,0,0,0.25)",
                  textAlign: "right"
                }}>
                {/* Avatar */}
                <div style={{ width: 50, height: 50, borderRadius: RADIUS_PILL, flexShrink: 0, background: "rgba(0,200,180,0.15)", border: "2px solid rgba(0,200,180,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: C.primary }}>{p.initials}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 900, fontSize: 18, color: C.ink }}>{p.name}</span>
                    {hasCritical && <span style={{ fontSize: 12, color: "#E04040", fontWeight: 700, background: "rgba(224,64,64,0.12)", padding: "2px 8px", borderRadius: RADIUS_PILL }}>⚠️ דחוף</span>}
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 13, color: C.inkFaint, fontWeight: 600 }}>🔥 {p.streak} ימים</span>
                    <span style={{ fontSize: 13, color: C.inkFaint, fontWeight: 600 }}>פגישה {p.nextSession.date.split(" ")[0]} {p.nextSession.date.split(" ")[1]}</span>
                  </div>
                </div>
                <span style={{ color: C.inkFaint, fontSize: 20 }}>←</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Patient profile ───────────────────────────────────────────────
  const p = selected;
  const TABS = [
    { id: "overview", label: "סקירה" },
    { id: "sessions", label: "מפגשים" },
    { id: "tasks", label: "משימות" },
    { id: "discuss", label: "לדיון" },
    { id: "ai", label: "🧠 AI" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, direction: "rtl", paddingBottom: 50 }}>
      {/* Patient header */}
      <div style={{ background: "linear-gradient(160deg, #0B1E2D, #0D2E3A)", padding: "44px 20px 20px", borderBottom: "1px solid rgba(0,200,180,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <button onClick={() => setSelected(null)} style={{ background: "rgba(0,200,180,0.12)", border: "1px solid rgba(0,200,180,0.3)", color: "#A8EDE8", borderRadius: RADIUS_PILL, padding: "7px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
            ← חזרה
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: RADIUS_PILL, background: "rgba(0,200,180,0.15)", border: "2px solid rgba(0,200,180,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: C.primary }}>{p.initials}</span>
          </div>
          <div>
            <h2 style={{ margin: 0, color: "#C8EDE8", fontSize: 24, fontWeight: 900 }}>{p.name}</h2>
            <p style={{ margin: "3px 0 0", color: "rgba(200,237,232,0.55)", fontSize: 13, fontWeight: 600 }}>{p.diagnosis}</p>
          </div>
        </div>
        {/* Quick stats row */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "מפגשים", val: p.sessionCount },
            { label: "רצף ימים", val: p.streak },
            { label: "נקודות", val: p.points },
            { label: "ממוצע מצב רוח", val: p.weekStats.avgMood + "/5" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: "rgba(0,200,180,0.07)", borderRadius: RADIUS_MD, border: "1px solid rgba(0,200,180,0.15)", padding: "8px 6px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color: C.primary }}>{s.val}</p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(200,237,232,0.5)", fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", background: C.surface, borderBottom: "1px solid rgba(0,200,180,0.12)", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            style={{
              flex: "0 0 auto", padding: "13px 18px", border: "none",
              background: "none", cursor: "pointer", fontSize: 14, fontWeight: 800,
              color: subTab === t.id ? C.primary : C.inkFaint,
              borderBottom: subTab === t.id ? `2.5px solid ${C.primary}` : "2.5px solid transparent",
              whiteSpace: "nowrap"
            }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "18px 18px 0" }}>

        {/* ── OVERVIEW ── */}
        {subTab === "overview" && (
          <>
            {/* Next session */}
            <div style={{ background: "linear-gradient(135deg, #007B6E, #00C8B4)", borderRadius: RADIUS_XL, padding: "18px 20px", marginBottom: 14 }}>
              <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 700 }}>המפגש הבא</p>
              <p style={{ margin: 0, color: "#fff", fontSize: 20, fontWeight: 900 }}>{p.nextSession.date}</p>
              <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600 }}>{p.nextSession.time} · {p.nextSession.location}</p>
            </div>

            {/* Last session summary */}
            <div style={{ background: C.surface, borderRadius: RADIUS_XL, border: "1px solid rgba(0,200,180,0.14)", padding: "18px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ margin: 0, fontWeight: 900, fontSize: 16, color: C.ink }}>📋 מפגש אחרון</p>
                <span style={{ fontSize: 13, color: C.inkFaint, fontWeight: 600 }}>{p.lastSession.date} · {p.lastSession.duration}</span>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 15, color: C.inkSoft, fontWeight: 600, lineHeight: 1.6 }}>{p.lastSession.summary}</p>
              {p.lastSession.anomalies.length > 0 && (
                <>
                  <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 14, color: "#E04040" }}>⚠️ חריגים שזוהו</p>
                  {p.lastSession.anomalies.map((a, i) => (
                    <div key={i} style={{ padding: "8px 12px", background: a.severity === "high" ? "rgba(224,64,64,0.1)" : "rgba(255,180,0,0.08)", borderRadius: RADIUS_MD, border: `1px solid ${a.severity === "high" ? "rgba(224,64,64,0.3)" : "rgba(255,180,0,0.25)"}`, marginBottom: 6 }}>
                      <p style={{ margin: 0, fontSize: 14, color: a.severity === "high" ? "#E04040" : "#C89000", fontWeight: 700 }}>{a.text}</p>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Weekly stats */}
            <div style={{ background: C.surface, borderRadius: RADIUS_XL, border: "1px solid rgba(0,200,180,0.14)", padding: "18px" }}>
              <p style={{ margin: "0 0 12px", fontWeight: 900, fontSize: 16, color: C.ink }}>📊 נתוני השבוע</p>
              {[
                ["ממוצע מצב רוח", p.weekStats.avgMood + "/5"],
                ["אירועי ABC שתועדו", p.weekStats.abcEvents],
                ["צ׳ק-אין שהושלמו", p.weekStats.checkinRate],
                ["משימות שהושלמו", p.weekStats.tasksCompleted],
              ].map(([label, val], i, arr) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.divider}` : "none" }}>
                  <span style={{ fontSize: 15, color: C.inkSoft, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 15, color: C.primary, fontWeight: 900 }}>{val}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── SESSIONS ── */}
        {subTab === "sessions" && (
          <>
            <p style={{ margin: "0 0 14px", fontWeight: 900, fontSize: 16, color: C.ink }}>היסטוריית מפגשים ({p.sessionCount})</p>
            {p.sessions.map((s, i) => {
              const isOpen = expandedSession === i;
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <button onClick={() => setExpandedSession(isOpen ? null : i)}
                    style={{ width: "100%", background: C.surface, borderRadius: isOpen ? `${RADIUS_XL}px ${RADIUS_XL}px 0 0` : RADIUS_XL, border: "1px solid rgba(0,200,180,0.18)", padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "right", borderBottom: isOpen ? "none" : undefined }}>
                    <div style={{ width: 42, height: 42, borderRadius: RADIUS_PILL, background: "rgba(0,200,180,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 20, color: C.primary }}>📅</span>
                    </div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: C.ink }}>{s.date} · {s.duration}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 14, color: C.inkSoft, fontWeight: 600 }}>{s.topic}</p>
                    </div>
                    <span style={{ color: C.primary, fontSize: 18, transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none" }}>←</span>
                  </button>
                  {isOpen && (
                    <div style={{ background: C.surface, border: "1px solid rgba(0,200,180,0.18)", borderTop: `1px solid ${C.divider}`, borderRadius: `0 0 ${RADIUS_XL}px ${RADIUS_XL}px`, padding: "18px 18px 20px" }}>
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ margin: "0 0 6px", fontWeight: 800, fontSize: 14, color: C.primary }}>📝 סיכום</p>
                        <p style={{ margin: 0, fontSize: 15, color: C.inkSoft, fontWeight: 600, lineHeight: 1.6 }}>{s.summary}</p>
                      </div>
                      <div style={{ marginBottom: 14, padding: "12px 14px", background: "rgba(0,200,180,0.06)", borderRadius: RADIUS_LG }}>
                        <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 14, color: C.primary }}>🎯 יעדים שנקבעו</p>
                        <p style={{ margin: 0, fontSize: 15, color: C.ink, fontWeight: 600 }}>{s.goals}</p>
                      </div>
                      {s.anomalies && s.anomalies !== "אין." && s.anomalies !== "אין חריגים." && (
                        <div style={{ marginBottom: 14, padding: "12px 14px", background: "rgba(224,64,64,0.08)", borderRadius: RADIUS_LG, border: "1px solid rgba(224,64,64,0.2)" }}>
                          <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 14, color: "#E04040" }}>⚠️ חריגים</p>
                          <p style={{ margin: 0, fontSize: 15, color: "#E04040", fontWeight: 600 }}>{s.anomalies}</p>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, color: C.inkFaint, fontWeight: 600 }}>מצב רוח ממוצע:</span>
                        <span style={{ fontSize: 14, color: C.primary, fontWeight: 800 }}>{s.mood}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── TASKS ── */}
        {subTab === "tasks" && (
          <>
            <p style={{ margin: "0 0 14px", fontWeight: 900, fontSize: 16, color: C.ink }}>משימות שהוגדרו</p>
            {p.pendingTasks.map((t, i) => {
              const isOpen = expandedTask === i;
              const pct = t.totalDays > 0 ? Math.round((t.completedDays / t.totalDays) * 100) : 0;
              const statusColor = t.status === "הושלם" ? C.primary : t.status === "הושלם חלקית" || t.status === "בתהליך" ? "#C8A000" : C.inkFaint;
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <button onClick={() => setExpandedTask(isOpen ? null : i)}
                    style={{ width: "100%", background: C.surface, borderRadius: isOpen ? `${RADIUS_XL}px ${RADIUS_XL}px 0 0` : RADIUS_XL, border: "1px solid rgba(0,200,180,0.18)", padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "right", borderBottom: isOpen ? "none" : undefined }}>
                    <div style={{ width: 34, height: 34, borderRadius: RADIUS_PILL, background: "rgba(0,200,180,0.1)", border: "1.5px solid rgba(0,200,180,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 16, color: C.primary }}>📌</span>
                    </div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: C.ink }}>{t.text}</p>
                      <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: statusColor, fontWeight: 700 }}>{t.status}</span>
                        {t.totalDays > 1 && <span style={{ fontSize: 13, color: C.inkFaint, fontWeight: 600 }}>{t.completedDays}/{t.totalDays} ימים</span>}
                      </div>
                    </div>
                    <span style={{ color: C.primary, fontSize: 18, display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>←</span>
                  </button>
                  {isOpen && (
                    <div style={{ background: C.surface, border: "1px solid rgba(0,200,180,0.18)", borderTop: `1px solid ${C.divider}`, borderRadius: `0 0 ${RADIUS_XL}px ${RADIUS_XL}px`, padding: "18px" }}>
                      {t.totalDays > 1 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 14, color: C.inkSoft, fontWeight: 700 }}>ביצוע</span>
                            <span style={{ fontSize: 14, color: C.primary, fontWeight: 800 }}>{pct}%</span>
                          </div>
                          <div style={{ background: C.border, borderRadius: RADIUS_PILL, height: 8 }}>
                            <div style={{ height: 8, borderRadius: RADIUS_PILL, background: pct >= 70 ? C.primary : pct >= 40 ? "#C8A000" : "#E04040", width: `${pct}%`, transition: "width 0.4s" }} />
                          </div>
                        </div>
                      )}
                      <div style={{ padding: "12px 14px", background: "rgba(0,200,180,0.06)", borderRadius: RADIUS_LG, marginBottom: 10 }}>
                        <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 14, color: C.primary }}>💬 הערת מטפל</p>
                        <p style={{ margin: 0, fontSize: 15, color: C.ink, fontWeight: 600, lineHeight: 1.5 }}>{t.note}</p>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 14, color: C.inkFaint, fontWeight: 600 }}>עד: {t.dueDate}</span>
                        <span style={{ fontSize: 14, color: C.inkFaint, fontWeight: 600 }}>סוג: {t.type}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── DISCUSSION POINTS ── */}
        {subTab === "discuss" && (
          <>
            <p style={{ margin: "0 0 14px", fontWeight: 900, fontSize: 16, color: C.ink }}>נקודות לדיון במפגש הבא</p>
            {p.discussionPoints.map((dp, i) => (
              <button key={i} onClick={async () => {
                setDiscussionModal({ text: dp.text, priority: dp.priority, aiInsight: null });
                setDrillLoading(true);
                try {
                  const insight = await callClaudeJSON({
                    userPrompt: `אתה מנתח התנהגות מוסמך (BCBA). עבור נקודת הדיון: "${dp.text}" — מטופל: ${p.name}, ${p.age} שנים, אבחנה: ${p.diagnosis}. JSON בלבד: {"questions":["שאלה 1","שאלה 2","שאלה 3"],"hypothesis":"השערה קצרה","intervention":"המלצה אחת ספציפית"}`
                  });
                  setDiscussionModal(prev => ({ ...prev, aiInsight: insight }));
                } catch(e) {} finally { setDrillLoading(false); }
              }}
                style={{ width: "100%", marginBottom: 10, padding: "16px 18px", background: C.surface, borderRadius: RADIUS_XL, border: `1.5px solid ${dp.priority === "high" ? "rgba(224,64,64,0.35)" : "rgba(0,200,180,0.14)"}`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "right" }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: PRIORITY_COLOR[dp.priority], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: C.ink }}>{dp.text}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 13, color: PRIORITY_COLOR[dp.priority], fontWeight: 700 }}>{PRIORITY_LABEL[dp.priority]} · לחץ לניתוח AI 🧠</p>
                </div>
                <span style={{ fontSize: 18, color: C.inkFaint }}>←</span>
              </button>
            ))}

            {/* Discussion drill-down modal */}
            {discussionModal && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 150, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setDiscussionModal(null)}>
                <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: C.surface, borderRadius: `${RADIUS_XL}px ${RADIUS_XL}px 0 0`, padding: "24px 22px 36px", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 -12px 48px rgba(0,0,0,0.5)" }}>
                  <div style={{ width: 48, height: 6, background: C.border, borderRadius: 3, margin: "0 auto 20px" }} />
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 5, background: PRIORITY_COLOR[discussionModal.priority], flexShrink: 0 }} />
                    <h3 style={{ margin: 0, fontSize: 19, fontWeight: 900, color: C.ink, lineHeight: 1.4 }}>{discussionModal.text}</h3>
                  </div>
                  {drillLoading ? (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: 5, background: C.primary, animation: `bounce 1.2s ${i*0.2}s infinite` }} />)}
                      </div>
                      <p style={{ color: C.inkFaint, fontSize: 15, fontWeight: 600, marginTop: 12 }}>מנתח עם AI...</p>
                    </div>
                  ) : discussionModal.aiInsight ? (
                    <>
                      <div style={{ background: C.primarySoft, borderRadius: RADIUS_LG, padding: "14px 16px", marginBottom: 12 }}>
                        <p style={{ margin: "0 0 4px", fontWeight: 800, color: C.primary, fontSize: 14 }}>השערה</p>
                        <p style={{ margin: 0, fontSize: 15, color: C.ink, fontWeight: 600, lineHeight: 1.5 }}>{discussionModal.aiInsight.hypothesis}</p>
                      </div>
                      <div style={{ background: "rgba(0,200,180,0.07)", borderRadius: RADIUS_LG, padding: "14px 16px", marginBottom: 16 }}>
                        <p style={{ margin: "0 0 4px", fontWeight: 800, color: C.primary, fontSize: 14 }}>המלצת התערבות</p>
                        <p style={{ margin: 0, fontSize: 15, color: C.ink, fontWeight: 600, lineHeight: 1.5 }}>{discussionModal.aiInsight.intervention}</p>
                      </div>
                      <p style={{ fontWeight: 800, color: C.ink, fontSize: 15, marginBottom: 10 }}>שאלות לשאול במפגש:</p>
                      {discussionModal.aiInsight.questions?.map((q, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, padding: "10px 14px", background: C.bg, borderRadius: RADIUS_MD }}>
                          <span style={{ fontWeight: 900, color: C.primary, fontSize: 16, flexShrink: 0 }}>{i+1}.</span>
                          <span style={{ fontSize: 15, color: C.ink, fontWeight: 600, lineHeight: 1.5 }}>{q}</span>
                        </div>
                      ))}
                    </>
                  ) : null}
                  <button onClick={() => setDiscussionModal(null)} style={{ width: "100%", marginTop: 16, padding: "14px 0", borderRadius: RADIUS_PILL, border: `1px solid ${C.border}`, background: "none", color: C.inkSoft, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>סגירה</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── AI ANALYSIS ── */}
        {subTab === "ai" && (
          <>
            <div style={{ background: C.surface, borderRadius: RADIUS_XL, border: "1px solid rgba(0,200,180,0.14)", padding: "22px", marginBottom: 14, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🧠</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 900, color: C.ink }}>ניתוח AI — {p.name}</h3>
              <p style={{ fontSize: 15, color: C.inkSoft, fontWeight: 600, marginBottom: 20, lineHeight: 1.5 }}>
                Claude ינתח את כל נתוני ABC, צ׳ק-אין, ומגמות השבוע ויציג דפוסים והמלצות קליניות.
              </p>
              <button onClick={async () => {
                setAiLoading(true); setAiAnalysis(null);
                try {
                  const result = await callClaudeJSON({
                    userPrompt: `ניתוח קליני עבור ${p.name}, ${p.age}, ${p.diagnosis}. נתוני שבוע: מצב רוח ממוצע ${p.weekStats.avgMood}/5, ${p.weekStats.abcEvents} אירועי ABC, צ'ק-אין ${p.weekStats.checkinRate}, משימות ${p.weekStats.tasksCompleted}. מפגש אחרון: ${p.lastSession.summary}. JSON בלבד: {"patterns":["דפוס 1","דפוס 2","דפוס 3"],"function":"פונקציה התנהגותית","recommendations":[{"title":"המלצה 1","detail":"פירוט"},{"title":"המלצה 2","detail":"פירוט"}],"sessionFocus":"נושא מרכזי למפגש הבא"}`
                  });
                  setAiAnalysis(result);
                } catch(e) {} finally { setAiLoading(false); }
              }} style={{ padding: "14px 28px", borderRadius: RADIUS_PILL, border: "none", background: C.primary, color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 24px ${C.primary}55` }}>
                {aiLoading ? "מנתח..." : aiAnalysis ? "רענן ניתוח" : "הפעל ניתוח ▶"}
              </button>
            </div>

            {aiLoading && (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: C.primary, animation: `bounce 1.2s ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}

            {aiAnalysis && !aiLoading && (
              <>
                <div style={{ background: C.primarySoft, borderRadius: RADIUS_XL, border: "1px solid rgba(0,200,180,0.2)", padding: "18px", marginBottom: 12 }}>
                  <p style={{ margin: "0 0 12px", fontWeight: 900, color: C.primary, fontSize: 16 }}>🔍 דפוסים שזוהו</p>
                  {aiAnalysis.patterns?.map((pat, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <span style={{ color: C.primary, fontWeight: 900 }}>{i+1}.</span>
                      <span style={{ fontSize: 15, color: C.ink, fontWeight: 600, lineHeight: 1.5 }}>{pat}</span>
                    </div>
                  ))}
                </div>
                {aiAnalysis.function && (
                  <div style={{ background: "rgba(0,200,180,0.07)", borderRadius: RADIUS_XL, border: "1px solid rgba(0,200,180,0.14)", padding: "18px", marginBottom: 12 }}>
                    <p style={{ margin: "0 0 8px", fontWeight: 900, color: C.primary, fontSize: 16 }}>🎯 פונקציה התנהגותית</p>
                    <p style={{ margin: 0, fontSize: 15, color: C.ink, fontWeight: 600, lineHeight: 1.6 }}>{aiAnalysis.function}</p>
                  </div>
                )}
                {aiAnalysis.recommendations?.map((r, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: RADIUS_XL, border: "1px solid rgba(0,200,180,0.14)", padding: "18px", marginBottom: 10, borderRight: `4px solid ${C.primary}` }}>
                    <p style={{ margin: "0 0 6px", fontWeight: 800, fontSize: 16, color: C.ink }}>💡 {r.title}</p>
                    <p style={{ margin: 0, fontSize: 15, color: C.inkSoft, fontWeight: 600, lineHeight: 1.5 }}>{r.detail}</p>
                  </div>
                ))}
                {aiAnalysis.sessionFocus && (
                  <div style={{ background: "linear-gradient(135deg, #007B6E, #00C8B4)", borderRadius: RADIUS_XL, padding: "18px", marginBottom: 10 }}>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 700, margin: "0 0 6px" }}>נושא מרכזי למפגש הבא</p>
                    <p style={{ color: "#fff", fontWeight: 900, fontSize: 18, margin: 0, lineHeight: 1.4 }}>{aiAnalysis.sessionFocus}</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ONBOARDING SCREENS
// ═══════════════════════════════════════════════════════════════════

function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ minHeight: "100vh", background: "#07131C", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg, #007B6E, #00C8B4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(0,200,180,0.4)", animation: "pulse 2s infinite" }}>
        <span style={{ fontSize: 40 }}>🌿</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: "#C8EDE8", fontSize: 32, fontWeight: 900, margin: 0 }}>Therappist</h1>
        <p style={{ color: "rgba(200,237,232,0.7)", fontSize: 22, fontWeight: 700, margin: "4px 0 0" }}>טרפיסט</p>
        <p style={{ color: "rgba(200,237,232,0.5)", fontSize: 15, fontWeight: 600, margin: "10px 0 0" }}>המרחב הטיפולי שלך</p>
        <p style={{ color: "rgba(200,237,232,0.28)", fontSize: 13, fontWeight: 500, margin: "8px 0 0" }}>By Mor Tal</p>
      </div>
      <style>{`@keyframes pulse { 0%,100%{box-shadow:0 20px 60px rgba(0,200,180,0.4)} 50%{box-shadow:0 20px 80px rgba(0,200,180,0.7)} }`}</style>
    </div>
  );
}

function RoleSelectScreen({ onSelect }) {
  return (
    <div style={{ minHeight: "100vh", background: "#07131C", direction: "rtl", display: "flex", flexDirection: "column", padding: "60px 24px 40px" }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ color: "#C8EDE8", fontSize: 30, fontWeight: 900, margin: "0 0 8px" }}>ברוכים הבאים</h1>
        <p style={{ color: "rgba(200,237,232,0.55)", fontSize: 16, fontWeight: 600, margin: 0 }}>מי אתה?</p>
      </div>

      {[
        { role: "patient", icon: "🙋", title: "מטופל" },
        { role: "therapist", icon: "🩺", title: "מטפל" },
      ].map(r => (
        <button key={r.role} onClick={() => onSelect(r.role)}
          style={{
            width: "100%", padding: "28px 24px", marginBottom: 14,
            background: "#0D1E2B", border: "1.5px solid rgba(0,200,180,0.2)",
            borderRadius: 20, display: "flex", alignItems: "center", gap: 18,
            cursor: "pointer", textAlign: "right",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(0,200,180,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
            {r.icon}
          </div>
          <span style={{ flex: 1, fontWeight: 800, fontSize: 20, color: "#C8EDE8" }}>{r.title}</span>
          <span style={{ color: "rgba(0,200,180,0.6)", fontSize: 20 }}>←</span>
        </button>
      ))}
    </div>
  );
}

function RegisterScreen({ role, onDone }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", gender: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isTherapist = role === "therapist";

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "שם חובה";
    if (!form.email.includes("@")) e.email = "כתובת מייל לא תקינה";
    if (form.password.length < 6) e.password = "סיסמה חייבת לפחות 6 תווים";
    if (isTherapist && !form.phone.trim()) e.phone = "מספר טלפון חובה למטפל";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onDone({ ...form, role });
  };

  const fieldStyle = (field) => ({
    width: "100%", boxSizing: "border-box",
    background: "#0D1E2B",
    border: `1.5px solid ${errors[field] ? "#E04040" : "rgba(0,200,180,0.2)"}`,
    borderRadius: 12, padding: "14px 16px", fontSize: 16,
    color: "#C8EDE8", outline: "none", direction: "rtl",
    fontFamily: "inherit"
  });

  return (
    <div style={{ minHeight: "100vh", background: "#07131C", direction: "rtl", padding: "60px 24px 40px", overflowY: "auto" }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ color: "#C8EDE8", fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>
          {isTherapist ? "הרשמה כמטפל" : "הרשמה"}
        </h1>
        <p style={{ color: "rgba(200,237,232,0.5)", fontSize: 15, fontWeight: 600, margin: 0 }}>
          {isTherapist ? "צור חשבון מטפל ונהל את המטופלים שלך" : "צור חשבון אישי והתחל את המסע"}
        </p>
      </div>

      {/* שם מלא */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", color: "rgba(200,237,232,0.7)", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>שם פרטי</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="שם פרטי"
          style={fieldStyle("name")}
        />
        {errors.name && <p style={{ color: "#E04040", fontSize: 13, fontWeight: 600, margin: "4px 0 0" }}>{errors.name}</p>}
      </div>

      {/* מגדר */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", color: "rgba(200,237,232,0.7)", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>זהות מגדרית</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { value: "male",   label: "זכר" },
            { value: "female", label: "נקבה" },
            { value: "other",  label: "אחר" },
          ].map(g => (
            <button key={g.value} type="button"
              onClick={() => setForm(f => ({ ...f, gender: g.value }))}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 10, cursor: "pointer",
                border: `1.5px solid ${form.gender === g.value ? "#00C8B4" : "rgba(0,200,180,0.2)"}`,
                background: form.gender === g.value ? "rgba(0,200,180,0.15)" : "#0D1E2B",
                color: form.gender === g.value ? "#00C8B4" : "rgba(200,237,232,0.6)",
                fontWeight: 700, fontSize: 15, fontFamily: "inherit"
              }}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* מייל */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", color: "rgba(200,237,232,0.7)", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>כתובת מייל</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="daniel@example.com"
          style={fieldStyle("email")}
        />
        {errors.email && <p style={{ color: "#E04040", fontSize: 13, fontWeight: 600, margin: "4px 0 0" }}>{errors.email}</p>}
      </div>

      {/* סיסמה */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", color: "rgba(200,237,232,0.7)", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>סיסמה</label>
        <input
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          placeholder="לפחות 6 תווים"
          style={fieldStyle("password")}
        />
        {errors.password && <p style={{ color: "#E04040", fontSize: 13, fontWeight: 600, margin: "4px 0 0" }}>{errors.password}</p>}
      </div>

      {/* טלפון — רק למטפל */}
      {isTherapist && (
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", color: "rgba(200,237,232,0.7)", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>מספר טלפון</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="050-0000000"
            style={fieldStyle("phone")}
          />
          {errors.phone && <p style={{ color: "#E04040", fontSize: 13, fontWeight: 600, margin: "4px 0 0" }}>{errors.phone}</p>}
        </div>
      )}

      {isTherapist && (
        <div style={{ background: "rgba(0,200,180,0.06)", border: "1px solid rgba(0,200,180,0.15)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(200,237,232,0.6)", fontWeight: 600, lineHeight: 1.5 }}>
            📋 כמטפל תוכל להגדיר משימות, לעקוב אחרי מטופלים, ולקבל ניתוח AI של הנתונים.
          </p>
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading}
        style={{
          width: "100%", padding: "16px 0", borderRadius: 14, border: "none",
          background: loading ? "rgba(0,200,180,0.3)" : "linear-gradient(135deg, #007B6E, #00C8B4)",
          color: "#fff", fontSize: 17, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 8px 28px rgba(0,200,180,0.35)",
          marginBottom: 16
        }}>
        {loading ? "יוצר חשבון..." : "צור חשבון"}
      </button>

      <p style={{ textAlign: "center", color: "rgba(200,237,232,0.4)", fontSize: 13, fontWeight: 600 }}>
        כבר יש לך חשבון?{" "}
        <button onClick={handleSubmit} style={{ background: "none", border: "none", color: "#00C8B4", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 }}>
          כניסה
        </button>
      </p>

      <p style={{ textAlign: "center", color: "rgba(200,237,232,0.25)", fontSize: 12, fontWeight: 600, marginTop: 24, lineHeight: 1.6 }}>
        ההרשמה מהווה הסכמה לתנאי השירות ומדיניות הפרטיות.{"\n"}המידע שלך מוצפן ומאובטח.
      </p>
    </div>
  );
}

function PatientOnboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ therapistCode: "", goals: [], notifications: true });

  const GOAL_OPTIONS = [
    { id: "anxiety", label: "ניהול חרדה", icon: "🧠" },
    { id: "mood", label: "ויסות רגשי", icon: "💙" },
    { id: "habits", label: "בניית הרגלים", icon: "🔄" },
    { id: "relations", label: "מערכות יחסים", icon: "🤝" },
    { id: "focus", label: "ריכוז וקשב", icon: "🎯" },
    { id: "sleep", label: "שינה ומנוחה", icon: "🌙" },
  ];

  const screens = [
    // Step 0 — connect to therapist
    <div key={0}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔗</div>
        <h2 style={{ color: "#C8EDE8", fontSize: 26, fontWeight: 900, margin: "0 0 10px" }}>חיבור למטפל</h2>
        <p style={{ color: "rgba(200,237,232,0.55)", fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>
          הכנס את קוד הגישה שקיבלת מהמטפל שלך. אם עדיין אין לך קוד — דלג.
        </p>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", color: "rgba(200,237,232,0.7)", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>קוד גישה מהמטפל</label>
        <input
          value={data.therapistCode}
          onChange={e => setData(d => ({ ...d, therapistCode: e.target.value.toUpperCase() }))}
          placeholder="לדוגמה: MT-2026-XXXX"
          style={{ width: "100%", boxSizing: "border-box", background: "#0D1E2B", border: "1.5px solid rgba(0,200,180,0.2)", borderRadius: 12, padding: "14px 16px", fontSize: 17, color: "#C8EDE8", outline: "none", direction: "rtl", fontFamily: "inherit", textAlign: "center", letterSpacing: 2, fontWeight: 700 }}
        />
      </div>
      <button onClick={() => setStep(1)}
        style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "1px solid rgba(0,200,180,0.2)", background: "none", color: "rgba(200,237,232,0.5)", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
        דלג — אגדיר מאוחר יותר
      </button>
    </div>,

    // Step 1 — goals
    <div key={1}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
        <h2 style={{ color: "#C8EDE8", fontSize: 26, fontWeight: 900, margin: "0 0 10px" }}>מה חשוב לך?</h2>
        <p style={{ color: "rgba(200,237,232,0.55)", fontSize: 15, fontWeight: 600 }}>
          בחר עד 3 נושאים שהכי רלוונטיים לך עכשיו
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
        {GOAL_OPTIONS.map(g => {
          const sel = data.goals.includes(g.id);
          return (
            <button key={g.id}
              onClick={() => setData(d => ({
                ...d,
                goals: sel ? d.goals.filter(x => x !== g.id) : d.goals.length < 3 ? [...d.goals, g.id] : d.goals
              }))}
              style={{
                padding: "16px 12px", borderRadius: 16,
                background: sel ? "rgba(0,200,180,0.15)" : "#0D1E2B",
                border: `1.5px solid ${sel ? "#00C8B4" : "rgba(0,200,180,0.15)"}`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                cursor: "pointer"
              }}>
              <span style={{ fontSize: 28 }}>{g.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: sel ? "#00C8B4" : "rgba(200,237,232,0.7)" }}>{g.label}</span>
            </button>
          );
        })}
      </div>
    </div>,

    // Step 2 — notifications
    <div key={2}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔔</div>
        <h2 style={{ color: "#C8EDE8", fontSize: 26, fontWeight: 900, margin: "0 0 10px" }}>תזכורות</h2>
        <p style={{ color: "rgba(200,237,232,0.55)", fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>
          נשלח לך 3 תזכורות יומיות — בוקר, צהריים וערב — לצ'ק-אין ומשימות.
        </p>
      </div>
      {[
        { time: "06:00", label: "צ'ק-אין בוקר", icon: "🌅" },
        { time: "11:00", label: "צ'ק-אין צהריים", icon: "🌤️" },
        { time: "17:00", label: "צ'ק-אין ערב", icon: "🌙" },
        { time: "20:00", label: "תזכורת משימות", icon: "📋" },
      ].map((n, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#0D1E2B", borderRadius: 12, border: "1px solid rgba(0,200,180,0.12)", marginBottom: 10 }}>
          <span style={{ fontSize: 22 }}>{n.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#C8EDE8" }}>{n.label}</p>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(200,237,232,0.4)", fontWeight: 600 }}>{n.time}</p>
          </div>
          <div style={{ width: 20, height: 20, borderRadius: 10, background: "#00C8B4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>
          </div>
        </div>
      ))}
    </div>,

    // Step 3 — ready
    <div key={3} style={{ textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
      <h2 style={{ color: "#C8EDE8", fontSize: 28, fontWeight: 900, margin: "0 0 14px" }}>הכל מוכן!</h2>
      <p style={{ color: "rgba(200,237,232,0.6)", fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: 32 }}>
        ברוך הבא למרחב הטיפולי שלך. כל מה שתשתף כאן מסייע לדייק את הטיפול ולהכין אותך טוב יותר לכל מפגש.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
        {["🔒 מאובטח ומוצפן", "📊 נגיש למטפל שלך", "🔔 תזכורות יומיות"].map(t => (
          <span key={t} style={{ padding: "6px 14px", background: "rgba(0,200,180,0.1)", border: "1px solid rgba(0,200,180,0.2)", borderRadius: 20, fontSize: 13, color: "rgba(200,237,232,0.7)", fontWeight: 600 }}>{t}</span>
        ))}
      </div>
    </div>
  ];

  const titles = ["חיבור למטפל", "מה חשוב לך?", "תזכורות", "מוכן!"];
  const isLast = step === screens.length - 1;

  return (
    <div style={{ minHeight: "100vh", background: "#07131C", direction: "rtl", padding: "48px 24px 40px", display: "flex", flexDirection: "column" }}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 40 }}>
        {screens.map((_, i) => (
          <div key={i} style={{ height: 4, borderRadius: 2, background: i <= step ? "#00C8B4" : "rgba(0,200,180,0.15)", width: i === step ? 24 : 8, transition: "all 0.3s" }} />
        ))}
      </div>

      <div style={{ flex: 1 }}>{screens[step]}</div>

      <button
        onClick={() => isLast ? onDone() : setStep(s => s + 1)}
        style={{
          width: "100%", padding: "16px 0", borderRadius: 14, border: "none",
          background: "linear-gradient(135deg, #007B6E, #00C8B4)",
          color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 8px 28px rgba(0,200,180,0.35)", marginTop: 24
        }}>
        {isLast ? "בואו נתחיל 🚀" : "המשך"}
      </button>

      {step > 0 && (
        <button onClick={() => setStep(s => s - 1)}
          style={{ width: "100%", marginTop: 10, padding: "12px 0", background: "none", border: "none", color: "rgba(200,237,232,0.35)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          חזרה
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// APP ROOT — with full auth/onboarding flow
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  // Auth state: splash → roleSelect → register → onboarding → app
  const [authStep, setAuthStep] = useState("splash"); // splash | roleSelect | register | onboarding | app
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("patient");
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay);

  useEffect(() => {
    const tick = () => {
      const tod = getTimeOfDay();
      Object.assign(C, getPalette(tod));
      setTimeOfDay(tod);
      document.documentElement.style.setProperty("--divider", C.divider);
    };
    document.documentElement.style.setProperty("--divider", C.divider);
    const id = setInterval(tick, 60000);
    tick();
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!("Notification" in window) || authStep !== "app") return;
    const scheduleNotif = (title, body, h, m = 0) => {
      const now = new Date(), target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      return setTimeout(() => {
        if (Notification.permission === "granted") new Notification(title, { body, dir: "rtl", lang: "he" });
        scheduleNotif(title, body, h, m);
      }, target - now);
    };
    const go = async () => {
      const perm = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      if (perm !== "granted") return;
      const timers = [
        scheduleNotif("🌅 בוקר טוב", "הצ'ק-אין הבוקר פתוח", 6),
        scheduleNotif("🌤️ צהריים טובים", "הצ'ק-אין הצהריים פתוח", 11),
        scheduleNotif("🌙 ערב טוב", "הצ'ק-אין הערב פתוח", 17),
        scheduleNotif("📋 תזכורת", "יש משימות שממתינות", 20),
      ];
      return () => timers.forEach(clearTimeout);
    };
    go();
  }, [authStep]);

  const GLOBAL_STYLE = `
    textarea, input[type="text"], input[type="email"], input[type="password"], input[type="tel"] {
      border-bottom: 1px solid var(--divider, #0D3050) !important;
    }
    h1 { -webkit-text-stroke: 1.8px rgba(0,0,0,0.45); paint-order: stroke fill; font-weight: 900 !important; }
    h2 { -webkit-text-stroke: 1.4px rgba(0,0,0,0.40); paint-order: stroke fill; font-weight: 900 !important; }
    h3 { -webkit-text-stroke: 1.1px rgba(0,0,0,0.35); paint-order: stroke fill; font-weight: 900 !important; }
    .stat-bold { -webkit-text-stroke: 1.5px rgba(0,0,0,0.35); paint-order: stroke fill; font-size: 38px !important; font-weight: 900 !important; }
    .greeting-line { -webkit-text-stroke: 1.2px rgba(0,0,0,0.30); paint-order: stroke fill; font-size: 26px !important; font-weight: 900 !important; }
    * { -webkit-tap-highlight-color: transparent; }
    button { transition: opacity 0.15s, transform 0.1s; }
    button:active { opacity: 0.8; transform: scale(0.98); }
  `;

  const wrap = children => (
    <div style={{ maxWidth: 440, margin: "0 auto", fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: C.bg }}>
      <style>{GLOBAL_STYLE}</style>
      {children}
    </div>
  );

  if (authStep === "splash") return wrap(<SplashScreen onDone={() => setAuthStep("roleSelect")} />);
  if (authStep === "roleSelect") return wrap(<RoleSelectScreen onSelect={r => { setRole(r); setAuthStep("register"); }} />);
  if (authStep === "register") return wrap(<RegisterScreen role={role} onDone={u => { setUser(u); setAuthStep(role === "patient" ? "onboarding" : "app"); setMode(role); }} />);
  if (authStep === "onboarding") return wrap(<PatientOnboarding onDone={() => setAuthStep("app")} />);

  // Main app
  return wrap(
    <>
      {mode === "patient"
        ? <PatientApp onSwitch={() => setMode("therapist")} user={user} />
        : <TherapistApp onSwitch={() => setMode("patient")} />
      }
    </>
  );
}

