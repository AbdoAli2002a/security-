import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Dumbbell,
  Sparkles,
  Loader2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ListChecks,
  Plus,
} from "lucide-react";
import { lessons } from "@/content/lessons";
import { generatePractice, type PracticeQuestion } from "@/lib/lesson-practice.functions";

type Stage = "setup" | "loading" | "quiz" | "done";

interface Answered {
  chosen: number;
  correct: boolean;
}

export function LessonPractice() {
  const generateFn = useServerFn(generatePractice);

  const [slug, setSlug] = useState(lessons[0]?.slug ?? "");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicDraft, setTopicDraft] = useState("");
  const [stage, setStage] = useState<Stage>("setup");
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answered[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  const lesson = lessons.find((l) => l.slug === slug);

  const addTopic = (t: string) => {
    const v = t.trim();
    if (!v || topics.includes(v) || topics.length >= 6) return;
    setTopics((prev) => [...prev, v]);
    setTopicDraft("");
  };

  const generate = async () => {
    if (!lesson || topics.length === 0 || stage === "loading") return;
    setError(undefined);
    setStage("loading");
    try {
      const res = await generateFn({ data: { slug: lesson.slug, topics } });
      if (res.error || res.questions.length === 0) {
        setError(res.error ?? "لم تُنشأ أسئلة، حاول مرة أخرى.");
        setStage("setup");
        return;
      }
      setQuestions(res.questions);
      setCurrent(0);
      setAnswers([]);
      setStage("quiz");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
      setStage("setup");
    }
  };

  const answer = (idx: number) => {
    const q = questions[current];
    if (!q || answers[current]) return;
    const next = [...answers];
    next[current] = { chosen: idx, correct: idx === q.answerIndex };
    setAnswers(next);
  };

  const score = answers.filter((a) => a.correct).length;

  const restart = () => {
    setStage("setup");
    setQuestions([]);
    setAnswers([]);
    setCurrent(0);
    setError(undefined);
  };

  if (stage === "setup" || stage === "loading") {
    return (
      <section className="panel mt-12 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border bg-secondary/60 px-6 py-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Dumbbell className="size-5" />
          </span>
          <div>
            <h2 className="font-extrabold">تدريب مخصص بالذكاء الاصطناعي</h2>
            <p className="text-xs text-muted-foreground">
              اختر درسًا والموضوعات التي تريد التدرب عليها، وسيُنشئ لك المساعد أسئلة تدريب من محتوى
              الدرس نفسه.
            </p>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div>
            <label className="mb-2 block text-sm font-bold">١. اختر الدرس</label>
            <div className="flex flex-wrap gap-2">
              {lessons.map((l) => (
                <button
                  key={l.slug}
                  onClick={() => setSlug(l.slug)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                    slug === l.slug
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {l.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              ٢. الموضوعات التي تريد التدرب عليها
            </label>
            <p className="mb-3 text-xs text-muted-foreground">
              اكتب موضوعًا واضغط «إضافة»، أو اختر من اقتراحات الدرس. (حتى 6 موضوعات)
            </p>
            {topics.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {topics.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary"
                  >
                    {t}
                    <button
                      onClick={() => setTopics((prev) => prev.filter((x) => x !== t))}
                      aria-label={`حذف ${t}`}
                      className="text-primary/70 hover:text-primary"
                    >
                      <XCircle className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={topicDraft}
                onChange={(e) => setTopicDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTopic(topicDraft)}
                placeholder={lesson ? `مثال: ${lesson.tags[0] ?? lesson.title}` : "اكتب موضوعًا"}
                className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
              <button
                onClick={() => addTopic(topicDraft)}
                disabled={!topicDraft.trim() || topics.length >= 6}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-4 py-3 text-sm font-bold transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
              >
                <Plus className="size-4" />
                إضافة
              </button>
            </div>
            {lesson && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">اقتراحات الدرس:</span>
                {lesson.tags
                  .filter((t) => !topics.includes(t))
                  .map((t) => (
                    <button
                      key={t}
                      onClick={() => addTopic(t)}
                      className="rounded-full border border-dashed border-border px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      {t}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            onClick={generate}
            disabled={topics.length === 0 || stage === "loading"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01] disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
          >
            {stage === "loading" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {stage === "loading" ? "المساعد يُعدّ أسئلتك…" : "أنشئ أسئلة التدريب"}
          </button>
        </div>
      </section>
    );
  }

  if (stage === "done") {
    return (
      <section className="panel mt-12 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border bg-secondary/60 px-6 py-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ListChecks className="size-5" />
          </span>
          <h2 className="font-extrabold">نتيجة التدريب</h2>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-4xl font-black text-primary">
            {score} / {questions.length}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {score === questions.length
              ? "إجابات كاملة! أتقنت الموضوعات المطلوبة."
              : score >= questions.length / 2
                ? "نتيجة جيدة، راجع الشروحات بالأسفل وأعد المحاولة."
                : "راجع الدرس ثم أعد التدريب لتثبيت المعلومة."}
          </p>
          <div className="mt-6 space-y-4 text-right">
            {questions.map((q, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 text-sm leading-relaxed ${answers[i]?.correct ? "border-primary/40 bg-primary/5" : "border-destructive/40 bg-destructive/10"}`}
              >
                <p className="font-bold">
                  {i + 1}. {q.question}
                </p>
                {!answers[i]?.correct && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    الإجابة الصحيحة:{" "}
                    <span className="font-bold text-primary">{q.options[q.answerIndex]}</span>
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{q.explanation}</p>
              </div>
            ))}
          </div>
          <button
            onClick={restart}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
          >
            <RotateCcw className="size-4" />
            تدريب جديد
          </button>
        </div>
      </section>
    );
  }

  const q = questions[current];
  const answered = answers[current];
  if (!q) return null;

  return (
    <section className="panel mt-12 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Dumbbell className="size-5" />
          </span>
          <div>
            <h2 className="font-extrabold">تدريبك المخصص</h2>
            <p className="text-xs text-muted-foreground">{lesson?.title}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">
          {current + 1} من {questions.length}
        </span>
      </div>

      <div className="px-6 py-6">
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        <p className="text-base font-extrabold leading-relaxed">{q.question}</p>

        <div className="mt-5 grid gap-2.5">
          {q.options.map((opt, i) => {
            const chosen = answered?.chosen === i;
            const isCorrect = i === q.answerIndex;
            let cls = "border-border hover:border-primary/50";
            if (answered) {
              if (isCorrect) cls = "border-primary bg-primary/15";
              else if (chosen) cls = "border-destructive bg-destructive/10";
              else cls = "border-border opacity-60";
            }
            return (
              <button
                key={i}
                onClick={() => answer(i)}
                disabled={!!answered}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-right text-sm font-semibold leading-relaxed transition-colors disabled:cursor-default ${cls}`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-black">
                  {answered ? (
                    isCorrect ? (
                      <CheckCircle2 className="size-4 text-primary" />
                    ) : chosen ? (
                      <XCircle className="size-4 text-destructive" />
                    ) : (
                      i + 1
                    )
                  ) : (
                    i + 1
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-5 space-y-4">
            <div
              className={`rounded-xl border p-4 text-sm leading-relaxed ${answered.correct ? "border-primary/40 bg-primary/10" : "border-destructive/40 bg-destructive/10"}`}
            >
              <p className="font-bold">{answered.correct ? "إجابة صحيحة!" : "إجابة غير صحيحة"}</p>
              <p className="mt-1 text-muted-foreground">{q.explanation}</p>
            </div>
            <button
              onClick={() =>
                current + 1 < questions.length ? setCurrent(current + 1) : setStage("done")
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01]"
            >
              {current + 1 < questions.length ? "السؤال التالي" : "عرض النتيجة"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
