import { useState } from 'react'
import { classifyAPI } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { BarChart2, Cpu, Zap } from 'lucide-react'

const TABS = [
  { id: 'w2v', label: 'Word2Vec + LR', icon: BarChart2 },
  { id: 'bert', label: 'BERT', icon: Cpu },
  { id: 'modernbert', label: 'ModernBERT', icon: Zap },
]

export default function Classification() {
  const [tab, setTab] = useState('w2v')
  const [result, setResult] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    setResult(null)
    setConfig(null)
    try {
      if (tab === 'w2v') setResult(await classifyAPI.w2v())
      else if (tab === 'bert') setConfig(await classifyAPI.bertConfig())
      else setConfig(await classifyAPI.modernbertConfig())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Text Classification</h1>
        <p className="text-slate-400 max-w-2xl">
          Predicting story country (<strong className="text-slate-300">China</strong> vs{' '}
          <strong className="text-slate-300">Northern Ireland</strong>) with three approaches —
          averaged Word2Vec embeddings, fine-tuned BERT, and ModernBERT with early stopping.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setResult(null); setConfig(null) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
              tab === id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'glass text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Method description */}
      <div className="glass rounded-2xl p-6 mb-6 text-sm text-slate-400 leading-relaxed">
        {tab === 'w2v' && (
          <p>
            Each story is represented by <strong className="text-slate-300">averaging Word2Vec embeddings</strong>{' '}
            (Google News, 300-dim) of its non-stopword tokens. A Logistic Regression classifier is then trained on a
            70 / 15 / 15 train-val-test split. Note: the first run downloads ~1.6 GB of Word2Vec weights.
          </p>
        )}
        {tab === 'bert' && (
          <div>
            <p className="mb-3">
              A bare <code className="font-mono text-indigo-300">bert-base-uncased</code> model is fine-tuned for
              sequence classification. Stories longer than 512 tokens are truncated.
            </p>
            <code className="block bg-slate-900 rounded-lg p-3 text-xs font-mono text-cyan-300">
              Input → BERT (12L · 768H · 12A) → [CLS] → Dropout(0.1) → Linear(768→2) → Softmax
            </code>
          </div>
        )}
        {tab === 'modernbert' && (
          <p>
            <code className="font-mono text-violet-300">answerdotai/ModernBERT-base</code> loaded via{' '}
            <code className="font-mono text-slate-300">AutoModelForSequenceClassification</code>. Advantages:
            8192-token context window (no truncation), RoPE embeddings, Flash Attention 2, alternating
            global/local attention. Early stopping fires after 3 epochs without val-loss improvement (max 10 epochs).
          </p>
        )}
      </div>

      <button
        onClick={run}
        disabled={loading}
        className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium transition-colors mb-6"
      >
        {loading
          ? 'Running...'
          : tab === 'w2v'
          ? 'Run Classifier'
          : 'Load Configuration'}
      </button>

      {loading && (
        <LoadingSpinner
          label={
            tab === 'w2v'
              ? 'Training classifier (downloading Word2Vec on first run)...'
              : 'Loading...'
          }
        />
      )}

      {/* Word2Vec results */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Train size', value: result.train_size, color: '#818cf8' },
              { label: 'Val accuracy', value: `${(result.val_accuracy * 100).toFixed(1)}%`, color: '#34d399' },
              { label: 'Test accuracy', value: `${(result.test_accuracy * 100).toFixed(1)}%`, color: '#34d399' },
              { label: 'Test size', value: result.test_size, color: '#a78bfa' },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Classification Report</h3>
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Class','Precision','Recall','F1','Support'].map((h) => (
                    <th key={h} className={`py-2 text-slate-400 ${h === 'Class' ? 'text-left pr-6' : 'text-center px-3'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.classification_report)
                  .filter(([k]) => !['accuracy','macro avg','weighted avg'].includes(k))
                  .map(([cls, m]) => (
                    <tr key={cls} className="border-b border-slate-800">
                      <td className="text-slate-300 py-2 pr-6">{cls}</td>
                      <td className="text-center text-emerald-300 py-2 px-3">{m.precision?.toFixed(3)}</td>
                      <td className="text-center text-indigo-300 py-2 px-3">{m.recall?.toFixed(3)}</td>
                      <td className="text-center text-violet-300 py-2 px-3">{m['f1-score']?.toFixed(3)}</td>
                      <td className="text-center text-slate-400 py-2 px-3">{m.support}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Config display */}
      {config && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Training Configuration</h3>
          <pre className="text-xs font-mono text-cyan-300 bg-slate-900 rounded-lg p-4 overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
