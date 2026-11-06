import {
  KeyRound,
  Users,
  Bug,
  ScanSearch,
  ShieldCheck,
  BrickWall,
  DatabaseBackup,
  Lock,
  Hash,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  key: KeyRound,
  users: Users,
  bug: Bug,
  scan: ScanSearch,
  shield: ShieldCheck,
  wall: BrickWall,
  backup: DatabaseBackup,
  lock: Lock,
  hash: Hash,
  book: BookOpen,
};

export function LessonIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = iconMap[icon] ?? ShieldCheck;
  return <Icon className={className} />;
}
