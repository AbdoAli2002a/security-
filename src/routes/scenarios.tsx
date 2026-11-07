import { createFileRoute } from "@tanstack/react-router";
import { ScenariosChallenge } from "@/components/scenarios-challenge";

export const Route = createFileRoute("/scenarios")({
  head: () => ({
    meta: [
      {
        title: "سيناريوهات ومشكلات أمنية واقعية | مختبر الأمن السيبراني",
      },
      {
        name: "description",
        content:
          "تحديات تفكير وحل مشكلات سيبرانية واقعية تغطي كافة موضوعات مقرر أمن الحاسب: كلمات مرور BIOS، صلاحيات المستخدمين، الفيروسات والملفات المخفية، أدوات الفحص، Avast، جدار COMODO، النسخ الاحتياطي Todo Backup، التشفير Encrypto، والتجزئة Hashing.",
      },
      {
        property: "og:title",
        content: "سيناريوهات ومشكلات أمنية واقعية | مختبر الأمن السيبراني",
      },
      {
        property: "og:description",
        content:
          "حل مشكلات وحوادث أمنية واقعية مستمدة من محتوى ودروس الموقع مع تحليل أمني شامل وروابط للدروس والمحاكيات.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScenariosPage,
});

function ScenariosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <ScenariosChallenge />
    </div>
  );
}
