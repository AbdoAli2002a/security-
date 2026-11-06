import { createServerFn } from "@tanstack/react-start";
import { generateResponse } from "@lovable.dev/ai-gateway";
import { lessons } from "@/content/lessons";

export interface LessonQaResult {
  answer: string;
  error?: string;
}

/**
 * يجيب أسئلة المتعلم إجابات مبسطة مستندة حصريًا إلى محتوى الدرس المحدد.
 * المُدخل: معرف الدرس (slug) وسؤال المتعلم.
 */
export const askLesson = createServerFn({ method: "POST" })
  .inputValidator((input: { slug: string; question: string }) => {
    if (typeof input !== "object" || input === null) throw new Error("Invalid input");
    const question = input.question.trim();
    if (question.length < 3) throw new Error("السؤال قصير جدًا");
    if (question.length > 600) throw new Error("السؤال طويل جدًا");
    if (!lessons.some((l) => l.slug === input.slug)) throw new Error("الدرس غير موجود");
    return { slug: input.slug, question };
  })
  .handler(async ({ data }): Promise<LessonQaResult> => {
    try {
      const lesson = lessons.find((l) => l.slug === data.slug)!;

      // تحويل كتل الدرس إلى نص عادي لاستخدامها كسياق للنموذج
      const contentText = lesson.blocks
        .map((b) => {
          switch (b.type) {
            case "lead":
            case "paragraph":
            case "subheading":
            case "quote":
              return b.text + (b.type === "subheading" && b.en ? ` (${b.en})` : "");
            case "list":
              return b.items.map((i) => `• ${i}`).join("\n");
            case "steps":
              return (
                (b.title ? b.title + ":\n" : "") +
                b.items.map((s, i) => `${i + 1}. ${s}`).join("\n")
              );
            case "note":
              return (b.title ? `[${b.title}] ` : "") + b.text;
            case "table":
              return b.head.join(" | ") + "\n" + b.rows.map((r) => r.join(" | ")).join("\n");
            default:
              return "";
          }
        })
        .filter(Boolean)
        .join("\n\n");

      const response = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions:
          "أنت مساعد تعليمي داخل موقع «مختبر الأمن السيبراني» لمقرر برامج وأدوات الحماية المتقدمة وإجراءات الأمان للحاسب. " +
          "مهمتك: الإجابة على أسئلة المتعلم بإجابات مبسطة وواضحة، وباللغة العربية الفصحى الميسرة.\n" +
          "قواعد صارمة:\n" +
          "1. اعتمد حصريًا على محتوى الدرس المرفق؛ لا تخترع معلومات من خارجه.\n" +
          "2. إن لم تكن الإجابة موجودة في الدرس، قل بصدق إن هذا التفصيل غير مشروح في الدرس واقترح الجزء من الدرس الأقرب للموضوع.\n" +
          "3. بسّط الإجابة للمبتدئين: جمل قصيرة، مصطلح عربي ثم مصطلحه الإنجليزي بين قوسين عند الحاجة.\n" +
          "4. استخدم نقاطًا مرقمة عند تعدد الأفكار، ولا تتجاوز الإجابة 150 كلمة.\n" +
          "5. لا تذكر أنك نموذج ذكاء اصطناعي ولا تذكر كلمة «سياق»؛ اسرد كأنك تشرح المادة.",
        input: `محتوى الدرس (${lesson.title} — ${lesson.enTitle}):\n\n${contentText}\n\nسؤال المتعلم: ${data.question}`,
      });

      const answer =
        response.output
          ?.map((o) =>
            o.type === "message"
              ? (o.content ?? []).map((p) => (p.type === "output_text" ? p.text : "")).join("")
              : "",
          )
          .join("") ?? "";

      if (!answer.trim()) return { answer: "", error: "لم تصل إجابة، حاول مرة أخرى." };
      return { answer };
    } catch (err) {
      console.error("askLesson error:", err);
      return {
        answer: "",
        error: "تعذّر الوصول إلى مساعد الدرس حاليًا. حاول مرة أخرى بعد قليل.",
      };
    }
  });
