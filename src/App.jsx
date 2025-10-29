import { useEffect, useMemo, useState } from 'react';
import HeaderNav from './components/HeaderNav';
import SearchPanel from './components/SearchPanel';
import VQAPanel from './components/VQAPanel';
import AdminPanel from './components/AdminPanel';

function useApiBase() {
  const base = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || '';
  return base;
}

export default function App() {
  const apiBase = useApiBase();
  const [tab, setTab] = useState('search');
  const [health, setHealth] = useState('checking');

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${apiBase}/health`);
        setHealth(res.ok ? 'healthy' : 'unhealthy');
      } catch (e) {
        setHealth('unhealthy');
      }
    };
    check();
  }, [apiBase]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <HeaderNav currentTab={tab} onChangeTab={setTab} health={health} />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {tab === 'search' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-indigo-600 text-white p-4 sm:p-6">
              <h2 className="text-lg font-semibold">Visual Search</h2>
              <p className="text-sm text-indigo-100">Search by text, image, or combine both for better precision. Click results to zoom.</p>
            </div>
            <SearchPanel apiBase={apiBase} />
          </div>
        )}

        {tab === 'vqa' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-indigo-600 text-white p-4 sm:p-6">
              <h2 className="text-lg font-semibold">Visual Question Answering</h2>
              <p className="text-sm text-indigo-100">Upload an image and ask any question about it, or request a description.</p>
            </div>
            <VQAPanel apiBase={apiBase} />
          </div>
        )}

        {tab === 'admin' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-indigo-600 text-white p-4 sm:p-6">
              <h2 className="text-lg font-semibold">Index & Monitoring</h2>
              <p className="text-sm text-indigo-100">Build or update the index, add images, view stats and system metrics.</p>
            </div>
            <AdminPanel apiBase={apiBase} onHealthUpdate={setHealth} />
          </div>
        )}

        <footer className="text-center text-xs text-gray-500 pt-6 pb-8">
          Backend: {apiBase || 'same origin'}
        </footer>
      </main>
    </div>
  );
}
