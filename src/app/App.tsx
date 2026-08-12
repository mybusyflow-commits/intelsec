import type * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Shield, Activity, AlertTriangle, Brain, FileCheck,
  GitBranch, BarChart3, Cpu, X, Check, Play, ArrowRight,
  Terminal, Lock, Menu, TrendingUp, Bell,
  Monitor, Search, CheckCircle, Eye, Zap, Network,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { api } from "../services/api";

// ─── ACCENT COLORS ──────────────────────────────────────────
const ORANGE = "#C0541C";
const GREEN = "#1E9E6B";
const RED = "#CC3B3B";
const AMBER = "#B8882A";
const BLUE_MUTED = "#5B8FD0";

// ─── HOOKS ──────────────────────────────────────────────────

function useInView(ref: React.RefObject<any>, threshold = 0.1) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return inView;
}

function useTextScramble(finalText: string, active: boolean) {
  const [text, setText] = useState("");
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!%><[]{}|";
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const total = finalText.length * 3;
    let raf: number;
    const tick = () => {
      const result = finalText.split("").map((char, i) => {
        if (char === " " || char === "." || char === ",") return char;
        if (i < frame / 2) return char;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join("");
      setText(result);
      frame++;
      if (frame <= total) {
        raf = requestAnimationFrame(tick);
      } else {
        setText(finalText);
      }
    };
    setText(finalText.split("").map(c => (c === " " || c === "." || c === ",") ? c : CHARS[Math.floor(Math.random() * CHARS.length)]).join(""));
    const delay = setTimeout(() => { raf = requestAnimationFrame(tick); }, 50);
    return () => { clearTimeout(delay); cancelAnimationFrame(raf); };
  }, [active, finalText]);
  return text || finalText;
}

// ─── REVEAL WRAPPER ─────────────────────────────────────────

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── DATA ────────────────────────────────────────────────────

const FEATURES = [
  { icon: Brain, name: "AI Threat Intelligence", desc: "Real-time pattern recognition across adversarial ML taxonomies and MITRE ATLAS." },
  { icon: Activity, name: "Real-Time Monitoring", desc: "Continuous telemetry with sub-50ms detection latency across all model endpoints." },
  { icon: Shield, name: "Automated Defense", desc: "Policy-driven response playbooks activate on threat confirmation — zero manual steps." },
  { icon: FileCheck, name: "Security Governance", desc: "Centralized policy management aligned to enterprise risk frameworks and audit trails." },
  { icon: Search, name: "Vulnerability Scanning", desc: "Active model probing for injection, exfiltration, bypass, and inversion vectors." },
  { icon: AlertTriangle, name: "Zero-Day Detection", desc: "Behavioral heuristics catch novel attacks before signature databases are updated." },
  { icon: BarChart3, name: "Behavioral Analytics", desc: "Drift detection across model inputs, outputs, and access patterns over time." },
  { icon: CheckCircle, name: "Compliance Engine", desc: "Automated controls mapping to SOC2, ISO 27001, GDPR, and NIST AI RMF." },
  { icon: GitBranch, name: "Incident Orchestration", desc: "Cross-system routing with SIEM, PagerDuty, and ticketing system integration." },
  { icon: TrendingUp, name: "Risk Quantification", desc: "Financial exposure modeling from threat events to board-level risk reports." },
  { icon: Cpu, name: "AI Model Auditing", desc: "Provenance, lineage, and integrity verification for every model in production." },
];

const THREAT_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}h`,
  blocked: [18, 35, 22, 48, 15, 62, 38, 27, 55, 42, 18, 75, 29, 46, 33, 58, 22, 44, 67, 31, 52, 28, 41, 36][i],
}));

const SCAN_PHASES = [
  { delay: 300, lines: ["[INIT]  Starting adversarial scan engine v3.1.4 ...", "[INIT]  Loading MITRE ATLAS threat model database (12,847 patterns) ...", "[INIT]  Connecting to live threat intelligence feeds ..."] },
  { delay: 1000, lines: ["[RECON] Fingerprinting target endpoint ...", "[RECON] Model architecture identified: GPT-4 class transformer", "[RECON] API surface enumerated: 12 endpoints, 4 unauthenticated"] },
  { delay: 1900, lines: ["[PROBE] Testing prompt injection vectors (847 variants) ...", "[PROBE] Jailbreak pattern matching: 23/847 partial responses detected", "[PROBE] System prompt exfiltration: 2 viable vectors confirmed"] },
  { delay: 3000, lines: ["[BEHAV] Running behavioral drift analysis ...", "[BEHAV] Output consistency score: 0.71 (DEGRADED — expected >0.90)", "[BEHAV] Anomalous token distributions in 4.2% of sampled outputs"] },
  { delay: 3900, lines: ["[VULN]  Data exfiltration risk: HIGH (score 78/100)", "[VULN]  Model inversion attack surface: MEDIUM (score 51/100)", "[VULN]  Adversarial robustness: LOW (score 43/100)"] },
  { delay: 4800, lines: ["[DONE]  Scan complete. 7 vulnerabilities identified.", "[DONE]  Composite risk score: 68 / 100 — ELEVATED", "[DONE]  Full report generated: report_scan_001.pdf"] },
];

const ADD_ONS = [
  { id: "m50", label: "50 Models", desc: "Expand coverage to 50 protected models", price: 1200 },
  { id: "behav", label: "Behavioral Analytics", desc: "Advanced drift and anomaly detection suite", price: 800 },
  { id: "pd", label: "PagerDuty Integration", desc: "Direct on-call incident routing", price: 400 },
  { id: "r90", label: "90-Day Retention", desc: "Extended event and log history", price: 600 },
  { id: "soc2", label: "SOC2 Reporting", desc: "Automated compliance evidence collection", price: 1000 },
  { id: "ps", label: "Priority Support", desc: "4-hour SLA, dedicated customer success", price: 700 },
  { id: "unlimited", label: "Unlimited Models", desc: "No model count ceiling", price: 2000 },
  { id: "ir", label: "Dedicated IR Team", desc: "On-call incident response engineers", price: 2500 },
  { id: "r365", label: "1-Year Retention", desc: "Regulatory-grade event archiving", price: 900 },
];

const LAYER_COVERAGE = [
  { name: "Output Filtering", pct: 99 },
  { name: "API Gateway", pct: 97 },
  { name: "Data Pipeline", pct: 94 },
  { name: "Model Inference", pct: 89 },
  { name: "Access Control", pct: 86 },
];

const MOCK_EVENTS = Array.from({ length: 14 }, (_, i) => ({
  id: `EVT-${8800 + i}`,
  type: ["Prompt Injection", "Data Exfil Probe", "Auth Bypass", "Model Inversion", "Output Poisoning", "Token Flooding"][i % 6],
  source: ["API Gateway", "ML Inference", "Access Control", "Data Pipeline", "Output Filter"][i % 5],
  severity: (["CRITICAL", "HIGH", "HIGH", "MEDIUM", "MEDIUM", "LOW"] as const)[i % 6],
  time: i === 0 ? "0s ago" : `${i * 4}s ago`,
  status: (i < 2 ? "ACTIVE" : i < 5 ? "INVESTIGATING" : "RESOLVED") as string,
}));

const SCAN_HISTORY = [
  { id: "SCN-0044", type: "Full Adversarial", target: "api.company.com/v2/chat", risk: 72, time: "2h ago" },
  { id: "SCN-0043", type: "Injection Probe", target: "ml-api.internal/infer", risk: 45, time: "6h ago" },
  { id: "SCN-0042", type: "Behavioral Audit", target: "gpt4-proxy.company.com", risk: 28, time: "1d ago" },
  { id: "SCN-0041", type: "Full Adversarial", target: "api.company.com/v2/embed", risk: 61, time: "2d ago" },
  { id: "SCN-0040", type: "Auth Bypass Test", target: "secure-ai.company.com", risk: 15, time: "3d ago" },
];

// ─── SEVERITY / STATUS COLORS ────────────────────────────────

function sevColor(s: string) {
  if (s === "CRITICAL") return RED;
  if (s === "HIGH") return ORANGE;
  if (s === "MEDIUM") return AMBER;
  return BLUE_MUTED;
}

function statusColor(s: string) {
  if (s === "ACTIVE") return RED;
  if (s === "INVESTIGATING") return ORANGE;
  return GREEN;
}

// ─── NAV ─────────────────────────────────────────────────────

function Nav({ onDashboard, onSignup, onContact }: {
  onDashboard: () => void;
  onSignup: () => void;
  onContact: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(9,8,10,0.97)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5"
        >
          <div className="w-7 h-7 flex items-center justify-center" style={{ background: ORANGE, borderRadius: "3px" }}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-sm font-bold tracking-[0.15em] text-foreground uppercase">
            Intellirity
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {[["features", "Platform"], ["scanner", "Scanner"], ["pricing", "Pricing"]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
            >
              {label}
            </button>
          ))}
          <button
            onClick={onContact}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
          >
            Contact
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onDashboard}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 border border-transparent hover:border-border"
            style={{ borderRadius: "var(--radius)" }}
          >
            Dashboard
          </button>
          <button
            onClick={onSignup}
            className="text-sm font-medium px-5 py-2 transition-opacity hover:opacity-90"
            style={{ background: ORANGE, color: "#F5EDE0", borderRadius: "var(--radius)" }}
          >
            Start Free Trial
          </button>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-foreground p-2">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden border-t px-6 py-4 flex flex-col gap-2"
            style={{ background: "#0C0B09", borderColor: "rgba(255,255,255,0.07)" }}
          >
            {[["features", "Platform"], ["scanner", "Scanner"], ["pricing", "Pricing"]].map(([id, label]) => (
              <button key={id} onClick={() => go(id)} className="text-sm text-foreground text-left py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {label}
              </button>
            ))}
            <button
              onClick={() => { onSignup(); setMenuOpen(false); }}
              className="text-sm font-medium py-3 text-center mt-2"
              style={{ background: ORANGE, color: "#F5EDE0", borderRadius: "var(--radius)" }}
            >
              Start Free Trial
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── 3D DASHBOARD MOCKUP ─────────────────────────────────────

function DashboardMockup({ tiltX, tiltY }: { tiltX: number; tiltY: number }) {
  return (
    <div
      style={{
        transform: `perspective(1400px) rotateX(${-tiltY * 7}deg) rotateY(${tiltX * 10}deg)`,
        transition: "transform 0.08s ease-out",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Glow behind the mockup */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(192,84,28,0.12) 0%, transparent 70%)`,
          filter: "blur(30px)",
          transform: "translateZ(-20px) scale(1.1)",
        }}
      />
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid rgba(255,255,255,0.13)",
          borderRadius: "10px",
          background: "#0C0B09",
          boxShadow: "0 60px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.09)",
          width: "520px",
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ background: "#141210", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#FFBD2E" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#28CA41" }} />
          </div>
          <div
            className="flex-1 flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-muted-foreground"
            style={{ background: "rgba(255,255,255,0.05)", borderRadius: "4px" }}
          >
            <Lock className="w-3 h-3" style={{ color: GREEN }} />
            <span style={{ fontSize: "11px" }}>intellirity.io/dashboard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: GREEN, animation: "ping 1.5s ease-in-out infinite" }} />
            <span className="font-mono" style={{ color: GREEN, fontSize: "10px" }}>LIVE</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { l: "SECURITY SCORE", v: "94.7", sub: "OPTIMAL", c: GREEN },
              { l: "THREATS BLOCKED", v: "1,247", sub: "LAST 24H", c: ORANGE },
              { l: "MODELS PROTECTED", v: "28", sub: "ACTIVE", c: BLUE_MUTED },
              { l: "COMPLIANCE", v: "98.2%", sub: "SOC2+ISO", c: AMBER },
            ].map((k) => (
              <div key={k.l} className="p-2.5" style={{ background: "#161410", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px" }}>
                <div className="font-mono mb-1.5" style={{ color: "#6E6A62", fontSize: "8px" }}>{k.l}</div>
                <div className="font-display font-bold text-foreground leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px" }}>{k.v}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono" style={{ color: "#6E6A62", fontSize: "8px" }}>{k.sub}</span>
                  <span className="font-mono" style={{ color: k.c, fontSize: "8px" }}>▲</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mini chart */}
          <div className="mb-3 p-3" style={{ background: "#0F0E0C", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono" style={{ color: "#6E6A62", fontSize: "9px" }}>24H THREAT ACTIVITY</span>
              <span className="font-mono" style={{ color: ORANGE, fontSize: "8px" }}>● MONITORING</span>
            </div>
            <svg viewBox="0 0 300 44" style={{ width: "100%", height: "36px" }}>
              {[18, 35, 22, 48, 15, 62, 38, 27, 55, 42, 18, 75, 29, 46, 33, 58, 22, 44, 67, 31, 52, 28, 41, 36, 44].map((h, i) => (
                <rect
                  key={i}
                  x={i * 12}
                  y={44 - h * 0.55}
                  width={9}
                  height={h * 0.55}
                  rx={1.5}
                  fill={h > 55 ? ORANGE : "rgba(192,84,28,0.35)"}
                />
              ))}
            </svg>
          </div>

          {/* Events */}
          <div>
            <div className="font-mono mb-2" style={{ color: "#6E6A62", fontSize: "9px" }}>RECENT SECURITY EVENTS</div>
            {[
              { type: "Prompt Injection", src: "API_GW", sev: "CRITICAL" },
              { type: "Data Exfil Probe", src: "ML_INF", sev: "HIGH" },
              { type: "Auth Bypass Attempt", src: "ACCESS", sev: "HIGH" },
            ].map((ev, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-2.5 py-2 mb-1.5"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "3px" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: ev.sev === "CRITICAL" ? RED : ORANGE }} />
                  <span className="font-mono text-foreground" style={{ fontSize: "9.5px" }}>{ev.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono" style={{ color: "#6E6A62", fontSize: "8.5px" }}>{ev.src}</span>
                  <span
                    className="font-mono px-1.5 py-0.5"
                    style={{
                      background: ev.sev === "CRITICAL" ? "rgba(204,59,59,0.15)" : "rgba(192,84,28,0.15)",
                      color: ev.sev === "CRITICAL" ? RED : ORANGE,
                      fontSize: "8px",
                      borderRadius: "2px",
                    }}
                  >
                    {ev.sev}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HERO ────────────────────────────────────────────────────

function HeroSection({ onDashboard, onSignup }: { onDashboard: () => void; onSignup: () => void }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [scramble, setScramble] = useState(false);
  const line1 = useTextScramble("INTELLIGENT", scramble);
  const line2 = useTextScramble("THREATS DEMAND", scramble);
  const line3 = useTextScramble("INTELLIGENT SECURITY.", scramble);

  useEffect(() => {
    const t = setTimeout(() => setScramble(true), 300);
    return () => clearTimeout(t);
  }, []);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: (e.clientX - r.left - r.width / 2) / (r.width / 2),
      y: (e.clientY - r.top - r.height / 2) / (r.height / 2),
    });
  }, []);

  return (
    <div
      onMouseMove={onMove}
      className="min-h-screen relative flex items-center overflow-hidden"
      style={{ paddingTop: "64px" }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          background: "radial-gradient(ellipse 70% 55% at 72% 48%, rgba(192,84,28,0.07) 0%, transparent 65%)",
        }}
      />
      {/* Top-left subtle accent */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0, left: 0, width: "40%", height: "40%",
          background: "radial-gradient(ellipse at top left, rgba(192,84,28,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT */}
          <div>
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 border border-border"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: GREEN, animation: "ping 2s ease-in-out infinite" }} />
              <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                Live · Production Ready · 99.97% Uptime
              </span>
            </motion.div>

            {/* Scramble headline */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="font-display leading-none mb-6"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(52px, 7vw, 88px)", fontWeight: 800, letterSpacing: "-0.01em" }}
            >
              <span className="block text-foreground">{line1}</span>
              <span className="block text-foreground">{line2}</span>
              <span className="block" style={{ color: ORANGE }}>{line3}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg"
            >
              Intellirity monitors, analyzes, and neutralizes AI threats in real time —
              from prompt injection to model exfiltration. Built for enterprises deploying AI at scale.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <button
                onClick={onSignup}
                className="flex items-center gap-2 px-6 py-3 font-medium text-sm transition-opacity hover:opacity-90"
                style={{ background: ORANGE, color: "#F5EDE0", borderRadius: "var(--radius)" }}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onDashboard}
                className="flex items-center gap-2 px-6 py-3 font-medium text-sm border border-border hover:bg-card transition-colors"
                style={{ borderRadius: "var(--radius)" }}
              >
                <Play className="w-4 h-4" />
                View Live Dashboard
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="flex gap-8 pt-8 border-t border-border"
            >
              {[
                { val: "2.4B+", label: "Threats Blocked" },
                { val: "340+", label: "Enterprise Clients" },
                { val: "<50ms", label: "Detection Latency" },
              ].map((s) => (
                <div key={s.val}>
                  <div className="font-display text-2xl font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {s.val}
                  </div>
                  <div className="text-xs text-muted-foreground tracking-widest uppercase mt-0.5 font-mono">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: 3D Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="hidden lg:flex justify-end items-center relative"
          >
            <DashboardMockup tiltX={tilt.x} tiltY={tilt.y} />
          </motion.div>
        </div>
      </div>

      {/* Fade out */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(transparent, #09080A)" }}
      />

      <style>{`
        @keyframes ping {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ─── FEATURES ────────────────────────────────────────────────

function FeaturesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerIn = useInView(headerRef);
  const gridIn = useInView(gridRef);

  return (
    <section id="features" className="py-28 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div
          ref={headerRef}
          className="mb-16 max-w-2xl"
          style={{
            opacity: headerIn ? 1 : 0,
            transform: headerIn ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div className="inline-flex items-center gap-3 mb-5 text-xs font-mono tracking-widest uppercase" style={{ color: ORANGE }}>
            <div className="w-5 h-px" style={{ background: ORANGE }} />
            Platform Capabilities
          </div>
          <h2 className="font-display text-5xl font-bold text-foreground mb-4 leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Every layer of your AI stack, defended.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            From model inference to API gateway, Intellirity instruments every point of exposure across your production AI infrastructure.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.name} feature={f} index={i} inView={gridIn} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index, inView }: { feature: typeof FEATURES[0]; index: number; inView: boolean }) {
  const [hov, setHov] = useState(false);
  const Icon = feature.icon;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="p-6 relative cursor-default"
      style={{
        background: hov ? "#141210" : "#0F0E0C",
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(12px)",
        transition: `background 0.2s ease, opacity 0.5s ease ${index * 0.04}s, transform 0.5s ease ${index * 0.04}s`,
      }}
    >
      {hov && (
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 0 1px rgba(192,84,28,0.3)` }} />
      )}
      <div
        className="w-9 h-9 flex items-center justify-center mb-4"
        style={{ background: hov ? "rgba(192,84,28,0.12)" : "rgba(255,255,255,0.05)", borderRadius: "3px", transition: "background 0.2s" }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: hov ? ORANGE : "#6E6A62", transition: "color 0.2s" }} />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1.5">{feature.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
      {hov && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${ORANGE}, transparent)` }} />
      )}
    </div>
  );
}

// ─── SCANNER DEMO ─────────────────────────────────────────────

function ScannerDemo() {
  const [url, setUrl] = useState("https://api.openai.com/v1/chat/completions");
  const [scanning, setScanning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);

  const runScan = useCallback(() => {
    if (scanning) return;
    setScanning(true);
    setDone(false);
    setLines([]);
    setProgress(0);

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    SCAN_PHASES.forEach((phase, pi) => {
      const t = setTimeout(() => {
        setProgress(Math.round(((pi + 1) / SCAN_PHASES.length) * 100));
        phase.lines.forEach((line, li) => {
          const t2 = setTimeout(() => {
            setLines(prev => [...prev, line]);
            requestAnimationFrame(() => {
              if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
            });
          }, li * 220);
          timeouts.push(t2);
        });
        if (pi === SCAN_PHASES.length - 1) {
          const t3 = setTimeout(() => { setScanning(false); setDone(true); }, phase.lines.length * 220 + 100);
          timeouts.push(t3);
        }
      }, phase.delay);
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [scanning]);

  const lineColor = (l: string) => {
    if (l.includes("[INIT]")) return "#6E9EE0";
    if (l.includes("[RECON]")) return AMBER;
    if (l.includes("[PROBE]")) return "#CC8844";
    if (l.includes("[BEHAV]")) return "#9B7EC8";
    if (l.includes("[VULN]")) return RED;
    if (l.includes("[DONE]")) return GREEN;
    return "#DDD8CF";
  };

  return (
    <section id="scanner" className="py-28 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <Reveal className="mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-3 mb-5 text-xs font-mono tracking-widest uppercase" style={{ color: ORANGE }}>
            <div className="w-5 h-px" style={{ background: ORANGE }} />
            Live Demo
          </div>
          <h2 className="font-display text-5xl font-bold text-foreground mb-4 leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Scan your AI endpoint. Now.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Run an adversarial scan against any public API endpoint or model ID. See exactly what Intellirity finds — in under 6 seconds.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="overflow-hidden"
            style={{ background: "#09080A", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "6px", maxWidth: "820px" }}
          >
            {/* Terminal chrome */}
            <div
              className="flex items-center gap-3 px-5 py-3.5 border-b"
              style={{ background: "#111009", borderColor: "rgba(255,255,255,0.07)" }}
            >
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#FFBD2E" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#28CA41" }} />
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">intellirity — adversarial-scanner</span>
              </div>
              <div className="ml-auto">
                {scanning && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: ORANGE, animation: "ping 1s ease-in-out infinite" }} />
                    <span className="text-xs font-mono" style={{ color: ORANGE }}>SCANNING</span>
                  </div>
                )}
                {done && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: GREEN }} />
                    <span className="text-xs font-mono" style={{ color: GREEN }}>COMPLETE</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input row */}
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-1.5 mb-3 text-xs font-mono">
                <span style={{ color: ORANGE }}>intellirity</span>
                <span className="text-muted-foreground">~$</span>
                <span className="text-muted-foreground">scan --adversarial --full-report</span>
              </div>
              <div className="flex gap-3">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={scanning}
                  placeholder="https://api.example.com/v1/..."
                  className="flex-1 bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none border border-border px-3 py-2.5 focus:border-primary transition-colors"
                  style={{ borderRadius: "var(--radius)" }}
                />
                <button
                  onClick={runScan}
                  disabled={scanning}
                  className="px-6 py-2.5 font-medium text-sm transition-all"
                  style={{
                    background: scanning ? "rgba(192,84,28,0.25)" : ORANGE,
                    color: "#F5EDE0",
                    borderRadius: "var(--radius)",
                    cursor: scanning ? "not-allowed" : "pointer",
                  }}
                >
                  {scanning ? "Scanning..." : "Run Scan"}
                </button>
              </div>
            </div>

            {/* Progress */}
            {(scanning || done) && (
              <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-mono text-muted-foreground">Scan Progress</span>
                  <span className="text-xs font-mono font-bold" style={{ color: ORANGE }}>{progress}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${ORANGE}, #E07040)` }}
                  />
                </div>
              </div>
            )}

            {/* Terminal output */}
            <div
              ref={termRef}
              className="px-5 py-4 font-mono overflow-y-auto"
              style={{ minHeight: "200px", maxHeight: "300px", fontSize: "12px" }}
            >
              {lines.length === 0 && !scanning ? (
                <div className="text-muted-foreground">
                  <span style={{ color: ORANGE }}>→</span> Enter an endpoint URL above and click Run Scan to begin adversarial assessment.
                </div>
              ) : (
                lines.map((line, i) => (
                  <div key={i} className="flex gap-3 mb-1" style={{ color: lineColor(line) }}>
                    <span className="shrink-0 text-muted-foreground" style={{ fontSize: "10px", marginTop: "2px", minWidth: "24px" }}>
                      {String(i + 1).padStart(3, "0")}
                    </span>
                    <span>{line}</span>
                  </div>
                ))
              )}
              {scanning && (
                <div className="flex gap-3 mt-1">
                  <span className="shrink-0 text-muted-foreground" style={{ fontSize: "10px", marginTop: "2px", minWidth: "24px" }}>
                    {String(lines.length + 1).padStart(3, "0")}
                  </span>
                  <span className="text-foreground" style={{ animation: "blink 0.8s step-end infinite" }}>█</span>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </section>
  );
}

// ─── PRICING ─────────────────────────────────────────────────

function PricingSection({ onSignup, onBuilder }: { onSignup: () => void; onBuilder: () => void }) {
  const [billing, setBilling] = useState<"mo" | "yr">("mo");

  const plans = [
    {
      name: "Starter",
      price: billing === "mo" ? "₹2,449" : "₹1,959",
      desc: "For teams beginning their AI security journey.",
      cta: "Start Free Trial",
      action: onSignup,
      featured: false,
      features: [
        "Up to 5 models protected",
        "Real-time threat monitoring",
        "Basic vulnerability scanning",
        "Email + webhook alerts",
        "7-day event retention",
        "Community support",
      ],
    },
    {
      name: "Scale",
      price: billing === "mo" ? "₹9,999" : "₹7,999",
      desc: "For teams running production AI at scale.",
      cta: "Start Free Trial",
      action: onSignup,
      featured: true,
      features: [
        "Up to 20 models protected",
        "Behavioral analytics suite",
        "Automated incident response",
        "PagerDuty + Slack integration",
        "30-day event retention",
        "SOC2 compliance reports",
        "Priority support (8h SLA)",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For organizations with complex AI security requirements.",
      cta: "Configure Plan",
      action: onBuilder,
      featured: false,
      features: [
        "Unlimited models",
        "Dedicated IR team",
        "Custom threat intel feeds",
        "1-year event retention",
        "On-premise deployment",
        "Contractual SLA guarantees",
        "Dedicated account manager",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-28 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <Reveal className="mb-14 text-center">
          <div className="inline-flex items-center gap-3 mb-5 text-xs font-mono tracking-widest uppercase" style={{ color: ORANGE }}>
            <div className="w-5 h-px" style={{ background: ORANGE }} />
            Pricing
            <div className="w-5 h-px" style={{ background: ORANGE }} />
          </div>
          <h2 className="font-display text-5xl font-bold text-foreground mb-4 leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Transparent pricing. No surprises.
          </h2>
          <p className="text-muted-foreground mb-7 max-w-md mx-auto">
            Start with what you need. Add capabilities as your AI footprint grows.
          </p>
          <div className="inline-flex items-center p-1 border border-border" style={{ borderRadius: "var(--radius)" }}>
            {[["mo", "Monthly"], ["yr", "Annual (−20%)"]].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setBilling(k as "mo" | "yr")}
                className="text-sm px-4 py-1.5 font-medium transition-all"
                style={{
                  background: billing === k ? ORANGE : "transparent",
                  color: billing === k ? "#F5EDE0" : "#6E6A62",
                  borderRadius: "var(--radius)",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              <PricingCard plan={plan} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan }: { plan: any }) {
  return (
    <div
      className="h-full flex flex-col p-7 relative"
      style={{
        background: plan.featured ? "#141210" : "#0F0E0C",
        border: `1px solid ${plan.featured ? "rgba(192,84,28,0.45)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "var(--radius)",
      }}
    >
      {plan.featured && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: `inset 0 1px 0 rgba(192,84,28,0.25), 0 0 30px rgba(192,84,28,0.06)` }}
          />
          <div
            className="absolute -top-3 left-6 px-3 py-0.5 text-xs font-mono tracking-wider uppercase"
            style={{ background: ORANGE, color: "#F5EDE0", borderRadius: "var(--radius)" }}
          >
            Most Popular
          </div>
        </>
      )}

      <div className="mb-7">
        <h3 className="font-display text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {plan.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-5">{plan.desc}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "42px", lineHeight: 1 }}>
            {plan.price}
          </span>
          {plan.price !== "Custom" && (
            <span className="text-sm text-muted-foreground">/mo</span>
          )}
        </div>
      </div>

      <div className="space-y-2.5 mb-8 flex-1">
        {plan.features.map((f: string) => (
          <div key={f} className="flex items-start gap-2.5">
            <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />
            <span className="text-sm text-muted-foreground leading-snug">{f}</span>
          </div>
        ))}
      </div>

      <button
        onClick={plan.action}
        className="w-full py-3 text-sm font-medium transition-all"
        style={{
          background: plan.featured ? ORANGE : "transparent",
          color: plan.featured ? "#F5EDE0" : "#DDD8CF",
          border: plan.featured ? "none" : "1px solid rgba(255,255,255,0.14)",
          borderRadius: "var(--radius)",
        }}
        onMouseEnter={(e) => {
          if (!plan.featured) (e.currentTarget as HTMLButtonElement).style.borderColor = `rgba(192,84,28,0.5)`;
        }}
        onMouseLeave={(e) => {
          if (!plan.featured) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.14)";
        }}
      >
        {plan.cta}
      </button>
    </div>
  );
}

// ─── PLAN BUILDER MODAL ───────────────────────────────────────

function PlanBuilderModal({ onClose, onSignup }: { onClose: () => void; onSignup: () => void }) {
  const BASE = 2449;
  const [sel, setSel] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSel(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const total = BASE + ADD_ONS.filter(a => sel.has(a.id)).reduce((s, a) => s + a.price, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden"
        style={{ background: "#0F0E0C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", maxHeight: "88vh" }}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Configure Enterprise Plan
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Base: Starter (₹{BASE.toLocaleString()}/mo). Toggle add-ons below.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-2" style={{ maxHeight: "calc(88vh - 160px)" }}>
          {ADD_ONS.map((a) => (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              className="w-full flex items-center justify-between p-4 text-left transition-all"
              style={{
                background: sel.has(a.id) ? "rgba(192,84,28,0.07)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${sel.has(a.id) ? "rgba(192,84,28,0.38)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "var(--radius)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 flex items-center justify-center border transition-all shrink-0"
                  style={{
                    background: sel.has(a.id) ? ORANGE : "transparent",
                    borderColor: sel.has(a.id) ? ORANGE : "rgba(255,255,255,0.2)",
                    borderRadius: "3px",
                  }}
                >
                  {sel.has(a.id) && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{a.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
                </div>
              </div>
              <span className="text-sm font-mono font-bold ml-4 shrink-0" style={{ color: ORANGE }}>
                +₹{a.price.toLocaleString()}/mo
              </span>
            </button>
          ))}
        </div>

        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "#0A0908" }}
        >
          <div>
            <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-0.5">Total / Month</div>
            <div className="font-display text-3xl font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              ₹{total.toLocaleString()}
            </div>
          </div>
          <button
            onClick={onSignup}
            className="px-6 py-2.5 text-sm font-medium"
            style={{ background: ORANGE, color: "#F5EDE0", borderRadius: "var(--radius)" }}
          >
            Continue to Sign Up →
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── VIDEO SECTION ────────────────────────────────────────────

function VideoSection() {
  return (
    <section className="py-28 px-6 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-5 text-xs font-mono tracking-widest uppercase" style={{ color: ORANGE }}>
            <div className="w-5 h-px" style={{ background: ORANGE }} />
            Product Overview
          </div>
          <h2 className="font-display text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            See Intellirity in action.
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            A 3-minute walkthrough of adversarial threat detection across a live production AI environment.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="relative rounded-lg overflow-hidden cursor-pointer group"
            style={{ background: "#0F0E0C", border: "1px solid rgba(255,255,255,0.08)", aspectRatio: "16/9" }}
          >
            {/* Grid texture */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(rgba(192,84,28,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(192,84,28,0.04) 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }}
            />

            {/* Fake waveform decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-20 opacity-20">
              <svg viewBox="0 0 800 80" preserveAspectRatio="none" className="w-full h-full">
                {Array.from({ length: 60 }, (_, i) => (
                  <rect
                    key={i}
                    x={i * 13.5}
                    y={80 - Math.abs(Math.sin(i * 0.45) * 60 + Math.cos(i * 0.3) * 20)}
                    width={9}
                    height={Math.abs(Math.sin(i * 0.45) * 60 + Math.cos(i * 0.3) * 20)}
                    fill={ORANGE}
                    rx={2}
                    opacity={0.5 + Math.sin(i * 0.5) * 0.3}
                  />
                ))}
              </svg>
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: "-20px",
                    background: ORANGE,
                    opacity: 0.12,
                    animation: "ripple1 2s ease-in-out infinite",
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: "-36px",
                    background: ORANGE,
                    opacity: 0.07,
                    animation: "ripple1 2s ease-in-out infinite 0.5s",
                  }}
                />
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 relative"
                  style={{ background: ORANGE }}
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <span className="text-xs font-mono text-muted-foreground">Product walkthrough · 3:12</span>
            </div>

            {/* Top label */}
            <div className="absolute top-5 left-5">
              <div className="flex items-center gap-2 px-3 py-1.5 border border-border" style={{ background: "rgba(9,8,10,0.7)", borderRadius: "var(--radius)", backdropFilter: "blur(8px)" }}>
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">Intellirity Platform Demo</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      <style>{`
        @keyframes ripple1 {
          0%, 100% { transform: scale(1); opacity: 0.12; }
          50% { transform: scale(1.15); opacity: 0.06; }
        }
      `}</style>
    </section>
  );
}

// ─── CTA BANNER ───────────────────────────────────────────────

function CTASection({ onDashboard, onSignup }: { onDashboard: () => void; onSignup: () => void }) {
  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div
            className="rounded-lg p-12 md:p-16 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1A0E08 0%, #120C08 60%, #0A0806 100%)",
              border: "1px solid rgba(192,84,28,0.28)",
            }}
          >
            {/* Corner accent glows */}
            <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none" style={{ background: "radial-gradient(circle at top left, rgba(192,84,28,0.14) 0%, transparent 60%)" }} />
            <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none" style={{ background: "radial-gradient(circle at bottom right, rgba(192,84,28,0.12) 0%, transparent 60%)" }} />

            {/* Diagonal texture lines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(192,84,28,0.03) 40px, rgba(192,84,28,0.03) 41px)",
              }}
            />

            <div className="relative">
              <div className="inline-flex items-center gap-3 mb-5 text-xs font-mono tracking-widest uppercase" style={{ color: ORANGE }}>
                <div className="w-5 h-px" style={{ background: ORANGE }} />
                Get Started Today
                <div className="w-5 h-px" style={{ background: ORANGE }} />
              </div>
              <h2 className="font-display font-bold text-foreground mb-4 leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(40px, 5vw, 60px)" }}>
                Your AI stack is already a target.
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                Start your free 14-day trial. No credit card required. Full platform access, all features, from day one.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={onSignup}
                  className="flex items-center gap-2 px-8 py-3.5 font-medium text-sm transition-opacity hover:opacity-90"
                  style={{ background: ORANGE, color: "#F5EDE0", borderRadius: "var(--radius)" }}
                >
                  Start Free Trial — 14 Days
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onDashboard}
                  className="flex items-center gap-2 px-8 py-3.5 font-medium text-sm border transition-colors hover:border-primary"
                  style={{ borderColor: "rgba(255,255,255,0.18)", color: "#DDD8CF", borderRadius: "var(--radius)" }}
                >
                  <Monitor className="w-4 h-4" />
                  Launch Platform
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────

function Footer({ onSignup, onContact }: { onSignup: () => void; onContact: () => void }) {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const cols = [
    {
      title: "Product",
      links: [["features", "Platform Capabilities"], ["scanner", "Adversarial Scanner"], ["pricing", "Pricing"], [null, "Changelog"]],
    },
    {
      title: "Security",
      links: [[null, "Security Model"], [null, "Trust Center"], [null, "Vulnerability Policy"], [null, "Pen Testing"]],
    },
    {
      title: "Company",
      links: [[null, "About"], [null, "Blog"], [null, "Careers"], ["contact", "Contact Us"]],
    },
    {
      title: "Legal",
      links: [[null, "Privacy Policy"], [null, "Terms of Service"], [null, "DPA"], [null, "Cookie Policy"]],
    },
  ];

  return (
    <footer className="border-t border-border px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 flex items-center justify-center" style={{ background: ORANGE, borderRadius: "3px" }}>
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-sm font-bold tracking-[0.15em] text-foreground uppercase">Intellirity</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px] mb-6">
              AI security infrastructure for enterprises deploying language models and AI agents at scale.
            </p>
            <div className="flex flex-wrap gap-2">
              {["SOC2", "ISO 27001", "GDPR"].map((b) => (
                <span
                  key={b}
                  className="text-xs font-mono text-muted-foreground border border-border px-2.5 py-1"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">{col.title}</h4>
              <div className="space-y-2.5">
                {col.links.map(([id, label]) => (
                  <button
                    key={label}
                    onClick={() => {
                      if (id === "contact") onContact();
                      else if (id) go(id as string);
                    }}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border"
        >
          <p className="text-xs font-mono text-muted-foreground">© 2025 Intellirity, Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: GREEN }} />
            <p className="text-xs font-mono text-muted-foreground">
              System status: <span style={{ color: GREEN }}>All systems operational</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── SIGNUP MODAL ─────────────────────────────────────────────

function SignupModal({ onClose, onDashboard }: { onClose: () => void; onDashboard: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => { e.preventDefault(); setDone(true); };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden"
        style={{ background: "#0F0E0C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 flex items-center justify-center" style={{ background: ORANGE, borderRadius: "3px" }}>
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Start Free Trial
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-12 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(30,158,107,0.13)" }}
            >
              <CheckCircle className="w-7 h-7" style={{ color: GREEN }} />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Organization Created
            </h3>
            <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
              Check your email for setup instructions. Your 14-day trial starts now — full platform access.
            </p>
            <button
              onClick={() => { onClose(); onDashboard(); }}
              className="px-7 py-2.5 text-sm font-medium"
              style={{ background: ORANGE, color: "#F5EDE0", borderRadius: "var(--radius)" }}
            >
              Open Dashboard →
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 py-6 space-y-4">
            {[
              { k: "name", l: "Full Name", p: "Jane Smith", t: "text" },
              { k: "email", l: "Work Email", p: "jane@company.com", t: "email" },
              { k: "company", l: "Company", p: "Acme Corp", t: "text" },
            ].map(({ k, l, p, t }) => (
              <div key={k}>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5 tracking-widest uppercase">{l}</label>
                <input
                  type={t}
                  placeholder={p}
                  value={(form as any)[k]}
                  onChange={(e) => setForm(prev => ({ ...prev, [k]: e.target.value }))}
                  required
                  className="w-full bg-transparent border border-border text-foreground placeholder:text-muted-foreground px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  style={{ borderRadius: "var(--radius)" }}
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full py-3 text-sm font-medium mt-1"
              style={{ background: ORANGE, color: "#F5EDE0", borderRadius: "var(--radius)" }}
            >
              Create Organization →
            </button>
            <p className="text-xs text-muted-foreground text-center">14-day free trial · No credit card · Cancel anytime</p>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ─── CONTACT MODAL ────────────────────────────────────────────

function ContactModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [done, setDone] = useState(false);
  const submit = (e: React.FormEvent) => { e.preventDefault(); setDone(true); };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden"
        style={{ background: "#0F0E0C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <span className="font-display text-lg font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Contact Intellirity
          </span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(30,158,107,0.13)" }}>
              <CheckCircle className="w-7 h-7" style={{ color: GREEN }} />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Message Received
            </h3>
            <p className="text-sm text-muted-foreground">Ticket created. We respond within 4 business hours.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 py-6 space-y-4">
            {[
              { k: "name", l: "Name", p: "Your name", t: "text" },
              { k: "email", l: "Email", p: "you@company.com", t: "email" },
              { k: "subject", l: "Subject", p: "How can we help?", t: "text" },
            ].map(({ k, l, p, t }) => (
              <div key={k}>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5 tracking-widest uppercase">{l}</label>
                <input
                  type={t}
                  placeholder={p}
                  value={(form as any)[k]}
                  onChange={(e) => setForm(prev => ({ ...prev, [k]: e.target.value }))}
                  required
                  className="w-full bg-transparent border border-border text-foreground placeholder:text-muted-foreground px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  style={{ borderRadius: "var(--radius)" }}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 tracking-widest uppercase">Message</label>
              <textarea
                placeholder="Describe your question or issue in detail..."
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                required
                className="w-full bg-transparent border border-border text-foreground placeholder:text-muted-foreground px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 text-sm font-medium"
              style={{ background: ORANGE, color: "#F5EDE0", borderRadius: "var(--radius)" }}
            >
              Send Message →
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ─── DASHBOARD VIEW ───────────────────────────────────────────

function DashboardView({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"overview" | "scans" | "monitoring">("overview");
  const [liveEvents, setLiveEvents] = useState<typeof MOCK_EVENTS>([]);
  const [score, setScore] = useState(94.7);
  const [stats, setStats] = useState({ total_scans: 0, active_threats: 0, resolved_threats: 0, average_risk_score: 0, threats_high: 0, security_score: 0, models_monitored: 0, compliance_score: 0 });
  const [modules, setModules] = useState<typeof FEATURES>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    const [sum, thr, mod] = await Promise.all([
      api.getStats().catch(() => null),
      api.getThreats("active").catch(() => []),
      api.getModules().catch(() => []),
    ]);
    if (sum) setStats(sum);
    if (thr) setLiveEvents(thr.slice(0, 14).map((t, i) => ({
      id: t.id,
      type: t.threat_type,
      source: t.source,
      severity: t.severity.toUpperCase() as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      time: i === 0 ? "0s ago" : `${i * 4}s ago`,
      status: t.is_resolved ? "RESOLVED" : "ACTIVE",
    })));
    if (mod) setModules(mod.slice(0, 10).map((m, i) => ({
      icon: [Brain, Activity, Shield, Search, AlertTriangle, BarChart3, CheckCircle, GitBranch, TrendingUp, Cpu][i % 10],
      name: m.name,
      desc: m.description,
    })));
    if (sum) setScore(sum.active_threats === 0 ? 97 : Math.max(78, Math.round(97 - sum.threats_high * 2.5 - Math.max(0, sum.active_threats - 50) * 0.4)));
    setLastRefresh(new Date());
  }, []);

  useEffect(() => { loadData(); const id = setInterval(loadData, 5000); return () => clearInterval(id); }, [loadData]);

  useEffect(() => {
    if (tab !== "monitoring") return;
    const iv = setInterval(() => {
      const types = ["Prompt Injection", "Data Exfil Probe", "Auth Bypass", "Model Inversion", "Output Poisoning", "Token Flooding"];
      const sources = ["API Gateway", "ML Inference", "Access Control", "Data Pipeline"];
      const sevs = ["CRITICAL", "HIGH", "HIGH", "MEDIUM", "MEDIUM", "LOW"] as const;
      const newEv = {
        id: `EVT-${8700 + Math.floor(Math.random() * 200)}`,
        type: types[Math.floor(Math.random() * types.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        severity: sevs[Math.floor(Math.random() * sevs.length)],
        time: "0s ago",
        status: "ACTIVE",
      };
      setLiveEvents(prev => {
        const updated = [newEv, ...prev.slice(0, 39)].map((e, i) => i > 5 ? { ...e, status: "RESOLVED" } : e);
        return updated;
      });
      setScore(prev => Math.max(88, Math.min(99, prev + (Math.random() - 0.52) * 1.5)));
    }, 5000);
    return () => clearInterval(iv);
  }, [tab]);

  const tabs = [
    { id: "overview", label: "Overview", Icon: Monitor },
    { id: "scans", label: "Scan History", Icon: Search },
    { id: "monitoring", label: "Live Monitor", Icon: Activity },
  ] as const;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <div
        className="w-52 shrink-0 flex flex-col h-screen sticky top-0 border-r"
        style={{ background: "#0C0B09", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2.5 px-5 h-14 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="w-6 h-6 flex items-center justify-center" style={{ background: ORANGE, borderRadius: "3px" }}>
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display text-xs font-bold tracking-[0.15em] text-foreground uppercase">Intellirity</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-all"
              style={{
                background: tab === id ? "rgba(192,84,28,0.09)" : "transparent",
                color: tab === id ? ORANGE : "#6E6A62",
                borderRadius: "var(--radius)",
                borderLeft: `2px solid ${tab === id ? ORANGE : "transparent"}`,
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <button
            onClick={onBack}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Back to Site
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Topbar */}
        <div
          className="h-14 flex items-center justify-between px-6 border-b sticky top-0 z-10"
          style={{ background: "rgba(9,8,10,0.96)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}
        >
          <h1 className="font-display text-xl font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {tab === "overview" ? "Security Overview" : tab === "scans" ? "Scan History" : "Real-Time Monitor"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: GREEN }} />
              <span className="text-xs font-mono text-muted-foreground">All systems operational</span>
            </div>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: RED }} />
            </button>
          </div>
        </div>

        <div className="p-6 max-w-screen-xl">
          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div className="space-y-5">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: "Security Score", value: score.toFixed(1), unit: "/100", sub: "Optimal range", color: GREEN, Icon: Shield },
                  { label: "Threats Blocked", value: stats.resolved_threats.toLocaleString(), unit: "", sub: "All time blocked", color: ORANGE, Icon: AlertTriangle },
                  { label: "Models Protected", value: stats.models_monitored.toLocaleString(), unit: "", sub: "Active endpoints", color: BLUE_MUTED, Icon: Cpu },
                  { label: "Compliance Score", value: stats.compliance_score.toFixed(1), unit: "%", sub: "SOC2 · ISO 27001", color: AMBER, Icon: FileCheck },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="p-5"
                    style={{ background: "#100F0D", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "var(--radius)" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">{kpi.label}</span>
                      <kpi.Icon className="w-4 h-4" style={{ color: kpi.color }} />
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-display font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "34px", lineHeight: 1 }}>
                        {kpi.value}
                      </span>
                      <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{kpi.sub}</span>
                  </div>
                ))}
              </div>

              {/* Chart + Layer coverage */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div
                  className="xl:col-span-2 p-5"
                  style={{ background: "#100F0D", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "var(--radius)" }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-foreground">24-Hour Threat Activity</h3>
                    <span className="text-xs font-mono text-muted-foreground">Threats blocked / hour</span>
                  </div>
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={THREAT_DATA} barCategoryGap="28%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#6E6A62" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#6E6A62" }} tickLine={false} axisLine={false} width={28} />
                      <Tooltip
                        contentStyle={{ background: "#1A1816", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px" }}
                        itemStyle={{ color: "#DDD8CF", fontSize: "12px" }}
                        labelStyle={{ color: "#6E6A62", fontSize: "11px" }}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      />
                      <Bar dataKey="blocked" fill={ORANGE} radius={[2, 2, 0, 0]} opacity={0.85} name="Blocked" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div
                  className="p-5"
                  style={{ background: "#100F0D", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "var(--radius)" }}
                >
                  <h3 className="text-sm font-semibold text-foreground mb-5">Layer Coverage</h3>
                  <div className="space-y-4">
                    {LAYER_COVERAGE.map((l) => (
                      <div key={l.name}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground">{l.name}</span>
                          <span className="text-xs font-mono text-foreground">{l.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${l.pct}%`,
                              background: l.pct > 95 ? GREEN : l.pct > 85 ? ORANGE : RED,
                              transition: "width 1.2s ease",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Score gauge */}
                  <div className="mt-6 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    <h4 className="text-xs font-mono text-muted-foreground mb-4 tracking-widest uppercase">Overall Score</h4>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                          <circle
                            cx="50" cy="50" r="40"
                            fill="none"
                            stroke={score > 90 ? GREEN : ORANGE}
                            strokeWidth="10"
                            strokeDasharray={`${(score / 100) * 251} 251`}
                            strokeLinecap="round"
                            style={{ transition: "stroke-dasharray 0.8s ease" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-display text-sm font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                            {score.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { l: "Threat Response", v: 96 },
                          { l: "Model Integrity", v: 91 },
                          { l: "Access Security", v: 88 },
                        ].map((m) => (
                          <div key={m.l} className="flex gap-2 items-center">
                            <span className="text-xs text-muted-foreground" style={{ minWidth: "100px" }}>{m.l}</span>
                            <span className="text-xs font-mono text-foreground">{m.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Events table */}
              <div
                className="p-5"
                style={{ background: "#100F0D", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "var(--radius)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-foreground">Recent Security Events</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: GREEN, animation: "ping 2s ease-in-out infinite" }} />
                    <span className="text-xs font-mono text-muted-foreground">Live</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                        {["Event ID", "Type", "Source", "Severity", "Time", "Status"].map((h) => (
                          <th key={h} className="pb-3 pr-5 text-left text-xs font-mono text-muted-foreground tracking-widest uppercase font-normal">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(liveEvents.length ? liveEvents : MOCK_EVENTS).slice(0, 8).map((ev) => (
                        <tr key={ev.id} className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          <td className="py-3 pr-5 font-mono text-xs text-muted-foreground">{ev.id}</td>
                          <td className="py-3 pr-5 text-xs text-foreground">{ev.type}</td>
                          <td className="py-3 pr-5 text-xs text-muted-foreground">{ev.source}</td>
                          <td className="py-3 pr-5">
                            <span
                              className="text-xs font-mono px-2 py-0.5"
                              style={{ background: `${sevColor(ev.severity)}1A`, color: sevColor(ev.severity), borderRadius: "var(--radius)" }}
                            >
                              {ev.severity}
                            </span>
                          </td>
                          <td className="py-3 pr-5 text-xs font-mono text-muted-foreground">{ev.time}</td>
                          <td className="py-3">
                            <span
                              className="text-xs font-mono px-2 py-0.5"
                              style={{ background: `${statusColor(ev.status)}1A`, color: statusColor(ev.status), borderRadius: "var(--radius)" }}
                            >
                              {ev.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCANS TAB */}
          {tab === "scans" && (
            <div
              className="p-5"
              style={{ background: "#100F0D", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "var(--radius)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-foreground">Scan History</h3>
                <button
                  className="flex items-center gap-2 text-xs font-medium px-3.5 py-2"
                  style={{ background: ORANGE, color: "#F5EDE0", borderRadius: "var(--radius)" }}
                >
                  <Search className="w-3.5 h-3.5" />
                  New Scan
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {["Scan ID", "Type", "Target", "Risk Score", "Status", "Time"].map((h) => (
                      <th key={h} className="pb-3 pr-5 text-left text-xs font-mono text-muted-foreground tracking-widest uppercase font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SCAN_HISTORY.map((s) => (
                    <tr key={s.id} className="border-b cursor-pointer hover:bg-white/[0.015] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                      <td className="py-3.5 pr-5 font-mono text-xs text-muted-foreground">{s.id}</td>
                      <td className="py-3.5 pr-5 text-xs text-foreground">{s.type}</td>
                      <td className="py-3.5 pr-5 text-xs font-mono text-muted-foreground">{s.target}</td>
                      <td className="py-3.5 pr-5">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-sm font-bold"
                            style={{ color: s.risk > 60 ? RED : s.risk > 40 ? ORANGE : GREEN }}
                          >
                            {s.risk}
                          </span>
                          <div className="w-16 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${s.risk}%`,
                                background: s.risk > 60 ? RED : s.risk > 40 ? ORANGE : GREEN,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-5">
                        <span className="text-xs font-mono px-2 py-0.5" style={{ background: `${GREEN}1A`, color: GREEN, borderRadius: "var(--radius)" }}>
                          COMPLETE
                        </span>
                      </td>
                      <td className="py-3.5 text-xs font-mono text-muted-foreground">{s.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MONITORING TAB */}
          {tab === "monitoring" && (
            <div className="space-y-4">
              <div
                className="flex items-center gap-3 px-4 py-3 text-sm"
                style={{ background: "rgba(30,158,107,0.07)", border: "1px solid rgba(30,158,107,0.18)", borderRadius: "var(--radius)" }}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: GREEN, animation: "ping 1.5s ease-in-out infinite" }} />
                <span className="text-foreground font-medium">Real-time monitoring active</span>
                <span className="text-muted-foreground text-xs">· Auto-refreshes every 5s · Threats injected every 6-11s · Queue auto-resolves at 40 events</span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div
                  className="xl:col-span-2 p-5"
                  style={{ background: "#100F0D", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "var(--radius)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Live Event Feed</h3>
                    <span className="text-xs font-mono" style={{ color: GREEN }}>● LIVE · {liveEvents.filter(e => e.status === "ACTIVE").length} active</span>
                  </div>
                  <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: "440px" }}>
                    {liveEvents.map((ev, i) => (
                      <motion.div
                        key={ev.id + i}
                        initial={i === 0 ? { opacity: 0, x: -8 } : false}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between px-3 py-2.5 text-xs"
                        style={{
                          background: ev.status === "ACTIVE" ? "rgba(204,59,59,0.06)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${ev.status === "ACTIVE" ? "rgba(204,59,59,0.18)" : "rgba(255,255,255,0.05)"}`,
                          borderRadius: "var(--radius)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sevColor(ev.severity) }} />
                          <span className="font-mono text-muted-foreground" style={{ minWidth: "68px" }}>{ev.id}</span>
                          <span className="text-foreground">{ev.type}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-muted-foreground hidden md:inline">{ev.source}</span>
                          <span
                            className="font-mono px-1.5 py-0.5"
                            style={{ background: `${sevColor(ev.severity)}1A`, color: sevColor(ev.severity), borderRadius: "2px" }}
                          >
                            {ev.severity}
                          </span>
                          <span
                            className="font-mono px-1.5 py-0.5"
                            style={{ background: `${statusColor(ev.status)}1A`, color: statusColor(ev.status), borderRadius: "2px" }}
                          >
                            {ev.status}
                          </span>
                          <span className="text-muted-foreground hidden sm:inline">{ev.time}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Live Score gauge */}
                <div
                  className="p-5 flex flex-col"
                  style={{ background: "#100F0D", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "var(--radius)" }}
                >
                  <h3 className="text-sm font-semibold text-foreground mb-6">Security Score</h3>

                  <div className="flex justify-center mb-6">
                    <div className="relative w-36 h-36">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                        <circle
                          cx="50" cy="50" r="40"
                          fill="none"
                          stroke={score > 90 ? GREEN : score > 75 ? ORANGE : RED}
                          strokeWidth="10"
                          strokeDasharray={`${(score / 100) * 251} 251`}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dasharray 1s ease, stroke 0.5s ease" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-display text-3xl font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                          {score.toFixed(0)}
                        </span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { l: "Threat Response", v: 96, c: GREEN },
                      { l: "Model Integrity", v: 91, c: GREEN },
                      { l: "Access Security", v: 88, c: ORANGE },
                      { l: "Output Safety", v: 99, c: GREEN },
                      { l: "Data Isolation", v: 85, c: ORANGE },
                    ].map((m) => (
                      <div key={m.l}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{m.l}</span>
                          <span className="text-xs font-mono" style={{ color: m.c }}>{m.v}</span>
                        </div>
                        <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full" style={{ width: `${m.v}%`, background: m.c }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [showSignup, setShowSignup] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  if (view === "dashboard") {
    return <DashboardView onBack={() => setView("landing")} />;
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Nav
        onDashboard={() => setView("dashboard")}
        onSignup={() => setShowSignup(true)}
        onContact={() => setShowContact(true)}
      />

      <HeroSection
        onDashboard={() => setView("dashboard")}
        onSignup={() => setShowSignup(true)}
      />

      <FeaturesSection />
      <ScannerDemo />
      <PricingSection
        onSignup={() => setShowSignup(true)}
        onBuilder={() => setShowBuilder(true)}
      />
      <VideoSection />
      <CTASection
        onDashboard={() => setView("dashboard")}
        onSignup={() => setShowSignup(true)}
      />
      <Footer
        onSignup={() => setShowSignup(true)}
        onContact={() => setShowContact(true)}
      />

      <AnimatePresence>
        {showSignup && (
          <SignupModal
            key="signup"
            onClose={() => setShowSignup(false)}
            onDashboard={() => setView("dashboard")}
          />
        )}
        {showContact && (
          <ContactModal
            key="contact"
            onClose={() => setShowContact(false)}
          />
        )}
        {showBuilder && (
          <PlanBuilderModal
            key="builder"
            onClose={() => setShowBuilder(false)}
            onSignup={() => { setShowBuilder(false); setShowSignup(true); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
