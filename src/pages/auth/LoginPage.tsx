import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react'
import { signIn } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

// Animated mesh gradient background
function MeshGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-deep via-bg-surface to-brand-teal/5" />

      {/* Animated orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-blue/5 blur-3xl opacity-50"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 0.9, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-brand-teal/5 blur-3xl opacity-50"
      />
      <motion.div
        animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl opacity-50"
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  )
}

const statCards = [
  { value: '$2.4B', label: 'Claims processed' },
  { value: '99.9%', label: 'Platform uptime' },
  { value: '< 8 days', label: 'Avg. resolution time' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const emailValue = watch('email', '')
  const passwordValue = watch('password', '')

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const authUser = await signIn(data)
      setUser(authUser)

      navigate('/onboarding')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password'
      setServerError(msg)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand visual */}
      <div className="hidden lg:flex flex-1 flex-col relative">
        <MeshGradient />
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center shadow-glow">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-text-primary">ClaimIQ</span>
          </div>

          {/* Hero text */}
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-extrabold text-5xl leading-tight text-text-primary"
            >
              Insurance claims,
              <br />
              <span className="bg-gradient-to-r from-brand-blue to-brand-teal bg-clip-text text-transparent">
                intelligently managed.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-text-secondary text-lg max-w-sm leading-relaxed"
            >
              A cloud-native platform built for policyholders and adjusters who demand speed, transparency, and security.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex gap-8 pt-4"
            >
              {statCards.map((s) => (
                <div key={s.label}>
                  <p className="font-display font-bold text-2xl text-text-primary">{s.value}</p>
                  <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <p className="text-xs text-text-muted">
            © 2024 ClaimIQ Technologies Inc. · SOC 2 Type II Certified · AWS-native
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-bg-surface min-h-screen px-6 lg:px-16 py-12 relative">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-text-primary">ClaimIQ</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-text-primary mb-2">Welcome back</h2>
            <p className="text-text-secondary text-sm">Sign in to your ClaimIQ account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              value={emailValue}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              leftIcon={<Lock size={15} />}
              error={errors.password?.message}
              value={passwordValue}
              rightElement={
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-text-muted hover:text-text-primary transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded bg-bg-card border-border-DEFAULT text-brand-blue focus:ring-brand-blue focus:ring-offset-bg-deep"
                />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>
              <button type="button" className="text-sm text-brand-blue hover:text-brand-blue-light transition-colors">
                Forgot password?
              </button>
            </div>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl bg-status-danger/10 border border-status-danger/20 text-sm text-status-danger"
              >
                {serverError}
              </motion.div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={isSubmitting}
              rightIcon={<ArrowRight size={16} />}
              className="w-full mt-2"
            >
              Sign in
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-xl bg-bg-card border border-border-subtle">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="space-y-1.5">
              {[
                { label: 'Policyholder', email: 'ashutosh@gmail.com' },
                { label: 'Adjuster', email: 'divak@gmail.com' },
              ].map((d) => (
                <div key={d.label} className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{d.label}</span>
                  <span className="text-xs font-mono text-brand-blue">{d.email}</span>
                </div>
              ))}
              <p className="text-xs text-text-muted pt-1">Any password ≥ 6 chars</p>
            </div>
          </div>

          <p className="text-xs text-text-muted text-center mt-6">
            Protected by AWS Cognito · TLS 1.3 · SOC 2
          </p>
        </motion.div>
      </div>
    </div>
  )
}
