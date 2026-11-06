import { HeartHandshake } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <HeartHandshake className="size-6" />
          </span>
          <p className="text-sm font-bold">إعداد وتقديم / عبدالرحمن علي</p>
          <p className="font-latin text-xs tracking-widest text-muted-foreground">
            Abdulrahman Ali
          </p>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            الأمن يعتمد على ثلاثة عناصر أساسية: العنصر البشري (وعيك)، والحلول التقنية (البرامج)،
            والسياسات الأمنية المناسبة.
          </p>
        </div>
      </div>
    </footer>
  );
}
