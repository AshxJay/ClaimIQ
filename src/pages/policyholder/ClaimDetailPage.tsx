import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { FileText, Image, Download, Eye, ShieldCheck, ArrowLeft } from 'lucide-react'
import { useClaimDetail } from '@/hooks/useClaimDetail'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { StatusBadge, ClaimTypeBadge, PriorityBadge } from '@/components/ui/Badge'
import { Timeline } from '@/components/ui/Timeline'
import { Button } from '@/components/ui/Button'
import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton'
import { formatCurrency, formatFileSize } from '@/lib/utils'
import type { ClaimDocument } from '@/types/claim'

const statusColors = {
  draft: 'bg-bg-elevated border-border-DEFAULT',
  submitted: 'bg-brand-blue/5 border-brand-blue/15',
  under_review: 'bg-status-warning/5 border-status-warning/15',
  pending_info: 'bg-status-warning/5 border-status-warning/15',
  approved: 'bg-status-success/5 border-status-success/15',
  rejected: 'bg-status-danger/5 border-status-danger/15',
  closed: 'bg-bg-elevated border-border-subtle',
}

function DocumentCard({ doc }: { doc: ClaimDocument }) {
  const isImage = ['jpg', 'jpeg', 'png'].includes(doc.type)
  const isPDF = doc.type === 'pdf'
  const Icon = isImage ? Image : FileText

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-bg-card border border-border-subtle rounded-xl p-4 flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0">
          {isImage && doc.thumbnailUrl ? (
            <img src={doc.thumbnailUrl} alt={doc.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Icon size={18} className={isPDF ? 'text-red-400' : 'text-blue-400'} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{doc.name}</p>
          <p className="text-xs text-text-muted">{formatFileSize(doc.size)} · {doc.type.toUpperCase()}</p>
        </div>
      </div>
      {doc.encrypted && (
        <div className="flex items-center gap-1.5 text-2xs text-brand-teal bg-brand-teal/8 px-2 py-1 rounded-lg w-fit">
          <ShieldCheck size={11} />
          AES-256 Encrypted
        </div>
      )}
      <div className="flex gap-2">
        <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="ghost" size="sm" className="w-full" leftIcon={<Eye size={13} />}>View</Button>
        </a>
        <a href={doc.signedUrl} download={doc.name} className="flex-1">
          <Button variant="ghost" size="sm" className="w-full" leftIcon={<Download size={13} />}>Download</Button>
        </a>
      </div>
    </motion.div>
  )
}

export default function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: claim, isLoading } = useClaimDetail(id)

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonText lines={2} className="max-w-xs" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">{Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          <div className="lg:col-span-2"><SkeletonCard /></div>
        </div>
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-secondary">Claim not found.</p>
        <Link to="/my-claims"><Button className="mt-4" variant="ghost">Back to Claims</Button></Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-4 ${statusColors[claim.status]}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={claim.status} />
            <ClaimTypeBadge type={claim.type} />
            <PriorityBadge priority={claim.priority} />
          </div>
          <span className="font-mono text-sm text-text-secondary">{claim.claimNumber}</span>
        </div>
      </motion.div>

      <PageHeader
        title={claim.title}
        subtitle={`Filed on ${format(new Date(claim.createdAt), 'MMMM d, yyyy')}`}
        breadcrumbs={[{ label: 'My Claims', to: '/my-claims' }, { label: claim.claimNumber }]}
        actions={<Link to="/my-claims"><Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>Back</Button></Link>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: info + documents */}
        <div className="lg:col-span-3 space-y-6">
          <Card elevation="raised">
            <CardHeader title="Claim Summary" />
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { label: 'Claimed Amount', value: formatCurrency(claim.claimedAmount) },
                  { label: 'Approved Amount', value: claim.approvedAmount ? formatCurrency(claim.approvedAmount) : '—' },
                  { label: 'Incident Date', value: format(new Date(claim.incidentDate), 'MMM d, yyyy') },
                  { label: 'Location', value: claim.incidentLocation },
                  { label: 'Adjuster', value: claim.assignedAdjusterName || 'Not yet assigned' },
                  { label: 'Injury', value: claim.injuryInvolved ? 'Yes' : 'No' },
                ].map((d) => (
                  <div key={d.label} className="bg-bg-elevated rounded-xl p-3 border border-border-subtle">
                    <p className="text-xs text-text-muted mb-0.5">{d.label}</p>
                    <p className="text-sm font-medium text-text-primary">{d.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-text-secondary">{claim.description}</p>
            </CardContent>
          </Card>

          {claim.documents && claim.documents.length > 0 && (
            <Card elevation="raised">
              <CardHeader title="Documents" subtitle={`${claim.documents.length} files`} icon={<FileText size={16} />} />
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {claim.documents.map((doc) => <DocumentCard key={doc.id} doc={doc as unknown as ClaimDocument} />)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: timeline */}
        <div className="lg:col-span-2">
          <Card elevation="raised" className="sticky top-6">
            <CardHeader title="Activity Timeline" />
            <CardContent>
              {claim.timeline && claim.timeline.length > 0 ? (
                <Timeline events={claim.timeline} />
              ) : (
                <p className="text-sm text-text-muted">No activity yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
