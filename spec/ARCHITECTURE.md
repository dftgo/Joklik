# ARCHITECTURE – אפליקציית בדיחות מבוססת AI

## מטרת המסמך
מסמך זה מתאר את ה-Technology Stack ואת הארכיטקטורה הטכנית למימוש האפליקציה שהוגדרה ב-PRD: אפליקציית Web המיועדת ל-Mobile בלבד, מותקנת כ-PWA, עם ממשק בעברית ו-RTL, המייצרת בדיחות באמצעות GPT-5 דרך Backend בלבד, ללא Database, ללא Authentication וללא שמירת היסטוריה.

---

## 1. Technology Stack שנבחר

| רכיב | טכנולוגיה | תפקיד |
|---|---|---|
| Frontend | Next.js + React + TypeScript | בניית ממשק המשתמש, ניהול state מקומי ו-PWA |
| Styling | CSS Modules או CSS רגיל בתוך פרויקט Next.js | עיצוב Mobile-first ו-RTL ללא תלות בספריית UI חיצונית |
| Backend | Next.js Route Handler | Endpoint שרת מאובטח המקבל נושא, פונה ל-OpenAI ומחזיר בדיחה |
| AI API | OpenAI Responses API | יצירת הבדיחה בצד השרת |
| AI Model | `gpt-5` | המודל שנדרש ב-PRD; מזהה המודל יוגדר כ-Environment Variable כדי לאפשר החלפה ללא שינוי קוד |
| PWA | Web App Manifest + Service Worker | התקנה למסך הבית והתנהגות דמוית אפליקציה |
| Share | Web Share API | שיתוף הבדיחה דרך מנגנון השיתוף של המכשיר, כאשר נתמך |
| Copy | Clipboard API | העתקת טקסט הבדיחה ללוח |
| Source Control | Git + GitHub | ניהול קוד המקור והיסטוריית שינויים |
| Hosting / Deployment | Vercel | Hosting ל-Frontend ול-Backend עם חיבור ישיר ל-GitHub ו-Deployment אוטומטי |
| Secrets | Vercel Environment Variables מסוג Secret | שמירת `OPENAI_API_KEY` בצד השרת בלבד |
| Database | אין | אין צורך בשמירת נתונים לפי ה-PRD |
| Authentication | אין | השימוש אנונימי וללא חשבון |

### נימוק לבחירת ה-Stack

נבחרה ארכיטקטורה של **Next.js Full-stack על Vercel** משום שהיא מאפשרת לממש את ה-Frontend ואת שכבת ה-Backend באותו Repository ובאותו Deployment, ללא צורך בשרת Backend נפרד. Next.js מספק Route Handlers עבור HTTP endpoints בצד השרת, ומתאים באופן טבעי ל-Backend-for-Frontend פשוט כמו זה שנדרש כאן.

הבחירה מפחיתה מורכבות תפעולית: אין Database, אין Authentication, אין שירות אחסון ואין צורך לנהל שני פרויקטים נפרדים של Frontend ו-Backend. הקוד נשמר ב-GitHub ו-Vercel מבצע Preview Deployments לענפים ו-Production Deployment מהענף הראשי.

Next.js כולל תמיכה מובנית ב-Web App Manifest ומדריך רשמי ליצירת PWA. עבור המוצר הזה אין צורך ב-PWA framework כבד: נדרש Manifest, אייקונים ו-Service Worker בסיסי לצורך app shell/installability. יצירת בדיחות עצמה אינה Offline ודורשת רשת.

OpenAI ממליצה כיום על **Responses API** עבור פרויקטים חדשים. ה-API Key נשמר בשרת בלבד ולא נשלח לעולם לדפדפן.

### חלופות שנבחנו בקצרה

- **React/Vite + Express/Fastify** – אפשרי, אך מחייב שני רכיבי Deployment או שרת Backend נוסף ולכן מוסיף מורכבות ללא יתרון למוצר קטן זה.
- **React/Vite + Serverless Function נפרדת** – פשוט יחסית, אך Next.js מספק את אותה יכולת בתוך פרויקט אחד עם conventions ותיעוד רחבים יותר.
- **Cloudflare Workers/Pages** – פתרון יעיל, אך אינו נדרש כאן; Vercel + Next.js הוא מסלול ישיר ופשוט יותר בהתאם להעדפות הפרויקט ולצורך ב-GitHub deployment אוטומטי.

### עלויות ותפעול

- **Vercel:** ניתן להתחיל ב-Hobby עבור פיתוח/פרויקט אישי. לפי התיעוד הנוכחי, Hobby מיועד לשימוש אישי ולא מסחרי. עבור שימוש מסחרי יש לבחור תוכנית מתאימה; Vercel מציגה כיום Pro החל מ-$20 לחודש לפני מסים, עם usage credit כלול.
- **OpenAI API:** החיוב הוא לפי שימוש במודל ובמספר ה-tokens. מאחר שכל בקשה היא קצרה והפלט מוגבל לעד 10 שורות, העלות לכל בקשה צפויה להיות קטנה יחסית, אך היא תלויה בתמחור המודל בפועל ובנפח השימוש.
- אין עלויות Database, Authentication או File Storage משום שרכיבים אלה אינם קיימים בארכיטקטורה.

### סיכון מרכזי: GPT-5

נכון ל-22 באוקטובר 2026, OpenAI עדיין מאפשרת שימוש ב-`gpt-5`, אך מסמנת אותו כ-Deprecated עם מועד shutdown מתוכנן ל-11 בדצמבר 2026. מאחר שה-PRD דורש GPT-5, המימוש יתחיל עם `gpt-5`, אך **שם המודל לא יהיה hard-coded**. הוא יישמר ב-Environment Variable בשם `OPENAI_MODEL`, כך שהחלפה למודל נתמך חדש תדרוש שינוי Configuration בלבד.

---

## 2. ארכיטקטורת המערכת

### 2.1 מבנה כללי

המערכת מורכבת משלושה רכיבים לוגיים בלבד:

1. **Mobile Web/PWA Client** – מציג את ממשק המשתמש, מקבל נושא, מציג loading, בדיחה או שגיאה, ומפעיל Copy/Share.
2. **Backend API בתוך Next.js** – מקבל בקשת יצירת בדיחה, מבצע validation, בונה prompt, שולח בקשה ל-OpenAI ומחזיר תוצאה נקייה ל-Frontend.
3. **OpenAI API** – מפיק את הבדיחה באמצעות GPT-5.

זרימת התקשורת:

`Mobile Browser / PWA → POST /api/joke → Next.js Backend → OpenAI Responses API → Backend → Frontend`

אין תקשורת ישירה בין הדפדפן ל-OpenAI.

---

### 2.2 Frontend

ה-Frontend ייבנה ב-Next.js/React ויותאם ל-Mobile בלבד.

#### אחריות ה-Frontend

- הצגת תיבת קלט לנושא.
- שליחת בקשה ל-`POST /api/joke`.
- אם השדה ריק, שליחת topic ריק/מושמט; ה-Backend יתייחס לכך כבקשה לבדיחה כללית.
- הצגת מצב loading, לדוגמה: **„מכין לך בדיחה...“**.
- מניעת לחיצות כפולות בזמן שהבקשה פעילה.
- הצגת הבדיחה שהתקבלה באותו מסך.
- הצגת הודעת שגיאה: **„משהו השתבש, נסה שוב“** וכפתור לניסיון חוזר.
- העתקת הבדיחה באמצעות Clipboard API.
- שיתוף הבדיחה באמצעות Web Share API כאשר קיים support במכשיר.
- שמירת state בזיכרון של הדפדפן בלבד; Refresh מאפס את התוכן.

#### State נדרש

State מקומי בלבד, לדוגמה:

- `topic`
- `joke`
- `status`: `idle | loading | success | error`
- `lastRequestTopic` לצורך Retry מקומי בלבד

אין צורך ב-Redux, Zustand או state management חיצוני.

#### RTL ושפה

- `lang="he"`
- `dir="rtl"`
- כל טקסטי ה-UI בעברית.
- העיצוב יהיה Mobile-first.

---

### 2.3 Backend

ה-Backend ימומש באמצעות **Next.js Route Handler** תחת endpoint יחיד:

`POST /api/joke`

Route Handler הוא endpoint ציבורי ולכן כל validation, secret handling וקריאה ל-OpenAI חייבים להתבצע בו ולא ב-Client Component.

#### Request

```json
{
  "topic": "חתולים"
}
```

`topic` אופציונלי. ערך ריק אינו שגיאה.

#### Response בהצלחה

```json
{
  "joke": "..."
}
```

#### Response בשגיאה

```json
{
  "error": "JOKE_GENERATION_FAILED"
}
```

ה-Frontend לא יקבל פרטי שגיאה פנימיים, stack traces או מידע מ-OpenAI.

#### Validation

ה-Backend יוודא ש:

- גוף הבקשה הוא JSON תקין.
- `topic`, אם קיים, הוא string.
- יוגדר גבול אורך סביר ל-topic כדי למנוע payload חריג ושימוש מיותר ב-tokens. גבול זה הוא הגנת מערכת ולא שינוי בהתנהגות המוצר.
- בקשה לא תקינה תחזיר HTTP 400.
- שגיאה בשירות OpenAI תחזיר HTTP 502/500 בהתאם לסוג הכשל, עם payload אחיד ל-Frontend.

---

### 2.4 אינטגרציה עם OpenAI

#### API

יש להשתמש ב-**OpenAI Responses API** באמצעות ה-SDK הרשמי ל-JavaScript/TypeScript.

#### Configuration

Environment Variables בצד השרת:

- `OPENAI_API_KEY` – Secret; חובה.
- `OPENAI_MODEL` – ערך ברירת מחדל `gpt-5` בהתאם ל-PRD.

אין להשתמש בקידומת `NEXT_PUBLIC_` עבור `OPENAI_API_KEY`, משום שמשתנים כאלה נחשפים ל-JavaScript של הדפדפן.

#### Prompting

ה-Backend יבנה הוראות קבועות שמגדירות:

- להחזיר בדיחה בלבד, ללא הקדמות מיותרות.
- אם קיים topic – ליצור בדיחה הקשורה אליו.
- אם topic ריק – ליצור בדיחה כללית.
- תשובה בעברית.
- עד 10 שורות.

ה-topic שהמשתמש הזין יישלח כ-user input נפרד מההוראות הקבועות, כדי לשמור על הפרדה ברורה בין System/Developer Instructions לבין קלט המשתמש.

#### שמירת מידע

האפליקציה עצמה אינה שומרת prompts או responses ב-Database או ב-storage מקומי. יש להימנע גם מכתיבת תוכן הבדיחות ל-application logs. Logging, אם נדרש, יהיה מוגבל למידע תפעולי כגון status code, latency ו-request ID ללא תוכן המשתמש.

---

### 2.5 Data Model

אין Data Model מתמשך משום שאין Database.

המידע היחיד קיים במהלך request או בזיכרון ה-Frontend:

```text
JokeRequest
- topic?: string

JokeResponse
- joke: string
```

המידע אינו נשמר לאחר Refresh/סגירת האפליקציה.

---

### 2.6 PWA

האפליקציה תוגדר כ-PWA באמצעות:

- Web App Manifest (`app/manifest.ts` או `manifest.webmanifest`).
- `name`, `short_name`, `start_url`, `display: standalone`, `theme_color`, `background_color`.
- אייקונים מתאימים, לרבות 192×192 ו-512×512.
- Service Worker בסיסי.
- HTTPS ב-Production, המסופק על ידי Vercel.

#### Offline behavior

אין דרישה ליצור בדיחות Offline ולכן אין לשמור או cache responses של OpenAI לצורך שימוש Offline.

Service Worker יכול לבצע cache של ה-app shell ונכסים סטטיים בלבד, כך שהאפליקציה יכולה להיפתח באופן בסיסי גם כאשר אין חיבור. ניסיון ליצור בדיחה ללא רשת ייכשל ויוצג דרך מנגנון השגיאות הרגיל.

---

### 2.7 Copy ו-Share

#### Copy

Clipboard API ישמש להעתקת תוכן הבדיחה.

אם ההעתקה נכשלת, אין צורך בשירות Backend; ה-Frontend יטפל בכשל מקומי.

#### Share

Web Share API ישמש כאשר `navigator.share` נתמך.

במכשיר שבו Web Share API אינו זמין, ניתן להשאיר את פעולת Copy זמינה. אין צורך להוסיף שירות צד שלישי לצורך שיתוף.

---

### 2.8 אבטחה ופרטיות

#### API Key

- `OPENAI_API_KEY` קיים רק בשרת.
- ב-Vercel הוא יוגדר כ-Environment Variable מסוג **Secret**.
- הוא לא יופיע ב-GitHub, בקוד המקור, ב-client bundle או במשתנה שמתחיל ב-`NEXT_PUBLIC_`.
- בפיתוח מקומי הוא יישמר ב-`.env.local`, וקובץ זה יהיה ב-`.gitignore`.

#### Endpoint abuse

מכיוון שאין Authentication, `POST /api/joke` הוא endpoint ציבורי. יש להוסיף הגנות בסיסיות המתאימות למוצר ציבורי:

- validation של input.
- הגבלת גודל body.
- handling של request timeout.
- החזרת הודעות שגיאה כלליות בלבד.

אם שימוש לרעה או עלויות API הופכים לבעיה בפועל, ניתן להוסיף Rate Limiting בתשתית/Hosting בהמשך. אין צורך להוסיף Database או מערכת משתמשים לצורך הגרסה הנוכחית.

#### תוכן

המוצר אינו מוסיף שכבת סינון ייעודית מעבר למדיניות ולמגבלות של שירות OpenAI. אם השירות מסרב לייצר תוכן, ה-Backend לא ינסה לעקוף את הסירוב.

---

### 2.9 Error Handling

#### Frontend

כל כשל משמעותי בתהליך יצירת הבדיחה מוצג למשתמש באופן אחיד:

**„משהו השתבש, נסה שוב“**

וכפתור Retry.

#### Backend

ה-Backend יבדיל לוגית בין:

- קלט לא תקין – 400.
- כשל ב-OpenAI או timeout – 502/500.
- כשל פנימי לא צפוי – 500.

ה-Frontend אינו צריך להציג את סוג השגיאה הטכני למשתמש.

---

## 3. GitHub, Hosting ו-Deployment

### GitHub

- Repository יחיד ב-GitHub.
- ענף `main` משמש Production branch.
- שינויי פיתוח נעשים בענפים נפרדים או Pull Requests.
- אין לשמור secrets ב-Repository.

### Vercel

ה-Repository יחובר ישירות ל-Vercel.

התהליך:

1. Push לענף שאינו `main` → Vercel יוצר Preview Deployment.
2. ניתן לבדוק את ה-UI, ה-PWA ואת הקריאה ל-Backend ב-Preview URL.
3. Merge ל-`main` → Vercel יוצר Production Deployment אוטומטי.
4. Rollback ניתן לבצע באמצעות deployment קודם או revert ב-Git.

### Environment Variables לפי סביבה

#### Local Development

בקובץ `.env.local` שאינו נכנס ל-Git:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5
```

#### Vercel Preview

- `OPENAI_API_KEY` כ-Secret עבור Preview.
- `OPENAI_MODEL=gpt-5`.

#### Vercel Production

- `OPENAI_API_KEY` כ-Secret עבור Production.
- `OPENAI_MODEL=gpt-5`.

מומלץ להשתמש ב-OpenAI Project/API Key מתאים ליישום ולא במפתח אישי שמשמש למטרות אחרות.

---

## 4. Build ו-Deployment

Build סטנדרטי של Next.js יתבצע אוטומטית ב-Vercel לאחר Push.

בדיקות בסיסיות לפני Production צריכות לוודא:

- TypeScript build עובר.
- האפליקציה נטענת במובייל.
- RTL ועברית מוצגים נכון.
- Manifest תקין וה-PWA ניתנת להתקנה במכשיר נתמך.
- `POST /api/joke` עובד.
- GPT-5 נקרא רק מהשרת.
- API Key אינו מופיע ב-client bundle או ב-network requests מהדפדפן ל-OpenAI.
- topic ריק מחזיר בדיחה כללית.
- topic קיים מחזיר בדיחה בנושא.
- הפלט מוגבל לעד 10 שורות לפי הוראות המודל וה-Backend.
- Copy עובד.
- Share עובד במכשיר שתומך ב-Web Share API.
- שגיאת OpenAI/Network מציגה את הודעת השגיאה ו-Retry.

---

## 5. החלטות ארכיטקטוניות מרכזיות

1. **Repository ו-Deployment יחידים** – Next.js ו-Vercel משמשים גם Frontend וגם Backend.
2. **אין Database** – אין צורך ב-Supabase, Firebase או פתרון אחסון אחר.
3. **אין Authentication** – כל השימוש אנונימי.
4. **אין persistence** – הבדיחה נשמרת רק ב-state המקומי בזמן השימוש.
5. **OpenAI server-side only** – ה-API Key אינו מגיע לדפדפן.
6. **Responses API** – הבחירה המומלצת על ידי OpenAI לפרויקטים חדשים.
7. **Model via configuration** – הדרישה הנוכחית היא `gpt-5`, אך שם המודל ניתן להחלפה באמצעות `OPENAI_MODEL` עקב deprecation מתוכנן.
8. **PWA פשוטה** – Manifest + Service Worker, ללא Offline AI וללא cache של בדיחות.
9. **Web APIs מובנים** – Clipboard ו-Web Share במקום ספריות או שירותים חיצוניים.
10. **מינימום רכיבים** – אין הוספת שירותים שאינם נדרשים ל-PRD.

---

## 6. מקורות מרכזיים למחקר

- OpenAI API Overview – Responses API, Authentication ודרישת שמירת API keys בצד השרת: https://developers.openai.com/api/reference/overview
- OpenAI Responses API – יצירת Responses ומודלים נתמכים: https://developers.openai.com/api/reference/resources/responses/methods/create
- OpenAI – Migration to Responses API; Responses מומלץ לפרויקטים חדשים: https://developers.openai.com/api/docs/guides/migrate-to-responses
- OpenAI Models / Pricing: https://developers.openai.com/api/docs/models ו-https://developers.openai.com/api/docs/pricing
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Next.js Backend for Frontend: https://nextjs.org/docs/app/guides/backend-for-frontend
- Next.js PWA Guide: https://nextjs.org/docs/app/guides/progressive-web-apps
- Next.js Manifest: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
- Vercel Git Deployments: https://vercel.com/docs/git
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Vercel Pricing: https://vercel.com/pricing

---

## 7. סיכום

הארכיטקטורה המומלצת היא **Next.js + TypeScript על Vercel**, עם Route Handler יחיד המשמש Backend מאובטח ל-OpenAI Responses API. אין Database, אין Authentication ואין שירותי Cloud נוספים. המערכת נשארת קטנה, פשוטה וניתנת לתחזוקה, תוך שמירה מלאה של ה-API Key בצד השרת ומתן PWA מותאמת Mobile בעברית.
