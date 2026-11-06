import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircleQuestion, Send, Sparkles, Loader2, Bot } from "lucide-react";
import { askLesson } from "@/lib/lesson-qa.functions";

interface QaEntry {
  question: string;
  answer: string;
  error?: string | undefined;
}

export function LessonQa({ lessonSlug }: { lessonSlug: string }) {
  const askFn = useServerFn(askLesson);
  const [entries, setEntries] = useState<QaEntry[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const q = question.trim();
    if (!q || loading) return;
    setQuestion("");
    setLoading(true);
    try {
      const res = await askFn({ data: { slug: lessonSlug, question: q } });
      setEntries((prev) => [
        ...prev,
        {
          question: q,
          answer: res.answer,
          error: res.error,
        },
      ]);
    } catch (err) {
      setEntries((prev) => [
        ...prev,
        {
          question: q,
          answer: "",
          error: err instanceof Error ? err.message : "حدث خطأ غير متوقع.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel mt-12 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border bg-secondary/60 px-6 py-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <MessageCircleQuestion className="size-5" />
        </span>
        <div>
          <h2 className="font-extrabold">اسأل عن هذا الدرس</h2>
          <p className="text-xs text-muted-foreground">
            اكتب سؤالك وسيجيبك مساعد الدرس بإجابة مبسطة من محتوى الدرس نفسه.
          </p>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="space-y-5 px-6 py-6">
          {entries.map((e, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-start">
                <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-secondary px-4 py-3 text-sm font-semibold leading-relaxed">
                  {e.question}
                </p>
              </div>
              {e.error ? (
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-tl-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-destructive">
                    {e.error}
                  </p>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-primary/30 bg-primary/10 px-4 py-3">
                    <span className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-primary">
                      <Bot className="size-3.5" />
                      إجابة مساعد الدرس
                    </span>
                    <p className="text-sm leading-relaxed">{e.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-end gap-2 px-6 pb-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          مساعد الدرس يكتب الإجابة…
        </div>
      )}

      <div className="border-t border-border px-6 py-4">
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="مثال: ما الفرق بين كلمة مرور النظام وكلمة مرور الإعدادات؟"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <button
            onClick={submit}
            disabled={loading || question.trim().length < 3}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03] disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
          >
            <Send className="size-4" />
            إرسال
          </button>
        </div>
        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="size-3 text-primary" />
          الإجابات مستندة إلى محتوى هذا الدرس فقط — للاستفسارات الأخرى راجع بقية الدروس.
        </p>
      </div>
    </section>
  );
}
