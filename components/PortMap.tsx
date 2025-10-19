import React, { useState, useEffect, useRef } from 'react';
import { useSharedState } from '../contexts/SharedStateContext';
import { MapIcon, VesselIcon, BerthIcon, WeatherIcon, TrafficIcon, ExportIcon, RefreshIcon, ZoomInIcon, ZoomOutIcon } from './IconComponents';

interface VesselPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'docked' | 'incoming' | 'outgoing' | 'waiting' | 'maintenance';
  eta?: string;
  delay?: number;
  cargoType: string;
  size: 'small' | 'medium' | 'large';
  destination: string;
  origin: string;
}

interface Berth {
  id: string;
  name: string;
  x: number;
  y: number;
  occupied: boolean;
  vesselId?: string;
  capacity: number;
  terminal: string;
  depth: number;
  craneCount: number;
}

interface WeatherData {
  windSpeed: number;
  windDirection: string;
  visibility: number;
  seaState: number;
}

const PortMap: React.FC = () => {
  const { state } = useSharedState();
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [showWeather, setShowWeather] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);

  const [vessels, setVessels] = useState<VesselPosition[]>([
    { id: 'V101', name: 'CMA CGM Neptune', x: 200, y: 150, status: 'docked', eta: '14:30', cargoType: 'Containers', size: 'large', destination: 'Rotterdam', origin: 'Shanghai' },
    { id: 'V102', name: 'MSC Oscar', x: 400, y: 200, status: 'incoming', eta: '16:45', delay: 2, cargoType: 'Containers', size: 'large', destination: 'Singapore', origin: 'Hamburg' },
    { id: 'V103', name: 'Ever Given', x: 300, y: 100, status: 'waiting', eta: '18:20', delay: 4, cargoType: 'Containers', size: 'large', destination: 'Los Angeles', origin: 'Singapore' },
    { id: 'V104', name: 'Hapag Lloyd', x: 500, y: 250, status: 'outgoing', eta: '15:10', cargoType: 'Containers', size: 'medium', destination: 'Hamburg', origin: 'Singapore' },
    { id: 'V105', name: 'Maersk Singapore', x: 150, y: 300, status: 'maintenance', eta: '20:00', cargoType: 'Containers', size: 'large', destination: 'Dubai', origin: 'Singapore' },
    { id: 'V106', name: 'COSCO Shipping', x: 350, y: 350, status: 'incoming', eta: '17:30', cargoType: 'Bulk', size: 'medium', destination: 'Singapore', origin: 'Brisbane' },
  ]);

  const [berths, setBerths] = useState<Berth[]>([
    { id: 'B1', name: 'Berth T1-A1', x: 200, y: 150, occupied: true, vesselId: 'V101', capacity: 12000, terminal: 'T1', depth: 16, craneCount: 4 },
    { id: 'B2', name: 'Berth T1-A2', x: 400, y: 200, occupied: false, capacity: 15000, terminal: 'T1', depth: 18, craneCount: 6 },
    { id: 'B3', name: 'Berth T2-C1', x: 300, y: 100, occupied: false, capacity: 18000, terminal: 'T2', depth: 20, craneCount: 8 },
    { id: 'B4', name: 'Berth T2-C2', x: 500, y: 250, occupied: true, vesselId: 'V104', capacity: 14000, terminal: 'T2', depth: 17, craneCount: 5 },
    { id: 'B5', name: 'Berth T3-E1', x: 150, y: 300, occupied: true, vesselId: 'V105', capacity: 16000, terminal: 'T3', depth: 19, craneCount: 7 },
    { id: 'B6', name: 'Berth T3-E2', x: 350, y: 350, occupied: false, capacity: 13000, terminal: 'T3', depth: 15, craneCount: 3 },
  ]);

  const [weather, setWeather] = useState<WeatherData>({
    windSpeed: 15,
    windDirection: 'NE',
    visibility: 8,
    seaState: 2
  });

  // Auto-focus on vessel from shared state
  useEffect(() => {
    if (state.mapFocus.vesselId) {
      setSelectedVessel(state.mapFocus.vesselId);
      const vessel = vessels.find(v => v.id === state.mapFocus.vesselId);
      if (vessel) {
        setPan({ x: -vessel.x + 200, y: -vessel.y + 150 });
        setZoom(1.5);
      }
    }
  }, [state.mapFocus.vesselId, vessels]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'docked': return 'bg-green-500';
      case 'incoming': return 'bg-blue-500';
      case 'outgoing': return 'bg-purple-500';
      case 'waiting': return 'bg-yellow-500';
      case 'maintenance': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'docked': return '⚓';
      case 'incoming': return '➡️';
      case 'outgoing': return '⬅️';
      case 'waiting': return '⏳';
      case 'maintenance': return '🔧';
      default: return '🚢';
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'w-8 h-8';
      case 'medium': return 'w-10 h-10';
      case 'large': return 'w-12 h-12';
      default: return 'w-10 h-10';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const exportMap = () => {
    const mapData = {
      vessels: vessels.map(v => ({
        id: v.id,
        name: v.name,
        status: v.status,
        eta: v.eta,
        delay: v.delay,
        cargoType: v.cargoType,
        destination: v.destination
      })),
      berths: berths.map(b => ({
        id: b.id,
        name: b.name,
        occupied: b.occupied,
        capacity: b.capacity,
        terminal: b.terminal
      })),
      weather,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `port-map-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshData = () => {
    // Simulate data refresh
    setVessels(prev => prev.map(v => ({
      ...v,
      eta: new Date(Date.now() + Math.random() * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    })));
  };

  return (
    <div className="h-full bg-gray-800/60 rounded-2xl backdrop-blur-sm border border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-cyan-400">
          <MapIcon className="w-5 h-5" />
          Live Port Operations Map
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWeather(!showWeather)}
            className={`px-3 py-1 text-xs rounded text-white flex items-center gap-1 ${showWeather ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            <WeatherIcon className="w-3 h-3" />
            Weather
          </button>
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-3 py-1 text-xs rounded text-white flex items-center gap-1 ${showTraffic ? 'bg-green-600' : 'bg-gray-600'}`}
          >
            <TrafficIcon className="w-3 h-3" />
            Traffic
          </button>
          <button
            onClick={refreshData}
            className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 rounded text-white flex items-center gap-1"
          >
            <RefreshIcon className="w-3 h-3" />
            Refresh
          </button>
          <button
            onClick={exportMap}
            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded text-white flex items-center gap-1"
          >
            <ExportIcon className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={mapRef}
          className="relative w-full h-full bg-gradient-to-br from-blue-900/30 to-green-900/30 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Port Infrastructure */}
          <div className="absolute inset-0">
            {/* Terminal Areas */}
            <div className="absolute top-4 left-4 w-40 h-24 bg-gray-600/50 rounded border border-gray-500">
              <div className="text-xs text-gray-300 p-2 font-bold">Terminal T1</div>
              <div className="text-xs text-gray-400 px-2">Container Terminal</div>
            </div>
            <div className="absolute top-4 right-4 w-40 h-24 bg-gray-600/50 rounded border border-gray-500">
              <div className="text-xs text-gray-300 p-2 font-bold">Terminal T2</div>
              <div className="text-xs text-gray-400 px-2">Container Terminal</div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-24 bg-gray-600/50 rounded border border-gray-500">
              <div className="text-xs text-gray-300 p-2 font-bold">Terminal T3</div>
              <div className="text-xs text-gray-400 px-2">Bulk Terminal</div>
            </div>

            {/* Berths */}
            {berths.map(berth => (
              <div
                key={berth.id}
                className={`absolute rounded border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  berth.occupied
                    ? 'bg-red-500/70 border-red-400'
                    : 'bg-green-500/70 border-green-400'
                }`}
                style={{ 
                  left: berth.x - 40, 
                  top: berth.y - 20,
                  width: 80,
                  height: 40
                }}
                title={`${berth.name} - ${berth.occupied ? 'Occupied' : 'Available'} (${berth.capacity} TEU, ${berth.depth}m depth, ${berth.craneCount} cranes)`}
              >
                <div className="text-xs text-white text-center mt-1 font-bold">
                  {berth.id}
                </div>
                <div className="text-xs text-white text-center">
                  {berth.terminal}
                </div>
              </div>
            ))}

            {/* Vessels */}
            {vessels.map(vessel => (
              <div
                key={vessel.id}
                className={`absolute rounded-full border-2 cursor-pointer transition-all duration-300 hover:scale-110 ${
                  selectedVessel === vessel.id ? 'ring-4 ring-cyan-400' : ''
                } ${getStatusColor(vessel.status)} border-white ${getSizeClass(vessel.size)}`}
                style={{ left: vessel.x - 24, top: vessel.y - 24 }}
                onClick={() => setSelectedVessel(selectedVessel === vessel.id ? null : vessel.id)}
                title={`${vessel.name} - ${vessel.status} ${vessel.delay ? `(${vessel.delay}h delay)` : ''} - ${vessel.cargoType}`}
              >
                <div className="text-white text-center mt-2 text-lg">
                  {getStatusIcon(vessel.status)}
                </div>
              </div>
            ))}

            {/* Weather Overlay */}
            {showWeather && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800/80 rounded-lg p-3 text-xs">
                <div className="text-white font-bold mb-1">Weather Conditions</div>
                <div className="text-gray-300">
                  Wind: {weather.windSpeed} kts {weather.windDirection}
                </div>
                <div className="text-gray-300">
                  Visibility: {weather.visibility} km
                </div>
                <div className="text-gray-300">
                  Sea State: {weather.seaState}
                </div>
              </div>
            )}

            {/* Traffic Flow Lines */}
            {showTraffic && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {vessels.map(vessel => {
                  if (vessel.status === 'incoming' || vessel.status === 'outgoing') {
                    return (
                      <line
                        key={`traffic-${vessel.id}`}
                        x1={vessel.x}
                        y1={vessel.y}
                        x2={vessel.status === 'incoming' ? vessel.x - 50 : vessel.x + 50}
                        y2={vessel.y}
                        stroke="#06b6d4"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.6"
                      />
                    );
                  }
                  return null;
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
            className="w-8 h-8 bg-gray-800/80 hover:bg-gray-700 rounded text-white flex items-center justify-center"
          >
            <ZoomInIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.5, prev / 1.2))}
            className="w-8 h-8 bg-gray-800/80 hover:bg-gray-700 rounded text-white flex items-center justify-center"
          >
            <ZoomOutIcon className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 bg-gray-800/80 hover:bg-gray-700 rounded text-white text-xs"
          >
            Reset
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-800/80 rounded-lg p-3 text-xs">
          <div className="text-white font-bold mb-2">Status Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Docked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Incoming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300">Outgoing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300">Waiting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-300">Maintenance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vessel Details Panel */}
      {selectedVessel && (
        <div className="border-t border-gray-700 p-4 bg-gray-900/50">
          {(() => {
            const vessel = vessels.find(v => v.id === selectedVessel);
            const berth = berths.find(b => b.vesselId === selectedVessel);
            return vessel ? (
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-white font-bold text-lg">{vessel.name}</h4>
                  <button
                    onClick={() => setSelectedVessel(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="text-white ml-2 capitalize">{vessel.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">ETA:</span>
                    <span className="text-white ml-2">{vessel.eta}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Cargo Type:</span>
                    <span className="text-white ml-2">{vessel.cargoType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white ml-2 capitalize">{vessel.size}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Origin:</span>
                    <span className="text-white ml-2">{vessel.origin}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Destination:</span>
                    <span className="text-white ml-2">{vessel.destination}</span>
                  </div>
                  {vessel.delay && (
                    <div>
                      <span className="text-gray-400">Delay:</span>
                      <span className="text-yellow-400 ml-2">{vessel.delay}h</span>
                    </div>
                  )}
                  {berth && (
                    <div>
                      <span className="text-gray-400">Berth:</span>
                      <span className="text-white ml-2">{berth.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};

export default PortMap;