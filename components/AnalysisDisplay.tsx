import React from 'react';
import type { AnalysisResult } from '../types';
import SourcePill from './SourcePill';
import { RecommendationIcon, PlanIcon, SourcesIcon, SummaryIcon } from './IconComponents';

interface AnalysisDisplayProps {
  analysis: AnalysisResult | null;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="flex-1 bg-gray-900/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-sm border border-gray-700">
        <div className="text-5xl mb-4">🚢</div>
        <h2 className="text-2xl font-bold text-gray-200">PORTUS AI Analysis</h2>
        <p className="text-gray-400 mt-2">Your conversational trade intelligence agent. Results of your query will appear here.</p>
        <p className="text-sm text-gray-500 mt-4">Example: "If Suez canal is delayed 48 hours, which shipments are affected?"</p>
      </div>
    );
  }
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.85) return 'text-green-400';
    if (confidence > 0.6) return 'text-yellow-400';
    return 'text-red-400';
  }

  return (
    <div className="flex-1 bg-gray-800/60 rounded-2xl p-6 flex flex-col gap-6 overflow-y-auto backdrop-blur-sm border border-gray-700 h-full">
      {/* Explanation Section */}
      <div className="border-b border-gray-700 pb-4">
        <h3 className="flex items-center gap-3 text-lg font-semibold text-cyan-400 mb-2">
            <SummaryIcon />
            Summary
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">{analysis.explain}</p>
      </div>
      
      {/* Recommendations Section */}
      <div>
        <h3 className="flex items-center gap-3 text-lg font-semibold text-cyan-400 mb-3">
            <RecommendationIcon />
            Recommendations
        </h3>
        <div className="space-y-3">
          {analysis.recommendations.map((rec, index) => (
            <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                 <p className="text-gray-200 font-medium text-sm pr-4">{rec.action}</p>
                 <span className={`text-xs font-mono font-bold whitespace-nowrap ${getConfidenceColor(rec.confidence)}`}>
                    {(rec.confidence * 100).toFixed(0)}% Conf.
                 </span>
              </div>
              <p className="text-xs text-yellow-300 font-mono bg-black/30 px-2 py-1 rounded inline-block">Impact: {rec.impact_estimate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Section */}
      <div>
        <h3 className="flex items-center gap-3 text-lg font-semibold text-cyan-400 mb-3">
            <PlanIcon />
            Execution Plan
        </h3>
        <ol className="relative border-l border-gray-600 space-y-4 ml-2">
          {analysis.plan.map((step, index) => (
            <li key={index} className="ml-6">
              <span className="absolute flex items-center justify-center w-4 h-4 bg-blue-900 rounded-full -left-2 ring-4 ring-gray-800 text-blue-300 text-xs">{index + 1}</span>
              <p className="text-sm text-gray-300 font-mono">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Sources Section */}
      <div>
         <h3 className="flex items-center gap-3 text-lg font-semibold text-cyan-400 mb-2">
            <SourcesIcon />
            Data Sources
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.sources.map((source, index) => (
            <SourcePill key={index} source={source} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;