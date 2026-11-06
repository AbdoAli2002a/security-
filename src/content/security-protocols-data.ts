export type ProtocolCategory = "transport" | "web_encryption" | "firewall_rules" | "wireless_auth";

export interface ProtocolQuestion {
  id: number;
  protocol: string;
  category: ProtocolCategory;
  categoryLabel: string;
  portOrLayer: string;
  difficulty: "أساسي" | "متوسط" | "متقدم";
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  keyTakeaway: string;
}

export const protocolCategoryLabels: Record<ProtocolCategory, string> = {
  transport: "بروتوكولات النقل والشبكة",
  web_encryption: "بروتوكولات الويب والتشفير",
  firewall_rules: "بروتوكولات الجدار الناري وحماية المنافذ",
  wireless_auth: "بروتوكولات الأمان اللاسلكي والتوثيق",
};

export const securityProtocolQuestions: ProtocolQuestion[] = [
  {
    id: 1,
    protocol: "TCP 3-Way Handshake",
    category: "transport",
    categoryLabel: "بروتوكولات النقل والشبكة",
    portOrLayer: "طبقة النقل (Layer 4)",
    difficulty: "أساسي",
    question:
      "ما الترتيب الصحيح للحزم في المصافحة الثلاثية (3-Way Handshake) لبروتوكول TCP لبدء اتصال آمن وموثوق؟",
    options: [
      "SYN ثم SYN-ACK ثم ACK",
      "ACK ثم SYN ثم FIN",
      "SYN ثم ACK ثم DATA",
      "HELLO ثم AUTH ثم CONNECT",
    ],
    answer: 0,
    explanation:
      "يبدأ اتصال TCP بمصافحة ثلاثية: يرسل العميل حزمة مزامنة (SYN)، فيرد الخادم بحزمة مزامنة وتأكيد (SYN-ACK)، ثم يؤكد العميل الاستلام بحزمة (ACK) قبل بدء تبادل البيانات.",
    keyTakeaway: "المصافحة الثلاثية تضمن موثوقية الاتصال قبل بدء إرسال البيانات.",
  },
  {
    id: 2,
    protocol: "HTTPS / TLS 1.3",
    category: "web_encryption",
    categoryLabel: "بروتوكولات الويب والتشفير",
    portOrLayer: "منفذ 443 / TCP",
    difficulty: "أساسي",
    question:
      "ما الفرق الجوهري بين بروتوكول HTTP العادي وبروتوكول HTTPS المشفر عند تصفح مواقع الويب؟",
    options: [
      "HTTPS يضغط حجم الصفحات فقط دون تشفيرها",
      "HTTPS يشفر قناة الاتصال بالكامل باستخدام بروتوكول TLS لمنع التنصت والتعديل",
      "HTTP مخصص للهواتف بينما HTTPS مخصص لأجهزة الحاسوب المكتبية",
      "HTTPS يعمل فقط بدون اتصال بالإنترنت",
    ],
    answer: 1,
    explanation:
      "يعتمد HTTPS على طبقة الأمان TLS (Transport Layer Security) عبر المنفذ 443 لتشفير البيانات المتبادلة بين المتصفح والخادم، مما يحمي كلمات المرور والبيانات الحساسة من هجمات التنصت (Man-in-the-Middle).",
    keyTakeaway: "HTTPS = HTTP + TLS تشفير كامل على المنفذ 443.",
  },
  {
    id: 3,
    protocol: "UDP vs TCP",
    category: "transport",
    categoryLabel: "بروتوكولات النقل والشبكة",
    portOrLayer: "طبقة النقل (Layer 4)",
    difficulty: "متوسط",
    question:
      "لماذا تفضل تطبيقات البث المباشر وألعاب الفيديو بروتوكول UDP بدلًا من TCP رغم أنه غير موثوق؟",
    options: [
      "لأن UDP يوفر تشفيرًا أقوى من TCP تلقائيًا",
      "لأن UDP سريع بدون تأخير إعادة الإرسال أو متطلبات تأكيد الاستلام (No Overhead)",
      "لأن UDP لا يتطلب عنوان IP للاتصال",
      "لأن جدران الحماية لا تستطيع فحص بروتوكول UDP نهائيًا",
    ],
    answer: 1,
    explanation:
      "بروتوكول UDP غير متصل (Connectionless) ولا ينتظر إشعارات الاستلام (ACK)، مما يمنحه سرعة فائقة وزمن وصول منخفض جدًا، وهو مثالي للبث الحي وألعاب الشبكة حيث يكون وصول الحزمة في وقتها أهم من إعادة إرسال الحزم الضائعة.",
    keyTakeaway: "UDP يضحي بالمصادقة وتأكيد الاستلام لصالح السرعة الفائقة.",
  },
  {
    id: 4,
    protocol: "SSH (Secure Shell)",
    category: "web_encryption",
    categoryLabel: "بروتوكولات الويب والتشفير",
    portOrLayer: "منفذ 22 / TCP",
    difficulty: "أساسي",
    question:
      "لماذا تم استبدال بروتوكول Telnet القديم ببروتوكول SSH في إدارة الخوادم والأنظمة البعيدة؟",
    options: [
      "لأن Telnet كان يرسل أسماء المستخدمين وكلمات المرور بنص واضح غير مشفر (Plaintext)",
      "لأن Telnet لا يدعم نظام التشغيل لينكس",
      "لأن SSH مجاني بينما Telnet يتطلب اشتراكًا سنويًا",
      "لأن Telnet يعمل عبر الشبكة اللاسلكية فقط",
    ],
    answer: 0,
    explanation:
      "بروتوكول Telnet ينقل كل المدخلات بما فيها كلمات المرور كنص مقروء (Cleartext)، بينما يقوم SSH بتشفير جلسة الاتصال بالكامل باستخدام خوارزميات تشفير قوية مع دعم المصادقة بالمفاتيح العامة (Public-Key Authentication).",
    keyTakeaway: "SSH يضمن تشفير الجلسة وإخفاء بيانات الاعتماد عبر المنفذ 22.",
  },
  {
    id: 5,
    protocol: "ICMP (Internet Control Message Protocol)",
    category: "transport",
    categoryLabel: "بروتوكولات النقل والشبكة",
    portOrLayer: "طبقة الإنترنت (Layer 3)",
    difficulty: "متوسط",
    question:
      "أي نوع من الهجمات السيبرانية يعتمد على إغراق الهدف بحزم ICMP Echo Request لشل حركته، وكيف يتعامل الجدار الناري معه؟",
    options: [
      "هجوم Ping Flood (DoS)، ويقوم الجدار الناري بحجب أو تحديد معدل حزم ICMP",
      "هجوم التشفير الفدية (Ransomware)، ويقوم الجدار بحذف الملفات",
      "هجوم حقن SQL، ويقوم الجدار بتعطيل قواعد البيانات",
      "هجوم التخمين على كلمات المرور، ويقوم الجدار بإنشاء حساب ضيف",
    ],
    answer: 0,
    explanation:
      "يُستخدم بروتوكول ICMP في أوامر التشخيص مثل Ping و Traceroute، لكن المهاجمين قد يستغلونه في هجمات Ping of Death أو ICMP Flooding. يتيح الجدار الناري (مثل COMODO) قواعد لحظر استجابات ICMP لمنع اكتشاف الجهاز وإيقاف الإغراق.",
    keyTakeaway: "حجب ICMP في الجدار الناري يخفي الجهاز عن محاولات المسح والهجمات.",
  },
  {
    id: 6,
    protocol: "IPsec (ESP vs AH)",
    category: "firewall_rules",
    categoryLabel: "بروتوكولات الجدار الناري وحماية المنافذ",
    portOrLayer: "Layer 3 VPN Security",
    difficulty: "متقدم",
    question:
      "في بروتوكول IPsec المستخدم في الشبكات الافتراضية الخاصة (VPN)، ما البروتوكول الذي يوفر التشفير الكامل للبيانات وسريتها؟",
    options: [
      "بروتوكول ESP (Encapsulating Security Payload)",
      "بروتوكول AH (Authentication Header)",
      "بروتوكول ICMP",
      "بروتوكول ARP",
    ],
    answer: 0,
    explanation:
      "بروتوكول AH يوفر فقط المصادقة وسلامة البيانات (Integrity & Authentication) دون أي تشفير للحمولة، بينما يوفر بروتوكول ESP السرية عبر التشفير (Confidentiality) بالإضافة إلى السلامة والمصادقة.",
    keyTakeaway: "ESP = تشفير وسرية وسلامة • AH = مصادقة وسلامة فقط دون تشفير.",
  },
  {
    id: 7,
    protocol: "DNSSEC",
    category: "web_encryption",
    categoryLabel: "بروتوكولات الويب والتشفير",
    portOrLayer: "منفذ 53 / UDP & TCP",
    difficulty: "متوسط",
    question: "ما التهديد الأمني الرئيسي الذي يحمي منه بروتوكول DNSSEC مقارنة بنظام DNS التقليدي؟",
    options: [
      "انتحال عناوين خوادم الأسماء وتسميم ذاكرة الكاش (DNS Spoofing & Cache Poisoning)",
      "سرقة بطاقات الائتمان المخزنة داخل المعالج",
      "إصابة الهارد ديسك بفيروسات قطاع الإقلاع (Boot Sector)",
      "انقطاع التيار الكهربائي المفاجئ عن الراوتر",
    ],
    answer: 0,
    explanation:
      "يضيف DNSSEC توقيعات رقمية مشفرة (Cryptographic Signatures) لسجلات DNS للتحقق من هوية مصدر الإجابة والتأكد من عدم التلاعب بعنوان الـ IP الحقيقي للموقع أثناء الطريق.",
    keyTakeaway: "DNSSEC يوقع السجلات رقميًا لمنع إعادة توجيه الضحايا لمواقع احتيالية.",
  },
  {
    id: 8,
    protocol: "WPA3 vs WPA2",
    category: "wireless_auth",
    categoryLabel: "بروتوكولات الأمان اللاسلكي والتوثيق",
    portOrLayer: "الأمان اللاسلكي (Wi-Fi)",
    difficulty: "متوسط",
    question:
      "ما الميزة الأمنية الرئيسية التي يقدمها بروتوكول WPA3 للتصدي لهجمات التخمين دون اتصال (Offline Dictionary Attacks) مقارنة بـ WPA2؟",
    options: [
      "اعتماد مصافحة SAE (Simultaneous Authentication of Equals) المقاومة لاعتراض الكلمات السرية",
      "إلغاء الحاجة لكلمة مرور نهائيًا وفتح الشبكة للجميع",
      "تقليل مدى إشارة الواي فاي إلى متر واحد فقط",
      "تغيير اسم الشبكة (SSID) كل خمس ثوانٍ",
    ],
    answer: 0,
    explanation:
      "يستبدل WPA3 مصافحة WPA2 الرباعية القديمة بمصافحة SAE (معروفة بخوارزمية اليعسوب Dragonfly)، والتي تمنع المهاجم الذي التقط إشارة الشبكة من تجربة ملايين الكلمات دون الاتصال المباشر بالراوتر.",
    keyTakeaway: "WPA3 يحمي حتى كلمات المرور الضعيفة من هجمات التخمين دون اتصال.",
  },
  {
    id: 9,
    protocol: "Stateful Packet Inspection (SPI)",
    category: "firewall_rules",
    categoryLabel: "بروتوكولات الجدار الناري وحماية المنافذ",
    portOrLayer: "الجدار الناري (Firewall)",
    difficulty: "متوسط",
    question:
      "كيف يختلف الجدار الناري الذي يدعم فحص الحالة (Stateful Firewall) عن جدار تصفية الحزم البسيط (Stateless)؟",
    options: [
      "يتتبع جدول حالات الاتصالات النشطة ويسمح بالحزم الواردة فقط إذا كانت ردًا على اتصال initiated داخليًا",
      "يفحص الملفات المضغوطة فقط ويتجاهل حركة الشبكة",
      "يعمل فقط عند إيقاف تشغيل الكمبيوتر",
      "يمنع كل الاتصالات بدون أي استثناء",
    ],
    answer: 0,
    explanation:
      "الجدار الناري ذو الحالة (Stateful) يتتبع مرحلة الاتصال وسياقه (NEW, ESTABLISHED, RELATED)، مما يسمح بحركة البيانات المشروعة تلقائيًا دون فتح منافذ ثابتة خطرة للاتصالات العشوائية القادمة من الخارج.",
    keyTakeaway: "فحص الحالة يربط كل حزمة واردة بطلب مشروع صادر مسبقًا من داخل الشبكة.",
  },
  {
    id: 10,
    protocol: "ARP & Anti-ARP Spoofing",
    category: "firewall_rules",
    categoryLabel: "بروتوكولات الجدار الناري وحماية المنافذ",
    portOrLayer: "الربط الشبكي (Layer 2)",
    difficulty: "متقدم",
    question:
      "ما الخطر الذي يمنعه تفعيل خيار (Enable Anti-ARP Spoofing) في إعدادات الجدار الناري المتقدمة؟",
    options: [
      "منع المهاجم في نفس الشبكة المحلية من ربط عنوان IP البوابة بعنوان MAC الخاص بجهازه للتنصت على البيانات",
      "منع بطارية اللابتوب من النفاد السريع",
      "منع ملفات Word من الحفظ التلقائي",
      "تسريع سرعة تحميل الملفات من التورنت",
    ],
    answer: 0,
    explanation:
      "هجوم انتحال ARP (ARP Poisoning) يخدع أجهزة الشبكة لترسل بياناتها للمهاجم بدلًا من الراوتر (هجوم الرجل في المنتصف داخل الشبكة المحلية). ميزة Anti-ARP Spoofing تراقب وتمنع التحديثات المزيفة لجدول ARP.",
    keyTakeaway:
      "Anti-ARP Spoofing يحمي الاتصال الداخلي بالراوتر من هجمات الاختراق بالشبكة المحلية.",
  },
  {
    id: 11,
    protocol: "SFTP vs FTPS",
    category: "web_encryption",
    categoryLabel: "بروتوكولات الويب والتشفير",
    portOrLayer: "منفذ 22 (SFTP) vs منفذ 990/21 (FTPS)",
    difficulty: "متوسط",
    question: "ما الفرق المعماري الأساسي بين بروتوكول SFTP وبروتوكول FTPS لنقل الملفات بأمان؟",
    options: [
      "SFTP يعمل كامتداد مبني فوق بروتوكول SSH عبر منفذ واحد (22)، بينما FTPS هو FTP تقليدي محمي بطبقة TLS",
      "FTPS غير مشفر بينما SFTP مشفر فقط",
      "SFTP مخصص للموسيقى فقط بينما FTPS للمستندات",
      "كلاهما يستخدم بروتوكول Telnet القديم في الخلفية",
    ],
    answer: 0,
    explanation:
      "SFTP بروتوكول فرعي مدمج داخل بروتوكول SSH ويستخدم المنفذ 22 حصريًا، بينما FTPS هو نفس بروتوكول FTP القديم متعدد المنافذ ولكن تم تغليفه بطبقة أمان SSL/TLS.",
    keyTakeaway: "SFTP يفضل لسهولة مروره عبر الجدران النارية لاستخدامه منفذًا واحدًا (22).",
  },
  {
    id: 12,
    protocol: "802.1X / RADIUS",
    category: "wireless_auth",
    categoryLabel: "بروتوكولات الأمان اللاسلكي والتوثيق",
    portOrLayer: "Enterprise Access Control",
    difficulty: "متقدم",
    question:
      "في الشبكات اللاسلكية للمؤسسات والشركات (WPA-Enterprise)، ما الدور الذي يلعبه بروتوكول 802.1X مع خادم RADIUS؟",
    options: [
      "مصادقة كل موظف باسم مستخدم وكلمة مرور أو شهادة رقمية مستقلة قبل السماح له بالوصول للشبكة",
      "توليد كلمة سر واحدة مشتركة يعلمها كل زوار المكان",
      "تشفير الكابلات الفيزيائية الممتدة تحت الأرض",
      "حظر متصفحات الإنترنت على كل الأجهزة",
    ],
    answer: 0,
    explanation:
      "يوفر معيار 802.1X مصادقة مركزية (AAA: Authentication, Authorization, Accounting) عبر خادم RADIUS، بحيث يمتلك كل مستخدم حسابًا منفصلًا، مما يلغي خطر تسريب كلمة المرور المشتركة (Pre-Shared Key).",
    keyTakeaway: "المصادقة المركزية تعزل كل مستخدم بحسابه الخاص وتمنع مخاطر الكلمة المشتركة.",
  },
];
