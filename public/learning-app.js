(function () {
  "use strict";
  const C = LearningCore,
    V = LearningVisuals,
    A = LearningAudio,
    S = new LearningService(),
    app = document.getElementById("app");
  const read = (key, fallback) => {
      try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
      } catch {
        return fallback;
      }
    },
    save = (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    };
  let lang = read("vizy_language", "he"),
    progress = read("vizy_mastery", { xp: 0, mastered: [] }),
    profile = read("vizy_profile", { nickname: "", avatar: "orbit", grade: 9 }),
    bank = [],
    grade = "all",
    topic = "all",
    search = "",
    current = null,
    stage = 0,
    choice = null,
    firstAnswer = null,
    earned = false,
    cohort = read("vizy_cohort", null),
    pollTimer = null,
    plan = "free",
    serverXP = null,
    openSequence = 0;
  const dict = {
    he: {
      home: "אתגרים",
      race: "המסלול שלי",
      requests: "בקשת שאלה",
      plans: "מסלולים",
      account: "החשבון שלי",
      title: "רואים. מבינים. מצליחים.",
      subtitle:
        "שלוש דקות, רעיון אחד. מזיזים, מגלים — ואז יודעים לדמיין גם בלי הציור.",
      kicker: "מתמטיקה שרואים בראש · ט׳–י״א",
      continue: "מתחילים באתגר",
      bank: "בוחרים את הרעיון הבא",
      count: "אתגרים",
      all: "הכול",
      search: "מה רוצים להבין?",
      open: "מתחילים",
      locked: "פרימיום",
      mastered: "כבר הבנתי",
      free: "חינם",
      grade: "כיתה",
      minutes: "דקות",
      journey: "כל רעיון הוא עוד צעד למעלה",
      journeyCopy: "משלימים אתגר ומתקדמים במסלול שלכם.",
      journeyBtn: "למסלול",
      prediction: "קודם מדמיינים",
      predictIntro:
        "לפני שמזיזים משהו, נסו לצפות מה יקרה. גם ניחוש הוא התחלה טובה.",
      checkPicture: "נבדוק בציור",
      explore: "מגלים בציור",
      question: "השאלה שלכם",
      check: "בדיקת תשובה",
      hint: "רמז קטן",
      restore: "חזרה לנתוני השאלה",
      transfer: "מוכנים לדמיין לבד",
      transferTitle: "אותו רעיון. בלי הציור.",
      transferCopy: "הנתונים השתנו. בנו את התמונה בראש ורק אז חשבו.",
      reveal: "אפשר לראות ציור",
      transferCheck: "בדיקת האתגר החדש",
      correct: "נכון! עכשיו נסו להעביר את הרעיון לשאלה אחרת.",
      wrong: "עוד לא. חזרו לנתונים ולרמז, ואז נסו שוב.",
      explanation: "למה זה עובד?",
      masteryTitle: "הרעיון הזה כבר שלכם",
      masteryCopy: "הבנתם את הציור וגם השתמשתם ברעיון בשאלה חדשה.",
      next: "לרעיון הבא",
      points: "נקודות הבנה",
      practice: "תרגול נוסף",
      bonus: "ראשונים בפסגה! בונוס 20 נקודות אומת בשרת.",
      answer: "התשובה שלכם",
      back: "חזרה",
      predYes: "הכיוון מתאים. עכשיו נבדוק אותו בציור.",
      predNo: "נבדוק יחד בציור ונראה מה משתנה.",
      requestTitle: "שאלה שחסרה לכם?",
      requestIntro:
        "כתבו או צרפו תמונה. חגי יבדוק ויכין המחשה — המענה נבנה על ידי אדם.",
      text: "נוסח השאלה",
      source: "קישור למקור (אפשר להשאיר ריק)",
      image: "תמונה (עד 5MB)",
      draft: "שמירת טיוטה",
      send: "שליחת בקשה לחגי",
      notSent: "הטיוטה נשמרה במכשיר. לא נשלחה לחגי.",
      received: "הבקשה התקבלה. יעד המענה הוא 24 שעות; אפשר לעקוב כאן.",
      requestGoal: "יעד המענה לבקשה שהתקבלה: 24 שעות. עד אז אפשר ללמוד מהבנק.",
      myRequests: "הבקשות שלי",
      loginNeeded:
        "כדי לשלוח בקשה או להצטרף לקבוצה, התחברו. האתגרים החינמיים פתוחים גם בלי חשבון.",
      login: "כניסה לחשבון",
      logout: "יציאה מהחשבון",
      email: "כתובת אימייל",
      magic: "שלחו לי קישור כניסה",
      emailSent: "הקישור נשלח. פתחו אותו באותו מכשיר.",
      nickname: "כינוי לתחרות",
      profile: "האווטאר שלכם",
      saveProfile: "שמירת כינוי ואווטאר",
      saved: "נשמר",
      raceTitle: "עוד רעיון. עוד צעד.",
      raceIntro:
        "מתקדמים בהבנה, מטפסים במסלול ואוספים פרח בפסגה. רק כינויים ואווטארים נראים לאחרים.",
      solo: "מצאו לי קבוצה דומה",
      class: "יש לי קוד כיתה",
      join: "הצטרפות לכיתה",
      code: "קוד כיתה",
      raceWaiting:
        "עדיין אין קבוצה מחוברת. לומדים ומתקדמים במסלול האישי בינתיים.",
      raceReal:
        "משתתפים אמיתיים בלבד. אם הקבוצה קטנה, מצטרפים נוספים יכולים להגיע בהמשך.",
      soloHint: "עד עשרה לומדים נוספים מאותה שכבת גיל ובטווח שליטה דומה.",
      me: "אני",
      goal: "הפסגה",
      planTitle: "הדרך שמתאימה לכם",
      planIntro: "לומדים חינם. מרחיבים את בנק ההמחשות או לומדים יחד בכיתה.",
      freeTitle: "מתחילים לראות",
      premiumTitle: "בונים הבנה",
      classTitle: "לומדים יחד",
      freeItems: [
        "12 אתגרים והמחשות",
        "תרגול והעברה לשאלה חדשה",
        "מסלול אישי וצלילי הצלחה",
      ],
      premiumItems: [
        "בנק מורחב לפי נושא ורמה",
        "מסלולי חקר והתקדמות",
        "מכסת בקשות להמחשות חדשות",
      ],
      classItems: [
        "משימות שהמורה בוחר",
        "תחרות כיתתית עם אווטארים",
        "גישה לכיתה ומעקב התקדמות",
      ],
      planCta: "בדיקת הגישה שלי",
      classCreate: "יצירת כיתה",
      className: "שם הכיתה",
      chooseTasks: "בחירת משימות לכיתה",
      serverPoints: "נקודות שאומתו בשרת, כולל בונוסים",
      groupTasks: "המשימות שמקדמות את הקבוצה",
      purchaseNote:
        "גבייה אינה פעילה במסך זה. רכישת מנוי והקצאת גישה יופעלו אחרי חיבור תשלומים.",
      plansHelp: "יש מנוי פעיל? התחברו כדי לטעון את הגישה שלכם.",
      offline:
        "ללא חיבור אפשר להמשיך באתגרים החינמיים. בקשות וקבוצות זמינות כשיש חיבור.",
      setup: "השירות המשותף עדיין בהכנה. הטיוטה לא נשלחה; אפשר להמשיך ללמוד.",
      session: "הכניסה פגה. התחברו שוב.",
      network: "לא הצלחנו להתחבר. הטיוטה נשארה במכשיר.",
      signIn: "יש להתחבר קודם.",
      noResults: "אין עדיין אתגרים שמתאימים לסינון הזה.",
      exploreNote: "הציור הוא לחקר. השאלה נבדקת לפי הנתונים המקוריים.",
      assignment: "משימת כיתה",
      share: "קישור למשימה",
      copied: "הקישור הועתק",
      help: "רמזים מוכנים, בלי המתנה",
      privacy: "פרטיות",
      workspace: "חקר פונקציות נוסף",
      moderator: "ניהול הבנק",
      emptyRequests: "בקשות שנשלחו יופיעו כאן לאחר כניסה.",
      statusDraft: "בהכנה",
      pending: "ממתינה",
      reviewing: "בטיפול",
      answered: "מענה מוכן",
      rejected: "נדרש עדכון",
      create: "יצירה",
      progressSaved: "ההתקדמות נשמרת במכשיר הזה.",
      raceSaved: "השלמה קבוצתית אומתה בשרת.",
      raceSync: "ההתקדמות המקומית נשמרה. השיתוף לקבוצה לא זמין כרגע.",
    },
    en: {
      home: "Challenges",
      race: "My trail",
      requests: "Request a question",
      plans: "Plans",
      account: "My account",
      title: "See it. Get it. Solve it.",
      subtitle:
        "Three minutes. One idea. Move it, discover it — then picture it without the diagram.",
      kicker: "Math you can picture · Grades 9–11",
      continue: "Start a challenge",
      bank: "Pick your next idea",
      count: "challenges",
      all: "All",
      search: "What do you want to understand?",
      open: "Let’s start",
      locked: "Premium",
      mastered: "Mastered",
      free: "Free",
      grade: "Grade",
      minutes: "min",
      journey: "Every idea takes you a step higher",
      journeyCopy: "Complete a challenge and move along your trail.",
      journeyBtn: "My trail",
      prediction: "Picture it first",
      predictIntro:
        "Before changing anything, predict what will happen. A guess is a useful starting point.",
      checkPicture: "Let’s see it",
      explore: "Explore the picture",
      question: "Your question",
      check: "Check answer",
      hint: "A small hint",
      restore: "Restore question values",
      transfer: "Ready to picture it alone",
      transferTitle: "Same idea. No diagram.",
      transferCopy:
        "The numbers changed. Build a picture in your mind before calculating.",
      reveal: "Show a diagram",
      transferCheck: "Check the new challenge",
      correct: "Correct! Now carry this idea into a different question.",
      wrong: "Not yet. Revisit the values and the hint, then try again.",
      explanation: "Why does it work?",
      masteryTitle: "This idea is yours now",
      masteryCopy:
        "You understood the picture and used the idea in a new question.",
      next: "Next idea",
      points: "understanding points",
      practice: "Practised again",
      bonus:
        "First at the summit! A 20-point bonus was verified by the server.",
      answer: "Your answer",
      back: "Back",
      predYes: "That prediction fits. Now check it in the picture.",
      predNo: "Let’s check together and see what changes.",
      requestTitle: "Missing a question?",
      requestIntro:
        "Type it or attach a picture. Hagai will review it and prepare a visual explanation.",
      text: "Question text",
      source: "Source link (optional)",
      image: "Picture (up to 5MB)",
      draft: "Save a draft",
      send: "Send request to Hagai",
      notSent: "Draft saved on this device. It has not been sent to Hagai.",
      received:
        "Request received. The response target is 24 hours; check its status here.",
      requestGoal:
        "For a received request, the response target is 24 hours. Keep learning from the bank meanwhile.",
      myRequests: "My requests",
      loginNeeded:
        "Sign in to send a request or join a group. Free challenges work without an account.",
      login: "Sign in",
      logout: "Sign out",
      email: "Email address",
      magic: "Send me a sign-in link",
      emailSent: "Link sent. Open it on the same device.",
      nickname: "Race nickname",
      profile: "Your avatar",
      saveProfile: "Save nickname & avatar",
      saved: "Saved",
      raceTitle: "One more idea. One more step.",
      raceIntro:
        "Climb by understanding, move along the trail and collect a flower at the summit. Peers see only nicknames and avatars.",
      solo: "Find a similar group",
      class: "I have a class code",
      join: "Join a class",
      code: "Class code",
      raceWaiting:
        "No group connected yet. Keep learning on your personal trail meanwhile.",
      raceReal:
        "Real learners only. More learners may join a small group later.",
      soloHint:
        "Up to ten other learners in the same grade and a similar mastery band.",
      me: "Me",
      goal: "Summit",
      planTitle: "Your way to learn",
      planIntro:
        "Learn for free. Unlock more visual activities or learn together in class.",
      freeTitle: "Start seeing",
      premiumTitle: "Build understanding",
      classTitle: "Learn together",
      freeItems: [
        "12 visual challenges",
        "Practice and transfer to a new question",
        "Personal trail and success sounds",
      ],
      premiumItems: [
        "More activities by topic and level",
        "Exploration paths and progress",
        "A quota for new visual requests",
      ],
      classItems: [
        "Teacher-selected assignments",
        "Avatar races with classmates",
        "Class access and progress tracking",
      ],
      planCta: "Check my access",
      classCreate: "Create a class",
      className: "Class name",
      chooseTasks: "Choose class assignments",
      serverPoints: "Server verified points, including bonuses",
      groupTasks: "Your group assignments",
      purchaseNote:
        "This screen does not charge you. Subscription checkout and access grants need payment setup.",
      plansHelp: "Already have an active plan? Sign in to load your access.",
      offline:
        "Offline? Keep using free challenges. Requests and groups need a connection.",
      setup:
        "The shared service is still being prepared. Your draft has not been sent. Keep learning meanwhile.",
      session: "Your sign-in expired. Please sign in again.",
      network: "Connection failed. Your draft remains on this device.",
      signIn: "Please sign in first.",
      noResults: "No challenges match these filters yet.",
      exploreNote:
        "The picture is for exploration. Answers use the original question values.",
      assignment: "Class assignment",
      share: "Assignment link",
      copied: "Link copied",
      help: "Prepared hints, without waiting",
      privacy: "Privacy",
      workspace: "More function exploration",
      moderator: "Manage the bank",
      emptyRequests: "Your submitted requests appear here after sign-in.",
      statusDraft: "Being prepared",
      pending: "Waiting",
      reviewing: "In review",
      answered: "Answer ready",
      rejected: "Needs an update",
      create: "Create",
      progressSaved: "Progress is saved on this device.",
      raceSaved: "Group completion verified by the server.",
      raceSync:
        "Local progress was saved. Group sync is unavailable right now.",
    },
  };
  function t(key) {
    return dict[lang][key] ?? key;
  }
  function esc(s) {
    return String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  function localized(a) {
    return lang === "en"
      ? { ...a, ...a.en, prediction: a.en?.prediction || a.prediction }
      : a;
  }
  function stem(a, p) {
    return localized(a)
      .stem.replace(/\{(\w+)\}/g, (_, key) => String(p[key]))
      .replace(/\+ -/g, "− ")
      .replace(/− -/g, "+ ");
  }
  function visibleStem(a, p) {
    const text = stem(a, p);
    if (lang === "en") return esc(text);
    const pattern = /[A-Za-z][A-Za-z0-9 =+−\-²().,/]*[A-Za-z0-9²)]/g;
    let out = "",
      pos = 0;
    for (const match of text.matchAll(pattern)) {
      out +=
        esc(text.slice(pos, match.index)) +
        '<bdi dir="ltr">' +
        esc(match[0]) +
        "</bdi>";
      pos = match.index + match[0].length;
    }
    return out + esc(text.slice(pos));
  }
  function notify(msg) {
    const n = document.getElementById("notice");
    n.textContent = msg;
    n.classList.add("visible");
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => n.classList.remove("visible"), 4000);
  }
  function errorText(e) {
    if (/backend_setup_required/.test(e.message)) return t("setup");
    if (/session_expired/.test(e.message)) return t("session");
    if (/sign_in_required/.test(e.message)) return t("signIn");
    if (/request_quota/.test(e.message))
      return lang === "he"
        ? "מכסת הבקשות לתקופה זו הסתיימה."
        : "Your request quota for this period is used.";
    if (/class_access/.test(e.message))
      return lang === "he"
        ? "יצירת כיתה זמינה לבעל גישה כיתתית פעילה."
        : "Creating a class requires an active class plan.";
    if (/invalid_class/.test(e.message))
      return lang === "he"
        ? "קוד הכיתה אינו תקין."
        : "This class code is not valid.";
    return t("network");
  }
  function footer() {
    return `<footer><span>${esc(t("progressSaved"))}</span><a href="privacy.html">${esc(t("privacy"))}</a><a href="index.html?workspace=1&splash=0">${esc(t("workspace"))}</a><a href="review.html">${esc(t("moderator"))}</a></footer>`;
  }
  function shell(content, active = "home") {
    clearInterval(pollTimer);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    app.innerHTML = `<header class="app-header"><a class="brand" href="learn.html"><span class="brand-mark">V</span>VIZY</a><div class="header-actions"><span class="xp-chip">✦ <b id="xp-value">${Number(progress.xp) || 0}</b></span><button id="language" class="ghost">${lang === "he" ? "English" : "עברית"}</button><button id="mute" class="ghost" aria-label="${lang === "he" ? "צליל" : "Sound"}" aria-pressed="${A.isMuted()}">${A.isMuted() ? "♪ ×" : "♪"}</button><button id="account-button" class="ghost" aria-label="${esc(t("account"))}">◉</button></div></header><main id="main" tabindex="-1"><p id="server-score" class="text-small" ${serverXP === null ? "hidden" : ""}>${esc(t("serverPoints"))}: <b id="server-xp">${Number(serverXP) || 0}</b></p>${content}${footer()}</main><nav class="bottom-nav" aria-label="${lang === "he" ? "ניווט" : "Navigation"}">${[
      ["home", "◇"],
      ["race", "△"],
      ["requests", "＋"],
      ["plans", "✦"],
    ]
      .map(
        ([key, icon]) =>
          `<a href="#${key}" ${active === key ? 'aria-current="page"' : ""}><span class="nav-icon" aria-hidden="true">${icon}</span>${esc(t(key))}</a>`,
      )
      .join(
        "",
      )}</nav><dialog id="account-dialog" class="dialog"><button class="close ghost" id="close-account" aria-label="${esc(t("back"))}">×</button><h2>${esc(t("account"))}</h2><div id="account-content"></div></dialog>`;
    document.getElementById("language").onclick = () => {
      lang = lang === "he" ? "en" : "he";
      save("vizy_language", lang);
      if (current) lesson();
      else route();
    };
    document.getElementById("mute").onclick = () => {
      A.setMuted(!A.isMuted());
      const b = document.getElementById("mute");
      b.textContent = A.isMuted() ? "♪ ×" : "♪";
      b.setAttribute("aria-pressed", String(A.isMuted()));
    };
    document.getElementById("account-button").onclick = openAccount;
    document.getElementById("close-account").onclick = () =>
      document.getElementById("account-dialog").close();
  }
  function heroArt() {
    return `<div class="hero-art"><div class="hero-art-label"><span>${lang === "he" ? "רעיון קטן. שינוי גדול." : "Small idea. Big change."}</span><span class="pill lime">${esc(t("free"))}</span></div><svg viewBox="0 0 400 190" role="img" aria-label="${lang === "he" ? "שתי פרבולות בהזזה" : "Two shifted parabolas"}"><defs><pattern id="hero-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="#424461" stroke-width=".7"/></pattern></defs><rect width="400" height="190" fill="url(#hero-grid)"/><path d="M0 130H400M200 0V190" stroke="#737693"/><path d="M40 20Q155 245 270 20" fill="none" stroke="#a394ff" stroke-width="4"/><path d="M140 20Q255 245 370 20" fill="none" stroke="#d9fa78" stroke-width="4"/><path d="M160 130H245" stroke="#ff93c3" stroke-width="2" stroke-dasharray="5 5"/><circle cx="155" cy="132" r="6" fill="#a394ff"/><circle cx="255" cy="132" r="7" fill="#d9fa78"/><text x="206" y="114" fill="#ffbadb" font-size="15" text-anchor="middle">+ h</text></svg></div>`;
  }
  function home() {
    current = null;
    const available = C.filterBank(bank, { grade, topic, search }),
      next =
        bank.find(
          (a) => a.tier === "free" && !progress.mastered?.includes(a.id),
        ) || bank.find((a) => a.tier === "free");
    shell(
      `<section class="hero"><div><span class="pill">${esc(t("kicker"))}</span><h1>${esc(t("title"))}</h1><p>${esc(t("subtitle"))}</p><button class="primary" id="continue-challenge">${esc(t("continue"))} <span aria-hidden="true">↗</span></button></div>${heroArt()}</section><section class="journey-card"><span class="orb" aria-hidden="true">△</span><div><h3>${esc(t("journey"))}</h3><p>${esc(t("journeyCopy"))}</p></div><button id="go-race">${esc(t("journeyBtn"))}</button></section><section><div class="section-head"><h2>${esc(t("bank"))}</h2><span>${available.length} ${esc(t("count"))}</span></div><div class="filters" aria-label="${lang === "he" ? "סינון אתגרים" : "Challenge filters"}">${[
        ["all", t("all")],
        [9, lang === "he" ? "ט׳" : "9"],
        [10, lang === "he" ? "י׳" : "10"],
        [11, lang === "he" ? "י״א" : "11"],
      ]
        .map(
          ([g, label]) =>
            `<button data-grade="${g}" aria-pressed="${String(grade) == String(g)}">${label}</button>`,
        )
        .join(
          "",
        )}<select id="topic-filter" aria-label="${lang === "he" ? "נושא" : "Topic"}"><option value="all">${esc(t("all"))}</option>${[...new Set(bank.map((a) => a.topic))].map((k) => `<option value="${k}" ${topic === k ? "selected" : ""}>${esc(localized(bank.find((a) => a.topic === k)).topicLabel)}</option>`).join("")}</select><input id="bank-search" type="search" placeholder="${esc(t("search"))}" aria-label="${esc(t("search"))}" value="${esc(search)}"></div><div class="activities" id="bank-cards"></div></section>`,
      "home",
    );
    document.getElementById("continue-challenge").onclick = () =>
      openActivity(next.id);
    document.getElementById("go-race").onclick = () => (location.hash = "race");
    document.querySelectorAll("[data-grade]").forEach(
      (b) =>
        (b.onclick = () => {
          grade = b.dataset.grade;
          home();
        }),
    );
    document.getElementById("topic-filter").onchange = (e) => {
      topic = e.target.value;
      home();
    };
    document.getElementById("bank-search").oninput = (e) => {
      search = e.target.value;
      cards(C.filterBank(bank, { grade, topic, search }));
    };
    cards(available);
  }
  function cards(list) {
    const root = document.getElementById("bank-cards");
    root.replaceChildren();
    if (!list.length) {
      root.innerHTML = `<p class="empty">${esc(t("noResults"))}</p>`;
      return;
    }
    for (const a of list) {
      const l = localized(a),
        done = progress.mastered?.includes(a.id),
        card = document.createElement("article");
      card.className =
        "activity-card" +
        (a.tier === "premium" ? " locked" : "") +
        (done ? " mastered" : "");
      card.innerHTML = `<div class="card-art"></div><div class="card-body"><div class="card-meta"><span>${esc(t("grade"))} ${a.grade} · ${a.minutes} ${esc(t("minutes"))}</span><span class="pill ${a.tier === "free" ? "lime" : ""}">${esc(a.tier === "free" ? t("free") : t("locked"))}</span></div><h3>${esc(l.title)}</h3><p>${esc(l.summary)}</p><button>${esc(done ? t("mastered") : a.tier === "free" ? t("open") : t("locked"))}<span aria-hidden="true">${a.tier === "premium" ? "♢" : "↗"}</span></button></div>`;
      card.querySelector(".card-art").append(V.miniature(a.topic));
      card.querySelector("button").onclick = () => openActivity(a.id);
      root.append(card);
    }
  }
  async function openActivity(id) {
    const sequence = ++openSequence;
    let a = bank.find((q) => q.id === id);
    if (!a?.params) {
      try {
        const full = await S.activity(id);
        if (sequence !== openSequence) return;
        if (!full) {
          current = null;
          return plans();
        }
        a = full;
        if (!bank.some((q) => q.id === id) && a.tier === "free") bank.push(a);
      } catch (e) {
        if (sequence !== openSequence) return;
        notify(errorText(e));
        current = null;
        return plans();
      }
    }
    current = a;
    stage = 0;
    choice = null;
    firstAnswer = null;
    earned = false;
    const u = new URL(location.href);
    u.searchParams.set("activity", a.id);
    u.hash = "";
    history.replaceState(null, "", u);
    lesson();
    window.scrollTo(0, 0);
  }
  function lesson() {
    const a = current,
      l = localized(a);
    shell(
      `<div class="lesson-head"><button class="ghost" id="lesson-back" aria-label="${esc(t("back"))}">←</button><div><p>${esc(l.topicLabel)} · ${esc(t("grade"))} ${a.grade}</p><h1>${esc(l.title)}</h1></div><button class="ghost" id="share-activity" aria-label="${esc(t("share"))}">↗</button></div><div class="steps" aria-label="${lang === "he" ? "שלב" : "Step"} ${Math.min(stage + 1, 4)} / 4">${[0, 1, 2, 3].map((i) => `<span class="${i <= stage ? "done" : ""}"></span>`).join("")}</div><div id="lesson-content"></div>`,
    );
    document.getElementById("lesson-back").onclick = goHome;
    document.getElementById("share-activity").onclick = () =>
      shareActivity(a.id);
    const root = document.getElementById("lesson-content");
    if (stage === 0) {
      root.innerHTML = `<div class="transfer panel"><span class="pill">01 · ${esc(t("prediction"))}</span><h2 id="prediction-question">${esc(l.prediction.question)}</h2><p>${esc(t("predictIntro"))}</p><div class="options">${l.prediction.options.map((s, i) => `<button class="option ${choice === i ? "selected" : ""}" data-choice="${i}" aria-pressed="${choice === i}">${esc(s)}</button>`).join("")}</div><div class="feedback" id="prediction-feedback" role="status"></div><button class="primary" id="show-model" ${choice === null ? "disabled" : ""}>${esc(t("checkPicture"))}</button></div>`;
      root.querySelectorAll("[data-choice]").forEach(
        (b) =>
          (b.onclick = () => {
            choice = Number(b.dataset.choice);
            root.querySelectorAll("[data-choice]").forEach((x) => {
              x.classList.toggle("selected", x === b);
              x.setAttribute("aria-pressed", String(x === b));
            });
            document.getElementById("show-model").disabled = false;
            document.getElementById("prediction-feedback").textContent =
              choice === l.prediction.correct ? t("predYes") : t("predNo");
            A.playEffect("tap");
          }),
      );
      document.getElementById("show-model").onclick = () => {
        stage = 1;
        lesson();
        A.playVoice(lang + "_explore");
      };
    }
    if (stage === 1) {
      root.innerHTML = `<div class="lesson-layout"><section class="question-brief panel"><span class="pill">02 · ${esc(t("explore"))}</span><p id="question-stem">${visibleStem(a, a.params)}</p></section><section class="panel"><div class="formula">${esc(l.rule)}</div><details class="mediation-guide"><summary>${esc(t("explanation"))}</summary><ol class="mediation">${l.mediation.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></details><div class="hint-row"><button class="ghost" id="hint">${esc(t("hint"))}</button><button class="ghost" id="reset-model">${esc(t("restore"))}</button></div><div id="hint-text" class="hint"></div><form id="answer-form"><label for="answer" class="sr-only">${esc(t("answer"))}</label><div class="answer-row"><input id="answer" inputmode="decimal" autocomplete="off" placeholder="${esc(t("answer"))}"><button class="primary" type="submit">${esc(t("check"))}</button></div></form><div class="feedback" id="answer-feedback" role="status"></div><button class="primary" id="start-transfer" hidden>${esc(t("transfer"))}</button></section><div id="visual" class="model-panel"></div></div>`;
      const render = () =>
        V.renderVisual(
          document.getElementById("visual"),
          a,
          { ...a.params },
          () => {},
          lang,
        );
      render();
      document.getElementById("hint").onclick = () => {
        document.getElementById("hint-text").textContent = l.meaning;
        A.playVoice(lang + "_hint");
      };
      document.getElementById("reset-model").onclick = render;
      document.getElementById("answer-form").onsubmit = (e) => {
        e.preventDefault();
        const good = C.checkAnswer(
            a.answer,
            document.getElementById("answer").value,
            0.05,
          ),
          f = document.getElementById("answer-feedback");
        f.textContent = good ? t("correct") : t("wrong");
        f.className = "feedback " + (good ? "success" : "error");
        document.getElementById("start-transfer").hidden = !good;
        if (good) firstAnswer = a.answer;
        A.playEffect(good ? "tap" : "wrong");
      };
      document.getElementById("start-transfer").onclick = () => {
        stage = 2;
        lesson();
        A.playVoice(lang + "_transfer");
      };
    }
    if (stage === 2) {
      const transfer = {
        ...a,
        stem: a.transfer.stem,
        en: { ...a.en, stem: a.transfer.en?.stem || a.en?.stem },
        params: a.transfer.params,
      };
      root.innerHTML = `<section class="transfer panel"><span class="pill">03 · ${esc(t("prediction"))}</span><h2>${esc(t("transferTitle"))}</h2><p>${esc(t("transferCopy"))}</p><p>${visibleStem(transfer, a.transfer.params)}</p><form id="transfer-form"><label class="sr-only" for="transfer-answer">${esc(t("answer"))}</label><input id="transfer-answer" inputmode="decimal" autocomplete="off" placeholder="${esc(t("answer"))}"><button class="primary" type="submit" style="width:100%;margin-top:12px">${esc(t("transferCheck"))}</button></form><div id="transfer-feedback" class="feedback" role="status"></div><div class="hint-row"><button class="ghost" id="reveal-transfer">${esc(t("reveal"))}</button></div><div id="transfer-visual" class="transfer-visual model-panel"></div><p class="text-small">${esc(l.meaning)}</p></section>`;
      document.getElementById("reveal-transfer").onclick = () =>
        V.renderVisual(
          document.getElementById("transfer-visual"),
          a,
          { ...a.transfer.params },
          null,
          lang,
        );
      document.getElementById("transfer-form").onsubmit = async (e) => {
        e.preventDefault();
        if (
          !C.checkAnswer(
            a.transfer.answer,
            document.getElementById("transfer-answer").value,
            0.05,
          )
        ) {
          const f = document.getElementById("transfer-feedback");
          f.textContent = t("wrong");
          f.className = "feedback error";
          return A.playEffect("wrong");
        }
        earned = !progress.mastered?.includes(a.id);
        progress = C.awardMastery(progress, a.id);
        save("vizy_mastery", progress);
        stage = 3;
        lesson();
        A.celebrate();
        A.playVoice(lang + "_success");
        if (S.session) {
          try {
            const result = await S.submitMastery(
              a.id,
              firstAnswer,
              a.transfer.answer,
            );
            setServerXP(result.xp);
            notify(result.summit_bonus ? t("bonus") : t("raceSaved"));
          } catch {
            if (cohort) notify(t("raceSync"));
          }
        }
      };
    }
    if (stage === 3) {
      root.innerHTML = `<section class="transfer panel success-panel"><div class="success-icon" aria-hidden="true">✦</div><span class="pill lime">${earned ? "+40 " + esc(t("points")) : esc(t("practice"))}</span><h2 id="mastery-title">${esc(t("masteryTitle"))}</h2><p>${esc(t("masteryCopy"))}</p><div class="formula">${esc(l.rule)}</div><p>${esc(l.meaning)}</p><button class="primary" id="next-idea">${esc(t("next"))} ↗</button></section>`;
      document.getElementById("next-idea").onclick = goHome;
    }
    window.scrollTo(0, 0);
  }
  function goHome() {
    ++openSequence;
    current = null;
    const u = new URL(location.href);
    u.searchParams.delete("activity");
    u.hash = "home";
    history.replaceState(null, "", u);
    home();
    window.scrollTo(0, 0);
  }
  async function shareActivity(id) {
    const u = new URL(location.href);
    u.searchParams.set("activity", id);
    u.hash = "";
    try {
      await navigator.clipboard.writeText(u.href);
      notify(t("copied"));
    } catch {
      if (navigator.share)
        navigator.share({ title: "Vizy", url: u.href }).catch(() => {});
      else notify(u.href);
    }
  }
  function plans() {
    current = null;
    shell(
      `<h1 id="plans-title" class="page-title">${esc(t("planTitle"))}</h1><p class="page-subtitle">${esc(t("planIntro"))}</p><div class="plans">${[
        ["free", t("freeTitle"), "freeItems"],
        ["premium", t("premiumTitle"), "premiumItems"],
        ["class", t("classTitle"), "classItems"],
      ]
        .map(
          ([key, title, items]) =>
            `<section class="plan ${key === "premium" ? "featured" : ""}"><span class="pill">${key === "free" ? esc(t("free")) : key === "class" ? "CLASS" : "PREMIUM"}</span><h2>${esc(title)}</h2><ul>${t(
              items,
            )
              .map((s) => `<li>${esc(s)}</li>`)
              .join(
                "",
              )}</ul><button class="${key === "premium" ? "primary" : "ghost"}" data-plan="${key}">${esc(key === "free" ? t("continue") : t("planCta"))}</button></section>`,
        )
        .join(
          "",
        )}</div><p class="connection-note">${esc(t("purchaseNote"))}</p><p>${esc(t("plansHelp"))}</p><p id="plan-status" role="status"></p>`,
      "plans",
    );
    document.querySelectorAll("[data-plan]").forEach(
      (b) =>
        (b.onclick = async () => {
          if (b.dataset.plan === "free") return goHome();
          if (!S.session) return openAccount();
          try {
            plan = await S.plan();
            document.getElementById("plan-status").textContent =
              plan === "free" ? t("plansHelp") : plan.toUpperCase();
          } catch (e) {
            notify(errorText(e));
          }
        }),
    );
  }
  function requests() {
    current = null;
    const draft = read("vizy_request_draft", {
      text: "",
      sourceUrl: "",
      grade: profile.grade,
      id: crypto.randomUUID(),
    });
    shell(
      `<h1 class="page-title">${esc(t("requestTitle"))}</h1><p class="page-subtitle">${esc(t("requestIntro"))}</p><div class="two-columns"><section class="panel"><form id="request-form" class="form-stack"><label>${esc(t("text"))}<textarea id="request-text" maxlength="5000">${esc(draft.text)}</textarea></label><label>${esc(t("grade"))}<select id="request-grade">${[9, 10, 11].map((g) => `<option ${Number(draft.grade) === g ? "selected" : ""}>${g}</option>`).join("")}</select></label><label>${esc(t("source"))}<input id="request-source" type="url" value="${esc(draft.sourceUrl)}" dir="ltr"></label><label>${esc(t("image"))}<input id="request-image" type="file" accept="image/jpeg,image/png,image/webp"></label><div class="form-actions"><button type="button" class="ghost" id="save-draft">${esc(t("draft"))}</button><button type="submit" class="primary" id="send-request">${esc(t("send"))}</button></div><div id="request-status" class="feedback" role="status">${draft.text ? esc(t("notSent")) : ""}</div></form><p class="text-small">${esc(t("requestGoal"))}</p>${!S.session ? `<p class="connection-note">${esc(t("loginNeeded"))}</p><button id="request-login">${esc(t("login"))}</button>` : ""}</section><section class="panel"><h2>${esc(t("myRequests"))}</h2><div id="request-list" class="request-list"><p>${esc(t("emptyRequests"))}</p></div></section></div>`,
      "requests",
    );
    const data = () => ({
      id: draft.id,
      text: document.getElementById("request-text").value,
      sourceUrl: document.getElementById("request-source").value,
      grade: Number(document.getElementById("request-grade").value),
      language: lang,
    });
    document.getElementById("save-draft").onclick = () => {
      save("vizy_request_draft", data());
      document.getElementById("request-status").textContent = t("notSent");
    };
    document
      .getElementById("request-login")
      ?.addEventListener("click", openAccount);
    document.getElementById("request-form").onsubmit = async (e) => {
      e.preventDefault();
      const d = data(),
        status = document.getElementById("request-status"),
        button = document.getElementById("send-request");
      save("vizy_request_draft", d);
      if (!S.session) {
        status.textContent = t("loginNeeded") + " " + t("notSent");
        return openAccount();
      }
      button.disabled = true;
      try {
        const file = document.getElementById("request-image").files[0];
        if (file) d.imagePath = await S.uploadImage(file);
        const result = await S.submitRequest(d);
        if (!result?.id) throw Error("network_failed");
        save("vizy_request_draft", null);
        draft.id = crypto.randomUUID();
        document.getElementById("request-text").value = "";
        document.getElementById("request-image").value = "";
        status.textContent = t("received");
        loadRequests();
      } catch (err) {
        status.textContent = errorText(err) + " " + t("notSent");
      } finally {
        button.disabled = false;
      }
    };
    loadRequests();
  }
  async function loadRequests() {
    if (!S.session) return;
    try {
      const rows = await S.ownRequests(),
        root = document.getElementById("request-list");
      if (!root) return;
      root.replaceChildren();
      for (const r of rows) {
        const e = document.createElement("article");
        e.className = "request-item";
        e.innerHTML = `<span class="pill">${esc(t(r.status))}</span><p>${esc(r.question_text)}</p><small>${new Date(r.created_at).toLocaleDateString(lang === "he" ? "he-IL" : "en-US")}</small>${r.response_note ? `<p>${esc(r.response_note)}</p>` : ""}${r.response_activity_id ? `<button class="primary">${esc(t("open"))}</button>` : ""}`;
        e.querySelector("button")?.addEventListener("click", () =>
          openActivity(r.response_activity_id),
        );
        root.append(e);
      }
      if (!rows.length) root.textContent = t("emptyRequests");
    } catch (e) {
      const root = document.getElementById("request-list");
      if (root) root.textContent = errorText(e);
    }
  }
  function openAccount() {
    const d = document.getElementById("account-dialog"),
      root = document.getElementById("account-content");
    if (S.session) {
      root.innerHTML = `<p>${esc(profile.nickname || t("me"))}</p><button class="ghost" id="logout">${esc(t("logout"))}</button>`;
      document.getElementById("logout").onclick = async () => {
        await S.signOut();
        cohort = null;
        serverXP = null;
        plan = "free";
        save("vizy_cohort", null);
        d.close();
        route();
      };
    } else {
      root.innerHTML = `<p>${esc(t("loginNeeded"))}</p><form id="login-form" class="form-stack"><label>${esc(t("email"))}<input id="login-email" type="email" required autocomplete="email" dir="ltr"></label><button type="submit" class="primary">${esc(t("magic"))}</button><div id="login-status" class="feedback" role="status"></div></form>`;
      document.getElementById("login-form").onsubmit = async (e) => {
        e.preventDefault();
        const b = e.target.querySelector("button");
        b.disabled = true;
        try {
          await S.signIn(
            document.getElementById("login-email").value,
            new URL("learn.html", location.href).href,
          );
          document.getElementById("login-status").textContent = t("emailSent");
        } catch (err) {
          document.getElementById("login-status").textContent = errorText(err);
        } finally {
          b.disabled = false;
        }
      };
    }
    d.showModal();
  }
  function race() {
    current = null;
    shell(
      `<h1 class="page-title">${esc(t("raceTitle"))}</h1><p class="page-subtitle">${esc(t("raceIntro"))}</p><div class="two-columns"><section><div id="race-map" class="race-map"></div><p id="race-state" class="rank-note">${esc(cohort ? t("raceReal") : t("raceWaiting"))}</p><div id="race-list" class="race-list"></div><section id="group-tasks" class="group-tasks"></section></section><section class="panel"><h2>${esc(t("profile"))}</h2><label for="nickname">${esc(t("nickname"))}</label><input id="nickname" maxlength="24" value="${esc(profile.nickname)}" placeholder="${lang === "he" ? "כוכב ירוק" : "Green star"}"><div class="race-avatars" style="margin:14px 0" id="avatar-choices"></div><label for="race-grade">${esc(t("grade"))}</label><select id="race-grade">${[9, 10, 11].map((g) => `<option ${profile.grade === g ? "selected" : ""}>${g}</option>`).join("")}</select><button id="save-profile" class="secondary" style="width:100%;margin-top:14px">${esc(t("saveProfile"))}</button><hr style="border:0;border-top:1px solid var(--line);margin:24px 0"><button id="join-solo" class="primary" style="width:100%">${esc(t("solo"))}</button><p class="text-small">${esc(t("soloHint"))}</p><label for="class-code">${esc(t("code"))}</label><div class="profile-line"><input id="class-code" maxlength="16" dir="ltr" autocapitalize="characters"><button id="join-class">${esc(t("join"))}</button></div><details style="margin-top:20px"><summary>${esc(t("classCreate"))}</summary><input id="class-name" maxlength="60" placeholder="${esc(t("className"))}" style="margin:12px 0"><fieldset id="class-activities"></fieldset><button id="create-class">${esc(t("create"))}</button><p id="class-created" class="text-small"></p></details><div id="race-error" class="feedback" role="status"></div></section></div>`,
      "race",
    );
    const choices = document.getElementById("avatar-choices");
    for (const type of ["orbit", "bot", "fox"]) {
      const b = document.createElement("button");
      b.className =
        "avatar-choice" + (profile.avatar === type ? " selected" : "");
      b.setAttribute("aria-label", type);
      b.setAttribute("aria-pressed", String(profile.avatar === type));
      b.append(V.avatar(type));
      b.onclick = () => {
        profile.avatar = type;
        save("vizy_profile", profile);
        choices.querySelectorAll("button").forEach((x) => {
          x.classList.toggle("selected", x === b);
          x.setAttribute("aria-pressed", String(x === b));
        });
        if (!cohort)
          drawRace(
            [
              {
                nickname: profile.nickname || t("me"),
                avatar: type,
                completed: progress.mastered?.length || 0,
                is_self: true,
              },
            ],
            12,
          );
      };
      choices.append(b);
    }
    const saveProfile = async () => {
      profile.nickname =
        document.getElementById("nickname").value.trim() || t("me");
      profile.grade = Number(document.getElementById("race-grade").value);
      save("vizy_profile", profile);
      if (S.session)
        await S.profile(profile.nickname, profile.avatar, profile.grade);
    };
    document.getElementById("save-profile").onclick = async () => {
      try {
        await saveProfile();
        notify(t("saved"));
        updateRace();
      } catch (e) {
        document.getElementById("race-error").textContent = errorText(e);
      }
    };
    async function join(mode) {
      if (!S.session) return openAccount();
      try {
        await saveProfile();
        cohort = await S.cohort(
          mode,
          profile.grade,
          document.getElementById("class-code").value.trim().toUpperCase(),
        );
        save("vizy_cohort", cohort);
        updateRace();
        startRacePolling();
      } catch (e) {
        document.getElementById("race-error").textContent = errorText(e);
      }
    }
    document.getElementById("join-solo").onclick = () => join("solo");
    document.getElementById("join-class").onclick = () => join("class");
    document.getElementById("create-class").onclick = async () => {
      if (!S.session) return openAccount();
      try {
        await saveProfile();
        const ids = Array.from(
          document.querySelectorAll("#class-activities input:checked"),
        ).map((x) => x.value);
        const row = await S.createClass(
          document.getElementById("class-name").value,
          profile.grade,
          ids,
        );
        cohort = { id: row.id, mode: "class" };
        save("vizy_cohort", cohort);
        document.getElementById("class-created").textContent =
          t("code") + ": " + row.code;
        updateRace();
        startRacePolling();
      } catch (e) {
        document.getElementById("race-error").textContent = errorText(e);
      }
    };
    drawRace(
      [
        {
          nickname: profile.nickname || t("me"),
          avatar: profile.avatar,
          completed: progress.mastered?.length || 0,
          is_self: true,
        },
      ],
      12,
    );
    updateRace();
    startRacePolling();
    const tasks = () => {
      document.getElementById("class-activities").innerHTML =
        `<legend>${esc(t("chooseTasks"))}</legend>` +
        bank
          .filter(
            (a) =>
              a.grade === Number(document.getElementById("race-grade").value),
          )
          .map(
            (a) =>
              `<label class="class-task"><input type="checkbox" value="${esc(a.id)}" ${a.tier === "free" ? "checked" : ""}>${esc(localized(a).title)}</label>`,
          )
          .join("");
    };
    tasks();
    document.getElementById("race-grade").onchange = tasks;
  }
  function startRacePolling() {
    clearInterval(pollTimer);
    if (cohort && S.session)
      pollTimer = setInterval(() => {
        if (!document.hidden) updateRace();
      }, 15000);
  }
  function drawRace(peers, total) {
    const root = document.getElementById("race-map");
    if (!root) return;
    root.replaceChildren();
    const svg = V.el("svg", {
      viewBox: "0 0 420 440",
      role: "img",
      "aria-label": t("raceTitle"),
    });
    svg.append(
      V.el("rect", { width: 420, height: 440, fill: "#182d40" }),
      V.el("circle", { cx: 335, cy: 60, r: 27, fill: "#d9fa7822" }),
      V.el("path", {
        d: "M0 270L125 110L280 270L385 100L420 160V440H0Z",
        fill: "#284157",
      }),
      V.el("path", {
        d: "M0 370L90 210L235 370L340 195L420 295V440H0Z",
        fill: "#34575e",
      }),
      V.el("path", {
        d: "M48 390Q350 370 190 285T300 190T310 62",
        stroke: "#8cacc1",
        "stroke-width": 14,
        fill: "none",
        "stroke-linecap": "round",
      }),
    );
    const points = [
      [48, 390],
      [183, 357],
      [230, 303],
      [190, 262],
      [290, 207],
      [283, 153],
      [310, 62],
    ];
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];
      svg.append(
        V.el("circle", {
          cx: x,
          cy: y,
          r: 10,
          fill: i === 6 ? "#d9fa78" : "#466478",
          stroke: "#aac3cf",
          "stroke-width": 2,
        }),
      );
    }
    svg.append(
      V.el(
        "text",
        {
          x: 310,
          y: 34,
          fill: "#d9fa78",
          "font-size": 18,
          "text-anchor": "middle",
        },
        "✿ " + t("goal"),
      ),
    );
    peers.forEach((peer, index) => {
      const step = Math.min(
          6,
          Math.floor(((peer.completed || 0) / Math.max(total, 1)) * 6),
        ),
        [x, y] = points[step],
        g = V.el("g", {
          transform: `translate(${x - 20 + ((index % 3) - 1) * 16},${y - 45 - Math.floor(index / 3) * 14})`,
          ...(peer.is_self ? { "data-self": "true" } : {}),
        });
      const avatar = V.avatar(peer.avatar);
      avatar.setAttribute("width", "40");
      avatar.setAttribute("height", "40");
      g.append(avatar);
      svg.append(g);
      if (peer.is_self)
        svg.append(
          V.el(
            "text",
            {
              x: x,
              y: y + 27,
              fill: "#f5f5ff",
              "font-size": 12,
              "text-anchor": "middle",
            },
            t("me"),
          ),
        );
    });
    root.append(svg);
    const list = document.getElementById("race-list");
    list.replaceChildren();
    for (const peer of peers) {
      const row = document.createElement("div");
      row.className = "race-person";
      row.append(V.avatar(peer.avatar));
      const label = document.createElement("span");
      label.textContent = peer.nickname + (peer.is_self ? " · " + t("me") : "");
      const score = document.createElement("b");
      score.textContent = (peer.completed || 0) + " / " + total;
      row.append(label, score);
      list.append(row);
    }
  }
  async function updateRace() {
    if (!cohort || !S.session) return;
    try {
      const data = await S.raceBoard(cohort.id);
      drawRace(data.peers, data.goal);
      const tasks = document.getElementById("group-tasks");
      if (tasks) {
        tasks.replaceChildren();
        const h = document.createElement("h2");
        h.textContent = t("groupTasks");
        tasks.append(h);
        for (const id of data.activity_ids || []) {
          const a = bank.find((q) => q.id === id),
            b = document.createElement("button");
          b.textContent =
            (data.completed_ids?.includes(id) ? "✓ " : "") +
            (a ? localized(a).title : id);
          b.onclick = () => openActivity(id);
          tasks.append(b);
        }
      }
      const e = document.getElementById("race-state");
      if (e)
        e.textContent =
          t("raceReal") +
          ` (${data.peers.length}${cohort.mode === "solo" ? "/11" : ""})`;
    } catch (e) {
      const root = document.getElementById("race-state");
      if (root) root.textContent = errorText(e);
    }
  }
  function route() {
    ++openSequence;
    const key = location.hash.slice(1);
    current = null;
    if (key === "race") race();
    else if (key === "requests") requests();
    else if (key === "plans") plans();
    else if (key === "account") {
      home();
      openAccount();
    } else {
      const id = new URL(location.href).searchParams.get("activity");
      if (id) openActivity(id);
      else home();
    }
  }
  window.addEventListener("hashchange", () => {
    const u = new URL(location.href);
    u.searchParams.delete("activity");
    history.replaceState(null, "", u);
    route();
    window.scrollTo(0, 0);
  });
  function setServerXP(value) {
    if (!Number.isFinite(value)) return;
    serverXP = value;
    const b = document.getElementById("server-xp"),
      p = document.getElementById("server-score");
    if (b) b.textContent = String(value);
    if (p) p.hidden = false;
  }
  async function refreshCatalog() {
    try {
      const catalog = await S.catalog();
      for (const meta of catalog || [])
        if (!bank.some((a) => a.id === meta.id)) bank.push(meta);
      if (!current && document.getElementById("bank-cards"))
        cards(C.filterBank(bank, { grade, topic, search }));
    } catch {}
  }
  async function init() {
    try {
      const r = await fetch("learning-bank.json");
      if (!r.ok) throw Error("bank");
      bank = await r.json();
      route();
      if ("serviceWorker" in navigator)
        navigator.serviceWorker.register("service-worker.js").catch(() => {});
      window.addEventListener("offline", () => notify(t("offline")));
      try {
        await S.init();
        if (S.session) {
          try {
            plan = await S.plan();
          } catch {}
          try {
            const p = await S.progress();
            setServerXP(p.xp);
          } catch {}
          if (location.hash === "#account" && !current) {
            home();
            openAccount();
          }
        }
      } catch {}
      refreshCatalog();
    } catch {
      app.innerHTML =
        '<main><h1>Vizy</h1><p>לא ניתן לטעון את הבנק. נסו לרענן עם חיבור לרשת.<br>The bank could not load. Reconnect and refresh.</p><button onclick="location.reload()">↻</button></main>';
    }
  }
  init();
})();
