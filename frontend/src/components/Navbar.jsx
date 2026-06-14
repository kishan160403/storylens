import { Link, useLocation } from 'react-router-dom'
import { Telescope } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/stories', label: 'Stories' },
  { to: '/zipf', label: "Zipf's Law" },
  { to: '/dependency', label: 'Dependency' },
  { to: '/style', label: 'Style' },
  { to: '/classify', label: 'Classify' },
  { to: '/sentiment', label: 'Sentiment' },
  { to: '/qa', label: 'Q&A' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Telescope className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold gradient-text">StoryLens</span>
        </Link>
        <div className="flex items-center gap-1 overflow-x-auto">
          {NAV.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                pathname === to
                  ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
