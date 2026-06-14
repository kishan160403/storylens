import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts'
import { styleAPI } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = ['#818cf8','#a78bfa','#22d3ee','#34d399','#fb7185','#fbbf24']

const METRICS = [
  'avg_word_length','avg_sentence_length','type_token_ratio',
  'punct_density','passive_ratio','noun_ratio','adj_ratio',
  'adv_ratio','verb_ratio','comma_per_sentence',
]
const LABELS = {
  avg_word_length: 'Word Length',
  avg_sentence_length: 'Sent. Length',
  type_token_ratio: 'Vocab Richness',
  punct_density: 'Punct. Density',
  passive_ratio: 'Passive Voice',
  noun_ratio: 'Noun Ratio',
  adj_ratio: 'Adj. Ratio',
  adv_ratio: 'Adv. Ratio',
  verb_ratio: 'Verb Ratio',
  comma_per_sentence: 'Commas/Sent.',
}

function normalise(values) {
  const min = Math.min(...values), max = Math.max(...values)
  return values.map((v) => (max === min ? 0.5 : (v - min) / (max - min)))
}

export default function StyleAnalysis() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])

  useEffect(() => {
    styleAPI.features().then((d) => {
      setData(d)
      setSelected(d.slice(0, 3).map((s) => s.style))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Computing stylometric features..." />
  if (!data) return null

  const radarData = METRICS.map((metric) => {
    const vals = data.map((d) => d[metric] ?? 0)
    const normed = normalise(vals)
    const row = { metric: LABELS[metric] }
    data.forEach((d, i) => { row[d.style] = Math.round(normed[i] * 100) / 100 })
    return row
  })

  const toggle = (style) =>
    setSelected((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    )

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Style Fingerprinting</h1>
        <p className="text-slate-400 max-w-2xl">
          Ten stylometric features aggregated per writing style — word length, sentence length,
          vocabulary richness (TTR), POS ratios, passive voice frequency, and punctuation density.
        </p>
      </div>

      {/* Style toggles */}
      <div className="flex flex-wrap gap-2 mb-8">
        {data.map((d, i) => (
          <button
            key={d.style}
            onClick={() => toggle(d.style)}
            className="px-3 py-1.5 rounded-lg text-sm transition-all"
            style={
              selected.includes(d.style)
                ? { background: COLORS[i] + '22', border: `1px solid ${COLORS[i]}55`, color: COLORS[i] }
                : { background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }
            }
          >
            {d.style}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Stylometric Radar (normalised 0–1)</h3>
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }}
              />
              {data
                .filter((d) => selected.includes(d.style))
                .map((d, idx) => {
                  const ci = data.findIndex((x) => x.style === d.style)
                  return (
                    <Radar
                      key={d.style}
                      name={d.style}
                      dataKey={d.style}
                      stroke={COLORS[ci]}
                      fill={COLORS[ci]}
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                  )
                })}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Raw table */}
        <div className="glass rounded-2xl p-6 overflow-x-auto">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Raw Feature Values</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 py-2 pr-3">Feature</th>
                {data.map((d, i) => (
                  <th key={d.style} className="text-center py-2 px-2" style={{ color: COLORS[i] }}>
                    {d.style.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => (
                <tr key={m} className="border-b border-slate-800 hover:bg-white/2">
                  <td className="text-slate-400 py-2 pr-3 whitespace-nowrap">{LABELS[m]}</td>
                  {data.map((d, i) => (
                    <td key={d.style} className="text-center py-2 px-2 font-mono text-slate-300">
                      {d[m] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
