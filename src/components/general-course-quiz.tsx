import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowLeft,
  Lightbulb,
  Clock,
  Sparkles,
} from "lucide-react";
import { quizQuestions } from "@/content/quiz-data";
import { gameFacts } from "@/content/games-data";

export function GeneralCourseQuiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = quizQuestions[current]!;
  const total = quizQuestions.length;

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (current + 1 >= total) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / total) * 100);
    const grade =
      pct >= 90
        ? { text: "خبير أمن سيبراني! 🏆", cls: "text-success" }
        : pct >= 70
          ? { text: "ممتاز — أنت محمي جيدًا! 🛡️", cls: "text-success" }
          : pct >= 50
            ? { text: "جيد — راجع الدروس مرة أخرى 📘", cls: "text-accent" }
            : { text: "تحتاج للمزيد — ابدأ من درس كلمات المرور 📗", cls: "text-destructive" };
    const fact = gameFacts[score % gameFacts.length];

    return (
      <div className="panel relative mx-auto max-w-xl p-8 text-center md:p-12">
        <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-primary/15 text-primary shadow-[var(--shadow-glow)]">
          <Trophy className="size-10" />
        </span>
        <h2 className="mt-6 text-3xl font-black">انتهى الاختبار الشامل!</h2>
        <p className="mt-4 font-latin text-5xl font-bold text-glow tabular-nums">
          {score} <span className="text-xl text-muted-foreground">/ {total}</span>
        </p>
        <p className={`mt-3 text-lg font-extrabold ${grade.cls}`}>{grade.text}</p>
        <div className="panel mt-8 p-5 text-sm leading-relaxed text-right">
          <span className="inline-flex items-center gap-2 font-bold text-primary">
            <Lightbulb className="size-4" />
            معلومة تُحفظ معك
          </span>
          <p className="mt-2 text-muted-foreground">{fact}</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
          >
            <RotateCcw className="size-4" />
            إعادة الاختبار
          </button>
          <Link
            to="/lessons"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-extrabold transition-colors hover:bg-secondary"
          >
            مراجعة الدروس
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  const isCorrect = selected === q.answer;
  const progressPercent = Math.round(((current + (selected !== null ? 1 : 0)) / total) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress Bar & Real-time Score Feedback Header */}
      <div className="panel mb-6 p-5">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">السؤال</span>
            <span className="font-latin text-base text-foreground tabular-nums">{current + 1}</span>
            <span className="text-muted-foreground">من {total}</span>
            <span aria-hidden className="text-border">
              |
            </span>
            <span className="font-latin text-primary tabular-nums">{progressPercent}%</span>
          </div>
          <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-primary">
            النقاط الحالية: <strong className="font-latin tabular-nums">{score}</strong>
          </span>
        </div>

        {/* Progress Bar */}
        <div
          className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary shadow-[0_0_12px_oklch(0.84_0.14_195_/_40%)] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="panel p-6 md:p-8">
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
          {q.topic}
        </span>
        <h2 className="mt-4 text-lg font-extrabold leading-relaxed md:text-xl">{q.question}</h2>

        <div className="mt-6 grid gap-2.5">
          {q.options.map((opt, i) => {
            const chosen = selected === i;
            const isAnswer = i === q.answer;
            let cls = "border-border bg-secondary/40 hover:border-primary/50";
            if (selected !== null) {
              if (isAnswer) cls = "border-success bg-success/15";
              else if (chosen) cls = "border-destructive bg-destructive/15";
              else cls = "border-border opacity-60";
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={selected !== null}
                className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-right text-sm font-semibold leading-relaxed transition-all ${cls}`}
              >
                <span>{opt}</span>
                {selected !== null && isAnswer && (
                  <CheckCircle2 className="size-5 shrink-0 text-success" />
                )}
                {selected !== null && chosen && !isAnswer && (
                  <XCircle className="size-5 shrink-0 text-destructive" />
                )}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div
            className={`mt-5 rounded-2xl border p-5 ${
              isCorrect ? "border-success/30 bg-success/10" : "border-accent/40 bg-accent/10"
            }`}
          >
            <p className="font-extrabold text-sm md:text-base">
              {isCorrect ? "إجابة صحيحة! ✅" : "إجابة غير صحيحة — إليك الشرح:"}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{q.explanation}</p>
            <button
              onClick={next}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
            >
              {current + 1 >= total ? "عرض النتيجة النهائية" : "السؤال التالي"}
              <ArrowLeft className="size-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="size-4 text-primary" />
        راجع الدروس في أي وقت إذا احتجت مساعدة في أي سؤال.
      </div>
    </div>
  );
}
