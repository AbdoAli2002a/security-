import { Check, Info, Lightbulb, AlertTriangle, Quote, type LucideIcon } from "lucide-react";
import type { Block } from "@/content/lessons";

const noteStyles: Record<string, { cls: string; Icon: LucideIcon }> = {
  info: { cls: "border-primary/30 bg-primary/10 text-foreground", Icon: Info },
  tip: { cls: "border-success/30 bg-success/10 text-foreground", Icon: Lightbulb },
  warn: { cls: "border-accent/40 bg-accent/10 text-foreground", Icon: AlertTriangle },
};

export function LessonBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-7">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "lead":
            return (
              <p
                key={i}
                className="rounded-2xl border border-primary/25 bg-primary/10 p-5 text-base font-semibold leading-relaxed"
              >
                {b.text}
              </p>
            );
          case "paragraph":
            return (
              <p key={i} className="text-base leading-relaxed text-foreground/90">
                {b.text}
              </p>
            );
          case "subheading":
            return (
              <div
                key={i}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-3"
              >
                <h3 className="text-lg font-extrabold text-primary">{b.text}</h3>
                {b.en && (
                  <span className="font-latin text-xs tracking-wide text-muted-foreground">
                    {b.en}
                  </span>
                )}
              </div>
            );
          case "list":
            return (
              <ul key={i} className="grid gap-2.5">
                {b.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3 rounded-xl bg-secondary/50 p-3.5 text-sm leading-relaxed"
                  >
                    <span className="mt-0.5 size-2 shrink-0 rounded-full bg-primary shadow-[var(--shadow-glow)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "steps":
            return (
              <div key={i} className="panel overflow-hidden">
                {b.title && (
                  <div className="border-b border-border bg-secondary/60 px-5 py-3 text-sm font-extrabold">
                    {b.title}
                  </div>
                )}
                <ol className="space-y-0 divide-y divide-border">
                  {b.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-4 px-5 py-3 text-sm">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 font-latin text-xs font-bold text-primary">
                        {j + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          case "note": {
            const s = noteStyles[b.variant ?? "info"] ?? noteStyles["info"]!;
            const Icon = s.Icon;
            return (
              <div key={i} className={`flex gap-4 rounded-2xl border p-5 ${s.cls}`}>
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  {b.title && <p className="mb-1 font-extrabold">{b.title}</p>}
                  <p className="text-sm leading-relaxed text-foreground/90">{b.text}</p>
                </div>
              </div>
            );
          }
          case "table":
            return (
              <div key={i} className="panel overflow-x-auto">
                <table className="w-full min-w-[480px] text-right text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/60">
                      {b.head.map((h, j) => (
                        <th key={j} className="px-4 py-3 font-extrabold text-primary">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {b.rows.map((row, j) => (
                      <tr key={j} className="transition-colors hover:bg-secondary/40">
                        {row.map((cell, k) => (
                          <td key={k} className="px-4 py-3 leading-relaxed">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="rounded-2xl border-r-4 border-accent bg-accent/10 p-5 text-base font-semibold leading-relaxed"
              >
                <Quote className="mb-2 size-5 text-accent" />
                {b.text}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export function StepChecklist({
  steps,
  checked,
  onToggle,
}: {
  steps: string[];
  checked: boolean[];
  onToggle: (index: number) => void;
}) {
  const done = checked.filter(Boolean).length;
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-secondary/60 px-5 py-3">
        <span className="text-sm font-extrabold">خطوات التنفيذ — علّم كل خطوة بعد تطبيقها</span>
        <span
          className={`rounded-full px-3 py-1 font-latin text-xs font-bold ${done === steps.length ? "bg-success/20 text-success" : "bg-primary/15 text-primary"}`}
        >
          {done}/{steps.length}
        </span>
      </div>
      <ol className="divide-y divide-border">
        {steps.map((step, i) => (
          <li key={i}>
            <button
              onClick={() => onToggle(i)}
              className="flex w-full items-center gap-4 px-5 py-3 text-right transition-colors hover:bg-secondary/40"
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  checked[i]
                    ? "border-success bg-success text-success-foreground"
                    : "border-border bg-transparent"
                }`}
              >
                {checked[i] && <Check className="size-4" />}
              </span>
              <span
                className={`font-latin text-xs ${checked[i] ? "text-success" : "text-primary"}`}
              >
                {i + 1}
              </span>
              <span
                className={`text-sm leading-relaxed transition-colors ${checked[i] ? "text-muted-foreground line-through" : ""}`}
              >
                {step}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
