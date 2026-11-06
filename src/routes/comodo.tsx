import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ComodoSimulator } from "@/components/comodo-simulator";

export const Route = createFileRoute("/comodo")({
  head: () => ({
    meta: [
      { title: "محاكي الجدار الناري COMODO Firewall التفاعلي | مختبر الأمن السيبراني" },
      {
        name: "description",
        content:
          "محاكاة تفاعلية شاملة لبرنامج الجدار الناري COMODO Firewall: قواعد التطبيقات (Application Rules)، القواعد العامة وحظر المنافذ (Global Rules)، أوضاع الحماية (Safe Mode, Training, Block All)، وإخفاء المنافذ (Stealth Ports).",
      },
      {
        property: "og:title",
        content: "محاكي الجدار الناري COMODO Firewall التفاعلي | مختبر الأمن السيبراني",
      },
      {
        property: "og:description",
        content:
          "محاكي عملي تفصيلي للجدار الناري COMODO Firewall لضبط قواعد الاتصالات الشبكية وقفل المنافذ والتصدي للهجمات.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComodoSimulatorPage,
});

function ComodoSimulatorPage() {
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
          <p className="font-latin text-xs font-bold tracking-[0.3em] text-red-400">
            NETWORK FIREWALL LAB
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            محاكي الجدار الناري COMODO Firewall
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base max-w-3xl">
            تحكم في حركة مرور البيانات الصادرة والواردة، وأنشئ قواعد منع المنافذ (Block Ports)
            للبروتوكولات TCP و UDP و ICMP، واختبر مستويات الأمان (Safe Mode و Training Mode و Block
            All)، وشاهد صد الهجمات اللحظي في سجلات الجدار الناري.
          </p>
        </div>
      </div>

      <ComodoSimulator />
    </div>
  );
}
