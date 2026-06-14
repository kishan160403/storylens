export default function LoadingSpinner({ size = 'md', label = 'Analysing...' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-16 h-16' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-indigo-400 border-r-violet-400 animate-spin" />
      </div>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  )
}
