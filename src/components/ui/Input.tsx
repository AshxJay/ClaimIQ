import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
  maxChars?: number
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightElement,
  maxChars,
  className,
  value,
  onChange,
  id,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false)
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="relative w-full">
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'peer w-full bg-bg-card border rounded-xl px-4 pt-5 pb-2 text-sm text-text-primary',
            'transition-all duration-200 outline-none',
            'placeholder-transparent',
            leftIcon && 'pl-10',
            rightElement && 'pr-10',
            error
              ? 'border-status-danger focus:border-status-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
              : 'border-border-DEFAULT focus:border-brand-blue focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]',
            className,
          )}
          placeholder=" "
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          aria-invalid={!!error}
          {...props}
        />

        {/* Floating label via CSS */}
        <label
          htmlFor={inputId}
          className={cn(
            'absolute left-4 pointer-events-none origin-left transition-all duration-200',
            // Base state (floated up, small text)
            'top-1/2 -translate-y-[1.2rem] scale-[0.78]',
            // When placeholder is shown (no text) and NOT focused (using peer behavior)
            'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100',
            // When focused (override placeholder-shown to float up)
            'peer-focus:top-1/2 peer-focus:-translate-y-[1.2rem] peer-focus:scale-[0.78]',
            // Color logic
            error ? 'text-status-danger' : focused ? 'text-brand-blue' : 'text-text-muted',
            leftIcon && 'left-10',
          )}
        >
          {label}
        </label>

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">{rightElement}</div>
        )}
      </div>

      {/* Helper/error below */}
      <div className="flex items-start justify-between mt-1 px-1 min-h-[1rem]">
        {error ? (
          <motion.p
            id={`${inputId}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-status-danger"
          >
            {error}
          </motion.p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-text-muted">{helperText}</p>
        ) : (
          <span />
        )}
        {maxChars && (
          <span className={cn('text-xs', String(value ?? '').length > maxChars ? 'text-status-danger' : 'text-text-muted')}>
            {String(value ?? '').length}/{maxChars}
          </span>
        )}
      </div>
    </div>
  )
}

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helperText?: string
  maxChars?: number
}

export function Textarea({ label, error, helperText, maxChars, className, value, onChange, id, ...props }: TextareaProps) {
  const [focused, setFocused] = useState(false)
  const inputId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="relative w-full">
      <div className="relative">
        <textarea
          id={inputId}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'peer w-full bg-bg-card border rounded-xl px-4 pt-6 pb-3 text-sm text-text-primary',
            'transition-all duration-200 outline-none resize-none min-h-[100px]',
            'placeholder-transparent',
            error
              ? 'border-status-danger focus:border-status-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
              : 'border-border-DEFAULT focus:border-brand-blue focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]',
            className,
          )}
          placeholder=" "
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'absolute left-4 pointer-events-none origin-left transition-all duration-200 bg-bg-card px-1 -ml-1',
            // Floated state
            'top-1.5 scale-[0.78]',
            // When empty and unfocused
            'peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100',
            // Focused override
            'peer-focus:top-1.5 peer-focus:scale-[0.78]',
            // Colors
            error ? 'text-status-danger' : focused ? 'text-brand-blue' : 'text-text-muted'
          )}
        >
          {label}
        </label>
      </div>
      <div className="flex items-start justify-between mt-1 px-1">
        {error ? (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-status-danger">
            {error}
          </motion.p>
        ) : helperText ? (
          <p className="text-xs text-text-muted">{helperText}</p>
        ) : <span />}
        {maxChars && (
          <span className={cn('text-xs', String(value ?? '').length > maxChars ? 'text-status-danger' : 'text-text-muted')}>
            {String(value ?? '').length}/{maxChars}
          </span>
        )}
      </div>
    </div>
  )
}
