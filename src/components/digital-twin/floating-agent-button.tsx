import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Sparkles,
  ArrowRight,
  Brain,
  MessageSquare,
  ShieldAlert,
  Send,
} from "lucide-react";
import { getStoredDigitalTwin } from "@/lib/digital-twin-store";
import { chatWithAgentAI } from "@/lib/digital-twin.functions";
import type { LearnerDigitalTwin } from "@/lib/digital-twin.types";

export function FloatingAgentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [twin, setTwin] = useState<LearnerDigitalTwin | null>(null);
  const [quickInput, setQuickInput] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setTwin(getStoredDigitalTwin());

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

  // If already on the digital-twin page, we can show a subdued button or keep it minimal
  const isOnTwinPage = pathname === "/digital-twin";

  if (!twin) return null;

  const handleAskQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim() || isLoading) return;

    setIsLoading(true);
    setReply(null);

    try {
      const res = await chatWithAgentAI({
        data: {
          latestQuestion: quickInput.trim(),
          twinSummary: `اسم المتعلم: ${twin.studentName}، الإتقان: ${twin.overallMastery}%، المناعة: ${twin.immunityHealthScore}%.`,
          messages: [],
        },
      });
      setReply(res.reply);
      setQuickInput("");
    } catch {
      setReply(
        "أنا هنا لمساعدتك! يمكنك زيارة لوحة التوأم الرقمي الكاملة للاطلاع على التشخيص المعرفي والدروس المقترحة.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 select-none" dir="rtl">
      {/* Popover Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mb-3 w-80 sm:w-96 rounded-3xl border border-primary/40 bg-card/95 p-5 shadow-2xl backdrop-blur-xl text-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
                  <Bot className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-foreground">د. سايبر | الوكيل الذكي</h4>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> متصل
                    بتوأمك الرقمي ({twin.immunityHealthScore}% مناعة)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="إغلاق النافذة"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Quick Status / Guidance */}
            <div className="my-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                أهلاً يا <strong className="text-foreground">{twin.studentName}</strong>! أنا أتابع
                تقدمك لحظياً. طورك الحالي:{" "}
                <strong className="text-primary">{twin.stageTitle}</strong>.
              </p>
              {twin.immunityHealthScore < 70 && (
                <p className="mt-1.5 text-amber-300/90 text-[11px] flex items-center gap-1 font-bold">
                  <ShieldAlert className="size-3.5 shrink-0 text-amber-400" />
                  توأمك يحتاج تدعيماً في جدران الحماية وقواعد المنافذ!
                </p>
              )}
            </div>

            {/* Response Area if asked */}
            {reply && (
              <div className="mb-3 max-h-40 overflow-y-auto rounded-xl border border-border bg-secondary/40 p-3 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {reply}
              </div>
            )}

            {/* Quick Chat Form */}
            <form onSubmit={handleAskQuick} className="flex items-center gap-1.5 mb-3">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="اسأل د. سايبر سريعاً..."
                className="flex-1 rounded-xl border border-input bg-background/80 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!quickInput.trim() || isLoading}
                className="inline-flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Send className="size-3.5" />
              </button>
            </form>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
              <Link
                to="/digital-twin"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <Brain className="size-3.5" />
                <span>فتح مركز التوأم الرقمي الكامل</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((v) => !v)}
        className="group relative flex size-14 items-center justify-center rounded-2xl border-2 border-primary/50 bg-gradient-to-tr from-card via-secondary to-primary/20 text-primary shadow-[0_0_25px_rgba(6,182,212,0.35)] backdrop-blur-md transition-all hover:border-primary hover:shadow-[0_0_35px_rgba(6,182,212,0.55)]"
        aria-label="الوكيل الذكي والتوأم الرقمي"
      >
        <Bot className="size-7" />

        {/* Pulse beacon */}
        <span className="absolute -top-1 -right-1 flex size-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full size-3.5 bg-primary" />
        </span>

        {/* Hover label */}
        <span className="absolute right-16 rounded-xl border border-border bg-card/95 px-3 py-1 text-xs font-black text-foreground shadow-xl opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 whitespace-nowrap">
          الوكيل الذكي والتوأم الرقمي
        </span>
      </motion.button>
    </div>
  );
}
