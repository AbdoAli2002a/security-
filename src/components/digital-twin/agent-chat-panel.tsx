import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  User,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Zap,
  BookOpen,
} from "lucide-react";
import { diagnoseTwinWithAI, chatWithAgentAI } from "@/lib/digital-twin.functions";
import type {
  LearnerDigitalTwin,
  AgentChatMessage,
  TwinDiagnosticReport,
} from "@/lib/digital-twin.types";

interface AgentChatPanelProps {
  twin: LearnerDigitalTwin;
  onRefreshTwin?: () => void;
}

const PRESET_PROMPTS = [
  "حلل أداء توأمي الرقمي وأخبرني بأضعف نقاطي",
  "كيف أطبق استراتيجية 3-2-1 لحماية مشاريع التخرج بالمعمل؟",
  "ما الفرق الدقيق بين كلمة مرور النظام وكلمة مرور الهارد ديسك؟",
  "كيف أضبط جدار الحماية COMODO لحماية منصة الاختبارات؟",
];

export function AgentChatPanel({ twin, onRefreshTwin }: AgentChatPanelProps) {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "agent",
      text: `مرحباً بك يا ${twin.studentName}! أنا "د. سايبر"، وكيلك الذكي وموجه توأمك الرقمي لمقرر أمن الحاسوب وتكنولوجيا التعليم. أراقب تطور مهاراتك الإدراكية وسلوكك في التعامل مع المخاطر. اسألني عن أي جزئية في المنهج، أو اطلب مني تشخيص توأمك وتحديد مسارك القادم!`,
      timestamp: "الآن",
      emotion: "encouraging",
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<TwinDiagnosticReport | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticSource, setDiagnosticSource] = useState<"gemini" | "rule_engine" | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend ?? inputQuestion).trim();
    if (!q || isSending) return;

    const userMsg: AgentChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "learner",
      text: q,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setIsSending(true);

    try {
      const twinSummary = `الاسم: ${twin.studentName}، الطور: ${twin.stageTitle}، الإتقان الكلي: ${twin.overallMastery}%، المناعة: ${twin.immunityHealthScore}%. الأبعاد: كلمات المرور (${twin.dimensions.passwords_accounts.score}%)، البرمجيات الخبيثة (${twin.dimensions.malware_scanning.score}%)، الجدران النارية (${twin.dimensions.firewall_network.score}%)، النسخ والتشفير (${twin.dimensions.backup_crypto_hash.score}%)، تكنولوجيا التعليم (${twin.dimensions.edtech_security.score}%).`;

      const response = await chatWithAgentAI({
        data: {
          latestQuestion: q,
          twinSummary,
          messages: messages.slice(-5).map((m) => ({
            role: m.sender === "learner" ? "user" : "model",
            text: m.text,
          })),
        },
      });

      const agentReply: AgentChatMessage = {
        id: `agt-${Date.now()}`,
        sender: "agent",
        text: response.reply,
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        emotion: response.emotion,
      };

      setMessages((prev) => [...prev, agentReply]);
    } catch (err) {
      console.error("Agent chat error:", err);
      const fallbackReply: AgentChatMessage = {
        id: `agt-${Date.now()}`,
        sender: "agent",
        text: "حدث انقطاع مؤقت في الاتصال السحابي بالوكيل. أنصحك بمراجعة الدرس المرتبط مباشرة بالسؤال أو الاطلاع على سجل السيناريوهات التفاعلية وسأكون معك في الحال!",
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        emotion: "alert",
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsSending(false);
    }
  };

  const handleRunFullDiagnostic = async () => {
    if (isDiagnosing) return;
    setIsDiagnosing(true);

    try {
      const res = await diagnoseTwinWithAI({
        data: { twin },
      });
      setDiagnosticReport(res.report);
      setDiagnosticSource(res.source);

      // Add a message into chat acknowledging the diagnostic
      const diagnosticNotice: AgentChatMessage = {
        id: `diag-${Date.now()}`,
        sender: "agent",
        text: `أنجزت للتو تحليلاً شاملاً لحالة توأمك الرقمي! نمطك السيبراني هو: "${res.report.learnerArchetype}". يمكنك مراجعة بطاقة التشخيص التفصيلية أدناه، حيث حددت لك أبرز نقاط قوتك وثغرتك الحرجة وخطة التدخل الموصى بها.`,
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        emotion: "celebratory",
      };
      setMessages((prev) => [...prev, diagnosticNotice]);
    } catch (err) {
      console.error("Diagnostic error:", err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="flex flex-col rounded-3xl border border-border bg-card/80 backdrop-blur-md overflow-hidden shadow-xl">
      {/* Agent Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-secondary/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/30 to-cyan-500/10 border border-primary/40 text-primary shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Bot className="size-6" />
            <span className="absolute -top-1 -right-1 flex size-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-3 bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-foreground">
                د. سايبر | الوكيل الذكي المتكيف
              </h3>
              <span className="rounded-full bg-primary/15 border border-primary/30 px-2.5 py-0.5 text-[10px] font-black text-primary font-latin">
                AI PEDAGOGICAL AGENT
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              مرشد تكنولوجيا التعليم والأمن السيبراني المتصل بتوأمك الرقمي لحظياً
            </p>
          </div>
        </div>

        <button
          onClick={handleRunFullDiagnostic}
          disabled={isDiagnosing}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-400 px-4 py-2 text-xs font-black text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-50"
        >
          {isDiagnosing ? (
            <>
              <RefreshCw className="size-4 animate-spin" />
              <span>جاري الفحص المعرفي...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              <span>طلب تشخيص شامل للتوأم</span>
            </>
          )}
        </button>
      </div>

      {/* AI Deep Diagnostic Report Card (If available) */}
      <AnimatePresence>
        {diagnosticReport && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border/80 bg-gradient-to-b from-primary/10 via-secondary/20 to-transparent p-6 text-right"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Zap className="size-4" />
                </span>
                <h4 className="text-sm font-black text-foreground">
                  تقرير التشخيص المعرفي للتوأم الرقمي
                </h4>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground">
                المصدر:{" "}
                {diagnosticSource === "gemini"
                  ? "Gemini 3.8 Flash AI Engine"
                  : "المحرك التربوي الذكي"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Archetype & Assessment */}
              <div className="rounded-2xl border border-primary/30 bg-card/90 p-4 md:col-span-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black text-primary">النمط الإدراكي المكتشف:</span>
                  <span className="rounded-lg bg-primary/20 px-2.5 py-0.5 text-xs font-black text-foreground">
                    {diagnosticReport.learnerArchetype}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {diagnosticReport.overallAssessment}
                </p>
              </div>

              {/* Dominant Strength */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-4">
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <ShieldCheck className="size-4" />
                  <span className="text-xs font-black">أبرز ركائز القوة</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {diagnosticReport.dominantStrength}
                </p>
              </div>

              {/* Critical Vulnerability */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-4">
                <div className="flex items-center gap-2 mb-2 text-rose-400">
                  <AlertTriangle className="size-4" />
                  <span className="text-xs font-black">الثغرة الحرجة في التوأم</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {diagnosticReport.criticalVulnerability}
                </p>
              </div>

              {/* Recommended Action & Link */}
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/15 p-4">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <Lightbulb className="size-4" />
                  <span className="text-xs font-black">التدخل العلاجي الفوري</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground mb-3">
                  {diagnosticReport.recommendedPath.immediateStep}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/lessons/$slug"
                    params={{ slug: diagnosticReport.recommendedPath.lessonSlug }}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/40 px-2.5 py-1 text-[11px] font-bold text-primary transition-colors"
                  >
                    <BookOpen className="size-3" />
                    <span>فتح الدرس المقترح</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Pedagogical Tip */}
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-950/10 p-3 text-xs text-amber-200/90">
              <span className="text-base select-none">💡</span>
              <p className="leading-relaxed">
                <strong className="font-black text-amber-300">وصية د. سايبر الذهبية: </strong>
                {diagnosticReport.pedagogicalTip}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Scroll Area */}
      <div className="h-80 overflow-y-auto p-6 space-y-4 text-right">
        {messages.map((m) => {
          const isAgent = m.sender === "agent";
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${isAgent ? "flex-row" : "flex-row-reverse"}`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isAgent
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-white/10 text-foreground border border-white/20"
                }`}
              >
                {isAgent ? <Bot className="size-4" /> : <User className="size-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  isAgent
                    ? "bg-secondary/50 border border-border text-foreground"
                    : "bg-primary text-primary-foreground font-bold"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span
                  className={`mt-1.5 block text-[10px] font-latin opacity-60 ${
                    isAgent ? "text-muted-foreground" : "text-primary-foreground"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </motion.div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bot className="size-4 animate-spin text-primary" />
            <span>د. سايبر يحلل معطيات التوأم الرقمي ويكتب الرد...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="border-t border-border/60 bg-secondary/20 px-6 py-2.5">
        <span className="block text-[11px] font-bold text-muted-foreground mb-2 text-right">
          استفسارات سريعة مقترحة لتوأمك:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PROMPTS.map((promptText, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(promptText)}
              disabled={isSending}
              className="rounded-lg border border-border bg-background/60 hover:bg-primary/10 hover:border-primary/40 px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="border-t border-border/80 bg-secondary/30 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="اكتب سؤالك أو استشارتك لد. سايبر هنا..."
            className="flex-1 rounded-xl border border-input bg-background/80 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isSending}
            className="inline-flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
