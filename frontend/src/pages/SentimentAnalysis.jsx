import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { sentimentAPI } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

const THEMES = ['political rebellion','scientific discovery','a dangerous voyage','love','a mysterious conspiracy']
const THEME_COLORS = ['#818cf8','#22d3ee','#fb7185','#34d399','#fbbf24']
const SENT_COLORS = { positive: '#34d399', negative: '#fb7185', neutral: '#818cf8' }

function shortTheme(t) {
  return t
    .replace('a dangerous voyage', 'voyage')
    .replace('a mysterious conspiracy', 'conspiracy')
    .replace('scientific discovery', 'science')
    .replace('political rebellion', 'rebellion')
}

export default function SentimentAnalysis() {
  const [tab, setTab] = useState('sentiment')
  const [sentData, setSentData] = useState(null)
  const [emoData, setEmoData] = useState(null)
  const [loading, setLoading] = useState(false)

  const runSentiment = async () => {
    setLoading(true)
    try { setSentData(await sentimentAPI.sentiment(30)) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const runEmotion = async () => {
    setLoading(true)
    try { setEmoData(await sentimentAPI.emotion(20)) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const sentChartData = sentData
    ? Object.entries(sentData.results).map(([theme, scores]) => ({
        theme: shortTheme(theme),
        ...scores,
      }))
    : []

  const sentLabels = sentChartData[0]
    ? Object.keys(sentChartData[0]).filter((k) => k !== 'theme')
    : []

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Sentiment & Emotion</h1>
        <p className="text-slate-400 max-w-2xl">
          Sentiment of final sentences per theme using RoBERTa. Emotion detection across
          all sentences using two HuggingFace models — results compared per story theme.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'sentiment', label: '😊 Sentiment' },
          { id: 'emotion', label: '🎭 Emotion' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              tab === id
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'glass text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sentiment tab */}
      {tab === 'sentiment' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 text-sm text-slate-400 leading-relaxed">
            Using{' '}
            <code className="font-mono text-indigo-300">cardiffnlp/twitter-roberta-base-sentiment-latest</code>,
            the final sentence of each story is scored for positive, neutral, and negative sentiment.
            Scores are averaged over stories per theme to reveal emotional patterns.
          </div>

          <button
            onClick={runSentiment}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {loading ? 'Running...' : 'Run Sentiment Analysis'}
          </button>

          {loading && <LoadingSpinner label="Scoring last sentences with RoBERTa..." />}

          {sentData && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">
                Average Sentiment Probability by Theme
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sentChartData} margin={{ bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="theme"
                    angle={-20}
                    textAnchor="end"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    label={{ value: 'Avg. probability', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
                  />
                  <Legend />
                  {sentLabels.map((label) => (
                    <Bar key={label} dataKey={label} fill={SENT_COLORS[label.toLowerCase()] ?? '#818cf8'} radius={[3,3,0,0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Emotion tab */}
      {tab === 'emotion' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 text-sm text-slate-400 leading-relaxed">
            Sentences from each story are scored with two emotion models:{' '}
            <code className="font-mono text-violet-300">cardiffnlp/twitter-roberta-base-emotion-multilabel-latest</code>{' '}
            and{' '}
            <code className="font-mono text-cyan-300">j-hartmann/emotion-english-distilroberta-base</code>.
            Emotion vectors are averaged per story then per theme.
          </div>

          <button
            onClick={runEmotion}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {loading ? 'Running...' : 'Run Emotion Analysis'}
          </button>

          {loading && <LoadingSpinner label="Running two emotion models across all sentences..." />}

          {emoData &&
            ['model_1', 'model_2'].map((key, mi) => {
              const model = emoData[key]
              const emotions = Object.keys(Object.values(model.results)[0] || {})
              const chartData = THEMES.map((theme) => ({
                theme: shortTheme(theme),
                ...(model.results[theme] ?? {}),
              }))
              return (
                <div key={key} className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">
                    Model {mi + 1}: {model.name}
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} margin={{ bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="theme"
                        angle={-20}
                        textAnchor="end"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }}
                      />
                      <Legend />
                      {emotions.slice(0, 6).map((emo, i) => (
                        <Bar key={emo} dataKey={emo} fill={THEME_COLORS[i % 5]} radius={[2,2,0,0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
