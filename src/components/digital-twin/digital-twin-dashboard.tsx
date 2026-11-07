import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Cpu,
  Brain,
  Activity,
  Award,
  Layers,
  Sparkles,
  Bot,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Laptop,
  Check,
  Clock,
  Compass,
} from "lucide-react";
import {
  getStoredDigitalTwin,
  saveDigitalTwin,
  resetStoredDigitalTwin,
  syncTwinWithActivities,
} from "@/lib/digital-twin-store";
import type {
  LearnerDigitalTwin,
  AvatarStyle,
  CognitiveDimensionKey,
} from "@/lib/digital-twin.types";
import { DigitalTwinAvatar } from "./digital-twin-avatar";
import { DigitalTwinRadar } from "./digital-twin-radar";
import { AgentChatPanel } from "./agent-chat-panel";
import { TwinSimulationLab } from "./twin-simulation-lab";

export function DigitalTwinDashboard() {
  const [twin, setTwin] = useState<LearnerDigitalTwin>(() => getStoredDigitalTwin());
  const [activeTab, setActiveTab] = useState<
    "overview" | "agent_chat" | "simulation" | "misconceptions" | "adaptive_path"
  >("overview");
  const [selectedStudentName, setSelectedStudentName] = useState(twin.studentName);
  const [isEditingName, setIsEditingName] = useState(false);

  // Listen to external twin or activity updates
  useEffect(() => {
    const handleUpdate = () => {
      setTwin(getStoredDigitalTwin());
    };

    window.addEventListener("cyberlab_twin_updated", handleUpdate);
    window.addEventListener("cyberlab_activity_updated", handleUpdate);

    return () => {
      window.removeEventListener("cyberlab_twin_updated", handleUpdate);
      window.removeEventListener("cyberlab_activity_updated", handleUpdate);
    };
  }, []);

  const handleAvatarStyleChange = (style: AvatarStyle) => {
    const updated = { ...twin, avatarStyle: style };
    setTwin(updated);
    saveDigitalTwin(updated);
  };

  const handleSaveName = () => {
    if (selectedStudentName.trim()) {
      const updated = { ...twin, studentName: selectedStudentName.trim() };
      setTwin(updated);
      saveDigitalTwin(updated);
      setIsEditingName(false);
    }
  };

  const handleResetTwin = () => {
    if (
      window.confirm(
        "هل تريد إعادة ضبط التوأم الرقمي للبدء من جديد؟ سيتم مسح بيانات المحاكاة السابقة.",
      )
    ) {
      const fresh = resetStoredDigitalTwin();
      setTwin(fresh);
    }
  };

  const dimensionsList = Object.values(twin.dimensions);
  const detectedMisconceptions = twin.misconceptions.filter((m) => m.isDetected);

  return (
    <div className="space-y-8" dir="rtl">
      {/* Top Welcome & Twin Synchronization Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-card/90 via-secondary/40 to-card/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -left-12 -top-12 size-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 size-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/30 to-emerald-400/20 border border-primary/40 text-primary shadow-lg">
              <Brain className="size-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={selectedStudentName}
                      onChange={(e) => setSelectedStudentName(e.target.value)}
                      className="rounded-lg border border-primary bg-background px-3 py-1 text-sm font-bold text-foreground focus:outline-none"
                    />
                    <button
                      onClick={handleSaveName}
                      className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"
                    >
                      حفظ
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-black text-foreground">
                      التوأم الرقمي: {twin.studentName}
                    </h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-xs text-primary underline hover:text-primary/80"
                    >
                      تعديل
                    </button>
                  </div>
                )}
                <span className="rounded-full bg-primary/20 border border-primary/40 px-3 py-0.5 text-xs font-black text-primary">
                  {twin.stageTitle}
                </span>
              </div>

              <p className="mt-1 text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                النموذج المعرفي الإدراكي الافتراضي المتزامن مع رحلتك التعليمية وسلوكك في حل
                السيناريوهات واستخدام محاكيات الأمان.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetTwin}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400 transition-colors"
              title="إعادة تعيين التوأم إلى الحالة الابتدائية"
            >
              <RotateCcw className="size-3.5" />
              <span>إعادة ضبط التوأم</span>
            </button>

            <Link
              to="/scenarios"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black text-primary-foreground shadow-md transition-all hover:opacity-90"
            >
              <Layers className="size-4" />
              <span>تدريب التوأم في السيناريوهات</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "overview"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Activity className="size-4" />
          <span>المؤشرات والرادار المعرفي</span>
        </button>

        <button
          onClick={() => setActiveTab("agent_chat")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "agent_chat"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Bot className="size-4" />
          <span>الوكيل الذكي (د. سايبر)</span>
          <span className="rounded-full bg-emerald-500/30 px-1.5 py-0.2 text-[10px] text-emerald-300 font-latin">
            AI
          </span>
        </button>

        <button
          onClick={() => setActiveTab("simulation")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "simulation"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Cpu className="size-4" />
          <span>المحاكاة التنبؤية للتوأم</span>
        </button>

        <button
          onClick={() => setActiveTab("misconceptions")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "misconceptions"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <AlertTriangle className="size-4" />
          <span>رادار المفاهيم البديلة</span>
          {detectedMisconceptions.length > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
              {detectedMisconceptions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("adaptive_path")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "adaptive_path"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Compass className="size-4" />
          <span>المسار التكيفي المقترح</span>
        </button>
      </div>

      {/* Tab 1: Overview & Cognitive Radar */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left/Main Column: Hologram Avatar & Telemetry */}
            <div className="lg:col-span-5 rounded-3xl border border-border bg-card/80 backdrop-blur-md overflow-hidden shadow-xl">
              <div className="border-b border-border/80 bg-secondary/30 px-5 py-3.5">
                <h3 className="text-sm font-black text-foreground">
                  المجسم الهولوجرافي وهوية التوأم
                </h3>
              </div>
              <DigitalTwinAvatar twin={twin} onStyleChange={handleAvatarStyleChange} />
            </div>

            {/* Right/Secondary Column: Radar Chart */}
            <div className="lg:col-span-7 rounded-3xl border border-border bg-card/80 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                      <Layers className="size-4" />
                    </span>
                    <h3 className="text-sm font-black text-foreground">
                      رادار الأبعاد الإدراكية الخمسة
                    </h3>
                  </div>
                  <span className="text-xs font-latin text-muted-foreground">5 COGNITIVE AXES</span>
                </div>
                <DigitalTwinRadar dimensions={twin.dimensions} />
              </div>

              {/* Behavioral Indices */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3 text-right">
                  <span className="block text-[11px] font-bold text-muted-foreground">
                    سرعة القرار
                  </span>
                  <span className="text-xs font-black text-foreground">
                    {twin.behavior.decisionVelocity}
                  </span>
                </div>
                <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3 text-right">
                  <span className="block text-[11px] font-bold text-muted-foreground">
                    الفضول التجريبي
                  </span>
                  <span className="text-xs font-black text-primary font-latin">
                    {twin.behavior.curiosityIndex}%
                  </span>
                </div>
                <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3 text-right">
                  <span className="block text-[11px] font-bold text-muted-foreground">
                    المرونة الإدراكية
                  </span>
                  <span className="text-xs font-black text-emerald-400 font-latin">
                    {twin.behavior.cognitiveResilience}%
                  </span>
                </div>
                <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3 text-right">
                  <span className="block text-[11px] font-bold text-muted-foreground">
                    سيناريوهات مكتملة
                  </span>
                  <span className="text-xs font-black text-foreground font-latin">
                    {twin.behavior.scenariosAttempted} / 30
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Dimensions Breakdown Cards */}
          <div className="rounded-3xl border border-border bg-card/80 p-6 backdrop-blur-md shadow-xl">
            <h3 className="text-base font-black text-foreground mb-4">
              التحليل التفصيلي لأبعاد التوأم المعرفية
            </h3>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dimensionsList.map((dim) => {
                const score = dim.score;
                const badgeColor =
                  score >= 75
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : score >= 50
                      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30";

                return (
                  <div
                    key={dim.key}
                    className="flex flex-col justify-between rounded-2xl border border-border/80 bg-secondary/20 p-4 transition-all hover:border-primary/40"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-xs font-black text-foreground">{dim.titleArabic}</h4>
                          <span className="text-[10px] text-muted-foreground font-latin">
                            {dim.enTitle}
                          </span>
                        </div>
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[11px] font-black border ${badgeColor}`}
                        >
                          {score}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full rounded-full bg-background/80 overflow-hidden my-3">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
                          style={{ width: `${score}%` }}
                        />
                      </div>

                      <div className="space-y-1 text-[11px] text-muted-foreground mb-4">
                        <p>
                          <strong className="text-foreground">نقاط القوة: </strong>
                          {dim.strongTopics.join("، ")}
                        </p>
                        <p>
                          <strong className="text-rose-400">بحاجة لدعم: </strong>
                          {dim.weakTopics.join("، ")}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/lessons/$slug"
                      params={{ slug: dim.recommendedLessonSlug }}
                      className="mt-2 inline-flex items-center justify-between rounded-xl bg-secondary/50 hover:bg-primary/20 border border-border/80 px-3 py-1.5 text-xs font-bold text-foreground transition-colors"
                    >
                      <span>دراسة: {dim.recommendedLessonTitle}</span>
                      <ArrowRight className="size-3.5 text-primary rotate-180" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Intelligent Agent (Dr. Cyber) */}
      {activeTab === "agent_chat" && (
        <AgentChatPanel twin={twin} onRefreshTwin={() => setTwin(getStoredDigitalTwin())} />
      )}

      {/* Tab 3: Predictive Simulation Lab */}
      {activeTab === "simulation" && <TwinSimulationLab twin={twin} />}

      {/* Tab 4: Misconceptions Radar */}
      {activeTab === "misconceptions" && (
        <div className="rounded-3xl border border-border bg-card/80 p-6 backdrop-blur-md shadow-xl text-right">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="size-4" />
                </span>
                <h3 className="text-base font-black text-foreground">
                  رادار الفجوات والمفاهيم البديلة (Misconceptions Inventory)
                </h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                يرصد الأخطاء والتصورات الشائعة التي يقع فيها المتعلمون أثناء حل السيناريوهات ويصححها
                علمياً
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-secondary/30 px-3.5 py-1.5 text-xs font-bold text-foreground">
              المفاهيم المرصودة:{" "}
              <span className="text-rose-400 font-latin">{detectedMisconceptions.length}</span> من
              أصل <span className="font-latin">{twin.misconceptions.length}</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {twin.misconceptions.map((misc) => {
              const detected = misc.isDetected;
              return (
                <div
                  key={misc.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    detected
                      ? "border-rose-500/40 bg-rose-950/10 shadow-sm"
                      : "border-border/80 bg-secondary/20 hover:border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-xs font-black text-foreground">{misc.title}</h4>
                    <span
                      className={`shrink-0 rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                        detected
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {detected ? "⚠️ رُصدت فجوة" : "✅ مستوعب علمياً"}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    <strong className="text-foreground">التصور الشائع الخاطئ: </strong>
                    {misc.description}
                  </p>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-3 text-xs text-emerald-200/90 leading-relaxed mb-3">
                    <strong className="text-emerald-300">التصحيح العلمي الدقيق: </strong>
                    {misc.scientificCorrection}
                  </div>

                  <Link
                    to="/lessons/$slug"
                    params={{ slug: misc.relatedLessonSlug }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <BookOpen className="size-3.5" />
                    <span>مراجعة درس: {misc.relatedLessonTitle}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Adaptive Pathway */}
      {activeTab === "adaptive_path" && (
        <div className="rounded-3xl border border-border bg-card/80 p-6 backdrop-blur-md shadow-xl text-right">
          <div className="border-b border-border/80 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Compass className="size-4" />
              </span>
              <h3 className="text-base font-black text-foreground">
                المسار التعليمي التكيفي المخصص لتوأمك
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              خطة عمل موجهة مرتبة وفق أولويات التوأم الحالية لرفع مؤشر المناعة السيبرانية
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1: Immediate Priority */}
            <div className="flex items-start gap-4 rounded-2xl border border-primary/40 bg-primary/10 p-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-latin font-black text-sm">
                1
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-foreground">
                    الأولوية الفورية: تأمين جدران الحماية والشبكات
                  </h4>
                  <span className="rounded-lg bg-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary">
                    تدخل عاجل
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  تظهر بيانات التوأم أن بعد الجدران النارية هو الأقل استيعاباً. الخطوة الأولى هي
                  دراسة درس COMODO Firewall وتطبيق تدريب حظر منفذ 4444.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to="/lessons/comodo-firewall"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    <BookOpen className="size-3.5" />
                    <span>دراسة درس COMODO</span>
                  </Link>
                  <Link
                    to="/comodo"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
                  >
                    <Laptop className="size-3.5" />
                    <span>تشغيل محاكي Comodo</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 2: Reinforcing EdTech Scenarios */}
            <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-secondary/20 p-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground font-latin font-black text-sm">
                2
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-foreground">
                    تطبيق سيناريوهات قسم تكنولوجيا التعليم التخصصية
                  </h4>
                  <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                    تطبيق عملي
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  حل الـ 14 سيناريو الخاص بمعامل الوسائط، القاعات الذكية، ومنصات الاختبارات
                  الإلكترونية لتعزيز المرونة الإدراكية.
                </p>
                <div className="mt-3">
                  <Link
                    to="/scenarios"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/40 transition-colors"
                  >
                    <Layers className="size-3.5" />
                    <span>فتح سيناريوهات تكنولوجيا التعليم</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 3: Avast Boot-Time & Rescue Disk */}
            <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-secondary/20 p-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground font-latin font-black text-sm">
                3
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-foreground">
                    إتقان العزل والفحص المتقدم في محاكي Avast
                  </h4>
                  <span className="rounded-lg bg-cyan-500/15 px-2 py-0.5 text-[11px] font-bold text-cyan-400">
                    محاكاة تفاعلية
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  تجربة فحص وقت الإقلاع وصندوق العزل الافتراضي (Sandbox) لحماية الأجهزة من البرمجيات
                  الخبيثة المتجذرة.
                </p>
                <div className="mt-3">
                  <Link
                    to="/avast"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/40 transition-colors"
                  >
                    <Laptop className="size-3.5" />
                    <span>تشغيل محاكي Avast</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
