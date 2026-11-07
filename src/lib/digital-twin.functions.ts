import { createServerFn } from "@tanstack/react-start";
import { ai } from "@/lib/gemini-client";
import type {
  LearnerDigitalTwin,
  TwinDiagnosticReport,
  PredictiveSimulationResult,
} from "@/lib/digital-twin.types";

/**
 * Server Function: Diagnoses the learner's Digital Twin using Gemini 3.8 Flash,
 * analyzing cognitive strengths, behavioral traits, and misconceptions.
 */
export const diagnoseTwinWithAI = createServerFn({ method: "POST" })
  .inputValidator((input: { twin: LearnerDigitalTwin }) => {
    if (!input || !input.twin) throw new Error("بيانات التوأم الرقمي غير صالحة");
    return input;
  })
  .handler(
    async ({
      data,
    }): Promise<{ report: TwinDiagnosticReport; source: "gemini" | "rule_engine" }> => {
      const { twin } = data;

      // First prepare fallback deterministic pedagogical report
      const fallbackReport: TwinDiagnosticReport = generateDeterministicDiagnostic(twin);

      if (!process.env.GEMINI_API_KEY) {
        return { report: fallbackReport, source: "rule_engine" };
      }

      try {
        const summaryContext = `
بيانات التوأم الرقمي للمتعلم:
- اسم المتعلم: ${twin.studentName}
- الطور المعرفي الحالي: ${twin.stageTitle}
- نسبة الإتقان الكلية: ${twin.overallMastery}%
- مؤشر المناعة السيبرانية: ${twin.immunityHealthScore}%
- نمط اتخاذ القرار: ${twin.behavior.decisionVelocity}
- مؤشر الفضول التجريبي: ${twin.behavior.curiosityIndex}%
- مؤشر المرونة المعرفية: ${twin.behavior.cognitiveResilience}%

درجات الأبعاد الإدراكية:
1. كلمات المرور و BIOS: ${twin.dimensions.passwords_accounts.score}% (${twin.dimensions.passwords_accounts.masteryLevel})
2. كشف البرمجيات الخبيثة: ${twin.dimensions.malware_scanning.score}% (${twin.dimensions.malware_scanning.masteryLevel})
3. جدران الحماية والشبكات: ${twin.dimensions.firewall_network.score}% (${twin.dimensions.firewall_network.masteryLevel})
4. النسخ الاحتياطي والتشفير: ${twin.dimensions.backup_crypto_hash.score}% (${twin.dimensions.backup_crypto_hash.masteryLevel})
5. أمن تكنولوجيا التعليم: ${twin.dimensions.edtech_security.score}% (${twin.dimensions.edtech_security.masteryLevel})

المفاهيم البديلة المكتشفة:
${
  twin.misconceptions
    .filter((m) => m.isDetected)
    .map((m) => `• ${m.title}: ${m.description}`)
    .join("\n") || "لا توجد مفاهيم بديلة مسجلة حتى الآن."
}
`;

        const prompt = `
أنت "د. سايبر" (Dr. Cyber)، الوكيل الذكي التوجيهي والمشرف على نظام "التوأم الرقمي للمتعلم" في مختبر الأمن السيبراني بقسم تكنولوجيا التعليم.
مهمتك: تقديم تشخيص تربوي وتكنولوجي دقيق وعميق لحالة التوأم الرقمي لهذا المتعلم.

قم بتحليل البيانات أعلاه وإرجاع نص بتنسيق JSON حصرياً مطابق للمفاتيح التالية:
{
  "overallAssessment": "فقرة موجزة وعميقة (سرد تحفيزي وتشخيصي لمستوى التوأم)",
  "learnerArchetype": "لقب وصفي لنمط تفكير المتعلم السيبراني (مثل: المدافع التحليلي، أو المستكشف السريع، أو مهندس الأنظمة الحذر)",
  "dominantStrength": "نقطة القوة الأبرز المدعمة بالأرقام والموضوعات",
  "criticalVulnerability": "الثغرة الإدراكية أو المفهوم الأكثر احتياجاً للتدخل الفوري",
  "recommendedPath": {
    "immediateStep": "الإجراء الميداني الأول الموصى به",
    "lessonSlug": "slug الدرس المقترح (passwords, user-rights, malware-detection, scanning-tools, avast, comodo-firewall, todo-backup, encrypto, hashing, security-summary)",
    "practiceTool": "الأداة الموصى بالتدرب عليها (مثل: محاكي Avast، محاكي Comodo، أو حل سيناريوهات تكنولوجيا التعليم)"
  },
  "pedagogicalTip": "نصيحة تربوية ذهبية للمتعلم لتعزيز مناعته الرقمية"
}

لا تضف أي نص خارج كائن الـ JSON.
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt + "\n\n" + summaryContext,
          config: {
            responseMimeType: "application/json",
            systemInstruction:
              "أنت د. سايبر، الوكيل الذكي التربوي لمختبر الأمن السيبراني وتكنولوجيا التعليم. تقدم تشخيصات تربوية رفيعة المستوى بأسلوب علمي واضح ومشجع.",
          },
        });

        const jsonText = (response.text ?? "").trim();
        const parsed = JSON.parse(jsonText) as TwinDiagnosticReport;
        return { report: parsed, source: "gemini" };
      } catch (err) {
        console.warn("Gemini twin diagnostic fallback invoked:", err);
        return { report: fallbackReport, source: "rule_engine" };
      }
    },
  );

/**
 * Server Function: Interactive pedagogical dialogue with Dr. Cyber (the intelligent agent).
 */
export const chatWithAgentAI = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      messages: { role: "user" | "model"; text: string }[];
      twinSummary: string;
      latestQuestion: string;
    }) => {
      if (!input.latestQuestion || input.latestQuestion.trim().length === 0) {
        throw new Error("سؤال المتعلم فارغ");
      }
      return input;
    },
  )
  .handler(
    async ({
      data,
    }): Promise<{
      reply: string;
      emotion: "analytical" | "encouraging" | "alert" | "celebratory";
    }> => {
      const { twinSummary, latestQuestion, messages } = data;

      if (!process.env.GEMINI_API_KEY) {
        return generateRuleBasedAgentReply(latestQuestion, twinSummary);
      }

      try {
        const historyContext = messages
          .slice(-6)
          .map((m) => `${m.role === "user" ? "المتعلم" : "د. سايبر"}: ${m.text}`)
          .join("\n");

        const prompt = `
أنت "د. سايبر" (Dr. Cyber)، الوكيل الذكي المتكيف في موقع "مختبر الأمن السيبراني" لطلاب قسم تكنولوجيا التعليم.
أنت تراقب "التوأم الرقمي" للمتعلم وتعرف نقاط قوته وضعفه وسلوكه في حل المشكلات ومحاكيات البرامج (Avast و Comodo Firewall وغيرها).

ملخص حالة التوأم الرقمي للمتعلم حالياً:
${twinSummary}

تاريخ الحوار السابق:
${historyContext}

سؤال المتعلم الأخير:
"${latestQuestion}"

تعليمات رد الوكيل الذكي:
1. أجب بلغة عربية فصحى مشجعة، واضحة ومباشرة (في حدود 2-4 فقرات قصيرة).
2. اربط الإجابة بالدروس المقررة في المنهج (كلمات المرور، حسابات المستخدمين، أدوات الفحص، الجدار الناري، النسخ الاحتياطي، التشفير والتجزئة، أو سيناريوهات معامل تكنولوجيا التعليم).
3. إذا كان سؤاله عن مشكلة أمنية أو سيناريو، اشرح له المنطق السيبراني ولماذا يفشل خيار معين وينجح خيار آخر.
4. لا تدّعي أنك مجرد شات بوت، بل تحدث كوكيل ذكي تربوي يرى انعكاس إدراكه في توأمه الرقمي.
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction:
              "أنت الوكيل الذكي د. سايبر. نبرتك: حكيم، مشجع، عملي، دقيق علمياً وسريع البديهة في الأمن السيبراني التعليمي.",
          },
        });

        const reply =
          response.text ||
          "أنا هنا معك لمساعدتك وتوجيه توأمك الرقمي نحو الاحترافية السيبرانية. تفضل بطرح أي سؤال تود فهمه بعمق!";

        // Derive subtle emotion based on sentiment
        let emotion: "analytical" | "encouraging" | "alert" | "celebratory" = "analytical";
        if (reply.includes("أحسنت") || reply.includes("ممتاز") || reply.includes("إنجاز")) {
          emotion = "celebratory";
        } else if (
          reply.includes("انتبه") ||
          reply.includes("خطر") ||
          reply.includes("احذر") ||
          reply.includes("ثغرة")
        ) {
          emotion = "alert";
        } else if (reply.includes("ثابر") || reply.includes("بسيطة") || reply.includes("تستطيع")) {
          emotion = "encouraging";
        }

        return { reply, emotion };
      } catch (err) {
        console.warn("Gemini agent chat fallback:", err);
        return generateRuleBasedAgentReply(latestQuestion, twinSummary);
      }
    },
  );

/**
 * Server Function: Run a predictive simulation on the learner's digital twin
 * to see how it performs against a simulated threat scenario.
 */
export const runTwinPredictionAI = createServerFn({ method: "POST" })
  .inputValidator((input: { twin: LearnerDigitalTwin; threatId: string }) => {
    return input;
  })
  .handler(async ({ data }): Promise<PredictiveSimulationResult> => {
    const { twin, threatId } = data;
    return simulateTwinResponse(twin, threatId);
  });

/* =========================================================================
   Deterministic Pedagogical Engine (Reliable offline fallback & simulation)
   ========================================================================= */

function generateDeterministicDiagnostic(twin: LearnerDigitalTwin): TwinDiagnosticReport {
  // Find highest & lowest dimension
  const entries = Object.values(twin.dimensions);
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const highest = sorted[0] || {
    titleArabic: "المفاهيم العامة",
    score: 50,
    recommendedLessonSlug: "security-summary",
  };
  const lowest = sorted[sorted.length - 1] || {
    titleArabic: "جدران الحماية",
    score: 30,
    recommendedLessonSlug: "comodo-firewall",
  };

  let archetype = "المدافع المتوازن الواعد";
  if (twin.behavior.curiosityIndex > 70 && twin.overallMastery >= 60) {
    archetype = "مهندس الأمن الاستكشافي المتقدم";
  } else if (twin.behavior.decisionVelocity === "متأنٍ ومحلل") {
    archetype = "المحلل السيبراني المنهجي الصبور";
  } else if (twin.overallMastery < 40) {
    archetype = "المتدرب الواعد في بناء الأساسيات";
  }

  return {
    overallAssessment: `يمتلك توأمك الرقمي حالياً مؤشر مناعة سيبرانية يبلغ ${twin.immunityHealthScore}%، مع معدل إتقان عام ${twin.overallMastery}%. يظهر سلوكك الإدراكي ميلاً نحو نمط "${twin.behavior.decisionVelocity}" مع فضول تجريبي بنسبة ${twin.behavior.curiosityIndex}%. التوأم يوثق ثباتاً جيداً في مجال (${highest.titleArabic}) ويحتاج إلى دعم عاجل في (${lowest.titleArabic}).`,
    learnerArchetype: archetype,
    dominantStrength: `إتقان واضح في ركيزة (${highest.titleArabic}) بنسبة استيعاب ${highest.score}% من خلال التطبيقات الصحيحة.`,
    criticalVulnerability: `فجوة إدراكية ملحوظة في ركيزة (${lowest.titleArabic}) حيث تبلغ النسبة ${lowest.score}%، مما يعرض التوأم لثغرات في السيناريوهات المشابهة.`,
    recommendedPath: {
      immediateStep: `دراسة درس "${lowest.titleArabic}" وتطبيق تدريباته التفاعلية فوراً لسد الفجوة.`,
      lessonSlug: lowest.recommendedLessonSlug,
      practiceTool:
        lowest.key === "malware_scanning"
          ? "محاكي Avast لتطبيق الفحص وقت الإقلاع والعزل"
          : lowest.key === "firewall_network"
            ? "محاكي Comodo لضبط قواعد جدار الحماية وحظر المنافذ"
            : "قسم سيناريوهات ومشكلات تكنولوجيا التعليم",
    },
    pedagogicalTip:
      "الأمن السيبراني لا يعتمد على حفظ الخطوات بل على فهم منطق المهاجم ونقاط ضعف النظام؛ ركّز على فلسفة أقل الصلاحيات وقاعدة 3-2-1 في كل خطوة.",
  };
}

function generateRuleBasedAgentReply(
  question: string,
  twinSummary: string,
): { reply: string; emotion: "analytical" | "encouraging" | "alert" | "celebratory" } {
  const q = question.toLowerCase();

  if (q.includes("ضعف") || q.includes("أضعف") || q.includes("ثغرة") || q.includes("ناقص")) {
    return {
      reply:
        "بناءً على قراءة توأمك الرقمي الآن: رصدت أن أقل الأبعاد إتقاناً لديك يرتبط بالتعامل مع جدران الحماية وقواعد المنافذ أو النسخ الاحتياطي 3-2-1. أنصحك بفتح محاكي COMODO لتجربة قواعد الحظر العامة أو مراجعة درس EaseUS Todo Backup لسد هذه الفجوة على الفور!",
      emotion: "alert",
    };
  }

  if (q.includes("3-2-1") || q.includes("نسخ") || q.includes("احتياط") || q.includes("backup")) {
    return {
      reply:
        "قاعدة النسخ الاحتياطي 3-2-1 الذهبية في تكنولوجيا التعليم تعني: امتلاك (3) نسخ من بياناتك التعليمية ومشاريع التخرج، على وسيطين مختلفين (2) مثل قرص خارجي وسحابة، مع الاحتفاظ بنسخة واحدة (1) خارج مقر العمل أو المعمل لحمايتها من الكوارث المادية أو الفدية.",
      emotion: "analytical",
    };
  }

  if (q.includes("bios") || q.includes("كلمة سر") || q.includes("password") || q.includes("قرص")) {
    return {
      reply:
        "تذكر دائماً الفارق المحوري الذي يركز عليه توأمك الرقمي: كلمة مرور النظام (System Password) في BIOS تحمي فقط مرحلة بدء التشغيل، بينما كلمة مرور القرص الصلب (HDD Password) هي الوحيدة التي تمنع الوصول للبيانات حتى لو فُك القرص ورُكب في جهاز آخر!",
      emotion: "analytical",
    };
  }

  if (q.includes("جدار") || q.includes("firewall") || q.includes("comodo") || q.includes("منفذ")) {
    return {
      reply:
        "جدار الحماية COMODO Firewall يعمل كحارس بوابات للشبكة؛ يراقب كل اتصال وارد وصادر (Inbound/Outbound). في معامل تكنولوجيا التعليم، ننصح بتفعيل معالج المنافذ الخفية (Stealth Ports) لمنع المتسللين من اكتشاف الأجهزة عبر الفحص الشبكي.",
      emotion: "analytical",
    };
  }

  if (q.includes("avast") || q.includes("فيروس") || q.includes("malware") || q.includes("عزل")) {
    return {
      reply:
        "أداة الفحص عند الإقلاع (Boot-Time Scan) في Avast وقرص الإنقاذ (Rescue Disk) هما الحل الأقوى للملفات الخبيثة المتجذرة في نظام التشغيل (Rootkits) قبل أن تبدأ العمل مع الويندوز.",
      emotion: "encouraging",
    };
  }

  return {
    reply: `أهلاً بك! أنا "د. سايبر"، مرشدك الذكي لمتابعة توأمك الرقمي. استناداً لبيانات توأمك (${twinSummary.slice(0, 80)}...)، أنا هنا للإجابة عن أي استفسار في المنهج، تحليل السيناريوهات، أو توجيهك للمحاكي الأنسب لتعزيز مناعتك الرقمية. بم تفكر الآن؟`,
    emotion: "encouraging",
  };
}

function simulateTwinResponse(
  twin: LearnerDigitalTwin,
  threatId: string,
): PredictiveSimulationResult {
  const threats = [
    {
      id: "ransomware_lab",
      scenarioTitle: "هجوم فدية يستهدف حواسيب إنتاج الوسائط المتعددة بالمعمل",
      threatType: "برمجية فدية مشفرة (Ransomware)",
      contextDescription:
        "محاولة تشفير مفاجئة لكافة مجلدات مشروعات تخرج الطلاب بالمعمل عبر منفذ شبكة مفتوح ومشاركة غير محمية.",
      keyDimension: "backup_crypto_hash" as const,
      secondaryDimension: "firewall_network" as const,
      riskPoints: [
        "إمكانية فقدان المشروعات في حال عدم وجود نسخة احتياطية 3-2-1 خارج الشبكة.",
        "خطر انتشار التشفير لكافة الأجهزة عبر مشاركة المجلدات غير المقيدة بصلاحيات NTFS.",
      ],
      countermeasure:
        "تطبيق النسخ الاحتياطي التزايدي ببرنامج EaseUS Todo Backup مع حظر المنافذ غير الضرورية بجدار حماية COMODO.",
    },
    {
      id: "usb_smartscreen",
      scenarioTitle: "فيروس تشغيل تلقائي عبر فلاشة موصولة بشاشة ذكية في قاعة المحاضرات",
      threatType: "برمجية خبيثة عبر وسائط خارجية (Autorun / Worm)",
      contextDescription:
        "طالب يوصل فلاش ميموري مصاب ببرمجية تخفي الملفات وتستبدلها باختصارات وهمية أثناء تشغيل العرض.",
      keyDimension: "malware_scanning" as const,
      secondaryDimension: "passwords_accounts" as const,
      riskPoints: [
        "النقر على الاختصارات الوهمية مما يؤدي لتنفيذ الكود الخبيث في خلفية نظام الشاشة الذكية.",
        "عدم إظهار الامتدادات والملفات المخفية في مستكشف الملفات.",
      ],
      countermeasure:
        "استخدام فحص Avast الفوري للوسائط الخارجية، وإظهار امتدادات الملفات وإلغاء صلاحيات التشغيل التلقائي.",
    },
    {
      id: "exam_portal_leak",
      scenarioTitle: "محاولة تسريب بنك أسئلة امتحان إلكتروني عبر شبكة الكلية",
      threatType: "اعتراض بيانات غير مشفرة وهجوم مان-إن-ذا-ميدل (Man-in-the-Middle)",
      contextDescription:
        "محاولة اعتراض وتعديل درجات الطلاب أثناء إرسالها من جهاز المشرف إلى خادم الامتحانات عبر شبكة Wi-Fi غير مؤمنة.",
      keyDimension: "edtech_security" as const,
      secondaryDimension: "passwords_accounts" as const,
      riskPoints: [
        "تسريب الأسئلة السرية والدرجات في حال عدم استخدام تشفير AES مسبق ببرنامج Encrypto.",
        "خطر انتحال عنوان جهاز المشرف عبر هجمات ARP Spoofing على شبكة المعمل.",
      ],
      countermeasure:
        "تشفير بنوك الأسئلة ببرنامج Encrypto، وتفعيل ميزة Anti-ARP Spoofing في جدار حماية COMODO.",
    },
  ];

  const selectedThreat = threats.find((t) => t.id === threatId) || threats[0];
  const primaryScore = twin.dimensions[selectedThreat.keyDimension]?.score ?? 50;
  const secondaryScore = twin.dimensions[selectedThreat.secondaryDimension]?.score ?? 50;

  // Calculate predicted success rate based on learner's actual dimension scores & resilience
  const baseSuccess = Math.round(
    primaryScore * 0.6 + secondaryScore * 0.3 + twin.behavior.cognitiveResilience * 0.1,
  );
  const predictedSuccessRate = Math.min(99, Math.max(15, baseSuccess));

  let decisionText = "";
  if (predictedSuccessRate >= 80) {
    decisionText = `استجابة نموذجية: سيتعرف التوأم فوراً على متجه الهجوم، ويقوم بعزل التهديد وتطبيق بروتوكولات الحماية الموصى بها في المنهج بدقة واحترافية.`;
  } else if (predictedSuccessRate >= 50) {
    decisionText = `استجابة جزئية: سيتمكن التوأم من إيقاف الهجوم الأساسي، لكنه قد يتعثر في خطوة حاسمة (مثل التحقق من البصمة الرقمية أو فصل النسخة الاحتياطية عن الشبكة).`;
  } else {
    decisionText = `استجابة عالية المخاطر: قد يتعرض التوأم للاختراق أو الخطأ في اتخاذ القرار المناسب نتيجة تدني درجة الاستيعاب في بعد (${selectedThreat.keyDimension}).`;
  }

  return {
    id: `sim-${Date.now()}`,
    scenarioTitle: selectedThreat.scenarioTitle,
    threatType: selectedThreat.threatType,
    contextDescription: selectedThreat.contextDescription,
    predictedSuccessRate,
    predictedDecision: decisionText,
    identifiedRiskPoints: selectedThreat.riskPoints,
    suggestedDefensiveCountermeasure: selectedThreat.countermeasure,
    simulatedDate: new Date().toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
