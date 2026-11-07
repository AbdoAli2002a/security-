import { createFileRoute } from "@tanstack/react-router";
import { DigitalTwinDashboard } from "@/components/digital-twin/digital-twin-dashboard";

export const Route = createFileRoute("/digital-twin")({
  head: () => ({
    meta: [
      {
        title: "التوأم الرقمي للمتعلم والوكيل الذكي | مختبر الأمن السيبراني",
      },
      {
        name: "description",
        content:
          "نظام التوأم الرقمي للمتعلم والوكيل الذكي المتكيف بقسم تكنولوجيا التعليم: نمذجة إدراكية حية للأبعاد الخمسة، رادار الفجوات والمفاهيم البديلة، محاكاة تنبؤية للتوأم، ومحادثة ذكية مع د. سايبر.",
      },
      {
        property: "og:title",
        content: "التوأم الرقمي للمتعلم والوكيل الذكي | مختبر الأمن السيبراني",
      },
      {
        property: "og:description",
        content:
          "نمذجة إدراكية حية للأبعاد الخمسة، رادار المفاهيم البديلة، محاكاة تنبؤية، وتشخيص معرفي ذكي مع د. سايبر.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DigitalTwinPage,
});

function DigitalTwinPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <DigitalTwinDashboard />
    </div>
  );
}
