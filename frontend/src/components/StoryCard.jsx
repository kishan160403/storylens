import { Link } from 'react-router-dom'

const STYLE_COLORS = {
  legalistic: 'text-amber-400 bg-amber-400/10',
  descriptive: 'text-emerald-400 bg-emerald-400/10',
  'hard-boiled': 'text-rose-400 bg-rose-400/10',
  'stream of consciousness': 'text-violet-400 bg-violet-400/10',
  journalistic: 'text-cyan-400 bg-cyan-400/10',
  'for children': 'text-indigo-400 bg-indigo-400/10',
}

const THEME_ICONS = {
  'political rebellion': '⚡',
  'scientific discovery': '🔬',
  'a dangerous voyage': '⛵',
  love: '❤️',
  'a mysterious conspiracy': '🕵️',
}

export default function StoryCard({ story }) {
  const styleColor = STYLE_COLORS[story.style] || 'text-slate-400 bg-slate-400/10'
  const icon = THEME_ICONS[story.theme] || '📖'

  return (
    <Link
      to={`/stories/${story.index}`}
      className="glass rounded-xl p-4 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all block"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styleColor}`}>
            {story.style}
          </span>
        </div>
        <span className="text-xs text-slate-500">#{story.index}</span>
      </div>
      <p className="text-xs text-slate-400 mb-2">
        {story.theme} · {story.country} · {story.person}
      </p>
      <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">{story.preview}</p>
    </Link>
  )
}
