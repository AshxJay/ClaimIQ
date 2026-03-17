import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface Breadcrumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, breadcrumbs = [], actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-6 pt-6 pb-4', className)}>
      <div>
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-text-muted mb-2">
            <Link to="/" className="hover:text-text-secondary transition-colors">
              <Home size={12} />
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1">
                <ChevronRight size={12} className="text-border-DEFAULT" />
                {crumb.to && i < breadcrumbs.length - 1 ? (
                  <Link to={crumb.to} className="hover:text-text-secondary transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={i === breadcrumbs.length - 1 ? 'text-text-secondary' : ''}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        <h1 className="font-display font-bold text-2xl text-text-primary">{title}</h1>
        {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
      </div>

      {actions && (
        <div className="flex items-center gap-3 mt-1 shrink-0">{actions}</div>
      )}
    </div>
  )
}
