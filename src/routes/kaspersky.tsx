import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { KasperskySimulator } from "@/components/kaspersky-simulator";

export const Route = createFileRoute("/kaspersky")({
  head: () => ({
    meta: [
      {
        title: "محاكي أسطوانة الإنقاذ Kaspersky Rescue Disk ISO التفاعلي | مختبر الأمن السيبراني",
      },
      {
        name: "description",
        content:
          "محاكاة تفاعلية شاملة لأسطوانة الإنقاذ Kaspersky Rescue Disk (CD ISO): فحص قطاعات الإقلاع MBR و EFI، تطهير برمجيات الـ Rootkit، محرر الريجستري المستقل لإصلاح هجمات قفل الشاشة والفدية، مستكشف الملفات لإنقاذ البيانات، ومحطة الأوامر.",
      },
      {
        property: "og:title",
        content: "محاكي أسطوانة الإنقاذ Kaspersky Rescue Disk ISO التفاعلي | مختبر الأمن السيبراني",
      },
      {
        property: "og:description",
        content:
          "محاكي عملي شامل لأسطوانة الإنقاذ كاسبرسكي بكل الأدوات والميزات: شاشة الإقلاع Syslinux، محرك فحص الكائنات، محرر ريجستري الويندوز المستقل، مستكشف إنقاذ الملفات، ومحطة أوامر لينكس.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KasperskySimulatorPage,
});

function KasperskySimulatorPage() {
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
          <p className="font-latin text-xs font-bold tracking-[0.3em] text-emerald-400">
            SYSTEM DISINFECTION & RESCUE LAB
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl text-foreground">
            محاكي أسطوانة الإنقاذ Kaspersky Rescue Disk (ISO)
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base max-w-3xl">
            بيئة إقلاع حية (Live Gentoo Linux) مخصصة لإنقاذ وتطهير أجهزة الكمبيوتر عندما يتعذر إقلاع
            الويندوز بسبب البرمجيات الخبيثة العميقة (Rootkits / Bootkits) أو هجمات قفل الشاشة
            وفيروسات الفدية. تتيح لك الأسطوانة فحص قطاعات الإقلاع MBR، واستخدام محرر الريجستري
            المستقل لإصلاح مفاتيح Winlogon، وإنقاذ مشروعات التخرج والملفات عبر مستكشف الملفات
            المدمج.
          </p>
        </div>
      </div>

      <KasperskySimulator />
    </div>
  );
}
