import { useEffect } from 'react';
import { Activity, Image as ImageIcon, Search, HelpCircle, Settings } from 'lucide-react';

export default function HeaderNav({ currentTab, onChangeTab, health }) {
  useEffect(() => {}, [currentTab]);
  const tabs = [
    { key: 'search', label: 'Visual Search', icon: <Search className="w-4 h-4" /> },
    { key: 'vqa', label: 'VQA', icon: <HelpCircle className="w-4 h-4" /> },
    { key: 'admin', label: 'Index & Monitoring', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-indigo-600 text-white">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Multimodal Visual Search</h1>
            <p className="text-xs text-gray-500">Production-grade UI for search, VQA, and index ops</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => onChangeTab(t.key)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm transition border ${
                currentTab === t.key
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
            health === 'healthy'
              ? 'bg-green-50 text-green-700 border-green-200'
              : health === 'unhealthy'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            <Activity className="w-3 h-3" />
            {health === 'checking' ? 'Checking...' : health === 'healthy' ? 'Healthy' : 'Unhealthy'}
          </span>
        </div>
      </div>

      <div className="md:hidden border-t">
        <div className="max-w-6xl mx-auto px-2 py-2 grid grid-cols-3 gap-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => onChangeTab(t.key)}
              className={`inline-flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs transition border ${
                currentTab === t.key
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
