import React, { useState } from 'react';
import { useCarpark } from '../context/CarparkContext';
import { X, Server, CheckCircle2, Copy, Check, Play, RefreshCw, AlertCircle } from 'lucide-react';

export const BackendDocsModal: React.FC = () => {
  const { isBackendDocsOpen, setIsBackendDocsOpen, carparks, isLtaConnected, ltaStatusMessage } = useCarpark();
  const [activeTab, setActiveTab] = useState<'endpoints' | 'test' | 'json'>('endpoints');
  const [copied, setCopied] = useState(false);

  // Live tester state
  const [testEndpoint, setTestEndpoint] = useState<'/api/health' | '/api/carparkavailability'>('/api/health');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<number | null>(null);

  if (!isBackendDocsOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runEndpointTest = async (endpoint: '/api/health' | '/api/carparkavailability') => {
    setIsTesting(true);
    setTestResult(null);
    setTestStatus(null);
    try {
      const res = await fetch(endpoint);
      setTestStatus(res.status);
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestStatus(500);
      setTestResult({ error: err.message || 'Network request failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const sampleJson = JSON.stringify(carparks.slice(0, 2), null, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Serverless LTA DataMall Endpoints
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Live endpoints located in project root <code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">/api/</code>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBackendDocsOpen(false)}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-neutral-100 dark:border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'endpoints'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Endpoint Documentation
          </button>
          <button
            onClick={() => {
              setActiveTab('test');
              if (!testResult) runEndpointTest('/api/health');
            }}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'test'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Live Endpoint Tester
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Active Carpark Schema ({carparks.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4 text-xs">
          {activeTab === 'endpoints' && (
            <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
              {/* Endpoint 1: /api/carparkavailability.ts */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-mono">
                      GET
                    </span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                      /api/carparkavailability
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">/api/carparkavailability.ts</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Proxies to LTA DataMall v2 (<code className="font-mono text-[11px]">https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2</code>) with the required <code className="font-mono text-[11px]">AccountKey</code> header.
                </p>
                <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg font-mono text-[11px] text-neutral-700 dark:text-neutral-300 space-y-1">
                  <div><strong>Environment Key:</strong> LTA_DATAMALL_ACCOUNT_KEY (in .env)</div>
                  <div><strong>Cache TTL:</strong> 45 seconds (in-memory rate-limit protection)</div>
                  <div><strong>Fallback:</strong> When no key is provided, returns helpful status without crashing</div>
                </div>
              </div>

              {/* Endpoint 2: /api/health.ts */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 font-mono">
                      GET
                    </span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                      /api/health
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">/api/health.ts</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Health verification endpoint reporting server uptime, environment, and whether the LTA DataMall AccountKey is configured.
                </p>
              </div>

              {/* Notice */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>No hardcoded keys:</strong> The server reads <code className="font-mono text-[11px]">process.env.LTA_DATAMALL_ACCOUNT_KEY</code>. You can set your key in <code className="font-mono text-[11px]">.env</code> whenever you are ready, or pass an <code className="font-mono text-[11px]">AccountKey</code> header directly in requests.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setTestEndpoint('/api/health');
                    runEndpointTest('/api/health');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                    testEndpoint === '/api/health'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Test /api/health
                </button>
                <button
                  onClick={() => {
                    setTestEndpoint('/api/carparkavailability');
                    runEndpointTest('/api/carparkavailability');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                    testEndpoint === '/api/carparkavailability'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Test /api/carparkavailability
                </button>

                <button
                  onClick={() => runEndpointTest(testEndpoint)}
                  disabled={isTesting}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Calling...' : 'Execute'}</span>
                </button>
              </div>

              {testStatus !== null && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-400">Response Status:</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      testStatus >= 200 && testStatus < 300
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                    }`}
                  >
                    HTTP {testStatus}
                  </span>
                </div>
              )}

              <div className="relative">
                <pre className="p-3.5 bg-neutral-900 text-neutral-100 rounded-xl overflow-x-auto font-mono text-[11px] max-h-72 leading-relaxed">
                  {testResult ? JSON.stringify(testResult, null, 2) : '// Click Execute to invoke endpoint'}
                </pre>
                {testResult && (
                  <button
                    onClick={() => handleCopy(JSON.stringify(testResult, null, 2))}
                    className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">
                  Current Frontend Active Carpark Data Structure:
                </span>
                <button
                  onClick={() => handleCopy(sampleJson)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Sample'}</span>
                </button>
              </div>
              <pre className="p-3.5 bg-neutral-900 text-neutral-100 rounded-xl overflow-x-auto font-mono text-[11px] max-h-80">
                {sampleJson}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Serverless Endpoints Active in /api</span>
          </div>
          <button
            onClick={() => setIsBackendDocsOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
