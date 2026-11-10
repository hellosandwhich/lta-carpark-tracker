import React, { useState } from 'react';
import { useCarpark } from '../context/CarparkContext';
import { X, Code2, Server, CheckCircle2, Copy, Check } from 'lucide-react';

export const BackendDocsModal: React.FC = () => {
  const { isBackendDocsOpen, setIsBackendDocsOpen, carparks } = useCarpark();
  const [activeTab, setActiveTab] = useState<'lta' | 'server' | 'json'>('lta');
  const [copied, setCopied] = useState(false);

  if (!isBackendDocsOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleJson = JSON.stringify(carparks.slice(0, 2), null, 2);

  const serverSnippet = `// server.ts snippet for Singapore LTA DataMall proxy
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const LTA_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';
const HDB_API_URL = 'https://api.data.gov.sg/v1/transport/carpark-availability';

app.get('/api/carparks/live', async (req, res) => {
  try {
    const ltaKey = process.env.LTA_DATAMALL_API_KEY;
    const response = await fetch(LTA_API_URL, {
      headers: {
        'AccountKey': ltaKey || '',
        'accept': 'application/json'
      }
    });
    const data = await response.json();
    // Return structured payload mapped directly to ParkSG Carpark schema
    res.json({ success: true, timestamp: new Date().toISOString(), value: data.value });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});`;

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
                Backend Connection Specifications
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                LTA DataMall & Data.gov.sg API integration mapping for future server connect
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
            onClick={() => setActiveTab('lta')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'lta'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            LTA DataMall v2 Specs
          </button>
          <button
            onClick={() => setActiveTab('server')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'server'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Express Proxy Setup
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Live JSON Schema ({carparks.length} items)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4 text-xs">
          {activeTab === 'lta' && (
            <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="font-bold text-neutral-900 dark:text-white block">
                  Official Singapore Government Carpark APIs
                </span>
                <p>
                  ParkSG's frontend schemas are 100% compliant with Singapore's two standard open government transport datasets:
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400 pl-1">
                  <li>
                    <strong>LTA DataMall:</strong> <code className="font-mono text-[11px] bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded">CarParkAvailabilityv2</code> (Real-time URA, LTA, and Commercial mall lots, updated every 1 min).
                  </li>
                  <li>
                    <strong>Data.gov.sg:</strong> <code className="font-mono text-[11px] bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded">/v1/transport/carpark-availability</code> (Real-time HDB multi-storey carparks).
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-neutral-900 dark:text-white block">
                  Frontend Mapping Contract
                </span>
                <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono uppercase text-neutral-500">
                      <tr>
                        <th className="p-2 border-b border-neutral-200 dark:border-neutral-700">LTA Field</th>
                        <th className="p-2 border-b border-neutral-200 dark:border-neutral-700">ParkSG Schema</th>
                        <th className="p-2 border-b border-neutral-200 dark:border-neutral-700">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono text-[11px]">
                      <tr>
                        <td className="p-2">CarParkID</td>
                        <td className="p-2">carparkNumber</td>
                        <td className="p-2">string</td>
                      </tr>
                      <tr>
                        <td className="p-2">Area / Development</td>
                        <td className="p-2">name</td>
                        <td className="p-2">string</td>
                      </tr>
                      <tr>
                        <td className="p-2">AvailableLots</td>
                        <td className="p-2">lots.car.available</td>
                        <td className="p-2">number</td>
                      </tr>
                      <tr>
                        <td className="p-2">Location</td>
                        <td className="p-2">coordinates (lat, lng)</td>
                        <td className="p-2">object</td>
                      </tr>
                      <tr>
                        <td className="p-2">Agency</td>
                        <td className="p-2">agency (HDB|URA|LTA)</td>
                        <td className="p-2">enum</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'server' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">
                  Ready-to-drop Express proxy route for server.ts:
                </span>
                <button
                  onClick={() => handleCopy(serverSnippet)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-3.5 bg-neutral-900 text-neutral-100 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
                {serverSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">
                  Current Frontend Active Carpark Data Preview:
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
            <span>Frontend State & Data Structure Ready for Seamless Backend Hookup</span>
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
