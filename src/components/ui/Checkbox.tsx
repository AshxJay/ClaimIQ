import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const defaultId = React.useId()
    const checkboxId = id || defaultId

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center mt-0.5">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            className={cn(
              'peer h-5 w-5 appearance-none rounded focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:ring-offset-1 focus:ring-offset-bg-deep cursor-pointer transition-all',
              'border-2 border-border-strong bg-bg-surface',
              'checked:bg-brand-blue checked:border-brand-blue',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-status-danger checked:bg-status-danger checked:border-status-danger',
              className
            )}
            {...props}
          />
          <Check
            size={14}
            className="absolute left-[3px] top-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
            strokeWidth={3}
          />
        </div>
        
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'text-sm font-medium text-text-primary cursor-pointer select-none leading-5',
                  props.disabled && 'opacity-50 cursor-not-allowed',
                  error && 'text-status-danger'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn(
                'text-xs text-text-muted mt-0.5 select-none',
                props.disabled && 'opacity-50 cursor-not-allowed'
              )}>
                {description}
              </p>
            )}
            {error && <p className="text-xs text-status-danger mt-1">{error}</p>}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
