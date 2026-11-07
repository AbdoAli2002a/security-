export type CognitiveDimensionKey =
  | "passwords_accounts"
  | "malware_scanning"
  | "firewall_network"
  | "backup_crypto_hash"
  | "edtech_security";

export interface DimensionMetric {
  key: CognitiveDimensionKey;
  titleArabic: string;
  enTitle: string;
  score: number; // 0 to 100
  masteryLevel: "مبتدئ" | "متوسط" | "متقدم" | "متقن";
  totalAttempts: number;
  correctAnswers: number;
  weakTopics: string[];
  strongTopics: string[];
  recommendedLessonSlug: string;
  recommendedLessonTitle: string;
}

export type AvatarStyle =
  "cyber_sentinel" | "defense_architect" | "quantum_analyst" | "edtech_scholar";

export interface BehavioralAttributes {
  decisionVelocity: "متأنٍ ومحلل" | "متوازن" | "مخاطر وسريع" | "متردد";
  curiosityIndex: number; // 0 to 100 based on simulator interaction
  cognitiveResilience: number; // 0 to 100 handling failures and re-trying
  riskTolerance: "منخفض (حذر جدًا)" | "معتدل (واعي)" | "مرتفع (بحاجة لتوجيه)";
  simulationsRunCount: number;
  scenariosAttempted: number;
}

export interface Misconception {
  id: string;
  title: string;
  description: string;
  scientificCorrection: string;
  isDetected: boolean;
  relatedLessonSlug: string;
  relatedLessonTitle: string;
}

export interface PredictiveSimulationResult {
  id: string;
  scenarioTitle: string;
  threatType: string;
  contextDescription: string;
  predictedSuccessRate: number; // 0 to 100
  predictedDecision: string;
  identifiedRiskPoints: string[];
  suggestedDefensiveCountermeasure: string;
  simulatedDate: string;
}

export interface LearnerDigitalTwin {
  id: string;
  studentName: string;
  avatarStyle: AvatarStyle;
  stageTitle: "مبتدئ ركائزي" | "متدرب مستكشف" | "ممارس تقني" | "خبير أمن تكنولوجيا التعليم";
  overallMastery: number; // 0 to 100
  immunityHealthScore: number; // 0 to 100
  dimensions: Record<CognitiveDimensionKey, DimensionMetric>;
  behavior: BehavioralAttributes;
  misconceptions: Misconception[];
  recentSimulations: PredictiveSimulationResult[];
  lastUpdated: string;
}

export interface AgentChatMessage {
  id: string;
  sender: "agent" | "learner";
  text: string;
  timestamp: string;
  emotion?: "analytical" | "encouraging" | "alert" | "celebratory";
  remedialLink?: {
    label: string;
    href: string;
  };
}

export interface TwinDiagnosticReport {
  overallAssessment: string;
  learnerArchetype: string;
  dominantStrength: string;
  criticalVulnerability: string;
  recommendedPath: {
    immediateStep: string;
    lessonSlug: string;
    practiceTool: string;
  };
  pedagogicalTip: string;
}
