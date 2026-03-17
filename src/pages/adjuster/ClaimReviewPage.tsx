import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ShieldAlert, CheckCircle2, XCircle, MessageSquare, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useClaimDetail } from '@/hooks/useClaimDetail'
import { useUpdateClaimStatus } from '@/hooks/useUpdateClaimStatus'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { StatusBadge, ClaimTypeBadge, PriorityBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Timeline } from '@/components/ui/Timeline'
import { Modal, ConfirmModal, ModalProvider, useModal } from '@/components/ui/Modal'
import { formatCurrency } from '@/lib/utils'
import type { DecisionReason } from '@/types/claim'

const decisionSchema = z.object({
  approvedAmount: z.string().optional(),
  reason: z.enum(['valid_claim', 'policy_coverage', 'insufficient_documentation', 'policy_exclusion', 'fraud_suspected', 'duplicate_claim', 'claim_limit_exceeded', 'out_of_coverage_period', 'requires_additional_info'] as const),
  notes: z.string().optional(),
})
type DecisionForm = z.infer<typeof decisionSchema>

function FraudGauge({ score }: { score: number }) {
  const color = score < 20 ? '#10B981' : score < 50 ? '#F59E0B' : '#EF4444'
  const label = score < 20 ? 'Low Risk' : score < 50 ? 'Medium Risk' : 'High Risk'
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">Fraud Score</span>
        <span className="font-mono font-bold text-lg" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-3 rounded-full bg-bg-elevated overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }} />
      </div>
      <div className="flex items-center gap-2 text-sm" style={{ color }}>
        <ShieldAlert size={14} />
        {label}
      </div>
      <div className="space-y-2 mt-2">
        {[
          { factor: 'Policy age', ok: true },
          { factor: 'Claim history', ok: true },
          { factor: 'Document authenticity', ok: true },
          { factor: 'Reported location', ok: score < 30 },
          { factor: 'Amount vs policy', ok: score < 50 },
        ].map((f) => (
          <div key={f.factor} className="flex items-center gap-2 text-xs text-text-muted">
            {f.ok ? <CheckCircle2 size={12} className="text-status-success" /> : <AlertTriangle size={12} className="text-status-warning" />}
            {f.factor}
          </div>
        ))}
      </div>
    </div>
  )
}

function DecisionPanel({ claimId }: { claimId: string }) {
  const { open } = useModal()
  const { mutate: updateStatus, isPending } = useUpdateClaimStatus()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<DecisionForm>({ resolver: zodResolver(decisionSchema) })

  const handleDecision = (action: 'approved' | 'rejected' | 'pending_info') => {
    open(`confirm-${action}`)
  }

  const confirmDecision = (action: 'approved' | 'rejected' | 'pending_info', data: DecisionForm) => {
    updateStatus({
      claimId,
      status: action,
      approvedAmount: data.approvedAmount ? parseFloat(data.approvedAmount) : undefined,
      reason: data.reason as DecisionReason,
      notes: data.notes,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Approved Amount (USD)</label>
          <input type="number" {...register('approvedAmount')} placeholder="0" className="mt-1 w-full bg-bg-card border border-border-DEFAULT rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-blue transition-all" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Decision Reason</label>
          <select {...register('reason')} className="mt-1 w-full bg-bg-card border border-border-DEFAULT rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-blue transition-all">
            <option value="valid_claim">Valid claim — coverage confirmed</option>
            <option value="policy_coverage">Full policy coverage applies</option>
            <option value="insufficient_documentation">Insufficient documentation</option>
            <option value="policy_exclusion">Policy exclusion applies</option>
            <option value="fraud_suspected">Fraud suspected</option>
            <option value="duplicate_claim">Duplicate claim</option>
            <option value="claim_limit_exceeded">Claim limit exceeded</option>
            <option value="out_of_coverage_period">Out of coverage period</option>
            <option value="requires_additional_info">Additional info required</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Adjuster Notes</label>
          <textarea {...register('notes')} rows={3} className="mt-1 w-full bg-bg-card border border-border-DEFAULT rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-blue transition-all resize-none" placeholder="Internal notes (not visible to policyholder)" />
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <Button className="w-full" size="lg" leftIcon={<CheckCircle2 size={16} />} loading={isPending} onClick={handleSubmit((d) => handleDecision('approved'))}>
          Approve Claim
        </Button>
        <Button variant="danger" className="w-full" size="md" leftIcon={<XCircle size={16} />} onClick={handleSubmit((d) => handleDecision('rejected'))}>
          Reject Claim
        </Button>
        <Button variant="secondary" className="w-full" size="md" leftIcon={<MessageSquare size={16} />} onClick={handleSubmit((d) => handleDecision('pending_info'))}>
          Request More Info
        </Button>
      </div>

      {/* Confirm modals */}
      {(['approved', 'rejected', 'pending_info'] as const).map((action) => (
        <ConfirmModal
          key={action}
          id={`confirm-${action}`}
          title={action === 'approved' ? 'Approve Claim?' : action === 'rejected' ? 'Reject Claim?' : 'Request Information?'}
          description={
            action === 'approved'
              ? 'The policyholder will be notified by email & SMS. Payment will be initiated.'
              : action === 'rejected'
              ? 'The claim will be closed. Policyholder will receive rejection notice with reason.'
              : 'A notification will be sent requesting additional documentation.'
          }
          confirmLabel={action === 'approved' ? 'Yes, Approve' : action === 'rejected' ? 'Yes, Reject' : 'Send Request'}
          danger={action === 'rejected'}
          onConfirm={() => handleSubmit((d) => confirmDecision(action, d))()}
        />
      ))}
    </div>
  )
}

export default function ClaimReviewPage() {
  const { id } = useParams<{ id: string }>()
  const { data: claim, isLoading } = useClaimDetail(id)

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">{Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        <div><SkeletonCard /></div>
      </div>
    )
  }

  if (!claim) return <div className="p-6 text-text-muted">Claim not found.</div>

  return (
    <ModalProvider>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Claim Review"
          subtitle={claim.claimNumber}
          breadcrumbs={[{ label: 'Queue', to: '/adjuster/queue' }, { label: 'Review' }]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: claim info, documents */}
          <div className="lg:col-span-2 space-y-6">
            <Card elevation="raised">
              <CardHeader title={claim.title} />
              <CardContent>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <StatusBadge status={claim.status} />
                  <ClaimTypeBadge type={claim.type} />
                  <PriorityBadge priority={claim.priority} />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Policyholder', value: claim.policyHolderName },
                    { label: 'Policy Number', value: claim.policyNumber },
                    { label: 'Claimed', value: formatCurrency(claim.claimedAmount) },
                    { label: 'Incident', value: format(new Date(claim.incidentDate), 'MMM d, yyyy') },
                    { label: 'Location', value: claim.incidentLocation },
                    { label: 'Injury', value: claim.injuryInvolved ? 'Yes' : 'No' },
                  ].map((d) => (
                    <div key={d.label} className="bg-bg-elevated rounded-xl p-3 border border-border-subtle">
                      <p className="text-xs text-text-muted">{d.label}</p>
                      <p className="text-sm font-medium text-text-primary">{d.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-text-secondary">{claim.description}</p>
              </CardContent>
            </Card>

            {/* Documents */}
            {claim.documents && claim.documents.length > 0 && (
              <Card elevation="raised">
                <CardHeader title="Documents" subtitle={`${claim.documents.length} files`} />
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {claim.documents.map((doc) => (
                      <a key={doc.id} href={doc.signedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-border-subtle hover:border-brand-blue/40 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-text-muted group-hover:text-brand-blue">📄</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate">{doc.name}</p>
                          <p className="text-2xs text-text-muted">{doc.type.toUpperCase()}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            {claim.timeline && (
              <Card elevation="raised">
                <CardHeader title="Activity Timeline" />
                <CardContent>
                  <Timeline events={claim.timeline} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: sticky decision panel */}
          <div className="lg:sticky lg:top-6 space-y-4">
            <Card elevation="floating">
              <CardHeader title="Fraud Analysis" icon={<ShieldAlert size={16} />} />
              <CardContent>
                <FraudGauge score={claim.fraudScore ?? 0} />
              </CardContent>
            </Card>

            <Card elevation="floating">
              <CardHeader title="Decision" icon={<CheckCircle2 size={16} />} />
              <CardContent>
                <DecisionPanel claimId={claim.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModalProvider>
  )
}
