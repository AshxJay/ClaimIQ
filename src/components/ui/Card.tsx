import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  elevation?: 'base' | 'raised' | 'floating'
  hover?: boolean
  glass?: boolean
  as?: React.ElementType
}

const elevationStyles = {
  base: 'bg-bg-card shadow-card',
  raised: 'bg-bg-elevated shadow-elevated',
  floating: 'bg-bg-elevated shadow-floating',
}

export function Card({
  elevation = 'base',
  hover = false,
  glass = false,
  as: Component = 'div',
  children,
  className,
  ...props
}: CardProps) {
  const isMotion = hover

  const baseClasses = cn(
    'rounded-2xl border border-border-subtle',
    elevationStyles[elevation],
    glass && 'backdrop-blur-xl bg-bg-card/80',
    hover && 'cursor-pointer transition-all duration-200',
    className,
  )

  if (isMotion) {
    return (
      <motion.div
        className={baseClasses}
        whileHover={{
          y: -4,
          boxShadow: '0 0 0 1px rgba(59,130,246,0.15), 0 24px 64px rgba(0,0,0,0.6)',
          borderColor: 'rgba(59,130,246,0.15)',
        }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <Component className={baseClasses} {...props}>
      {children}
    </Component>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 p-6 pb-4', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue">{icon}</div>
        )}
        <div>
          <h3 className="font-display font-semibold text-text-primary text-base">{title}</h3>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>
}
