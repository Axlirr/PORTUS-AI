import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { AnalysisResult } from '../types';

interface SharedState {
  currentAnalysis: AnalysisResult | null;
  selectedVessel: string | null;
  selectedEvent: string | null;
  mapFocus: {
    vesselId?: string;
    coordinates?: { x: number; y: number };
    zoom?: number;
  };
}

interface SharedStateContextType {
  state: SharedState;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  setSelectedVessel: (vesselId: string | null) => void;
  setSelectedEvent: (eventId: string | null) => void;
  setMapFocus: (focus: SharedState['mapFocus']) => void;
  extractEntitiesFromAnalysis: (analysis: AnalysisResult) => void;
}

const SharedStateContext = createContext<SharedStateContextType | undefined>(undefined);

export const useSharedState = () => {
  const context = useContext(SharedStateContext);
  if (!context) {
    throw new Error('useSharedState must be used within SharedStateProvider');
  }
  return context;
};

interface SharedStateProviderProps {
  children: ReactNode;
}

export const SharedStateProvider: React.FC<SharedStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<SharedState>({
    currentAnalysis: null,
    selectedVessel: null,
    selectedEvent: null,
    mapFocus: {},
  });

  const setCurrentAnalysis = (analysis: AnalysisResult | null) => {
    try {
      setState(prev => ({ ...prev, currentAnalysis: analysis }));
      if (analysis) {
        extractEntitiesFromAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error setting current analysis:', error);
    }
  };

  const setSelectedVessel = (vesselId: string | null) => {
    setState(prev => ({ ...prev, selectedVessel: vesselId }));
  };

  const setSelectedEvent = (eventId: string | null) => {
    setState(prev => ({ ...prev, selectedEvent: eventId }));
  };

  const setMapFocus = (focus: SharedState['mapFocus']) => {
    setState(prev => ({ ...prev, mapFocus: focus }));
  };


  const extractEntitiesFromAnalysis = (analysis: AnalysisResult) => {
    try {
      // Extract vessel IDs from analysis
      const vesselMatches = analysis.explain.match(/V\d+/g);
      const eventMatches = analysis.explain.match(/(Suez|storm|delay|disruption)/gi);

      if (vesselMatches && vesselMatches.length > 0) {
        setSelectedVessel(vesselMatches[0]);

        // Set map focus for the vessel
        const vesselCoordinates = getVesselCoordinates(vesselMatches[0]);
        if (vesselCoordinates) {
          setMapFocus({
            vesselId: vesselMatches[0],
            coordinates: vesselCoordinates,
            zoom: 1.5,
          });
        }
      }

      if (eventMatches && eventMatches.length > 0) {
        const event = eventMatches[0].toLowerCase();
        setSelectedEvent(event);
      }
    } catch (error) {
      console.error('Error extracting entities from analysis:', error);
    }
  };

  const getVesselCoordinates = (vesselId: string) => {
    // Mock vessel coordinates - in real app, this would come from data
    const vesselPositions: Record<string, { x: number; y: number }> = {
      'V101': { x: 200, y: 150 },
      'V102': { x: 400, y: 200 },
      'V103': { x: 300, y: 100 },
      'V104': { x: 500, y: 250 },
    };
    return vesselPositions[vesselId];
  };

  return (
    <SharedStateContext.Provider value={{
      state,
      setCurrentAnalysis,
      setSelectedVessel,
      setSelectedEvent,
      setMapFocus,
      extractEntitiesFromAnalysis,
    }}>
      {children}
    </SharedStateContext.Provider>
  );
};
