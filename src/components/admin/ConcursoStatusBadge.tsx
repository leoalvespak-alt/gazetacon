import { ConcursoStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/concurso'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ConcursoStatusBadgeProps {
  status: ConcursoStatus
  className?: string
}

export function ConcursoStatusBadge({ status, className }: ConcursoStatusBadgeProps) {
  const label = STATUS_LABELS[status] || status
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border-0',
        colorClass,
        className
      )}
    >
      {label}
    </Badge>
  )
}
