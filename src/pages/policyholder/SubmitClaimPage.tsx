import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Car, Home, Heart, Plane, Briefcase, Scale, Activity, ArrowRight, ArrowLeft, Save, CheckCircle2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { FileUpload } from '@/components/ui/FileUpload'
import { StepProgress } from '@/components/ui/ProgressBar'
import { useSubmitClaim, saveDraft, loadDraft } from '@/hooks/useSubmitClaim'
import type { UploadingDocument } from '@/types/document'
import { uploadDocument } from '@/lib/storage'
import { apiClient } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { ClaimType } from '@/types/claim'

const claimTypes: { type: ClaimType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'auto', label: 'Auto', icon: <Car size={24} />, desc: 'Vehicle collision, theft, damage' },
  { type: 'home', label: 'Home', icon: <Home size={24} />, desc: 'Property damage, theft, liability' },
  { type: 'health', label: 'Health', icon: <Heart size={24} />, desc: 'Medical expenses, surgery, treatments' },
  { type: 'travel', label: 'Travel', icon: <Plane size={24} />, desc: 'Trip cancellation, lost baggage' },
  { type: 'business', label: 'Business', icon: <Briefcase size={24} />, desc: 'Business property & liability' },
  { type: 'liability', label: 'Liability', icon: <Scale size={24} />, desc: 'Third-party claims' },
]

const STEPS = ['Policy', 'Incident', 'Documents', 'Review']

const step1Schema = z.object({
  policyNumber: z.string().min(1, 'Policy number required').regex(/^POL-/, 'Must start with POL-'),
})

const step2Schema = z.object({
  incidentDate: z.string().min(1, 'Date required'),
  incidentLocation: z.string().min(5, 'Enter a more specific location'),
  description: z.string().min(30, 'Please describe the incident in at least 30 characters').max(2000),
  claimedAmount: z.string().min(1, 'Amount required'),
  injuryInvolved: z.boolean().optional(),
})

type Step1 = z.infer<typeof step1Schema>
type Step2 = z.infer<typeof step2Schema>

interface FormData extends Step1, Step2 {
  claimType: ClaimType | null
}

export default function SubmitClaimPage() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Partial<FormData>>({ claimType: null })
  const [policyStatus, setPolicyStatus] = useState<'idle' | 'loading' | 'found' | 'error'>('idle')
  const [policyHolder, setPolicyHolder] = useState('')
  const [uploads, setUploads] = useState<UploadingDocument[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const { mutateAsync: submitClaim, isPending } = useSubmitClaim()

  // Load draft
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      setFormData((p) => ({
        ...p,
        ...draft,
        claimedAmount: draft.claimedAmount !== undefined ? String(draft.claimedAmount) : p.claimedAmount,
      }))
      if (draft.step !== undefined) setStep(draft.step)
    }
  }, [])

  // Auto-save every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      saveDraft({ ...formData, step } as Parameters<typeof saveDraft>[0])
      setSavedAt(new Date().toLocaleTimeString())
    }, 30_000)
    return () => clearInterval(timer)
  }, [formData, step])

  const step1Form = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: { policyNumber: formData.policyNumber || '' } })
  const step2Form = useForm<Step2>({ resolver: zodResolver(step2Schema), defaultValues: { description: '', incidentDate: '', incidentLocation: '', claimedAmount: '', injuryInvolved: false } })

  // Policy lookup
  const lookupPolicy = useCallback(async (num: string) => {
    if (!num || !num.startsWith('POL-')) return
    setPolicyStatus('loading')
    try {
      const res = await apiClient.get(`/policies/${num}`)
      setPolicyHolder(res.data.data.holderName)
      setPolicyStatus('found')
    } catch {
      setPolicyStatus('error')
      setPolicyHolder('')
    }
  }, [])

  const handleStep1 = async (data: Step1) => {
    setFormData((p) => ({ ...p, ...data }))
    setStep(1)
  }

  const handleStep2 = async (data: Step2) => {
    setFormData((p) => ({ ...p, ...data }))
    setStep(2)
  }

  const handleFilesAdded = (files: File[]) => {
    const newUploads: UploadingDocument[] = files.map((file) => ({
      id: `upload-${Date.now()}-${Math.random()}`,
      file,
      claimId: 'pending',
      status: 'pending',
      progress: 0,
      retryCount: 0,
    }))
    setUploads((prev) => [...prev, ...newUploads])

    // Start uploading
    newUploads.forEach(async (upload) => {
      setUploads((prev) => prev.map((u) => u.id === upload.id ? { ...u, status: 'uploading' } : u))
      try {
        const result = await uploadDocument(upload.file, 'pending', (p) => {
          setUploads((prev) => prev.map((u) => u.id === upload.id ? { ...u, progress: p.percent } : u))
        })
        setUploads((prev) => prev.map((u) => u.id === upload.id ? { ...u, status: 'complete', progress: 100, documentId: result.documentId } : u))
      } catch {
        setUploads((prev) => prev.map((u) => u.id === upload.id ? { ...u, status: 'error', error: 'Upload failed' } : u))
      }
    })
  }

  const handleSubmit = async () => {
    try {
      await submitClaim({
        policyNumber: formData.policyNumber!,
        type: formData.claimType!,
        incidentDate: formData.incidentDate!,
        incidentLocation: formData.incidentLocation!,
        description: formData.description!,
        claimedAmount: parseFloat(formData.claimedAmount || '0'),
        injuryInvolved: formData.injuryInvolved ?? false,
        documentIds: uploads.filter(u => u.documentId).map(u => u.documentId!),
      })
      setSubmitted(true)
      // Confetti!
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#3B82F6', '#14B8A6', '#10B981', '#F59E0B'] })
    } catch { /* handled by hook */ }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-20 h-20 rounded-full bg-status-success/10 border-2 border-status-success flex items-center justify-center mb-6 mx-auto shadow-glow-success">
            <CheckCircle2 size={40} className="text-status-success" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="font-display font-bold text-3xl text-text-primary mb-3">Claim Submitted!</h1>
          <p className="text-text-secondary max-w-sm">Your claim has been received and will be assigned to an adjuster within 1 business day.</p>
          <Button className="mt-8" onClick={() => { setSubmitted(false); setStep(0); setFormData({ claimType: null }); setUploads([]) }}>
            Submit Another Claim
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Submit a Claim"
        breadcrumbs={[{ label: 'My Claims', to: '/my-claims' }, { label: 'Submit' }]}
      />

      {savedAt && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted mb-4 px-6">
          <Save size={12} />
          Draft saved {savedAt}
        </div>
      )}

      {/* Step indicator */}
      <div className="px-6 mb-8">
        <StepProgress steps={STEPS} currentStep={step} />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0 — Policy */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6">
            <Card elevation="raised" className="p-6">
              <h2 className="font-display font-semibold text-text-primary text-xl mb-6">Policy Verification</h2>
              <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-6">
                <div className="relative">
                  <Input
                    label="Policy Number"
                    placeholder="e.g. POL-AUTO-45821"
                    error={step1Form.formState.errors.policyNumber?.message}
                    value={step1Form.watch('policyNumber')}
                    {...step1Form.register('policyNumber', {
                      onBlur: (e) => lookupPolicy(e.target.value),
                    })}
                    rightElement={
                      policyStatus === 'loading' ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full" />
                      : policyStatus === 'found' ? <CheckCircle2 size={16} className="text-status-success" />
                      : policyStatus === 'error' ? <span className="text-status-danger text-xs">Not found</span>
                      : null
                    }
                  />
                  {policyHolder && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-status-success mt-2 pl-1">
                      ✓ Policy holder: {policyHolder}
                    </motion.p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-text-secondary mb-3">Claim Type</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {claimTypes.map((ct) => (
                      <motion.button
                        key={ct.type}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData((p) => ({ ...p, claimType: ct.type }))}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all duration-150 flex flex-col gap-2',
                          formData.claimType === ct.type
                            ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                            : 'border-border-subtle bg-bg-card text-text-secondary hover:border-border-strong hover:text-text-primary',
                        )}
                      >
                        {ct.icon}
                        <div>
                          <p className="text-sm font-semibold">{ct.label}</p>
                          <p className="text-2xs opacity-70">{ct.desc}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" rightIcon={<ArrowRight size={16} />} disabled={!formData.claimType}>
                  Continue to Incident Details
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Step 1 — Incident */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6">
            <Card elevation="raised" className="p-6">
              <h2 className="font-display font-semibold text-text-primary text-xl mb-6">Incident Details</h2>
              <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Incident Date & Time" type="datetime-local" error={step2Form.formState.errors.incidentDate?.message} value={step2Form.watch('incidentDate')} {...step2Form.register('incidentDate')} />
                  <Input label="Amount Claimed (USD)" type="number" error={step2Form.formState.errors.claimedAmount?.message} value={step2Form.watch('claimedAmount')} {...step2Form.register('claimedAmount')} />
                </div>
                <Input label="Location of Incident" error={step2Form.formState.errors.incidentLocation?.message} value={step2Form.watch('incidentLocation')} {...step2Form.register('incidentLocation')} helperText="City, address, or nearest landmark" />
                <Textarea label="Describe the incident" maxChars={2000} error={step2Form.formState.errors.description?.message} value={step2Form.watch('description')} {...step2Form.register('description')} helperText="Be as detailed as possible to avoid delays" />
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-border-subtle bg-bg-card hover:border-border-DEFAULT transition-colors">
                  <input type="checkbox" {...step2Form.register('injuryInvolved')} className="w-4 h-4 rounded bg-bg-card border-border-DEFAULT text-brand-blue" />
                  <div>
                    <p className="text-sm font-medium text-text-primary flex items-center gap-2"><Activity size={14} className="text-status-danger" /> Injury involved</p>
                    <p className="text-xs text-text-muted">Check if anyone was injured in this incident</p>
                  </div>
                </label>
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" size="lg" leftIcon={<ArrowLeft size={16} />} onClick={() => setStep(0)}>Back</Button>
                  <Button type="submit" size="lg" className="flex-1" rightIcon={<ArrowRight size={16} />}>Upload Documents</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Step 2 — Documents */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6">
            <Card elevation="raised" className="p-6">
              <h2 className="font-display font-semibold text-text-primary text-xl mb-2">Document Upload</h2>
              <p className="text-sm text-text-muted mb-6">Upload supporting documents such as photos, police report, repair estimates, and medical records.</p>
              <FileUpload
                uploads={uploads}
                onFilesAdded={handleFilesAdded}
                onRemove={(id) => setUploads((p) => p.filter((u) => u.id !== id))}
                onRetry={(id) => {
                  const doc = uploads.find((u) => u.id === id)
                  if (doc) handleFilesAdded([doc.file])
                }}
              />
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" size="lg" leftIcon={<ArrowLeft size={16} />} onClick={() => setStep(1)}>Back</Button>
                <Button size="lg" className="flex-1" rightIcon={<ArrowRight size={16} />} onClick={() => setStep(3)}>Review & Submit</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-4">
            <Card elevation="raised" className="p-6">
              <h2 className="font-display font-semibold text-text-primary text-xl mb-6">Review & Submit</h2>
              <div className="space-y-4">
                {[
                  { label: 'Policy Number', value: formData.policyNumber, step: 0 },
                  { label: 'Claim Type', value: formData.claimType, step: 0 },
                  { label: 'Incident Date', value: formData.incidentDate, step: 1 },
                  { label: 'Location', value: formData.incidentLocation, step: 1 },
                  { label: 'Amount Claimed', value: `$${Number(formData.claimedAmount || 0).toLocaleString()}`, step: 1 },
                  { label: 'Documents', value: `${uploads.filter(u => u.status === 'complete').length} uploaded`, step: 2 },
                ].map((field) => (
                  <div key={field.label} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
                    <span className="text-sm text-text-secondary">{field.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-text-primary font-mono">{field.value || '—'}</span>
                      <button onClick={() => setStep(field.step)} className="text-xs text-brand-blue hover:underline">Edit</button>
                    </div>
                  </div>
                ))}
              </div>

              {formData.description && (
                <div className="mt-4 p-4 rounded-xl bg-bg-card border border-border-subtle">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Description</p>
                  <p className="text-sm text-text-secondary">{formData.description}</p>
                </div>
              )}

              <div className="mt-6 p-4 rounded-xl bg-bg-elevated border border-border-subtle">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" id="consent" className="w-4 h-4 mt-0.5 rounded bg-bg-card border-border-DEFAULT text-brand-blue" />
                  <span className="text-xs text-text-secondary">
                    I certify that all information provided is accurate to the best of my knowledge and that submitting a fraudulent claim is a crime under applicable law.
                  </span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="secondary" size="lg" leftIcon={<ArrowLeft size={16} />} onClick={() => setStep(2)}>Back</Button>
                <Button size="lg" className="flex-1" loading={isPending} onClick={handleSubmit}>
                  Submit Claim
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
