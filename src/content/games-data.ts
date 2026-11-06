/** بيانات الألعاب التعليمية */

/** لعبة مطابقة الأداة بوظيفتها */
export interface MatchPair {
  id: string;
  tool: string;
  functionText: string;
}

export const matchPairs: MatchPair[] = [
  { id: "avast", tool: "Avast", functionText: "مضاد فيروسات: فحص وحجز وإصلاح التهديدات" },
  {
    id: "comodo",
    tool: "COMODO Firewall",
    functionText: "جدار ناري: مراقبة الاتصالات والسماح أو المنع",
  },
  { id: "todo", tool: "Todo Backup", functionText: "نسخ احتياطي واستعادة عند الفشل" },
  { id: "encrypto", tool: "Encrypto", functionText: "تشفير الملفات بكلمة مرور وفك التشفير" },
  {
    id: "virustotal",
    tool: "VirusTotal",
    functionText: "فحص الملفات عبر أكثر من 70 محركًا في وقت واحد",
  },
  {
    id: "housecall",
    tool: "HouseCall",
    functionText: "فحص الجهاز واكتشاف التهديدات النشطة (Trend Micro)",
  },
  { id: "sevenzip", tool: "7-Zip", functionText: "ضغط مشفر بكلمة مرور وحساب قيم CRC" },
  { id: "hasher", tool: "IgorWare Hasher", functionText: "حساب قيم التجزئة SHA-1 و MD5" },
];

/** لعبة قرارات الجدار الناري */
export interface FirewallScenario {
  id: number;
  app: string;
  detail: string;
  correct: "allow" | "block";
  reason: string;
}

export const firewallScenarios: FirewallScenario[] = [
  {
    id: 1,
    app: "Google Chrome",
    detail: "متصفح إنترنت معروف يحاول الاتصال بصفحة ويب (TCP:443)",
    correct: "allow",
    reason: "برنامج موثوق ومعروف، والوضع Safe Mode يسمح للبرامج الموثوقة بالاتصال.",
  },
  {
    id: 2,
    app: "UnknownApp.exe",
    detail: "برنامج مجهول حديث التثبيت يحاول إرسال بيانات إلى منفذ غير مستخدم",
    correct: "block",
    reason:
      "برنامج غير معروف يحاول الاتصال بمنفذ غير مستخدم — علامة اختراق محتملة، والجدار الناري يقفل المنافذ غير المستخدمة.",
  },
  {
    id: 3,
    app: "Windows Update",
    detail: "خدمة النظام تطلب تحديثات من سيرفرات مايكروسوفت",
    correct: "allow",
    reason: "خدمة نظام رسمية من مصدر موثوق، والسماح ضروري لتحديثات الأمان.",
  },
  {
    id: 4,
    app: "FreeGame_Crack.exe",
    detail: "لعبة مجانية من مصدر غير معروف تحاول الاتصال الخروج في الخلفية",
    correct: "block",
    reason: "برنامج من مصدر غير معروف قد يكون حصان طروادة يخفي نفسه داخل برامج تبدو شرعية.",
  },
  {
    id: 5,
    app: "Ping (ICMP)",
    detail: "أمر فحص تشخيصي من جهاز داخل منطقتك الموثوقة Trusted Network Zone",
    correct: "allow",
    reason: "ICMP يُستخدم للتشخيص، والمصدر داخل المناطق الموثوقة (Trusted Network Zone).",
  },
  {
    id: 6,
    app: "KeyLogger.exe",
    detail: "برنامج مكتشف أنه يرسل ضغطات الكيبورد إلى عنوان خارجي غريب",
    correct: "block",
    reason: "سلوك خطير وواضح؛ يجب المنع الفوري وتعقبه بمضاد الفيروسات ثم الحجز (Quarantine).",
  },
  {
    id: 7,
    app: "Skype / Zoom",
    detail: "تطبيق اجتماعات معروف يستخدم بروتوكول UDP للبث المباشر",
    correct: "allow",
    reason: "برنامج معروف، وUDP بروتوكول سريع مناسب للبث المباشر والمكالمات.",
  },
  {
    id: 8,
    app: "BackupService.exe",
    detail: "أداة النسخ الاحتياطي تحاول رفع نسخة إلى التخزين السحابي",
    correct: "allow",
    reason: "نشاط مألوف يدعم قاعدة 3-2-1 للنسخ الاحتياطي مع نسخة خارج الموقع.",
  },
];

/** لعبة الذاكرة: مصطلحات الأمن */
export interface MemoryTerm {
  id: string;
  label: string;
  sub: string;
}

export const memoryTerms: MemoryTerm[] = [
  { id: "pass", label: "كلمة المرور", sub: "المفتاح" },
  { id: "firewall", label: "الجدار الناري", sub: "حارس البوابة" },
  { id: "quarantine", label: "الحجز", sub: "Quarantine" },
  { id: "hash", label: "التجزئة", sub: "Hash" },
  { id: "encrypt", label: "التشفير", sub: "Encrypto" },
  { id: "backup", label: "النسخ الاحتياطي", sub: "3-2-1" },
  { id: "guest", label: "حساب الضيف", sub: "Guest" },
  { id: "udp", label: "بروتوكول UDP", sub: "سريع" },
];

/** حقائق سريعة تظهر بعد كل جولة */
export const gameFacts: string[] = [
  "الأمن يعتمد على ثلاثة عناصر: وعيك، البرامج، والسياسات الأمنية المناسبة.",
  "كلمة المرور القوية لا يقل طولها عن 8 خانات وتتسم بالتعقيد والتنوع.",
  "قاعدة النسخ الاحتياطي الذهبية 3-2-1: ثلاث نسخ، وسيطان مختلفان، ونسخة خارج الموقع.",
  "مثلث CIA: السرية Confidentiality والسلامة Integrity والتوفر Availability.",
  "Block All أعلى مستوى حماية في COMODO ويُستخدم عند الاشتباه باختراق.",
];
