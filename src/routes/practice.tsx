import { createFileRoute } from "@tanstack/react-router";
import { LessonPractice } from "@/components/lesson-practice";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "تدريب مخصص | مختبر الأمن السيبراني" },
      {
        name: "description",
        content: "اختر درسًا والموضوعات التي تريدها، واحصل على أسئلة تدريب مخصصة من محتوى الدرس.",
      },
      { property: "og:title", content: "تدريب مخصص | مختبر الأمن السيبراني" },
      {
        property: "og:description",
        content: "أسئلة تدريب مخصصة بالذكاء الاصطناعي من محتوى دروس الحماية وأمان الحاسب.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="font-latin text-xs font-bold tracking-[0.3em] text-primary">AI PRACTICE</p>
      <h1 className="mt-3 text-3xl font-black md:text-4xl">تدرّب على ما تريد</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        اختر الدرس، وحدد الموضوعات التي تحتاج تقويتها، وسيُنشئ لك المساعد أسئلة اختيار من متعدد مع
        شرح لكل إجابة.
      </p>
      <LessonPractice />
    </div>
  ),
});
