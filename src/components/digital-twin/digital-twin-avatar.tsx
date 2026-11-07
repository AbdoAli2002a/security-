import { motion } from "framer-motion";
import { Shield, Sparkles, Activity, Cpu, Award } from "lucide-react";
import type { AvatarStyle, LearnerDigitalTwin } from "@/lib/digital-twin.types";

interface DigitalTwinAvatarProps {
  twin: LearnerDigitalTwin;
  onStyleChange?: (style: AvatarStyle) => void;
  compact?: boolean;
}

const AVATAR_OPTIONS: { id: AvatarStyle; label: string; icon: string; desc: string }[] = [
  {
    id: "cyber_sentinel",
    label: "الحارس السيبراني",
    icon: "🛡️",
    desc: "دفاع استباقي ومراقبة للأنظمة التعليمية",
  },
  {
    id: "defense_architect",
    label: "مهندس الدفاع",
    icon: "🏗️",
    desc: "بناء سياسات جدران الحماية والشبكات",
  },
  {
    id: "quantum_analyst",
    label: "محلل التشفير",
    icon: "🔐",
    desc: "تأمين بنوك الأسئلة وبصمات التجزئة",
  },
  {
    id: "edtech_scholar",
    label: "باحث تكنولوجيا التعليم",
    icon: "🎓",
    desc: "أمن منصات المقررات والمعامل الذكية",
  },
];

export function DigitalTwinAvatar({
  twin,
  onStyleChange,
  compact = false,
}: DigitalTwinAvatarProps) {
  const health = twin.immunityHealthScore;

  // Derive glow color
  const glowColor =
    health >= 75
      ? "from-emerald-500/30 to-teal-500/10 border-emerald-500/50 text-emerald-400"
      : health >= 50
        ? "from-cyan-500/30 to-blue-500/10 border-cyan-500/50 text-cyan-400"
        : health >= 35
          ? "from-amber-500/30 to-yellow-500/10 border-amber-500/50 text-amber-400"
          : "from-rose-500/30 to-red-500/10 border-rose-500/50 text-rose-400";

  const coreHex =
    health >= 75 ? "#10b981" : health >= 50 ? "#06b6d4" : health >= 35 ? "#f59e0b" : "#f43f5e";

  const currentOption = AVATAR_OPTIONS.find((o) => o.id === twin.avatarStyle) || AVATAR_OPTIONS[0];

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative flex size-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-2xl"
          >
            {currentOption.icon}
          </motion.div>
          <span
            className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-background"
            style={{ backgroundColor: coreHex }}
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-foreground">{twin.studentName}</span>
            <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[10px] font-bold text-primary">
              {twin.stageTitle}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Activity className="size-3 text-primary" /> مناعة التوأم: {health}%
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-6 text-center">
      {/* Hologram Projection Halo */}
      <div className="relative mb-4 flex items-center justify-center">
        {/* Pulsing Concentric Outer Rings */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute size-44 rounded-full border border-dashed border-primary/40 pointer-events-none"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute size-36 rounded-full border border-primary/30 pointer-events-none"
          style={{ borderTopColor: "transparent", borderBottomColor: "transparent" }}
        />

        {/* Central Holographic Avatar Orb */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`relative z-10 flex size-28 items-center justify-center rounded-3xl border-2 bg-gradient-to-b ${glowColor} shadow-[0_0_40px_rgba(6,182,212,0.2)] backdrop-blur-md`}
        >
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl select-none"
          >
            {currentOption.icon}
          </motion.span>

          {/* Micro Telemetry Badges */}
          <span
            className="absolute -bottom-2.5 rounded-full border border-white/10 bg-card/90 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-foreground font-latin shadow"
            title="مؤشر المناعة السيبرانية"
          >
            IMMUNITY {health}%
          </span>
        </motion.div>
      </div>

      {/* Identity & Status */}
      <div className="mt-1 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-lg font-black text-foreground">{twin.studentName}</h3>
          <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Sparkles className="size-3" />
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <Award className="size-3.5" />
          <span>{twin.stageTitle}</span>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="mt-5 grid grid-cols-3 gap-2 w-full text-right">
        <div className="rounded-xl border border-border/80 bg-secondary/30 p-2.5">
          <span className="block text-[10px] text-muted-foreground font-bold">المناعة الرقمية</span>
          <span className="text-sm font-black text-foreground font-latin">{health}%</span>
        </div>
        <div className="rounded-xl border border-border/80 bg-secondary/30 p-2.5">
          <span className="block text-[10px] text-muted-foreground font-bold">الإتقان الشامل</span>
          <span className="text-sm font-black text-primary font-latin">{twin.overallMastery}%</span>
        </div>
        <div className="rounded-xl border border-border/80 bg-secondary/30 p-2.5">
          <span className="block text-[10px] text-muted-foreground font-bold">نمط القرار</span>
          <span className="text-xs font-bold text-foreground truncate block">
            {twin.behavior.decisionVelocity}
          </span>
        </div>
      </div>

      {/* Avatar Style Switcher */}
      {onStyleChange && (
        <div className="mt-4 w-full">
          <span className="block text-[11px] font-bold text-muted-foreground mb-2 text-right">
            تخصيص هوية التوأم الرقمي:
          </span>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {AVATAR_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onStyleChange(opt.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition-all ${
                  twin.avatarStyle === opt.id
                    ? "border-primary bg-primary/20 text-foreground shadow-sm"
                    : "border-border/60 bg-secondary/20 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span className="text-lg">{opt.icon}</span>
                <span className="text-[11px] font-bold truncate max-w-full">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
