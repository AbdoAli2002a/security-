import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Puzzle,
  ShieldAlert,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import { matchPairs, firewallScenarios, memoryTerms, gameFacts } from "@/content/games-data";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "الألعاب التعليمية | مختبر الأمن السيبراني" },
      {
        name: "description",
        content:
          "ألعاب تعليمية في أمن الحاسب: طابق برامج الحماية بوظائفها، تحمّل قرارات الجدار الناري COMODO، والعب لعبة الذاكرة بمصطلحات الأمن السيبراني.",
      },
      { property: "og:title", content: "الألعاب التعليمية | مختبر الأمن السيبراني" },
      {
        property: "og:description",
        content: "ثلاث ألعاب تفاعلية لتثبيت مفاهيم أمن الحاسب بصورة ممتعة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GamesPage,
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

function GamesPage() {
  const [tab, setTab] = useState<"match" | "firewall" | "memory">("match");
  const tabs = [
    { id: "match", label: "طابق الأداة", Icon: Puzzle },
    { id: "firewall", label: "قرارات الجدار الناري", Icon: ShieldAlert },
    { id: "memory", label: "لعبة الذاكرة", Icon: BrainCircuit },
  ] as const;

  return (
    <div className="hero-glow relative">
      <div className="cyber-grid absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-5xl px-4 py-14">
        <div className="max-w-2xl">
          <p className="font-latin text-xs font-bold tracking-[0.3em] text-primary">
            PLAY &amp; LEARN
          </p>
          <h1 className="mt-3 text-3xl font-black md:text-4xl">الألعاب التعليمية</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            ثبّت ما تعلمته من الدروس باللعب: ثلاث ألعاب مبنية على محتوى الملف نفسه.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "border border-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              <t.Icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "match" && <MatchGame />}
          {tab === "firewall" && <FirewallGame />}
          {tab === "memory" && <MemoryGame />}
        </div>
      </div>
    </div>
  );
}

/** لعبة 1: مطابقة الأداة بوظيفتها */
function MatchGame() {
  const [tools, setTools] = useState<typeof matchPairs>([]);
  const [functions, setFunctions] = useState<typeof matchPairs>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    setTools(shuffle(matchPairs));
    setFunctions(shuffle(matchPairs));
  }, []);

  const reset = () => {
    setTools(shuffle(matchPairs));
    setFunctions(shuffle(matchPairs));
    setSelectedTool(null);
    setMatched(new Set());
    setMistakes(0);
  };

  const pickFunction = (fnId: string) => {
    if (!selectedTool || matched.has(fnId)) return;
    if (selectedTool === fnId) {
      const next = new Set(matched);
      next.add(fnId);
      setMatched(next);
      setSelectedTool(null);
    } else {
      setMistakes((m) => m + 1);
      setWrongPair(fnId);
      setTimeout(() => {
        setWrongPair(null);
        setSelectedTool(null);
      }, 600);
    }
  };

  const won = matched.size === matchPairs.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">اضغط على أداة ثم اضغط على وظيفتها الصحيحة.</p>
        <div className="flex items-center gap-3 text-sm font-bold">
          <span className="text-primary">
            المطابقات: {matched.size}/{matchPairs.length}
          </span>
          <span className="text-destructive">الأخطاء: {mistakes}</span>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary"
          >
            <RotateCcw className="size-3.5" />
            إعادة
          </button>
        </div>
      </div>

      {won && <WinBanner text="أحسنت! عرفت كل الأدوات بوظائفها 🎉" onRestart={reset} />}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-2.5">
          <p className="mb-1 text-xs font-extrabold tracking-wide text-primary">الأدوات</p>
          {tools.map((t) => (
            <button
              key={t.id}
              disabled={matched.has(t.id)}
              onClick={() => setSelectedTool(t.id)}
              className={`w-full rounded-xl border p-4 text-right font-latin text-sm font-bold transition-all ${
                matched.has(t.id)
                  ? "border-success/50 bg-success/10 text-success opacity-60"
                  : selectedTool === t.id
                    ? "border-primary bg-primary/15 shadow-[var(--shadow-glow)]"
                    : "border-border bg-card hover:border-primary/50"
              }`}
              dir="ltr"
            >
              {t.tool}
            </button>
          ))}
        </div>
        <div className="space-y-2.5">
          <p className="mb-1 text-xs font-extrabold tracking-wide text-primary">الوظائف</p>
          {functions.map((f) => (
            <button
              key={f.id}
              disabled={matched.has(f.id)}
              onClick={() => pickFunction(f.id)}
              className={`w-full rounded-xl border p-4 text-right text-sm leading-relaxed transition-all ${
                matched.has(f.id)
                  ? "border-success/50 bg-success/10 text-success opacity-60"
                  : wrongPair === f.id
                    ? "border-destructive bg-destructive/15"
                    : "border-border bg-card hover:border-primary/50"
              }`}
            >
              {f.functionText}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** لعبة 2: قرارات الجدار الناري */
function FirewallGame() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [choice, setChoice] = useState<"allow" | "block" | null>(null);
  const [finished, setFinished] = useState(false);

  const s = firewallScenarios[index]!;
  const total = firewallScenarios.length;

  const decide = (d: "allow" | "block") => {
    if (choice) return;
    setChoice(d);
    if (d === s.correct) setScore((v) => v + 1);
  };

  const next = () => {
    if (index + 1 >= total) setFinished(true);
    else {
      setIndex((i) => i + 1);
      setChoice(null);
    }
  };

  const reset = () => {
    setIndex(0);
    setScore(0);
    setChoice(null);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="panel mx-auto max-w-lg p-8 text-center">
        <Trophy className="mx-auto size-12 text-primary" />
        <h2 className="mt-4 text-2xl font-black">انتهت الجولة!</h2>
        <p className="mt-2 font-latin text-4xl font-bold text-glow">
          {score} / {total}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          الجدار الناري يقرر: (Block) للمشبوه أو (Allow) للموثوق.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground"
        >
          <RotateCcw className="size-4" />
          جولة جديدة
        </button>
      </div>
    );
  }

  const correct = choice === s.correct;

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center justify-between text-sm font-bold">
        <span>
          الاتصال {index + 1} من {total}
        </span>
        <span className="text-primary">قرارات صحيحة: {score}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((index + (choice ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="panel mt-5 p-6">
        <p className="font-latin text-xs font-bold tracking-widest text-destructive">
          ⚠ INCOMING CONNECTION
        </p>
        <h3 className="mt-3 font-latin text-lg font-bold">{s.app}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => decide("allow")}
            disabled={choice !== null}
            className="rounded-xl border border-success/50 bg-success/10 p-4 font-extrabold text-success transition-transform hover:scale-[1.03] disabled:opacity-50"
          >
            السماح (Allow)
          </button>
          <button
            onClick={() => decide("block")}
            disabled={choice !== null}
            className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 font-extrabold text-destructive transition-transform hover:scale-[1.03] disabled:opacity-50"
          >
            المنع (Block)
          </button>
        </div>

        {choice && (
          <div
            className={`mt-5 rounded-2xl border p-4 ${correct ? "border-success/30 bg-success/10" : "border-accent/40 bg-accent/10"}`}
          >
            <p className="inline-flex items-center gap-2 font-extrabold">
              {correct ? (
                <CheckCircle2 className="size-5 text-success" />
              ) : (
                <XCircle className="size-5 text-destructive" />
              )}
              {correct ? "قرار صحيح — الجدار الناري يحتكم إليك!" : "قرار خاطئ — انتبه:"}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{s.reason}</p>
            <button
              onClick={next}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground"
            >
              {index + 1 >= total ? "النتيجة" : "الاتصال التالي"}
              <ArrowLeft className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** لعبة 3: الذاكرة بمصطلحات الأمن */
function MemoryGame() {
  const [cards, setCards] = useState<{ key: string; id: string; label: string; sub: string }[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);

  const deck = useMemo(
    () =>
      memoryTerms.flatMap((t) => [
        { key: `${t.id}-a`, id: t.id, label: t.label, sub: t.sub },
        { key: `${t.id}-b`, id: t.id, label: t.label, sub: t.sub },
      ]),
    [],
  );

  useEffect(() => {
    setCards(shuffle(deck));
  }, [deck]);

  const reset = () => {
    setCards(shuffle(deck));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
  };

  useEffect(() => {
    if (flipped.length !== 2) return;
    const a = flipped[0]!;
    const b = flipped[1]!;
    setMoves((m) => m + 1);
    if (a.split("-")[0] === b.split("-")[0]) {
      setMatched((prev) => new Set([...prev, a, b]));
      setFlipped([]);
      return undefined;
    }
    const t = setTimeout(() => setFlipped([]), 800);
    return () => clearTimeout(t);
  }, [flipped]);

  const flip = (key: string) => {
    if (flipped.length >= 2 || flipped.includes(key) || matched.has(key)) return;
    setFlipped((f) => [...f, key]);
  };

  const won = matched.size === cards.length && cards.length > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          اقلب بطاقتين وحاول إيجاد المصطلحين المتطابقين من دروس الأمن.
        </p>
        <div className="flex items-center gap-3 text-sm font-bold">
          <span className="text-primary">
            المطابقات: {matched.size / 2}/{memoryTerms.length}
          </span>
          <span className="text-muted-foreground">المحاولات: {moves}</span>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary"
          >
            <RotateCcw className="size-3.5" />
            إعادة
          </button>
        </div>
      </div>

      {won && <WinBanner text="ذاكرتك أقوى من أي فيروس! 🧠" onRestart={reset} />}

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {cards.map((c) => {
          const isOpen = flipped.includes(c.key) || matched.has(c.key);
          return (
            <button
              key={c.key}
              onClick={() => flip(c.key)}
              className={`flex h-28 flex-col items-center justify-center rounded-2xl border p-2 text-center transition-all duration-200 ${
                matched.has(c.key)
                  ? "border-success/50 bg-success/15 text-success"
                  : isOpen
                    ? "border-primary bg-primary/15"
                    : "panel-hover border-border bg-secondary hover:border-primary/40"
              }`}
            >
              {isOpen ? (
                <>
                  <span className="text-xs font-extrabold leading-snug">{c.label}</span>
                  <span className="mt-1 font-latin text-[10px] opacity-80" dir="ltr">
                    {c.sub}
                  </span>
                </>
              ) : (
                <ShieldAlert className="size-6 text-primary/40" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WinBanner({ text, onRestart }: { text: string; onRestart: () => void }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-success/30 bg-success/10 p-5">
      <p className="inline-flex items-center gap-2 font-extrabold text-success">
        <Trophy className="size-5" />
        {text}
      </p>
      <button
        onClick={onRestart}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground"
      >
        <RotateCcw className="size-4" />
        العب مرة أخرى
      </button>
    </div>
  );
}
