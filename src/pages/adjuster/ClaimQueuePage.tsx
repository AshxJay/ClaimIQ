import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Users, Flag, Download } from 'lucide-react'
import { format } from 'date-fns'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, ClaimTypeBadge, PriorityBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { useClaimsQuery } from '@/hooks/useClaimsQuery'
import { useNavigate } from 'react-router-dom'
import type { Claim } from '@/types/claim'
import { formatCurrency } from '@/lib/utils'

function FraudScore({ score }: { score: number }) {
  const color = score < 20 ? '#10B981' : score < 50 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.6 }} />
      </div>
      <span className="font-mono text-xs" style={{ color }}>{score}</span>
    </div>
  )
}

export default function ClaimQueuePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const { data, isLoading } = useClaimsQuery({ search: search || undefined, pageSize: 20 })

  const columns: ColumnDef<Claim>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} className="w-4 h-4 rounded bg-bg-card border-border-DEFAULT text-brand-blue" aria-label="Select all" />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} onClick={(e) => e.stopPropagation()} className="w-4 h-4 rounded bg-bg-card border-border-DEFAULT text-brand-blue" aria-label="Select row" />
      ),
    },
    { accessorKey: 'claimNumber', header: 'Claim #', cell: ({ getValue }) => <span className="font-mono text-xs text-brand-blue">{getValue() as string}</span> },
    { accessorKey: 'policyHolderName', header: 'Policyholder', cell: ({ getValue }) => (
      <div className="flex items-center gap-2"><Avatar name={getValue() as string} size="xs" /><span className="text-sm text-text-primary">{getValue() as string}</span></div>
    )},
    { accessorKey: 'type', header: 'Type', cell: ({ getValue }) => <ClaimTypeBadge type={getValue() as Claim['type']} /> },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue() as Claim['status']} /> },
    { accessorKey: 'priority', header: 'Priority', cell: ({ getValue }) => <PriorityBadge priority={getValue() as Claim['priority']} /> },
    { accessorKey: 'claimedAmount', header: 'Amount', cell: ({ getValue }) => <span className="font-mono text-sm">{formatCurrency(getValue() as number)}</span> },
    { accessorKey: 'fraudScore', header: 'Fraud Risk', cell: ({ getValue }) => <FraudScore score={getValue() as number ?? 0} /> },
    { accessorKey: 'createdAt', header: 'Filed', cell: ({ getValue }) => <span className="text-xs text-text-muted">{format(new Date(getValue() as string), 'MMM d')}</span> },
  ], [])

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Claim Queue"
        subtitle={`${data?.total ?? 0} claims`}
      />

      {/* Bulk actions */}
      {selectedCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-brand-blue/10 border border-brand-blue/20">
          <span className="text-sm font-medium text-brand-blue">{selectedCount} selected</span>
          <Button size="sm" variant="ghost" leftIcon={<Users size={13} />}>Assign to Me</Button>
          <Button size="sm" variant="ghost" leftIcon={<Flag size={13} />}>Flag for Review</Button>
          <Button size="sm" variant="ghost" leftIcon={<Download size={13} />}>Export Selected</Button>
          <button className="ml-auto text-xs text-text-muted hover:text-text-primary" onClick={() => setRowSelection({})}>Clear</button>
        </motion.div>
      )}

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, claim #…" className="w-full bg-bg-card border border-border-DEFAULT rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-blue focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] transition-all placeholder-text-muted" />
        </div>
        <Button variant="secondary" size="md" leftIcon={<SlidersHorizontal size={14} />}>Filters</Button>
      </div>

      <Card elevation="raised">
        {isLoading ? (
          <SkeletonTable rows={8} />
        ) : (
          <DataTable
            data={data?.data ?? []}
            columns={columns}
            globalFilter={search}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            onRowClick={(claim) => navigate(`/adjuster/review/${claim.id}`)}
          />
        )}
      </Card>
    </div>
  )
}
