import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Flame,
  Network,
  Lock,
  Layers,
  Radio,
  Clock,
  Sparkles,
  ChevronDown,
  Filter,
} from "lucide-react";
import {
  securityProtocolQuestions,
  protocolCategoryLabels,
  type ProtocolQuestion,
  type ProtocolCategory,
} from "@/content/security-protocols-data";

interface UserAnswer {
  questionId: number;
  selectedIndex: number;
  isCorrect: boolean;
}

export function SecurityProtocolsQuiz() {
  const [selectedCategory, setSelectedCategory] = useState<ProtocolCategory | "all">("all");
  const [questionPool, setQuestionPool] = useState<ProtocolQuestion[]>(
    () => securityProtocolQuestions,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong">("all");

  // Filter pool based on selected category
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === "all") return securityProtocolQuestions;
    return securityProtocolQuestions.filter((q) => q.category === selectedCategory);
  }, [selectedCategory]);

  // Reset or start quiz
  const startQuiz = (questions: ProtocolQuestion[]) => {
    setQuestionPool(questions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setIsFinished(false);
    setStreak(0);
    setMaxStreak(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
  };

  useEffect(() => {
    startQuiz(filteredQuestions);
  }, [filteredQuestions]);

  // Timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  const currentQ = questionPool[currentIndex];
  const total = questionPool.length;

  const currentAnswered = userAnswers.find((a) => a.questionId === currentQ?.id);

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null || currentAnswered) return;

    setSelectedOption(index);
    const correct = index === currentQ.answer;

    if (correct) {
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
    } else {
      setStreak(0);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedIndex: index,
        isCorrect: correct,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      setIsFinished(true);
    } else {
      setCurrentIndex((c) => c + 1);
      setSelectedOption(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
      const prevAnswer = userAnswers.find(
        (a) => a.questionId === questionPool[currentIndex - 1]?.id,
      );
      setSelectedOption(prevAnswer !== undefined ? prevAnswer.selectedIndex : null);
    }
  };

  const handleJumpTo = (idx: number) => {
    setCurrentIndex(idx);
    const ans = userAnswers.find((a) => a.questionId === questionPool[idx]?.id);
    setSelectedOption(ans !== undefined ? ans.selectedIndex : null);
  };

  const handleRetryWrongOnly = () => {
    const wrongIds = new Set(userAnswers.filter((a) => !a.isCorrect).map((a) => a.questionId));
    const wrongQuestions = securityProtocolQuestions.filter((q) => wrongIds.has(q.id));
    if (wrongQuestions.length > 0) {
      startQuiz(wrongQuestions);
    }
  };

  const handleRestartFull = () => {
    startQuiz(filteredQuestions);
  };

  // Score calculations
  const correctCount = userAnswers.filter((a) => a.isCorrect).length;
  const answeredCount = userAnswers.length;
  const progressPercent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const currentAccuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Performance category analysis
  const categoryStats = useMemo(() => {
    const stats: Record<ProtocolCategory, { total: number; correct: number; label: string }> = {
      transport: { total: 0, correct: 0, label: protocolCategoryLabels.transport },
      web_encryption: { total: 0, correct: 0, label: protocolCategoryLabels.web_encryption },
      firewall_rules: { total: 0, correct: 0, label: protocolCategoryLabels.firewall_rules },
      wireless_auth: { total: 0, correct: 0, label: protocolCategoryLabels.wireless_auth },
    };

    userAnswers.forEach((ans) => {
      const q = securityProtocolQuestions.find((item) => item.id === ans.questionId);
      if (q) {
        stats[q.category].total += 1;
        if (ans.isCorrect) stats[q.category].correct += 1;
      }
    });

    return stats;
  }, [userAnswers]);

  // Finished view
  if (isFinished) {
    const finalPct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const rating =
      finalPct >= 90
        ? {
            title: "خبير بروتوكولات الأمان السيبراني 🛡️",
            desc: "فهم استثنائي لمصافحات TCP والتشفير وحماية الجدران النارية والبروتوكولات اللاسلكية.",
            badgeCls: "text-success border-success/30 bg-success/10",
          }
        : finalPct >= 70
          ? {
              title: "مهندس دفاع شبكات متمكن ⚡",
              desc: "إلمام قوي بأهم بروتوكولات الحماية والمنافذ، مع بعض النقاط التي تستحق المراجعة.",
              badgeCls: "text-primary border-primary/30 bg-primary/10",
            }
          : finalPct >= 50
            ? {
                title: "ممارس أمان شبكي 📘",
                desc: "لديك أساس جيد، لكن تحتاج للتركيز على الفروق الدقيقة مثل فحص الحالة والتشفير.",
                badgeCls: "text-accent border-accent/30 bg-accent/10",
              }
            : {
                title: "متدرب واعد في أمن المعلومات 💡",
                desc: "يُنصح بإعادة قراءة دروس الجدار الناري والتشفير والتدرب على مصافحات البروتوكولات.",
                badgeCls: "text-destructive border-destructive/30 bg-destructive/10",
              };

    const wrongAnswers = userAnswers.filter((a) => !a.isCorrect);

    return (
      <div className="mx-auto max-w-4xl py-6">
        {/* Card header */}
        <div className="panel relative overflow-hidden p-8 text-center md:p-12">
          <div className="absolute -left-12 -top-12 size-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 size-40 rounded-full bg-success/10 blur-3xl" />

          <span className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[var(--shadow-glow)]">
            <Trophy className="size-10" />
          </span>

          <h2 className="mt-6 text-2xl font-black md:text-3xl">نتيجة اختبار بروتوكولات الأمان</h2>

          {/* Large tabular score */}
          <div className="mt-4 flex items-baseline justify-center gap-2">
            <span className="font-latin text-6xl font-black text-primary text-glow tabular-nums">
              {finalPct}%
            </span>
            <span className="text-sm font-bold text-muted-foreground">
              ({correctCount} من {total} إجابة صحيحة)
            </span>
          </div>

          <div
            className={`mx-auto mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold ${rating.badgeCls}`}
          >
            <span>{rating.title}</span>
          </div>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {rating.desc}
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center">
            <div>
              <p className="text-xs text-muted-foreground">الزمن المستغرق</p>
              <p className="mt-1 font-latin text-lg font-bold tabular-nums">
                {formatTime(elapsedSeconds)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">أعلى سلسلة إجابات</p>
              <p className="mt-1 flex items-center justify-center gap-1 font-latin text-lg font-bold text-accent tabular-nums">
                <Flame className="size-4" />
                {maxStreak}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">مستوى الدقة</p>
              <p className="mt-1 font-latin text-lg font-bold text-success tabular-nums">
                {finalPct}%
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Category Breakdown Feedback */}
        <div className="panel mt-6 p-6 md:p-8">
          <h3 className="text-lg font-extrabold">تحليل الأداء حسب تصنيف البروتوكولات</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            يوضح هذا التقرير مدى تمكنك من كل مجال من مجالات بروتوكولات الأمان:
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(
              Object.entries(categoryStats) as [
                ProtocolCategory,
                (typeof categoryStats)[ProtocolCategory],
              ][]
            ).map(([catKey, catData]) => {
              const catPct =
                catData.total > 0 ? Math.round((catData.correct / catData.total) * 100) : 0;
              return (
                <div key={catKey} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground">{catData.label}</span>
                    <span className="font-latin text-primary tabular-nums">
                      {catData.correct} / {catData.total} ({catPct}%)
                    </span>
                  </div>
                  {/* Visual mini progress bar */}
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        catPct >= 80 ? "bg-success" : catPct >= 50 ? "bg-primary" : "bg-destructive"
                      }`}
                      style={{ width: `${catPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Review Section */}
        <div className="panel mt-6 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold">مراجعة الأسئلة والشروحات البروتوكولية</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                راجع إجاباتك بالتفصيل واكتشف القواعد الأمنية لكل بروتوكول:
              </p>
            </div>
            {/* Filter buttons */}
            <div className="flex items-center gap-1 rounded-lg bg-secondary p-1 text-xs font-bold">
              <button
                onClick={() => setReviewFilter("all")}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  reviewFilter === "all"
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                جميع الأسئلة ({total})
              </button>
              <button
                onClick={() => setReviewFilter("wrong")}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  reviewFilter === "wrong"
                    ? "bg-card text-destructive shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                الخاطئة فقط ({wrongAnswers.length})
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {questionPool
              .filter((q) => {
                if (reviewFilter === "all") return true;
                const ans = userAnswers.find((a) => a.questionId === q.id);
                return ans && !ans.isCorrect;
              })
              .map((q, idx) => {
                const userAns = userAnswers.find((a) => a.questionId === q.id);
                const isCorrect = userAns?.isCorrect;
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-5 ${
                      isCorrect
                        ? "border-success/30 bg-success/5"
                        : "border-destructive/30 bg-destructive/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-bold text-primary">{q.protocol}</span>
                          <span aria-hidden>·</span>
                          <span>{q.portOrLayer}</span>
                          <span aria-hidden>·</span>
                          <span>{q.difficulty}</span>
                        </div>
                        <h4 className="mt-2 text-sm font-extrabold leading-relaxed md:text-base">
                          {idx + 1}. {q.question}
                        </h4>
                      </div>
                      <span className="shrink-0">
                        {isCorrect ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-success">
                            <CheckCircle2 className="size-4" /> صحيح
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-destructive">
                            <XCircle className="size-4" /> غير صحيح
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = userAns?.selectedIndex === oIdx;
                        const isRightAnswer = q.answer === oIdx;
                        let itemCls = "border-border bg-card/50 text-muted-foreground";
                        if (isRightAnswer) {
                          itemCls = "border-success bg-success/15 font-bold text-success";
                        } else if (isChosen && !isRightAnswer) {
                          itemCls =
                            "border-destructive bg-destructive/15 font-bold text-destructive line-through";
                        }
                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center justify-between rounded-lg border p-2.5 ${itemCls}`}
                          >
                            <span>{opt}</span>
                            {isRightAnswer && <span>(الإجابة الصحيحة)</span>}
                            {isChosen && !isRightAnswer && <span>(إجابتك)</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-3 rounded-lg border border-border bg-background/50 p-3 text-xs leading-relaxed">
                      <p className="font-bold text-primary">شرح آلية البروتوكول:</p>
                      <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                      <p className="mt-2 border-t border-border/60 pt-2 font-semibold text-accent">
                        💡 {q.keyTakeaway}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleRestartFull}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
          >
            <RotateCcw className="size-4" />
            إعادة الاختبار كاملًا
          </button>

          {wrongAnswers.length > 0 && (
            <button
              onClick={handleRetryWrongOnly}
              className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/15 px-6 py-3 text-sm font-extrabold text-destructive transition-colors hover:bg-destructive/25"
            >
              <RotateCcw className="size-4" />
              إعادة الأسئلة الخاطئة فقط ({wrongAnswers.length})
            </button>
          )}

          <Link
            to="/lessons"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-extrabold transition-colors hover:bg-secondary"
          >
            مراجعة دروس المقرر
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  // If questionPool is empty
  if (!currentQ) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-muted-foreground">لا توجد أسئلة متاحة في هذا التصنيف حاليًا.</p>
        <button
          onClick={() => setSelectedCategory("all")}
          className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground"
        >
          عرض جميع البروتوكولات
        </button>
      </div>
    );
  }

  const isCurrentAnswered = currentAnswered !== undefined || selectedOption !== null;
  const isCorrect = (selectedOption ?? currentAnswered?.selectedIndex) === currentQ.answer;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Category Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 rounded-2xl border border-border bg-card/60 p-1.5">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Layers className="size-3.5" />
          كل البروتوكولات ({securityProtocolQuestions.length})
        </button>
        <button
          onClick={() => setSelectedCategory("transport")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
            selectedCategory === "transport"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Network className="size-3.5" />
          النقل والشبكة
        </button>
        <button
          onClick={() => setSelectedCategory("web_encryption")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
            selectedCategory === "web_encryption"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Lock className="size-3.5" />
          الويب والتشفير
        </button>
        <button
          onClick={() => setSelectedCategory("firewall_rules")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
            selectedCategory === "firewall_rules"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <ShieldAlert className="size-3.5" />
          الجدار الناري والمنافذ
        </button>
        <button
          onClick={() => setSelectedCategory("wireless_auth")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
            selectedCategory === "wireless_auth"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Radio className="size-3.5" />
          اللاسلكي والتوثيق
        </button>
      </div>

      {/* Progress Bar & Real-time Score Feedback Header */}
      <div className="panel mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">السؤال</span>
            <span className="font-latin text-base text-foreground tabular-nums">
              {currentIndex + 1}
            </span>
            <span className="text-muted-foreground">من {total}</span>
            <span aria-hidden className="text-border">
              |
            </span>
            <span className="font-latin text-primary tabular-nums">{progressPercent}%</span>
          </div>

          <div className="flex items-center gap-4">
            {streak > 1 && (
              <span className="flex items-center gap-1 text-accent animate-pulse">
                <Flame className="size-4" />
                <span>متتالية: {streak}</span>
              </span>
            )}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3.5" />
              <span className="font-latin tabular-nums">{formatTime(elapsedSeconds)}</span>
            </span>
            <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-primary">
              النقاط:{" "}
              <strong className="font-latin tabular-nums">
                {correctCount} / {answeredCount}
              </strong>
            </span>
          </div>
        </div>

        {/* Live animated progress bar */}
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

        {/* Interactive Question Steps Navigator */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
          {questionPool.map((q, idx) => {
            const ans = userAnswers.find((a) => a.questionId === q.id);
            const isCurr = idx === currentIndex;
            let dotCls = "bg-secondary text-muted-foreground hover:bg-secondary/80";
            if (ans) {
              dotCls = ans.isCorrect
                ? "bg-success/20 text-success border border-success/40"
                : "bg-destructive/20 text-destructive border border-destructive/40";
            }
            if (isCurr) {
              dotCls += " ring-2 ring-primary ring-offset-2 ring-offset-background font-black";
            }

            return (
              <button
                key={q.id}
                onClick={() => handleJumpTo(idx)}
                className={`flex size-7 items-center justify-center rounded-lg text-[11px] font-latin font-bold transition-transform hover:scale-110 ${dotCls}`}
                title={`${q.protocol} (السؤال ${idx + 1})`}
                aria-label={`الانتقال للسؤال ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="panel p-6 md:p-8">
        {/* Protocol Metadata (unboxed clean typography) */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{currentQ.protocol}</span>
            <span aria-hidden>·</span>
            <span>{currentQ.categoryLabel}</span>
            <span aria-hidden>·</span>
            <span className="font-latin">{currentQ.portOrLayer}</span>
          </div>
          <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            {currentQ.difficulty}
          </span>
        </div>

        {/* Question Text */}
        <h3 className="mt-4 text-lg font-extrabold leading-relaxed md:text-xl">
          {currentQ.question}
        </h3>

        {/* Option Choices */}
        <div className="mt-6 grid gap-3">
          {currentQ.options.map((option, idx) => {
            const isChosen = selectedOption === idx || currentAnswered?.selectedIndex === idx;
            const isRightAnswer = idx === currentQ.answer;

            let cardState =
              "border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50";

            if (isCurrentAnswered) {
              if (isRightAnswer) {
                cardState =
                  "border-success bg-success/15 text-success shadow-[0_0_15px_oklch(0.76_0.16_160_/_15%)]";
              } else if (isChosen && !isRightAnswer) {
                cardState = "border-destructive bg-destructive/15 text-destructive";
              } else {
                cardState = "border-border bg-card/40 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isCurrentAnswered}
                className={`flex items-center justify-between gap-4 rounded-xl border p-4 text-right text-sm font-semibold leading-relaxed transition-all ${cardState}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-md font-latin text-xs font-bold ${
                      isChosen
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span>{option}</span>
                </div>

                {isCurrentAnswered && isRightAnswer && (
                  <CheckCircle2 className="size-5 shrink-0 text-success" />
                )}
                {isCurrentAnswered && isChosen && !isRightAnswer && (
                  <XCircle className="size-5 shrink-0 text-destructive" />
                )}
              </button>
            );
          })}
        </div>

        {/* Real-time Score Feedback & Protocol Breakdown */}
        {isCurrentAnswered && (
          <div
            className={`mt-6 rounded-2xl border p-5 transition-all ${
              isCorrect ? "border-success/30 bg-success/10" : "border-accent/40 bg-accent/10"
            }`}
          >
            <div className="flex items-center gap-2 font-extrabold text-sm md:text-base">
              {isCorrect ? (
                <>
                  <ShieldCheck className="size-5 text-success" />
                  <span className="text-success">إجابة صحيحة! أحسنت 🎯</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="size-5 text-accent" />
                  <span className="text-accent">إجابة غير صحيحة — إليك الشرح والآلية:</span>
                </>
              )}
            </div>

            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              {currentQ.explanation}
            </p>

            <div className="mt-3 rounded-xl border border-border bg-background/60 p-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-bold text-primary">قاعدة أمان البروتوكول: </span>
              {currentQ.keyTakeaway}
            </div>

            <div className="mt-5 flex items-center justify-between pt-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-bold transition-colors ${
                  currentIndex === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"
                }`}
              >
                <ArrowRight className="size-3.5" />
                السابق
              </button>

              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs md:text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
              >
                {currentIndex + 1 >= total ? "عرض النتيجة والتقرير" : "السؤال التالي"}
                <ArrowLeft className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" />
        بروتوكولات الأمان هي حجر الأساس لحماية البيانات أثناء النقل والتحكم في المنافذ.
      </div>
    </div>
  );
}
