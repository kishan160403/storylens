import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { storiesAPI, qaAPI } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { ArrowLeft, HelpCircle } from 'lucide-react'

export default function StoryDetail() {
  const { index } = useParams()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qaAnswer, setQaAnswer] = useState(null)
  const [selectedQ, setSelectedQ] = useState(null)
  const [qaLoading, setQaLoading] = useState(false)

  useEffect(() => {
    storiesAPI.get(Number(index)).then(setStory).finally(() => setLoading(false))
  }, [index])

  const askQuestion = async (q) => {
    if (!story) return
    setSelectedQ(q)
    setQaLoading(true)
    setQaAnswer(null)
    try {
      setQaAnswer(await qaAPI.ask(q, story.story))
    } catch {
      setQaAnswer({ answer: 'QA model not available — ensure the backend is running with transformers installed.' })
    } finally {
      setQaLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!story) return <div className="p-10 text-slate-400">Story not found.</div>

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/stories" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to stories
      </Link>

      <div className="glass rounded-2xl p-8 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {[story.style, story.theme, story.country, story.person, story.setting]
            .filter(Boolean)
            .map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-300">
                {tag}
              </span>
            ))}
        </div>
        <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{story.story}</p>
      </div>

      {(story.question1 || story.question2) && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            Story Questions
          </h3>
          <div className="space-y-3">
            {[
              { q: story.question1, a: story.answer1 },
              { q: story.question2, a: story.answer2 },
            ]
              .filter((x) => x.q)
              .map(({ q, a }, i) => (
                <div key={i} className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-sm text-slate-300 font-medium mb-1">{q}</p>
                  <p className="text-xs text-slate-500 mb-3">Ground truth: {a}</p>
                  <button
                    onClick={() => askQuestion(q)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                  >
                    Ask SQuAD model →
                  </button>
                  {selectedQ === q && (
                    <div className="mt-3">
                      {qaLoading ? (
                        <LoadingSpinner size="sm" label="BERT extracting answer..." />
                      ) : qaAnswer ? (
                        <div className="text-sm p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                          <span className="font-medium">Model: </span>
                          {qaAnswer.answer}
                          {qaAnswer.score != null && (
                            <span className="ml-2 text-xs opacity-60">
                              (conf: {(qaAnswer.score * 100).toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
