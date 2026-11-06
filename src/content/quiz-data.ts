export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number; // index into options
  explanation: string;
  topic: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    topic: "كلمات المرور",
    question:
      "ما نوع كلمة المرور التي تمنع الوصول إلى البيانات المخزنة على الهارد ديسك حتى لو تم نقل الهارد لجهاز آخر؟",
    options: [
      "كلمة مرور النظام (System/User)",
      "كلمة مرور الإعدادات (Admin/Setup)",
      "كلمة مرور القرص الصلب (HDD Password)",
      "لا يوجد نوع كهذا",
    ],
    answer: 2,
    explanation:
      "كلمة مرور القرص الصلب (HDD Password) تطلب للسماح بالوصول إلى محركات الأقراص الثابتة، وتمنع الوصول للبيانات حتى لو نُقل الهارد لجهاز آخر.",
  },
  {
    id: 2,
    topic: "كلمات المرور",
    question:
      "أي كلمة مرور تطلب عند محاولة الدخول إلى إعدادات BIOS لمنع العبث بإعدادات اللوحة الأم؟",
    options: [
      "HDD Password",
      "Admin/Supervisor/Setup Password",
      "System/User Password",
      "Windows Password",
    ],
    answer: 1,
    explanation:
      "كلمة مرور الإعدادات أو المدير (Admin/Supervisor/Setup Password) تطلب عند الدخول لإعدادات BIOS لإجراء تغييرات عليها.",
  },
  {
    id: 3,
    topic: "صلاحيات المستخدمين",
    question:
      "أي حساب يملك الصلاحيات الكاملة في تثبيت البرامج وتغيير الإعدادات والوصول لكافة الملفات؟",
    options: [
      "حساب الضيف (Guest)",
      "حساب قياسي (Standard)",
      "حساب ميكروسوفت (Microsoft)",
      "حساب مدير النظام (Administrator)",
    ],
    answer: 3,
    explanation: "حساب مدير النظام (Administrator) له الصلاحيات الكاملة على الجهاز.",
  },
  {
    id: 4,
    topic: "صلاحيات المستخدمين",
    question:
      "ما نوع الحساب المخصص للعارض بصلاحيات دنيا جدًا لا يمكنه تحميل برامج أو تغيير إعدادات؟",
    options: [
      "حساب الضيف (Guest)",
      "حساب قياسي (Standard)",
      "حساب محلي (Local)",
      "حساب المسؤول (Administrator)",
    ],
    answer: 0,
    explanation: "حساب الضيف (Guest) بصلاحيات دنيا جدًا للاستخدام للعارض.",
  },
  {
    id: 5,
    topic: "صلاحيات المستخدمين",
    question: "أي حساب يتطلب اتصالًا بالإنترنت وبريدًا إلكترونيًا ويسمح بمزامنة الإعدادات؟",
    options: [
      "الحساب المحلي (Local Account)",
      "حساب ميكروسوفت (Microsoft Account)",
      "حساب الضيف (Guest)",
      "حساب النظام (System Account)",
    ],
    answer: 1,
    explanation:
      "حساب ميكروسوفت يتطلب اتصالًا بالإنترنت وبريدًا إلكترونيًا ويسمح بمزامنة الإعدادات بين الأجهزة.",
  },
  {
    id: 6,
    topic: "أدوات الفحص",
    question: "كم عدد محركات الفحص العالمية التي يخضع لها الملف في VirusTotal تقريبًا؟",
    options: ["أكثر من 10 محركات", "أكثر من 70 محركًا", "أكثر من 300 محرك", "محرك واحد فقط"],
    answer: 1,
    explanation:
      "VirusTotal يخضع الملف لأكثر من 70 محرك فحص عالمي (مثل Kaspersky و Bitdefender) في وقت واحد.",
  },
  {
    id: 7,
    topic: "أدوات الفحص",
    question: "أي أداة من شركة Trend Micro لفحص الجهاز واكتشاف التهديدات النشطة؟",
    options: ["Jotti", "HouseCall", "VirusTotal", "IgorWare Hasher"],
    answer: 1,
    explanation: "HouseCall أداة من شركة Trend Micro لفحص الجهاز واكتشاف التهديدات النشطة.",
  },
  {
    id: 8,
    topic: "أدوات الفحص",
    question: "ما ميزة Jotti الرئيسية مقارنة بـ VirusTotal؟",
    options: [
      "قاعدة بيانات أكبر",
      "الذكاء الاصطناعي المتقدم",
      "التحقق المزدوج من النتائج الإيجابية الخاطئة (False Positives)",
      "الفحص بدون إنترنت",
    ],
    answer: 2,
    explanation:
      "يُعد Jotti أداة تكميلية مفيدة للتحقق المزدوج (Cross-verification) من النتائج الإيجابية الخاطئة.",
  },
  {
    id: 9,
    topic: "مضاد الفيروسات",
    question: "عند اكتشاف فيروس في Avast، ما الخيارات المتاحة للتعامل معه؟",
    options: [
      "الحجز (Quarantine) أو الإصلاح (Repair) أو الحذف (Delete)",
      "الطباعة فقط",
      "إعادة تشغيل الجهاز فقط",
      "لا يمكن التعامل معه",
    ],
    answer: 0,
    explanation:
      "عند اكتشاف فيروس في Avast يمكن نقله إلى الحجز (Quarantine) أو إصلاحه (Repair) أو حذفه (Delete).",
  },
  {
    id: 10,
    topic: "الجدار الناري",
    question:
      "أي وضع في جدار COMODO الناري يتعلم سلوك البرامج المثبتة وينشئ قواعد تلقائية حسب الاستخدام؟",
    options: ["Block All", "Safe Mode", "Training Mode", "Custom Ruleset"],
    answer: 2,
    explanation:
      "Training Mode يتعلم سلوك البرامج وينشئ قواعد تلقائية حسب استخدام المستخدم، ويُستخدم لفترة مؤقتة فقط.",
  },
  {
    id: 11,
    topic: "الجدار الناري",
    question: "ما أعلى مستوى حماية في COMODO Firewall ويُستخدم عند الاشتباه بوجود هجوم أو اختراق؟",
    options: ["Safe Mode", "Block All", "Training Mode", "Allow All"],
    answer: 1,
    explanation: "Block All يمنع جميع الاتصالات الواردة والصادرة وهو أعلى مستوى حماية.",
  },
  {
    id: 12,
    topic: "الجدار الناري",
    question: "أي بروتوكول سريع لا يتطلب تأكيد الاستلام ويُستخدم في ألعاب الأونلاين والبث المباشر؟",
    options: ["TCP", "ICMP", "IP", "UDP"],
    answer: 3,
    explanation: "UDP بروتوكول سريع لا يتطلب تأكيد الاستلام، أما TCP فهو موثوق يضمن وصول البيانات.",
  },
  {
    id: 13,
    topic: "الجدار الناري",
    question: "أي بروتوكول يُستخدم لأغراض التشخيص والتحكم مثل أمر Ping؟",
    options: ["UDP", "TCP", "ICMP", "MAC"],
    answer: 2,
    explanation: "ICMP يُستخدم لأغراض التشخيص والتحكم مثل أمر Ping.",
  },
  {
    id: 14,
    topic: "النسخ الاحتياطي",
    question: "ما القاعدة الذهبية المفضلة للنسخ الاحتياطي المذكورة في الدرس؟",
    options: ["قاعدة 1-1-1", "قاعدة 3-2-1", "قاعدة 5-4-3", "قاعدة 2-2-2"],
    answer: 1,
    explanation:
      "قاعدة 3-2-1: ثلاث نسخ على وسيطين مختلفين وأحدهما خارج الموقع، وتحقق مبدأ التوفر (Availability).",
  },
  {
    id: 15,
    topic: "التجزئة",
    question: "أي برنامج يحسب قيم التجزئة (SHA-1, MD5) فورًا عند وضع الملف فيه؟",
    options: ["7-Zip", "Encrypto", "IgorWare Hasher", "Todo Backup"],
    answer: 2,
    explanation: "IgorWare Hasher برنامج بسيط يحسب قيم (SHA-1, MD5) فورًا للتأكد من سلامة الملفات.",
  },
  {
    id: 16,
    topic: "التشفير والتجزئة",
    question: "كيف نسترجع ملفًا مشفرًا ببرنامج Encrypto إلى أصله؟",
    options: [
      "اختيار Decrypt وإدخال كلمة المرور الصحيحة",
      "حذف الملف وإعادة تحميله",
      "إعادة تشغيل الجهاز",
      "اختيار Encrypt مرة أخرى",
    ],
    answer: 0,
    explanation: "فك التشفير: اختيار (Decrypt) وإدخال كلمة المرور الصحيحة لاستعادة الملف الأصلي.",
  },
  {
    id: 17,
    topic: "مثلث الأمن",
    question: "ما المبدأ الذي يضمن عدم كشف البيانات للأفراد غير المصرح لهم في مثلث CIA؟",
    options: [
      "السلامة (Integrity)",
      "التوفر (Availability)",
      "السرية (Confidentiality)",
      "الموثوقية (Reliability)",
    ],
    answer: 2,
    explanation: "السرية (Confidentiality) هي ضمان عدم كشف البيانات للأفراد غير المصرح لهم.",
  },
  {
    id: 18,
    topic: "الملفات المخفية",
    question: "كيف تُظهر الملفات المخفية بسرعة في نظام Windows 11؟",
    options: ["View ← تفعيل Hidden items", "File ← Delete", "Home ← Copy", "Settings ← Uninstall"],
    answer: 0,
    explanation:
      "في Windows 11: افتح File Explorer، اضغط View من الشريط العلوي، ثم فعّل خيار Hidden items.",
  },
  {
    id: 19,
    topic: "صلاحيات الملفات",
    question: "من أين نحدد صلاحيات مستخدم معين على ملف (قراءة/كتابة/تحكم كامل)؟",
    options: [
      "خصائص الملف Properties ← تبويب Security",
      "مدير المهام Task Manager",
      "موقع VirusTotal",
      "إعدادات المتصفح",
    ],
    answer: 0,
    explanation:
      "تحديد صلاحيات الملفات يتم عبر خصائص الملف (Properties) ثم تبويب الأمان (Security).",
  },
  {
    id: 20,
    topic: "عناصر الأمن",
    question: "ما العناصر الثلاثة الأساسية التي يعتمد عليها الأمن وفقًا للخلاصة؟",
    options: [
      "السعر، السرعة، الحجم",
      "العنصر البشري (وعيك)، الحلول التقنية (البرامج)، السياسات الأمنية المناسبة",
      "الويندوز، الماك، اللينكس",
      "الفأرة، الكيبورد، الشاشة",
    ],
    answer: 1,
    explanation:
      "الأمن يعتمد على: العنصر البشري (وعيك)، والحلول التقنية (البرامج)، والسياسات الأمنية المناسبة.",
  },
];
