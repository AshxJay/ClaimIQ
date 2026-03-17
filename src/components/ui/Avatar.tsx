import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  imageUrl?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  role?: string
}

const sizeStyles = {
  xs: 'w-6 h-6 text-2xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

// Generate a consistent color from name
function nameToColor(name: string): string {
  const colors = [
    'from-brand-blue to-blue-600',
    'from-brand-teal to-teal-600',
    'from-purple-500 to-purple-700',
    'from-status-success to-emerald-600',
    'from-status-warning to-amber-600',
    'from-pink-500 to-pink-700',
    'from-indigo-500 to-indigo-700',
  ]
  let hash = 0
  for (const char of name) hash = char.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({ name, imageUrl, size = 'md', className, role }: AvatarProps) {
  const initials = getInitials(name)
  const gradient = nameToColor(name)

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold text-white overflow-hidden',
          `bg-gradient-to-br ${gradient}`,
          sizeStyles[size],
        )}
        title={name}
        aria-label={name}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          initials
        )}
      </div>
      {role && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-deep bg-status-success" title={role} />
      )}
    </div>
  )
}

export function AvatarGroup({ names, max = 3 }: { names: string[]; max?: number }) {
  const visible = names.slice(0, max)
  const overflow = names.length - max

  return (
    <div className="flex items-center">
      {visible.map((name, i) => (
        <div key={name} className="-ml-2 first:ml-0" style={{ zIndex: visible.length - i }}>
          <Avatar name={name} size="sm" className="ring-2 ring-bg-card" />
        </div>
      ))}
      {overflow > 0 && (
        <div className="-ml-2 w-8 h-8 rounded-full bg-bg-elevated border border-border-DEFAULT flex items-center justify-center text-xs text-text-secondary font-medium ring-2 ring-bg-card z-0">
          +{overflow}
        </div>
      )}
    </div>
  )
}
