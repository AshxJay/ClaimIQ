import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

// ——— Context ———
interface ModalContextValue {
  open: (id: string, data?: Record<string, unknown>) => void
  close: () => void
  activeId: string | null
  data: Record<string, unknown>
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [data, setData] = useState<Record<string, unknown>>({})

  const open = (id: string, d: Record<string, unknown> = {}) => {
    setActiveId(id)
    setData(d)
  }
  const close = () => {
    setActiveId(null)
    setData({})
  }

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <ModalContext.Provider value={{ open, close, activeId, data }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}

// ——— Modal Component ———
interface ModalProps {
  id: string
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({ id, title, description, children, footer, size = 'md', className }: ModalProps) {
  const { activeId, close } = useModal()
  const isOpen = activeId === id
  const contentRef = useRef<HTMLDivElement>(null)

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      focusable?.[0]?.focus()
    }
  }, [isOpen])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={`modal-title-${id}`}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
          />

          {/* Modal */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full bg-bg-elevated border border-border-DEFAULT rounded-2xl shadow-floating z-10',
              sizeStyles[size],
              className,
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 border-b border-border-subtle">
              <div>
                <h2  id={`modal-title-${id}`} className="font-display font-semibold text-text-primary text-lg">
                  {title}
                </h2>
                {description && (
                  <p className="text-sm text-text-secondary mt-1">{description}</p>
                )}
              </div>
              <button
                onClick={close}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-0 border-t border-border-subtle pt-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Quick confirm modal
interface ConfirmModalProps {
  id: string
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  danger?: boolean
}

export function ConfirmModal({ id, title, description, confirmLabel = 'Confirm', onConfirm, danger = false }: ConfirmModalProps) {
  const { close } = useModal()

  return (
    <Modal id={id} title={title} size="sm">
      <p className="text-text-secondary text-sm mb-6">{description}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={close}>Cancel</Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          onClick={() => { onConfirm(); close() }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
