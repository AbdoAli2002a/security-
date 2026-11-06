import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Network, Layers } from "lucide-react";
import { SecurityProtocolsQuiz } from "@/components/security-protocols-quiz";
import { GeneralCourseQuiz } from "@/components/general-course-quiz";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "اختبار بروتوكولات الأمان والمعرفة | مختبر الأمن السيبراني" },
      {
        name: "description",
        content:
          "اختبر معلوماتك التفاعلية في بروتوكولات الأمان السيبراني (TCP/UDP, HTTPS/TLS, SSH, IPsec, WPA3, DNSSEC) وأدوات الحماية المتقدمة مع شريط تقدم تفاعلي وتقارير نتيجة تفصيلية.",
      },
      {
        property: "og:title",
        content: "اختبار بروتوكولات الأمان والمعرفة | مختبر الأمن السيبراني",
      },
      {
        property: "og:description",
        content:
          "اختبار تفاعلي متقدم لبروتوكولات الأمان وأدوات الحماية مع شريط تقدم وتحليل أداء فوري.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizPage,
});

type QuizMode = "protocols" | "general";

function QuizPage() {
  const [mode, setMode] = useState<QuizMode>("protocols");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="text-center">
        <p className="font-latin text-xs font-bold tracking-[0.3em] text-primary">
          INTERACTIVE SECURITY QUIZ
        </p>
        <h1 className="mt-3 text-3xl font-black md:text-4xl">اختبارات الأمان السيبراني</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          اختبر معلوماتك عمليًا في بروتوكولات الأمان والشبكات وأدوات الحماية، مع شريط تقدم مباشر،
          وتحليل فوري للإجابات، وتقارير أداء شاملة.
        </p>

        {/* Quiz Mode Selector Switcher */}
        <div className="mx-auto mt-8 inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-[var(--shadow-card)]">
          <button
            onClick={() => setMode("protocols")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all md:text-sm ${
              mode === "protocols"
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Network className="size-4" />
            اختبار بروتوكولات الأمان (Security Protocols)
          </button>

          <button
            onClick={() => setMode("general")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all md:text-sm ${
              mode === "general"
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Layers className="size-4" />
            اختبار المقرر الشامل (20 سؤالًا)
          </button>
        </div>
      </div>

      {/* Quiz Body */}
      <div className="mt-10">
        {mode === "protocols" ? <SecurityProtocolsQuiz /> : <GeneralCourseQuiz />}
      </div>
    </div>
  );
}
