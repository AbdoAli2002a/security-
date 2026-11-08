import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Play,
  RotateCcw,
  RefreshCw,
  FolderOpen,
  Terminal as TerminalIcon,
  HardDrive,
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ExternalLink,
  Laptop,
  Flame,
  Layers,
  Lock,
  Unlock,
  Archive,
  Volume2,
  VolumeX,
  Power,
  Sliders,
  Check,
  Trash2,
  Maximize2,
  Minimize2,
  X,
  Minus,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  Database,
  Usb,
  Copy,
  Cpu,
  Radio,
  FileCode,
  Wrench,
} from "lucide-react";
import { recordSimulatorInteraction } from "@/lib/digital-twin-store";

/* =========================================================================
   Types & Interfaces
   ========================================================================= */

export type AvastRescueSystemState = "bootloader" | "booting_winpe" | "desktop";

export type AvastRescueWindowId =
  "scanner" | "mbr_cleaner" | "file_recoverer" | "terminal" | "scenarios" | "hardware_info";

export type AvastScannerTab = "scan" | "chest" | "reports" | "settings";

export interface AvastThreatItem {
  id: string;
  name: string;
  type: "Rootkit" | "Trojan" | "Ransomware" | "Bootkit" | "Worm";
  path: string;
  risk: "Critical" | "High" | "Medium";
  status: "Detected" | "Fixed" | "InChest" | "Deleted" | "Ignored";
}

export interface ChestItem {
  id: string;
  fileName: string;
  infection: string;
  originalFolder: string;
  dateAdded: string;
  fileSize: string;
}

export interface AvastRescueScenario {
  id: string;
  title: string;
  badge: string;
  difficulty: "مبتدئ" | "متوسط" | "متقدم";
  description: string;
  requiredAction: string;
  hint: string;
  isCompleted: boolean;
}

/* =========================================================================
   Sound Helper (Web Audio API Synthesizer)
   ========================================================================= */

class AvastRescueAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  playTone(freq = 500, type: OscillatorType = "sine", duration = 0.08) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (err) {
      console.debug("Audio effect bypassed", err);
    }
  }

  playBootFanfare() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, "triangle", 0.22), idx * 110);
      });
    } catch (err) {
      console.debug("Audio effect bypassed", err);
    }
  }

  playAlarm() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      this.playTone(850, "sawtooth", 0.15);
      setTimeout(() => this.playTone(650, "sawtooth", 0.2), 150);
    } catch (err) {
      console.debug("Audio effect bypassed", err);
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      [587.33, 739.99, 880, 1174.66].forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, "sine", 0.18), idx * 80);
      });
    } catch (err) {
      console.debug("Audio effect bypassed", err);
    }
  }
}

const avastAudio = new AvastRescueAudio();

/* =========================================================================
   Main Component: AvastRescueSimulator
   ========================================================================= */

export function AvastRescueSimulator() {
  // System Life Cycle: Bootloader -> WinPE Booting -> Live Desktop
  const [systemState, setSystemState] = useState<AvastRescueSystemState>("desktop");
  const [bootSelection, setBootSelection] = useState<number>(0);
  const [bootCountdown, setBootCountdown] = useState<number>(5);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Desktop Window Manager
  const [openWindows, setOpenWindows] = useState<Record<AvastRescueWindowId, boolean>>({
    scanner: true,
    mbr_cleaner: false,
    file_recoverer: false,
    terminal: false,
    scenarios: true,
    hardware_info: false,
  });
  const [minimizedWindows, setMinimizedWindows] = useState<Record<AvastRescueWindowId, boolean>>({
    scanner: false,
    mbr_cleaner: false,
    file_recoverer: false,
    terminal: false,
    scenarios: false,
    hardware_info: false,
  });
  const [activeWindow, setActiveWindow] = useState<AvastRescueWindowId>("scanner");
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  // Scanner Subsystem
  const [scannerTab, setScannerTab] = useState<AvastScannerTab>("scan");
  const [scanType, setScanType] = useState<"all" | "system" | "custom" | "boot_sectors">("all");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedFilesCount, setScannedFilesCount] = useState(0);
  const [currentFilePath, setCurrentFilePath] = useState("");
  const [scanElapsedSecs, setScanElapsedSecs] = useState(0);

  // Threats in offline storage
  const [threats, setThreats] = useState<AvastThreatItem[]>([
    {
      id: "ath-1",
      name: "Win32:Rootkit-gen [Rtk]",
      type: "Rootkit",
      path: "\\\\.\\PhysicalDrive0 [Master Boot Record Sector 0]",
      risk: "Critical",
      status: "Detected",
    },
    {
      id: "ath-2",
      name: "Win32:WannaCryptor [Ransom]",
      type: "Ransomware",
      path: "C:\\Windows\\System32\\tasksche.exe",
      risk: "Critical",
      status: "Detected",
    },
    {
      id: "ath-3",
      name: "VBS:Malware-gen [Worm]",
      type: "Worm",
      path: "E:\\autorun.inf",
      risk: "High",
      status: "Detected",
    },
    {
      id: "ath-4",
      name: "Win32:Evo-gen [Susp]",
      type: "Trojan",
      path: "C:\\Users\\Student\\AppData\\Local\\Temp\\update_fake.exe",
      risk: "High",
      status: "Detected",
    },
  ]);

  // Virus Chest (Quarantine)
  const [chestItems, setChestItems] = useState<ChestItem[]>([
    {
      id: "ch-1",
      fileName: "ransom_payload.dll",
      infection: "Win32:Crypter-B [Trj]",
      originalFolder: "C:\\Windows\\Temp",
      dateAdded: "2026-11-07 14:10",
      fileSize: "1.2 MB",
    },
  ]);

  // MBR Boot-Time Rootkit Cleaner Subsystem
  const [mbrStatus, setMbrStatus] = useState<"corrupted" | "repaired">("corrupted");
  const [isFixingMbr, setIsFixingMbr] = useState(false);

  // Offline File Recoverer Subsystem
  const [rescuedFiles, setRescuedFiles] = useState<string[]>([]);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoverProgress, setRecoverProgress] = useState(0);

  // WinPE Terminal Subsystem
  const [terminalLines, setTerminalLines] = useState<{ cmd: string; output: string | string[] }[]>([
    {
      cmd: "ver",
      output: "Microsoft Windows [Version 10.0.19045.3803] (Avast Rescue WinPE x64)",
    },
    {
      cmd: "wmic diskdrive get model,size,status",
      output: [
        "Model                        Size           Status",
        "Samsung SSD 980 500GB        500107862016   OK",
        "Kingston DataTraveler 32GB   31000576000    OK",
        "Type 'help' for available rescue commands.",
      ],
    },
  ]);
  const [cmdInput, setCmdInput] = useState("");

  // Guided Rescue Missions
  const [scenarios, setScenarios] = useState<AvastRescueScenario[]>([
    {
      id: "avast-mission-1",
      title: "تطهير Rootkit الإقلاع العالق في قطاع MBR لحاسوب معمل التصميم",
      badge: "قطاعات الإقلاع MBR",
      difficulty: "متقدم",
      description:
        "حاسوب معمل تكنولوجيا التعليم يتوقف عند شاشة سوداء مع وميض المؤشر بسبب إصابة قطاع الإقلاع بـ Win32:Rootkit-gen.",
      requiredAction:
        "قم بتشغيل فحص قطاعات الإقلاع (Boot Sectors Scan) في أداة Avast Scanner ثم اختر 'إصلاح تلقائي' أو استخدم أداة MBR Cleaner.",
      hint: "اختر Boot Sectors من قائمة الفحص واضغط Start Scan، أو افتح أداة Avast MBR Cleaner واضغط 'إعادة كتابة قطاع MBR نظيف'.",
      isCompleted: false,
    },
    {
      id: "avast-mission-2",
      title: "استئصال برمجية الفدية Win32:WannaCryptor ونقلها إلى Virus Chest",
      badge: "هجمات الفدية Ransomware",
      difficulty: "متوسط",
      description:
        "برمجية فدية خبيثة تسللت إلى مجلد System32 وتعطل برامج الحماية داخل الويندوز. أسطوانة Avast تعمل من خارج النظام لاستئصالها.",
      requiredAction:
        "قم بفحص قرص C:، وعند رصد Win32:WannaCryptor انقر 'نقل إلى Virus Chest' لحجزها بأمان.",
      hint: "من نافذة الفحص، اضغط زر 'حجز في الصندوق (Move to Chest)' أمام التهديد الثاني.",
      isCompleted: false,
    },
    {
      id: "avast-mission-3",
      title: "إنقاذ مشروعات التخرج والوسائط المتعددة ونقلها إلى فلاش ميموري USB",
      badge: "إنقاذ واسترجاع الملفات",
      difficulty: "مبتدئ",
      description:
        "النظام معطل بالكامل، والمطلوب سحب ملفات مشروعات الطلاب والدروس التفاعلية قبل البدء في فرمتة القرص.",
      requiredAction:
        "افتح أداة Offline File Recoverer وانقر 'إنقاذ ونسخ الملفات إلى وحدة USB الخارجية'.",
      hint: "استخدم الأداة البرتقالية على سطح المكتب وانقر زر الإنقاذ السريع.",
      isCompleted: false,
    },
    {
      id: "avast-mission-4",
      title: "تطهير فلاشة USB الموصولة من دودة التشغيل التلقائي VBS:Malware-gen",
      badge: "حماية الفلاشات الخارجية",
      difficulty: "مبتدئ",
      description:
        "فلاشة المعمل تحتوي على فيروس اختصارات وملف autorun.inf خبيث يحاول إعادة إصابة الحواسيب بمجرد تشغيلها.",
      requiredAction: "حدد خيار فحص الفلاشات USB وقم بحذف أو تطهير ملف VBS:Malware-gen نهائياً.",
      hint: "اختر 'حذف نهائي (Delete)' أو 'تطهير (Fix)' لملف E:\\autorun.inf.",
      isCompleted: false,
    },
  ]);

  const markScenarioComplete = (id: string) => {
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, isCompleted: true } : s)));
    avastAudio.playSuccess();
    recordSimulatorInteraction();
  };

  /* =========================================================================
     Bootloader & Kernel Emulation
     ========================================================================= */

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (systemState === "bootloader" && bootCountdown > 0) {
      t = setTimeout(() => setBootCountdown((prev) => prev - 1), 1000);
    } else if (systemState === "bootloader" && bootCountdown === 0) {
      startWinPeBoot();
    }
    return () => clearTimeout(t);
  }, [systemState, bootCountdown]);

  const startWinPeBoot = () => {
    setSystemState("booting_winpe");
    avastAudio.playTone(480, "sine", 0.06);

    const logs = [
      "Starting Avast Rescue Windows PE (x64) ...",
      "Mounting boot image: boot.wim [Preinstallation Environment]",
      "Detecting disk controllers (Intel RST / NVMe Express) ... OK",
      "Initializing Avast Core Antivirus Engine (aswScan.sys) ...",
      "Loading Avast Offline Definitions database: 18.2.4901",
      "Mounting offline volumes: C: (Windows 11 NTFS), D: (Data NTFS), E: (USB FAT32)",
      "Starting Avast Rescue User Interface ...",
    ];

    setBootLogs([]);
    logs.forEach((log, index) => {
      setTimeout(
        () => {
          setBootLogs((prev) => [...prev, log]);
          if (index === logs.length - 1) {
            setTimeout(() => {
              setSystemState("desktop");
              avastAudio.playBootFanfare();
              recordSimulatorInteraction();
            }, 700);
          }
        },
        (index + 1) * 280,
      );
    });
  };

  /* =========================================================================
     Scanning Simulator Engine
     ========================================================================= */

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      const paths = [
        "\\\\.\\PhysicalDrive0 [Master Boot Record Sector 0]",
        "C:\\Windows\\System32\\ntoskrnl.exe",
        "C:\\Windows\\System32\\tasksche.exe",
        "C:\\Windows\\System32\\drivers\\aswRvrt.sys",
        "C:\\Windows\\System32\\winlogon.exe",
        "C:\\Users\\Student\\AppData\\Local\\Temp\\update_fake.exe",
        "C:\\Users\\Student\\Desktop\\Graduation_Project_VR\\assets.dat",
        "E:\\autorun.inf",
        "E:\\recovery_payload.vbs",
      ];

      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            setIsScanning(false);
            avastAudio.playAlarm();
            return 100;
          }
          const next = prev + 5;
          const p = paths[Math.floor((next / 100) * paths.length)] || paths[0];
          setCurrentFilePath(p);
          setScannedFilesCount((c) => c + 52);
          avastAudio.playTone(700 + next * 3, "sine", 0.03);
          return next;
        });
        setScanElapsedSecs((s) => s + 1);
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScannedFilesCount(0);
    setScanElapsedSecs(0);
    recordSimulatorInteraction();
  };

  const handleFixThreat = (id: string) => {
    setThreats((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Fixed" } : t)));
    avastAudio.playSuccess();

    if (id === "ath-1") {
      setMbrStatus("repaired");
      markScenarioComplete("avast-mission-1");
    }
    if (id === "ath-3") {
      markScenarioComplete("avast-mission-4");
    }
  };

  const handleMoveToChest = (id: string) => {
    const target = threats.find((t) => t.id === id);
    if (target) {
      setChestItems((prev) => [
        ...prev,
        {
          id: `ch-${Date.now()}`,
          fileName: target.path.split("\\").pop() || target.name,
          infection: target.name,
          originalFolder: target.path,
          dateAdded: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          fileSize: "1.4 MB",
        },
      ]);
      setThreats((prev) => prev.map((t) => (t.id === id ? { ...t, status: "InChest" } : t)));
      avastAudio.playTone(550, "sine", 0.1);

      if (id === "ath-2") {
        markScenarioComplete("avast-mission-2");
      }
    }
  };

  const handleDeleteThreat = (id: string) => {
    setThreats((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Deleted" } : t)));
    avastAudio.playTone(320, "square", 0.08);

    if (id === "ath-3") {
      markScenarioComplete("avast-mission-4");
    }
  };

  const handleResolveAll = () => {
    setThreats((prev) =>
      prev.map((t) => (t.status === "Detected" ? { ...t, status: "Fixed" } : t)),
    );
    setMbrStatus("repaired");
    avastAudio.playSuccess();
    markScenarioComplete("avast-mission-1");
    markScenarioComplete("avast-mission-2");
  };

  /* =========================================================================
     MBR Cleaner Subsystem
     ========================================================================= */

  const handleRestoreCleanMbr = () => {
    setIsFixingMbr(true);
    setTimeout(() => {
      setIsFixingMbr(false);
      setMbrStatus("repaired");
      handleFixThreat("ath-1");
      avastAudio.playSuccess();
    }, 1200);
  };

  /* =========================================================================
     Offline File Recoverer
     ========================================================================= */

  const handleRecoverFiles = () => {
    setIsRecovering(true);
    setRecoverProgress(0);

    const interval = setInterval(() => {
      setRecoverProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRecovering(false);
          setRescuedFiles([
            "Graduation_Project_Educational_VR.zip (4.8 GB)",
            "Multimedia_Production_Courseware.iso (1.2 GB)",
            "E-Exam_Question_Bank_Final.enc (18 MB)",
          ]);
          markScenarioComplete("avast-mission-3");
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  /* =========================================================================
     WinPE Terminal CLI
     ========================================================================= */

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cmdInput.trim().toLowerCase();
    if (!cmd) return;

    let output: string | string[] = "";

    if (cmd === "help") {
      output = [
        "Available Avast Rescue WinPE commands:",
        "  help              - Display this list of commands",
        "  avast-scan        - Start Avast offline antivirus command line scanner",
        "  bootrec /fixmbr   - Overwrite master boot record with clean Avast template",
        "  bootrec /fixboot  - Write a new boot sector to system partition",
        "  diskpart          - Launch offline disk partition manager",
        "  clean-autorun     - Remove autorun.inf and shortcut viruses from USB drives",
        "  reboot            - Restart computer back to bootloader menu",
        "  cls               - Clear command line window",
      ];
    } else if (cmd === "avast-scan") {
      output = [
        "Avast Offline Scanner v18.2 running...",
        "Scanning \\\\.\\PhysicalDrive0: Threat detected: Win32:Rootkit-gen",
        "Scanning C:\\Windows\\System32: Threat detected: Win32:WannaCryptor",
        "Total 4 threats found. Open graphical scanner for interactive resolution.",
      ];
      avastAudio.playTone(600, "sine", 0.08);
    } else if (cmd === "bootrec /fixmbr" || cmd === "fixmbr") {
      output = [
        "Scanning Master Boot Record on PhysicalDrive0...",
        "Writing clean standard MBR partition table...",
        "The operation completed successfully. Bootkit purged.",
      ];
      handleFixThreat("ath-1");
    } else if (cmd === "bootrec /fixboot") {
      output = "The operation completed successfully. Windows boot sector restored.";
    } else if (cmd === "diskpart" || cmd === "list disk") {
      output = [
        "DISKPART> list disk",
        "  Disk ###  Status         Size     Free     Dyn  Gpt",
        "  --------  -------------  -------  -------  ---  ---",
        "  Disk 0    Online          476 GB      0 B        *",
        "  Disk 1    Online           29 GB      0 B",
      ];
    } else if (cmd === "clean-autorun") {
      output = "Purging E:\\autorun.inf and malicious hidden shortcuts... Cleaned OK.";
      handleFixThreat("ath-3");
    } else if (cmd === "reboot") {
      setSystemState("bootloader");
      setBootCountdown(5);
      return;
    } else if (cmd === "cls") {
      setTerminalLines([]);
      setCmdInput("");
      return;
    } else {
      output = `'${cmd}' is not recognized as an internal or external command. Type 'help'.`;
    }

    setTerminalLines((prev) => [...prev, { cmd: cmdInput, output }]);
    setCmdInput("");
    avastAudio.playTone(520, "triangle", 0.04);
  };

  /* =========================================================================
     Window Controller
     ========================================================================= */

  const toggleWindow = (id: AvastRescueWindowId) => {
    setOpenWindows((prev) => {
      const nextOpen = !prev[id];
      if (nextOpen) {
        setMinimizedWindows((min) => ({ ...min, [id]: false }));
        setActiveWindow(id);
      }
      return { ...prev, [id]: nextOpen };
    });
    avastAudio.playTone(480, "sine", 0.05);
  };

  const focusWindow = (id: AvastRescueWindowId) => {
    setActiveWindow(id);
    setMinimizedWindows((min) => ({ ...min, [id]: false }));
  };

  const minimizeWindow = (id: AvastRescueWindowId, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMinimizedWindows((prev) => ({ ...prev, [id]: true }));
    avastAudio.playTone(320, "sine", 0.05);
  };

  const closeWindow = (id: AvastRescueWindowId, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenWindows((prev) => ({ ...prev, [id]: false }));
    avastAudio.playTone(280, "sine", 0.05);
  };

  const activeThreatsCount = threats.filter((t) => t.status === "Detected").length;
  const completedMissionsCount = scenarios.filter((s) => s.isCompleted).length;

  /* =========================================================================
     Render: 1. Bootloader Menu Screen
     ========================================================================= */

  if (systemState === "bootloader") {
    const options = [
      {
        title: "1. Start Avast Rescue Disk (GUI Mode)",
        desc: "الوضع الرسومي الافتراضي بكامل أدوات الفحص الحية وصندوق الفيروسات (موصى به)",
      },
      {
        title: "2. Start Avast Rescue Disk (Text / Safe Video Mode)",
        desc: "وضع التوافق للشاشات وكروت الشاشة التي تواجه مشاكل في الدقة الرسومية",
      },
      {
        title: "3. Hardware Diagnostics & Memory Test (MemTest)",
        desc: "فحص عتاد الجهاز وذاكرة الوصول العشوائي RAM لاكتشاف الأخطاء المادية",
      },
      {
        title: "4. Boot from Hard Drive (Continue Windows Startup)",
        desc: "إلغاء الإقلاع من أسطوانة الإنقاذ ومحاولة تشغيل الويندوز المثبت على الهارد",
      },
    ];

    return (
      <div className="relative flex min-h-[660px] w-full flex-col justify-between overflow-hidden rounded-3xl border border-orange-500/40 bg-[#12131a] p-8 font-mono text-orange-400 shadow-2xl">
        {/* Boot Header */}
        <div className="space-y-2 border-b border-orange-500/30 pb-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-lg shadow-orange-500/20">
              <Shield className="size-6 text-orange-500" />
            </span>
            <h1 className="text-xl font-black tracking-widest text-orange-300">
              AVAST RESCUE DISK (x64) - BOOT MENU
            </h1>
          </div>
          <p className="text-xs text-orange-500/80 font-sans">
            بيئة إقلاع حية متطورة لتطهير جذور الفيروسات والـ Rootkits المستعصية من خارج نظام التشغيل
          </p>
        </div>

        {/* Boot Options */}
        <div className="mx-auto my-8 w-full max-w-xl space-y-3">
          {options.map((opt, idx) => {
            const isSelected = bootSelection === idx;
            return (
              <div
                key={idx}
                onClick={() => setBootSelection(idx)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? "border-orange-500 bg-orange-950/40 text-orange-200 shadow-[0_0_15px_rgba(255,120,0,0.25)]"
                    : "border-orange-500/20 bg-orange-950/10 text-orange-500/70 hover:border-orange-500/40 hover:text-orange-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black">{isSelected ? "►" : " "}</span>
                  <div>
                    <h3 className="text-sm font-bold tracking-wide">{opt.title}</h3>
                    <p className="text-xs text-muted-foreground font-sans mt-0.5">{opt.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Countdown & Action */}
        <div className="flex flex-col items-center gap-4 border-t border-orange-500/30 pt-4">
          <div className="flex items-center gap-2 text-xs text-orange-400 font-sans">
            <Clock className="size-4 animate-spin text-orange-400" />
            <span>
              الإقلاع التلقائي للوضع المختار خلال:{" "}
              <strong className="font-mono text-sm text-orange-300">{bootCountdown}</strong> ثوانٍ
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startWinPeBoot}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold font-sans text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition-all"
            >
              <Play className="size-4" />
              <span>إقلاع فوري للوضع المختار [Enter]</span>
            </button>

            <button
              onClick={() => {
                setBootCountdown(999);
                avastAudio.playTone(350, "sine", 0.08);
              }}
              className="rounded-xl border border-orange-500/40 bg-orange-950/30 px-4 py-2.5 text-xs font-sans text-orange-300 hover:bg-orange-900/40 transition-all"
            >
              إيقاف العد التنازلي مؤقتاً
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     Render: 2. Booting WinPE Logs Screen
     ========================================================================= */

  if (systemState === "booting_winpe") {
    return (
      <div className="flex min-h-[660px] w-full flex-col justify-between overflow-hidden rounded-3xl border border-orange-500/30 bg-[#0f1017] p-8 font-mono text-xs text-orange-400 shadow-2xl">
        <div className="space-y-1">
          <p className="text-orange-500/70">Avast Boot Environment Loader v18.2.4901 (x64 WinPE)</p>
          <div className="my-4 h-px bg-orange-500/20" />
          {bootLogs.map((log, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="leading-relaxed"
            >
              <span className="text-orange-600 font-bold">[ OK ]</span> {log}
            </motion.p>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-orange-500/30 pt-4 text-[11px] text-orange-500/80">
          <span>Loading Avast Antivirus Graphical Shell ...</span>
          <span className="animate-pulse text-orange-400 font-bold">STARTING ENVIRONMENT...</span>
        </div>
      </div>
    );
  }

  /* =========================================================================
     Render: 3. Full Avast Rescue Live Desktop Environment
     ========================================================================= */

  return (
    <div
      className="relative flex min-h-[720px] w-full flex-col justify-between overflow-hidden rounded-3xl border border-orange-500/30 bg-[#161722] text-foreground shadow-2xl select-none"
      dir="rtl"
    >
      {/* Top Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-[#11121a] px-5 py-2.5 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/40">
            <Shield className="size-4 text-orange-500" />
          </span>
          <span className="font-latin font-black tracking-wider text-orange-400">
            AVAST RESCUE DISK 18.2
          </span>
          <span className="rounded bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 text-[10px] text-orange-400 font-latin">
            STANDALONE OFFLINE ENGINE
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Missions Badge */}
          <button
            onClick={() => toggleWindow("scenarios")}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
              completedMissionsCount === 4
                ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                : "border-orange-500/40 bg-orange-500/10 text-orange-300"
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>مهام الإنقاذ: {completedMissionsCount} من 4 مكتملة</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              avastAudio.enabled = next;
            }}
            className="flex size-7 items-center justify-center rounded-lg border border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
            title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
          >
            {soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          </button>

          {/* Reboot Button */}
          <button
            onClick={() => {
              if (window.confirm("هل تريد إعادة تشغيل أسطوانة الإنقاذ والعودة لشاشة الإقلاع؟")) {
                setSystemState("bootloader");
                setBootCountdown(5);
              }
            }}
            className="flex size-7 items-center justify-center rounded-lg border border-border bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
            title="إعادة تشغيل (Reboot to Bootloader)"
          >
            <Power className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Main Desktop Workspace with Desktop Icons */}
      <div className="relative flex-1 p-6 overflow-hidden">
        {/* Desktop Icons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 z-10 relative">
          {/* 1. Avast Standalone Scanner */}
          <button
            onDoubleClick={() => toggleWindow("scanner")}
            onClick={() => toggleWindow("scanner")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-3 text-center hover:border-orange-500/40 hover:bg-orange-950/20 transition-all group"
          >
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Shield className="size-8" />
              {activeThreatsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                  {activeThreatsCount}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-foreground">Avast Rescue Scanner</span>
          </button>

          {/* 2. MBR Rootkit Cleaner */}
          <button
            onDoubleClick={() => toggleWindow("mbr_cleaner")}
            onClick={() => toggleWindow("mbr_cleaner")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-3 text-center hover:border-rose-500/40 hover:bg-rose-950/20 transition-all group"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Wrench className="size-8" />
            </div>
            <span className="text-xs font-bold text-foreground">منظف قطاعات الإقلاع MBR</span>
          </button>

          {/* 3. Offline File Recoverer */}
          <button
            onDoubleClick={() => toggleWindow("file_recoverer")}
            onClick={() => toggleWindow("file_recoverer")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-3 text-center hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all group"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <FolderOpen className="size-8" />
            </div>
            <span className="text-xs font-bold text-foreground">مستكشف إنقاذ الملفات</span>
          </button>

          {/* 4. WinPE Command Prompt */}
          <button
            onDoubleClick={() => toggleWindow("terminal")}
            onClick={() => toggleWindow("terminal")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-3 text-center hover:border-orange-500/40 hover:bg-orange-950/20 transition-all group"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 border border-orange-500/30 text-orange-400 shadow-lg group-hover:scale-105 transition-transform">
              <TerminalIcon className="size-7" />
            </div>
            <span className="text-xs font-bold text-foreground font-mono">WinPE Terminal</span>
          </button>

          {/* 5. Guided Rescue Scenarios */}
          <button
            onDoubleClick={() => toggleWindow("scenarios")}
            onClick={() => toggleWindow("scenarios")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-3 text-center hover:border-primary/40 hover:bg-primary/20 transition-all group"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-orange-500 text-white shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="size-7" />
            </div>
            <span className="text-xs font-bold text-foreground">مهام وتحديات الإنقاذ</span>
          </button>

          {/* 6. Hardware Diagnostics */}
          <button
            onDoubleClick={() => toggleWindow("hardware_info")}
            onClick={() => toggleWindow("hardware_info")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-3 text-center hover:border-border hover:bg-secondary/40 transition-all group"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-foreground shadow-md group-hover:scale-105 transition-transform">
              <Cpu className="size-7" />
            </div>
            <span className="text-xs font-bold text-foreground">معلومات العتاد (WinPE)</span>
          </button>
        </div>

        {/* -------------------------------------------------------------
            WINDOW 1: Avast Rescue Scanner (Main Tool)
            ------------------------------------------------------------- */}
        <AnimatePresence>
          {openWindows.scanner && !minimizedWindows.scanner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => focusWindow("scanner")}
              className={`absolute top-8 left-4 right-4 md:left-12 md:right-12 z-20 flex flex-col rounded-2xl border bg-[#1c1d29] shadow-2xl overflow-hidden backdrop-blur-xl ${
                activeWindow === "scanner"
                  ? "border-orange-500/50 shadow-orange-500/10 ring-1 ring-orange-500/30"
                  : "border-border/80 opacity-95"
              }`}
            >
              {/* Window Title Bar */}
              <div className="flex items-center justify-between border-b border-border/80 bg-[#141520] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-orange-500" />
                  <span className="text-xs font-bold text-foreground font-latin">
                    Avast Rescue Antivirus Scanner [Offline Engine]
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => minimizeWindow("scanner", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Minus className="size-3" />
                  </button>
                  <button
                    onClick={(e) => closeWindow("scanner", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-rose-500/20 hover:text-rose-400"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>

              {/* Status Header Banner */}
              <div
                className={`flex items-center justify-between px-6 py-3.5 border-b ${
                  activeThreatsCount > 0
                    ? "border-rose-500/30 bg-rose-950/20"
                    : "border-emerald-500/30 bg-emerald-950/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  {activeThreatsCount > 0 ? (
                    <ShieldAlert className="size-8 text-rose-500 animate-pulse" />
                  ) : (
                    <ShieldCheck className="size-8 text-emerald-400" />
                  )}
                  <div>
                    <h2 className="text-sm font-black text-foreground">
                      {activeThreatsCount > 0
                        ? `تم رصد ${activeThreatsCount} تهديدات خطيرة في النظام والأقراص!`
                        : "حالة النظام: تم فحص وتطهير التهديدات بنجاح"}
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      المحرك: Avast Offline Definitions 18.2 | الفحص يعمل من خارج نظام التشغيل
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeThreatsCount > 0 && (
                    <button
                      onClick={handleResolveAll}
                      className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-1.5 text-xs font-black text-white shadow-md transition-all"
                    >
                      معالجة كافة التهديدات تلقائياً
                    </button>
                  )}
                </div>
              </div>

              {/* Window Tabs Bar */}
              <div className="flex items-center gap-1 border-b border-border/80 bg-[#12131c] px-4 py-1.5 text-xs">
                <button
                  onClick={() => setScannerTab("scan")}
                  className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                    scannerTab === "scan"
                      ? "bg-orange-600 text-white"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  فحص الفيروسات (Scan)
                </button>
                <button
                  onClick={() => setScannerTab("chest")}
                  className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                    scannerTab === "chest"
                      ? "bg-orange-600 text-white"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  صندوق الفيروسات (Virus Chest) ({chestItems.length})
                </button>
                <button
                  onClick={() => setScannerTab("reports")}
                  className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                    scannerTab === "reports"
                      ? "bg-orange-600 text-white"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  تقارير وسجل الفحص
                </button>
                <button
                  onClick={() => setScannerTab("settings")}
                  className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                    scannerTab === "settings"
                      ? "bg-orange-600 text-white"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  إعدادات الاستدلال (Heuristics)
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 max-h-[480px] overflow-y-auto">
                {/* 1. Scan Tab */}
                {scannerTab === "scan" && (
                  <div className="space-y-6">
                    {/* Scan Type Selection */}
                    <div>
                      <h3 className="text-xs font-black text-foreground mb-3">
                        حدد نطاق الفحص المطلوب (Scan Scope):
                      </h3>
                      <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
                        {[
                          {
                            id: "all" as const,
                            title: "كافة الأقراص الصلبة (All Drives)",
                            desc: "فحص عميق وشامل لـ C: و D: وفلاشات USB",
                          },
                          {
                            id: "system" as const,
                            title: "قرص النظام فقط (System C:)",
                            desc: "فحص مجلدات Windows و System32 والبرامج",
                          },
                          {
                            id: "boot_sectors" as const,
                            title: "قطاعات الإقلاع (Boot Sectors)",
                            desc: "فحص الـ MBR و GPT وسجلات الإقلاع",
                          },
                          {
                            id: "custom" as const,
                            title: "فحص فلاشات USB والوسائط",
                            desc: "فحص وحدة USB الموصولة بالمعمل E:",
                          },
                        ].map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setScanType(item.id)}
                            className={`cursor-pointer rounded-xl border p-3 transition-all ${
                              scanType === item.id
                                ? "border-orange-500 bg-orange-950/20 text-orange-300"
                                : "border-border/80 bg-secondary/20 hover:border-orange-500/40 text-muted-foreground"
                            }`}
                          >
                            <span className="block text-xs font-bold text-foreground mb-1">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scan Progress Panel */}
                    <div className="rounded-2xl border border-border/80 bg-[#12131c] p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-muted-foreground">
                            حالة الفحص:{" "}
                            {isScanning ? (
                              <span className="text-orange-400 font-bold">
                                جاري الفحص واستدعاء التوقيعات...
                              </span>
                            ) : scanProgress === 100 ? (
                              <span className="text-rose-400 font-bold">
                                انتهى الفحص - تم العثور على تهديدات!
                              </span>
                            ) : (
                              "جاهز للبدء"
                            )}
                          </span>
                          {currentFilePath && (
                            <p className="mt-1 font-mono text-[11px] text-orange-300 truncate max-w-xl">
                              {currentFilePath}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {isScanning ? (
                            <button
                              onClick={() => setIsScanning(false)}
                              className="rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-300"
                            >
                              إيقاف مؤقت
                            </button>
                          ) : (
                            <button
                              onClick={handleStartScan}
                              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-black text-white shadow-md hover:bg-orange-500 transition-all"
                            >
                              <Play className="size-4" />
                              <span>بدء الفحص الآن (Start Scan)</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-latin font-bold">
                          <span>{scanProgress}%</span>
                          <span>الملفات المفحوصة: {scannedFilesCount.toLocaleString()}</span>
                          <span>الزمن: {scanElapsedSecs} ثانية</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-secondary/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Threats Table */}
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="size-4 text-rose-400" />
                          <h4 className="text-xs font-black text-foreground">
                            التهديدات المكتشفة ({threats.length})
                          </h4>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-border/80">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-[#141520] text-muted-foreground border-b border-border/80">
                            <tr>
                              <th className="p-3">اسم الفيروس / التهديد</th>
                              <th className="p-3">النوع</th>
                              <th className="p-3">المسار المصاب</th>
                              <th className="p-3">الخطورة</th>
                              <th className="p-3">الحالة</th>
                              <th className="p-3 text-center">الإجراء</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 bg-[#181926]">
                            {threats.map((th) => (
                              <tr key={th.id} className="hover:bg-secondary/20 transition-colors">
                                <td className="p-3 font-mono font-bold text-rose-400">{th.name}</td>
                                <td className="p-3 text-muted-foreground">{th.type}</td>
                                <td className="p-3 font-mono text-[11px] text-muted-foreground max-w-xs truncate">
                                  {th.path}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                      th.risk === "Critical"
                                        ? "bg-rose-500/20 text-rose-400"
                                        : "bg-amber-500/20 text-amber-400"
                                    }`}
                                  >
                                    {th.risk}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                      th.status === "Detected"
                                        ? "bg-rose-500/20 text-rose-300"
                                        : th.status === "Fixed"
                                          ? "bg-emerald-500/20 text-emerald-300"
                                          : th.status === "InChest"
                                            ? "bg-orange-500/20 text-orange-300"
                                            : "bg-gray-500/20 text-gray-400"
                                    }`}
                                  >
                                    {th.status === "Detected"
                                      ? "⚠️ تم الاكتشاف"
                                      : th.status === "Fixed"
                                        ? "✅ تم الإصلاح"
                                        : th.status === "InChest"
                                          ? "📦 في الصندوق"
                                          : "حُذف"}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleFixThreat(th.id)}
                                      disabled={th.status === "Fixed"}
                                      className="rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300 disabled:opacity-40"
                                      title="إصلاح التهديد أو استعادة قطاع الإقلاع"
                                    >
                                      إصلاح
                                    </button>
                                    <button
                                      onClick={() => handleMoveToChest(th.id)}
                                      disabled={th.status === "InChest"}
                                      className="rounded bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 px-2 py-0.5 text-[10px] font-bold text-orange-300 disabled:opacity-40"
                                      title="نقل إلى صندوق الفيروسات (Virus Chest)"
                                    >
                                      حجز
                                    </button>
                                    <button
                                      onClick={() => handleDeleteThreat(th.id)}
                                      disabled={th.status === "Deleted"}
                                      className="rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300 disabled:opacity-40"
                                      title="حذف نهائي"
                                    >
                                      حذف
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Virus Chest Tab */}
                {scannerTab === "chest" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-foreground">
                        صندوق الفيروسات (Avast Virus Chest)
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        العناصر المعزولة: {chestItems.length}
                      </span>
                    </div>

                    {chestItems.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
                        صندوق الفيروسات فارغ حالياً.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-border/80">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-[#141520] text-muted-foreground border-b border-border/80">
                            <tr>
                              <th className="p-3">اسم الملف</th>
                              <th className="p-3">نوع الإصابة</th>
                              <th className="p-3">المسار الأصلي</th>
                              <th className="p-3">تاريخ الحجز</th>
                              <th className="p-3">الحجم</th>
                              <th className="p-3 text-center">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 bg-[#181926]">
                            {chestItems.map((item) => (
                              <tr key={item.id} className="hover:bg-secondary/20">
                                <td className="p-3 font-mono font-bold text-foreground">
                                  {item.fileName}
                                </td>
                                <td className="p-3 font-mono text-orange-400">{item.infection}</td>
                                <td className="p-3 font-mono text-[11px] text-muted-foreground truncate max-w-xs">
                                  {item.originalFolder}
                                </td>
                                <td className="p-3 text-muted-foreground font-latin">
                                  {item.dateAdded}
                                </td>
                                <td className="p-3 text-muted-foreground font-latin">
                                  {item.fileSize}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setChestItems((prev) =>
                                          prev.filter((c) => c.id !== item.id),
                                        );
                                        avastAudio.playTone(400, "sine", 0.08);
                                      }}
                                      className="rounded bg-secondary hover:bg-secondary/80 px-2 py-0.5 text-[10px] font-bold text-foreground"
                                    >
                                      استعادة
                                    </button>
                                    <button
                                      onClick={() => {
                                        setChestItems((prev) =>
                                          prev.filter((c) => c.id !== item.id),
                                        );
                                        avastAudio.playTone(300, "square", 0.08);
                                      }}
                                      className="rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-2 py-0.5 text-[10px] font-bold"
                                    >
                                      حذف نهائي
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Reports Tab */}
                {scannerTab === "reports" && (
                  <div className="rounded-2xl border border-border/80 bg-[#12131c] p-5 space-y-4">
                    <h3 className="text-xs font-black text-foreground">
                      سجلات الفحص الحية (Avast Rescue Audit Log)
                    </h3>
                    <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto">
                      <div className="border-b border-border/40 pb-1.5 text-orange-400">
                        [10:20:10] Avast Rescue Environment initialized (WinPE 64-bit).
                      </div>
                      <div className="border-b border-border/40 pb-1.5 text-muted-foreground">
                        [10:20:18] Loaded offline virus definitions database v18.2.4901.
                      </div>
                      <div className="border-b border-border/40 pb-1.5 text-rose-400">
                        [10:21:05] ALERT: Win32:Rootkit-gen detected in MBR sector of
                        PhysicalDrive0.
                      </div>
                      <div className="border-b border-border/40 pb-1.5 text-rose-400">
                        [10:21:40] ALERT: Win32:WannaCryptor detected in
                        C:\Windows\System32\tasksche.exe.
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Settings Tab */}
                {scannerTab === "settings" && (
                  <div className="rounded-2xl border border-border/80 bg-[#12131c] p-5 space-y-4">
                    <h3 className="text-xs font-black text-foreground">
                      خيارات الاستدلال والفحص العميق (Heuristics & Archives)
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/80 bg-secondary/30 p-3">
                        <span className="block text-xs font-bold text-foreground">
                          التحليل الاستدلالي الذكي
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          مفعل على الوضع الأقصى لاكتشاف الفيروسات وبرمجيات الفدية الجديدة غير
                          المصنفة.
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/80 bg-secondary/30 p-3">
                        <span className="block text-xs font-bold text-foreground">
                          فحص داخل الملفات المضغوطة (.zip, .rar, .iso)
                        </span>
                        <p className="text-[11px] text-emerald-400 mt-1 font-bold">
                          مفعل تلقائياً لكشف الملفات المحقونة داخل الأرشيف
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------------
            WINDOW 2: Avast MBR Rootkit Cleaner Window
            ------------------------------------------------------------- */}
        <AnimatePresence>
          {openWindows.mbr_cleaner && !minimizedWindows.mbr_cleaner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => focusWindow("mbr_cleaner")}
              className={`absolute top-16 left-6 right-6 md:left-20 md:right-20 z-20 flex flex-col rounded-2xl border bg-[#1c1d29] shadow-2xl overflow-hidden backdrop-blur-xl ${
                activeWindow === "mbr_cleaner"
                  ? "border-rose-500/50 shadow-rose-500/10 ring-1 ring-rose-500/30"
                  : "border-border/80 opacity-95"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/80 bg-[#141520] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Wrench className="size-4 text-rose-400" />
                  <span className="text-xs font-bold text-foreground font-latin">
                    Avast MBR & Boot Sector Cleaner Tool
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => minimizeWindow("mbr_cleaner", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Minus className="size-3" />
                  </button>
                  <button
                    onClick={(e) => closeWindow("mbr_cleaner", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-rose-500/20 hover:text-rose-400"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto">
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-200">
                  <p className="font-bold">
                    💡 قطاع الإقلاع الرئيسي (MBR) هو القطاع رقم 0 في الهارد ديسك؛ إصابته بـ Bootkit
                    تمنع إقلاع الويندوز نهائياً. تقوم أداة Avast بإعادة كتابة كود إقلاع قياسي نظيف
                    دون المساس بجدول الأقسام أو ملفاتك.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        حالة قطاع الإقلاع: \\.\PhysicalDrive0
                      </h4>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Sector 0 (512 Bytes)
                      </span>
                    </div>

                    <span
                      className={`rounded px-2.5 py-1 text-xs font-bold ${
                        mbrStatus === "corrupted"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {mbrStatus === "corrupted"
                        ? "⚠️ مصاب بـ Rootkit (Win32:Rootkit-gen)"
                        : "✅ سليم ومطهر (Clean Standard MBR)"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex justify-end">
                    <button
                      onClick={handleRestoreCleanMbr}
                      disabled={isFixingMbr || mbrStatus === "repaired"}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow disabled:opacity-50 transition-all"
                    >
                      {isFixingMbr ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" />
                          <span>جاري إعادة كتابة قطاع MBR نظيف...</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="size-4" />
                          <span>إعادة كتابة وتطهير قطاع MBR نظيف</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------------
            WINDOW 3: Offline File Recoverer
            ------------------------------------------------------------- */}
        <AnimatePresence>
          {openWindows.file_recoverer && !minimizedWindows.file_recoverer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => focusWindow("file_recoverer")}
              className={`absolute top-20 left-8 right-8 md:left-24 md:right-24 z-20 flex flex-col rounded-2xl border bg-[#1c1d29] shadow-2xl overflow-hidden backdrop-blur-xl ${
                activeWindow === "file_recoverer"
                  ? "border-cyan-500/50 shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "border-border/80 opacity-95"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/80 bg-[#141520] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FolderOpen className="size-4 text-cyan-400" />
                  <span className="text-xs font-bold text-foreground font-latin">
                    Avast Offline File Recoverer [Rescue to USB]
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => minimizeWindow("file_recoverer", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Minus className="size-3" />
                  </button>
                  <button
                    onClick={(e) => closeWindow("file_recoverer", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-rose-500/20 hover:text-rose-400"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto">
                <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="text-xs text-muted-foreground">
                    المسار المصدر:{" "}
                    <span className="font-bold text-foreground font-latin">
                      C:\Users\Student\Desktop
                    </span>
                  </div>
                  <button
                    onClick={handleRecoverFiles}
                    disabled={isRecovering}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-black text-white shadow disabled:opacity-50 transition-all"
                  >
                    <Usb className="size-4" />
                    <span>إنقاذ ونسخ الملفات إلى وحدة USB</span>
                  </button>
                </div>

                {isRecovering && (
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2">
                    <div className="flex justify-between text-xs text-cyan-300 font-latin font-bold">
                      <span>جاري نسخ مشروعات التخرج والملفات إلى E:\USB_Rescue ...</span>
                      <span>{recoverProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-500 transition-all"
                        style={{ width: `${recoverProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  {[
                    {
                      name: "Graduation_Project_Educational_VR.zip",
                      size: "4.8 GB",
                      desc: "مشروع تخرج الواقع الافتراضي التعليمي",
                    },
                    {
                      name: "Multimedia_Production_Courseware.iso",
                      size: "1.2 GB",
                      desc: "حزم المقررات الإلكترونية التفاعلية",
                    },
                    {
                      name: "E-Exam_Question_Bank_Final.enc",
                      size: "18 MB",
                      desc: "بنك أسئلة الاختبارات الإلكترونية المشفر",
                    },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-border/80 bg-secondary/20 p-3 hover:bg-secondary/40"
                    >
                      <div className="flex items-center gap-3">
                        <Archive className="size-5 text-cyan-400" />
                        <div>
                          <span className="block font-mono text-xs font-bold text-foreground">
                            {f.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{f.desc}</span>
                        </div>
                      </div>
                      <span className="font-latin text-xs text-muted-foreground">{f.size}</span>
                    </div>
                  ))}
                </div>

                {rescuedFiles.length > 0 && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs text-emerald-300">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" /> تم إنقاذ {rescuedFiles.length} ملفات بنجاح
                      إلى فلاشة USB الخارجية (E:\USB_Rescue)!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------------
            WINDOW 4: WinPE Command Prompt Terminal
            ------------------------------------------------------------- */}
        <AnimatePresence>
          {openWindows.terminal && !minimizedWindows.terminal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => focusWindow("terminal")}
              className={`absolute top-24 left-10 right-10 md:left-28 md:right-28 z-20 flex flex-col rounded-2xl border bg-[#0b0c14] shadow-2xl overflow-hidden backdrop-blur-xl ${
                activeWindow === "terminal"
                  ? "border-orange-500/60 shadow-orange-500/10 ring-1 ring-orange-500/30"
                  : "border-border/80 opacity-95"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/80 bg-[#12131d] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="size-4 text-orange-400" />
                  <span className="text-xs font-bold text-foreground font-mono">
                    Administrator: X:\windows\system32\cmd.exe (Avast Rescue WinPE)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => minimizeWindow("terminal", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Minus className="size-3" />
                  </button>
                  <button
                    onClick={(e) => closeWindow("terminal", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-rose-500/20 hover:text-rose-400"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>

              <div className="p-5 font-mono text-xs text-orange-400 space-y-3 max-h-80 overflow-y-auto">
                {terminalLines.map((line, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-orange-300">
                      <span className="text-primary font-bold">X:\windows\system32&gt;</span>{" "}
                      {line.cmd}
                    </p>
                    {Array.isArray(line.output) ? (
                      line.output.map((out, j) => (
                        <p key={j} className="text-orange-200/90 leading-relaxed">
                          {out}
                        </p>
                      ))
                    ) : (
                      <p className="text-orange-200/90 leading-relaxed">{line.output}</p>
                    )}
                  </div>
                ))}

                <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-2">
                  <span className="text-primary font-bold">X:\windows\system32&gt;</span>
                  <input
                    type="text"
                    value={cmdInput}
                    onChange={(e) => setCmdInput(e.target.value)}
                    placeholder="اكتب أمراً هنا (جرب: help, avast-scan, bootrec /fixmbr, diskpart)..."
                    className="flex-1 bg-transparent text-xs text-orange-200 outline-none"
                    autoFocus
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------------
            WINDOW 5: Guided Rescue Missions Panel
            ------------------------------------------------------------- */}
        <AnimatePresence>
          {openWindows.scenarios && !minimizedWindows.scenarios && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => focusWindow("scenarios")}
              className={`absolute bottom-16 right-6 md:right-12 w-96 max-w-full z-30 flex flex-col rounded-2xl border bg-[#1c1d29]/95 shadow-2xl overflow-hidden backdrop-blur-xl ${
                activeWindow === "scenarios"
                  ? "border-primary/50 shadow-primary/10 ring-1 ring-primary/30"
                  : "border-border/80 opacity-95"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/80 bg-[#141520] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    مهام أسطوانة الإنقاذ Avast
                  </span>
                  <span className="rounded-full bg-primary/20 px-2 py-0.2 text-[10px] font-black text-primary">
                    {completedMissionsCount}/4
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => minimizeWindow("scenarios", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Minus className="size-3" />
                  </button>
                  <button
                    onClick={(e) => closeWindow("scenarios", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-rose-500/20 hover:text-rose-400"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3 max-h-96 overflow-y-auto text-xs">
                {scenarios.map((sc) => (
                  <div
                    key={sc.id}
                    className={`rounded-xl border p-3 transition-all ${
                      sc.isCompleted
                        ? "border-emerald-500/40 bg-emerald-950/20"
                        : "border-border/80 bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="rounded bg-orange-500/20 px-2 py-0.2 text-[10px] font-bold text-orange-400">
                        {sc.badge}
                      </span>
                      <span
                        className={`font-bold ${
                          sc.isCompleted ? "text-emerald-400" : "text-muted-foreground"
                        }`}
                      >
                        {sc.isCompleted ? "✅ تم الإنجاز" : "⏳ قيد المحاولة"}
                      </span>
                    </div>

                    <h4 className="font-bold text-foreground mb-1">{sc.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                      {sc.description}
                    </p>

                    <div className="rounded-lg bg-card/60 p-2 text-[11px] text-foreground mb-2">
                      <strong>المطلوب: </strong>
                      {sc.requiredAction}
                    </div>

                    <div className="text-[10px] text-primary/90 flex items-center gap-1">
                      <Info className="size-3" />
                      <span>تلميح: {sc.hint}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------------
            WINDOW 6: Hardware Diagnostics (WinPE)
            ------------------------------------------------------------- */}
        <AnimatePresence>
          {openWindows.hardware_info && !minimizedWindows.hardware_info && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => focusWindow("hardware_info")}
              className="absolute top-28 left-16 right-16 md:left-32 md:right-32 z-20 flex flex-col rounded-2xl border border-border bg-[#1c1d29] shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-border/80 bg-[#141520] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="size-4 text-orange-400" />
                  <span className="text-xs font-bold text-foreground font-latin">
                    WinPE System Diagnostics & Storage Overview
                  </span>
                </div>
                <button
                  onClick={(e) => closeWindow("hardware_info", e)}
                  className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-rose-500/20 hover:text-rose-400"
                >
                  <X className="size-3" />
                </button>
              </div>

              <div className="p-6 font-mono text-xs space-y-3">
                <div className="rounded-xl border border-border/80 bg-[#12131c] p-3 space-y-1">
                  <p className="text-orange-400 font-bold">OS: Windows PE 10.0 x64 Live Image</p>
                  <p className="text-foreground">
                    CPU: Intel Core i7 Educational Station (8 Cores)
                  </p>
                  <p className="text-foreground">RAM: 16 GB Physical Memory</p>
                  <p className="text-emerald-400">Drive C: Windows 11 (NTFS) - 240 GB Mounted</p>
                  <p className="text-cyan-400">Drive E: USB Flash Media (FAT32) - 32 GB Ready</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Taskbar */}
      <div className="relative z-40 flex items-center justify-between border-t border-border/80 bg-[#101118] px-4 py-2">
        {/* Start Button */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => setIsStartMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-3 py-1.5 text-xs font-black text-white shadow-md hover:from-orange-500 hover:to-amber-500 transition-all"
          >
            <Shield className="size-4" />
            <span className="font-latin tracking-wide">AVAST RESCUE</span>
          </button>

          {/* Start Menu Dropdown */}
          <AnimatePresence>
            {isStartMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-12 right-0 w-64 rounded-2xl border border-border bg-[#181926] p-3 shadow-2xl backdrop-blur-xl z-50 text-right"
              >
                <div className="border-b border-border/60 pb-2 mb-2">
                  <h4 className="text-xs font-black text-foreground">قائمة أسطوانة Avast Rescue</h4>
                  <span className="text-[10px] text-muted-foreground">WinPE Rescue Tools</span>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      toggleWindow("scanner");
                      setIsStartMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-right hover:bg-secondary/50 transition-colors"
                  >
                    <Shield className="size-4 text-orange-400" />
                    <span>Avast Rescue Scanner</span>
                  </button>

                  <button
                    onClick={() => {
                      toggleWindow("mbr_cleaner");
                      setIsStartMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-right hover:bg-secondary/50 transition-colors"
                  >
                    <Wrench className="size-4 text-rose-400" />
                    <span>منظف قطاعات الإقلاع MBR</span>
                  </button>

                  <button
                    onClick={() => {
                      toggleWindow("file_recoverer");
                      setIsStartMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-right hover:bg-secondary/50 transition-colors"
                  >
                    <FolderOpen className="size-4 text-cyan-400" />
                    <span>مستكشف إنقاذ الملفات إلى USB</span>
                  </button>

                  <button
                    onClick={() => {
                      toggleWindow("terminal");
                      setIsStartMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-right hover:bg-secondary/50 transition-colors"
                  >
                    <TerminalIcon className="size-4 text-orange-400" />
                    <span>سطر الأوامر (WinPE cmd)</span>
                  </button>

                  <button
                    onClick={() => {
                      toggleWindow("scenarios");
                      setIsStartMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-right hover:bg-secondary/50 transition-colors"
                  >
                    <Sparkles className="size-4 text-primary" />
                    <span>مهام وتحديات الإنقاذ</span>
                  </button>

                  <div className="border-t border-border/60 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setSystemState("bootloader");
                        setBootCountdown(5);
                        setIsStartMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg p-2 text-right text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Power className="size-4" />
                      <span>إعادة التشغيل (Reboot System)</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Running Taskbar Window Tabs */}
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            {openWindows.scanner && (
              <button
                onClick={() => focusWindow("scanner")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeWindow === "scanner" && !minimizedWindows.scanner
                    ? "bg-orange-600/20 text-orange-300 border border-orange-500/40"
                    : "bg-secondary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="size-3.5" />
                <span>Avast Scanner</span>
              </button>
            )}

            {openWindows.mbr_cleaner && (
              <button
                onClick={() => focusWindow("mbr_cleaner")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeWindow === "mbr_cleaner" && !minimizedWindows.mbr_cleaner
                    ? "bg-rose-600/20 text-rose-300 border border-rose-500/40"
                    : "bg-secondary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wrench className="size-3.5" />
                <span>MBR Cleaner</span>
              </button>
            )}

            {openWindows.file_recoverer && (
              <button
                onClick={() => focusWindow("file_recoverer")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeWindow === "file_recoverer" && !minimizedWindows.file_recoverer
                    ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-secondary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderOpen className="size-3.5" />
                <span>File Recoverer</span>
              </button>
            )}

            {openWindows.terminal && (
              <button
                onClick={() => focusWindow("terminal")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeWindow === "terminal" && !minimizedWindows.terminal
                    ? "bg-orange-600/20 text-orange-300 border border-orange-500/40"
                    : "bg-secondary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <TerminalIcon className="size-3.5" />
                <span>Terminal</span>
              </button>
            )}
          </div>
        </div>

        {/* Taskbar Clock & System Status */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-latin">
          <span className="hidden md:inline font-mono">WinPE Offline Mode</span>
          <span className="rounded bg-secondary/50 px-2.5 py-1 text-foreground font-bold font-mono">
            11:45 AM
          </span>
        </div>
      </div>
    </div>
  );
}
