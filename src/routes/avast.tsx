import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { AvastSimulator } from "@/components/avast-simulator";

export const Route = createFileRoute("/avast")({
  head: () => ({
    meta: [
      { title: "محاكي برنامج Avast Antivirus التفاعلي | مختبر الأمن السيبراني" },
      {
        name: "description",
        content:
          "محاكاة تفاعلية كاملة لبرنامج الحماية ومكافحة الفيروسات Avast بكافة أدواته: أنواع الفحص (Smart, Full, Quick)، دروع الحماية الأساسية، خيارات التعامل مع التهديدات (الحجز، الإصلاح، الحذف)، صندوق الرمل Sandbox، ودرع الفدية.",
      },
      {
        property: "og:title",
        content: "محاكي برنامج Avast Antivirus التفاعلي | مختبر الأمن السيبراني",
      },
      {
        property: "og:description",
        content:
          "محاكي تطبيقي شامل لبرنامج Avast Antivirus بجميع أدوات الفحص والحجز والإصلاح والحذف ودروع الحماية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AvastSimulatorPage,
});

function AvastSimulatorPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <Link
          to="/activities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <ArrowRight className="size-3.5" />
          العودة للأنشطة التطبيقية
        </Link>
        <div className="mt-3">
          <p className="font-latin text-xs font-bold tracking-[0.3em] text-primary">
            SECURITY SOFTWARE LAB
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            محاكي مضاد الفيروسات Avast Antivirus
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base max-w-3xl">
            جرّب واجهة وأدوات برنامج Avast كما تم شرحها في مقرر أمن الحاسب: قُم بتشغيل الفحص السريع
            والكامل، ومارس الإجراءات الثلاثة الأساسية عند اكتشاف الفيروسات (الحجز في Virus Chest،
            الإصلاح، أو الحذف النهائي)، واكتشف أدوات الحماية المتقدمة مثل صندوق الرمل (Sandbox).
          </p>
        </div>
      </div>

      <AvastSimulator />
    </div>
  );
}
