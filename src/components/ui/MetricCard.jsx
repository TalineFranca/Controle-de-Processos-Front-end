import { cn } from '@/lib/utils'

export function MetricCard({ label, value, sub, icon: Icon, color = 'default', onClick }) {
  const colors = {
    default: 'bg-white border-gray-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    amber: 'bg-amber-50 border-amber-200',
    blue: 'bg-blue-50 border-blue-200',
  }
  const textColors = {
    default: 'text-gray-900',
    green: 'text-pm-600',
    red: 'text-red-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
  }
  return (
    <div
      onClick={onClick}
      className={cn('rounded-xl border p-4 flex flex-col gap-1', colors[color], onClick && 'cursor-pointer hover:shadow-sm transition-shadow')}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={16} className="text-gray-400" />}
      </div>
      <span className={cn('text-3xl font-semibold', textColors[color])}>{value ?? '—'}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}
