import { createServerFn } from "@tanstack/react-start";
import { generateResponse } from "@lovable.dev/ai-gateway";
import { lessons } from "@/content/lessons";

export interface PracticeQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface LessonPracticeResult {
  questions: PracticeQuestion[];
  error?: string;
}

function lessonContentText(
  lessonSlug: string,
): { title: string; enTitle: string; text: string } | null {
  const lesson = lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return null;
  const text = lesson.blocks
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
            (b.title ? b.title + ":\n" : "") + b.items.map((s, i) => `${i + 1}. ${s}`).join("\n")
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
  return { title: lesson.title, enTitle: lesson.enTitle, text };
}

/**
 * ينشئ أسئلة تدريب مخصصة من محتوى الدرس المحدد حسب الموضوعات التي يريد المتعلم التدرب عليها.
 * المُدخل: معرف الدرس (slug) وقائمة الموضوعات.
 */
export const generatePractice = createServerFn({ method: "POST" })
  .inputValidator((input: { slug: string; topics: string[] }) => {
    if (typeof input !== "object" || input === null) throw new Error("Invalid input");
    if (!lessons.some((l) => l.slug === input.slug)) throw new Error("الدرس غير موجود");
    const topics = input.topics
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 6);
    if (topics.length === 0) throw new Error("اختر موضوعًا واحدًا على الأقل للتدريب");
    for (const t of topics) {
      if (t.length > 80) throw new Error("أحد الموضوعات طويل جدًا، اكتبه بصيغة أقصر");
    }
    return { slug: input.slug, topics };
  })
  .handler(async ({ data }): Promise<LessonPracticeResult> => {
    try {
      const lesson = lessonContentText(data.slug);
      if (!lesson) return { questions: [], error: "الدرس غير موجود." };

      const response = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions:
          "أنت مُعدّ اختبارات تعليمية داخل موقع «مختبر الأمن السيبراني» لمقرر برامج وأدوات الحماية المتقدمة وإجراءات الأمان للحاسب.\n" +
          "مهمتك: إنشاء أسئلة تدريب من اختيار متعدد (MCQ) مبنية حصريًا على محتوى الدرس المرفق، وتركّز على الموضوعات التي طلبها المتعلم.\n" +
          "قواعد صارمة:\n" +
          "1. كل سؤال يجب أن تُجاب إجابته من نص الدرس المرفق فقط؛ لا تخترع معلومات من خارج الدرس.\n" +
          "2. اربط كل سؤال بأحد الموضوعات المطلوبة، ووزّع الأسئلة على الموضوعات.\n" +
          "3. لكل سؤال أربعة خيارات بالضبط، خيار واحد صحيح، والبقية معقولة ومستمدة من مفاهيم الدرس أو مضاداته.\n" +
          "4. اكتب شرحًا موجزًا (سطر أو سطران) يوضح الإجابة الصحيحة مستندًا إلى الدرس.\n" +
          "5. عربية فصحى ميسرة، والمصطلح الإنجليزي بين قوسين عند الحاجة.\n" +
          '6. أعِد JSON فقط دون أي نص قبله أو بعده، بالبنية: {"questions":[{"question":"...","options":["...","...","...","..."],"answerIndex":0,"explanation":"..."}]} حيث answerIndex رقم بين 0 و3.',
        input:
          `محتوى الدرس (${lesson.title} — ${lesson.enTitle}):\n\n${lesson.text}\n\n` +
          `الموضوعات المطلوب التدرب عليها:\n${data.topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n` +
          "أنشئ 6 أسئلة تدريب موزعة على هذه الموضوعات، وأعِد JSON فقط بالبنية المطلوبة.",
      });

      const raw =
        response.output
          ?.map((o) =>
            o.type === "message"
              ? (o.content ?? []).map((p) => (p.type === "output_text" ? p.text : "")).join("")
              : "",
          )
          .join("") ?? "";

      const parsed = extractQuestions(raw);
      if (!parsed) return { questions: [], error: "لم تكتمل الأسئلة، حاول مرة أخرى." };
      return { questions: parsed };
    } catch (err) {
      console.error("generatePractice error:", err);
      return {
        questions: [],
        error: "تعذّر إنشاء أسئلة التدريب حاليًا. حاول مرة أخرى بعد قليل.",
      };
    }
  });

/** يستخرج مصفوفة الأسئلة من رد النموذج مع تجاهل أي نص زائد حول JSON. */
function extractQuestions(raw: string): PracticeQuestion[] | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const obj = JSON.parse(raw.slice(start, end + 1)) as { questions?: unknown };
    const list = Array.isArray(obj.questions) ? obj.questions : [];
    const questions: PracticeQuestion[] = [];
    for (const q of list) {
      if (typeof q !== "object" || q === null) continue;
      const item = q as {
        question?: unknown;
        options?: unknown;
        answerIndex?: unknown;
        explanation?: unknown;
      };
      const question = typeof item.question === "string" ? item.question.trim() : "";
      const options = Array.isArray(item.options)
        ? item.options
            .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
            .slice(0, 4)
        : [];
      const answerIndex = typeof item.answerIndex === "number" ? item.answerIndex : -1;
      const explanation = typeof item.explanation === "string" ? item.explanation.trim() : "";
      if (
        question &&
        options.length === 4 &&
        answerIndex >= 0 &&
        answerIndex < options.length &&
        explanation
      ) {
        questions.push({ question, options, answerIndex, explanation });
      }
    }
    return questions.length > 0 ? questions : null;
  } catch {
    return null;
  }
}
