import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Radio,
  Settings,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Eye,
  EyeOff,
  Activity,
  Layers,
  ArrowRight,
  Info,
  Server,
  Filter,
  Sliders,
  Bell,
  Lock,
  Globe,
  Monitor,
  Wifi,
  Power,
  RefreshCw,
  Minus,
  Square,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

export type ComodoTab =
  | "summary"
  | "app_rules"
  | "global_rules"
  | "active_conns"
  | "stealth_ports"
  | "settings"
  | "attack_sim";

export type SecurityLevel =
  "Block All" | "Custom Ruleset" | "Safe Mode" | "Training Mode" | "Disabled";

export interface ApplicationRule {
  id: string;
  name: string;
  path: string;
  action: "Allow" | "Block" | "Custom";
  protocol: "TCP / UDP" | "TCP" | "UDP" | "All";
  inOut: "In / Out" | "Out" | "In";
  treatAs: "Web Browser" | "Email Client" | "Trusted Application" | "Blocked Application";
}

export interface GlobalRule {
  id: string;
  action: "Allow" | "Block";
  protocol: "TCP" | "UDP" | "TCP or UDP" | "ICMP" | "IP";
  direction: "In" | "Out" | "In / Out";
  sourceAddress: string;
  destAddress: string;
  destPort: string;
  description: string;
  log: boolean;
  enabled: boolean;
}

export interface NetworkConnection {
  id: string;
  process: string;
  protocol: "TCP" | "UDP";
  localAddress: string;
  remoteAddress: string;
  state: "ESTABLISHED" | "LISTEN" | "TIME_WAIT";
  bytesSent: number;
  bytesReceived: number;
}

export interface FirewallEvent {
  id: string;
  time: string;
  event: string;
  action: "BLOCKED" | "ALLOWED";
  protocol: string;
  ip: string;
  port: string;
}

export function ComodoSimulator() {
  const [activeTab, setActiveTab] = useState<ComodoTab>("summary");
  const [windowState, setWindowState] = useState<"open" | "minimized" | "closed">("open");
  const [isMaximized, setIsMaximized] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>("Safe Mode");
  const [isTrafficStopped, setIsTrafficStopped] = useState(false);

  // Network Traffic Metrics (Simulated Live)
  const [inboundSpeed, setInboundSpeed] = useState(4.2);
  const [outboundSpeed, setOutboundSpeed] = useState(1.8);
  const [blockedAttemptsCount, setBlockedAttemptsCount] = useState(14);

  // Stealth Ports setting
  const [stealthMode, setStealthMode] = useState<"stealth_all" | "alert_in" | "stealth_public">(
    "stealth_all",
  );

  // Application Rules
  const [appRules, setAppRules] = useState<ApplicationRule[]>([
    {
      id: "a1",
      name: "Google Chrome",
      path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      action: "Allow",
      protocol: "TCP / UDP",
      inOut: "Out",
      treatAs: "Web Browser",
    },
    {
      id: "a2",
      name: "Discord Client",
      path: "C:\\Users\\Admin\\AppData\\Local\\Discord\\app-1.0.9\\Discord.exe",
      action: "Allow",
      protocol: "TCP / UDP",
      inOut: "In / Out",
      treatAs: "Trusted Application",
    },
    {
      id: "a3",
      name: "BitTorrent Sync",
      path: "C:\\Program Files\\BitTorrent\\utorrent.exe",
      action: "Block",
      protocol: "All",
      inOut: "In / Out",
      treatAs: "Blocked Application",
    },
    {
      id: "a4",
      name: "Suspicious P2P Miner",
      path: "C:\\Users\\Admin\\AppData\\Local\\Temp\\xmrig.exe",
      action: "Block",
      protocol: "All",
      inOut: "In / Out",
      treatAs: "Blocked Application",
    },
  ]);

  // Global Rules
  const [globalRules, setGlobalRules] = useState<GlobalRule[]>([
    {
      id: "g1",
      action: "Block",
      protocol: "TCP or UDP",
      direction: "In",
      sourceAddress: "Any Address",
      destAddress: "Any Address",
      destPort: "4444",
      description: "حظر منفذ الاختراق الخلفي Metasploit Default Listener (Port 4444)",
      log: true,
      enabled: true,
    },
    {
      id: "g2",
      action: "Block",
      protocol: "TCP",
      direction: "In",
      sourceAddress: "Any Address",
      destAddress: "Any Address",
      destPort: "23",
      description: "حظر منفذ Telnet غير المشفر لمنع الوصول العشوائي",
      log: true,
      enabled: true,
    },
    {
      id: "g3",
      action: "Block",
      protocol: "ICMP",
      direction: "In",
      sourceAddress: "Any Address",
      destAddress: "Any Address",
      destPort: "Echo Request",
      description: "إسكات طلبات Ping Echo لمنع اكتشاف الحاسوب على الشبكة",
      log: false,
      enabled: true,
    },
    {
      id: "g4",
      action: "Allow",
      protocol: "TCP or UDP",
      direction: "Out",
      sourceAddress: "Any Address",
      destAddress: "Any Address",
      destPort: "Any Port",
      description: "السماح بالاتصالات الخارجية الصادرة للمصرح لهم",
      log: false,
      enabled: true,
    },
  ]);

  // New Global Rule Form Modal State
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRuleAction, setNewRuleAction] = useState<"Allow" | "Block">("Block");
  const [newRuleProtocol, setNewRuleProtocol] = useState<
    "TCP" | "UDP" | "TCP or UDP" | "ICMP" | "IP"
  >("TCP or UDP");
  const [newRuleDirection, setNewRuleDirection] = useState<"In" | "Out" | "In / Out">("In");
  const [newRulePort, setNewRulePort] = useState("8080");
  const [newRuleDesc, setNewRuleDesc] = useState("حظر منفذ الوكيل المشبوه (Port 8080)");
  const [newRuleLog, setNewRuleLog] = useState(true);

  // Active Connections List
  const [connections, setConnections] = useState<NetworkConnection[]>([
    {
      id: "c1",
      process: "chrome.exe",
      protocol: "TCP",
      localAddress: "192.168.1.15:52341",
      remoteAddress: "142.250.190.46:443 (HTTPS)",
      state: "ESTABLISHED",
      bytesSent: 145020,
      bytesReceived: 894320,
    },
    {
      id: "c2",
      process: "svchost.exe (DNS)",
      protocol: "UDP",
      localAddress: "192.168.1.15:5353",
      remoteAddress: "8.8.8.8:53 (DNS)",
      state: "ESTABLISHED",
      bytesSent: 2040,
      bytesReceived: 6180,
    },
    {
      id: "c3",
      process: "Discord.exe",
      protocol: "TCP",
      localAddress: "192.168.1.15:52410",
      remoteAddress: "162.159.135.232:443 (HTTPS)",
      state: "ESTABLISHED",
      bytesSent: 54200,
      bytesReceived: 124000,
    },
    {
      id: "c4",
      process: "System (Listening)",
      protocol: "TCP",
      localAddress: "0.0.0.0:135 (RPC)",
      remoteAddress: "*:*",
      state: "LISTEN",
      bytesSent: 0,
      bytesReceived: 0,
    },
  ]);

  // Firewall Logs
  const [eventLogs, setEventLogs] = useState<FirewallEvent[]>([
    {
      id: "l1",
      time: "10:22:15",
      event: "محاولة اتصال وارد غير مصرح بها على منفذ Metasploit",
      action: "BLOCKED",
      protocol: "TCP",
      ip: "185.220.101.4",
      port: "4444",
    },
    {
      id: "l2",
      time: "10:20:04",
      event: "حزمة استكشاف ICMP Ping لمنع كشف الجهاز",
      action: "BLOCKED",
      protocol: "ICMP",
      ip: "45.154.255.89",
      port: "Echo Request",
    },
    {
      id: "l3",
      time: "10:14:50",
      event: "تطبيق Suspicious P2P Miner حاول فتح منفذ استماع عشوائي",
      action: "BLOCKED",
      protocol: "UDP",
      ip: "192.168.1.15",
      port: "3333",
    },
  ]);

  // Advanced & Alert Settings
  const [settingsState, setSettingsState] = useState({
    doNotShowPopups: false,
    enableTrustConnect: true,
    trafficAnimation: true,
    alertFrequency: "Medium" as "Low" | "Medium" | "High" | "Very High",
    alertTimeout: 120,
    filterIpv6: true,
    filterLoopback: true,
    blockFragmentedIp: true,
    protocolAnalysis: true,
    enableAntiArpSpoofing: true,
  });

  // Attack simulation state
  const [simulatingAttack, setSimulatingAttack] = useState<string | null>(null);

  // Live traffic ticker
  useEffect(() => {
    if (isTrafficStopped || securityLevel === "Block All") {
      setInboundSpeed(0);
      setOutboundSpeed(0);
      return;
    }

    const interval = setInterval(() => {
      setInboundSpeed((prev) => {
        const delta = (Math.random() - 0.48) * 1.5;
        return Math.max(0.2, Math.round((prev + delta) * 10) / 10);
      });
      setOutboundSpeed((prev) => {
        const delta = (Math.random() - 0.48) * 0.8;
        return Math.max(0.1, Math.round((prev + delta) * 10) / 10);
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isTrafficStopped, securityLevel]);

  // Handle Add Global Rule
  const handleAddGlobalRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: GlobalRule = {
      id: "g_" + Date.now(),
      action: newRuleAction,
      protocol: newRuleProtocol,
      direction: newRuleDirection,
      sourceAddress: "Any Address",
      destAddress: "Any Address",
      destPort: newRulePort,
      description: newRuleDesc || `قاعدة ${newRuleAction} للمنفذ ${newRulePort}`,
      log: newRuleLog,
      enabled: true,
    };
    setGlobalRules((prev) => [newRule, ...prev]);
    setShowAddRuleModal(false);
  };

  // Toggle app rule action
  const toggleAppAction = (id: string) => {
    setAppRules((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, action: a.action === "Allow" ? "Block" : "Allow" } : a,
      ),
    );
  };

  // Terminate active connection
  const terminateConnection = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  // Run attack simulation
  const runAttackTest = (type: "port_scan" | "ping_flood" | "arp_spoof") => {
    setSimulatingAttack(type);
    setTimeout(() => {
      const now = new Date().toLocaleTimeString();
      if (type === "port_scan") {
        setBlockedAttemptsCount((c) => c + 1);
        setEventLogs((prev) => [
          {
            id: "l_" + Date.now(),
            time: now,
            event: "تم اعتراض وإحباط محاولة مسح منافذ مشبوهة (Port Scan detected: ports 21-1024)",
            action: "BLOCKED",
            protocol: "TCP SYN",
            ip: "198.51.100.27",
            port: "Multiple",
          },
          ...prev,
        ]);
      } else if (type === "ping_flood") {
        setBlockedAttemptsCount((c) => c + 1);
        setEventLogs((prev) => [
          {
            id: "l_" + Date.now(),
            time: now,
            event: "إحباط هجوم إغراق بحزم Ping Flooding (ICMP Echo Flood)",
            action: "BLOCKED",
            protocol: "ICMP",
            ip: "203.0.113.88",
            port: "Type 8 / Echo",
          },
          ...prev,
        ]);
      } else if (type === "arp_spoof") {
        setBlockedAttemptsCount((c) => c + 1);
        setEventLogs((prev) => [
          {
            id: "l_" + Date.now(),
            time: now,
            event: "ميزة Anti-ARP Spoofing منعت محاولة تزييف عنوان الـ MAC للراوتر من جهاز داخلي",
            action: "BLOCKED",
            protocol: "ARP",
            ip: "192.168.1.104",
            port: "Layer 2",
          },
          ...prev,
        ]);
      }
      setSimulatingAttack(null);
    }, 1800);
  };

  const isSecure = securityLevel !== "Disabled" && !isTrafficStopped;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Course Context Header */}
      <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-xs leading-relaxed text-foreground/90 md:text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <Info className="size-5 shrink-0" />
            <span>محاكي معمل الأمن السيبراني: تطبيق عملي تفصيلي لـ COMODO Firewall</span>
          </div>
          <span className="text-muted-foreground text-xs">
            يركز على: قواعد التطبيقات، القواعد العامة وقفل المنافذ، مستويات الحماية (Safe Mode,
            Training, Block All)، وإخفاء المنافذ.
          </span>
        </div>
      </div>

      {/* Animated Comodo Window State Manager */}
      <AnimatePresence mode="wait">
        {windowState === "open" && (
          <motion.div
            key="comodo-window"
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={
              simulatingAttack
                ? { x: [-3, 3, -3, 3, 0], opacity: 1, scale: 1, y: 0 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className={`overflow-hidden rounded-3xl border border-[#3a1d1d] bg-[#17171d] shadow-2xl transition-all ${
              isMaximized ? "fixed inset-3 z-50 rounded-2xl max-h-[96vh] flex flex-col" : ""
            }`}
          >
            {/* Title Bar (Comodo Classic Red Brand Header) */}
            <div className="flex items-center justify-between border-b border-red-900/40 bg-gradient-to-r from-[#8a1414] via-[#611010] to-[#2b0808] px-5 py-3 text-white select-none">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-lg bg-red-600 text-white font-black text-xs shadow-md">
                  C
                </span>
                <div className="leading-tight">
                  <span className="font-extrabold text-sm tracking-wide">COMODO Firewall</span>
                  <span className="block text-[10px] text-red-200/80">
                    Proactive Defense & Network Security
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Stop All Traffic Emergency Button */}
                <button
                  onClick={() => setIsTrafficStopped((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all shadow-sm ${
                    isTrafficStopped
                      ? "bg-amber-400 text-black hover:bg-amber-300"
                      : "bg-red-950/80 hover:bg-red-800 text-red-200 border border-red-700/50"
                  }`}
                  title="إيقاف كامل لنشاط الشبكة من وإلى الجهاز"
                >
                  <Power className="size-3.5" />
                  {isTrafficStopped ? "استئناف نشاط الشبكة" : "Stop Network Activity"}
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className="flex size-7 items-center justify-center rounded-lg bg-black/30 hover:bg-black/50 text-white/80 transition-colors"
                  title="إعدادات الجدار الناري"
                >
                  <Settings className="size-4" />
                </button>

                {/* Window Controls (Minimize, Maximize, Close) with Motion Hover */}
                <div className="flex items-center gap-1.5 border-r border-red-900/50 pr-2 mr-1">
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setWindowState("minimized")}
                    className="size-7 flex items-center justify-center rounded-lg bg-black/30 hover:bg-amber-500/20 text-white/70 hover:text-amber-300 transition-colors cursor-pointer"
                    title="تصغير النافذة (Minimize)"
                    aria-label="تصغير النافذة"
                  >
                    <Minus className="size-3.5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMaximized((v) => !v)}
                    className="size-7 flex items-center justify-center rounded-lg bg-black/30 hover:bg-emerald-500/20 text-white/70 hover:text-emerald-300 transition-colors cursor-pointer"
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
                    className="size-7 flex items-center justify-center rounded-lg bg-black/30 hover:bg-rose-500/20 text-white/70 hover:text-rose-400 transition-colors cursor-pointer"
                    title="إغلاق نافذة COMODO (Close)"
                    aria-label="إغلاق النافذة"
                  >
                    <X className="size-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Comodo Horizontal Navigation Bar */}
            <div className="border-b border-white/10 bg-[#1e1e26] px-4 flex flex-wrap items-center gap-1 text-xs font-bold text-white/70 overflow-x-auto">
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-3 transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === "summary"
                    ? "border-red-500 text-white bg-white/5"
                    : "border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                <Shield className="size-4" />
                الملخص والحالة (Summary)
              </button>

              <button
                onClick={() => setActiveTab("app_rules")}
                className={`px-4 py-3 transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === "app_rules"
                    ? "border-red-500 text-white bg-white/5"
                    : "border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                <Monitor className="size-4" />
                قواعد التطبيقات (Application Rules)
              </button>

              <button
                onClick={() => setActiveTab("global_rules")}
                className={`px-4 py-3 transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === "global_rules"
                    ? "border-red-500 text-white bg-white/5"
                    : "border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                <Server className="size-4" />
                القواعد العامة والمنافذ (Global Rules)
              </button>

              <button
                onClick={() => setActiveTab("active_conns")}
                className={`px-4 py-3 transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === "active_conns"
                    ? "border-red-500 text-white bg-white/5"
                    : "border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                <Activity className="size-4" />
                الاتصالات النشطة ({connections.length})
              </button>

              <button
                onClick={() => setActiveTab("stealth_ports")}
                className={`px-4 py-3 transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === "stealth_ports"
                    ? "border-red-500 text-white bg-white/5"
                    : "border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                <EyeOff className="size-4" />
                إخفاء المنافذ (Stealth Ports)
              </button>

              <button
                onClick={() => setActiveTab("attack_sim")}
                className={`px-4 py-3 transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === "attack_sim"
                    ? "border-red-500 text-white bg-white/5"
                    : "border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                <Flame className="size-4 text-orange-400" />
                اختبار صد الهجمات (Attack Simulator)
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-3 transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === "settings"
                    ? "border-red-500 text-white bg-white/5"
                    : "border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                <Sliders className="size-4" />
                الإعدادات والتنبيهات
              </button>
            </div>

            {/* Comodo Content Stage */}
            <div
              className={`p-6 md:p-8 text-white bg-[#191921] overflow-y-auto ${
                isMaximized ? "flex-1 max-h-none" : "min-h-[540px] max-h-[700px]"
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
                  {/* 1. SUMMARY TAB */}
                  {activeTab === "summary" && (
                    <div className="space-y-6">
                      {/* Primary Status Banner */}
                      <div
                        className={`rounded-2xl border p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 ${
                          isTrafficStopped
                            ? "border-amber-500/50 bg-amber-950/20"
                            : securityLevel === "Block All"
                              ? "border-red-500/50 bg-red-950/20"
                              : "border-emerald-500/40 bg-emerald-950/20"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`flex size-16 items-center justify-center rounded-2xl ${
                              isTrafficStopped
                                ? "bg-amber-500/20 text-amber-400"
                                : securityLevel === "Block All"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {isTrafficStopped ? (
                              <Power className="size-8" />
                            ) : securityLevel === "Block All" ? (
                              <ShieldAlert className="size-8" />
                            ) : (
                              <ShieldCheck className="size-8" />
                            )}
                          </span>
                          <div>
                            <h3 className="text-2xl font-black text-white">
                              {isTrafficStopped
                                ? "تم إيقاف كافة أنشطة الشبكة يدويًا!"
                                : securityLevel === "Block All"
                                  ? "وضع Block All نشط — منع كامل للاتصالات الواردة والصادرة"
                                  : "الجدار الناري يعمل بنشاط — نظامك محمي بالكامل"}
                            </h3>
                            <p className="mt-1 text-xs text-white/60">
                              {isTrafficStopped
                                ? "تم قطع حركة مرور البيانات الصادرة والواردة بالكامل عبر زر الطوارئ."
                                : `مستوى الحماية الحالي: (${securityLevel}) — مراقبة حزم TCP/UDP ومنع الاختراقات.`}
                            </p>
                          </div>
                        </div>

                        {/* Security Mode Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white/70">
                            وضع الحماية (Security Level):
                          </span>
                          <select
                            value={securityLevel}
                            onChange={(e) => setSecurityLevel(e.target.value as SecurityLevel)}
                            className="rounded-xl border border-white/20 bg-black/60 px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-red-500"
                          >
                            <option value="Safe Mode">Safe Mode (الوضع الافتراضي الموصى به)</option>
                            <option value="Training Mode">
                              Training Mode (وضع التعلم من الاستخدام)
                            </option>
                            <option value="Custom Ruleset">Custom Ruleset (قواعد مخصصة)</option>
                            <option value="Block All">Block All (أعلى حماية - منع تام)</option>
                            <option value="Disabled">Disabled (معطل)</option>
                          </select>
                        </div>
                      </div>

                      {/* Mode Descriptions (From Course) */}
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/70">
                        <span className="font-bold text-red-400">
                          شرح أوضاع الحماية حسب المنهج:{" "}
                        </span>
                        {securityLevel === "Safe Mode" &&
                          "Safe Mode: يسمح تلقائيًا للبرامج الموثوقة والمعروفة بالاتصال، ويسأل عند مواجهة برامج غير معروفة."}
                        {securityLevel === "Training Mode" &&
                          "Training Mode: يتعلم سلوك البرامج المثبتة على الجهاز وينشئ قواعد تلقائية حسب الاستخدام (يُستخدم لفترة مؤقتة فقط)."}
                        {securityLevel === "Custom Ruleset" &&
                          "Custom Ruleset: يسمح للمستخدم بإنشاء قواعد يدوية، مع تحكم كامل ومخصص في السماح والمنع."}
                        {securityLevel === "Block All" &&
                          "Block All: يمنع جميع الاتصالات الواردة والصادرة وهو أعلى مستوى حماية ويُستخدم عند الاشتباه بوجود هجوم أو اختراق."}
                        {securityLevel === "Disabled" &&
                          "Disabled: الجدار الناري معطل ولا يوفر أي حماية."}
                      </div>

                      {/* Live Network & Traffic Metrics Bar */}
                      <div className="grid gap-4 sm:grid-cols-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <span className="text-xs text-white/50 block">
                            حركة المرور الواردة (Inbound)
                          </span>
                          <div
                            className="mt-2 flex items-baseline gap-1 font-latin text-2xl font-black text-emerald-400 tabular-nums"
                            dir="ltr"
                          >
                            {inboundSpeed} <span className="text-xs text-white/50">KB/s</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <span className="text-xs text-white/50 block">
                            حركة المرور الصادرة (Outbound)
                          </span>
                          <div
                            className="mt-2 flex items-baseline gap-1 font-latin text-2xl font-black text-primary tabular-nums"
                            dir="ltr"
                          >
                            {outboundSpeed} <span className="text-xs text-white/50">KB/s</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <span className="text-xs text-white/50 block">
                            محاولات التسلل المحظورة
                          </span>
                          <div
                            className="mt-2 flex items-baseline gap-1 font-latin text-2xl font-black text-red-400 tabular-nums"
                            dir="ltr"
                          >
                            {blockedAttemptsCount}{" "}
                            <span className="text-xs text-white/50">Intrusions</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <span className="text-xs text-white/50 block">قواعد المنافذ العامة</span>
                          <div
                            className="mt-2 flex items-baseline gap-1 font-latin text-2xl font-black text-white tabular-nums"
                            dir="ltr"
                          >
                            {globalRules.length}{" "}
                            <span className="text-xs text-white/50">Active Rules</span>
                          </div>
                        </div>
                      </div>

                      {/* Tasks Quick Action Buttons (as listed in course curriculum table) */}
                      <div>
                        <h4 className="text-sm font-extrabold text-white mb-3">
                          مهام الجدار الناري المباشرة (Firewall Tasks)
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <button
                            onClick={() => setActiveTab("app_rules")}
                            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-right hover:border-red-500/50 hover:bg-white/10 transition-all"
                          >
                            <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                            <div>
                              <strong className="text-xs text-white block">
                                Allow Application
                              </strong>
                              <span className="text-[11px] text-white/50 block">
                                السماح لتطبيق بالاتصال بالإنترنت
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => setActiveTab("app_rules")}
                            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-right hover:border-red-500/50 hover:bg-white/10 transition-all"
                          >
                            <XCircle className="size-5 text-red-400 shrink-0" />
                            <div>
                              <strong className="text-xs text-white block">
                                Block Application
                              </strong>
                              <span className="text-[11px] text-white/50 block">
                                منع تطبيق من الوصول للإنترنت
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => setActiveTab("stealth_ports")}
                            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-right hover:border-red-500/50 hover:bg-white/10 transition-all"
                          >
                            <EyeOff className="size-5 text-amber-400 shrink-0" />
                            <div>
                              <strong className="text-xs text-white block">Stealth Ports</strong>
                              <span className="text-[11px] text-white/50 block">
                                إخفاء الجهاز عن الماسحات
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => setActiveTab("active_conns")}
                            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-right hover:border-red-500/50 hover:bg-white/10 transition-all"
                          >
                            <Activity className="size-5 text-primary shrink-0" />
                            <div>
                              <strong className="text-xs text-white block">View Connections</strong>
                              <span className="text-[11px] text-white/50 block">
                                عرض التطبيقات المتصلة حاليًا
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => setActiveTab("global_rules")}
                            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-right hover:border-red-500/50 hover:bg-white/10 transition-all"
                          >
                            <Lock className="size-5 text-orange-400 shrink-0" />
                            <div>
                              <strong className="text-xs text-white block">
                                Global Rules (قفل منفذ)
                              </strong>
                              <span className="text-[11px] text-white/50 block">
                                إضافة قواعد حظر المنافذ TCP/UDP
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => setActiveTab("attack_sim")}
                            className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-950/20 p-3.5 text-right hover:bg-red-900/30 transition-all"
                          >
                            <Flame className="size-5 text-red-400 shrink-0" />
                            <div>
                              <strong className="text-xs text-white block">Attack Simulator</strong>
                              <span className="text-[11px] text-red-200/60 block">
                                محاكاة فحص المنافذ وهجمات Ping
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Recent Firewall Events Feed */}
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                            <Bell className="size-4 text-red-400" />
                            سجل أحداث الجدار الناري المباشرة (Firewall Events Log)
                          </h4>
                          <span className="text-xs text-white/40">يتم التحديث لحظيًا</span>
                        </div>

                        <div className="mt-3 divide-y divide-white/10 text-xs">
                          {eventLogs.slice(0, 5).map((log) => (
                            <div
                              key={log.id}
                              className="py-2.5 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-white/40 text-[11px]">
                                  {log.time}
                                </span>
                                <span className="rounded bg-red-500/20 text-red-400 px-2 py-0.5 text-[10px] font-bold">
                                  {log.action}
                                </span>
                                <span className="text-white/80">{log.event}</span>
                              </div>
                              <div className="font-mono text-[11px] text-white/50" dir="ltr">
                                {log.protocol} | {log.ip}:{log.port}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. APPLICATION RULES TAB */}
                  {activeTab === "app_rules" && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-black">
                            قواعد التطبيقات (Application Rules)
                          </h3>
                          <p className="text-xs text-white/60 mt-1">
                            التحكم في وصول البرامج المثبتة إلى الإنترنت (السماح Allow أو المنع
                            Block).
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                        <div className="border-b border-white/10 px-5 py-3 text-xs font-bold text-white/60 grid grid-cols-[1.5fr_1fr_1fr_120px] gap-3">
                          <span>التطبيق (Application)</span>
                          <span>نوع السلوك (Treat As)</span>
                          <span>الاتجاه والبروتوكول</span>
                          <span className="text-center">الإجراء (Action)</span>
                        </div>

                        <div className="divide-y divide-white/10">
                          {appRules.map((app) => (
                            <div
                              key={app.id}
                              className="p-4 grid grid-cols-[1.5fr_1fr_1fr_120px] gap-3 items-center text-xs"
                            >
                              <div>
                                <strong className="text-sm font-bold text-white block">
                                  {app.name}
                                </strong>
                                <span
                                  className="font-mono text-[11px] text-white/40 truncate block"
                                  dir="ltr"
                                >
                                  {app.path}
                                </span>
                              </div>

                              <div className="text-white/70">{app.treatAs}</div>

                              <div className="font-mono text-[11px] text-white/60" dir="ltr">
                                {app.protocol} ({app.inOut})
                              </div>

                              <div className="text-center">
                                <button
                                  onClick={() => toggleAppAction(app.id)}
                                  className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all shadow-sm ${
                                    app.action === "Allow"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                                      : "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                                  }`}
                                >
                                  {app.action === "Allow" ? "✓ Allow (سماح)" : "✕ Block (منع)"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. GLOBAL RULES TAB (قفل المنافذ والقواعد العامة) */}
                  {activeTab === "global_rules" && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-black">
                            القواعد العامة وحظر المنافذ (Global Rules)
                          </h3>
                          <p className="text-xs text-white/60 mt-1">
                            قواعد فحص الحزم وتأمين المنافذ غير المستخدمة (Ports) لمنع هجمات التسلل.
                          </p>
                        </div>

                        {/* Add Rule Button (Opens Modal matching exact step in course) */}
                        <button
                          onClick={() => setShowAddRuleModal(true)}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 transition-all"
                        >
                          <Plus className="size-4" />
                          إضافة قاعدة منع منفذ جديدة (Add Rule)
                        </button>
                      </div>

                      {/* Step instructions reference banner from course */}
                      <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-white/70 flex items-center gap-2">
                        <Info className="size-4 text-primary shrink-0" />
                        <span>
                          خطوات إضافة قاعدة منع منفذ كما في الدرس: الضغط على Add ← اختيار Action:
                          Block ← البروتوكول TCP or UDP ← تحديد رقم المنفذ ← الضغط على OK.
                        </span>
                      </div>

                      {/* Global Rules Table */}
                      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                        <div className="border-b border-white/10 px-5 py-3 text-xs font-bold text-white/60 grid grid-cols-[80px_100px_100px_120px_1fr_60px] gap-3">
                          <span>الإجراء</span>
                          <span>البروتوكول</span>
                          <span>الاتجاه</span>
                          <span>المنفذ المستهدف</span>
                          <span>الوصف (Description)</span>
                          <span className="text-center">حذف</span>
                        </div>

                        <div className="divide-y divide-white/10">
                          {globalRules.map((rule) => (
                            <div
                              key={rule.id}
                              className="p-4 grid grid-cols-[80px_100px_100px_120px_1fr_60px] gap-3 items-center text-xs"
                            >
                              <span
                                className={`rounded px-2 py-0.5 text-[11px] font-bold text-center ${
                                  rule.action === "Block"
                                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                }`}
                              >
                                {rule.action}
                              </span>

                              <span className="font-mono text-white/80">{rule.protocol}</span>

                              <span className="text-white/60">{rule.direction}</span>

                              <span className="font-mono font-bold text-orange-400">
                                Port {rule.destPort}
                              </span>

                              <span className="text-white/80 leading-relaxed">
                                {rule.description}
                              </span>

                              <div className="text-center">
                                <button
                                  onClick={() =>
                                    setGlobalRules((r) => r.filter((item) => item.id !== rule.id))
                                  }
                                  className="text-white/40 hover:text-red-400 transition-colors p-1"
                                  title="حذف القاعدة"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. ACTIVE CONNECTIONS TAB */}
                  {activeTab === "active_conns" && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-black">
                            الاتصالات النشطة حاليًا (Active Connections)
                          </h3>
                          <p className="text-xs text-white/60 mt-1">
                            عرض كافة العمليات المتصلة بالإنترنت والمنافذ المحلية والبعيدة المفتوحة.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                        <div className="border-b border-white/10 px-5 py-3 text-xs font-bold text-white/60 grid grid-cols-[1.5fr_80px_1.5fr_1.5fr_90px_90px] gap-3">
                          <span>البرنامج (Application)</span>
                          <span>البروتوكول</span>
                          <span>العنوان المحلي (Local)</span>
                          <span>العنوان البعيد (Remote)</span>
                          <span>الحالة</span>
                          <span className="text-center">إجراء</span>
                        </div>

                        <div className="divide-y divide-white/10">
                          {connections.map((conn) => (
                            <div
                              key={conn.id}
                              className="p-4 grid grid-cols-[1.5fr_80px_1.5fr_1.5fr_90px_90px] gap-3 items-center text-xs"
                            >
                              <strong className="text-white font-mono">{conn.process}</strong>
                              <span className="font-mono text-white/60">{conn.protocol}</span>
                              <span className="font-mono text-white/80" dir="ltr">
                                {conn.localAddress}
                              </span>
                              <span className="font-mono text-primary font-bold" dir="ltr">
                                {conn.remoteAddress}
                              </span>
                              <span className="text-emerald-400 font-mono text-[11px]">
                                {conn.state}
                              </span>
                              <div className="text-center">
                                <button
                                  onClick={() => terminateConnection(conn.id)}
                                  className="rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-1 text-[11px] font-bold hover:bg-red-500/30"
                                >
                                  إنهاء
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. STEALTH PORTS TAB */}
                  {activeTab === "stealth_ports" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-black">
                          معالج إخفاء المنافذ (Stealth Ports Wizard)
                        </h3>
                        <p className="text-xs text-white/60 mt-1">
                          التحكم في ظهور هذا الحاسوب للحواسيب والماسحات الأخرى على الشبكة المحلية
                          والإنترنت.
                        </p>
                      </div>

                      <div className="grid gap-4">
                        {/* Option 1 */}
                        <label
                          className={`rounded-2xl border p-5 flex items-start gap-4 cursor-pointer transition-all ${
                            stealthMode === "stealth_all"
                              ? "border-red-500 bg-red-950/20"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="radio"
                            name="stealth"
                            checked={stealthMode === "stealth_all"}
                            onChange={() => setStealthMode("stealth_all")}
                            className="mt-1 accent-red-600 size-4"
                          />
                          <div>
                            <strong className="text-sm font-extrabold text-white block">
                              Block all incoming connections and make my ports stealth for everyone
                              (Recommended)
                            </strong>
                            <p className="mt-1 text-xs text-white/60 leading-relaxed">
                              حظر جميع الاتصالات الواردة وإخفاء المنافذ تمامًا عن جميع الأجهزة على
                              الشبكة والإنترنت. يجعل الحاسوب غير مرئي لأوامر Ping وبرامج مسح المنافذ
                              مثل Nmap.
                            </p>
                          </div>
                        </label>

                        {/* Option 2 */}
                        <label
                          className={`rounded-2xl border p-5 flex items-start gap-4 cursor-pointer transition-all ${
                            stealthMode === "alert_in"
                              ? "border-red-500 bg-red-950/20"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="radio"
                            name="stealth"
                            checked={stealthMode === "alert_in"}
                            onChange={() => setStealthMode("alert_in")}
                            className="mt-1 accent-red-600 size-4"
                          />
                          <div>
                            <strong className="text-sm font-extrabold text-white block">
                              Alert me to incoming connections and make my ports stealth on a
                              per-case basis
                            </strong>
                            <p className="mt-1 text-xs text-white/60 leading-relaxed">
                              إظهار نافذة تحذيرية وسؤال المستخدم عند كل محاولة اتصال واردة جديدة.
                            </p>
                          </div>
                        </label>

                        {/* Option 3 */}
                        <label
                          className={`rounded-2xl border p-5 flex items-start gap-4 cursor-pointer transition-all ${
                            stealthMode === "stealth_public"
                              ? "border-red-500 bg-red-950/20"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="radio"
                            name="stealth"
                            checked={stealthMode === "stealth_public"}
                            onChange={() => setStealthMode("stealth_public")}
                            className="mt-1 accent-red-600 size-4"
                          />
                          <div>
                            <strong className="text-sm font-extrabold text-white block">
                              Block all incoming connections and hide my ports only on public
                              networks
                            </strong>
                            <p className="mt-1 text-xs text-white/60 leading-relaxed">
                              إخفاء المنافذ في الشبكات العامة (كالمقاهي والمطارات)، والسماح بالأجهزة
                              الموثوقة على شبكة المنزل (Trusted Network Zone).
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 6. ATTACK SIMULATION TAB */}
                  {activeTab === "attack_sim" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-black">
                          مختبر محاكاة صد الهجمات (Attack Simulator)
                        </h3>
                        <p className="text-xs text-white/60 mt-1">
                          أرسل هجمات شبكية محاكاة لتختبر كيف يتصدى الجدار الناري لها ويحجبها فورًا.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        {/* Port Scan Test */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                              <Server className="size-4" />
                              محاكاة مسح المنافذ (Port Scan)
                            </div>
                            <p className="mt-2 text-xs text-white/60 leading-relaxed">
                              يقوم مهاجم بإرسال حزم TCP SYN لمئات المنافذ (مثل 21, 23, 4444) لاكتشاف
                              الخدمات الضعيفة.
                            </p>
                          </div>
                          <button
                            onClick={() => runAttackTest("port_scan")}
                            disabled={simulatingAttack !== null}
                            className="mt-4 rounded-xl bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50"
                          >
                            {simulatingAttack === "port_scan"
                              ? "جاري الهجوم والصد..."
                              : "إطلاق فحص المنافذ"}
                          </button>
                        </div>

                        {/* Ping Flood Test */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                              <Activity className="size-4" />
                              إغراق بحزم Ping Flood (ICMP)
                            </div>
                            <p className="mt-2 text-xs text-white/60 leading-relaxed">
                              إرسال حزم ICMP Echo Request متتالية في محاولة لشل استجابة كرت الشبكة.
                            </p>
                          </div>
                          <button
                            onClick={() => runAttackTest("ping_flood")}
                            disabled={simulatingAttack !== null}
                            className="mt-4 rounded-xl bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50"
                          >
                            {simulatingAttack === "ping_flood"
                              ? "جاري الهجوم والصد..."
                              : "إطلاق هجوم Ping"}
                          </button>
                        </div>

                        {/* ARP Poisoning Test */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                              <ShieldAlert className="size-4" />
                              انتحال ARP Spoofing
                            </div>
                            <p className="mt-2 text-xs text-white/60 leading-relaxed">
                              محاولة جهاز على نفس الشبكة المحلية ربط IP الراوتر بالماك أدرس الخاص به
                              للتنصت.
                            </p>
                          </div>
                          <button
                            onClick={() => runAttackTest("arp_spoof")}
                            disabled={simulatingAttack !== null}
                            className="mt-4 rounded-xl bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50"
                          >
                            {simulatingAttack === "arp_spoof"
                              ? "جاري الهجوم والصد..."
                              : "إطلاق انتحال ARP"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. SETTINGS & ALERTS TAB */}
                  {activeTab === "settings" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-black">
                          إعدادات الجدار الناري والتنبيهات المتقدمة
                        </h3>
                        <p className="text-xs text-white/60 mt-1">
                          الخيارات المذكورة في المنهج للتحكم في التنبيهات المنبثقة، وتحليل
                          البروتوكولات، ومكافحة الانتحال.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Alert Settings */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                          <h4 className="font-extrabold text-sm text-red-400 border-b border-white/10 pb-2">
                            إعدادات التنبيهات (Alert Settings)
                          </h4>

                          <label className="flex items-center justify-between text-xs cursor-pointer">
                            <span>Do not show popup alerts (منع النوافذ المنبثقة)</span>
                            <input
                              type="checkbox"
                              checked={settingsState.doNotShowPopups}
                              onChange={(e) =>
                                setSettingsState({
                                  ...settingsState,
                                  doNotShowPopups: e.target.checked,
                                })
                              }
                              className="size-4 accent-red-600 cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between text-xs cursor-pointer">
                            <span>Enable Trustconnect alerts (تنبيهات الشبكات غير الآمنة)</span>
                            <input
                              type="checkbox"
                              checked={settingsState.enableTrustConnect}
                              onChange={(e) =>
                                setSettingsState({
                                  ...settingsState,
                                  enableTrustConnect: e.target.checked,
                                })
                              }
                              className="size-4 accent-red-600 cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between text-xs cursor-pointer">
                            <span>Turn traffic animation effects on (تأثير حركة المرور)</span>
                            <input
                              type="checkbox"
                              checked={settingsState.trafficAnimation}
                              onChange={(e) =>
                                setSettingsState({
                                  ...settingsState,
                                  trafficAnimation: e.target.checked,
                                })
                              }
                              className="size-4 accent-red-600 cursor-pointer"
                            />
                          </label>

                          <div className="flex items-center justify-between text-xs">
                            <span>معدل ظهور التنبيهات (Alert frequency):</span>
                            <select
                              value={settingsState.alertFrequency}
                              onChange={(e) =>
                                setSettingsState({
                                  ...settingsState,
                                  alertFrequency: e.target.value as
                                    "Low" | "Medium" | "High" | "Very High",
                                })
                              }
                              className="rounded bg-black/50 border border-white/20 px-2 py-1 text-white"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Very High">Very High</option>
                            </select>
                          </div>
                        </div>

                        {/* Advanced Protection Settings */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                          <h4 className="font-extrabold text-sm text-red-400 border-b border-white/10 pb-2">
                            الإعدادات المتقدمة (Advanced Protection)
                          </h4>

                          <label className="flex items-center justify-between text-xs cursor-pointer">
                            <span>Filter IPv6 traffic (فحص حركة IPv6)</span>
                            <input
                              type="checkbox"
                              checked={settingsState.filterIpv6}
                              onChange={(e) =>
                                setSettingsState({ ...settingsState, filterIpv6: e.target.checked })
                              }
                              className="size-4 accent-red-600 cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between text-xs cursor-pointer">
                            <span>Filter loopback traffic (مراقبة 127.0.0.1)</span>
                            <input
                              type="checkbox"
                              checked={settingsState.filterLoopback}
                              onChange={(e) =>
                                setSettingsState({
                                  ...settingsState,
                                  filterLoopback: e.target.checked,
                                })
                              }
                              className="size-4 accent-red-600 cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between text-xs cursor-pointer">
                            <span>Block fragmented IP traffic (حظر الحزم المجزأة)</span>
                            <input
                              type="checkbox"
                              checked={settingsState.blockFragmentedIp}
                              onChange={(e) =>
                                setSettingsState({
                                  ...settingsState,
                                  blockFragmentedIp: e.target.checked,
                                })
                              }
                              className="size-4 accent-red-600 cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between text-xs cursor-pointer">
                            <span>Do protocol analysis (تحليل بروتوكولات الشبكة)</span>
                            <input
                              type="checkbox"
                              checked={settingsState.protocolAnalysis}
                              onChange={(e) =>
                                setSettingsState({
                                  ...settingsState,
                                  protocolAnalysis: e.target.checked,
                                })
                              }
                              className="size-4 accent-red-600 cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between text-xs cursor-pointer">
                            <span>Enable Anti-ARP spoofing (مكافحة انتحال ARP)</span>
                            <input
                              type="checkbox"
                              checked={settingsState.enableAntiArpSpoofing}
                              onChange={(e) =>
                                setSettingsState({
                                  ...settingsState,
                                  enableAntiArpSpoofing: e.target.checked,
                                })
                              }
                              className="size-4 accent-red-600 cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* End of tabs */}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {windowState === "minimized" && (
          <motion.div
            key="comodo-minimized-bar"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="rounded-2xl border border-red-900/50 bg-[#161215]/95 backdrop-blur-md p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-red-600 text-white font-black text-sm shadow-md">
                C
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-white">COMODO Firewall</h4>
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
                    مصغرة في شريط المهام (Minimized)
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  الجدار الناري وفحص المنافذ وحزم TCP/UDP مستمرة في المراقبة بالخلفية.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWindowState("open")}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 transition-colors cursor-pointer"
              >
                <Maximize2 className="size-4" />
                استعادة النافذة (Restore Window)
              </motion.button>
            </div>
          </motion.div>
        )}

        {windowState === "closed" && (
          <motion.div
            key="comodo-closed-card"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="rounded-3xl border border-red-900/30 bg-[#17171d] p-8 text-center shadow-2xl"
          >
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 shadow-lg">
              <Shield className="size-10" />
            </div>
            <h3 className="mt-4 text-xl font-black text-white">تم إغلاق نافذة COMODO Firewall</h3>
            <p className="mt-1 text-xs text-white/60 max-w-md mx-auto">
              تم إغلاق الواجهة الرسومية للجدار الناري. يمكنك إعادة تشغيل المحاكي لتجربة حظر المنافذ
              وقواعد التطبيقات واختبار صد الهجمات.
            </p>
            <div className="mt-6 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setWindowState("open");
                  setIsMaximized(false);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-7 py-3 text-sm font-extrabold text-white shadow-xl shadow-red-600/30 hover:bg-red-500 transition-all cursor-pointer"
              >
                <RotateCcw className="size-4.5" />
                إعادة تشغيل نافذة COMODO (Relaunch Simulator)
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Modal: Add Global Port Rule (Exact Course Dialog) */}
      <AnimatePresence>
        {showAddRuleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="w-full max-w-lg rounded-3xl border border-red-500/50 bg-[#1d1d26] p-6 text-white shadow-2xl"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-extrabold text-base flex items-center gap-2 text-red-400">
                  <Lock className="size-4" />
                  إنشاء قاعدة جدار ناري جديدة (Firewall Rule)
                </h4>
                <button
                  onClick={() => setShowAddRuleModal(false)}
                  className="text-white/40 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddGlobalRule} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block text-white/70 font-bold mb-1">الإجراء (Action):</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="act"
                        checked={newRuleAction === "Block"}
                        onChange={() => setNewRuleAction("Block")}
                        className="accent-red-600"
                      />
                      <span className="text-red-400 font-bold">Block (منع الاتصال)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="act"
                        checked={newRuleAction === "Allow"}
                        onChange={() => setNewRuleAction("Allow")}
                        className="accent-emerald-600"
                      />
                      <span className="text-emerald-400 font-bold">Allow (سماح بالاتصال)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 font-bold mb-1">
                      البروتوكول (Protocol):
                    </label>
                    <select
                      value={newRuleProtocol}
                      onChange={(e) =>
                        setNewRuleProtocol(
                          e.target.value as "TCP" | "UDP" | "TCP or UDP" | "ICMP" | "IP",
                        )
                      }
                      className="w-full rounded-xl border border-white/20 bg-black/50 p-2 text-white outline-none focus:border-red-500"
                    >
                      <option value="TCP or UDP">TCP or UDP (موصى به للمنافذ)</option>
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="ICMP">ICMP</option>
                      <option value="IP">IP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 font-bold mb-1">
                      الاتجاه (Direction):
                    </label>
                    <select
                      value={newRuleDirection}
                      onChange={(e) =>
                        setNewRuleDirection(e.target.value as "In" | "Out" | "In / Out")
                      }
                      className="w-full rounded-xl border border-white/20 bg-black/50 p-2 text-white outline-none focus:border-red-500"
                    >
                      <option value="In">In (الوارد إلى الحاسوب)</option>
                      <option value="Out">Out (الصادر من الحاسوب)</option>
                      <option value="In / Out">In / Out (الوارد والصادر)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">
                    المنفذ المستهدف (Destination Port):
                  </label>
                  <input
                    type="text"
                    value={newRulePort}
                    onChange={(e) => setNewRulePort(e.target.value)}
                    placeholder="مثال: 4444 أو 8080 أو 23"
                    className="w-full rounded-xl border border-white/20 bg-black/50 p-2.5 font-mono text-white outline-none focus:border-red-500"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">
                    وصف القاعدة (Description):
                  </label>
                  <input
                    type="text"
                    value={newRuleDesc}
                    onChange={(e) => setNewRuleDesc(e.target.value)}
                    placeholder="وصف مختصر للوظيفة..."
                    className="w-full rounded-xl border border-white/20 bg-black/50 p-2.5 text-white outline-none focus:border-red-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={newRuleLog}
                    onChange={(e) => setNewRuleLog(e.target.checked)}
                    className="size-4 accent-red-600"
                  />
                  <span className="text-white/70">
                    Log as firewall event if this rule is fired (تسجيل الحدث عند تفعيل القاعدة)
                  </span>
                </label>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddRuleModal(false)}
                    className="rounded-xl px-4 py-2 font-bold text-white/60 hover:bg-white/10"
                  >
                    إلغاء (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-red-600 px-5 py-2 font-extrabold text-white shadow-lg shadow-red-600/30 hover:bg-red-500"
                  >
                    موافق وحفظ القاعدة (OK)
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Curriculum Summary Panel */}
      <div className="mt-8 panel p-6 md:p-8">
        <h4 className="text-lg font-black">ملخص مقرر أمن المعلومات حول الجدار الناري COMODO</h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <strong className="text-foreground block mb-1">
              1. قواعد التطبيقات (Application Rules):
            </strong>
            تحديد البرامج المسموح لها بالاتصال (Allow) مثل المتصفحات، أو حظر البرامج المشبوهة (Block
            Application).
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <strong className="text-foreground block mb-1">
              2. القواعد العامة (Global Rules):
            </strong>
            إغلاق المنافذ غير المستخدمة (Ports) مثل منافذ Telnet والتحكم عن بعد لمنع المخترقين من
            التسلل.
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <strong className="text-foreground block mb-1">
              3. مستويات الحماية (Security Levels):
            </strong>
            Block All لمنع تام في حالات الاشتباه، و Safe Mode للعمل الطبيعي، و Training Mode لتعلم
            السلوك.
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Link
            to="/lessons/$slug"
            params={{ slug: "comodo-firewall" }}
            className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
          >
            الانتقال لدرس الجدار الناري COMODO في المقرر
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
