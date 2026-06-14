import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { storiesAPI } from '../api/client'

const FEATURES = [
  {
    to: '/zipf', icon: '📊', title: "Zipf's Law",
    desc: 'Word frequency distributions across 6 writing styles — does LLM text obey Zipf?',
    color: 'from-indigo-500/20 to-indigo-600/5',
  },
  {
    to: '/dependency', icon: '🌳', title: 'Dependency Parsing',
    desc: 'Syntactic complexity measured via max dependency arc span per sentence.',
    color: 'from-violet-500/20 to-violet-600/5',
  },
  {
    to: '/style', icon: '✍️', title: 'Style Fingerprinting',
    desc: '10 stylometric features — word length, TTR, passive voice, POS ratios and more.',
    color: 'from-cyan-500/20 to-cyan-600/5',
  },
  {
    to: '/classify', icon: '🤖', title: 'Text Classification',
    desc: 'Word2Vec, BERT and ModernBERT compared on country prediction.',
    color: 'from-emerald-500/20 to-emerald-600/5',
  },
  {
    to: '/sentiment', icon: '💭', title: 'Sentiment & Emotion',
    desc: 'RoBERTa sentiment scoring and multi-model emotion detection per story theme.',
    color: 'from-rose-500/20 to-rose-600/5',
  },
  {
    to: '/qa', icon: '❓', title: 'Question Answering',
    desc: 'Extractive QA with SQuAD BERT — zero-shot evaluation and fine-tuning.',
    color: 'from-amber-500/20 to-amber-600/5',
  },
]

export default function Home() {
  const [total, setTotal] = useState(null)

  useEffect(() => {
    storiesAPI.list({ limit: 1 }).then((d) => setTotal(d.total)).catch(() => {})
  }, [])

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Natural Language Processing · Interactive Dashboard
        </div>
        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">StoryLens</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          An NLP intelligence platform for exploring{' '}
          <span className="text-slate-200 font-medium">{total ?? '602'} synthetic stories</span>{' '}
          — from linguistic analysis to transformer-based classification and question answering.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            to="/stories"
            className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors glow"
          >
            Explore Stories
          </Link>
          <Link
            to="/zipf"
            className="px-6 py-3 rounded-xl glass hover:bg-white/5 text-slate-300 transition-colors"
          >
            Start Analysis →
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {FEATURES.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="relative glass rounded-2xl p-6 overflow-hidden hover:scale-[1.02] transition-all"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-60`} />
            <div className="relative">
              <span className="text-3xl block mb-4">{f.icon}</span>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Dataset summary */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-6">Dataset at a Glance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Stories', value: '602' },
            { label: 'Writing Styles', value: '6' },
            { label: 'Story Themes', value: '5' },
            { label: 'Countries', value: '4' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
