import { useCallback, useMemo, useState } from 'react';
import { Upload, Search, Image as ImageIcon, Type, Layers, X } from 'lucide-react';

const defaultK = 12;

function ResultGrid({ items, onZoom }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-600 mb-3">Results</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onZoom(item)}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition"
            title={item.url}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="result" className="object-cover w-full h-full" />
            {typeof item.score === 'number' && (
              <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                {item.score.toFixed(3)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ZoomModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 border-b">
          <span className="text-sm font-medium truncate pr-4">{item.url}</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.url} alt="zoom" className="w-full h-auto rounded" />
          {typeof item.score === 'number' && (
            <div className="text-xs text-gray-500 mt-2">Score: {item.score}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPanel({ apiBase }) {
  const [mode, setMode] = useState('text');
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [k, setK] = useState(defaultK);
  const [threshold, setThreshold] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [zoom, setZoom] = useState(null);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setImageFile(file);
  }, []);

  const parseResults = useCallback((data) => {
    const arr = Array.isArray(data) ? data : data?.results || [];
    return arr
      .map((it) => {
        if (!it) return null;
        if (typeof it === 'string') return { url: it };
        const url = it.image_url || it.url || it.path || it.uri || it.thumbnail_url;
        const score = it.score ?? it.similarity ?? it.distance;
        if (!url) return null;
        return { url, score: typeof score === 'number' ? score : undefined };
      })
      .filter(Boolean);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    try {
      let res;
      if (mode === 'text') {
        res = await fetch(`${apiBase}/api/search/text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, k: Number(k) || defaultK, threshold: threshold ? Number(threshold) : undefined }),
        });
      } else if (mode === 'image') {
        const fd = new FormData();
        if (imageFile) fd.append('image', imageFile);
        fd.append('k', String(Number(k) || defaultK));
        res = await fetch(`${apiBase}/api/search/image`, { method: 'POST', body: fd });
      } else {
        const fd = new FormData();
        if (imageFile) fd.append('image', imageFile);
        if (query) fd.append('text', query);
        fd.append('k', String(Number(k) || defaultK));
        res = await fetch(`${apiBase}/api/search/multimodal`, { method: 'POST', body: fd });
      }

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const ctype = res.headers.get('content-type') || '';
      const data = ctype.includes('application/json') ? await res.json() : await res.text();
      const parsed = ctype.includes('application/json') ? parseResults(data) : [];
      setResults(parsed);
      if (!ctype.includes('application/json')) setError('Unexpected response format');
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ''), [imageFile]);

  return (
    <section className="bg-white rounded-xl border shadow-sm p-4 sm:p-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
            mode === 'text' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'hover:bg-gray-50'
          }`}
          onClick={() => setMode('text')}
        >
          <Type className="w-4 h-4" /> Text → Image
        </button>
        <button
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
            mode === 'image' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'hover:bg-gray-50'
          }`}
          onClick={() => setMode('image')}
        >
          <ImageIcon className="w-4 h-4" /> Image → Image
        </button>
        <button
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
            mode === 'multimodal' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'hover:bg-gray-50'
          }`}
          onClick={() => setMode('multimodal')}
        >
          <Layers className="w-4 h-4" /> Text + Image
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-4">
        <div className="md:col-span-3 space-y-3">
          {(mode === 'text' || mode === 'multimodal') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text query</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., red sports car at sunset"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          )}

          <div className="flex gap-3">
            <div className="w-28">
              <label className="block text-sm font-medium text-gray-700 mb-1">Top K</label>
              <input
                type="number"
                value={k}
                min={1}
                max={60}
                onChange={(e) => setK(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            {mode === 'text' && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Threshold (optional)</label>
                <input
                  type="number"
                  step="0.001"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="e.g., 0.25"
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {(mode === 'image' || mode === 'multimodal') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer"
                onClick={() => document.getElementById('file-input-search').click()}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="preview" className="mx-auto h-36 object-contain" />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-sm">Drag & drop or click to upload</span>
                  </div>
                )}
                <input id="file-input-search" type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || (mode !== 'text' && !imageFile)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Search'}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      <ResultGrid items={results} onZoom={setZoom} />
      <ZoomModal item={zoom} onClose={() => setZoom(null)} />
    </section>
  );
}
