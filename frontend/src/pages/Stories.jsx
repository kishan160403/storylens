import { useState, useEffect, useCallback } from 'react'
import { storiesAPI } from '../api/client'
import StoryCard from '../components/StoryCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Search } from 'lucide-react'

const STYLES = ['legalistic','descriptive','hard-boiled','stream of consciousness','journalistic','for children']
const THEMES = ['political rebellion','scientific discovery','a dangerous voyage','love','a mysterious conspiracy']
const COUNTRIES = ['USA','China','Northern Ireland','Russia']

export default function Stories() {
  const [stories, setStories] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ style: '', theme: '', country: '', search: '' })

  const fetchStories = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 24,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      }
      const data = await storiesAPI.list(params)
      setStories(data.stories)
      setTotal(data.total)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { setPage(1) }, [filters])
  useEffect(() => { fetchStories() }, [fetchStories])

  const totalPages = Math.ceil(total / 24)

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Story Explorer</h1>
        <p className="text-slate-400">Browse all 602 synthetic stories with filters</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            className="bg-transparent text-slate-200 text-sm outline-none placeholder-slate-500 w-full"
            placeholder="Search stories..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>
        {[
          { key: 'style', opts: STYLES, placeholder: 'All Styles' },
          { key: 'theme', opts: THEMES, placeholder: 'All Themes' },
          { key: 'country', opts: COUNTRIES, placeholder: 'All Countries' },
        ].map(({ key, opts, placeholder }) => (
          <select
            key={key}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none"
            value={filters[key]}
            onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
          >
            <option value="">{placeholder}</option>
            {opts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        <button
          onClick={() => setFilters({ style: '', theme: '', country: '', search: '' })}
          className="text-xs text-slate-400 hover:text-slate-200 px-2"
        >
          Clear
        </button>
      </div>

      <p className="text-sm text-slate-500 mb-4">{total} stories found</p>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((s) => <StoryCard key={s.index} story={s} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg glass text-sm disabled:opacity-30 hover:bg-white/5"
              >
                Prev
              </button>
              <span className="text-sm text-slate-400">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg glass text-sm disabled:opacity-30 hover:bg-white/5"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
