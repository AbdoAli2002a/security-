import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { lessons } from "@/content/lessons";
import { LessonIcon } from "@/components/lesson-icon";

export const Route = createFileRoute("/lessons/")({
  head: () => ({
    meta: [
      { title: "الدروس | مختبر الأمن السيبراني" },
      {
        name: "description",
        content:
          "كل دروس برامج وأدوات الحماية المتقدمة وإجراءات الأمان للحاسب: كلمات المرور، الصلاحيات، الفيروسات، أدوات الفحص، Avast، COMODO، النسخ الاحتياطي، التشفير، التجزئة، والخلاصة النظرية.",
      },
      { property: "og:title", content: "الدروس | مختبر الأمن السيبراني" },
      {
        property: "og:description",
        content: "دروس تفاعلية كاملة لبرامج وأدوات الحماية وإجراءات الأمان للحاسب.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LessonsIndex,
});

function LessonsIndex() {
  return (
    <div className="hero-glow relative">
      <div className="cyber-grid absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="max-w-2xl">
          <p className="font-latin text-xs font-bold tracking-[0.3em] text-primary">
            COURSE CONTENT
          </p>
          <h1 className="mt-3 text-3xl font-black md:text-4xl">دروس المقرر كاملة</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            عشرة دروس تغطي كل محتوى الملف بالنص الكامل: من كلمات المرور وصلاحيات المستخدمين، إلى
            أدوات الفحص والبرامج الحماية، وانتهاءً بالخلاصة النظرية لمثلث الأمن CIA.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {lessons.map((l, i) => (
            <Link
              key={l.slug}
              to="/lessons/$slug"
              params={{ slug: l.slug }}
              className="panel group flex gap-4 p-6 transition-colors hover:border-primary/40"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                <LessonIcon icon={l.icon} className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h2 className="font-extrabold leading-snug">{l.title}</h2>
                  <span className="font-latin text-[11px] text-muted-foreground">{l.enTitle}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.summary}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {l.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary">
                    الدرس {i + 1}
                    <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
