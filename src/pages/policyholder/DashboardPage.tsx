import { motion } from 'framer-motion'
import { FileText, Clock, DollarSign, CheckCircle2, PlusCircle, FolderOpen, TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { StatusBadge, ClaimTypeBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCountUp } from '@/hooks/useCountUp'
import { usePolicyholderStats } from '@/hooks/useAnalytics'
import { useNotifications } from '@/hooks/useNotifications'
import { SkeletonStat, SkeletonCard } from '@/components/ui/Skeleton'
import type { Claim } from '@/types/claim'
import { formatCurrency } from '@/lib/utils'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  prefix?: string
  suffix?: string
  delta?: number
  color: string
}

function StatCard({ icon, label, value, prefix = '', suffix = '', delta, color }: StatCardProps) {
  const count = useCountUp(value)
  return (
    <Card elevation="raised" hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${delta >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
            {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      <p className="font-display font-bold text-3xl text-text-primary">
        {prefix}{count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-text-secondary mt-1">{label}</p>
    </Card>
  )
}

const claimsColumns: ColumnDef<Claim>[] = [
  {
    accessorKey: 'claimNumber',
    header: 'Claim #',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-brand-blue">{getValue() as string}</span>
    ),
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
    cell: ({ getValue }) => (
      <span className="font-mono text-sm text-text-primary">{formatCurrency(getValue() as number)}</span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Filed',
    cell: ({ getValue }) => (
      <span className="text-xs text-text-muted">{format(new Date(getValue() as string), 'MMM d, yyyy')}</span>
    ),
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function PolicyholderDashboard() {
  const { data: stats, isLoading } = usePolicyholderStats()
  useNotifications()

  const activeClaimProgress = [
    { label: 'Submitted', done: true },
    { label: 'Documents', done: true },
    { label: 'Under Review', done: true },
    { label: 'Decision', done: false },
    { label: 'Payment', done: false },
  ]
  const currentStep = activeClaimProgress.filter(s => s.done).length

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title="My Dashboard"
          subtitle="Track your claims and policy status"
          actions={
            <Link to="/submit-claim">
              <Button leftIcon={<PlusCircle size={16} />}>
                New Claim
              </Button>
            </Link>
          }
        />
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FileText size={18} className="text-brand-blue" />} label="Active Claims" value={stats?.activeClaims ?? 0} color="bg-brand-blue/10" delta={-12} />
        <StatCard icon={<Clock size={18} className="text-status-warning" />} label="Under Review" value={stats?.underReview ?? 0} color="bg-status-warning/10" />
        <StatCard icon={<DollarSign size={18} className="text-brand-teal" />} label="Total Claimed" value={stats?.totalClaimed ?? 0} prefix="$" color="bg-brand-teal/10" />
        <StatCard icon={<CheckCircle2 size={18} className="text-status-success" />} label="Lifetime Approved" value={stats?.lifetimeApproved ?? 0} prefix="$" color="bg-status-success/10" delta={5} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active claim progress */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card elevation="raised" className="h-full">
            <CardHeader title="Active Claim Progress" subtitle="CLM-2024-001 · Auto Insurance" icon={<FileText size={16} />} />
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-3">
                  {activeClaimProgress.map((step, i) => (
                    <div key={step.label} className="flex-1 text-center">
                      <motion.div
                        animate={i === currentStep - 1 ? { boxShadow: ['0 0 0 rgba(59,130,246,0)', '0 0 16px rgba(59,130,246,0.5)', '0 0 0 rgba(59,130,246,0)'] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold mb-1.5 border-2 ${
                          step.done
                            ? 'bg-status-success border-status-success text-white'
                            : i === currentStep
                            ? 'bg-brand-blue/10 border-brand-blue text-brand-blue'
                            : 'bg-bg-elevated border-border-DEFAULT text-text-muted'
                        }`}
                      >
                        {step.done ? '✓' : i + 1}
                      </motion.div>
                      <p className={`text-xs ${step.done ? 'text-status-success' : i === currentStep ? 'text-brand-blue' : 'text-text-muted'}`}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
                <ProgressBar value={currentStep} max={activeClaimProgress.length} showPercent label="Progress" />
                <div className="p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/10">
                  <p className="text-sm font-medium text-text-primary mb-1">💬 Adjuster note</p>
                  <p className="text-sm text-text-secondary">We've received all documents and are verifying the repair estimate. Expected decision within 2 business days.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions + notif preview */}
        <motion.div variants={item} className="space-y-4">
          <Card elevation="raised">
            <CardHeader title="Quick Actions" />
            <CardContent className="space-y-2">
              <Link to="/submit-claim">
                <Button variant="primary" size="md" className="w-full justify-start" leftIcon={<PlusCircle size={16} />}>
                  Submit New Claim
                </Button>
              </Link>
              <Link to="/documents">
                <Button variant="secondary" size="md" className="w-full justify-start" leftIcon={<FolderOpen size={16} />}>
                  View Documents
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card elevation="base">
            <CardHeader title="Recent Alerts" icon={<CheckCircle2 size={16} />} />
            <CardContent>
              <div className="space-y-3">
                {[
                  { text: 'Claim CLM-2024-001 is under review', time: '30m ago', color: 'text-brand-blue' },
                  { text: 'CLM-2024-002 approved — $14,500', time: '2h ago', color: 'text-status-success' },
                  { text: 'Documents required for CLM-2024-003', time: '5h ago', color: 'text-status-warning' },
                ].map((n, i) => (
                  <div key={i} className="flex gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.color === 'text-brand-blue' ? 'bg-brand-blue' : n.color === 'text-status-success' ? 'bg-status-success' : 'bg-status-warning'}`} />
                    <div>
                      <p className="text-xs text-text-secondary">{n.text}</p>
                      <p className="text-2xs text-text-muted font-mono">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent claims table */}
      <motion.div variants={item}>
        <Card elevation="raised">
          <CardHeader
            title="Recent Claims"
            action={<Link to="/my-claims" className="text-xs text-brand-blue hover:underline">View all →</Link>}
          />
          <CardContent className="px-0 pb-0">
            <DataTable
              data={stats?.recentClaims ?? []}
              columns={claimsColumns}
              enablePagination={false}
              onRowClick={(row) => {}}
              className="rounded-t-none border-0"
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
