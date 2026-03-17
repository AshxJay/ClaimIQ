import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ClaimStatus, ClaimType, ClaimPriority } from '@/types/claim'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
  animate?: boolean
}

const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
  default: {
    badge: 'bg-bg-elevated text-text-secondary border-border-DEFAULT',
    dot: 'bg-text-muted',
  },
  success: {
    badge: 'bg-status-success/10 text-status-success border-status-success/20',
    dot: 'bg-status-success',
  },
  warning: {
    badge: 'bg-status-warning/10 text-status-warning border-status-warning/20',
    dot: 'bg-status-warning',
  },
  danger: {
    badge: 'bg-status-danger/10 text-status-danger border-status-danger/20',
    dot: 'bg-status-danger',
  },
  info: {
    badge: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
    dot: 'bg-brand-blue',
  },
  muted: {
    badge: 'bg-bg-card text-text-muted border-border-subtle',
    dot: 'bg-text-muted',
  },
}

export function Badge({ variant = 'default', children, className, dot = true, animate = true }: BadgeProps) {
  const styles = variantStyles[variant]
  const Comp = animate ? motion.span : 'span'
  const motionProps = animate
    ? { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.2 } }
    : {}

  return (
    <Comp
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles.badge,
        className,
      )}
      {...motionProps}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', styles.dot)} />}
      {children}
    </Comp>
  )
}

// Status-specific badges
const statusConfig: Record<ClaimStatus, { variant: BadgeVariant; label: string }> = {
  draft: { variant: 'muted', label: 'Draft' },
  submitted: { variant: 'info', label: 'Submitted' },
  under_review: { variant: 'warning', label: 'Under Review' },
  pending_info: { variant: 'warning', label: 'Pending Info' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'danger', label: 'Rejected' },
  closed: { variant: 'muted', label: 'Closed' },
}

export function StatusBadge({ status }: { status: ClaimStatus }) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

const typeConfig: Record<ClaimType, string> = {
  auto: '🚗 Auto',
  home: '🏠 Home',
  health: '❤️ Health',
  life: '💙 Life',
  travel: '✈️ Travel',
  business: '🏢 Business',
  liability: '⚖️ Liability',
}

export function ClaimTypeBadge({ type }: { type: ClaimType }) {
  return <Badge variant="default" dot={false}>{typeConfig[type]}</Badge>
}

const priorityConfig: Record<ClaimPriority, { variant: BadgeVariant; label: string }> = {
  low: { variant: 'muted', label: 'Low' },
  medium: { variant: 'info', label: 'Medium' },
  high: { variant: 'warning', label: 'High' },
  critical: { variant: 'danger', label: 'Critical' },
}

export function PriorityBadge({ priority }: { priority: ClaimPriority }) {
  const config = priorityConfig[priority]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
