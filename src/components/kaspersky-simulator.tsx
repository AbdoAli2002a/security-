import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
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
} from "lucide-react";
import { recordSimulatorInteraction } from "@/lib/digital-twin-store";

/* =========================================================================
   Types & Interfaces
   ========================================================================= */

export type KrdSystemState = "bootloader" | "booting_kernel" | "desktop";

export type WindowId =
  "scanner" | "registry" | "file_manager" | "terminal" | "scenarios" | "hardware_info";

export type ScannerTab = "scan" | "update" | "quarantine" | "reports" | "settings";

export interface ThreatItem {
  id: string;
  name: string;
  type: "Rootkit" | "Trojan" | "Ransomware" | "Bootkit" | "Worm";
  path: string;
  risk: "High" | "Critical" | "Medium";
  status: "Detected" | "Disinfected" | "Quarantined" | "Deleted" | "Skipped";
  actionSelected?: "disinfect" | "quarantine" | "delete" | "skip";
}

export interface QuarantinedFile {
  id: string;
  fileName: string;
  threatName: string;
  originalPath: string;
  date: string;
  size: string;
}

export interface RegistryEntry {
  id: string;
  hive: string;
  keyPath: string;
  valueName: string;
  currentValue: string;
  defaultValue: string;
  isTampered: boolean;
  threatDescription: string;
}

export interface RescueScenario {
  id: string;
  title: string;
  badge: string;
  difficulty: "مبتدئ" | "متوسط" | "متقدم";
  problemDescription: string;
  objective: string;
  hint: string;
  isCompleted: boolean;
}

/* =========================================================================
   Sound Helper (Web Audio API Synthesizer)
   ========================================================================= */

class KrdSoundEffects {
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

  playBeep(freq = 440, type: OscillatorType = "sine", duration = 0.08) {
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
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playBootChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      [330, 440, 660, 880].forEach((freq, i) => {
        setTimeout(() => this.playBeep(freq, "sine", 0.25), i * 120);
      });
    } catch (err) {
      console.debug("Audio effect bypassed", err);
    }
  }

  playAlertAlarm() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      this.playBeep(880, "sawtooth", 0.15);
      setTimeout(() => this.playBeep(700, "sawtooth", 0.2), 160);
    } catch (err) {
      console.debug("Audio effect bypassed", err);
    }
  }

  playSuccessChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        setTimeout(() => this.playBeep(freq, "triangle", 0.18), i * 90);
      });
    } catch (err) {
      console.debug("Audio effect bypassed", err);
    }
  }
}

const soundManager = new KrdSoundEffects();

/* =========================================================================
   Main Component
   ========================================================================= */

export function KasperskySimulator() {
  // System State: Bootloader -> Booting -> Live Desktop
  const [systemState, setSystemState] = useState<KrdSystemState>("desktop");
  const [bootSelection, setBootSelection] = useState<number>(0);
  const [bootCountdown, setBootCountdown] = useState<number>(5);
  const [kernelLogs, setKernelLogs] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Desktop Window Management
  const [openWindows, setOpenWindows] = useState<Record<WindowId, boolean>>({
    scanner: true,
    registry: false,
    file_manager: false,
    terminal: false,
    scenarios: true,
    hardware_info: false,
  });
  const [minimizedWindows, setMinimizedWindows] = useState<Record<WindowId, boolean>>({
    scanner: false,
    registry: false,
    file_manager: false,
    terminal: false,
    scenarios: false,
    hardware_info: false,
  });
  const [activeWindow, setActiveWindow] = useState<WindowId>("scanner");
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  // Scanner Subsystem State
  const [scannerTab, setScannerTab] = useState<ScannerTab>("scan");
  const [scanTargets, setScanTargets] = useState({
    bootSectors: true,
    startupObjects: true,
    systemDrive: true,
    secondaryDrive: false,
    usbMedia: true,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedFilesCount, setScannedFilesCount] = useState(0);
  const [currentScanningPath, setCurrentScanningPath] = useState("");
  const [scanElapsedTime, setScanElapsedTime] = useState(0);
  const [threats, setThreats] = useState<ThreatItem[]>([
    {
      id: "th-1",
      name: "Rootkit.Boot.Pihar.b",
      type: "Rootkit",
      path: "/dev/sda [Master Boot Record Sector 0]",
      risk: "Critical",
      status: "Detected",
    },
    {
      id: "th-2",
      name: "Trojan-Ransom.Win32.LockScreen.ab",
      type: "Ransomware",
      path: "C:\\Windows\\System32\\drivers\\etc\\winlock.sys",
      risk: "Critical",
      status: "Detected",
    },
    {
      id: "th-3",
      name: "Worm.Win32.Autorun.inf.gen",
      type: "Worm",
      path: "E:\\autorun.inf",
      risk: "High",
      status: "Detected",
    },
    {
      id: "th-4",
      name: "Backdoor.Win32.Androm.kv",
      type: "Trojan",
      path: "C:\\Users\\Student\\AppData\\Local\\Temp\\svchost_inject.exe",
      risk: "High",
      status: "Detected",
    },
  ]);

  // Database Update Subsystem
  const [dbStatus, setDbStatus] = useState<"updated" | "updating" | "obsolete">("obsolete");
  const [updateProgress, setUpdateProgress] = useState(0);
  const [signaturesCount, setSignaturesCount] = useState(19420800);
  const [lastUpdateDate, setLastUpdateDate] = useState("2026-11-05 08:30");

  // Quarantine Subsystem
  const [quarantinedList, setQuarantinedList] = useState<QuarantinedFile[]>([
    {
      id: "q-1",
      fileName: "cryptolocker_payload.dll",
      threatName: "Trojan-Ransom.Win32.Cryptor",
      originalPath: "C:\\Windows\\Temp\\cryptolocker_payload.dll",
      date: "2026-11-06 14:22",
      size: "1.4 MB",
    },
    {
      id: "q-2",
      fileName: "keylogger_module.dat",
      threatName: "Spyware.Win32.KeyLog",
      originalPath: "C:\\ProgramData\\keylogger_module.dat",
      date: "2026-11-07 09:15",
      size: "480 KB",
    },
  ]);

  // Offline Registry Editor State
  const [registryEntries, setRegistryEntries] = useState<RegistryEntry[]>([
    {
      id: "reg-1",
      hive: "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon",
      keyPath: "Winlogon",
      valueName: "Shell",
      currentValue: "cmd.exe /c start C:\\winlock.exe",
      defaultValue: "explorer.exe",
      isTampered: true,
      threatDescription: "برمجية فدية قفل الشاشة تستبدل واجهة سطح مكتب الويندوز بملف قفل خبيث.",
    },
    {
      id: "reg-2",
      hive: "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon",
      keyPath: "Winlogon",
      valueName: "Userinit",
      currentValue: "C:\\Windows\\system32\\userinit.exe,C:\\evil_payload.exe",
      defaultValue: "C:\\Windows\\system32\\userinit.exe,",
      isTampered: true,
      threatDescription: "حقن برمجية تجسس تعمل بصلاحيات النظام فور تسجيل دخول أي مستخدم.",
    },
    {
      id: "reg-3",
      hive: "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",
      keyPath: "Run",
      valueName: "SecurityHealthFix",
      currentValue: "C:\\Users\\Student\\AppData\\Roaming\\miner.exe",
      defaultValue: "",
      isTampered: true,
      threatDescription: "برمجية تعدين خبيثة تعمل تلقائياً عند الإقلاع وتستهلك 100% من المعالج.",
    },
  ]);
  const [selectedRegEntryId, setSelectedRegEntryId] = useState<string>("reg-1");

  // File Manager State
  const [selectedPath, setSelectedPath] = useState<string>("C:\\Users\\Student\\Desktop");
  const [rescuedFiles, setRescuedFiles] = useState<string[]>([]);
  const [isCopyingFiles, setIsCopyingFiles] = useState(false);
  const [copyProgress, setCopyProgress] = useState(0);

  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState<
    { command: string; output: string | string[] }[]
  >([
    {
      command: "uname -a",
      output: "Linux krd-live 6.6.21-gentoo-krd #1 SMP PREEMPT x86_64 GNU/Linux",
    },
    {
      command: "krd-status",
      output: [
        "Kaspersky Rescue Environment 18.0.11.3",
        "Storage: 3 disks mounted (/dev/sda, /dev/sdb, /dev/nvme0n1)",
        "Database: Signatures loaded successfully",
        "Type 'help' to list available rescue commands.",
      ],
    },
  ]);
  const [terminalInput, setTerminalInput] = useState("");

  // Guided Rescue Scenarios
  const [scenarios, setScenarios] = useState<RescueScenario[]>([
    {
      id: "mission-1",
      title: "تطهير Rootkit الإقلاع MBR المصيب لحاسوب المعمل",
      badge: "معامل تكنولوجيا التعليم",
      difficulty: "متقدم",
      problemDescription:
        "حاسوب معمل تكنولوجيا التعليم يعرض شاشة سوداء متجمدة أثناء الإقلاع مع رسالة خطأ في الـ MBR نتيجة إصابته بـ Rootkit.Boot.Pihar.",
      objective:
        "قم بتشغيل فحص كاسبرسكي مع تحديد قطاعات الإقلاع (Boot Sectors)، ثم قم بتطهير التهديد بنجاح.",
      hint: "افتح تبويب Objects Scan، تأكد من تفعيل Boot Sectors، واضغط Start Scan ثم اختر Disinfect.",
      isCompleted: false,
    },
    {
      id: "mission-2",
      title: "إصلاح قفل شاشة الفدية عبر محرر الريجستري (Winlogon Shell)",
      badge: "هجمات الفدية Ransomware",
      difficulty: "متوسط",
      problemDescription:
        "فيروس فدية استبدل ملف مستكشف الويندوز الافتراضي في الريجستري بملف قفل الشاشة (LockScreen)، مما يمنع ظهور سطح المكتب.",
      objective:
        "افتح محرر الريجستري (Kaspersky Registry Editor)، حدد قيمة Shell المصابة، واضغط 'إصلاح القيمة الافتراضية' لإعادتها إلى explorer.exe.",
      hint: "اختر Registry Editor من سطح المكتب، وحدد مفتاح Shell ثم اضغط زر الإصلاح.",
      isCompleted: false,
    },
    {
      id: "mission-3",
      title: "إنقاذ مشروعات التخرج العالقة في القرص C ونقلها للـ USB",
      badge: "إنقاذ واسترجاع البيانات",
      difficulty: "مبتدئ",
      problemDescription:
        "نظام الويندوز على الحاسوب تالف ويحتاج إعادة تهيئة، ولكن يوجد مشروع تخرج الواقع الافتراضي وبنك أسئلة هام على سطح المكتب لم يتم نسخهم احتياطياً.",
      objective:
        "افتح مستكشف الملفات (File Manager)، حدد مشروعات التخرج واضغط 'نسخ وإنقاذ إلى فلاش ميموري USB'.",
      hint: "استخدم File Manager لتصفح مسار C:\\Users\\Student\\Desktop وانقر زر النسخ السريع إلى وحدة USB الخارجية.",
      isCompleted: false,
    },
    {
      id: "mission-4",
      title: "تحديث قواعد بيانات الفيروسات وفحص الفلاشات المصابة",
      badge: "التحديث ومكافحة الديدان",
      difficulty: "مبتدئ",
      problemDescription:
        "قواعد بيانات الفيروسات على أسطوانة الإنقاذ بحاجة لتحديث للحصول على أحدث التوقيعات، وفحص فلاشة USB الموصولة بالمعمل.",
      objective:
        "افتح تبويب Update Databases واضغط Start Update، ثم قم بفحص وحدة USB لتطهير دودة autorun.inf.",
      hint: "قم بإجراء التحديث حتى تصبح الحالة 'Updated'، ثم تأكد من تطهير Worm.Win32.Autorun.",
      isCompleted: false,
    },
  ]);

  // Mission check helper
  const updateScenarioStatus = (scenarioId: string, completed: boolean) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === scenarioId ? { ...s, isCompleted: completed } : s)),
    );
    if (completed) {
      soundManager.playSuccessChime();
      recordSimulatorInteraction();
    }
  };

  /* =========================================================================
     Bootloader Timer & Kernel Emulation
     ========================================================================= */

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (systemState === "bootloader" && bootCountdown > 0) {
      timer = setTimeout(() => {
        setBootCountdown((prev) => prev - 1);
      }, 1000);
    } else if (systemState === "bootloader" && bootCountdown === 0) {
      startKernelBoot();
    }
    return () => clearTimeout(timer);
  }, [systemState, bootCountdown]);

  const startKernelBoot = () => {
    setSystemState("booting_kernel");
    soundManager.playBeep(440, "sine", 0.05);

    const logMessages = [
      "Loading vmlinuz-krd-gentoo-6.6.21 ... OK",
      "Loading initramfs-rescue.img ... OK",
      "Probing hardware: Intel Core i7 / 16GB DDR4 RAM detected",
      "Mounting gentoo-krd.squashfs overlay on /root ...",
      "Scanning SATA and NVMe storage controllers: 3 partitions detected",
      "Starting Kaspersky Rescue Antivirus Daemon (kav-daemon) ...",
      "Initializing X11 Graphics Subsystem [XFCE4 Window Manager] ...",
      "Kaspersky Rescue Disk 18.0 environment is ready.",
    ];

    setKernelLogs([]);
    logMessages.forEach((msg, idx) => {
      setTimeout(
        () => {
          setKernelLogs((prev) => [...prev, msg]);
          if (idx === logMessages.length - 1) {
            setTimeout(() => {
              setSystemState("desktop");
              soundManager.playBootChime();
              recordSimulatorInteraction();
            }, 800);
          }
        },
        (idx + 1) * 280,
      );
    });
  };

  /* =========================================================================
     Scanning Simulator Engine
     ========================================================================= */

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      const mockPaths = [
        "/dev/sda [Master Boot Record Sector 0]",
        "C:\\Windows\\System32\\ntoskrnl.exe",
        "C:\\Windows\\System32\\drivers\\etc\\hosts",
        "C:\\Windows\\System32\\drivers\\winlock.sys",
        "C:\\Windows\\System32\\userinit.exe",
        "C:\\Users\\Student\\AppData\\Local\\Temp\\svchost_inject.exe",
        "C:\\Users\\Student\\Desktop\\Graduation_Project_VR\\project.exe",
        "E:\\autorun.inf",
        "E:\\recovery_setup.bat",
        "D:\\Data\\Exams\\exam_bank.dat",
      ];

      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            setIsScanning(false);
            soundManager.playAlertAlarm();
            return 100;
          }
          const next = prev + 5;
          const randomPath = mockPaths[Math.floor((next / 100) * mockPaths.length)] || mockPaths[0];
          setCurrentScanningPath(randomPath);
          setScannedFilesCount((c) => c + 47);
          soundManager.playBeep(600 + next * 4, "triangle", 0.03);
          return next;
        });
        setScanElapsedTime((t) => t + 1);
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScannedFilesCount(0);
    setScanElapsedTime(0);
    recordSimulatorInteraction();
  };

  const handleDisinfectThreat = (threatId: string) => {
    setThreats((prev) =>
      prev.map((t) => (t.id === threatId ? { ...t, status: "Disinfected" } : t)),
    );
    soundManager.playSuccessChime();

    // Check if mission 1 solved
    if (threatId === "th-1") {
      updateScenarioStatus("mission-1", true);
    }
    if (threatId === "th-3") {
      updateScenarioStatus("mission-4", true);
    }
  };

  const handleQuarantineThreat = (threatId: string) => {
    const target = threats.find((t) => t.id === threatId);
    if (target) {
      setQuarantinedList((prev) => [
        ...prev,
        {
          id: `q-${Date.now()}`,
          fileName: target.path.split("\\").pop() || target.name,
          threatName: target.name,
          originalPath: target.path,
          date: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          size: "820 KB",
        },
      ]);
      setThreats((prev) =>
        prev.map((t) => (t.id === threatId ? { ...t, status: "Quarantined" } : t)),
      );
      soundManager.playBeep(520, "sine", 0.12);
    }
  };

  const handleDeleteThreat = (threatId: string) => {
    setThreats((prev) => prev.map((t) => (t.id === threatId ? { ...t, status: "Deleted" } : t)));
    soundManager.playBeep(350, "square", 0.1);
  };

  const handleApplyActionToAll = (action: "Disinfected" | "Quarantined" | "Deleted") => {
    setThreats((prev) => prev.map((t) => (t.status === "Detected" ? { ...t, status: action } : t)));
    soundManager.playSuccessChime();
    updateScenarioStatus("mission-1", true);
  };

  /* =========================================================================
     Database Update Simulator
     ========================================================================= */

  const handleStartUpdate = () => {
    setDbStatus("updating");
    setUpdateProgress(0);

    const interval = setInterval(() => {
      setUpdateProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDbStatus("updated");
          setSignaturesCount(21890340);
          setLastUpdateDate("2026-11-07 10:00 (الآن)");
          soundManager.playSuccessChime();
          // Check mission 4
          updateScenarioStatus("mission-4", true);
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  /* =========================================================================
     Registry Repair Engine
     ========================================================================= */

  const handleRepairRegistryKey = (entryId: string) => {
    setRegistryEntries((prev) =>
      prev.map((r) =>
        r.id === entryId
          ? {
              ...r,
              currentValue: r.defaultValue,
              isTampered: false,
            }
          : r,
      ),
    );
    soundManager.playSuccessChime();

    if (entryId === "reg-1") {
      updateScenarioStatus("mission-2", true);
    }
  };

  /* =========================================================================
     File Manager Rescue Copying
     ========================================================================= */

  const handleRescueFilesToUsb = () => {
    setIsCopyingFiles(true);
    setCopyProgress(0);

    const interval = setInterval(() => {
      setCopyProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCopyingFiles(false);
          setRescuedFiles([
            "Graduation_Project_VR_v3.zip",
            "Interactive_Course_Assets.rar",
            "Exam_Question_Bank_2026.enc",
          ]);
          soundManager.playSuccessChime();
          updateScenarioStatus("mission-3", true);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  /* =========================================================================
     Terminal CLI Engine
     ========================================================================= */

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    let output: string | string[] = "";

    if (cmd === "help") {
      output = [
        "Available Kaspersky Rescue Disk commands:",
        "  help            - Show this command reference list",
        "  krd-scan        - Start command line malware & bootkit scan",
        "  fdisk -l / lsblk - List all storage drives and partitions",
        "  clean-bootkit   - Rebuild and cleanse MBR sector on /dev/sda",
        "  reg-status      - Audit Windows registry hives integrity",
        "  uname -a        - Display Linux kernel version",
        "  reboot          - Reboot live environment back to bootloader",
        "  clear           - Clear terminal window buffer",
      ];
    } else if (cmd === "krd-scan") {
      output = [
        "Initializing Kaspersky AV Command Engine...",
        "Scanning /dev/sda: Found Rootkit.Boot.Pihar.b in Sector 0 [DISINFECTED]",
        "Scan finished. 4 threats detected. Use graphical tool for details.",
      ];
      soundManager.playBeep(700, "sine", 0.1);
    } else if (cmd === "fdisk -l" || cmd === "lsblk") {
      output = [
        "NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS",
        "sda           8:0    0 476.9G  0 disk ",
        "├─sda1        8:1    0   100M  0 part [EFI System Partition]",
        "├─sda2        8:2    0 240.0G  0 part /disks/C (Windows)",
        "└─sda3        8:3    0 236.8G  0 part /disks/D (Data)",
        "sdb           8:16   1  29.8G  0 disk ",
        "└─sdb1        8:17   1  29.8G  0 part /disks/USB (Flash Drive)",
      ];
    } else if (cmd === "clean-bootkit") {
      output = [
        "Restoring MBR sector 0 from Kaspersky clean template...",
        "Writing clean bootloader to /dev/sda...",
        "Verification: OK. Bootkit removed successfully.",
      ];
      handleDisinfectThreat("th-1");
    } else if (cmd === "reg-status") {
      output = [
        "Auditing C:\\Windows\\System32\\config\\SOFTWARE ...",
        "WARNING: Winlogon\\Shell altered from explorer.exe to cmd.exe /c start winlock.exe",
        "WARNING: Winlogon\\Userinit contains injected executable evil_payload.exe",
      ];
    } else if (cmd === "uname -a") {
      output = "Linux krd-live 6.6.21-gentoo-krd #1 SMP PREEMPT x86_64 GNU/Linux";
    } else if (cmd === "reboot") {
      setSystemState("bootloader");
      setBootCountdown(5);
      return;
    } else if (cmd === "clear") {
      setTerminalHistory([]);
      setTerminalInput("");
      return;
    } else {
      output = `krd: command not found: ${cmd}. Type 'help' for available commands.`;
    }

    setTerminalHistory((prev) => [...prev, { command: terminalInput, output }]);
    setTerminalInput("");
    soundManager.playBeep(500, "triangle", 0.04);
  };

  /* =========================================================================
     Window Controller Helpers
     ========================================================================= */

  const toggleWindow = (id: WindowId) => {
    setOpenWindows((prev) => {
      const nextOpen = !prev[id];
      if (nextOpen) {
        setMinimizedWindows((min) => ({ ...min, [id]: false }));
        setActiveWindow(id);
      }
      return { ...prev, [id]: nextOpen };
    });
    soundManager.playBeep(450, "sine", 0.05);
  };

  const focusWindow = (id: WindowId) => {
    setActiveWindow(id);
    setMinimizedWindows((min) => ({ ...min, [id]: false }));
  };

  const minimizeWindow = (id: WindowId, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMinimizedWindows((prev) => ({ ...prev, [id]: true }));
    soundManager.playBeep(320, "sine", 0.05);
  };

  const closeWindow = (id: WindowId, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenWindows((prev) => ({ ...prev, [id]: false }));
    soundManager.playBeep(280, "sine", 0.05);
  };

  /* =========================================================================
     Render: 1. Bootloader Menu Screen
     ========================================================================= */

  if (systemState === "bootloader") {
    const bootOptions = [
      {
        title: "Kaspersky Rescue Disk. Graphic Mode",
        desc: "الوضع الرسومي الافتراضي الموصى به لمعظم الأجهزة وشاشات العرض",
      },
      {
        title: "Kaspersky Rescue Disk. Limited Graphic Mode",
        desc: "وضع التوافق للشاشات وكروت الشاشة القديمة أو غير المتوافقة",
      },
      {
        title: "Hardware Info",
        desc: "فحص وتفقد مواصفات المعالج واللوحة الأم والأقراص المتصلة",
      },
      {
        title: "Boot from Hard Drive",
        desc: "إلغاء وضع الإنقاذ والإقلاع المباشر من القرص الصلب لنظام الويندوز",
      },
    ];

    return (
      <div className="relative flex min-h-[650px] w-full flex-col justify-between overflow-hidden rounded-3xl border border-border bg-[#0d1317] p-8 font-mono text-emerald-400 shadow-2xl">
        {/* Boot Header */}
        <div className="space-y-2 border-b border-emerald-500/30 pb-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Shield className="size-5" />
            </span>
            <h1 className="text-xl font-black tracking-widest text-emerald-300">
              KASPERSKY RESCUE DISK 18.0.11.3 (x86_64)
            </h1>
          </div>
          <p className="text-xs text-emerald-500/80">
            Gentoo Live Rescue System for disinfecting x86_64 Windows installations
          </p>
        </div>

        {/* Boot Menu Options */}
        <div className="mx-auto my-8 w-full max-w-xl space-y-3">
          {bootOptions.map((opt, idx) => {
            const isSelected = bootSelection === idx;
            return (
              <div
                key={idx}
                onClick={() => setBootSelection(idx)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-950/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                    : "border-emerald-500/20 bg-emerald-950/10 text-emerald-500/70 hover:border-emerald-500/40 hover:text-emerald-300"
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

        {/* Boot Countdown & Action Button */}
        <div className="flex flex-col items-center gap-4 border-t border-emerald-500/30 pt-4">
          <div className="flex items-center gap-2 text-xs text-emerald-400/90 font-sans">
            <Clock className="size-4 animate-spin text-emerald-400" />
            <span>
              الإقلاع التلقائي للوضع المختار خلال:{" "}
              <strong className="font-mono text-sm text-emerald-300">{bootCountdown}</strong> ثوانٍ
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startKernelBoot}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold font-sans text-emerald-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
            >
              <Play className="size-4" />
              <span>إقلاع فوري للوضع المختار [Enter]</span>
            </button>

            <button
              onClick={() => {
                setBootCountdown(999);
                soundManager.playBeep(350, "sine", 0.08);
              }}
              className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-2.5 text-xs font-sans text-emerald-400 hover:bg-emerald-900/30 transition-all"
            >
              إيقاف العد التنازلي مؤقتاً
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     Render: 2. Booting Kernel Logs Screen
     ========================================================================= */

  if (systemState === "booting_kernel") {
    return (
      <div className="flex min-h-[650px] w-full flex-col justify-between overflow-hidden rounded-3xl border border-border bg-[#0a0f12] p-8 font-mono text-xs text-emerald-400 shadow-2xl">
        <div className="space-y-1">
          <p className="text-emerald-500/70">
            [ 0.000000] Linux version 6.6.21-gentoo-krd (root@krd-build)
          </p>
          <p className="text-emerald-500/70">
            [ 0.000104] Command line: BOOT_IMAGE=vmlinuz-krd root=/dev/ram0
          </p>
          <div className="my-4 h-px bg-emerald-500/20" />
          {kernelLogs.map((log, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="leading-relaxed"
            >
              <span className="text-emerald-600">[ {((i + 1) * 0.42).toFixed(6)} ]</span> {log}
            </motion.p>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-emerald-500/30 pt-4 text-[11px] text-emerald-500/70">
          <span>Starting XFCE Desktop Environment...</span>
          <span className="animate-pulse text-emerald-400 font-bold">LOADING SYSTEM...</span>
        </div>
      </div>
    );
  }

  /* =========================================================================
     Render: 3. Full Live OS Desktop Environment
     ========================================================================= */

  const activeThreatsCount = threats.filter((t) => t.status === "Detected").length;
  const completedMissionsCount = scenarios.filter((s) => s.isCompleted).length;

  return (
    <div
      className="relative flex min-h-[720px] w-full flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#151c22] text-foreground shadow-2xl select-none"
      dir="rtl"
    >
      {/* Top OS Menu Bar / Live Information */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-[#12181d] px-5 py-2.5 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Shield className="size-4" />
          </span>
          <span className="font-latin font-black tracking-wider text-emerald-400">
            KASPERSKY RESCUE DISK 18.0
          </span>
          <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] text-emerald-400 font-latin">
            LIVE GENTOO OS
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Missions Badge */}
          <button
            onClick={() => toggleWindow("scenarios")}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
              completedMissionsCount === 4
                ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                : "border-primary/40 bg-primary/10 text-primary"
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
              soundManager.enabled = next;
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
          {/* 1. Kaspersky Rescue Tool */}
          <button
            onDoubleClick={() => toggleWindow("scanner")}
            onClick={() => toggleWindow("scanner")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-3 text-center hover:border-emerald-500/40 hover:bg-emerald-950/20 transition-all group"
          >
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Shield className="size-8" />
              {activeThreatsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                  {activeThreatsCount}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-foreground">Kaspersky Rescue Tool</span>
          </button>

          {/* 2. Registry Editor */}
          <button
            onDoubleClick={() => toggleWindow("registry")}
            onClick={() => toggleWindow("registry")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-3 text-center hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all group"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Lock className="size-8" />
            </div>
            <span className="text-xs font-bold text-foreground">محرر الريجستري المستقل</span>
          </button>

          {/* 3. File Manager */}
          <button
            onDoubleClick={() => toggleWindow("file_manager")}
            onClick={() => toggleWindow("file_manager")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-3 text-center hover:border-amber-500/40 hover:bg-amber-950/20 transition-all group"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <FolderOpen className="size-8" />
            </div>
            <span className="text-xs font-bold text-foreground">مستكشف ملفات الإنقاذ</span>
          </button>

          {/* 4. Terminal */}
          <button
            onDoubleClick={() => toggleWindow("terminal")}
            onClick={() => toggleWindow("terminal")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-3 text-center hover:border-emerald-500/40 hover:bg-emerald-950/20 transition-all group"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 border border-emerald-500/30 text-emerald-400 shadow-lg group-hover:scale-105 transition-transform">
              <TerminalIcon className="size-7" />
            </div>
            <span className="text-xs font-bold text-foreground font-mono">XFCE Terminal</span>
          </button>

          {/* 5. Guided Rescue Scenarios */}
          <button
            onDoubleClick={() => toggleWindow("scenarios")}
            onClick={() => toggleWindow("scenarios")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-3 text-center hover:border-primary/40 hover:bg-primary/20 transition-all group"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="size-7" />
            </div>
            <span className="text-xs font-bold text-foreground">مهام وتحديات الإنقاذ</span>
          </button>

          {/* 6. Hardware Info */}
          <button
            onDoubleClick={() => toggleWindow("hardware_info")}
            onClick={() => toggleWindow("hardware_info")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-3 text-center hover:border-border hover:bg-secondary/40 transition-all group"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-foreground shadow-md group-hover:scale-105 transition-transform">
              <Cpu className="size-7" />
            </div>
            <span className="text-xs font-bold text-foreground">معلومات العتاد (Hardware)</span>
          </button>
        </div>

        {/* -------------------------------------------------------------
            WINDOW 1: Kaspersky Rescue Tool (Main Scanner Window)
            ------------------------------------------------------------- */}
        <AnimatePresence>
          {openWindows.scanner && !minimizedWindows.scanner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => focusWindow("scanner")}
              className={`absolute top-8 left-4 right-4 md:left-12 md:right-12 z-20 flex flex-col rounded-2xl border bg-[#1a232a] shadow-2xl overflow-hidden backdrop-blur-xl ${
                activeWindow === "scanner"
                  ? "border-emerald-500/50 shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                  : "border-border/80 opacity-95"
              }`}
            >
              {/* Window Title Bar */}
              <div className="flex items-center justify-between border-b border-border/80 bg-[#141b21] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-emerald-400" />
                  <span className="text-xs font-bold text-foreground font-latin">
                    Kaspersky Rescue Tool 18.0.11.3
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
                        ? `تم اكتشاف ${activeThreatsCount} تهديدات خطيرة تحتاج إجراءً فورياً!`
                        : "حالة النظام: محمى ونظيف من التهديدات"}
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      قاعدة بيانات الفيروسات:{" "}
                      {dbStatus === "updated" ? "محدثة لأحدث إصدار" : "قديمة بحاجة لتحديث"} |
                      التوقيعات: {signaturesCount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScannerTab("update")}
                    className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300"
                  >
                    تحديث القواعد
                  </button>
                </div>
              </div>

              {/* Window Tabs Bar */}
              <div className="flex items-center gap-1 border-b border-border/80 bg-[#12181d] px-4 py-1.5 text-xs">
                <button
                  onClick={() => setScannerTab("scan")}
                  className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                    scannerTab === "scan"
                      ? "bg-emerald-500 text-emerald-950"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  فحص الكائنات (Objects Scan)
                </button>
                <button
                  onClick={() => setScannerTab("update")}
                  className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                    scannerTab === "update"
                      ? "bg-emerald-500 text-emerald-950"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  تحديث القواعد (Update)
                </button>
                <button
                  onClick={() => setScannerTab("quarantine")}
                  className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                    scannerTab === "quarantine"
                      ? "bg-emerald-500 text-emerald-950"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  الحجر الصحي (Quarantine) ({quarantinedList.length})
                </button>
                <button
                  onClick={() => setScannerTab("reports")}
                  className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                    scannerTab === "reports"
                      ? "bg-emerald-500 text-emerald-950"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  سجل الأحداث والتقارير
                </button>
                <button
                  onClick={() => setScannerTab("settings")}
                  className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                    scannerTab === "settings"
                      ? "bg-emerald-500 text-emerald-950"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  الإعدادات المتقدمة
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6 max-h-[480px] overflow-y-auto">
                {/* 1. Objects Scan Tab */}
                {scannerTab === "scan" && (
                  <div className="space-y-6">
                    {/* Scan Targets Checklist */}
                    <div>
                      <h3 className="text-xs font-black text-foreground mb-3">
                        حدد نطاق الفحص (Scan Scope Selection):
                      </h3>
                      <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                        <label className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-secondary/30 p-3 cursor-pointer hover:border-emerald-500/40">
                          <input
                            type="checkbox"
                            checked={scanTargets.bootSectors}
                            onChange={(e) =>
                              setScanTargets({ ...scanTargets, bootSectors: e.target.checked })
                            }
                            className="size-4 rounded accent-emerald-500"
                          />
                          <div>
                            <span className="block text-xs font-bold text-foreground">
                              قطاعات الإقلاع (Boot Sectors)
                            </span>
                            <span className="text-[10px] text-muted-foreground font-latin">
                              /dev/sda MBR / EFI
                            </span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-secondary/30 p-3 cursor-pointer hover:border-emerald-500/40">
                          <input
                            type="checkbox"
                            checked={scanTargets.startupObjects}
                            onChange={(e) =>
                              setScanTargets({ ...scanTargets, startupObjects: e.target.checked })
                            }
                            className="size-4 rounded accent-emerald-500"
                          />
                          <div>
                            <span className="block text-xs font-bold text-foreground">
                              كائنات بدء التشغيل (Startup Objects)
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Autorun & Tasks
                            </span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-secondary/30 p-3 cursor-pointer hover:border-emerald-500/40">
                          <input
                            type="checkbox"
                            checked={scanTargets.systemDrive}
                            onChange={(e) =>
                              setScanTargets({ ...scanTargets, systemDrive: e.target.checked })
                            }
                            className="size-4 rounded accent-emerald-500"
                          />
                          <div>
                            <span className="block text-xs font-bold text-foreground">
                              قرص النظام C:\ (System32)
                            </span>
                            <span className="text-[10px] text-muted-foreground font-latin">
                              /disks/C/Windows
                            </span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-secondary/30 p-3 cursor-pointer hover:border-emerald-500/40">
                          <input
                            type="checkbox"
                            checked={scanTargets.usbMedia}
                            onChange={(e) =>
                              setScanTargets({ ...scanTargets, usbMedia: e.target.checked })
                            }
                            className="size-4 rounded accent-emerald-500"
                          />
                          <div>
                            <span className="block text-xs font-bold text-foreground">
                              وسائط فلاش ميموري USB
                            </span>
                            <span className="text-[10px] text-muted-foreground font-latin">
                              /dev/sdb1 (Kingston 32GB)
                            </span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-secondary/30 p-3 cursor-pointer hover:border-emerald-500/40">
                          <input
                            type="checkbox"
                            checked={scanTargets.secondaryDrive}
                            onChange={(e) =>
                              setScanTargets({ ...scanTargets, secondaryDrive: e.target.checked })
                            }
                            className="size-4 rounded accent-emerald-500"
                          />
                          <div>
                            <span className="block text-xs font-bold text-foreground">
                              قرص البيانات D:\ (Data)
                            </span>
                            <span className="text-[10px] text-muted-foreground font-latin">
                              /disks/D
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Scan Progress & Action */}
                    <div className="rounded-2xl border border-border/80 bg-[#12181d] p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-muted-foreground">
                            حالة محرك الفحص:{" "}
                            {isScanning ? (
                              <span className="text-emerald-400 font-bold">
                                جاري الفحص العميق...
                              </span>
                            ) : scanProgress === 100 ? (
                              <span className="text-rose-400 font-bold">
                                اكتمل الفحص - تم رصد تهديدات!
                              </span>
                            ) : (
                              "جاهز للبدء"
                            )}
                          </span>
                          {currentScanningPath && (
                            <p className="mt-1 font-mono text-[11px] text-emerald-300 truncate max-w-xl">
                              {currentScanningPath}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {isScanning ? (
                            <button
                              onClick={() => setIsScanning(false)}
                              className="rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-300"
                            >
                              إيقاف الفحص مؤقتاً
                            </button>
                          ) : (
                            <button
                              onClick={handleStartScan}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-black text-emerald-950 shadow-md hover:bg-emerald-400 transition-all"
                            >
                              <Play className="size-4" />
                              <span>بدء فحص الكائنات (Start Scan)</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-latin font-bold">
                          <span>{scanProgress}%</span>
                          <span>الملفات المفحوصة: {scannedFilesCount.toLocaleString()}</span>
                          <span>الزمن: {scanElapsedTime} ثانية</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-secondary/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Detected Threats Interactive Table */}
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="size-4 text-rose-400" />
                          <h4 className="text-xs font-black text-foreground">
                            التهديدات المكتشفة ({threats.length})
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApplyActionToAll("Disinfected")}
                            className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300"
                          >
                            تطهير الكل (Disinfect All)
                          </button>
                          <button
                            onClick={() => handleApplyActionToAll("Quarantined")}
                            className="rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 px-2.5 py-1 text-[11px] font-bold text-cyan-300"
                          >
                            عزل الكل (Quarantine All)
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-border/80">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-[#141b21] text-muted-foreground border-b border-border/80">
                            <tr>
                              <th className="p-3">اسم التهديد</th>
                              <th className="p-3">النوع</th>
                              <th className="p-3">المسار المصاب</th>
                              <th className="p-3">الخطورة</th>
                              <th className="p-3">الحالة</th>
                              <th className="p-3 text-center">الإجراء</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 bg-[#161e25]">
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
                                        : th.status === "Disinfected"
                                          ? "bg-emerald-500/20 text-emerald-300"
                                          : th.status === "Quarantined"
                                            ? "bg-cyan-500/20 text-cyan-300"
                                            : "bg-gray-500/20 text-gray-400"
                                    }`}
                                  >
                                    {th.status === "Detected"
                                      ? "⚠️ تم الاكتشاف"
                                      : th.status === "Disinfected"
                                        ? "✅ تم التطهير"
                                        : th.status === "Quarantined"
                                          ? "🛡️ معزول"
                                          : "حُذف"}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleDisinfectThreat(th.id)}
                                      disabled={th.status === "Disinfected"}
                                      className="rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300 disabled:opacity-40"
                                      title="تطهير قطاع الإقلاع أو الملف"
                                    >
                                      تطهير
                                    </button>
                                    <button
                                      onClick={() => handleQuarantineThreat(th.id)}
                                      disabled={th.status === "Quarantined"}
                                      className="rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300 disabled:opacity-40"
                                      title="نقل إلى الحجر الصحي"
                                    >
                                      حجر
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

                {/* 2. Update Databases Tab */}
                {scannerTab === "update" && (
                  <div className="rounded-2xl border border-border/80 bg-[#12181d] p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-border/60 pb-4">
                      <div>
                        <h3 className="text-sm font-black text-foreground">
                          تحديث قواعد بيانات الفيروسات (Antivirus Databases Update)
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          خوادم التحديث: Kaspersky Lab Update Servers (HTTP/SSL)
                        </p>
                      </div>

                      <span
                        className={`rounded-xl px-3 py-1 text-xs font-bold ${
                          dbStatus === "updated"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : dbStatus === "updating"
                              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {dbStatus === "updated"
                          ? "✅ القواعد محدثة"
                          : dbStatus === "updating"
                            ? "جاري التحميل..."
                            : "⚠️ القواعد قديمة بحاجة لتحديث"}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5">
                        <span className="block text-[11px] text-muted-foreground font-bold">
                          تاريخ آخر تحديث
                        </span>
                        <span className="text-xs font-black font-latin text-foreground">
                          {lastUpdateDate}
                        </span>
                      </div>
                      <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5">
                        <span className="block text-[11px] text-muted-foreground font-bold">
                          عدد التوقيعات المحملة
                        </span>
                        <span className="text-xs font-black font-latin text-emerald-400">
                          {signaturesCount.toLocaleString()} توقيع
                        </span>
                      </div>
                      <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5">
                        <span className="block text-[11px] text-muted-foreground font-bold">
                          اتصال الشبكة
                        </span>
                        <span className="text-xs font-black text-foreground">
                          متصل بـ Ethernet (eth0)
                        </span>
                      </div>
                    </div>

                    {dbStatus === "updating" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground font-latin">
                          <span>تحميل ملفات التوقيعات krd_diff_2026.avz ...</span>
                          <span>{updateProgress}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-200"
                            style={{ width: `${updateProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleStartUpdate}
                        disabled={dbStatus === "updating"}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-black text-emerald-950 shadow-md hover:bg-emerald-400 disabled:opacity-50"
                      >
                        {dbStatus === "updating" ? (
                          <>
                            <RefreshCw className="size-4 animate-spin" />
                            <span>جاري تنزيل التحديثات...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="size-4" />
                            <span>بدء تحديث القواعد (Start Update)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Quarantine Tab */}
                {scannerTab === "quarantine" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-foreground">
                        الملفات المعزولة في الحجر الصحي (Quarantine Vault)
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        إجمالي العناصر: {quarantinedList.length}
                      </span>
                    </div>

                    {quarantinedList.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
                        لا توجد ملفات في الحجر الصحي حالياً.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-border/80">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-[#141b21] text-muted-foreground border-b border-border/80">
                            <tr>
                              <th className="p-3">اسم الملف</th>
                              <th className="p-3">التهديد المرتبط</th>
                              <th className="p-3">المسار الأصلي</th>
                              <th className="p-3">تاريخ الحجز</th>
                              <th className="p-3">الحجم</th>
                              <th className="p-3 text-center">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 bg-[#161e25]">
                            {quarantinedList.map((item) => (
                              <tr key={item.id} className="hover:bg-secondary/20">
                                <td className="p-3 font-mono font-bold text-foreground">
                                  {item.fileName}
                                </td>
                                <td className="p-3 font-mono text-rose-400">{item.threatName}</td>
                                <td className="p-3 font-mono text-[11px] text-muted-foreground truncate max-w-xs">
                                  {item.originalPath}
                                </td>
                                <td className="p-3 text-muted-foreground font-latin">
                                  {item.date}
                                </td>
                                <td className="p-3 text-muted-foreground font-latin">
                                  {item.size}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setQuarantinedList((prev) =>
                                          prev.filter((q) => q.id !== item.id),
                                        );
                                        soundManager.playBeep(400, "sine", 0.08);
                                      }}
                                      className="rounded bg-secondary hover:bg-secondary/80 px-2 py-0.5 text-[10px] font-bold text-foreground"
                                    >
                                      استعادة
                                    </button>
                                    <button
                                      onClick={() => {
                                        setQuarantinedList((prev) =>
                                          prev.filter((q) => q.id !== item.id),
                                        );
                                        soundManager.playBeep(300, "square", 0.08);
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

                {/* 4. Reports Tab */}
                {scannerTab === "reports" && (
                  <div className="rounded-2xl border border-border/80 bg-[#12181d] p-5 space-y-4">
                    <h3 className="text-xs font-black text-foreground">
                      سجل أحداث الفحص والإنقاذ (Detailed Rescue Event Audit)
                    </h3>
                    <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto">
                      <div className="border-b border-border/40 pb-1.5 text-emerald-400">
                        [10:14:02] KRD Kernel booted successfully into XFCE graphics mode.
                      </div>
                      <div className="border-b border-border/40 pb-1.5 text-muted-foreground">
                        [10:14:15] Antivirus engine loaded 19,420,800 malware signatures.
                      </div>
                      <div className="border-b border-border/40 pb-1.5 text-rose-400">
                        [10:15:30] DETECTED: Rootkit.Boot.Pihar.b in Master Boot Record (/dev/sda).
                      </div>
                      <div className="border-b border-border/40 pb-1.5 text-rose-400">
                        [10:15:42] DETECTED: Trojan-Ransom.Win32.LockScreen.ab in winlock.sys.
                      </div>
                      <div className="border-b border-border/40 pb-1.5 text-cyan-400">
                        [10:16:01] OFFLINE REGISTRY: Winlogon\\Shell verified as tampered.
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Settings Tab */}
                {scannerTab === "settings" && (
                  <div className="rounded-2xl border border-border/80 bg-[#12181d] p-5 space-y-4">
                    <h3 className="text-xs font-black text-foreground">
                      إعدادات محرك فحص كاسبرسكي (Heuristic & Rootkit Settings)
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/80 bg-secondary/30 p-3">
                        <span className="block text-xs font-bold text-foreground">
                          عمق التحليل الاستدلالي (Heuristics)
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          مفعل على الوضع الأقصى (Deep Heuristic Analysis) لاكتشاف التهديدات غير
                          المعروفة.
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/80 bg-secondary/30 p-3">
                        <span className="block text-xs font-bold text-foreground">
                          محرك فحص الـ Bootkits و Rootkits
                        </span>
                        <p className="text-[11px] text-emerald-400 mt-1 font-bold">
                          مفعل تلقائياً (Active Memory & MBR Inspection)
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
            WINDOW 2: Kaspersky Registry Editor Window
            ------------------------------------------------------------- */}
        <AnimatePresence>
          {openWindows.registry && !minimizedWindows.registry && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => focusWindow("registry")}
              className={`absolute top-16 left-6 right-6 md:left-20 md:right-20 z-20 flex flex-col rounded-2xl border bg-[#1a232a] shadow-2xl overflow-hidden backdrop-blur-xl ${
                activeWindow === "registry"
                  ? "border-cyan-500/50 shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "border-border/80 opacity-95"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/80 bg-[#141b21] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-cyan-400" />
                  <span className="text-xs font-bold text-foreground font-latin">
                    Kaspersky Registry Editor (Offline Windows Hive: C:\Windows\System32\config)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => minimizeWindow("registry", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Minus className="size-3" />
                  </button>
                  <button
                    onClick={(e) => closeWindow("registry", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-rose-500/20 hover:text-rose-400"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto">
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 text-xs text-cyan-200">
                  <p className="font-bold">
                    💡 يتيح لك محرر ريجستري كاسبرسكي فحص وتعديل خلايا نظام الويندوز المنفصل (Offline
                    Registry) لإصلاح هجمات قفل الشاشة وحذف البرمجيات الخبيثة من مفاتيح بدء التشغيل
                    (Winlogon و Run).
                  </p>
                </div>

                <div className="space-y-3">
                  {registryEntries.map((reg) => (
                    <div
                      key={reg.id}
                      className={`rounded-2xl border p-4 transition-all ${
                        reg.isTampered
                          ? "border-rose-500/40 bg-rose-950/10"
                          : "border-emerald-500/40 bg-emerald-950/10"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {reg.hive}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            reg.isTampered
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {reg.isTampered ? "⚠️ قيمة مخترقة / متلاعب بها" : "✅ قيمة سليمة"}
                        </span>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 text-xs font-mono my-2">
                        <div className="rounded-xl bg-card/60 p-2.5">
                          <span className="block text-[10px] text-muted-foreground font-sans">
                            اسم المفتاح (Value Name)
                          </span>
                          <span className="font-bold text-primary">{reg.valueName}</span>
                        </div>
                        <div className="rounded-xl bg-card/60 p-2.5">
                          <span className="block text-[10px] text-muted-foreground font-sans">
                            القيمة الحالية (Data)
                          </span>
                          <span
                            className={`font-bold ${
                              reg.isTampered ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            {reg.currentValue || "(فارغ)"}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed my-2 font-sans">
                        <strong className="text-foreground">الوصف الأمني: </strong>
                        {reg.threatDescription}
                      </p>

                      {reg.isTampered && (
                        <div className="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-border/40">
                          <span className="text-[11px] text-muted-foreground font-sans">
                            القيمة الافتراضية الصحيحة:{" "}
                            <strong className="font-mono text-emerald-400">
                              {reg.defaultValue || "(حذف القيمة)"}
                            </strong>
                          </span>
                          <button
                            onClick={() => handleRepairRegistryKey(reg.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-1.5 text-xs font-bold text-white shadow transition-all font-sans"
                          >
                            <Unlock className="size-3.5" />
                            <span>إصلاح القيمة الافتراضية (Restore Default)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------------
            WINDOW 3: File Manager Window (Thunar)
            ------------------------------------------------------------- */}
        <AnimatePresence>
          {openWindows.file_manager && !minimizedWindows.file_manager && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => focusWindow("file_manager")}
              className={`absolute top-20 left-8 right-8 md:left-24 md:right-24 z-20 flex flex-col rounded-2xl border bg-[#1a232a] shadow-2xl overflow-hidden backdrop-blur-xl ${
                activeWindow === "file_manager"
                  ? "border-amber-500/50 shadow-amber-500/10 ring-1 ring-amber-500/30"
                  : "border-border/80 opacity-95"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/80 bg-[#141b21] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FolderOpen className="size-4 text-amber-400" />
                  <span className="text-xs font-bold text-foreground font-latin">
                    Rescue File Manager [Thunar Live /disks/C]
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => minimizeWindow("file_manager", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Minus className="size-3" />
                  </button>
                  <button
                    onClick={(e) => closeWindow("file_manager", e)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-rose-500/20 hover:text-rose-400"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto">
                <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="font-mono text-xs text-muted-foreground">
                    المسار:{" "}
                    <span className="font-bold text-foreground font-latin">
                      /disks/C/Users/Student/Desktop
                    </span>
                  </div>
                  <button
                    onClick={handleRescueFilesToUsb}
                    disabled={isCopyingFiles}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-black text-white shadow disabled:opacity-50 transition-all"
                  >
                    <Usb className="size-4" />
                    <span>نسخ وإنقاذ الملفات إلى فلاشة USB</span>
                  </button>
                </div>

                {isCopyingFiles && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
                    <div className="flex justify-between text-xs text-amber-300 font-latin font-bold">
                      <span>جاري نسخ مشروعات التخرج والملفات إلى /disks/USB ...</span>
                      <span>{copyProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all"
                        style={{ width: `${copyProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Files List */}
                <div className="grid gap-2">
                  {[
                    {
                      name: "Graduation_Project_VR_v3.zip",
                      size: "4.2 GB",
                      type: "مشروع تخرج الواقع الافتراضي",
                    },
                    {
                      name: "Interactive_Course_Assets.rar",
                      size: "850 MB",
                      type: "ملفات إنتاج المقرر الإلكتروني",
                    },
                    {
                      name: "Exam_Question_Bank_2026.enc",
                      size: "12 MB",
                      type: "بنك الأسئلة المشفر",
                    },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-border/80 bg-secondary/20 p-3 hover:bg-secondary/40"
                    >
                      <div className="flex items-center gap-3">
                        <Archive className="size-5 text-amber-400" />
                        <div>
                          <span className="block font-mono text-xs font-bold text-foreground">
                            {f.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{f.type}</span>
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
                      إلى وحدة التخزين الخارجية (USB Rescue Drive)!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------------
            WINDOW 4: Terminal Window
            ------------------------------------------------------------- */}
        <AnimatePresence>
          {openWindows.terminal && !minimizedWindows.terminal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => focusWindow("terminal")}
              className={`absolute top-24 left-10 right-10 md:left-28 md:right-28 z-20 flex flex-col rounded-2xl border bg-[#0b0f12] shadow-2xl overflow-hidden backdrop-blur-xl ${
                activeWindow === "terminal"
                  ? "border-emerald-500/60 shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                  : "border-border/80 opacity-95"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/80 bg-[#10161b] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="size-4 text-emerald-400" />
                  <span className="text-xs font-bold text-foreground font-mono">
                    root@krd-live:~# (Bash Shell)
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

              <div className="p-5 font-mono text-xs text-emerald-400 space-y-3 max-h-80 overflow-y-auto">
                {terminalHistory.map((h, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-emerald-500">
                      <span className="text-cyan-400 font-bold">krd@live-gentoo</span>:
                      <span className="text-primary font-bold">~</span># {h.command}
                    </p>
                    {Array.isArray(h.output) ? (
                      h.output.map((line, j) => (
                        <p key={j} className="text-emerald-300/90 leading-relaxed">
                          {line}
                        </p>
                      ))
                    ) : (
                      <p className="text-emerald-300/90 leading-relaxed">{h.output}</p>
                    )}
                  </div>
                ))}

                <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 pt-2">
                  <span className="text-cyan-400 font-bold">krd@live-gentoo</span>:
                  <span className="text-primary font-bold">~</span>#
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="اكتب أمراً هنا (جرب: help, krd-scan, lsblk, clean-bootkit)..."
                    className="flex-1 bg-transparent text-xs text-emerald-300 outline-none"
                    autoFocus
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------------
            WINDOW 5: Guided Rescue Scenarios Panel
            ------------------------------------------------------------- */}
        <AnimatePresence>
          {openWindows.scenarios && !minimizedWindows.scenarios && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => focusWindow("scenarios")}
              className={`absolute bottom-16 right-6 md:right-12 w-96 max-w-full z-30 flex flex-col rounded-2xl border bg-[#1a232a]/95 shadow-2xl overflow-hidden backdrop-blur-xl ${
                activeWindow === "scenarios"
                  ? "border-primary/50 shadow-primary/10 ring-1 ring-primary/30"
                  : "border-border/80 opacity-95"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/80 bg-[#141b21] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">مهام وتحديات الإنقاذ</span>
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
                      <span className="rounded bg-primary/15 px-2 py-0.2 text-[10px] font-bold text-primary">
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
                      {sc.problemDescription}
                    </p>

                    <div className="rounded-lg bg-card/60 p-2 text-[11px] text-foreground mb-2">
                      <strong>المطلوب: </strong>
                      {sc.objective}
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
            WINDOW 6: Hardware Info Window
            ------------------------------------------------------------- */}
        <AnimatePresence>
          {openWindows.hardware_info && !minimizedWindows.hardware_info && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => focusWindow("hardware_info")}
              className="absolute top-28 left-16 right-16 md:left-32 md:right-32 z-20 flex flex-col rounded-2xl border border-border bg-[#1a232a] shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-border/80 bg-[#141b21] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="size-4 text-primary" />
                  <span className="text-xs font-bold text-foreground font-latin">
                    Hardware Information Tool (dmidecode & lshw)
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
                <div className="rounded-xl border border-border/80 bg-[#12181d] p-3 space-y-1">
                  <p className="text-primary font-bold">
                    CPU: Intel Core i7-11800H @ 2.30GHz (8 cores, 16 threads)
                  </p>
                  <p className="text-foreground">RAM: 16384 MB DDR4 Dual-Channel (3200 MT/s)</p>
                  <p className="text-foreground">
                    Motherboard: Educational Technology Lab Workstation [UEFI AMI 2.21]
                  </p>
                  <p className="text-emerald-400">
                    Disk 0: Samsung NVMe 980 500GB [SMART Health: 98% Good]
                  </p>
                  <p className="text-cyan-400">Disk 1: Kingston DataTraveler 32GB USB 3.0</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Taskbar (XFCE Style with Start Menu) */}
      <div className="relative z-40 flex items-center justify-between border-t border-border/80 bg-[#11171c] px-4 py-2">
        {/* Start Button */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => setIsStartMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-black text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all"
          >
            <Shield className="size-4" />
            <span className="font-latin tracking-wide">KASPERSKY</span>
          </button>

          {/* Start Menu Dropdown */}
          <AnimatePresence>
            {isStartMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-12 right-0 w-64 rounded-2xl border border-border bg-[#182128] p-3 shadow-2xl backdrop-blur-xl z-50 text-right"
              >
                <div className="border-b border-border/60 pb-2 mb-2">
                  <h4 className="text-xs font-black text-foreground">قائمة أسطوانة الإنقاذ</h4>
                  <span className="text-[10px] text-muted-foreground">KRD 18.0 Applications</span>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      toggleWindow("scanner");
                      setIsStartMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-right hover:bg-secondary/50 transition-colors"
                  >
                    <Shield className="size-4 text-emerald-400" />
                    <span>Kaspersky Rescue Tool</span>
                  </button>

                  <button
                    onClick={() => {
                      toggleWindow("registry");
                      setIsStartMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-right hover:bg-secondary/50 transition-colors"
                  >
                    <Lock className="size-4 text-cyan-400" />
                    <span>محرر الريجستري المستقل</span>
                  </button>

                  <button
                    onClick={() => {
                      toggleWindow("file_manager");
                      setIsStartMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-right hover:bg-secondary/50 transition-colors"
                  >
                    <FolderOpen className="size-4 text-amber-400" />
                    <span>مستكشف الملفات (Thunar)</span>
                  </button>

                  <button
                    onClick={() => {
                      toggleWindow("terminal");
                      setIsStartMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-right hover:bg-secondary/50 transition-colors"
                  >
                    <TerminalIcon className="size-4 text-emerald-400" />
                    <span>محطة الأوامر (Terminal)</span>
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
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-secondary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="size-3.5" />
                <span>Rescue Tool</span>
              </button>
            )}

            {openWindows.registry && (
              <button
                onClick={() => focusWindow("registry")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeWindow === "registry" && !minimizedWindows.registry
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-secondary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Lock className="size-3.5" />
                <span>Registry Editor</span>
              </button>
            )}

            {openWindows.file_manager && (
              <button
                onClick={() => focusWindow("file_manager")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeWindow === "file_manager" && !minimizedWindows.file_manager
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-secondary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderOpen className="size-3.5" />
                <span>File Manager</span>
              </button>
            )}

            {openWindows.terminal && (
              <button
                onClick={() => focusWindow("terminal")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeWindow === "terminal" && !minimizedWindows.terminal
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
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
          <span className="hidden md:inline font-mono">eth0: 192.168.1.105</span>
          <span className="rounded bg-secondary/50 px-2.5 py-1 text-foreground font-bold font-mono">
            10:18 AM
          </span>
        </div>
      </div>
    </div>
  );
}
