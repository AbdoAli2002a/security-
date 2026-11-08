import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { AvastRescueSimulator } from "@/components/avast-rescue-simulator";

export const Route = createFileRoute("/avast-rescue")({
  head: () => ({
    meta: [
      {
        title: "محاكي أسطوانة الإنقاذ Avast Rescue Disk ISO التفاعلي | مختبر الأمن السيبراني",
      },
      {
        name: "description",
        content:
          "محاكاة تفاعلية شاملة لأسطوانة الإنقاذ Avast Rescue Disk (CD ISO): فحص قطاعات الإقلاع MBR، استئصال فيروسات الفدية والـ Rootkits من خارج نظام التشغيل، صندوق الفيروسات المنفصل، واسترجاع الملفات إلى فلاشة USB.",
      },
      {
        property: "og:title",
        content: "محاكي أسطوانة الإنقاذ Avast Rescue Disk ISO التفاعلي | مختبر الأمن السيبراني",
      },
      {
        property: "og:description",
        content:
          "محاكي عملي تفصيلي لأسطوانة الإنقاذ Avast Rescue CD/USB ISO لتطهير الحواسيب المعطلة وتصحيح قطاعات الإقلاع MBR ومكافحة برمجيات الفدية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AvastRescueSimulatorPage,
});

function AvastRescueSimulatorPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <div className="mb-8">
        <Link
          to="/activities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <ArrowRight className="size-3.5" />
          العودة للأنشطة التطبيقية
        </Link>
        <div className="mt-3">
          <p className="font-latin text-xs font-bold tracking-[0.3em] text-orange-400">
            BOOT-TIME DISINFECTION & RESCUE LAB
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl text-foreground">
            محاكي أسطوانة الإنقاذ Avast Rescue Disk (CD/USB ISO)
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base max-w-3xl">
            بيئة إقلاع حية متطورة (Avast WinPE Rescue Environment) مخصصة لتطهير الحواسيب التي تعجز
            عن بدء تشغيل الويندوز نتيجة إصابة قطاعات الإقلاع MBR بـ Rootkit أو قفلها ببرمجيات
            الفدية. تمكّنك أسطوانة Avast Rescue من تشغيل محرك الفحص دون تشغيل ملفات النظام المصابة،
            وإصلاح سجلات الإقلاع، وحجز التهديدات في Virus Chest، وإنقاذ مشروعات التخرج إلى فلاشة USB
            خارجية.
          </p>
        </div>
      </div>

      <AvastRescueSimulator />
    </div>
  );
}
