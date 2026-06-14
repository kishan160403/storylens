import { useState, useEffect } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { zipfAPI } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

const STYLES = ['legalistic','descriptive','hard-boiled','stream of consciousness','journalistic','for children']
const COLORS = ['#818cf8','#a78bfa','#22d3ee','#34d399','#fb7185','#fbbf24']

export default function ZipfAnalysis() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(STYLES[0])

  useEffect(() => {
    zipfAPI.all().then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Computing Zipf distributions..." />

  const styleData = data?.[selected]
  const colorIdx = STYLES.indexOf(selected)

  const scatterPoints = styleData?.log_ranks?.map((r, i) => ({
    rank: Math.round(r * 100) / 100,
    freq: Math.round(styleData.log_freqs[i] * 100) / 100,
  })) ?? []

  const fittedPoints = styleData?.log_ranks?.map((r, i) => ({
    rank: Math.round(r * 100) / 100,
    freq: Math.round(styleData.fitted_line[i] * 100) / 100,
  })) ?? []

  const slopeData = STYLES.map((s, i) => ({
    style: s.replace('stream of consciousness', 'stream…'),
    slope: data?.[s]?.slope ?? 0,
    color: COLORS[i],
  }))

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Zipf's Law Analysis</h1>
        <p className="text-slate-400 max-w-2xl">
          Zipf's law predicts word frequency ∝ 1/rank — a straight line on a log-log plot with slope ≈ −1.
          Tested here across 6 style-grouped corpora of LLM-generated text.
        </p>
      </div>

      {/* Style selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {STYLES.map((s, i) => (
          <button
            key={s}
            onClick={() => setSelected(s)}
            className="px-3 py-1.5 rounded-lg text-sm transition-all"
            style={
              selected === s
                ? { background: COLORS[i] + '33', border: `1px solid ${COLORS[i]}55`, color: COLORS[i] }
                : { background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {styleData && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Stories', value: styleData.num_stories },
              { label: 'Vocab size', value: styleData.vocab_size?.toLocaleString() },
              { label: 'Zipf slope', value: styleData.slope },
              { label: 'Intercept', value: styleData.intercept },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Log-log plot */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-1">Log Rank vs Log Frequency</h3>
              <p className="text-xs text-slate-500 mb-4">
                Slope = {styleData.slope} (ideal Zipf ≈ −1.0)
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="rank"
                    name="log(rank)"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    label={{ value: 'log₁₀(rank)', position: 'insideBottom', fill: '#64748b', fontSize: 11, dy: 10 }}
                  />
                  <YAxis
                    dataKey="freq"
                    name="log(freq)"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    label={{ value: 'log₁₀(freq)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
                  />
                  <Scatter name="Observed" data={scatterPoints} fill={COLORS[colorIdx]} opacity={0.5} r={2} />
                  <Scatter
                    name="Zipf fit"
                    data={fittedPoints}
                    fill="#22d3ee"
                    opacity={0.9}
                    r={1.5}
                    line={{ stroke: '#22d3ee', strokeWidth: 1.5 }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Top words */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Top 20 Words (stopwords excluded)</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {styleData.top_words?.map((w, i) => (
                  <div key={w.word} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                    <span className="text-sm text-slate-300 w-28 font-mono">{w.word}</span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(w.freq / styleData.top_words[0].freq) * 100}%`,
                          background: `linear-gradient(90deg, ${COLORS[colorIdx]}, #22d3ee)`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-10 text-right">{w.freq}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slope comparison */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-1">Slope Comparison Across Styles</h3>
            <p className="text-xs text-slate-500 mb-4">Slopes closer to −1.0 indicate stronger Zipf adherence</p>
            <div className="space-y-3">
              {[...slopeData].sort((a, b) => a.slope - b.slope).map((s) => (
                <div key={s.style} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-36 shrink-0">{s.style}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(Math.abs(s.slope) / 1.5 * 100, 100)}%`, background: s.color }}
                    />
                  </div>
                  <span className="text-xs font-mono w-14 text-right" style={{ color: s.color }}>
                    {s.slope}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
