import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import type { DimensionMetric } from "@/lib/digital-twin.types";

interface DigitalTwinRadarProps {
  dimensions: Record<string, DimensionMetric>;
}

export function DigitalTwinRadar({ dimensions }: DigitalTwinRadarProps) {
  const data = [
    {
      subject: "كلمات المرور و BIOS",
      score: dimensions.passwords_accounts?.score ?? 50,
      fullMark: 100,
    },
    {
      subject: "كشف البرمجيات والعزل",
      score: dimensions.malware_scanning?.score ?? 50,
      fullMark: 100,
    },
    {
      subject: "جدران الحماية والشبكات",
      score: dimensions.firewall_network?.score ?? 50,
      fullMark: 100,
    },
    {
      subject: "النسخ والتشفير والتجزئة",
      score: dimensions.backup_crypto_hash?.score ?? 50,
      fullMark: 100,
    },
    {
      subject: "أمن تكنولوجيا التعليم",
      score: dimensions.edtech_security?.score ?? 50,
      fullMark: 100,
    },
  ];

  return (
    <div className="relative h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="oklch(1 0 0 / 12%)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "oklch(0.85 0.02 220)", fontSize: 11, fontWeight: 700 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "oklch(0.6 0.03 245)", fontSize: 9 }}
            stroke="oklch(1 0 0 / 10%)"
          />
          <Radar
            name="مستوى إتقان التوأم"
            dataKey="score"
            stroke="oklch(0.84 0.14 195)"
            fill="oklch(0.84 0.14 195)"
            fillOpacity={0.35}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-xl border border-primary/40 bg-card/95 p-2.5 text-xs font-bold text-foreground shadow-xl backdrop-blur-md">
                    <p className="text-primary">{item.subject}</p>
                    <p className="font-latin text-sm font-black">درجة الإتقان: {item.score}%</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
