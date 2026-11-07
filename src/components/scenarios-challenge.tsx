import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Search,
  Filter,
  Flame,
  ShieldCheck,
  ShieldAlert,
  Star,
  ExternalLink,
  Laptop,
  Check,
  Layers,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import {
  securityScenarios,
  SecurityScenario,
  ScenarioCategory,
  ScenarioDifficulty,
  ScenarioTrack,
} from "@/content/scenarios-data";

export function ScenariosChallenge() {
  const [selectedTrack, setSelectedTrack] = useState<ScenarioTrack | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<ScenarioDifficulty | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "solved" | "unsolved" | "bookmarked">(
    "all",
  );

  // User Answers State: Map scenarioId -> selected option index with localStorage sync
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("cyberlab_scenario_answers");
        if (raw) return JSON.parse(raw);
      } catch (err) {
        console.debug("Failed reading scenarios answers", err);
      }
    }
    return {};
  });
  // Bookmarked scenarios
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  // Revealed explanations manually before answering
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  // Filtered Scenarios
  const filteredScenarios = useMemo(() => {
    return securityScenarios.filter((sc) => {
      // Track filter (All vs EdTech vs General)
      if (selectedTrack !== "all") {
        const isEdtech = sc.track === "edtech";
        if (selectedTrack === "edtech" && !isEdtech) return false;
        if (selectedTrack === "general" && isEdtech) return false;
      }
      // Category filter
      if (selectedCategory !== "all" && sc.category !== selectedCategory) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== "all" && sc.difficulty !== selectedDifficulty) {
        return false;
      }
      // Status filter
      const answered = userAnswers[sc.id] !== undefined;
      const isCorrect = userAnswers[sc.id] === sc.correctIndex;
      if (statusFilter === "solved" && (!answered || !isCorrect)) return false;
      if (statusFilter === "unsolved" && answered && isCorrect) return false;
      if (statusFilter === "bookmarked" && !bookmarked[sc.id]) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textToSearch = [
          sc.title,
          sc.incidentContext,
          sc.question,
          sc.lessonTitleArabic,
          sc.categoryArabic,
          sc.explanation,
          sc.edtechDomain ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!textToSearch.includes(query)) return false;
      }

      return true;
    });
  }, [
    selectedTrack,
    selectedCategory,
    selectedDifficulty,
    statusFilter,
    searchQuery,
    userAnswers,
    bookmarked,
  ]);

  // Statistics
  const totalScenarios = securityScenarios.length;
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = securityScenarios.filter(
    (sc) => userAnswers[sc.id] === sc.correctIndex,
  ).length;
  const progressPercent = Math.round((correctCount / totalScenarios) * 100);

  const handleSelectOption = (scenarioId: string, optionIndex: number) => {
    setUserAnswers((prev) => {
      const updated = {
        ...prev,
        [scenarioId]: optionIndex,
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("cyberlab_scenario_answers", JSON.stringify(updated));
          window.dispatchEvent(new Event("cyberlab_activity_updated"));
        } catch (err) {
          console.debug("Failed saving scenario answer", err);
        }
      }
      return updated;
    });
  };

  const toggleBookmark = (scenarioId: string) => {
    setBookmarked((prev) => ({
      ...prev,
      [scenarioId]: !prev[scenarioId],
    }));
  };

  const toggleRevealExplanation = (scenarioId: string) => {
    setRevealedExplanations((prev) => ({
      ...prev,
      [scenarioId]: !prev[scenarioId],
    }));
  };

  const handleResetProgress = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في إعادة ضبط إجابات جميع السيناريوهات؟")) {
      setUserAnswers({});
      setRevealedExplanations({});
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("cyberlab_scenario_answers");
          window.dispatchEvent(new Event("cyberlab_activity_updated"));
        } catch (err) {
          console.debug("Failed clearing scenario answers", err);
        }
      }
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Overview & Live Scorecard */}
      <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-[#161f36] to-[#121829] p-6 shadow-2xl md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3.5 py-1 text-xs font-black text-primary">
              <Flame className="size-4" />
              <span>مختبر التفكير التحليلي وحل المشكلات السيبرانية</span>
            </div>
            <h2 className="text-2xl font-black text-foreground md:text-3xl">
              تحديات وسيناريوهات أمنية واقعية
            </h2>
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground md:text-sm">
              مجموعة متكاملة من المشكلات والحوادث السيبرانية الحقيقية المصممة لاختبار قدرتك على
              التشخيص واتخاذ القرار. كل سيناريو مستمد مباشرة من موضوعات ودروس الموقع، مع تحليل مفصل
              وروابط للمحتوى التعليمي والمحاكيات.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-border bg-background/50 p-4 text-center min-w-[110px]">
              <span className="block text-xs text-muted-foreground font-bold">السيناريوهات</span>
              <span className="font-latin text-2xl font-black text-foreground">
                {totalScenarios}
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center min-w-[110px]">
              <span className="block text-xs text-emerald-400 font-bold">الحلول الصحيحة</span>
              <span className="font-latin text-2xl font-black text-emerald-300">
                {correctCount}
              </span>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-center min-w-[110px]">
              <span className="block text-xs text-primary font-bold">نسبة الإنجاز</span>
              <span className="font-latin text-2xl font-black text-primary">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>
              تم حل {correctCount} من إجمالي {totalScenarios} سيناريو بنجاح
            </span>
            <span className="font-latin font-bold">{progressPercent}% مكتمل</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Digital Twin Live Reflection Sync Link */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Sparkles className="size-4" />
            </span>
            <span className="text-xs text-foreground font-bold">
              إجاباتك وقراراتك هنا تغذي وتحدّث مؤشرات <strong>توأمك الرقمي</strong> والوكيل الذكي
              لحظياً.
            </span>
          </div>
          <Link
            to="/digital-twin"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <span>عرض التوأم والوكيل الذكي</span>
            <ArrowRight className="size-3.5 rotate-180" />
          </Link>
        </div>

        {/* Reset button if answers exist */}
        {answeredCount > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleResetProgress}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-400 transition-colors"
            >
              <RotateCcw className="size-3.5" />
              إعادة ضبط تقدم السيناريوهات
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-[var(--shadow-card)]">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في المشكلات والسيناريوهات (مثل: 4444، BIOS، هجوم الفدية، Todo Backup، ICMP، ARP)..."
            className="w-full rounded-xl border border-border bg-background py-2.5 pr-11 pl-4 text-xs font-bold text-foreground outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              مسح
            </button>
          )}
        </div>

        {/* Track Switcher (All vs EdTech vs General) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
          <span className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-1">
            <GraduationCap className="size-3.5 text-emerald-400" /> المسار:
          </span>
          <button
            onClick={() => setSelectedTrack("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTrack === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5" />
            <span>كافة السيناريوهات ({securityScenarios.length})</span>
          </button>
          <button
            onClick={() => setSelectedTrack("edtech")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 ${
              selectedTrack === "edtech"
                ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
            }`}
          >
            <GraduationCap className="size-4" />
            <span>
              قسم تكنولوجيا التعليم ({securityScenarios.filter((s) => s.track === "edtech").length})
            </span>
          </button>
          <button
            onClick={() => setSelectedTrack("general")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTrack === "general"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            <span>
              السيناريوهات العامة ({securityScenarios.filter((s) => s.track !== "edtech").length})
            </span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <span className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-1">
            <Filter className="size-3.5" /> الموضوع:
          </span>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            الكل ({securityScenarios.length})
          </button>
          <button
            onClick={() => setSelectedCategory("passwords_accounts")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === "passwords_accounts"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            كلمات المرور والصلاحيات
          </button>
          <button
            onClick={() => setSelectedCategory("malware_scanning")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === "malware_scanning"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            الفيروسات والفحص المتقدم
          </button>
          <button
            onClick={() => setSelectedCategory("firewall_network")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === "firewall_network"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            الجدار الناري والشبكات
          </button>
          <button
            onClick={() => setSelectedCategory("backup_crypto_hash")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === "backup_crypto_hash"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            النسخ والتشفير والتجزئة
          </button>
          <button
            onClick={() => setSelectedCategory("security_fundamentals")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === "security_fundamentals"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            الأسس ومثلث CIA
          </button>
        </div>

        {/* Secondary Filters: Difficulty and Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground font-bold">مستوى الصعوبة:</span>
            {(["all", "مبتدئ", "متوسط", "متقدم"] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`rounded-lg px-2.5 py-1 font-bold transition-colors ${
                  selectedDifficulty === diff
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {diff === "all" ? "كافة المستويات" : diff}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground font-bold">الحالة:</span>
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-2.5 py-1 font-bold ${
                statusFilter === "all"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter("solved")}
              className={`rounded-lg px-2.5 py-1 font-bold ${
                statusFilter === "solved"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              تم حلها ({correctCount})
            </button>
            <button
              onClick={() => setStatusFilter("unsolved")}
              className={`rounded-lg px-2.5 py-1 font-bold ${
                statusFilter === "unsolved"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              غير محلولة ({totalScenarios - correctCount})
            </button>
            <button
              onClick={() => setStatusFilter("bookmarked")}
              className={`rounded-lg px-2.5 py-1 font-bold flex items-center gap-1 ${
                statusFilter === "bookmarked"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className="size-3 fill-current" />
              المميزة بنجمة
            </button>
          </div>
        </div>
      </div>

      {/* Results Count & Current Filter indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>عرض {filteredScenarios.length} سيناريو مطابق للمعايير</span>
        {filteredScenarios.length === 0 && (
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedDifficulty("all");
              setStatusFilter("all");
              setSearchQuery("");
            }}
            className="text-primary hover:underline font-bold"
          >
            إلغاء كافة الفلاتر
          </button>
        )}
      </div>

      {/* Scenarios List */}
      <div className="space-y-6">
        <AnimatePresence>
          {filteredScenarios.map((sc) => {
            const userAnswer = userAnswers[sc.id];
            const hasAnswered = userAnswer !== undefined;
            const isCorrect = userAnswer === sc.correctIndex;
            const isBookmarked = !!bookmarked[sc.id];
            const isExplanationRevealed = !!revealedExplanations[sc.id] || hasAnswered;

            return (
              <motion.div
                key={sc.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`overflow-hidden rounded-3xl border transition-all shadow-lg ${
                  hasAnswered
                    ? isCorrect
                      ? "border-emerald-500/40 bg-emerald-950/10 shadow-emerald-500/5"
                      : "border-rose-500/40 bg-rose-950/10 shadow-rose-500/5"
                    : "border-border bg-card/90 hover:border-primary/40"
                }`}
              >
                {/* Scenario Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-secondary/30 px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-xs font-black text-primary font-latin">
                      #{sc.scenarioNumber}
                    </span>
                    <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs font-bold text-foreground">
                      {sc.categoryArabic}
                    </span>
                    <span
                      className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                        sc.difficulty === "مبتدئ"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : sc.difficulty === "متوسط"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {sc.difficulty}
                    </span>
                    {sc.track === "edtech" && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-black text-emerald-300">
                        <GraduationCap className="size-3.5" />
                        <span>قسم تكنولوجيا التعليم</span>
                        {sc.edtechDomain && (
                          <span className="text-[10px] text-emerald-400/80 mr-1 hidden sm:inline">
                            • {sc.edtechDomain}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {hasAnswered && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-extrabold ${
                          isCorrect
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="size-4" /> تم الحل بنجاح
                          </>
                        ) : (
                          <>
                            <XCircle className="size-4" /> إجابة خاطئة
                          </>
                        )}
                      </span>
                    )}

                    {/* Bookmark Star Toggle */}
                    <button
                      onClick={() => toggleBookmark(sc.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isBookmarked
                          ? "text-amber-400 bg-amber-400/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                      title={isBookmarked ? "إلغاء التمييز" : "تمييز بنجمة للمراجعة"}
                      aria-label="تمييز بنجمة"
                    >
                      <Star className={`size-4 ${isBookmarked ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Scenario Title */}
                  <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                    <span>{sc.title}</span>
                  </h3>

                  {/* Real-world Incident Context Box */}
                  <div className="rounded-2xl border border-border/80 bg-secondary/30 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span>سيناريو الواقعة الأمنية (Incident Case Study):</span>
                    </div>
                    <p className="text-xs leading-relaxed text-foreground/90 md:text-sm">
                      {sc.incidentContext}
                    </p>

                    {sc.incidentLogOrDetail && (
                      <div
                        className="rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-[11px] text-primary/90 leading-relaxed overflow-x-auto"
                        dir="ltr"
                      >
                        {sc.incidentLogOrDetail}
                      </div>
                    )}
                  </div>

                  {/* Problem Question */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs font-black text-foreground md:text-sm leading-relaxed">
                    <span className="text-primary block text-xs font-bold mb-1">
                      المطلوب الأمني والتشخيص:
                    </span>
                    {sc.question}
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    {sc.options.map((option, idx) => {
                      const isOptionSelected = userAnswer === idx;
                      const isOptionCorrect = idx === sc.correctIndex;

                      let optionStyle =
                        "border-border bg-card/60 hover:border-primary/40 text-foreground/90";
                      if (hasAnswered) {
                        if (isOptionCorrect) {
                          optionStyle =
                            "border-emerald-500/60 bg-emerald-500/15 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                        } else if (isOptionSelected && !isOptionCorrect) {
                          optionStyle =
                            "border-rose-500/60 bg-rose-500/15 text-rose-200 line-through opacity-80";
                        } else {
                          optionStyle = "border-border/50 bg-secondary/20 text-muted-foreground";
                        }
                      } else if (isOptionSelected) {
                        optionStyle = "border-primary bg-primary/10 text-primary";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(sc.id, idx)}
                          disabled={hasAnswered}
                          className={`w-full text-right p-4 rounded-2xl border text-xs leading-relaxed transition-all flex items-start gap-3.5 md:text-sm cursor-pointer disabled:cursor-default ${optionStyle}`}
                        >
                          <span
                            className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold font-latin mt-0.5 ${
                              hasAnswered
                                ? isOptionCorrect
                                  ? "bg-emerald-500 text-black"
                                  : isOptionSelected
                                    ? "bg-rose-500 text-white"
                                    : "bg-secondary text-muted-foreground"
                                : isOptionSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {hasAnswered && isOptionCorrect ? (
                              <Check className="size-3.5" />
                            ) : (
                              String.fromCharCode(65 + idx)
                            )}
                          </span>
                          <span className="flex-1">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions Bar (Retry, Reveal explanation) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      {!hasAnswered && (
                        <button
                          onClick={() => toggleRevealExplanation(sc.id)}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <HelpCircle className="size-3.5" />
                          <span>
                            {revealedExplanations[sc.id]
                              ? "إخفاء التلميح"
                              : "عرض تلميح وتحليل الحل"}
                          </span>
                        </button>
                      )}

                      {hasAnswered && !isCorrect && (
                        <button
                          onClick={() => {
                            setUserAnswers((prev) => {
                              const copy = { ...prev };
                              delete copy[sc.id];
                              return copy;
                            });
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/50 px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
                        >
                          <RotateCcw className="size-3.5" />
                          <span>إعادة المحاولة في هذا السيناريو</span>
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <span>المرجع: {sc.curriculumReference}</span>
                    </div>
                  </div>

                  {/* Detailed Explanation & Site Content Linking */}
                  <AnimatePresence>
                    {isExplanationRevealed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-2xl border border-primary/20 bg-background/80 p-5 space-y-4"
                      >
                        <div className="flex items-center gap-2 text-xs font-extrabold text-primary">
                          <Sparkles className="size-4" />
                          <span>تحليل الحل والربط بالمحتوى المنهجي في الموقع:</span>
                        </div>

                        <p className="text-xs leading-relaxed text-foreground/90 md:text-sm">
                          {sc.explanation}
                        </p>

                        <div className="rounded-xl border border-border bg-secondary/30 p-3 text-xs leading-relaxed text-muted-foreground">
                          <strong className="text-foreground block mb-1">
                            لماذا تعد الخيارات الأخرى غير مناسبة؟
                          </strong>
                          {sc.whyOthersFail}
                        </div>

                        {/* Direct Site Link CTAs */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to="/lessons/$slug"
                              params={{ slug: sc.lessonSlug }}
                              className="inline-flex items-center gap-2 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30 px-4 py-2 text-xs font-bold text-primary transition-all"
                            >
                              <BookOpen className="size-4" />
                              <span>مراجعة درس: {sc.lessonTitleArabic}</span>
                              <ArrowRight className="size-3.5" />
                            </Link>

                            {sc.practicalSimulatorLink && (
                              <Link
                                to={sc.practicalSimulatorLink}
                                className="inline-flex items-center gap-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border px-4 py-2 text-xs font-bold text-foreground transition-all"
                              >
                                <Laptop className="size-4 text-primary" />
                                <span>
                                  فتح محاكي{" "}
                                  {sc.practicalSimulatorLink === "/avast" ? "Avast" : "Comodo"}
                                </span>
                              </Link>
                            )}
                          </div>

                          <span className="text-[11px] text-muted-foreground font-mono">
                            ID: {sc.id}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Educational Recap */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <h4 className="text-lg font-black text-foreground">
          كيف تستفيد بأقصى درجة من سيناريوهات التفكير الأمني؟
        </h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
          <div className="rounded-2xl border border-border bg-secondary/30 p-4">
            <strong className="text-foreground block mb-1">1. التشخيص قبل الاختيار:</strong>
            اقرأ تفاصيل الواقعة والـ Log المعطى بدقة لتحدد نوع الخطر ومكانه في دورة أمن النظام قبل
            اختيار الإجراء.
          </div>
          <div className="rounded-2xl border border-border bg-secondary/30 p-4">
            <strong className="text-foreground block mb-1">2. فهم فلسفة الخيارات الخاطئة:</strong>
            راجع دائمًا صندوق (لماذا تفشل الخيارات الأخرى) لتعرف أسباب رفض الإجراءات غير الدقيقة.
          </div>
          <div className="rounded-2xl border border-border bg-secondary/30 p-4">
            <strong className="text-foreground block mb-1">3. الانتقال للمحاكيات التطبيقية:</strong>
            عند الانتهاء من سيناريوهات الجدار الناري أو Avast، توجه مباشرة للمحاكي التفاعلي بالموقع
            لتطبيق نفس القاعدة عمليًا.
          </div>
        </div>
      </div>
    </div>
  );
}
