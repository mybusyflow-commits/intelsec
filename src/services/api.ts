const API_BASE = "/api/v1";

export interface Stats {
  total_scans: number;
  active_threats: number;
  resolved_threats: number;
  average_risk_score: number;
  threats_high: number;
  security_score: number;
  models_monitored: number;
  compliance_score: number;
}

export interface ThreatEvent {
  id: string;
  threat_type: string;
  severity: string;
  source: string;
  description: string;
  is_resolved: boolean;
  created_at: string;
}

export interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  tier: string;
  enabled: boolean;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(`API ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

interface SummaryResponse {
  security_score: number;
  threats_blocked: number;
  threats_active: number;
  threats_high: number;
  total_scans: number;
  average_risk_score: number;
  models_monitored: number;
  compliance_score: number;
}

export const api = {
  async getStats(): Promise<Stats> {
    const s = await req<SummaryResponse>("/system/summary");
    return {
      total_scans: s.total_scans,
      active_threats: s.threats_active,
      resolved_threats: s.threats_blocked,
      average_risk_score: s.average_risk_score,
      threats_high: s.threats_high,
      security_score: s.security_score,
      models_monitored: s.models_monitored,
      compliance_score: s.compliance_score,
    };
  },

  async getThreats(status: "active" | "resolved" | "" = ""): Promise<ThreatEvent[]> {
    const q = status ? `?status=${status}` : "";
    return req<ThreatEvent[]>(`/threats${q}`);
  },

  async getModules(): Promise<ModuleInfo[]> {
    const r = await req<{ modules: ModuleInfo[] }>("/modules");
    return r.modules;
  },
};