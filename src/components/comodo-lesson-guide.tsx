import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ShieldAlert,
  ShieldCheck,
  Layers,
  Wrench,
  Sliders,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FolderLock,
  Network,
  Cpu,
  Zap,
} from "lucide-react";

interface SectionTab {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: typeof ShieldAlert;
  color: string;
  summary: string;
  badges: string[];
}

const sections: SectionTab[] = [
  {
    id: "basic-view",
    number: "01",
    title: "الواجهة الرئيسية",
    subtitle: "Basic View Overview",
    icon: ShieldAlert,
    color: "from-red-600 to-rose-700",
    summary:
      "شريط التحذير العلوي At Risk وتفعيل الحماية بزر (FIX IT!)، مع وحدات Auto-Containment و HIPS و VirusScope ومراقبة حركة البيانات Inbound/Outbound وتصدي Network Intrusions.",
    badges: ["شريط At Risk", "FIX IT!", "HIPS Safe Mode", "VirusScope"],
  },
  {
    id: "containment",
    number: "02",
    title: "مهام العزل",
    subtitle: "Containment & Sandbox",
    icon: FolderLock,
    color: "from-emerald-600 to-teal-700",
    summary:
      "بيئة التشغيل الافتراضي المعزول (Run Virtual) بالإطار الأخضر، المساحة المشتركة (Shared Space)، إعادة تعيين الحاوية، مراقبة النشاط عبر KillSwitch، وتشغيل سطح المكتب الافتراضي الآمن.",
    badges: ["Run Virtual", "Shared Space", "Reset Container", "KillSwitch"],
  },
  {
    id: "advanced-tasks",
    number: "03",
    title: "المهام المتقدمة",
    subtitle: "Advanced Tasks",
    icon: Wrench,
    color: "from-amber-600 to-orange-700",
    summary:
      "أدوات الإنقاذ والاستجابة للحوادث: إنشاء قرص الإنقاذ الإقلاعي (Rescue Disk)، التنظيف الأمني العميق (CCE)، مدير المهام الأمني، الحجر الصحي (Quarantine)، والسجلات (Logs).",
    badges: ["Rescue Disk", "CCE Cleaner", "Quarantine", "View Logs"],
  },
  {
    id: "firewall-settings",
    number: "04",
    title: "إعدادات الجدار",
    subtitle: "Firewall Settings",
    icon: Sliders,
    color: "from-cyan-600 to-blue-700",
    summary:
      "تفعيل الجدار واختيار الوضع (Safe Mode أو Block All للطوارئ)، تخصيص مدة وتكرار التنبيهات المنبثقة، وتفعيل حماية Anti-ARP Spoofing وتصفية IPv6 وحظر الحزم المجزأة.",
    badges: ["Safe / Block All", "Alert Timeout", "Anti-ARP Spoofing", "IPv6 Filter"],
  },
  {
    id: "rule-setup",
    number: "05",
    title: "إنشاء القواعد",
    subtitle: "Firewall Rule Setup",
    icon: Network,
    color: "from-purple-600 to-indigo-700",
    summary:
      "بناء قواعد الجدار الناري بدقة: تحديد الإجراء (Allow/Block)، البروتوكول (TCP/UDP)، الاتجاه (In/Out)، وتحديد المنافذ وقفل المنفذ المشبوه (مثل 4444) في القواعد العامة.",
    badges: ["Action: Block", "Protocol: TCP/UDP", "Direction: In", "Destination Port"],
  },
  {
    id: "tcp-vs-udp",
    number: "06",
    title: "مقارنة TCP vs UDP",
    subtitle: "Protocol Comparison",
    icon: Zap,
    color: "from-blue-600 to-sky-700",
    summary:
      "تحليل الفروق الجوهرية: بروتوكول TCP عالي الموثوقية وStateful للتصفح والملفات، مقابل UDP فائق السرعة وStateless للألعاب والبث المباشر والمكالمات.",
    badges: ["TCP: موثوق & Stateful", "UDP: سريع & Stateless", "3-Way Handshake"],
  },
  {
    id: "sidebar-sections",
    number: "07",
    title: "القائمة الجانبية",
    subtitle: "Firewall Sections",
    icon: Layers,
    color: "from-slate-600 to-zinc-700",
    summary:
      "التنقل الإداري: إعدادات الجدار، قواعد التطبيقات (Application Rules)، القواعد العامة السيادية (Global Rules)، القوالب الجاهزة (Rulesets)، نطاقات الشبكات (Network Zones)، ومجموعات المنافذ (Portsets).",
    badges: ["Global Rules", "Application Rules", "Rulesets", "Network Zones"],
  },
];

export function ComodoLessonGuide() {
  const [activeTab, setActiveTab] = useState<string>("basic-view");
  const current = sections.find((s) => s.id === activeTab) ?? sections[0];

  return (
    <div className="panel mb-10 overflow-hidden border-red-500/30 bg-gradient-to-b from-card via-card to-red-950/10">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-gradient-to-r from-red-950/40 via-card to-card p-6">
        <div className="flex items-center gap-3.5">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 shadow-md">
            <ShieldCheck className="size-6 text-red-500" />
          </span>
          <div>
            <span className="rounded-md bg-red-600/20 px-2 py-0.5 text-[11px] font-bold text-red-400">
              دليل المفاهيم التفاعلي
            </span>
            <h2 className="mt-1 text-xl font-extrabold text-foreground">
              الأقسام السبعة الأساسية لبرنامج Comodo Internet Security
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              استعرض خصائص الواجهة، أدوات العزل والحماية، مقارنة البروتوكولات، ثم طبقها مباشرة في
              المحاكي العملي.
            </p>
          </div>
        </div>

        <Link
          to="/comodo"
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-red-600/25 transition-transform hover:scale-105 hover:bg-red-500"
        >
          <span>فتح محاكي COMODO الآن</span>
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      {/* Tabs Row */}
      <div className="flex overflow-x-auto border-b border-border bg-secondary/30 p-2 gap-1.5 scrollbar-thin">
        {sections.map((sec) => {
          const isActive = sec.id === activeTab;
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-md font-latin text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-secondary text-primary"
                }`}
              >
                {sec.number}
              </span>
              <Icon className="size-3.5" />
              <span>{sec.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Showcase Box */}
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${current.color} text-white shadow-lg`}
            >
              <current.icon className="size-7" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-latin text-xs font-bold text-red-400">
                  SECTION {current.number}
                </span>
                <span className="font-latin text-xs text-muted-foreground">
                  • {current.subtitle}
                </span>
              </div>
              <h3 className="mt-1 text-lg font-black text-foreground">{current.title}</h3>
              <p className="mt-1.5 text-xs md:text-sm leading-relaxed text-muted-foreground max-w-2xl">
                {current.summary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:max-w-xs justify-end">
            {current.badges.map((b, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-bold text-foreground"
              >
                <CheckCircle2 className="size-3 text-red-500" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
