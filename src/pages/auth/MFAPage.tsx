import { useRef, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Smartphone } from 'lucide-react'
import { signInWithMFA } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'

export default function MFAPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuthStore()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const sessionToken: string = (location.state as { sessionToken?: string })?.sessionToken || ''

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    if (value && index < 5) {
      refs.current[index + 1]?.focus()
    }
    // Auto-submit when all 6 digits entered
    if (value && index === 5 && next.every(Boolean)) {
      handleVerify(next.join(''))
    }
  }, [digits])

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }, [digits])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setDigits(text.split(''))
      handleVerify(text)
    }
  }, [])

  const handleVerify = async (code: string) => {
    setLoading(true)
    setError('')
    try {
      const authUser = await signInWithMFA({ sessionToken, code })
      setUser(authUser)
      navigate(authUser.role === 'adjuster' ? '/adjuster/dashboard' : '/dashboard')
    } catch {
      setError('Invalid verification code. Please try again.')
      setDigits(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center shadow-glow">
            <Smartphone size={28} className="text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-text-primary mb-2">Two-factor auth</h1>
          <p className="text-text-secondary text-sm">
            Enter the 6-digit code from your authenticator app or SMS.
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <motion.input
              key={i}
              ref={(el) => { refs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.3 }}
              className="w-12 h-14 text-center text-xl font-bold text-text-primary bg-bg-card border-2 rounded-xl outline-none transition-all duration-200 font-mono
                focus:border-brand-blue focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]
                border-border-DEFAULT placeholder-text-muted"
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-status-danger mb-4"
          >
            {error}
          </motion.p>
        )}

        <Button
          size="lg"
          loading={loading}
          onClick={() => handleVerify(digits.join(''))}
          disabled={digits.some(Boolean) ? digits.some((d) => !d) : true}
          className="w-full"
        >
          Verify
        </Button>

        <div className="mt-6 text-center space-y-2">
          <button className="text-sm text-brand-blue hover:text-brand-blue-light transition-colors">
            Resend code
          </button>
          <br />
          <button onClick={() => navigate('/login')} className="text-sm text-text-muted hover:text-text-secondary transition-colors">
            Back to sign in
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-text-muted">
          <Shield size={12} />
          Secured by AWS Cognito MFA
        </div>
      </motion.div>
    </div>
  )
}
