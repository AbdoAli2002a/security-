import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Lock,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Shield,
  ArrowRight,
} from "lucide-react";
import { StepChecklist } from "@/components/lesson-blocks";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "الأنشطة التطبيقية | مختبر الأمن السيبراني" },
      {
        name: "description",
        content:
          "أنشطة عملية تفاعلية من مقرر أمن الحاسب: اختبار قوة كلمة المرور عبر Password Meter، صلاحيات الملفات، إظهار الملفات المخفية، قواعد الجدار الناري، النسخ الاحتياطي، والتجزئة.",
      },
      { property: "og:title", content: "الأنشطة التطبيقية | مختبر الأمن السيبراني" },
      {
        property: "og:description",
        content: "خطوات عملية تفاعلية لتطبيق إجراءات الأمان بنفسك مع تتبع التقدم.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Activities,
});

interface Activity {
  id: string;
  title: string;
  en: string;
  icon: "meter" | "perm" | "hidden" | "firewall" | "backup" | "hash";
  steps: string[];
}

const activities: Activity[] = [
  {
    id: "password-meter",
    title: "اختبار قوة كلمة المرور — Password Meter",
    en: "The Password Meter",
    icon: "meter",
    steps: [
      "نقوم بفتح متصفح الإنترنت.",
      "ندخل على موقع Password Meter.",
      "نضغط داخل مربع إدخال كلمة المرور.",
      "نقوم بكتابة كلمة المرور المراد اختبارها.",
      "نلاحظ شريط التقييم الظاهر أسفل مربع الإدخال.",
      "نقرأ نتيجة الاختبار سواء كانت ضعيفة أو متوسطة أو قوية.",
      "نقوم بتعديل كلمة المرور بإضافة حروف وأرقام ورموز لزيادة القوة.",
    ],
  },
  {
    id: "file-permissions",
    title: "تحديد صلاحيات أي ملف",
    en: "File Permissions",
    icon: "perm",
    steps: [
      "اضغط كلك يمين على الملف أو المجلد.",
      "نختار Properties (Alt أو دبل كلك معًا).",
      "اضغط على تبويب Security.",
      "نختار اسم المستخدم.",
      "حدد الصلاحيات المطلوبة مثل Read أو Write أو Full Control.",
      "اضغط على Apply.",
      "اضغط على OK لحفظ الإعدادات.",
    ],
  },
  {
    id: "change-permissions",
    title: "إعطاء وتغيير صلاحيات الوصول للمستخدمين",
    en: "Edit Permissions",
    icon: "perm",
    steps: [
      "فتح خصائص الملف.",
      "الدخول إلى تبويب Security.",
      "الضغط على Edit.",
      "اختيار المستخدم المطلوب.",
      "تفعيل أو إلغاء الصلاحيات حسب المطلوب.",
      "الضغط على Apply ثم OK.",
    ],
  },
  {
    id: "hidden-files",
    title: "إظهار الملفات المخفية باستخدام File Explorer",
    en: "Hidden Items",
    icon: "hidden",
    steps: [
      "فتح File Explorer.",
      "اضغط على View من الشريط العلوي.",
      "تفعيل خيار Hidden items.",
      "تظهر الملفات المخفية على الجهاز.",
    ],
  },
  {
    id: "comodo-rule",
    title: "قاعدة منع منفذ في COMODO Firewall",
    en: "Global Rules",
    icon: "firewall",
    steps: [
      "فتح الإعدادات: اضغط على أيقونة الترس (Settings).",
      "قواعد الشبكة: اختر Firewall ثم Global Rules.",
      "إضافة قاعدة: اضغط على زر Add في الأسفل.",
      "ضبط المنع: اجعل الخيار Action هو Block والبروتوكول TCP or UDP.",
      "تحديد المنفذ: في تبويب Destination Port اختر A Single Port وأدخل رقم المنفذ.",
      "الحفظ: اضغط OK لتطبيق القاعدة وتنشيط الحماية.",
    ],
  },
  {
    id: "todo-backup",
    title: "النسخة الاحتياطية — Todo Backup",
    en: "Todo Backup",
    icon: "backup",
    steps: [
      "فتح برنامج Todo Backup.",
      "اختيار Backup.",
      "تحديد الملفات أو النظام.",
      "اختيار مكان حفظ النسخة الاحتياطية.",
      "بدء عملية النسخ.",
      "التأكد من نجاح النسخة الاحتياطية.",
    ],
  },
  {
    id: "hashing",
    title: "التجزئة — 7-Zip و IgorWare Hasher",
    en: "Hashing",
    icon: "hash",
    steps: [
      "كلك يمين على الملف واختيار Add to archive.",
      "إدخال كلمة مرور وإنشاء الملف المضغوط المشفر.",
      "فتح برنامج IgorWare Hasher.",
      "اختيار الملف.",
      "توليد قيمة Hash.",
      "استخدام القيمة لاحقًا للتأكد من سلامة الملف.",
    ],
  },
];

function Activities() {
  const [progress, setProgress] = useState<Record<string, boolean[]>>({});
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cyberlab-activities");
      if (raw) setProgress(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const save = (next: Record<string, boolean[]>) => {
    setProgress(next);
    try {
      localStorage.setItem("cyberlab-activities", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const toggle = (id: string, count: number, index: number) => {
    const current = progress[id] ?? Array(count).fill(false);
    const next = [...current];
    next[index] = !next[index];
    save({ ...progress, [id]: next });
  };

  const resetActivity = (id: string, count: number) => {
    save({ ...progress, [id]: Array(count).fill(false) });
    setResetKey((k) => k + 1);
  };

  return (
    <div className="hero-glow relative">
      <div className="cyber-grid absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-4 py-14">
        <div className="max-w-2xl">
          <p className="font-latin text-xs font-bold tracking-[0.3em] text-primary">HANDS-ON</p>
          <h1 className="mt-3 text-3xl font-black md:text-4xl">الأنشطة التطبيقية</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            طبّق كل خطوة بنفسك على جهازك، ثم علّمها هنا — تقدمك يُحفظ تلقائيًا في هذا المتصفح. ابدأ
            بأول نشاط: مختبر قوة كلمات المرور التفاعلي في الأسفل.
          </p>
        </div>

        {/* كارت محاكي Avast التفاعلي */}
        <div className="panel mt-8 p-6 md:p-8 border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-card to-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30 shadow-md">
                <Shield className="size-6 text-orange-500" />
              </span>
              <div>
                <span className="rounded-md bg-orange-600/20 px-2 py-0.5 text-[11px] font-bold text-orange-400">
                  محاكي عملي حصري
                </span>
                <h2 className="mt-1 text-xl font-extrabold text-white">
                  محاكي برنامج Avast Antivirus التفاعلي
                </h2>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  تطبيق تفاعلي يحاكي جميع أدوات برنامج Avast: الفحص السريع والكامل، دروع الحماية،
                  وإجراءات التعامل مع التهديدات (الحجز، الإصلاح، الحذف)، وصندوق الرمل.
                </p>
              </div>
            </div>

            <Link
              to="/avast"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs md:text-sm font-extrabold text-white shadow-lg shadow-orange-600/25 transition-transform hover:scale-105"
            >
              فتح المحاكي بكامل الأدوات
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* كارت محاكي COMODO Firewall التفاعلي */}
        <div className="panel mt-4 p-6 md:p-8 border-red-500/30 bg-gradient-to-r from-red-950/20 via-card to-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 shadow-md">
                <Lock className="size-6 text-red-500" />
              </span>
              <div>
                <span className="rounded-md bg-red-600/20 px-2 py-0.5 text-[11px] font-bold text-red-400">
                  محاكي جدار ناري تفاعلي
                </span>
                <h2 className="mt-1 text-xl font-extrabold text-white">
                  محاكي الجدار الناري COMODO Firewall
                </h2>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  أنشئ قواعد منع المنافذ (Block Ports)، وتحكم في صلاحيات البرامج، وجرب أوضاع الحماية
                  (Safe Mode, Training, Block All)، واختبر صد هجمات مسح المنافذ وPing.
                </p>
              </div>
            </div>

            <Link
              to="/comodo"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs md:text-sm font-extrabold text-white shadow-lg shadow-red-600/25 transition-transform hover:scale-105"
            >
              فتح محاكي COMODO الآن
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* مختبر كلمة المرور */}
        <PasswordLab />

        {/* قوائم الخطوات */}
        <div className="mt-12 space-y-8">
          {activities.map((a) => {
            const done = progress[a.id] ?? Array(a.steps.length).fill(false);
            const completed = done.filter(Boolean).length;
            return (
              <section key={a.id}>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <ClipboardCheck className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-extrabold">{a.title}</h2>
                    <p className="font-latin text-[11px] tracking-widest text-muted-foreground">
                      {a.en}
                    </p>
                  </div>
                  {completed === a.steps.length && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-3 py-1 text-xs font-bold text-success">
                      <ShieldCheck className="size-3.5" />
                      مكتمل
                    </span>
                  )}
                </div>
                <StepChecklist
                  key={`${a.id}-${resetKey}`}
                  steps={a.steps}
                  checked={done}
                  onToggle={(i) => toggle(a.id, a.steps.length, i)}
                />
                <div className="mt-2 flex justify-start">
                  <button
                    onClick={() => resetActivity(a.id, a.steps.length)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5" />
                    إعادة النشاط
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** نسخة تفاعلية مبسطة من Password Meter المذكورة في الملف */
function scorePassword(pw: string) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 25;
  else score += pw.length * 3;
  if (/[a-z]/.test(pw)) score += 15;
  if (/[A-Z]/.test(pw)) score += 15;
  if (/[0-9]/.test(pw)) score += 15;
  if (/[^A-Za-z0-9]/.test(pw)) score += 20;
  if (pw.length >= 14) score += 10;
  if (/(.)\1{2,}/.test(pw)) score -= 15;
  if (/^(?:password|123456|qwerty|admin)/i.test(pw)) score -= 30;
  return Math.max(0, Math.min(100, score));
}

function labelOf(score: number) {
  if (score >= 80) return { text: "قوية جدًا", cls: "text-success", bar: "bg-success" };
  if (score >= 60) return { text: "قوية", cls: "text-success", bar: "bg-success" };
  if (score >= 40) return { text: "متوسطة", cls: "text-accent", bar: "bg-accent" };
  if (score > 0) return { text: "ضعيفة", cls: "text-destructive", bar: "bg-destructive" };
  return { text: "—", cls: "", bar: "bg-muted" };
}

function PasswordLab() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const score = scorePassword(pw);
  const { text, cls, bar } = labelOf(score);

  const tips: string[] = [];
  if (pw) {
    if (pw.length < 8) tips.push("اجعل الطول 8 خانات على الأقل.");
    if (!/[A-Z]/.test(pw)) tips.push("أضف حرفًا كبيرًا (A-Z).");
    if (!/[0-9]/.test(pw)) tips.push("أضف رقمًا (0-9).");
    if (!/[^A-Za-z0-9]/.test(pw)) tips.push("أضف رمزًا مثل ! @ # $.");
    if (tips.length === 0) tips.push("ممتاز! كلمة المرور هذه تتسم بالتعقيد والتنوع.");
  }

  return (
    <section className="panel mt-10 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Lock className="size-5" />
        </span>
        <div>
          <h2 className="font-extrabold">مختبر قوة كلمة المرور</h2>
          <p className="font-latin text-[11px] tracking-widest text-muted-foreground">
            THE PASSWORD METER
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        جرّب هنا نفس فكرة الموقع المذكور في الملف: اكتب كلمة مرور ولاحظ شريط التقييم ونتيجة
        الاختبار.
      </p>
      <div className="relative mt-5">
        <input
          type={show ? "text" : "password"}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="اكتب كلمة المرور المراد اختبارها…"
          dir="ltr"
          className="w-full rounded-xl border border-input bg-background px-4 py-3 pl-24 font-latin text-sm outline-none transition-colors focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-muted-foreground"
        >
          {show ? "إخفاء" : "إظهار"}
        </button>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm font-bold">
          <span>نتيجة الاختبار:</span>
          <span className={cls}>
            {text} {pw ? `(${score}%)` : ""}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all duration-300 ${bar}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      {tips.length > 0 && (
        <ul className="mt-4 grid gap-2">
          {tips.map((t) => (
            <li
              key={t}
              className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground"
            >
              <ShieldCheck className="size-3.5 shrink-0 text-primary" />
              {t}
            </li>
          ))}
        </ul>
      )}
      {pw && (
        <button
          onClick={() => setPw("")}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Trash2 className="size-3.5" />
          مسح كلمة المرور
        </button>
      )}
    </section>
  );
}
