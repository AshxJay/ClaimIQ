import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ArrowRight, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    // Update global store with the chosen name
    updateProfile({ fullName: name })

    // Redirect to proper dashboard based on role
    if (user?.role === 'adjuster') {
      navigate('/adjuster/dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-bg-surface p-8 rounded-3xl border border-border-subtle shadow-elevated"
      >
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center shadow-glow">
            <Shield size={24} className="text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-2xl text-text-primary mb-2">Welcome to ClaimIQ</h2>
          <p className="text-text-secondary text-sm">Let's personalize your experience. What should we call you?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Your preferred display name"
            type="text"
            leftIcon={<User size={15} />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Button
            type="submit"
            size="lg"
            rightIcon={<ArrowRight size={16} />}
            className="w-full"
            disabled={!name.trim()}
          >
            Continue to Dashboard
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
