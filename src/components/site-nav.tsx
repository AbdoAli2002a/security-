import { Link, useRouterState } from "@tanstack/react-router";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "الرئيسية" },
  { to: "/lessons", label: "الدروس" },
  { to: "/scenarios", label: "سيناريوهات ومشكلات" },
  { to: "/digital-twin", label: "التوأم والوكيل الذكي", highlight: true },
  { to: "/avast-rescue", label: "أسطوانة Avast Rescue" },
  { to: "/kaspersky", label: "محاكي Kaspersky" },
  { to: "/avast", label: "محاكي Avast" },
  { to: "/comodo", label: "محاكي Comodo" },
  { to: "/activities", label: "الأنشطة" },
  { to: "/quiz", label: "الاختبار" },
  { to: "/games", label: "الألعاب" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-[var(--shadow-glow)]">
            <ShieldCheck className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold">مختبر الأمن السيبراني</span>
            <span className="block text-[11px] text-muted-foreground">
              برامج وأدوات الحماية المتقدمة
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <button
          className="flex size-10 items-center justify-center rounded-lg border border-border md:hidden"
          aria-label="القائمة"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border px-4 pb-4 md:hidden">
          <div className="grid gap-1 pt-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-4 py-2.5 text-sm font-bold ${
                  pathname === l.to ? "bg-primary/15 text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
