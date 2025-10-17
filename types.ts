export interface Vessel {
  vessel_id: string;
  route: string;
  eta: string;
  delay_hours: number;
  status: 'On Time' | 'Delayed' | 'At Risk';
  origin: string;
  destination: string;
}

export interface Port {
  port_id: string;
  name: string;
  throughput_pct: number;
  resilience_score: number;
  congestion_flag: 0 | 1;
}

export interface Weather {
    region: string;
    event: string;
    risk_level: 'Low' | 'Medium' | 'High';
    start_date: string;
    end_date: string;
    impact: string;
}

export interface Route {
    route_id: string;
    name: string;
    transit_days: number;
    cost_index: number;
}

export interface Recommendation {
  action: string;
  impact_estimate: string;
  confidence: number;
}

export interface AnalysisResult {
  plan: string[];
  recommendations: Recommendation[];
  sources: string[];
  explain: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  analysis?: AnalysisResult;
}