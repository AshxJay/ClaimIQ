import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercent?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const variantStyles = {
  default: 'bg-brand-blue',
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  danger: 'bg-status-danger',
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  variant = 'default',
  size = 'md',
  animated = true,
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-text-secondary">{label}</span>}
          {showPercent && <span className="text-xs font-mono text-text-muted">{Math.round(percent)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-bg-elevated rounded-full overflow-hidden', sizeStyles[size])}>
        <motion.div
          className={cn('h-full rounded-full', variantStyles[variant])}
          initial={animated ? { width: 0 } : { width: `${percent}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
    </div>
  )
}

// Multi-step progress bar
interface StepProgressProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      {steps.map((step, i) => {
        const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'upcoming'
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  backgroundColor:
                    state === 'done'
                      ? '#10B981'
                      : state === 'active'
                      ? '#3B82F6'
                      : 'rgba(255,255,255,0.08)',
                  boxShadow:
                    state === 'active'
                      ? '0 0 12px rgba(59,130,246,0.5)'
                      : 'none',
                }}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10',
                  state === 'done'
                    ? 'border-status-success text-white'
                    : state === 'active'
                    ? 'border-brand-blue text-white'
                    : 'border-border-DEFAULT text-text-muted',
                )}
              >
                {state === 'done' ? '✓' : i + 1}
              </motion.div>
              <span
                className={cn(
                  'text-xs whitespace-nowrap font-medium',
                  state === 'active' ? 'text-brand-blue' : state === 'done' ? 'text-status-success' : 'text-text-muted',
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 relative overflow-hidden rounded-full bg-bg-elevated mt-[-18px]">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-brand-blue"
                  animate={{ width: i < currentStep ? '100%' : '0%' }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
