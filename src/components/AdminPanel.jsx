import { useEffect, useState } from 'react';
import { BarChart3, Database, FilePlus2, RefreshCcw } from 'lucide-react';

export default function AdminPanel({ apiBase, onHealthUpdate }) {
  const [imageDir, setImageDir] = useState('');
  const [trainIndex, setTrainIndex] = useState(true);
  const [adding, setAdding] = useState(false);
  const [building, setBuilding] = useState(false);
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState('');
  const [error, setError] = useState('');

  const buildIndex = async () => {
    setBuilding(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/api/index/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_dir: imageDir || undefined, train_index: !!trainIndex }),
      });
      if (!res.ok) throw new Error(`Build failed: ${res.status}`);
      await res.json().catch(() => null);
    } catch (e) {
      setError(e.message || 'Failed to build index');
    } finally {
      setBuilding(false);
    }
  };

  const addImages = async (files) => {
    setAdding(true);
    setError('');
    try {
      const fd = new FormData();
      ;[...files].forEach((f) => fd.append('images', f));
      const res = await fetch(`${apiBase}/api/index/add`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Add failed: ${res.status}`);
      await res.json().catch(() => null);
    } catch (e) {
      setError(e.message || 'Failed to add images');
    } finally {
      setAdding(false);
    }
  };

  const fetchStats = async () => {
    setError('');
    try {
      const res = await fetch(`${apiBase}/api/index/stats`);
      if (!res.ok) throw new Error(`Stats failed: ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e.message || 'Failed to get stats');
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${apiBase}/health`);
      onHealthUpdate(res.ok ? 'healthy' : 'unhealthy');
    } catch {
      onHealthUpdate('unhealthy');
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${apiBase}/metrics`);
      const text = await res.text();
      setMetrics(text);
    } catch {
      setMetrics('');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="bg-white rounded-xl border shadow-sm p-4 sm:p-6 space-y-6">
      <div>
        <h3 className="text-base font-semibold flex items-center gap-2"><Database className="w-4 h-4"/> Index Management</h3>
        <div className="mt-3 grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Image directory (server path)</label>
            <input
              type="text"
              value={imageDir}
              onChange={(e) => setImageDir(e.target.value)}
              placeholder="/data/images"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={trainIndex} onChange={(e) => setTrainIndex(e.target.checked)} />
              Train index
            </label>
            <div className="flex gap-2">
              <button
                onClick={buildIndex}
                disabled={building}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <RefreshCcw className="w-4 h-4"/> {building ? 'Building...' : 'Build Index'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add images</label>
            <label className="w-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
              <FilePlus2 className="w-6 h-6 mb-2"/>
              <span className="text-sm">Select images to add</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && addImages(e.target.files)}
              />
            </label>
            {adding && <div className="text-sm text-gray-500 mt-2">Uploading...</div>}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Stats & Monitoring</h3>
          <div className="flex gap-2">
            <button onClick={fetchStats} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">Refresh Stats</button>
            <button onClick={fetchHealth} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">Check Health</button>
            <button onClick={fetchMetrics} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">Load Metrics</button>
          </div>
        </div>
        <div className="mt-3 grid md:grid-cols-2 gap-4">
          <div className="border rounded-md p-3 bg-gray-50 overflow-auto max-h-64">
            <div className="text-xs font-medium text-gray-600 mb-1">Index Stats</div>
            <pre className="text-xs whitespace-pre-wrap">{stats ? JSON.stringify(stats, null, 2) : 'No stats yet'}</pre>
          </div>
          <div className="border rounded-md p-3 bg-gray-50 overflow-auto max-h-64">
            <div className="text-xs font-medium text-gray-600 mb-1">Metrics</div>
            <pre className="text-xs whitespace-pre">{metrics || 'No metrics yet'}</pre>
          </div>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
    </section>
  );
}
