import { useState, useEffect } from 'react'
import { qaAPI, storiesAPI } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { Send, BookOpen, GitBranch } from 'lucide-react'

const TABS = [
  { id: 'interactive', label: 'Interactive QA', icon: Send },
  { id: 'dataset', label: 'Dataset', icon: BookOpen },
  { id: 'finetune', label: 'Fine-tuning', icon: GitBranch },
]

export default function QuestionAnswering() {
  const [tab, setTab] = useState('interactive')

  // Interactive
  const [storyIndex, setStoryIndex] = useState(0)
  const [story, setStory] = useState(null)
  const [customQ, setCustomQ] = useState('')
  const [answer, setAnswer] = useState(null)
  const [qaLoading, setQaLoading] = useState(false)
  const [storyLoading, setStoryLoading] = useState(false)

  // Dataset
  const [sample, setSample] = useState(null)
  const [sampleLoading, setSampleLoading] = useState(false)

  // Fine-tune
  const [ftConfig, setFtConfig] = useState(null)
  const [ftLoading, setFtLoading] = useState(false)

  const loadStory = async (idx) => {
    setStoryLoading(true)
    setStory(null)
    setAnswer(null)
    try {
      const s = await storiesAPI.get(idx)
      setStory(s)
      setCustomQ(s.question1 || '')
    } catch {} finally { setStoryLoading(false) }
  }

  useEffect(() => { loadStory(0) }, [])

  const askQuestion = async () => {
    if (!story || !customQ.trim()) return
    setQaLoading(true)
    setAnswer(null)
    try {
      setAnswer(await qaAPI.ask(customQ, story.story))
    } catch {
      setAnswer({ answer: 'Backend unavailable or model not loaded. Start the server and ensure transformers is installed.' })
    } finally { setQaLoading(false) }
  }

  const loadSample = async () => {
    setSampleLoading(true)
    try { setSample(await qaAPI.datasetSample(8)) }
    catch {
      setSample({ error: 'stories_annotated.json not found in backend/. Place it there and restart the server.' })
    } finally { setSampleLoading(false) }
  }

  const loadFtConfig = async () => {
    setFtLoading(true)
    try { setFtConfig(await qaAPI.finetuneConfig()) }
    catch {} finally { setFtLoading(false) }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Question Answering</h1>
        <p className="text-slate-400 max-w-2xl">
          Extractive QA using <code className="font-mono text-indigo-300">deepset/bert-base-uncased-squad2</code>.
          The model locates answer spans inside a story context. Domain adaptation via fine-tuning
          improves performance on this specific corpus.
        </p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
              tab === id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'glass text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Interactive ── */}
      {tab === 'interactive' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-slate-400">Story index (0–601):</label>
              <input
                type="number"
                min={0}
                max={601}
                value={storyIndex}
                onChange={(e) => setStoryIndex(Number(e.target.value))}
                className="w-20 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none"
              />
              <button
                onClick={() => loadStory(storyIndex)}
                className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm transition-colors"
              >
                Load
              </button>
            </div>

            {storyLoading && <LoadingSpinner size="sm" label="Loading story..." />}

            {story && (
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[story.style, story.theme, story.country].map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">{tag}</span>
                  ))}
                </div>
                <div className="text-sm text-slate-400 leading-relaxed max-h-48 overflow-y-auto bg-slate-900/50 rounded-xl p-4">
                  {story.story}
                </div>

                {(story.question1 || story.question2) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs text-slate-500 self-center">Preset questions:</span>
                    {[story.question1, story.question2].filter(Boolean).map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setCustomQ(q)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors text-left max-w-xs truncate"
                      >
                        Q{i + 1}: {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <label className="text-sm text-slate-400 block mb-2">Ask a question about this story:</label>
            <div className="flex gap-3">
              <input
                className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500/50 transition-colors"
                placeholder="What does the protagonist discover?"
                value={customQ}
                onChange={(e) => setCustomQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
              />
              <button
                onClick={askQuestion}
                disabled={qaLoading || !story}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {qaLoading && <LoadingSpinner size="sm" label="BERT extracting answer span..." />}

          {answer && (
            <div className="glass rounded-2xl p-6 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-sm font-medium text-amber-300">Extracted Answer</span>
                {answer.score != null && (
                  <span className="text-xs text-slate-500 ml-auto">
                    Confidence: {(answer.score * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-slate-200 leading-relaxed">{answer.answer}</p>
              {answer.model && (
                <p className="text-xs text-slate-500 mt-3 font-mono">{answer.model}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Dataset ── */}
      {tab === 'dataset' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 text-sm text-slate-400 leading-relaxed">
            <p className="mb-3">
              The <code className="font-mono text-cyan-300">process_annotated_story(index)</code> function
              strips annotation tags (<code className="font-mono text-slate-300">[START_Q1]…[END_Q1]</code>) and
              returns <code className="font-mono text-indigo-300">answer_start</code> such that{' '}
              <code className="font-mono text-emerald-300">context[answer_start : answer_start + len(answer_text)] == answer_text</code>.
            </p>
            <p>
              648 QA pairs from "descriptive", "hard-boiled", and "for children" stories are evaluated
              against the off-the-shelf SQuAD model. Requires{' '}
              <code className="font-mono text-slate-300">stories_annotated.json</code> in backend/.
            </p>
          </div>

          <button
            onClick={loadSample}
            disabled={sampleLoading}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm transition-colors"
          >
            {sampleLoading ? 'Loading...' : 'Load Dataset Sample'}
          </button>

          {sampleLoading && <LoadingSpinner size="sm" label="Building dataset from annotated stories..." />}

          {sample?.error && (
            <div className="glass rounded-xl p-4 border border-rose-500/20 text-rose-300 text-sm">
              {sample.error}
            </div>
          )}

          {sample?.sample && (
            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-slate-400 mb-4">
                Total pairs: <strong className="text-slate-200">{sample.total}</strong>
                {sample.total !== 648 && (
                  <span className="text-amber-400 ml-2">(expected ~648)</span>
                )}
              </p>
              <div className="space-y-3">
                {sample.sample.map((pair) => (
                  <div key={pair.id} className="bg-slate-900/60 rounded-xl p-4 text-xs">
                    <div className="flex gap-2 mb-2">
                      <span className="font-mono text-slate-500">{pair.id}</span>
                      <span className="text-indigo-300">{pair.style}</span>
                    </div>
                    <p className="text-amber-300 mb-1"><strong>Q:</strong> {pair.question}</p>
                    <p className="text-emerald-300 mb-1"><strong>A:</strong> {pair.answer_text}</p>
                    <p className="text-slate-500">
                      <strong>answer_start:</strong> {pair.answer_start}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Fine-tuning ── */}
      {tab === 'finetune' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 text-sm text-slate-400 leading-relaxed">
            Fine-tune <code className="font-mono text-indigo-300">AutoModelForQuestionAnswering</code> on the
            stories corpus. The model learns to predict start and end token positions of answers within the
            concatenated <code className="font-mono text-slate-300">[CLS] question [SEP] context [SEP]</code> input.
            Decreasing training loss over epochs confirms the model is learning domain-specific patterns.
          </div>

          <button
            onClick={loadFtConfig}
            disabled={ftLoading}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm transition-colors"
          >
            {ftLoading ? 'Loading...' : 'Load Fine-tuning Config'}
          </button>

          {ftConfig && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-amber-400" />
                  Model Architecture
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Input', desc: ftConfig.architecture.input, color: '#818cf8' },
                    { label: 'Backbone', desc: ftConfig.architecture.backbone, color: '#22d3ee' },
                    { label: 'start_logits', desc: ftConfig.architecture.output_heads.start_logits, color: '#34d399' },
                    { label: 'end_logits', desc: ftConfig.architecture.output_heads.end_logits, color: '#34d399' },
                    { label: 'Inference', desc: ftConfig.architecture.inference, color: '#fbbf24' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-3">
                      <span className="text-xs font-mono w-24 shrink-0" style={{ color: row.color }}>
                        {row.label}
                      </span>
                      <span className="text-xs text-slate-400">{row.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Training Notes</h3>
                <ul className="space-y-2">
                  {ftConfig.training_notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
