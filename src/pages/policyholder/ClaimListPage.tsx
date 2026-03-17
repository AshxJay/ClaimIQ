import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Download, X, FileText, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import { useClaimsQuery } from '@/hooks/useClaimsQuery'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, ClaimTypeBadge, PriorityBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { Timeline } from '@/components/ui/Timeline'
import type { Claim } from '@/types/claim'
import { formatCurrency } from '@/lib/utils'

function ClaimDrawer({ claim, onClose }: { claim: Claim | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {claim && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg z-40 bg-bg-surface border-l border-border-subtle flex flex-col shadow-floating overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle sticky top-0 bg-bg-surface z-10">
              <div>
                <p className="font-mono text-xs text-brand-blue">{claim.claimNumber}</p>
                <h2 className="font-display font-semibold text-text-primary">{claim.title}</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-2 flex-wrap">
                <StatusBadge status={claim.status} />
                <ClaimTypeBadge type={claim.type} />
                <PriorityBadge priority={claim.priority} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Claimed', value: formatCurrency(claim.claimedAmount) },
                  { label: 'Approved', value: claim.approvedAmount ? formatCurrency(claim.approvedAmount) : '—' },
                  { label: 'Filed', value: format(new Date(claim.createdAt), 'MMM d, yyyy') },
                  { label: 'Adjuster', value: claim.assignedAdjusterName || 'Unassigned' },
                ].map((d) => (
                  <div key={d.label} className="bg-bg-card rounded-xl p-3 border border-border-subtle">
                    <p className="text-xs text-text-muted">{d.label}</p>
                    <p className="text-sm font-medium text-text-primary mt-0.5 font-mono">{d.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Description</p>
                <p className="text-sm text-text-secondary">{claim.description}</p>
              </div>
              {claim.timeline && claim.timeline.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Activity</p>
                  <Timeline events={claim.timeline} />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function ClaimListPage() {
  const [search, setSearch] = useState('')
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const { data, isLoading } = useClaimsQuery({ search: search || undefined })

  const columns: ColumnDef<Claim>[] = useMemo(() => [
    {
      accessorKey: 'claimNumber',
      header: 'Claim #',
      cell: ({ getValue }) => <span className="font-mono text-xs text-brand-blue">{getValue() as string}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => <ClaimTypeBadge type={getValue() as Claim['type']} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue() as Claim['status']} />,
    },
    {
      accessorKey: 'claimedAmount',
      header: 'Amount',
      cell: ({ getValue }) => <span className="font-mono text-sm">{formatCurrency(getValue() as number)}</span>,
    },
    {
      accessorKey: 'incidentDate',
      header: 'Incident',
      cell: ({ getValue }) => <span className="text-xs text-text-muted">{format(new Date(getValue() as string), 'MMM d, yyyy')}</span>,
    },
    {
      id: 'actions',
      cell: () => <ChevronRight size={16} className="text-text-muted" />,
    },
  ], [])

  const handleExportCSV = () => {
    const rows = data?.data ?? []
    const csv = [
      ['Claim #', 'Type', 'Status', 'Amount', 'Filed'].join(','),
      ...rows.map((c) => [c.claimNumber, c.type, c.status, c.claimedAmount, c.createdAt].join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'claims.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Claims"
        subtitle={`${data?.total ?? 0} total claims`}
        breadcrumbs={[{ label: 'My Claims' }]}
        actions={<Button variant="secondary" size="sm" leftIcon={<Download size={14} />} onClick={handleExportCSV}>Export CSV</Button>}
      />

      {/* Search & filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by claim #, type, status…"
            className="w-full bg-bg-card border border-border-DEFAULT rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-blue focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] transition-all placeholder-text-muted"
          />
        </div>
        <Button variant="secondary" size="md" leftIcon={<SlidersHorizontal size={14} />}>Filters</Button>
      </div>

      <Card elevation="raised">
        {isLoading ? (
          <SkeletonTable rows={6} />
        ) : (
          <DataTable
            data={data?.data ?? []}
            columns={columns}
            globalFilter={search}
            onRowClick={setSelectedClaim}
            emptyMessage={
              search ? `No claims matching "${search}"` : 'No claims found. Submit your first claim!'
            }
          />
        )}
      </Card>

      <ClaimDrawer claim={selectedClaim} onClose={() => setSelectedClaim(null)} />
    </div>
  )
}
