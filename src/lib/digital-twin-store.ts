import { securityScenarios } from "@/content/scenarios-data";
import type {
  LearnerDigitalTwin,
  CognitiveDimensionKey,
  DimensionMetric,
  BehavioralAttributes,
  Misconception,
  PredictiveSimulationResult,
  AvatarStyle,
} from "./digital-twin.types";

const STORAGE_KEY = "cyberlab_digital_twin_v1";
const SCENARIOS_STORAGE_KEY = "cyberlab_scenario_answers";
const SIMULATOR_ACTIONS_KEY = "cyberlab_simulator_interactions";

const INITIAL_MISCONCEPTIONS: Misconception[] = [
  {
    id: "misc_bios_password",
    title: "الخلط بين كلمة مرور النظام (System) وكلمة مرور القرص (HDD Password)",
    description:
      "الاعتقاد بأن كلمة مرور الـ BIOS للنظام تكفي لحماية البيانات من السرقة المادية حتى لو نُقل الهارد ديسك لجهاز آخر.",
    scientificCorrection:
      "كلمة مرور القرص الصلب (HDD Password) هي الوحيدة التي تقفل وحدة التخزين ذاتها وتمنع قراءة بياناتها على أي جهاز آخر، بينما كلمة مرور النظام تحمي مرحلة الإقلاع فقط.",
    isDetected: false,
    relatedLessonSlug: "passwords",
    relatedLessonTitle: "مهارات التعامل مع كلمات المرور و BIOS",
  },
  {
    id: "misc_single_av",
    title: "الاعتماد على مضاد فيروسات أحادي كمرجع قطعي للملفات النادرة",
    description:
      "افتراض أن خلو الملف من التهديد في فحص مضاد فيروسات واحد يعني أنه نظيف بنسبة 100%.",
    scientificCorrection:
      "الملفات المشتبه بها النادرة يجب فحصها بمحركات فحص متعددة سحابياً (مثل VirusTotal أو Jotti) لتفادي ثغرات التوقيعات الأحادية.",
    isDetected: false,
    relatedLessonSlug: "scanning-tools",
    relatedLessonTitle: "أدوات ومواقع الفحص السحابي المتعددة",
  },
  {
    id: "misc_backup_mirror",
    title: "مساواة النسخ على نفس القرص بقاعدة النسخ الاحتياطي 3-2-1",
    description:
      "الاعتقاد بأن نسخ المجلد في بارتيشن آخر (مثل D:) على نفس القرص الصلب يفي بمتطلبات النسخ الاحتياطي السليم.",
    scientificCorrection:
      "قاعدة 3-2-1 تتطلب وجود 3 نسخ، على وسيطين مختلفين تقنياً (مثل HDD وسحابة)، مع حفظ نسخة واحدة على الأقل خارج الموقع لحمايتها من التلف الفيزيائي والسرقة.",
    isDetected: false,
    relatedLessonSlug: "todo-backup",
    relatedLessonTitle: "برنامج النسخ الاحتياطي EaseUS Todo Backup",
  },
  {
    id: "misc_admin_convenience",
    title: "العمل الدائم بحساب المسؤول (Administrator) بدلاً من الحساب القياسي",
    description:
      "تفضيل العمل بحساب المشرف لتفادي رسائل طلب الإذن، مما يعطي البرمجيات الخبيثة صلاحيات كاملة للنظام.",
    scientificCorrection:
      "مبدأ أقل الصلاحيات (Least Privilege) يحتم استخدام حساب مستخدم قياسي (Standard User) للمهام اليومية لمنع تثبيت البرمجيات الضارة بصمت.",
    isDetected: false,
    relatedLessonSlug: "user-rights",
    relatedLessonTitle: "صلاحيات المستخدمين وحسابات ويندوز",
  },
  {
    id: "misc_firewall_antivirus",
    title: "الاعتقاد بأن مضاد الفيروسات يغني تماماً عن جدار الحماية (Firewall)",
    description:
      "الظن بأن وظيفة الجدار الناري مكررة ولا داعي لتخصيص قواعد المنافذ والاتصالات الواردة.",
    scientificCorrection:
      "مضاد الفيروسات يفحص الملفات والذاكرة، بينما جدار الحماية (Firewall) يراقب حزم البيانات والمنافذ والاتصالات الواردة والصادرة على مستوى الشبكة.",
    isDetected: false,
    relatedLessonSlug: "comodo-firewall",
    relatedLessonTitle: "جدار الحماية المتقدم COMODO Firewall",
  },
  {
    id: "misc_file_integrity_size",
    title: "الاعتماد على حجم الملف فقط للتحقق من عدم التلاعب به",
    description:
      "مقارنة حجم الملف المحمّل بالبايت كدليل على سلامته بدلاً من حساب البصمة الرقمية (Hash).",
    scientificCorrection:
      "يمكن للمهاجم حقن كود خبيث مع الحفاظ على نفس الحجم تماماً؛ دالة التجزئة (مثل SHA-256) عبر IgorWare Hasher هي الضمان الوحيد للسلامة.",
    isDetected: false,
    relatedLessonSlug: "hashing",
    relatedLessonTitle: "دوال التجزئة والتحقق من البصمة الرقمية",
  },
];

function getInitialDimensions(): Record<CognitiveDimensionKey, DimensionMetric> {
  return {
    passwords_accounts: {
      key: "passwords_accounts",
      titleArabic: "كلمات المرور والصلاحيات",
      enTitle: "Passwords & User Rights",
      score: 45,
      masteryLevel: "مبتدئ",
      totalAttempts: 0,
      correctAnswers: 0,
      weakTopics: ["كلمات مرور BIOS", "حسابات المستخدمين القياسية"],
      strongTopics: ["قوة كلمات المرور"],
      recommendedLessonSlug: "passwords",
      recommendedLessonTitle: "مهارات التعامل مع كلمات المرور و BIOS",
    },
    malware_scanning: {
      key: "malware_scanning",
      titleArabic: "كشف البرمجيات الخبيثة والعزل",
      enTitle: "Malware Detection & Sandboxing",
      score: 50,
      masteryLevel: "متوسط",
      totalAttempts: 0,
      correctAnswers: 0,
      weakTopics: ["فحص وقت الإقلاع", "صندوق العزل Sandbox"],
      strongTopics: ["الفحص الذكي السريع"],
      recommendedLessonSlug: "avast",
      recommendedLessonTitle: "برنامج الحماية الشامل Avast Antivirus",
    },
    firewall_network: {
      key: "firewall_network",
      titleArabic: "جدران الحماية وتأمين الشبكات",
      enTitle: "Firewalls & Port Defense",
      score: 40,
      masteryLevel: "مبتدئ",
      totalAttempts: 0,
      correctAnswers: 0,
      weakTopics: ["قواعد المنافذ العامة", "المنافذ الخفية Stealth Ports"],
      strongTopics: ["مراقبة التطبيقات الجارية"],
      recommendedLessonSlug: "comodo-firewall",
      recommendedLessonTitle: "جدار الحماية المتقدم COMODO Firewall",
    },
    backup_crypto_hash: {
      key: "backup_crypto_hash",
      titleArabic: "النسخ الاحتياطي والتشفير والتجزئة",
      enTitle: "Backup, Encryption & Hashing",
      score: 55,
      masteryLevel: "متوسط",
      totalAttempts: 0,
      correctAnswers: 0,
      weakTopics: ["استراتيجية 3-2-1", "بصمات SHA-256"],
      strongTopics: ["تشفير Encrypto"],
      recommendedLessonSlug: "todo-backup",
      recommendedLessonTitle: "برنامج النسخ الاحتياطي EaseUS Todo Backup",
    },
    edtech_security: {
      key: "edtech_security",
      titleArabic: "أمن تطبيقات تكنولوجيا التعليم",
      enTitle: "EdTech Security & E-Learning",
      score: 60,
      masteryLevel: "متوسط",
      totalAttempts: 0,
      correctAnswers: 0,
      weakTopics: ["منصات الاختبارات الإلكترونية", "معامل إنتاج الميديا"],
      strongTopics: ["أخلاقيات الأمن التعليمي"],
      recommendedLessonSlug: "security-summary",
      recommendedLessonTitle: "الملخص والسيناريوهات التطبيقية المتقدمة",
    },
  };
}

/**
 * Loads the current Digital Twin state from localStorage or constructs
 * a synchronised model from answered scenarios and simulator activity.
 */
export function getStoredDigitalTwin(): LearnerDigitalTwin {
  if (typeof window === "undefined") {
    return buildDefaultDigitalTwin();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LearnerDigitalTwin;
      // Re-sync with latest scenario answers to keep twin fresh
      return syncTwinWithActivities(parsed);
    }
  } catch (err) {
    console.error("Failed to read digital twin from localStorage:", err);
  }

  const defaultTwin = buildDefaultDigitalTwin();
  return syncTwinWithActivities(defaultTwin);
}

/**
 * Saves updated Digital Twin to localStorage and emits an update event.
 */
export function saveDigitalTwin(twin: LearnerDigitalTwin): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(twin));
    window.dispatchEvent(new CustomEvent("cyberlab_twin_updated", { detail: twin }));
  } catch (err) {
    console.error("Failed to save digital twin:", err);
  }
}

/**
 * Syncs the twin with actual user activities:
 * - Scenarios answered in scenarios-challenge
 * - Simulator runs (Avast, Comodo)
 */
export function syncTwinWithActivities(baseTwin: LearnerDigitalTwin): LearnerDigitalTwin {
  if (typeof window === "undefined") return baseTwin;

  let userAnswers: Record<string, number> = {};
  try {
    const rawAnswers = localStorage.getItem(SCENARIOS_STORAGE_KEY);
    if (rawAnswers) {
      userAnswers = JSON.parse(rawAnswers);
    }
  } catch {
    userAnswers = {};
  }

  let simulatorInteractions = 0;
  try {
    const rawSim = localStorage.getItem(SIMULATOR_ACTIONS_KEY);
    if (rawSim) {
      simulatorInteractions = parseInt(rawSim, 10) || 0;
    }
  } catch {
    simulatorInteractions = 0;
  }

  const updatedDimensions = { ...baseTwin.dimensions };
  const updatedMisconceptions = [...baseTwin.misconceptions];

  // Helper map for categories
  const categoryToKey: Record<string, CognitiveDimensionKey> = {
    passwords_accounts: "passwords_accounts",
    malware_scanning: "malware_scanning",
    firewall_network: "firewall_network",
    backup_crypto_hash: "backup_crypto_hash",
    security_fundamentals: "edtech_security",
  };

  // Track attempts & correct count per category
  const stats: Record<CognitiveDimensionKey, { total: number; correct: number; errors: number }> = {
    passwords_accounts: { total: 0, correct: 0, errors: 0 },
    malware_scanning: { total: 0, correct: 0, errors: 0 },
    firewall_network: { total: 0, correct: 0, errors: 0 },
    backup_crypto_hash: { total: 0, correct: 0, errors: 0 },
    edtech_security: { total: 0, correct: 0, errors: 0 },
  };

  let totalAttempts = 0;
  let totalCorrect = 0;

  // Process all scenarios
  securityScenarios.forEach((sc) => {
    const ans = userAnswers[sc.id];
    const dimKey =
      sc.track === "edtech" ? "edtech_security" : (categoryToKey[sc.category] ?? "edtech_security");

    if (ans !== undefined) {
      totalAttempts++;
      stats[dimKey].total++;
      if (ans === sc.correctIndex) {
        totalCorrect++;
        stats[dimKey].correct++;
      } else {
        stats[dimKey].errors++;
      }
    }
  });

  // Calculate scores per dimension
  (Object.keys(updatedDimensions) as CognitiveDimensionKey[]).forEach((key) => {
    const dimStat = stats[key];
    const prev = updatedDimensions[key];

    // Base score (default 45-60) boosted or refined by real answers
    let score = prev.score;
    if (dimStat.total > 0) {
      const accuracy = (dimStat.correct / dimStat.total) * 100;
      // Blend 40% initial baseline with 60% real accuracy
      score = Math.round(prev.score * 0.35 + accuracy * 0.65);
    }

    score = Math.max(10, Math.min(100, score));

    let mastery: "مبتدئ" | "متوسط" | "متقدم" | "متقن" = "مبتدئ";
    if (score >= 85) mastery = "متقن";
    else if (score >= 70) mastery = "متقدم";
    else if (score >= 45) mastery = "متوسط";

    updatedDimensions[key] = {
      ...prev,
      score,
      masteryLevel: mastery,
      totalAttempts: dimStat.total,
      correctAnswers: dimStat.correct,
    };
  });

  // Check specific misconceptions based on mistakes
  if (userAnswers["sc-1"] !== undefined && userAnswers["sc-1"] !== 1) {
    const m = updatedMisconceptions.find((x) => x.id === "misc_bios_password");
    if (m) m.isDetected = true;
  }
  if (userAnswers["sc-2"] !== undefined && userAnswers["sc-2"] !== 2) {
    const m = updatedMisconceptions.find((x) => x.id === "misc_single_av");
    if (m) m.isDetected = true;
  }
  if (userAnswers["sc-4"] !== undefined && userAnswers["sc-4"] !== 1) {
    const m = updatedMisconceptions.find((x) => x.id === "misc_backup_mirror");
    if (m) m.isDetected = true;
  }
  if (userAnswers["sc-5"] !== undefined && userAnswers["sc-5"] !== 1) {
    const m = updatedMisconceptions.find((x) => x.id === "misc_admin_convenience");
    if (m) m.isDetected = true;
  }
  if (userAnswers["sc-6"] !== undefined && userAnswers["sc-6"] !== 0) {
    const m = updatedMisconceptions.find((x) => x.id === "misc_firewall_antivirus");
    if (m) m.isDetected = true;
  }
  if (userAnswers["sc-8"] !== undefined && userAnswers["sc-8"] !== 2) {
    const m = updatedMisconceptions.find((x) => x.id === "misc_file_integrity_size");
    if (m) m.isDetected = true;
  }

  // Calculate overall mastery
  const dimValues = Object.values(updatedDimensions);
  const avgDimScore = Math.round(dimValues.reduce((acc, d) => acc + d.score, 0) / dimValues.length);

  // Behavioral metrics
  const curiosity = Math.min(100, 40 + simulatorInteractions * 8 + totalAttempts * 2);
  const resilience = Math.min(
    100,
    Math.round(50 + (totalCorrect / Math.max(1, totalAttempts)) * 50),
  );

  let stage: "مبتدئ ركائزي" | "متدرب مستكشف" | "ممارس تقني" | "خبير أمن تكنولوجيا التعليم" =
    "مبتدئ ركائزي";
  if (avgDimScore >= 85 && totalAttempts >= 12) {
    stage = "خبير أمن تكنولوجيا التعليم";
  } else if (avgDimScore >= 70 && totalAttempts >= 6) {
    stage = "ممارس تقني";
  } else if (avgDimScore >= 50 || totalAttempts >= 3) {
    stage = "متدرب مستكشف";
  }

  // Immunity health is a combined metric (accuracy + active avoidance of misconceptions)
  const activeMisconceptionsCount = updatedMisconceptions.filter((m) => m.isDetected).length;
  const immunityPenalty = activeMisconceptionsCount * 6;
  const immunityHealthScore = Math.max(
    20,
    Math.min(100, avgDimScore - immunityPenalty + Math.round(curiosity * 0.15)),
  );

  const updatedTwin: LearnerDigitalTwin = {
    ...baseTwin,
    overallMastery: avgDimScore,
    immunityHealthScore,
    stageTitle: stage,
    dimensions: updatedDimensions,
    misconceptions: updatedMisconceptions,
    behavior: {
      ...baseTwin.behavior,
      scenariosAttempted: totalAttempts,
      curiosityIndex: curiosity,
      cognitiveResilience: resilience,
      simulationsRunCount:
        baseTwin.behavior.simulationsRunCount + (simulatorInteractions > 0 ? 1 : 0),
    },
    lastUpdated: new Date().toISOString(),
  };

  return updatedTwin;
}

/**
 * Builds the baseline initial Digital Twin for a new session.
 */
export function buildDefaultDigitalTwin(): LearnerDigitalTwin {
  return {
    id: "dt-" + Math.random().toString(36).substring(2, 9),
    studentName: "المتعلم التقني (تكنولوجيا التعليم)",
    avatarStyle: "cyber_sentinel",
    stageTitle: "متدرب مستكشف",
    overallMastery: 52,
    immunityHealthScore: 68,
    dimensions: getInitialDimensions(),
    behavior: {
      decisionVelocity: "متأنٍ ومحلل",
      curiosityIndex: 65,
      cognitiveResilience: 70,
      riskTolerance: "معتدل (واعي)",
      simulationsRunCount: 2,
      scenariosAttempted: 0,
    },
    misconceptions: INITIAL_MISCONCEPTIONS,
    recentSimulations: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Records a simulator action in localStorage to boost curiosity metrics.
 */
export function recordSimulatorInteraction(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(SIMULATOR_ACTIONS_KEY);
    const count = parseInt(raw || "0", 10) + 1;
    localStorage.setItem(SIMULATOR_ACTIONS_KEY, count.toString());
    window.dispatchEvent(new Event("cyberlab_activity_updated"));
  } catch (err) {
    console.error("Failed to record simulator interaction:", err);
  }
}

/**
 * Resets the digital twin to default state.
 */
export function resetStoredDigitalTwin(): LearnerDigitalTwin {
  if (typeof window === "undefined") return buildDefaultDigitalTwin();
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SCENARIOS_STORAGE_KEY);
    localStorage.removeItem(SIMULATOR_ACTIONS_KEY);
  } catch (err) {
    console.error("Failed to clear localStorage:", err);
  }
  const fresh = buildDefaultDigitalTwin();
  saveDigitalTwin(fresh);
  return fresh;
}
