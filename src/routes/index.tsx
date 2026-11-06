import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PlayCircle,
  ClipboardCheck,
  Gamepad2,
  KeyRound,
  ScanSearch,
  Flame,
  HardDriveDownload,
  Lock,
  FileArchive,
  MonitorCheck,
  Braces,
  Globe,
  ArrowLeft,
  Cpu,
  Code2,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";
import { lessons } from "@/content/lessons";
import { LessonIcon } from "@/components/lesson-icon";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "مختبر الأمن السيبراني | برامج وأدوات الحماية المتقدمة وإجراءات الأمان للحاسب",
      },
      {
        name: "description",
        content:
          "تعلم برامج وأدوات الحماية المتقدمة وإجراءات الأمان للحاسب خطوة بخطوة: كلمات المرور، الصلاحيات، الفحص، الجدار الناري، النسخ الاحتياطي، التشفير والتجزئة — مع أنشطة واختبارات وألعاب تعليمية.",
      },
      { property: "og:title", content: "مختبر الأمن السيبراني | برامج وأدوات الحماية المتقدمة" },
      {
        property: "og:description",
        content:
          "شرح تفصيلي لبرامج وأدوات الحماية وإجراءات الأمان للحاسب مع أنشطة واختبارات وألعاب تعليمية تفاعلية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const tools = [
  {
    name: "Avast",
    en: "Antivirus",
    fn: "مضاد فيروسات: فحص سريع وشامل مع الحجز والإصلاح",
    Icon: Flame,
    href: "/avast",
  },
  {
    name: "COMODO",
    en: "Firewall",
    fn: "جدار ناري: مراقبة الاتصالات وقفل المنافذ",
    Icon: MonitorCheck,
    href: "/comodo",
  },
  {
    name: "Todo Backup",
    en: "Backup",
    fn: "نسخ احتياطي للملفات والنظام واستعادته",
    Icon: HardDriveDownload,
  },
  { name: "Encrypto", en: "Encryption", fn: "تشفير الملفات بكلمة مرور قوية", Icon: Lock },
  {
    name: "VirusTotal",
    en: "Multi-Scan",
    fn: "فحص الملفات عبر أكثر من 70 محركًا في وقت واحد",
    Icon: ScanSearch,
  },
  { name: "Jotti", en: "Malware Scan", fn: "تحقق مزدوج من الملفات المشبوهة", Icon: Globe },
  { name: "7-Zip", en: "Archive & CRC", fn: "ضغط مشفر وحساب قيم التجزئة CRC", Icon: FileArchive },
  {
    name: "IgorWare Hasher",
    en: "Hashing",
    fn: "حساب قيم SHA-1 و MD5 للتأكد من سلامة الملفات",
    Icon: Braces,
  },
  {
    name: "Password Meter",
    en: "Strength Test",
    fn: "اختبار قوة كلمات المرور ومعرفة مستوى الأمان",
    Icon: KeyRound,
  },
];

const features = [
  {
    to: "/activities",
    title: "الأنشطة التطبيقية",
    desc: "خطوات عملية تفاعلية: اختبر كلمة مرور، اضبط صلاحيات ملف، وأنشئ قاعدة جدار ناري — علّم كل خطوة بعد تطبيقها.",
    Icon: ClipboardCheck,
  },
  {
    to: "/quiz",
    title: "اختبار المعرفة",
    desc: "20 سؤالًا متنوعًا يغطي كل دروس الملف، مع شرح للإجابة الصحيحة بعد كل سؤال ونتيجة نهائية.",
    Icon: PlayCircle,
  },
  {
    to: "/games",
    title: "الألعاب التعليمية",
    desc: "طابق الأدوات بوظائفها، وتحمل قرارات الجدار الناري، والعب لعبة الذاكرة بمصطلحات الأمن.",
    Icon: Gamepad2,
  },
];

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-glow relative overflow-hidden">
        <div className="cyber-grid absolute inset-0" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 md:pt-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
              <ShieldCheck className="size-4" />
              إعداد وتقديم / عبدالرحمن علي
            </span>
            <h1 className="mt-5 text-3xl font-black leading-snug md:text-5xl md:leading-tight">
              برامج وأدوات الحماية المتقدمة
              <span className="block text-primary text-glow">وإجراءات الأمان للحاسب</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              هدف البرنامج هو بناء أساس قوي يساعدك على فهم الكمبيوتر واستخدامه باحتراف في الدراسة
              والعمل والحياة اليومية، حيث أصبح أمن المعلومات والذكاء الاصطناعي جزءًا أساسيًا من سوق
              العمل الحديث.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/lessons"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
              >
                ابدأ الدروس
                <ArrowLeft className="size-4" />
              </Link>
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-extrabold transition-colors hover:bg-secondary"
              >
                <PlayCircle className="size-4 text-primary" />
                اختبر معلوماتك
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImg}
              alt="درع رقمي متوهج يحمي حاسوبًا"
              width={1536}
              height={864}
              className="w-full rounded-3xl border border-border shadow-[var(--shadow-card)]"
            />
          </div>
        </div>
      </section>

      {/* مجالات التدريب */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="panel grid gap-6 p-8 md:grid-cols-3">
          <div className="rounded-2xl bg-secondary/50 p-5">
            <Cpu className="mb-3 size-7 text-primary" />
            <h3 className="font-extrabold">مجالات التدريب الرئيسية</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              الهارد وير (Hardware) — السوفت وير (Software)
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/50 p-5">
            <BrainCircuit className="mb-3 size-7 text-primary" />
            <h3 className="font-extrabold">التخصصات التقنية الفرعية</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              أمن المعلومات (Information Security) — الذكاء الاصطناعي (Artificial Intelligence)
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/50 p-5">
            <Code2 className="mb-3 size-7 text-primary" />
            <h3 className="font-extrabold">أساسيات الكمبيوتر والثقافة الرقمية</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Computer &amp; Digital Literacy — الجانبان النظري والتطبيقي لمقرر أمن الحاسب
              والمعلومات
            </p>
          </div>
        </div>
      </section>

      {/* الأدوات */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <SectionTitle kicker="برامج الدورة" title="الأدوات والبرامج التي ستتقنها" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => {
            const cardInner = (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                      <t.Icon className="size-5.5" />
                    </span>
                    <div>
                      <h3 className="font-latin font-bold" dir="ltr">
                        {t.name}
                      </h3>
                      <p className="font-latin text-[11px] tracking-widest text-muted-foreground">
                        {t.en.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  {t.href && (
                    <span className="rounded-md bg-orange-600/20 px-2 py-0.5 text-[11px] font-bold text-orange-400">
                      محاكي تفاعلي
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.fn}</p>
                {t.href && (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-400 group-hover:underline">
                    فتح محاكي Avast بكامل الأدوات ←
                  </span>
                )}
              </>
            );

            return t.href ? (
              <Link
                key={t.name}
                to={t.href}
                className="panel group p-5 transition-colors hover:border-orange-500/40 flex flex-col justify-between"
              >
                {cardInner}
              </Link>
            ) : (
              <div
                key={t.name}
                className="panel group p-5 transition-colors hover:border-primary/40"
              >
                {cardInner}
              </div>
            );
          })}
        </div>
      </section>

      {/* الدروس */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex items-end justify-between gap-4">
          <SectionTitle kicker="مخطط الدروس" title="دروس تفاعلية بالنص الكامل" />
          <Link
            to="/lessons"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-primary hover:underline sm:inline-flex"
          >
            كل الدروس
            <ArrowLeft className="size-4" />
          </Link>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lessons.slice(0, 6).map((l) => (
            <LessonCard
              key={l.slug}
              slug={l.slug}
              order={l.order}
              title={l.title}
              en={l.enTitle}
              icon={l.icon}
              summary={l.summary}
            />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/lessons"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary"
          >
            كل الدروس
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </section>

      {/* الأنشطة والاختبارات والألعاب */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <SectionTitle kicker="تعلّم وتسلّى" title="أنشطة واختبارات وألعاب تعليمية" />
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="panel group relative overflow-hidden p-6 transition-colors hover:border-primary/40"
            >
              <span className="absolute -left-8 -top-8 size-28 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <f.Icon className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="font-latin text-xs font-bold tracking-[0.3em] text-primary">{kicker}</p>
      <h2 className="mt-2 text-2xl font-black md:text-3xl">{title}</h2>
    </div>
  );
}

export function LessonCard({
  slug,
  order,
  title,
  en,
  icon,
  summary,
}: {
  slug: string;
  order: string;
  title: string;
  en: string;
  icon: string;
  summary: string;
}) {
  return (
    <Link
      to="/lessons/$slug"
      params={{ slug }}
      className="panel group flex flex-col p-6 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
          <LessonIcon icon={icon} className="size-5.5" />
        </span>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">
          {order}
        </span>
      </div>
      <h3 className="mt-4 font-extrabold leading-snug">{title}</h3>
      <p className="mt-1 font-latin text-xs text-muted-foreground">{en}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>
    </Link>
  );
}
