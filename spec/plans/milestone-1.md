# תוכנית – Milestone 1: שלד האפליקציה, PWA בסיסי וחיבור ל-Vercel

## מטרה
אפליקציית Next.js שעולה מקומית ומציגה את מסך יצירת הבדיחה (ללא פעולה) בעברית וב-RTL, בצבעים ובגופן של ה-Style Guide, ניתנת לזיהוי כ-PWA, ומחוברת ל-Vercel לאחר הדחיפה הראשונה.

מקורות: `MILESTONES.md` (Milestone 1), `PRD.md` (4.א.1, 4.א.8, 3.ג), `ARCHITECTURE.md` (1, 2.2, 2.6, 3), `DESIGN.md` (1, 2), `wireframes.png`, `style-guide.png`.

---

## 0. דרישה מקדימה – Node.js
Node.js **אינו מותקן** כרגע במחשב (נבדק: `node` ו-`npm` לא נמצאו). בלעדיו אי אפשר להריץ או לבנות את האפליקציה.
- לפני תחילת הבנייה: בעל הפרויקט מתקין את גרסת ה-**LTS** של Node.js מ-https://nodejs.org (התקנה רגילה, ברירות מחדל), ופותח מחדש את אפליקציית Claude.
- בתחילת הבנייה: לוודא ש-`node -v` מחזיר גרסה 20.9 ומעלה (המינימום של Next.js העדכני). אם לא — לעצור ולדווח.

---

## 1. הקמת הפרויקט (ידנית, בלי `create-next-app`)
התיקייה כבר מכילה `spec/`, `CLAUDE.md` ו-`.gitignore`, ו-`create-next-app` מסרב לעבוד בתיקייה לא ריקה ומוסיף דברים שלא צריך (Tailwind, ESLint, דוגמאות). לכן ההקמה ידנית ומינימלית.

### קבצים בשורש
| קובץ | תוכן |
|---|---|
| `package.json` | `name: "joklik"`, `private: true`, סקריפטים: `dev` (`next dev`), `build` (`next build`), `start` (`next start`). תלויות: `next`, `react`, `react-dom`. תלויות פיתוח: `typescript`, `@types/react`, `@types/react-dom`, `@types/node`. גרסאות: העדכניות היציבות בזמן ההתקנה (`npm install <pkg>@latest`), נעולות ב-`package-lock.json`. |
| `tsconfig.json` | ההגדרה הסטנדרטית של Next.js (strict, `moduleResolution: "bundler"`, `jsx`, plugin של next, alias `@/*` → `./*`). Next.js משלים אותו אוטומטית בהרצה הראשונה. |
| `next.config.ts` | הגדרה מינימלית + headers ל-`/sw.js`: `Cache-Control: no-cache, no-store, must-revalidate` ו-`Content-Type: application/javascript; charset=utf-8` (לפי מדריך ה-PWA של Next.js), כדי שה-Service Worker תמיד יתעדכן. |
| `next-env.d.ts` | נוצר אוטומטית על ידי Next.js. |
| `.gitignore` | **לא מוחלף.** `.next/`, `node_modules/`, `*.tsbuildinfo`, `.vercel/` כבר קיימים בו. להוסיף רק אם בהרצה מתגלה קובץ/תיקייה שנוצרים ולא מוחרגים. |

- אין ESLint, Tailwind, ספריית UI או ספריית PWA (לפי ARCHITECTURE: CSS Modules + CSS Variables, PWA ידני).
- אין `.env` / `.env.example` ב-Milestone הזה — אין עדיין משתנים (הם נוספים ב-Milestone 2).
- אין תיקיית `app/api/` עדיין. "מבנה Frontend ו-Backend באותו פרויקט" מתקיים מעצם השימוש ב-Next.js App Router; ה-Route Handler `app/api/joke/route.ts` ייווצר ב-Milestone 2.

### מבנה תיקיות
```text
app/
  layout.tsx              # html lang/dir, Heebo, metadata, viewport, SW registration
  globals.css             # Design Tokens + reset + base styles
  manifest.ts             # Web App Manifest
  page.tsx                # Main screen (server component, renders JokeScreen)
  page.module.css         # Page column layout
components/
  JokeScreen.tsx          # Client component: header, input, counter, helper, button
  JokeScreen.module.css
  ServiceWorkerRegister.tsx  # Client component that registers /sw.js
public/
  sw.js                   # Minimal service worker, no cache
  icons/
    icon-192.png
    icon-512.png
    icon-maskable-512.png
    apple-touch-icon.png  # 180x180
```

---

## 2. Design Tokens – `app/globals.css`
כל הערכים מ-DESIGN.md (סעיף 2), כ-CSS Variables תחת `:root`. כל הרכיבים משתמשים רק במשתנים האלה.

```css
:root {
  /* Colors */
  --color-primary: #FFB703;
  --color-accent: #FB8500;
  --color-sky: #8ECAE6;
  --color-blue: #219EBC;
  --color-green: #2A9D8F;
  --color-bg: #FFF8E7;          /* main background / cards */
  --color-bg-secondary: #F1E8D9; /* inputs / secondary background */
  --color-text-secondary: #8D6E63; /* secondary text / borders */
  --color-text: #264653;
  --color-error: #E5484D;

  /* Typography */
  --font-family: var(--font-heebo), sans-serif;
  --font-size-title: 28px;   /* Bold */
  --font-size-heading: 20px; /* Bold – subtitle/card title/primary button */
  --font-size-body: 16px;    /* Regular */
  --font-size-small: 14px;   /* Regular – helper/counter/icon labels */
  --font-weight-regular: 400;
  --font-weight-bold: 700;

  /* Spacing */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 32px;

  /* Radius, shadow, sizes */
  --radius-sm: 12px;   /* inputs */
  --radius-md: 16px;   /* buttons, cards */
  --shadow-soft: 0 2px 8px rgba(38, 70, 83, 0.08);
  --tap-min-height: 48px;
  --content-max-width: 480px;
}
```
- ערכי radius/shadow אינם מוגדרים במספרים ב-DESIGN.md ("מעוגלות באופן בולט", "Shadow עדין מאוד") — נבחרים ערכים סבירים לפי ה-Style Guide ומרוכזים כאן, כך שקל לשנות.
- Reset בסיסי: `box-sizing: border-box`, `margin: 0`, `body` עם `background: var(--color-bg)`, `color: var(--color-text)`, `font-family`, `font-size: var(--font-size-body)`.
- `font-family` גם ל-`input` ו-`button` (`font: inherit`).

---

## 3. Layout ו-Metadata – `app/layout.tsx`
- `<html lang="he" dir="rtl">`.
- גופן: `Heebo` מ-`next/font/google` עם `subsets: ["hebrew", "latin"]`, משקלים 400 ו-700, `variable: "--font-heebo"`, `display: "swap"`. הגופן מוגש מהשרת שלנו (Next.js מוריד אותו בזמן build).
- `metadata`:
  - `title: "מחולל בדיחות AI"`, `description: "הכנס נושא וקבל בדיחה מצחיקה"`.
  - `applicationName: "מחולל בדיחות"`.
  - `appleWebApp: { capable: true, title: "מחולל בדיחות", statusBarStyle: "default" }`.
  - `icons: { icon: [192, 512], apple: "/icons/apple-touch-icon.png" }`.
  - ה-manifest מקושר אוטומטית מ-`app/manifest.ts`.
- `viewport`: `width: "device-width"`, `initialScale: 1`, `themeColor: "#FFF8E7"`.
- רינדור `<ServiceWorkerRegister />` בתוך ה-body.

---

## 4. PWA

### Manifest – `app/manifest.ts`
```ts
{
  name: "מחולל בדיחות AI",
  short_name: "מחולל בדיחות",
  description: "הכנס נושא וקבל בדיחה מצחיקה",
  lang: "he",
  dir: "rtl",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#FFF8E7",
  theme_color: "#FFF8E7",
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
}
```
- `theme_color` ו-`background_color` = צבע הרקע הראשי (קרם), כדי שסרגל המערכת ומסך הפתיחה ישתלבו ברקע המסך. ניתן לשנות בהמשך במקום אחד.

### אייקונים זמניים – `public/icons/`
- לפי ARCHITECTURE 2.6: רקע בצבע ה-Primary (`#FFB703`) עם סמל פשוט במרכז בצבע ה-Main Text (`#264653`) — האות **"ב"** (בדיחה).
- נוצרים **פעם אחת** בעזרת סקריפט PowerShell קטן (System.Drawing, מובנה ב-Windows, בלי להתקין כלום). הסקריפט נשמר בתיקיית ה-scratchpad ולא בפרויקט — לפרויקט נכנסים רק קובצי ה-PNG.
- גדלים: 192×192, 512×512, maskable 512×512 (הסמל מוקטן לאזור הבטוח — כ-60% מהמרכז, הרקע מלא עד הקצוות), apple-touch-icon 180×180 (רקע מלא, ללא שקיפות).
- יוחלפו באייקון הסופי של בעל הפרויקט ב-Milestone 4.

### Service Worker – `public/sw.js`
```js
// Minimal service worker: no caching. Every request goes straight to the network.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
```

### רישום – `components/ServiceWorkerRegister.tsx`
- Client component (`"use client"`) עם `useEffect` שקורא ל-`navigator.serviceWorker.register("/sw.js")` אם `"serviceWorker" in navigator`. מחזיר `null`.
- שגיאת רישום נבלעת בשקט (לא משפיעה על המסך).

---

## 5. המסך הראשי

### `app/page.tsx` + `app/page.module.css`
- `<main>` שמרכז עמודה: `max-width: var(--content-max-width)`, `margin-inline: auto`, `padding-inline: var(--space-sm)`, `padding-block: var(--space-lg)`, `min-height: 100dvh`.
- ב-Mobile העמודה ברוחב מלא (פחות 16px מכל צד); במחשב — 480px במרכז, והרקע מסביב בצבע הרקע הראשי (מה-`body`).
- מרנדר את `<JokeScreen />`.

### `components/JokeScreen.tsx` (Client component)
State: `topic` (string) בלבד. אין עדיין `joke`/`status` — הם נוספים ב-Milestone 2.

מבנה, מלמעלה למטה (לפי ה-Wireframe ו-DESIGN.md 1):
1. **Header** (`<header>`):
   - `<h1>` „מחולל בדיחות AI“ — Bold 28px.
   - `<p>` „הכנס נושא וקבל בדיחה מצחיקה“ — 20px Bold לפי טבלת הטיפוגרפיה ("כותרת משנית"), בצבע Secondary Text, עם 🐾 לידו.
   - עיצוב שלט העץ — **ב-Milestone 4**, לא עכשיו.
2. **אזור איור** — לא מוצג ב-Milestone הזה (אין עדיין איורים; לפי ARCHITECTURE המסך עובד בלעדיהם).
3. **שדה נושא**:
   - `<label>` מוסתר ויזואלית (לקוראי מסך): „נושא לבדיחה“.
   - `<input type="text">` עם `maxLength={100}`, `placeholder="הכנס נושא (אופציונלי)"`, `dir="rtl"`, `text-align: right`, `enterKeyHint="done"`, `autoComplete="off"`.
   - 🐾 דקורטיבי בתוך השדה (`aria-hidden`), בצד ימין.
   - **מונה תווים** בפינה השמאלית-תחתונה של השדה: `{topic.length}/100`, 14px, צבע Secondary Text, `aria-live="polite"` לא נדרש (רק `aria-describedby` מהשדה). מוצג תמיד, כולל `0/100`.
   - עיצוב: רקע `--color-bg` (קרם), Border `1px solid` בגוון ה-Secondary Text השקוף, `--radius-sm`, Padding נדיב, גובה ≥ 48px. Focus: מסגרת `--color-blue`.
   - `font-size: 16px` לפחות — מונע zoom אוטומטי באייפון בזמן הקלדה.
4. **טקסט עזר** מתחת לשדה: „אם לא יוזן נושא, תיווצר בדיחה כללית“ — 14px, Secondary Text, מיושר לימין. מקושר לשדה ב-`aria-describedby`.
5. **כפתור „צור בדיחה“**:
   - `<button type="button">` עם הטקסט „צור בדיחה“ ו-✨ (`aria-hidden`).
   - **ללא פעולה** ב-Milestone הזה (אין `onClick`), אך נראה פעיל.
   - רוחב מלא, גובה ≥ 48px, רקע `--color-primary` עם גרדיאנט עדין ל-`--color-accent`, טקסט `--color-text` Bold 20px, `--radius-md`, `--shadow-soft`. מצב לחוץ (`:active`) כהה מעט.
6. **כרטיס תוצאה** — לא מרונדר בכלל (אין בדיחה). יתווסף ב-Milestone 2.

- מרווחים: 24px בין קבוצות (Header / שדה+עזר / כפתור), 8px בין השדה לטקסט העזר.
- כל הטקסטים — מהמסמכים בלבד, בדיוק בניסוח שם. אין רכיבים מרשימת „מה מהתמונות לא נכנס למוצר“.

### `components/JokeScreen.module.css`
סגנונות הרכיבים לעיל, אך ורק דרך ה-CSS Variables. שימוש ב-logical properties (`padding-inline-start`, `inset-inline-end` וכו') כדי שה-RTL יהיה נכון באופן טבעי.

---

## 6. עדכון CLAUDE.md
במילוי סעיף **פקודות הרצה** (זו הוראה מפורשת ב-CLAUDE.md, לא שינוי spec):
- **הרצה (dev):** `npm run dev`
- **בדיקות (test):** אין (בדיקה ידנית + `npm run build`).

---

## 7. בדיקות עצמיות בזמן הבנייה
1. `npm install` — ללא שגיאות.
2. `npm run build` — עובר (כולל TypeScript) ללא שגיאות.
3. `npm run dev` והצגה בדפדפן המובנה:
   - Mobile viewport (375×812): המסך מוצג מלא, בלי גלילה אופקית.
   - Desktop: עמודה ~480px במרכז.
   - `html` עם `lang="he"` ו-`dir="rtl"`; טקסטים מיושרים לימין; ה-Placeholder מימין.
   - הקלדת 120 תווים → נעצר ב-100, המונה מציג `100/100`.
   - הגופן המחושב הוא Heebo; הצבעים תואמים לטוקנים.
   - לחיצה על „צור בדיחה“ לא עושה דבר ולא מפילה את הדף.
   - אין כרטיס תוצאה.
   - `/manifest.webmanifest` מחזיר JSON תקין עם השדות לעיל; כל ארבעת האייקונים נטענים (200) ובגודל הנכון.
   - `/sw.js` נטען וה-Service Worker רשום ופעיל (בדיקה דרך `navigator.serviceWorker.getRegistration()`).
   - אין שגיאות ב-Console.
   - חיפוש בקוד: אין `openai`, אין `NEXT_PUBLIC_`, אין `fetch` ל-API, אין Database/Auth.
4. בסיום — סגירת שרת ה-dev, סימון 🟡 ליד Milestone 1 ב-MILESTONES.md. ללא commit.

---

## 8. חיבור ל-Vercel (אחרי האישור והדחיפה)
Vercel מייבא קוד מ-GitHub, ולכן החיבור אפשרי רק אחרי שהקוד נדחף ל-`https://github.com/dftgo/Joklik`. הסדר:
1. בנייה + בדיקה מקומית שלך (🟡).
2. כשתבקש „דחוף שינויים לגיטהאב“: commit + חיבור ה-remote + push ל-`main`.
3. מיד אחרי ה-push — הדרכה צעד אחר צעד, בשפה פשוטה, שאתה מבצע בעצמך:
   1. כניסה ל-https://vercel.com עם חשבון GitHub (Sign up / Log in with GitHub), תוכנית Hobby.
   2. **Add New… → Project**, ובחירת ה-Repository `Joklik` (אם לא מופיע — מתן הרשאה ל-Vercel לגשת אליו דרך GitHub).
   3. וידוא ש-Framework Preset מזוהה כ-**Next.js**, בלי לשנות הגדרות Build. אין Environment Variables בשלב הזה.
   4. **Deploy**, והמתנה לסיום.
   5. פתיחת כתובת ה-Production (`https://….vercel.app`) בטלפון ובדיקה שהמסך מוצג, ושבתפריט הדפדפן מופיעה אפשרות התקנה / „הוסף למסך הבית“.
4. אין שום פעולת deploy או publish מצדי — רק ההדרכה.

---

## Definition of Done – איך כל תנאי ייבדק
| תנאי | בדיקה |
|---|---|
| האפליקציה עולה ללא שגיאות | `npm run build` עובר; `npm run dev` נטען בלי שגיאות ב-Console |
| המסך הראשי מוצג ב-Mobile viewport | בדפדפן המובנה ב-375×812 |
| כל הטקסטים בעברית ב-RTL תקין | `lang="he"`, `dir="rtl"`, יישור לימין, בדיקה ויזואלית |
| שדה, מונה, טקסט עזר וכפתור לפי ה-Design | השוואה ל-Wireframe ול-DESIGN.md סעיף 1 |
| לא ניתן להקליד יותר מ-100 תווים | הקלדת 120 תווים → 100, מונה `100/100` |
| צבעים וגופן לפי ה-Style Guide | טוקנים זהים לטבלת DESIGN.md; גופן מחושב Heebo |
| manifest ואייקונים תקינים ל-PWA | `/manifest.webmanifest` תקין, 4 אייקונים נטענים, SW רשום |
| במחשב — עמודה צרה במרכז | חלון רחב → עמודה ~480px ממורכזת |
| פרויקט Vercel מחובר ל-Repository | אחרי הדחיפה, בהדרכה (סעיף 8) |
| אין DB / Auth / API Key / OpenAI | חיפוש בקוד + אין `.env` ואין תלות `openai` |

## מחוץ ל-Milestone הזה
API, OpenAI, `.env`, מצבי טעינה/תוצאה/שגיאה, העתקה ושיתוף, איורים, שלט העץ ועיצוב סופי — במילסטונים 2–4.
