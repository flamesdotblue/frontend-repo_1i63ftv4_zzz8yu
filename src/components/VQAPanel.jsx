import { useMemo, useState } from 'react';
import { Upload, HelpCircle, MessageSquareText } from 'lucide-react';

export default function VQAPanel({ apiBase }) {
  const [imageFile, setImageFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ''), [imageFile]);

  const sendForm = async (endpoint, formData) => {
    const res = await fetch(`${apiBase}${endpoint}`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const ctype = res.headers.get('content-type') || '';
    if (ctype.includes('application/json')) {
      return res.json();
    }
    return res.text();
  };

  const askQuestion = async () => {
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const fd = new FormData();
      if (imageFile) fd.append('image', imageFile);
      fd.append('question', question);
      const data = await sendForm('/api/vqa/question', fd);
      const ans = typeof data === 'string' ? data : data.answer || data.result || JSON.stringify(data);
      setAnswer(ans);
    } catch (e) {
      setError(e.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const describeImage = async () => {
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const fd = new FormData();
      if (imageFile) fd.append('image', imageFile);
      const data = await sendForm('/api/vqa/describe', fd);
      const ans = typeof data === 'string' ? data : data.caption || data.description || JSON.stringify(data);
      setAnswer(ans);
    } catch (e) {
      setError(e.message || 'Failed to get description');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-xl border shadow-sm p-4 sm:p-6">
      <div className="grid md:grid-cols-5 gap-4">
        <div className="md:col-span-3 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What color is the car?"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="button"
                onClick={askQuestion}
                disabled={!imageFile || !question || loading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <HelpCircle className="w-4 h-4" /> Ask
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={describeImage}
              disabled={!imageFile || loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50"
            >
              <MessageSquareText className="w-4 h-4" /> Describe Image
            </button>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {answer && (
            <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-md text-sm whitespace-pre-wrap">
              {answer}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
          <div
            className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer"
            onClick={() => document.getElementById('file-input-vqa').click()}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="preview" className="mx-auto h-40 object-contain" />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-sm">Click to upload</span>
              </div>
            )}
            <input id="file-input-vqa" type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </div>
        </div>
      </div>

      {loading && <div className="mt-3 text-sm text-gray-500">Processing...</div>}
    </section>
  );
}
