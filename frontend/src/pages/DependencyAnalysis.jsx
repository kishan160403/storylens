import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ErrorBar,
} from 'recharts'
import { parsingAPI } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

const STYLES = ['legalistic','descriptive','hard-boiled','stream of consciousness','journalistic','for children']
const COLORS = ['#818cf8','#a78bfa','#22d3ee','#34d399','#fb7185','#fbbf24']

export default function DependencyAnalysis() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    parsingAPI.all(50).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Running dependency parsing (this may take a minute)..." />

  const statsArr = STYLES.map((s, i) => ({
    style: s.replace('stream of consciousness', 'stream…'),
    rawStyle: s,
    mean: data?.[s]?.mean ?? 0,
    median: data?.[s]?.median ?? 0,
    std: data?.[s]?.std ?? 0,
    n: data?.[s]?.num_sentences ?? 0,
    color: COLORS[i],
  }))

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Dependency Parsing</h1>
        <p className="text-slate-400 max-w-2xl">
          The <strong className="text-slate-300">max_dep</strong> metric measures the longest dependency arc in a
          sentence — a proxy for syntactic complexity. Higher values indicate more deeply nested structures.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statsArr.map((s) => (
          <div key={s.rawStyle} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className="text-sm text-slate-300 font-medium">{s.rawStyle}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'mean', value: s.mean, col: s.color },
                { label: 'median', value: s.median, col: '#e2e8f0' },
                { label: 'std', value: s.std, col: '#94a3b8' },
              ].map((x) => (
                <div key={x.label}>
                  <div className="text-lg font-bold" style={{ color: x.col }}>{x.value}</div>
                  <div className="text-xs text-slate-500">{x.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Mean max_dep by Writing Style</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statsArr} margin={{ left: 10, right: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="style"
              angle={-20}
              textAnchor="end"
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'max_dep', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
            />
            <Bar dataKey="mean" radius={[4, 4, 0, 0]}>
              {statsArr.map((s) => <Cell key={s.rawStyle} fill={s.color} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Interpretation</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-3">
          <strong className="text-slate-300">Stream of consciousness</strong> style typically shows the highest
          max_dep values, reflecting its characteristic long, syntactically intertwined sentences.
        </p>
        <p className="text-sm text-slate-400 leading-relaxed mb-3">
          <strong className="text-slate-300">For children</strong> and <strong className="text-slate-300">journalistic</strong>{' '}
          styles tend to have lower max_dep — consistent with their preference for short, direct sentences.
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Legalistic</strong> text shows high variance — legal prose alternates
          between complex nested clauses and short formulaic declarations.
        </p>
      </div>
    </div>
  )
}
