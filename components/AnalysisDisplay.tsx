import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import SourcePill from './SourcePill';
import { RecommendationIcon, PlanIcon, SourcesIcon, SummaryIcon, ExportIcon } from './IconComponents';
import { useSharedState } from '../contexts/SharedStateContext';

interface AnalysisDisplayProps { }

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = () => {
  const [showExport, setShowExport] = useState(false);
  const { state } = useSharedState();
  const analysis = state?.currentAnalysis || null;

  console.log("AnalysisDisplay - state:", state);
  console.log("AnalysisDisplay - analysis:", analysis);

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.85) return 'text-green-400';
    if (confidence > 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!analysis) {
    return (
      <div className="flex-1 bg-gray-900/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-sm border border-gray-700">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <SummaryIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-200">PORTUS AI Analysis</h2>
        <p className="text-gray-400 mt-2">Your conversational trade intelligence agent. Results of your query will appear here.</p>
        <p className="text-sm text-gray-500 mt-4">Example: "If Suez canal is delayed 48 hours, which shipments are affected?"</p>
      </div>
    );
  }

  const generateReport = (format: 'pdf' | 'excel' | 'json') => {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: analysis.explain,
      recommendations: analysis.recommendations,
      executionPlan: analysis.plan,
      sources: analysis.sources,
      trace: analysis.trace,
      selectedVessel: state.selectedVessel,
      selectedEvent: state.selectedEvent,
    };

    switch (format) {
      case 'json':
        downloadJSON(reportData);
        break;
      case 'excel':
        downloadExcel(reportData);
        break;
      case 'pdf':
        downloadPDF(reportData);
        break;
    }
  };

  const downloadJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portus-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (data: any) => {
    const csvContent = [
      ['PORTUS AI Analysis Report'],
      ['Generated:', new Date().toLocaleString()],
      ['Selected Vessel:', data.selectedVessel || 'N/A'],
      ['Selected Event:', data.selectedEvent || 'N/A'],
      [''],
      ['Summary', data.summary],
      [''],
      ['Recommendations'],
      ...data.recommendations.map((rec: any, i: number) => [
        `${i + 1}. ${rec.action}`,
        `Impact: ${rec.impact_estimate}`,
        `Confidence: ${(rec.confidence * 100).toFixed(0)}%`,
        ''
      ]),
      [''],
      ['Execution Plan'],
      ...data.executionPlan.map((step: string, i: number) => [`${i + 1}. ${step}`]),
      [''],
      ['Data Sources'],
      ...data.sources.map((source: string) => [source]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portus-analysis-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = (data: any) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PORTUS AI Analysis Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { color: #06b6d4; font-size: 24px; margin-bottom: 20px; }
          .section { margin: 20px 0; }
          .section h3 { color: #374151; border-bottom: 2px solid #06b6d4; }
          .recommendation { background: #f3f4f6; padding: 10px; margin: 10px 0; border-radius: 5px; }
          .confidence { color: #059669; font-weight: bold; }
          .trace-step { margin: 5px 0; padding: 5px; background: #f9fafb; border-left: 3px solid #06b6d4; }
          .context { background: #e0f2fe; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">PORTUS AI Analysis Report</div>
        <div class="context">
          <strong>Context:</strong> Vessel: ${data.selectedVessel || 'N/A'} | Event: ${data.selectedEvent || 'N/A'}
        </div>
        <div class="section">
          <h3>Summary</h3>
          <p>${data.summary}</p>
        </div>
        <div class="section">
          <h3>Recommendations</h3>
          ${data.recommendations.map((rec: any, i: number) => `
            <div class="recommendation">
              <strong>${i + 1}. ${rec.action}</strong><br>
              Impact: ${rec.impact_estimate}<br>
              Confidence: <span class="confidence">${(rec.confidence * 100).toFixed(0)}%</span>
            </div>
          `).join('')}
        </div>
        <div class="section">
          <h3>Execution Plan</h3>
          <ol>
            ${data.executionPlan.map((step: string) => `<li>${step}</li>`).join('')}
          </ol>
        </div>
        ${data.trace ? `
          <div class="section">
            <h3>ReAct Trace</h3>
            ${data.trace.map((step: any, i: number) => `
              <div class="trace-step">
                <strong>[${step.type.toUpperCase()}]</strong> 
                ${step.message || step.actionName || step.observation || ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div class="section">
          <h3>Data Sources</h3>
          <ul>
            ${data.sources.map((source: string) => `<li>${source}</li>`).join('')}
          </ul>
        </div>
        <div style="margin-top: 40px; font-size: 12px; color: #6b7280;">
          Generated by PORTUS AI on ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portus-analysis-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-gray-800/60 rounded-2xl p-6 flex flex-col gap-6 overflow-y-auto backdrop-blur-sm border border-gray-700 scrollbar-hide">
      {/* Header with Export */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <h3 className="flex items-center gap-3 text-lg font-semibold text-cyan-400">
          <SummaryIcon />
          Analysis Results
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => generateReport('pdf')}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded text-white flex items-center gap-1"
            title="Export as PDF"
          >
            <ExportIcon className="w-3 h-3" />
            PDF
          </button>
          <button
            onClick={() => generateReport('excel')}
            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded text-white flex items-center gap-1"
            title="Export as Excel"
          >
            <ExportIcon className="w-3 h-3" />
            Excel
          </button>
          <button
            onClick={() => generateReport('json')}
            className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded text-white flex items-center gap-1"
            title="Export as JSON"
          >
            <ExportIcon className="w-3 h-3" />
            JSON
          </button>
        </div>
      </div>

      {/* Context Information */}
      {(state.selectedVessel || state.selectedEvent) && (
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
          <div className="text-sm text-blue-300">
            <strong>Context:</strong>
            {state.selectedVessel && <span className="ml-2">Vessel: {state.selectedVessel}</span>}
            {state.selectedEvent && <span className="ml-2">Event: {state.selectedEvent}</span>}
          </div>
        </div>
      )}

      {/* Explanation Section */}
      <div>
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
          {analysis.trace && analysis.trace.length > 0 && (
            <li className="ml-6">
              <span className="absolute flex items-center justify-center w-4 h-4 bg-blue-900 rounded-full -left-2 ring-4 ring-gray-800 text-blue-300 text-xs">+</span>
              <div className="space-y-2">
                {analysis.trace.map((t, i) => (
                  <div key={i} className="text-sm font-mono">
                    {t.type === 'thinking' && (
                      <p className="text-gray-400">[Thinking] {t.message}</p>
                    )}
                    {t.type === 'action' && (
                      <div className="text-blue-300">
                        <p>[Action] {t.actionName}({t.arguments ? JSON.stringify(t.arguments) : ''})</p>
                        {t.requires_approval && (
                          <div className="mt-2 flex gap-2">
                            <button className="px-2 py-1 text-xs rounded bg-green-700 hover:bg-green-600">Approve</button>
                            <button className="px-2 py-1 text-xs rounded bg-red-700 hover:bg-red-600">Reject</button>
                          </div>
                        )}
                      </div>
                    )}
                    {t.type === 'observation' && (
                      <p className="text-amber-300">[Observation] {t.observation}</p>
                    )}
                    {t.type === 'final' && (
                      <p className="text-green-400">[Final] {t.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </li>
          )}
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