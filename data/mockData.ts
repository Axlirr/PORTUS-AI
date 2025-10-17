import type { Vessel, Port, Weather, Route } from '../types';

export const mockVessels: Vessel[] = [
  { vessel_id: 'V101', route: 'R01', eta: '2025-10-28', delay_hours: 24, status: 'At Risk', origin: 'Shanghai', destination: 'Rotterdam' },
  { vessel_id: 'V102', route: 'R01', eta: '2025-10-29', delay_hours: 48, status: 'Delayed', origin: 'Singapore', destination: 'Rotterdam' },
  { vessel_id: 'V201', route: 'R02', eta: '2025-11-05', delay_hours: 0, status: 'On Time', origin: 'Los Angeles', destination: 'Tokyo' },
];

export const mockPorts: Port[] = [
  { port_id: 'P01', name: 'Rotterdam', throughput_pct: 95, resilience_score: 0.88, congestion_flag: 1 },
  { port_id: 'P02', name: 'Singapore', throughput_pct: 98, resilience_score: 0.95, congestion_flag: 1 },
  { port_id: 'P03', name: 'Shanghai', throughput_pct: 85, resilience_score: 0.92, congestion_flag: 0 },
];

export const mockWeather: Weather[] = [
    { region: 'Suez Canal', event: 'Sandstorm', risk_level: 'High', start_date: '2025-10-27', end_date: '2025-10-29', impact: 'Reduced visibility, 48-hour transit delay expected.' },
    { region: 'South China Sea', event: 'Typhoon', risk_level: 'High', start_date: '2025-11-01', end_date: '2025-11-04', impact: 'Vessel rerouting required, high seas.' },
];

export const mockRoutes: Route[] = [
    { route_id: 'R01', name: 'Asia-Europe', transit_days: 25, cost_index: 1.2 },
    { route_id: 'R02', name: 'Trans-Pacific', transit_days: 14, cost_index: 1.0 },
    { route_id: 'R03', name: 'Cape of Good Hope', transit_days: 34, cost_index: 1.5 },
];