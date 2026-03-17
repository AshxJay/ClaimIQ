import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  lines?: number
  rounded?: boolean
}

export function Skeleton({ className, rounded = false }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-bg-elevated',
        rounded ? 'rounded-full' : 'rounded-lg',
        'before:absolute before:inset-0',
        'before:bg-shimmer before:bg-[length:200%_100%]',
        'before:animate-shimmer',
        className,
      )}
    />
  )
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-bg-card rounded-2xl border border-border-subtle p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10" rounded />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0">
      <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-border-subtle">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="grid grid-cols-5 gap-4 px-4 py-4 border-b border-border-subtle/50">
          {Array.from({ length: 5 }).map((_, ci) => (
            <Skeleton key={ci} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="bg-bg-card rounded-2xl border border-border-subtle p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8" rounded />
      </div>
      <Skeleton className="h-10 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}
