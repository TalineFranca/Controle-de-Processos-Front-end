import { cn } from '@/lib/utils'
import { SIT_LABEL, SIT_COLOR } from '@/lib/constants'

export function Badge({ situacao, className }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', SIT_COLOR[situacao] || 'bg-gray-100 text-gray-600', className)}>
      {SIT_LABEL[situacao] || situacao}
    </span>
  )
}

export function Tag({ children, color = 'gray' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', colors[color])}>
      {children}
    </span>
  )
}
