import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mail, Phone, ExternalLink, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { TeamMember, AdjusterStats } from '@/types/user'

const MOCK_TEAM: (TeamMember & { stats: AdjusterStats; isOnline: boolean; role: string; phone: string })[] = [
  {
    id: 'u-1', fullName: 'Alex Chen', email: 'alex.chen@claimiq.com', avatarUrl: '', queueSize: 12, reviewedToday: 8,
    isOnline: true, role: 'Senior Adjuster', phone: '+1 (555) 019-2031',
    stats: { reviewedToday: 8, queueSize: 12, avgResolutionTimeDays: 2.1, approvalRate: 85, fraudFlagsToday: 1 }
  },
  {
    id: 'u-2', fullName: 'Sarah Jenkins', email: 's.jenkins@claimiq.com', avatarUrl: '', queueSize: 5, reviewedToday: 14,
    isOnline: true, role: 'Adjuster', phone: '+1 (555) 019-4822',
    stats: { reviewedToday: 14, queueSize: 5, avgResolutionTimeDays: 1.8, approvalRate: 92, fraudFlagsToday: 0 }
  },
  {
    id: 'u-3', fullName: 'Marcus Johnson', email: 'm.johnson@claimiq.com', avatarUrl: '', queueSize: 28, reviewedToday: 3,
    isOnline: false, role: 'Junior Adjuster', phone: '+1 (555) 019-8839',
    stats: { reviewedToday: 3, queueSize: 28, avgResolutionTimeDays: 4.5, approvalRate: 78, fraudFlagsToday: 2 }
  },
  {
    id: 'u-4', fullName: 'Emily Davis', email: 'e.davis@claimiq.com', avatarUrl: '', queueSize: 8, reviewedToday: 11,
    isOnline: true, role: 'Adjuster', phone: '+1 (555) 019-2201',
    stats: { reviewedToday: 11, queueSize: 8, avgResolutionTimeDays: 2.5, approvalRate: 88, fraudFlagsToday: 0 }
  },
]

export default function TeamPage() {
  const [search, setSearch] = useState('')

  const filteredTeam = MOCK_TEAM.filter(member => 
    member.fullName.toLowerCase().includes(search.toLowerCase()) || 
    member.role.toLowerCase().includes(search.toLowerCase())
  )

  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader 
          title="Team Directory" 
          subtitle="Manage adjusters and view performance" 
          actions={
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search team..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-bg-card border border-border-DEFAULT rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary outline-none focus:border-brand-blue transition-all shadow-sm"
              />
            </div>
          }
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTeam.map(member => (
            <motion.div 
              layout
              key={member.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card elevation="raised" hover className="overflow-hidden h-full flex flex-col">
                <div className="h-24 bg-gradient-to-r from-brand-blue/20 to-brand-teal/20 relative" />
                <CardContent className="pt-0 flex-1 flex flex-col">
                  {/* Profile Header */}
                  <div className="flex justify-between items-start -mt-8 mb-4">
                    <div className="relative">
                      <Avatar name={member.fullName} size="xl" className="border-4 border-bg-surface shadow-md" />
                      <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-bg-surface ${member.isOnline ? 'bg-status-success' : 'bg-status-warning'}`} />
                    </div>
                    <Badge variant={member.isOnline ? 'success' : 'warning'} className="mt-10">
                      {member.isOnline ? 'Online' : 'Away'}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-display font-semibold text-lg text-text-primary leading-tight">{member.fullName}</h3>
                    <p className="text-sm text-brand-blue font-medium">{member.role}</p>
                  </div>

                  <div className="space-y-2 mb-6 text-sm text-text-secondary">
                    <div className="flex items-center gap-2 hover:text-text-primary transition-colors cursor-pointer w-max">
                      <Mail size={14} className="text-text-muted" /> {member.email}
                    </div>
                    <div className="flex items-center gap-2 hover:text-text-primary transition-colors cursor-pointer w-max">
                      <Phone size={14} className="text-text-muted" /> {member.phone}
                    </div>
                  </div>

                  {/* Stats Mini-dashboard */}
                  <div className="mt-auto bg-bg-elevated rounded-xl p-4 border border-border-subtle grid grid-cols-2 gap-y-4 gap-x-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
                        <Activity size={12} /> Queue
                      </div>
                      <p className="font-semibold text-text-primary">{member.stats.queueSize} claims</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
                        <CheckCircle2 size={12} /> Reviewed
                      </div>
                      <p className="font-semibold text-text-primary">{member.stats.reviewedToday} today</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
                        <ShieldAlert size={12} /> Fraud Flags
                      </div>
                      <p className="font-semibold text-text-primary">{member.stats.fraudFlagsToday} flagged</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
                        <ExternalLink size={12} /> Avg Time
                      </div>
                      <p className="font-semibold text-text-primary">{member.stats.avgResolutionTimeDays} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredTeam.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-muted">
              No team members found matching "{search}"
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
