import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { ShieldAlert, TrendingUp, AlertTriangle, TrendingDown } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6']

const fraudData = [
  { name: 'Identity Spoofing', value: 45 },
  { name: 'Exaggerated Damage', value: 30 },
  { name: 'Duplicate Claim', value: 15 },
  { name: 'Policy Pre-dating', value: 10 },
]

const regionalData = [
  { region: 'North', claims: 1200, fraud: 45 },
  { region: 'South', claims: 980, fraud: 30 },
  { region: 'East', claims: 850, fraud: 20 },
  { region: 'West', claims: 1400, fraud: 55 },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="bg-bg-elevated border border-border-DEFAULT rounded-xl p-3 text-xs shadow-elevated">
      <p className="text-text-muted mb-2">{label}</p>
      {payload.map((p: { color: string; name: string; value: number }, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics()

  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

  if (isLoading) {
    return <div className="p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Advanced Analytics" subtitle="Deep dive into fraud and regional performance" />
      </motion.div>

      {/* KPI Row */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card elevation="raised" className="p-5 border-l-4 border-l-status-danger">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-text-secondary">High Risk Claims</p>
                <p className="font-display font-bold text-2xl text-text-primary mt-1">{analytics?.fraudFlagged ?? 0}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-status-danger/10 flex items-center justify-center text-status-danger">
                <ShieldAlert size={16} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-status-success">
              <TrendingDown size={14} /> <span>12% decrease from last month</span>
            </div>
         </Card>

         <Card elevation="raised" className="p-5 border-l-4 border-l-brand-teal">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-text-secondary">Automated Approvals</p>
                <p className="font-display font-bold text-2xl text-text-primary mt-1">42%</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-status-success">
              <TrendingUp size={14} /> <span>5% increase from last month</span>
            </div>
         </Card>

         <Card elevation="raised" className="p-5 border-l-4 border-l-status-warning">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-text-secondary">Avg Investigation Time</p>
                <p className="font-display font-bold text-2xl text-text-primary mt-1">14 Days</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-status-warning/10 flex items-center justify-center text-status-warning">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-status-danger">
              <TrendingUp size={14} /> <span>2 days slower than target</span>
            </div>
         </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fraud Breakdown */}
        <motion.div variants={item}>
          <Card elevation="raised">
            <CardHeader title="Fraud Typology Breakdown" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={fraudData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={4} dataKey="value">
                    {fraudData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span className="text-sm text-text-secondary">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Regional Data */}
        <motion.div variants={item}>
          <Card elevation="raised">
            <CardHeader title="Regional Performance" subtitle="Claims volume vs Fraud flags" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionalData}>
                  <XAxis dataKey="region" tick={{ fontSize: 12, fill: '#475569' }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#475569' }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#475569' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="claims" name="Total Claims" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar yAxisId="right" dataKey="fraud" name="Fraud Flags" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
