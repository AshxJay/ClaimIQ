import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Clock, CheckCircle2, TrendingUp, ShieldAlert, Activity, RefreshCw } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge'
import { useCountUp } from '@/hooks/useCountUp'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useClaimsQuery } from '@/hooks/useClaimsQuery'
import { SkeletonStat } from '@/components/ui/Skeleton'
import { apiClient } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { CloudWatchMetrics } from '@/types/api'

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="bg-bg-elevated border border-border-DEFAULT rounded-xl p-3 text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} className="text-text-primary font-medium">{p.value}</p>)}
    </div>
  )
}

function KPICard({ icon, label, value, suffix = '', color }: { icon: React.ReactNode; label: string; value: number; suffix?: string; color: string }) {
  const count = useCountUp(value)
  return (
    <Card elevation="raised" hover className="p-5">
      <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center ${color}`}>{icon}</div>
      <p className="font-display font-bold text-2xl text-text-primary">{count.toLocaleString()}{suffix}</p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </Card>
  )
}

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

export default function AdjusterDashboard() {
  const { data: analytics, isLoading } = useAnalytics()
  const { data: queue } = useClaimsQuery({ status: ['submitted', 'under_review'], pageSize: 5 })
  const [cwMetrics, setCwMetrics] = useState<CloudWatchMetrics | null>(null)
  const [cwLoading, setCwLoading] = useState(false)

  const fetchCW = async () => {
    setCwLoading(true)
    try {
      const res = await apiClient.get('/analytics/cloudwatch')
      setCwMetrics(res.data.data as CloudWatchMetrics)
    } catch { /* silent */ }
    finally { setCwLoading(false) }
  }
  useEffect(() => { fetchCW(); const t = setInterval(fetchCW, 60_000); return () => clearInterval(t) }, [])

  const chartData = analytics?.dailySubmissions.slice(-30).map((d) => ({
    date: format(new Date(d.date), 'MMM d'),
    submitted: d.value,
    resolved: analytics.dailyResolutions.find(r => r.date === d.date)?.value ?? 0,
  })) ?? []

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Adjuster Dashboard" subtitle="Claims operations overview" />
      </motion.div>

      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? Array.from({ length: 5 }).map((_, i) => <SkeletonStat key={i} />) : <>
          <KPICard icon={<Users size={16} className="text-brand-blue" />} label="Queue Size" value={analytics?.claimsByStatus.under_review ?? 0} color="bg-brand-blue/10" />
          <KPICard icon={<CheckCircle2 size={16} className="text-status-success" />} label="Resolved This Month" value={analytics?.resolvedThisMonth ?? 0} color="bg-status-success/10" />
          <KPICard icon={<Clock size={16} className="text-status-warning" />} label="Avg Resolution Days" value={Math.round(analytics?.avgResolutionDays ?? 0)} color="bg-status-warning/10" />
          <KPICard icon={<TrendingUp size={16} className="text-brand-teal" />} label="Approval Rate %" value={Math.round(analytics?.approvalRate ?? 0)} suffix="%" color="bg-brand-teal/10" />
          <KPICard icon={<ShieldAlert size={16} className="text-status-danger" />} label="Fraud Flagged" value={analytics?.fraudFlagged ?? 0} color="bg-status-danger/10" />
        </>}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card elevation="raised">
            <CardHeader title="Claims Filed vs Resolved (30 days)" />
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14B8A6" stopOpacity={0.3} /><stop offset="100%" stopColor="#14B8A6" stopOpacity={0} /></linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} interval={6} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="submitted" stroke="#3B82F6" fill="url(#blueGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="resolved" stroke="#14B8A6" fill="url(#tealGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-brand-blue" /><span className="text-xs text-text-muted">Filed</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-brand-teal" /><span className="text-xs text-text-muted">Resolved</span></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Claims by type bar */}
        <motion.div variants={item}>
          <Card elevation="raised">
            <CardHeader title="By Type" />
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={Object.entries(analytics?.claimsByType ?? {}).map(([k, v]) => ({ type: k, count: v }))}>
                  <XAxis dataKey="type" tick={{ fontSize: 9, fill: '#475569' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CloudWatch + Priority queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CloudWatch live */}
        <motion.div variants={item}>
          <Card elevation="raised">
            <CardHeader
              title="Live Infrastructure"
              subtitle="Polled every 60s"
              icon={<Activity size={16} />}
              action={
                <button onClick={fetchCW} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors" aria-label="Refresh">
                  <RefreshCw size={14} className={cwLoading ? 'animate-spin' : ''} />
                </button>
              }
            />
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'API Latency', value: `${cwMetrics?.apiLatencyMs ?? '—'} ms`, ok: (cwMetrics?.apiLatencyMs ?? 0) < 300 },
                  { label: 'S3 Upload Success', value: `${cwMetrics?.s3UploadSuccessRate ?? '—'}%`, ok: (cwMetrics?.s3UploadSuccessRate ?? 0) > 99 },
                  { label: 'ECS Health', value: cwMetrics?.ecsHealthy ? 'Healthy' : 'Degraded', ok: cwMetrics?.ecsHealthy ?? true },
                  { label: 'RDS Connections', value: `${cwMetrics?.rdsConnectionCount ?? '—'}`, ok: (cwMetrics?.rdsConnectionCount ?? 0) < 80 },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                    <div className="flex items-center gap-2">
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className={`w-2 h-2 rounded-full ${m.ok ? 'bg-status-success' : 'bg-status-danger'}`} />
                      <span className="text-sm text-text-secondary">{m.label}</span>
                    </div>
                    <span className="font-mono text-sm text-text-primary">{m.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Priority queue */}
        <motion.div variants={item}>
          <Card elevation="raised">
            <CardHeader title="Priority Queue" subtitle="Top 5 pending claims" />
            <CardContent>
              <div className="space-y-3">
                {(queue?.data ?? []).slice(0, 5).map((claim) => (
                  <div key={claim.id} className="flex items-start gap-3 p-3 rounded-xl bg-bg-card border border-border-subtle hover:border-border-DEFAULT transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-brand-blue">{claim.claimNumber}</span>
                        <StatusBadge status={claim.status} />
                      </div>
                      <p className="text-sm text-text-secondary truncate">{claim.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{formatCurrency(claim.claimedAmount)}</p>
                    </div>
                    <PriorityBadge priority={claim.priority ?? 'low'} />
                  </div>
                ))}
                {!queue?.data?.length && <p className="text-sm text-text-muted text-center py-4">No pending claims</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}