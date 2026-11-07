import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Play,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { runTwinPredictionAI } from "@/lib/digital-twin.functions";
import type { LearnerDigitalTwin, PredictiveSimulationResult } from "@/lib/digital-twin.types";

interface TwinSimulationLabProps {
  twin: LearnerDigitalTwin;
  onSimulationCompleted?: (res: PredictiveSimulationResult) => void;
}

const SIMULATION_SCENARIOS = [
  {
    id: "ransomware_lab",
    title: "هجوم فدية يستهدف معمل إنتاج الوسائط",
    domain: "معامل الوسائط المتعددة والمونتاج",
    threatDesc: "تسلل برمجية خبيثة تحاول تشفير كافة ملفات مشروعات التخرج والرسوم المتحركة.",
  },
  {
    id: "usb_smartscreen",
    title: "فيروس Autorun في شاشة القاعة الذكية",
    domain: "القاعات والفصول الذكية",
    threatDesc: "توصيل فلاش ميموري مصاب بفيروس اختصارات لإصابة نظام تشغيل الشاشة التفاعلية.",
  },
  {
    id: "exam_portal_leak",
    title: "اعتراض بنك أسئلة امتحان إلكتروني",
    domain: "منصات التقويم والاختبارات",
    threatDesc: "هجوم تنصت (Man-in-the-Middle) على شبكة المعمل لمحاولة تسريب أسئلة بنك الامتحانات.",
  },
];

export function TwinSimulationLab({ twin, onSimulationCompleted }: TwinSimulationLabProps) {
  const [selectedThreatId, setSelectedThreatId] = useState(SIMULATION_SCENARIOS[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<PredictiveSimulationResult | null>(null);

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const res = await runTwinPredictionAI({
        data: {
          twin,
          threatId: selectedThreatId,
        },
      });

      setResult(res);
      if (onSimulationCompleted) {
        onSimulationCompleted(res);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card/80 p-6 backdrop-blur-md shadow-xl text-right">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Cpu className="size-4" />
            </span>
            <h3 className="text-base font-black text-foreground">
              مختبر المحاكاة التنبؤية للتوأم الرقمي
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            اختبر كيف سيتصرف توأمك الرقمي تلقائياً أمام هجمات حقيقية دون تدخلك المباشر
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RotateCcw className="size-4 animate-spin" />
              <span>جاري محاكاة الاستجابة الإدراكية...</span>
            </>
          ) : (
            <>
              <Play className="size-4" />
              <span>تشغيل المحاكاة التنبؤية للتوأم</span>
            </>
          )}
        </button>
      </div>

      {/* Scenario Selection Cards */}
      <div className="mb-6">
        <span className="block text-xs font-bold text-muted-foreground mb-3">
          اختر السيناريو الهجومي لاختبار التوأم:
        </span>
        <div className="grid gap-3 sm:grid-cols-3">
          {SIMULATION_SCENARIOS.map((sc) => {
            const active = selectedThreatId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedThreatId(sc.id)}
                className={`rounded-2xl border p-4 text-right transition-all ${
                  active
                    ? "border-primary bg-primary/15 text-foreground shadow-sm"
                    : "border-border/80 bg-secondary/20 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span className="block text-[11px] font-bold text-primary mb-1">{sc.domain}</span>
                <h4 className="text-xs font-black text-foreground mb-1.5">{sc.title}</h4>
                <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                  {sc.threatDesc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulation Result Area */}
      <AnimatePresence mode="wait">
        {isRunning && (
          <motion.div
            key="running"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-12 text-center"
          >
            <Cpu className="size-10 animate-bounce text-primary mb-3" />
            <h4 className="text-sm font-black text-foreground">
              يتم الآن نمذجة سلوك التوأم ومقارنة أبعاده المعرفية بالتهديد...
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              فحص استيعاب كلمات المرور، جدار الحماية، بصمات التجزئة، ونمط اتخاذ القرار
            </p>
          </motion.div>
        )}

        {result && !isRunning && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/80 bg-secondary/20 p-5 space-y-4"
          >
            {/* Header Result */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h4 className="text-sm font-black text-foreground">{result.scenarioTitle}</h4>
                <span className="text-xs text-muted-foreground">النوع: {result.threatType}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">
                  نسبة نجاح التوأم المتوقعة:
                </span>
                <span
                  className={`rounded-xl px-3 py-1 font-latin text-sm font-black ${
                    result.predictedSuccessRate >= 75
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : result.predictedSuccessRate >= 50
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {result.predictedSuccessRate}%
                </span>
              </div>
            </div>

            {/* Context & Decision */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border/80 bg-card/60 p-4">
                <span className="block text-xs font-black text-primary mb-1">
                  سياق التهديد المحاكى:
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {result.contextDescription}
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card/60 p-4">
                <span className="block text-xs font-black text-foreground mb-1">
                  قرار وسلوك التوأم المتوقع:
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {result.predictedDecision}
                </p>
              </div>
            </div>

            {/* Identified Risk Points */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-4">
              <div className="flex items-center gap-2 mb-2 text-rose-400">
                <AlertTriangle className="size-4" />
                <span className="text-xs font-black">
                  مواطن الخطر والثغرات التي قد يسقط فيها التوأم:
                </span>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {result.identifiedRiskPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 select-none">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Countermeasure */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4">
              <div className="flex items-center gap-2 mb-1.5 text-emerald-400">
                <ShieldCheck className="size-4" />
                <span className="text-xs font-black">
                  الإجراء المضاد المطلوب لتدريب التوأم عليه:
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {result.suggestedDefensiveCountermeasure}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
