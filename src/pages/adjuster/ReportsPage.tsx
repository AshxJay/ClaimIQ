import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useAnalytics } from '@/hooks/useAnalytics'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Download } from 'lucide-react'

const COLORS = ['#3B82F6', '#14B8A6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="bg-bg-elevated border border-border-DEFAULT rounded-xl p-3 text-xs shadow-elevated">
      <p className="text-text-muted mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const { data: analytics, isLoading } = useAnalytics()

  const monthlyData = (analytics?.dailySubmissions ?? []).slice(-30).map((d, i) => ({
    date: format(new Date(d.date), 'MMM d'),
    filed: d.value,
    resolved: analytics?.dailyResolutions[analytics.dailyResolutions.length - 30 + i]?.value ?? 0,
  }))

  const donutData = Object.entries(analytics?.claimsByType ?? {}).map(([name, value]) => ({ name, value }))

  const handleExportCSV = () => {
    const rows = monthlyData
    const csv = ['Date,Filed,Resolved', ...rows.map(r => `${r.date},${r.filed},${r.resolved}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'claims-report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

  if (isLoading) {
    return <div className="p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title="Reports & Analytics"
          subtitle="Claims performance metrics"
          actions={
            <Button variant="secondary" size="sm" leftIcon={<Download size={14} />} onClick={handleExportCSV}>
              Export CSV
            </Button>
          }
        />
      </motion.div>

      {/* Summary stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims', value: analytics?.totalClaims?.toLocaleString() ?? '—' },
          { label: 'Approval Rate', value: `${analytics?.approvalRate?.toFixed(1) ?? '—'}%` },
          { label: 'Avg Resolution', value: `${analytics?.avgResolutionDays?.toFixed(1) ?? '—'} days` },
          { label: 'Approved Value', value: `$${((analytics?.totalApprovedAmount ?? 0) / 1_000_000).toFixed(1)}M` },
        ].map((s) => (
          <div key={s.label} className="bg-bg-elevated rounded-2xl border border-border-subtle p-4">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className="font-display font-bold text-2xl text-text-primary mt-1">{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Composed chart */}
      <motion.div variants={item}>
        <Card elevation="raised">
          <CardHeader title="Claims Filed vs Resolved (Last 30 Days)" />
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={monthlyData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="filed" fill="#3B82F6" radius={[3, 3, 0, 0]} maxBarSize={24} name="Filed" />
                <Line type="monotone" dataKey="resolved" stroke="#14B8A6" strokeWidth={2} dot={false} name="Resolved" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Donut chart */}
      <motion.div variants={item}>
        <Card elevation="raised">
          <CardHeader title="Claims by Type" />
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-xs text-text-secondary capitalize">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
