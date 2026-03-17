import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { FileText, User, Bot, ShieldCheck, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClaimTimeline } from '@/types/claim'

const eventIcons: Record<string, React.ReactNode> = {
  claim_submitted: <FileText size={14} />,
  documents_received: <FileText size={14} />,
  assigned: <User size={14} />,
  under_review: <Clock size={14} />,
  approved: <CheckCircle2 size={14} />,
  rejected: <AlertCircle size={14} />,
  pending_info: <AlertCircle size={14} />,
  fraud_check: <ShieldCheck size={14} />,
  default: <Bot size={14} />,
}

const roleStyles = {
  policyholder: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
  adjuster: 'bg-brand-teal/10 text-brand-teal border-brand-teal/20',
  system: 'bg-bg-elevated text-text-muted border-border-DEFAULT',
}

interface TimelineProps {
  events: ClaimTimeline[]
  className?: string
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn('relative space-y-0', className)}>
      {events.map((event, i) => {
        const icon = eventIcons[event.event] || eventIcons.default
        const isLast = i === events.length - 1

        return (
          <motion.div
            key={event.id}
            custom={i}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex gap-4"
          >
            {/* Line + icon */}
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-8 h-8 rounded-full border flex items-center justify-center shrink-0 z-10',
                roleStyles[event.actorRole],
              )}>
                {icon}
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-border-subtle mt-1 mb-1 ml-0" />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-6 flex-1 min-w-0', isLast && 'pb-0')}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <span className="text-sm font-medium text-text-primary">{event.event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  <span className="mx-2 text-text-muted">·</span>
                  <span className="text-xs text-text-muted">{event.actor}</span>
                </div>
                <span className="text-xs text-text-muted shrink-0 font-mono">
                  {format(new Date(event.timestamp), 'MMM d, HH:mm')}
                </span>
              </div>
              <p className="text-sm text-text-secondary">{event.description}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
