import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Scan,
  Bug,
  FolderLock,
  Layers,
  Wifi,
  HardDrive,
  FileCheck,
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Pause,
  Trash2,
  Wrench,
  Archive,
  RefreshCw,
  BellOff,
  Disc,
  Eye,
  Key,
  Flame,
  ArrowRight,
  ExternalLink,
  Laptop,
  Globe,
  Mail,
  Zap,
  Info,
  Minus,
  Square,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

export type AvastTab =
  | "status"
  | "scans"
  | "core_shields"
  | "quarantine"
  | "ransomware"
  | "sandbox"
  | "network"
  | "updater"
  | "rescue_disk";

export interface SimulatedThreat {
  id: string;
  fileName: string;
  path: string;
  threatName: string;
  severity: "عالية جدًا" | "عالية" | "متوسطة";
  type: "Trojan" | "Ransomware" | "Adware" | "Spyware";
  status: "detected" | "quarantined" | "repaired" | "deleted";
  dateDetected: string;
}

const samplePaths = [
  "C:\\Windows\\System32\\ntdll.dll",
  "C:\\Windows\\System32\\kernel32.dll",
  "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data",
  "C:\\Program Files\\Common Files\\System\\mfc42.dll",
  "C:\\Users\\Admin\\Downloads\\setup_installer.msi",
  "C:\\Windows\\System32\\drivers\\etc\\hosts",
  "C:\\ProgramData\\Microsoft\\Windows Defender\\Definition Updates",
  "C:\\Users\\Admin\\Documents\\financial_records.xlsx",
  "C:\\Windows\\SysWOW64\\cmd.exe",
];

export function AvastSimulator() {
  const [activeTab, setActiveTab] = useState<AvastTab>("status");
  const [windowState, setWindowState] = useState<"open" | "minimized" | "closed">("open");
  const [isMaximized, setIsMaximized] = useState(false);

  // Core Shields State
  const [shields, setShields] = useState({
    file: true,
    behavior: true,
    web: true,
    mail: true,
  });

  // Threats list
  const [threats, setThreats] = useState<SimulatedThreat[]>([
    {
      id: "t1",
      fileName: "patch_crack_v2.exe",
      path: "C:\\Users\\Admin\\Downloads\\patch_crack_v2.exe",
      threatName: "Win32:TrojanDropper-AQF",
      severity: "عالية جدًا",
      type: "Trojan",
      status: "detected",
      dateDetected: "اليوم 10:14 ص",
    },
    {
      id: "t2",
      fileName: "invoice_march.pdf.vbs",
      path: "C:\\Users\\Admin\\AppData\\Local\\Temp\\invoice_march.pdf.vbs",
      threatName: "Script:WannaCrypt-Dropper",
      severity: "عالية جدًا",
      type: "Ransomware",
      status: "detected",
      dateDetected: "اليوم 10:15 ص",
    },
    {
      id: "t3",
      fileName: "search_optimizer_toolbar.dll",
      path: "C:\\Program Files (x86)\\SearchHelper\\toolbar.dll",
      threatName: "Win32:Adware-Gen [PUP]",
      severity: "متوسطة",
      type: "Adware",
      status: "detected",
      dateDetected: "أمس 04:30 م",
    },
  ]);

  // Scanning State
  const [scanType, setScanType] = useState<"smart" | "full" | "quick" | "boot" | "custom">("smart");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedFilesCount, setScannedFilesCount] = useState(0);
  const [currentScanningPath, setCurrentScanningPath] = useState("");
  const [scanCompleted, setScanCompleted] = useState(false);
  const [detectedInScan, setDetectedInScan] = useState<SimulatedThreat[]>([]);

  // Sandbox State
  const [sandboxFile, setSandboxFile] = useState<string>("suspicious_tool.exe");
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  const [sandboxVerdict, setSandboxVerdict] = useState<string | null>(null);

  // Network Inspector State
  const [inspectingNetwork, setInspectingNetwork] = useState(false);
  const [networkInspected, setNetworkInspected] = useState(false);

  // Software Updater State
  const [updatingApps, setUpdatingApps] = useState<Record<string, boolean>>({});
  const [softwareList, setSoftwareList] = useState([
    { id: "vlc", name: "VLC Media Player", current: "3.0.12", latest: "3.0.20", updated: false },
    {
      id: "chrome",
      name: "Google Chrome",
      current: "119.0.6045",
      latest: "123.0.6312",
      updated: false,
    },
    {
      id: "reader",
      name: "Adobe Acrobat Reader",
      current: "22.001",
      latest: "24.001",
      updated: false,
    },
    { id: "7zip", name: "7-Zip File Archiver", current: "21.07", latest: "24.05", updated: true },
  ]);

  // Ransomware protected folders
  const [protectedFolders, setProtectedFolders] = useState([
    "C:\\Users\\Admin\\Documents",
    "C:\\Users\\Admin\\Pictures",
    "C:\\Users\\Admin\\Desktop",
    "D:\\Backups\\Projects",
  ]);
  const [blockedRansomwareEvents, setBlockedRansomwareEvents] = useState([
    {
      app: "crypt_test.exe",
      target: "C:\\Users\\Admin\\Documents\\Report.docx",
      time: "منذ 15 دقيقة",
      status: "تم الحظر تلقائيًا",
    },
  ]);

  // Rescue Disk State
  const [rescueUsbStatus, setRescueUsbStatus] = useState<"idle" | "creating" | "created">("idle");
  const [rescueProgress, setRescueProgress] = useState(0);

  // Handle Scan Animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanning) {
      timer = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            setIsScanning(false);
            setScanCompleted(true);
            return 100;
          }
          const next = prev + (scanType === "quick" ? 4 : scanType === "smart" ? 2.5 : 1.5);
          setScannedFilesCount((c) => c + Math.floor(Math.random() * 85) + 30);
          setCurrentScanningPath(samplePaths[Math.floor(Math.random() * samplePaths.length)] ?? "");
          return Math.min(100, Math.round(next * 10) / 10);
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isScanning, scanType]);

  const startScan = (type: "smart" | "full" | "quick" | "boot" | "custom") => {
    setScanType(type);
    setIsScanning(true);
    setScanProgress(0);
    setScannedFilesCount(0);
    setScanCompleted(false);
    setDetectedInScan(threats.filter((t) => t.status === "detected"));
  };

  // Actions on threats (The 3 core course actions!)
  const handleQuarantine = (id: string) => {
    setThreats((prev) => prev.map((t) => (t.id === id ? { ...t, status: "quarantined" } : t)));
  };

  const handleRepair = (id: string) => {
    setThreats((prev) => prev.map((t) => (t.id === id ? { ...t, status: "repaired" } : t)));
  };

  const handleDelete = (id: string) => {
    setThreats((prev) => prev.map((t) => (t.id === id ? { ...t, status: "deleted" } : t)));
  };

  // Sandbox simulation
  const runInSandbox = () => {
    setSandboxRunning(true);
    setSandboxLogs([]);
    setSandboxVerdict(null);

    const logSteps = [
      "جاري تهيئة بيئة الحاوية الافتراضية المعزولة (Avast Hyper-V Container)...",
      "نسخ الملف " + sandboxFile + " إلى البيئة المعزولة دون اتصال بالقرص الفعلي...",
      "مراقبة استدعاءات API والتعديلات على سجل النظام (Registry Hooks)...",
      "اكتشاف محاولة حقن غير مصرح بها في عملية svchost.exe الافتراضية!",
      "تم التقاط السلوك المشبوه: محاولة إنشاء اتصال خارجي على المنفذ 4444 (Reverse Shell).",
      "اكتمال التحليل: تم تصنيف الملف كبرمجية تجسس ضارة (Backdoor/Spyware).",
    ];

    logSteps.forEach((step, idx) => {
      setTimeout(
        () => {
          setSandboxLogs((prev) => [...prev, step]);
          if (idx === logSteps.length - 1) {
            setSandboxRunning(false);
            setSandboxVerdict("خبيث (Malicious) — تم إحباط الهجوم في البيئة المعزولة.");
          }
        },
        (idx + 1) * 800,
      );
    });
  };

  // Wi-Fi Network Inspector
  const runNetworkInspect = () => {
    setInspectingNetwork(true);
    setNetworkInspected(false);
    setTimeout(() => {
      setInspectingNetwork(false);
      setNetworkInspected(true);
    }, 2500);
  };

  // Software Updater Action
  const updateSoftware = (id: string) => {
    setUpdatingApps((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSoftwareList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, current: s.latest, updated: true } : s)),
      );
      setUpdatingApps((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Rescue Disk Builder
  const createRescueDisk = () => {
    setRescueUsbStatus("creating");
    setRescueProgress(0);
    const interval = setInterval(() => {
      setRescueProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRescueUsbStatus("created");
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  // Count active threats
  const activeDetectedCount = threats.filter((t) => t.status === "detected").length;
  const quarantinedCount = threats.filter((t) => t.status === "quarantined").length;
  const allShieldsActive = Object.values(shields).every(Boolean);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Course Context Banner */}
      <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs leading-relaxed text-foreground/90 md:text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Info className="size-5 shrink-0" />
            <span>محاكي معمل الأمن السيبراني: تطبيق عملي شامل لبرنامج Avast Antivirus</span>
          </div>
          <span className="text-muted-foreground text-xs">
            يركز على: أنواع الفحص (Quick, Full, Custom)، وخيارات التعامل مع التهديدات (الحجز،
            الإصلاح، الحذف).
          </span>
        </div>
      </div>

      {/* Animated Avast Window State Manager */}
      <AnimatePresence mode="wait">
        {windowState === "open" && (
          <motion.div
            key="avast-window"
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className={`overflow-hidden rounded-3xl border border-border bg-[#1b2133] shadow-2xl transition-all ${
              isMaximized ? "fixed inset-3 z-50 rounded-2xl max-h-[96vh] flex flex-col" : ""
            }`}
          >
            {/* Avast Window Title Bar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#141926] px-5 py-3 select-none">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-orange-600 text-white font-black text-xs shadow-md">
                  a
                </span>
                <span className="font-bold text-sm text-white">Avast Premium Security</span>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                  Interactive Lab Simulator
                </span>
              </div>

              {/* Window Controls (Minimize, Maximize, Close) with Motion Hover */}
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500/80 mr-1" title="Protected" />
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setWindowState("minimized")}
                  className="size-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/70 hover:text-amber-300 transition-colors"
                  title="تصغير النافذة (Minimize)"
                  aria-label="تصغير النافذة"
                >
                  <Minus className="size-3.5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMaximized((v) => !v)}
                  className="size-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-emerald-500/20 text-white/70 hover:text-emerald-300 transition-colors"
                  title={isMaximized ? "استعادة الحجم الأصلي" : "تكبير النافذة (Maximize)"}
                  aria-label={isMaximized ? "استعادة الحجم" : "تكبير النافذة"}
                >
                  {isMaximized ? (
                    <Minimize2 className="size-3.5" />
                  ) : (
                    <Maximize2 className="size-3.5" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setWindowState("closed")}
                  className="size-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-400 transition-colors"
                  title="إغلاق نافذة Avast (Close)"
                  aria-label="إغلاق النافذة"
                >
                  <X className="size-3.5" />
                </motion.button>
              </div>
            </div>

            {/* Avast Main Layout: Sidebar + Main Stage */}
            <div
              className={`grid md:grid-cols-[240px_1fr] ${isMaximized ? "flex-1 overflow-hidden" : "min-h-[620px]"}`}
            >
              {/* Avast Left Navigation */}
              <nav className="border-r border-white/10 bg-[#161c2b] p-4 text-sm" dir="rtl">
                <p className="px-3 py-2 text-[11px] font-bold tracking-wider text-white/40">
                  القائمة الرئيسية
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab("status")}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                      activeTab === "status"
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Shield className="size-4.5" />
                    الحالة (Status)
                  </button>

                  <button
                    onClick={() => setActiveTab("scans")}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                      activeTab === "scans"
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Scan className="size-4.5" />
                      فحص الفيروسات
                    </span>
                    {activeDetectedCount > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-bold">
                        {activeDetectedCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("core_shields")}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                      activeTab === "core_shields"
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <ShieldCheck className="size-4.5" />
                    دروع الحماية الأساسية
                  </button>

                  <button
                    onClick={() => setActiveTab("quarantine")}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                      activeTab === "quarantine"
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Archive className="size-4.5" />
                      صندوق الحجز (Virus Chest)
                    </span>
                    {quarantinedCount > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-black font-bold">
                        {quarantinedCount}
                      </span>
                    )}
                  </button>
                </div>

                <p className="mt-6 px-3 py-2 text-[11px] font-bold tracking-wider text-white/40">
                  أدوات متقدمة
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab("sandbox")}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                      activeTab === "sandbox"
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Layers className="size-4.5" />
                    صندوق الرمل (Sandbox)
                  </button>

                  <button
                    onClick={() => setActiveTab("ransomware")}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                      activeTab === "ransomware"
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <FolderLock className="size-4.5" />
                    درع الفدية (Ransomware)
                  </button>

                  <button
                    onClick={() => setActiveTab("network")}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                      activeTab === "network"
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Wifi className="size-4.5" />
                    فاحص الشبكة (Wi-Fi)
                  </button>

                  <button
                    onClick={() => setActiveTab("updater")}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                      activeTab === "updater"
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <RefreshCw className="size-4.5" />
                    محدث البرامج (Software)
                  </button>

                  <button
                    onClick={() => setActiveTab("rescue_disk")}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                      activeTab === "rescue_disk"
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Disc className="size-4.5" />
                    قرص الإنقاذ (Rescue Disk)
                  </button>
                </div>
              </nav>

              {/* Avast Content Stage */}
              <main
                className={`p-6 md:p-8 bg-[#1f263b] overflow-y-auto text-white ${
                  isMaximized ? "flex-1 max-h-none" : "max-h-[700px]"
                }`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {/* 1. STATUS TAB */}
                    {activeTab === "status" && (
                      <div className="space-y-6">
                        <div className="text-center py-6">
                          {allShieldsActive && activeDetectedCount === 0 ? (
                            <>
                              <div className="mx-auto flex size-24 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <ShieldCheck className="size-14" />
                              </div>
                              <h2 className="mt-5 text-2xl font-black text-white">
                                هذا الحاسوب محمي بالكامل
                              </h2>
                              <p className="mt-1.5 text-xs text-white/60">
                                كافة دروع الحماية نشطة، وقاعدة بيانات الفيروسات محدثة لآخر إصدار.
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="mx-auto flex size-24 items-center justify-center rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                                <ShieldAlert className="size-14" />
                              </div>
                              <h2 className="mt-5 text-2xl font-black text-rose-300">
                                يوجد تهديدات أو دروع معطلة!
                              </h2>
                              <p className="mt-1.5 text-xs text-white/60">
                                {activeDetectedCount > 0
                                  ? `تم اكتشاف ${activeDetectedCount} ملف مشبوه بحاجة للإجراء (حجز / إصلاح / حذف).`
                                  : "بعض دروع الحماية الأساسية معطلة حاليًا."}
                              </p>
                            </>
                          )}

                          {/* Primary CTA: Smart Scan */}
                          <div className="mt-8 flex justify-center">
                            <button
                              onClick={() => {
                                setActiveTab("scans");
                                startScan("smart");
                              }}
                              className="inline-flex items-center gap-3 rounded-2xl bg-orange-600 px-8 py-3.5 text-base font-extrabold text-white shadow-xl shadow-orange-600/30 transition-all hover:bg-orange-500 hover:scale-105 active:scale-95"
                            >
                              <Scan className="size-5" />
                              تشغيل الفحص الذكي (Run Smart Scan)
                            </button>
                          </div>
                        </div>

                        {/* Status Tiles */}
                        <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-white/10">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between text-xs text-white/60">
                              <span>دروع الحماية</span>
                              <ShieldCheck className="size-4 text-emerald-400" />
                            </div>
                            <p className="mt-2 text-base font-extrabold text-white">
                              {Object.values(shields).filter(Boolean).length} من 4 نشطة
                            </p>
                            <button
                              onClick={() => setActiveTab("core_shields")}
                              className="mt-2 text-xs font-bold text-orange-400 hover:underline"
                            >
                              إدارة الدروع ←
                            </button>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between text-xs text-white/60">
                              <span>صندوق الحجز</span>
                              <Archive className="size-4 text-amber-400" />
                            </div>
                            <p className="mt-2 text-base font-extrabold text-white">
                              {quarantinedCount} ملف معزول
                            </p>
                            <button
                              onClick={() => setActiveTab("quarantine")}
                              className="mt-2 text-xs font-bold text-orange-400 hover:underline"
                            >
                              عرض الملفات المحجوزة ←
                            </button>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between text-xs text-white/60">
                              <span>التهديدات المكتشفة</span>
                              <Bug className="size-4 text-rose-400" />
                            </div>
                            <p className="mt-2 text-base font-extrabold text-white">
                              {activeDetectedCount} تهديد بحاجة لمعالجة
                            </p>
                            <button
                              onClick={() => setActiveTab("scans")}
                              className="mt-2 text-xs font-bold text-orange-400 hover:underline"
                            >
                              فحص ومعالجة ←
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. SCANS TAB */}
                    {activeTab === "scans" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-black">فحص الفيروسات (Virus Scans)</h3>
                          <p className="text-xs text-white/60 mt-1">
                            اختر نوع الفحص المناسب لاكتشاف البرامج الضارة والتعامل معها.
                          </p>
                        </div>

                        {/* If currently scanning */}
                        {isScanning ? (
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-500 animate-pulse">
                              <Scan className="size-8 animate-spin" />
                            </div>
                            <h4 className="mt-4 text-lg font-black text-white">
                              جاري الفحص الآن:{" "}
                              {scanType === "smart"
                                ? "الفحص الذكي"
                                : scanType === "quick"
                                  ? "الفحص السريع"
                                  : "الفحص الكامل"}
                            </h4>
                            <p
                              className="mt-1 font-mono text-xs text-white/50 truncate max-w-lg mx-auto"
                              dir="ltr"
                            >
                              {currentScanningPath}
                            </p>

                            {/* Progress Bar */}
                            <div className="mt-5 w-full bg-white/10 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-orange-600 h-full rounded-full transition-all duration-200"
                                style={{ width: `${scanProgress}%` }}
                              />
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                              <span>التقدم: {scanProgress}%</span>
                              <span>الملفات المفحوصة: {scannedFilesCount.toLocaleString()}</span>
                            </div>

                            <button
                              onClick={() => setIsScanning(false)}
                              className="mt-5 rounded-xl border border-white/20 px-5 py-2 text-xs font-bold text-white hover:bg-white/10"
                            >
                              إيقاف الفحص مؤقتًا
                            </button>
                          </div>
                        ) : scanCompleted ? (
                          /* Scan Complete Results */
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                              <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                                  <Bug className="size-5" />
                                </span>
                                <div>
                                  <h4 className="font-extrabold text-base">
                                    اكتمل الفحص: تم اكتشاف تهديدات!
                                  </h4>
                                  <p className="text-xs text-white/60">
                                    تم فحص {scannedFilesCount.toLocaleString()} ملفًا بنجاح.
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => startScan(scanType)}
                                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20"
                              >
                                <RotateCcw className="size-3.5" />
                                إعادة الفحص
                              </button>
                            </div>

                            {/* Detected Threats List with the 3 course actions! */}
                            <div className="mt-5 space-y-3">
                              <p className="text-xs font-bold text-orange-400">
                                اختر إجراء التعامل مع كل ملف مشبوه (كما في المقرر: الحجز، الإصلاح،
                                الحذف):
                              </p>

                              {threats.map((threat) => {
                                return (
                                  <div
                                    key={threat.id}
                                    className={`rounded-xl border p-4 transition-all ${
                                      threat.status === "detected"
                                        ? "border-rose-500/40 bg-rose-500/10"
                                        : threat.status === "quarantined"
                                          ? "border-amber-500/40 bg-amber-500/10"
                                          : threat.status === "repaired"
                                            ? "border-emerald-500/40 bg-emerald-500/10"
                                            : "border-white/10 bg-white/5 opacity-50"
                                    }`}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span
                                            className="font-mono text-sm font-bold text-white"
                                            dir="ltr"
                                          >
                                            {threat.fileName}
                                          </span>
                                          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                                            {threat.type}
                                          </span>
                                          <span className="text-[10px] text-rose-400 font-bold">
                                            {threat.threatName}
                                          </span>
                                        </div>
                                        <p
                                          className="mt-1 font-mono text-[11px] text-white/50"
                                          dir="ltr"
                                        >
                                          {threat.path}
                                        </p>
                                      </div>

                                      {/* Status Badge */}
                                      <div>
                                        {threat.status === "quarantined" && (
                                          <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                                            <Archive className="size-4" /> تم الحجز (Quarantine)
                                          </span>
                                        )}
                                        {threat.status === "repaired" && (
                                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                                            <CheckCircle2 className="size-4" /> تم الإصلاح (Repair)
                                          </span>
                                        )}
                                        {threat.status === "deleted" && (
                                          <span className="flex items-center gap-1 text-xs font-bold text-white/40 line-through">
                                            <Trash2 className="size-4" /> تم الحذف (Delete)
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* The 3 Core Buttons for Detected Status */}
                                    {threat.status === "detected" && (
                                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                                        <span className="text-xs font-bold text-white/70 ml-2">
                                          الإجراء المطلوب:
                                        </span>

                                        {/* 1. QUARANTINE */}
                                        <button
                                          onClick={() => handleQuarantine(threat.id)}
                                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/30 transition-all hover:bg-amber-500/30"
                                          title="نقل الملف لحاوية الحجز المعزولة"
                                        >
                                          <Archive className="size-3.5" />
                                          1. الحجز (Quarantine)
                                        </button>

                                        {/* 2. REPAIR */}
                                        <button
                                          onClick={() => handleRepair(threat.id)}
                                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-300 border border-emerald-500/30 transition-all hover:bg-emerald-500/30"
                                          title="تنظيف الملف واستئصال الكود الخبيث"
                                        >
                                          <Wrench className="size-3.5" />
                                          2. الإصلاح (Repair)
                                        </button>

                                        {/* 3. DELETE */}
                                        <button
                                          onClick={() => handleDelete(threat.id)}
                                          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-3.5 py-1.5 text-xs font-bold text-rose-300 border border-rose-500/30 transition-all hover:bg-rose-500/30"
                                          title="حذف الملف نهائيًا من القرص"
                                        >
                                          <Trash2 className="size-3.5" />
                                          3. الحذف (Delete)
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          /* Scan Types Selector Cards */
                          <div className="grid gap-3 sm:grid-cols-2">
                            {/* Quick Scan */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-orange-500/40">
                              <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-orange-600/20 text-orange-400">
                                  <Zap className="size-5" />
                                </span>
                                <div>
                                  <h4 className="font-extrabold text-sm text-white">
                                    الفحص السريع (Quick Scan)
                                  </h4>
                                  <p className="text-[11px] text-white/50">
                                    فحص الذاكرة والمناطق الأكثر عرضة للإصابة
                                  </p>
                                </div>
                              </div>
                              <p className="mt-3 text-xs text-white/70 leading-relaxed">
                                يركز على ملفات بدء التشغيل وذاكرة النظام لاكتشاف التهديدات النشطة
                                بسرعة.
                              </p>
                              <button
                                onClick={() => startScan("quick")}
                                className="mt-4 w-full rounded-xl bg-white/10 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
                              >
                                بدء الفحص السريع
                              </button>
                            </div>

                            {/* Full Scan */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-orange-500/40">
                              <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-orange-600/20 text-orange-400">
                                  <HardDrive className="size-5" />
                                </span>
                                <div>
                                  <h4 className="font-extrabold text-sm text-white">
                                    الفحص الكامل (Full System Scan)
                                  </h4>
                                  <p className="text-[11px] text-white/50">
                                    فحص شامل لكافة الأقراص والملفات
                                  </p>
                                </div>
                              </div>
                              <p className="mt-3 text-xs text-white/70 leading-relaxed">
                                فحص معمق وشامل لكل مجلد وقرص ثابت ومحرك أقراص متصل بالنظام.
                              </p>
                              <button
                                onClick={() => startScan("full")}
                                className="mt-4 w-full rounded-xl bg-white/10 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
                              >
                                بدء الفحص الكامل
                              </button>
                            </div>

                            {/* Targeted / Custom Scan */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-orange-500/40">
                              <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-orange-600/20 text-orange-400">
                                  <FolderLock className="size-5" />
                                </span>
                                <div>
                                  <h4 className="font-extrabold text-sm text-white">
                                    فحص مخصص (Custom / Targeted)
                                  </h4>
                                  <p className="text-[11px] text-white/50">
                                    فحص مجلد معين أو ذاكرة فلاش خارجية
                                  </p>
                                </div>
                              </div>
                              <p className="mt-3 text-xs text-white/70 leading-relaxed">
                                يتيح تحديد ملفات معينة أو فلاش USB خارجي للتأكد من سلامتها قبل
                                فتحها.
                              </p>
                              <button
                                onClick={() => startScan("custom")}
                                className="mt-4 w-full rounded-xl bg-white/10 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
                              >
                                اختيار مجلد وفحصه
                              </button>
                            </div>

                            {/* Boot-time Scan */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-orange-500/40">
                              <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-orange-600/20 text-orange-400">
                                  <Disc className="size-5" />
                                </span>
                                <div>
                                  <h4 className="font-extrabold text-sm text-white">
                                    فحص وقت الإقلاع (Boot-Time Scan)
                                  </h4>
                                  <p className="text-[11px] text-white/50">
                                    فحص قبل بدء تشغيل نظام Windows
                                  </p>
                                </div>
                              </div>
                              <p className="mt-3 text-xs text-white/70 leading-relaxed">
                                يتم تشغيله أثناء إقلاع الجهاز لاصطياد برمجيات Rootkits والفيروسات
                                المتخفية.
                              </p>
                              <button
                                onClick={() => startScan("boot")}
                                className="mt-4 w-full rounded-xl bg-white/10 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
                              >
                                جدولة فحص الإقلاع
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. CORE SHIELDS TAB */}
                    {activeTab === "core_shields" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-black">
                            دروع الحماية الأساسية (Core Shields)
                          </h3>
                          <p className="text-xs text-white/60 mt-1">
                            خطوط الدفاع اللحظية التي تعمل في الخلفية لحماية النظام والملفات والويب
                            والبريد.
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {/* File Shield */}
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                                  <FileCheck className="size-5" />
                                </span>
                                <div>
                                  <h4 className="font-extrabold text-sm text-white">
                                    درع الملفات (File Shield)
                                  </h4>
                                  <p className="text-[11px] text-white/50">
                                    Real-time File Protection
                                  </p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={shields.file}
                                onChange={() => setShields((s) => ({ ...s, file: !s.file }))}
                                className="size-5 accent-orange-600 cursor-pointer"
                              />
                            </div>
                            <p className="mt-3 text-xs text-white/70 leading-relaxed">
                              يفحص تلقائيًا أي ملف يتم فتحه، أو نسخه، أو تنزيله، أو تشغيله على
                              الحاسوب لمنع التهديدات.
                            </p>
                            <span
                              className={`inline-block mt-3 text-[11px] font-bold ${shields.file ? "text-emerald-400" : "text-rose-400"}`}
                            >
                              {shields.file ? "✓ الدرع يعمل بنشاط" : "⚠ الدرع متوقف"}
                            </span>
                          </div>

                          {/* Behavior Shield */}
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                                  <Zap className="size-5" />
                                </span>
                                <div>
                                  <h4 className="font-extrabold text-sm text-white">
                                    درع السلوك (Behavior Shield)
                                  </h4>
                                  <p className="text-[11px] text-white/50">
                                    Behavioral Anomaly Detection
                                  </p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={shields.behavior}
                                onChange={() =>
                                  setShields((s) => ({ ...s, behavior: !s.behavior }))
                                }
                                className="size-5 accent-orange-600 cursor-pointer"
                              />
                            </div>
                            <p className="mt-3 text-xs text-white/70 leading-relaxed">
                              يراقب البرامج المثبتة أثناء عملها لرصد أي نشاط غير طبيعي شبيه ببرمجيات
                              الفدية وبرامج التجسس.
                            </p>
                            <span
                              className={`inline-block mt-3 text-[11px] font-bold ${shields.behavior ? "text-emerald-400" : "text-rose-400"}`}
                            >
                              {shields.behavior ? "✓ الدرع يعمل بنشاط" : "⚠ الدرع متوقف"}
                            </span>
                          </div>

                          {/* Web Shield */}
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                                  <Globe className="size-5" />
                                </span>
                                <div>
                                  <h4 className="font-extrabold text-sm text-white">
                                    درع الويب (Web Shield)
                                  </h4>
                                  <p className="text-[11px] text-white/50">
                                    Malicious Web Traffic Blocking
                                  </p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={shields.web}
                                onChange={() => setShields((s) => ({ ...s, web: !s.web }))}
                                className="size-5 accent-orange-600 cursor-pointer"
                              />
                            </div>
                            <p className="mt-3 text-xs text-white/70 leading-relaxed">
                              يحظر هجمات الويب والمواقع الاحتيالية والتنزيلات الخبيثة التلقائية
                              (Drive-by Downloads).
                            </p>
                            <span
                              className={`inline-block mt-3 text-[11px] font-bold ${shields.web ? "text-emerald-400" : "text-rose-400"}`}
                            >
                              {shields.web ? "✓ الدرع يعمل بنشاط" : "⚠ الدرع متوقف"}
                            </span>
                          </div>

                          {/* Mail Shield */}
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                                  <Mail className="size-5" />
                                </span>
                                <div>
                                  <h4 className="font-extrabold text-sm text-white">
                                    درع البريد (Mail Shield)
                                  </h4>
                                  <p className="text-[11px] text-white/50">
                                    Email Attachment Scanner
                                  </p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={shields.mail}
                                onChange={() => setShields((s) => ({ ...s, mail: !s.mail }))}
                                className="size-5 accent-orange-600 cursor-pointer"
                              />
                            </div>
                            <p className="mt-3 text-xs text-white/70 leading-relaxed">
                              يفحص رسائل البريد الإلكتروني والمرفقات الصادرة والواردة لاكتشاف ملفات
                              الفيروسات المرفقة.
                            </p>
                            <span
                              className={`inline-block mt-3 text-[11px] font-bold ${shields.mail ? "text-emerald-400" : "text-rose-400"}`}
                            >
                              {shields.mail ? "✓ الدرع يعمل بنشاط" : "⚠ الدرع متوقف"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. QUARANTINE / VIRUS CHEST TAB */}
                    {activeTab === "quarantine" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-black">
                              صندوق الفيروسات / الحجز (Virus Chest)
                            </h3>
                            <p className="text-xs text-white/60 mt-1">
                              منطقة معزولة مشفرة وآمنة تمامًا تحتفظ بالملفات الخطرة لمنعها من إيذاء
                              الحاسوب.
                            </p>
                          </div>
                        </div>

                        {threats.filter((t) => t.status === "quarantined").length === 0 ? (
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                            <Archive className="mx-auto size-12 text-white/30" />
                            <p className="mt-3 text-sm font-bold text-white/70">
                              صندوق الحجز فارغ حاليًا.
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                              يمكنك فحص الملفات ونقل التهديدات إلى الحجز من تبويب «فحص الفيروسات».
                            </p>
                            <button
                              onClick={() => setActiveTab("scans")}
                              className="mt-4 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-500"
                            >
                              الانتقال للفحص
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                            <div className="border-b border-white/10 px-5 py-3 text-xs font-bold text-white/60 flex items-center justify-between">
                              <span>الملفات المعزولة في صندوق الفيروسات</span>
                              <span>إجراءات الاستعادة أو الحذف النهائي</span>
                            </div>

                            <div className="divide-y divide-white/10">
                              {threats
                                .filter((t) => t.status === "quarantined")
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="p-4 flex flex-wrap items-center justify-between gap-3"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="font-mono text-sm font-bold text-white"
                                          dir="ltr"
                                        >
                                          {item.fileName}
                                        </span>
                                        <span className="rounded bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                                          معزول
                                        </span>
                                        <span className="text-xs text-rose-400 font-bold">
                                          {item.threatName}
                                        </span>
                                      </div>
                                      <p className="font-mono text-xs text-white/40 mt-1" dir="ltr">
                                        {item.path}
                                      </p>
                                      <p className="text-[11px] text-white/50 mt-1">
                                        تاريخ الحجز: {item.dateDetected}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* Restore */}
                                      <button
                                        onClick={() => handleRepair(item.id)}
                                        className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
                                      >
                                        استعادة وإصلاح
                                      </button>
                                      {/* Delete permanently */}
                                      <button
                                        onClick={() => handleDelete(item.id)}
                                        className="rounded-lg bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
                                      >
                                        حذف نهائي
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 5. SANDBOX TAB */}
                    {activeTab === "sandbox" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-black">صندوق الرمل (Avast Sandbox)</h3>
                          <p className="text-xs text-white/60 mt-1">
                            تشغيل الملفات والتطبيقات المشبوهة داخل بيئة افتراضية معزولة تمامًا عن
                            النظام الحقيقي.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                          <label className="text-xs font-bold text-white/80">
                            اختر ملفًا مشبوهًا لاختباره في صندوق الرمل:
                          </label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {[
                              "unverified_keygen.exe",
                              "macro_document.docm",
                              "unknown_updater.bat",
                            ].map((f) => (
                              <button
                                key={f}
                                onClick={() => setSandboxFile(f)}
                                className={`rounded-xl border px-3 py-1.5 text-xs font-mono transition-all ${
                                  sandboxFile === f
                                    ? "border-orange-500 bg-orange-600/30 text-white font-bold"
                                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                                }`}
                                dir="ltr"
                              >
                                {f}
                              </button>
                            ))}
                          </div>

                          <div className="mt-6 flex justify-start">
                            <button
                              onClick={runInSandbox}
                              disabled={sandboxRunning}
                              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500 disabled:opacity-50"
                            >
                              <Layers className="size-4" />
                              {sandboxRunning
                                ? "جاري التشغيل في الحاوية المعزولة..."
                                : "تشغيل في صندوق الرمل (Run in Sandbox)"}
                            </button>
                          </div>

                          {/* Sandbox Terminal Console */}
                          <div
                            className="mt-6 rounded-xl border border-black/40 bg-black/60 p-4 font-mono text-xs text-emerald-400"
                            dir="ltr"
                          >
                            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 text-white/50 text-[11px]">
                              <span>AVAST SANDBOX VIRTUAL CONTAINER v24.2</span>
                              <span>
                                STATUS:{" "}
                                {sandboxRunning
                                  ? "RUNNING"
                                  : sandboxVerdict
                                    ? "TERMINATED"
                                    : "IDLE"}
                              </span>
                            </div>

                            <div className="min-h-[120px] space-y-1.5">
                              {sandboxLogs.length === 0 && (
                                <p className="text-white/30">
                                  اضغط على زر التشغيل لبدء عزل الملف ومراقبته لحظيًا...
                                </p>
                              )}
                              {sandboxLogs.map((log, idx) => (
                                <p key={idx} className="leading-relaxed">
                                  <span className="text-white/40">
                                    [{new Date().toLocaleTimeString()}]
                                  </span>{" "}
                                  {log}
                                </p>
                              ))}
                            </div>

                            {sandboxVerdict && (
                              <div className="mt-4 border-t border-rose-500/40 pt-3 text-rose-400 font-bold flex items-center gap-2">
                                <AlertTriangle className="size-4" />
                                النتيجة: {sandboxVerdict}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6. RANSOMWARE SHIELD TAB */}
                    {activeTab === "ransomware" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-black">
                            درع برامج الفدية (Ransomware Shield)
                          </h3>
                          <p className="text-xs text-white/60 mt-1">
                            يحمي ملفاتك وصورك ومستنداتك الشخصية من التشفير الخبيث أو الحذف غير
                            المصرح به.
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <h4 className="font-extrabold text-sm text-white">
                              المجلدات المحمية (Protected Folders)
                            </h4>
                            <p className="text-xs text-white/50 mt-1">
                              لا يمكن لأي برنامج غير موثوق تعديل الملفات داخلها:
                            </p>

                            <div className="mt-4 space-y-2">
                              {protectedFolders.map((folder, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between rounded-lg bg-black/30 p-2.5 text-xs font-mono"
                                  dir="ltr"
                                >
                                  <span className="truncate">{folder}</span>
                                  <span className="text-emerald-400 font-bold ml-2">محمي</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <h4 className="font-extrabold text-sm text-white">
                              سجل محاولات التشفير المحظورة
                            </h4>
                            <p className="text-xs text-white/50 mt-1">
                              البرامج المشبوهة التي تم منعها من العبث بالبيانات:
                            </p>

                            <div className="mt-4 space-y-2">
                              {blockedRansomwareEvents.map((evt, i) => (
                                <div
                                  key={i}
                                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs"
                                >
                                  <div className="flex items-center justify-between font-bold text-rose-300">
                                    <span>{evt.app}</span>
                                    <span>{evt.status}</span>
                                  </div>
                                  <p className="mt-1 font-mono text-[11px] text-white/60" dir="ltr">
                                    {evt.target}
                                  </p>
                                  <span className="mt-1 block text-[10px] text-white/40">
                                    {evt.time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 7. NETWORK INSPECTOR TAB */}
                    {activeTab === "network" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-black">
                            فاحص الشبكة المنزلية (Network Inspector)
                          </h3>
                          <p className="text-xs text-white/60 mt-1">
                            يفحص أجهزة الراوتر والواي فاي المتصلة لاكتشاف الثغرات وكلمات المرور
                            الضعيفة.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-400">
                            <Wifi className="size-8" />
                          </div>
                          <h4 className="mt-4 text-base font-extrabold text-white">
                            الشبكة الحالية: Home_Fiber_5G
                          </h4>
                          <p className="text-xs text-white/50 mt-1">
                            IP Gateway: 192.168.1.1 (WPA3-Personal)
                          </p>

                          <div className="mt-6 flex justify-center">
                            <button
                              onClick={runNetworkInspect}
                              disabled={inspectingNetwork}
                              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-extrabold text-white hover:bg-orange-500 disabled:opacity-50"
                            >
                              {inspectingNetwork
                                ? "جاري فحص المنافذ والأجهزة المتصلة..."
                                : "بدء فحص الشبكة (Scan Network)"}
                            </button>
                          </div>

                          {networkInspected && (
                            <div className="mt-6 border-t border-white/10 pt-5 text-right">
                              <h5 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                                <CheckCircle2 className="size-4" /> تم فحص الشبكة: لا توجد ثغرات
                                خطيرة
                              </h5>
                              <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs">
                                <div className="rounded-lg bg-black/30 p-3">
                                  <span className="text-white/50 block">حالة الراوتر:</span>
                                  <strong className="text-white mt-1 block">
                                    محمي (كلمة سر قوية)
                                  </strong>
                                </div>
                                <div className="rounded-lg bg-black/30 p-3">
                                  <span className="text-white/50 block">المنافذ الحساسة:</span>
                                  <strong className="text-emerald-400 mt-1 block">
                                    مغلقة (Ports 21, 23, 8080)
                                  </strong>
                                </div>
                                <div className="rounded-lg bg-black/30 p-3">
                                  <span className="text-white/50 block">الأجهزة المتصلة:</span>
                                  <strong className="text-white mt-1 block">4 أجهزة موثوقة</strong>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 8. SOFTWARE UPDATER TAB */}
                    {activeTab === "updater" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-black">محدث البرامج (Software Updater)</h3>
                          <p className="text-xs text-white/60 mt-1">
                            البرامج القديمة تشكل ثغرات أمنية يستغلها المخترقون؛ يحافظ هذا القسم على
                            تحديث برامجك تلقائيًا.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                          <div className="divide-y divide-white/10">
                            {softwareList.map((app) => (
                              <div
                                key={app.id}
                                className="p-4 flex items-center justify-between gap-3"
                              >
                                <div>
                                  <p className="font-extrabold text-sm text-white">{app.name}</p>
                                  <p className="font-mono text-xs text-white/50 mt-0.5">
                                    الإصدار الحالي: {app.current}{" "}
                                    {app.updated ? "(محدث)" : `← يتوفر إصدار جديد ${app.latest}`}
                                  </p>
                                </div>

                                <div>
                                  {app.updated ? (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                      <CheckCircle2 className="size-4" /> محدث
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => updateSoftware(app.id)}
                                      disabled={updatingApps[app.id]}
                                      className="rounded-xl bg-orange-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-500 disabled:opacity-50"
                                    >
                                      {updatingApps[app.id] ? "جاري التحديث..." : "تحديث الآن"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 9. RESCUE DISK TAB */}
                    {activeTab === "rescue_disk" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-black">قرص الإنقاذ (Avast Rescue Disk)</h3>
                          <p className="text-xs text-white/60 mt-1">
                            أداة للطوارئ: إنشاء فلاشة USB ذاتية الإقلاع لفحص وتطهير الحواسيب المصابة
                            بشدة دون تشغيل ويندوز.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                          <Disc className="mx-auto size-14 text-orange-400" />
                          <h4 className="mt-4 text-base font-extrabold text-white">
                            إنشاء وسيط إنقاذ قابل للإقلاع (Bootable USB)
                          </h4>
                          <p className="text-xs text-white/60 max-w-md mx-auto mt-2 leading-relaxed">
                            يستخدم عندما يتعطل نظام التشغيل أو تمنع الفيروسات المستعصية فتح مضاد
                            الفيروسات العادي.
                          </p>

                          {rescueUsbStatus === "idle" && (
                            <button
                              onClick={createRescueDisk}
                              className="mt-6 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-orange-500"
                            >
                              إنشاء قرص إنقاذ على USB
                            </button>
                          )}

                          {rescueUsbStatus === "creating" && (
                            <div className="mt-6 max-w-xs mx-auto">
                              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-orange-600 h-full transition-all"
                                  style={{ width: `${rescueProgress}%` }}
                                />
                              </div>
                              <p className="text-xs text-white/60 mt-2">
                                جاري حرق ملفات الفحص على محرك الأقراص ({rescueProgress}%)...
                              </p>
                            </div>
                          )}

                          {rescueUsbStatus === "created" && (
                            <div className="mt-6 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                              <CheckCircle2 className="size-5" /> تم تجهيز قرص الإنقاذ بنجاح على
                              الفلاش ميموري!
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {/* End of tabs */}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </motion.div>
        )}

        {windowState === "minimized" && (
          <motion.div
            key="avast-minimized-bar"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="rounded-2xl border border-orange-500/40 bg-[#141926]/95 backdrop-blur-md p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-orange-600 text-white font-black text-sm shadow-md">
                a
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-white">Avast Premium Security</h4>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    مصغرة في شريط المهام (Minimized)
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  دروع الحماية الأساسية وفحص التهديدات مستمرة في العمل بالخلفية.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWindowState("open")}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition-colors cursor-pointer"
              >
                <Maximize2 className="size-4" />
                استعادة النافذة (Restore Window)
              </motion.button>
            </div>
          </motion.div>
        )}

        {windowState === "closed" && (
          <motion.div
            key="avast-closed-card"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="rounded-3xl border border-white/10 bg-[#161c2b] p-8 text-center shadow-2xl"
          >
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30 shadow-lg">
              <Shield className="size-10" />
            </div>
            <h3 className="mt-4 text-xl font-black text-white">تم إغلاق نافذة Avast Antivirus</h3>
            <p className="mt-1 text-xs text-white/60 max-w-md mx-auto">
              تم إغلاق واجهة المستخدم الرسومية لبرنامج الحماية. يمكنك إعادة تشغيل المحاكي في أي وقت
              لتجربة الفحص والتعامل مع التهديدات.
            </p>
            <div className="mt-6 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setWindowState("open");
                  setIsMaximized(false);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-7 py-3 text-sm font-extrabold text-white shadow-xl shadow-orange-600/30 hover:bg-orange-500 transition-all cursor-pointer"
              >
                <RotateCcw className="size-4.5" />
                إعادة تشغيل نافذة Avast (Relaunch Simulator)
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Curriculum Summary & Educational Link */}
      <div className="mt-8 panel p-6 md:p-8">
        <h4 className="text-lg font-black">ملخص مقرر أمن المعلومات حول برنامج Avast</h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <strong className="text-foreground block mb-1">1. أنواع الفحص (Scans):</strong>
            يوفر فحصًا سريعًا (Quick Scan) للمناطق الحساسة، وفحصًا كاملًا (Full Scan) لكافة الملفات،
            وفحصًا مخصصًا وفحص وقت الإقلاع.
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <strong className="text-foreground block mb-1">2. إجراءات التعامل مع الفيروسات:</strong>
            عند اكتشاف أي تهديد، يوفر البرنامج الخيارات الثلاثة المعتمدة: الحجز (Quarantine) أو
            الإصلاح (Repair) أو الحذف (Delete).
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <strong className="text-foreground block mb-1">3. دروع الحماية المتقدمة:</strong>
            دروع الملفات والسلوك والويب والبريد، بالإضافة إلى صندوق الرمل (Sandbox) لتجربة البرامج
            المشبوهة بأمان.
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Link
            to="/lessons/$slug"
            params={{ slug: "avast" }}
            className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
          >
            الانتقال لدرس مضاد الفيروسات Avast في المقرر
            <ArrowRight className="size-4" />
          </Link>

          <Link
            to="/activities"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
          >
            العودة للأنشطة التطبيقية
          </Link>
        </div>
      </div>
    </div>
  );
}
