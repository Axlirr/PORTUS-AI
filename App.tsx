import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import AnalysisDisplay from './components/AnalysisDisplay';
import PortMap from './components/PortMap';
import ErrorBoundary from './components/ErrorBoundary';
import { SharedStateProvider } from './contexts/SharedStateContext';
import type { AnalysisResult } from './types';

function App() {
    const [activeTab, setActiveTab] = useState<'analysis' | 'map'>('analysis');

    return (
        <SharedStateProvider>
            <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
        </SharedStateProvider>
    );
}

function AppContent({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: any) => void }) {
    const svgBackground = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><defs><radialGradient id="a" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" stop-color="#0f172a"></stop><stop offset="100%" stop-color="#020617"></stop></radialGradient><filter id="b"><feGaussianBlur stdDeviation="12"></feGaussianBlur></filter><path id="c" d="M0 540l1920 0" stroke="#0ea5e9" stroke-width="2"></path></defs><g fill="none" stroke-width="2"><rect width="100%" height="100%" fill="url(#a)"></rect><g opacity="0.1" filter="url(#b)"><use href="#c" y="-200"></use><use href="#c" y="-100"></use><use href="#c"></use><use href="#c" y="100"></use><use href="#c" y="200"></use></g></g></svg>`;
    const bgUrl = `url("data:image/svg+xml;base64,${btoa(svgBackground)}")`;

    return (
        <div className="h-screen bg-slate-900 text-gray-100 flex flex-col p-4 font-sans bg-cover bg-center" style={{ backgroundImage: bgUrl }}>
            <header className="relative z-10 text-center mb-4">
                <h1 className="text-3xl font-bold tracking-wider text-cyan-400">
                    <span className="font-light text-white">PORTUS AI</span>
                </h1>
                <p className="text-sm text-gray-400">Conversational Trade Intelligence Agent</p>
            </header>

            <main className="relative z-10 flex-1 flex gap-4 min-h-0">
                <div className="w-1/2 flex flex-col min-h-0">
                    <ErrorBoundary>
                        <ChatInterface />
                    </ErrorBoundary>
                </div>
                <div className="w-1/2 flex flex-col min-h-0">
                    {/* Tab Navigation */}
                    <div className="flex bg-gray-800/60 rounded-t-2xl border-b border-gray-700">
                        {[
                            { id: 'analysis', label: 'Analysis' },
                            { id: 'map', label: 'Port Map' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'text-cyan-400 border-b-2 border-cyan-400 bg-gray-900/50'
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 min-h-0">
                        <ErrorBoundary>
                            {activeTab === 'analysis' && <AnalysisDisplay />}
                            {activeTab === 'map' && <PortMap />}
                        </ErrorBoundary>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;