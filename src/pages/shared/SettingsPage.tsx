import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Bell, User, Monitor, CreditCard, Lock, Smartphone, Globe } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { Checkbox } from '@/components/ui/Checkbox'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'notifications'>('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'preferences', label: 'Preferences', icon: <Monitor size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences and security."
      />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-brand-blue/10 text-brand-blue'
                    : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <div className="p-6 border-b border-border-DEFAULT flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-text-primary">Personal Information</h3>
                    <p className="text-sm text-text-muted">Update your photo and personal details here.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xl font-bold">
                      {user?.firstName?.[0] || 'U'}
                    </div>
                    <Button variant="secondary" size="sm">Change Avatar</Button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="First Name" defaultValue={user?.firstName || ''} />
                    <Input label="Last Name" defaultValue={user?.lastName || ''} />
                  </div>
                  <Input label="Email Address" defaultValue={user?.email || ''} type="email" />
                  <Input label="Phone Number" defaultValue="+1 (555) 000-0000" type="tel" />
                  <div className="flex justify-end pt-4">
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <div className="p-6 border-b border-border-DEFAULT">
                  <h3 className="font-display font-semibold text-lg text-text-primary">App Preferences</h3>
                  <p className="text-sm text-text-muted">Customize your ClaimIQ experience.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-bg-deep rounded-xl border border-border-subtle">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-bg-card flex items-center justify-center shadow-card text-brand-blue">
                        <Globe size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary">Language & Region</h4>
                        <p className="text-sm text-text-muted">Currently set to English (US)</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">Change</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-bg-deep rounded-xl border border-border-subtle">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-bg-card flex items-center justify-center shadow-card text-brand-blue">
                        <Monitor size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary">Default Theme</h4>
                        <p className="text-sm text-text-muted">System preference (Light)</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">Change</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <div className="p-6 border-b border-border-DEFAULT">
                  <h3 className="font-display font-semibold text-lg text-text-primary">Security Settings</h3>
                  <p className="text-sm text-text-muted">Manage your password and authentication methods.</p>
                </div>
                <div className="p-6 space-y-8">
                  <div>
                    <h4 className="font-medium text-text-primary mb-4">Change Password</h4>
                    <div className="space-y-4 max-w-md">
                      <Input label="Current Password" type="password" />
                      <Input label="New Password" type="password" />
                      <Input label="Confirm New Password" type="password" />
                      <Button className="mt-2">Update Password</Button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-border-DEFAULT">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-text-primary">Two-Factor Authentication</h4>
                        <p className="text-sm text-text-muted">Add an extra layer of security to your account.</p>
                      </div>
                      <div className="px-3 py-1 bg-status-success/10 text-status-success rounded-full text-xs font-semibold">
                        Enabled
                      </div>
                    </div>
                    <div className="p-4 border border-border-DEFAULT rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone size={20} className="text-text-muted" />
                        <div>
                          <p className="font-medium text-sm text-text-primary">Authenticator App</p>
                          <p className="text-xs text-text-muted">Configured exactly 3 months ago</p>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm">Manage</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <div className="p-6 border-b border-border-DEFAULT">
                  <h3 className="font-display font-semibold text-lg text-text-primary">Notification Preferences</h3>
                  <p className="text-sm text-text-muted">Choose how you want to be alerted by ClaimIQ.</p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Claim Updates */}
                  <div>
                    <h4 className="font-medium text-text-primary mb-4">Claim Updates</h4>
                    <div className="space-y-4">
                      <Checkbox label="Email notifications when claim status changes" defaultChecked id="notif-1" />
                      <Checkbox label="SMS alerts for urgent documents required" defaultChecked id="notif-2" />
                      <Checkbox label="In-app browser notifications for real-time chat" defaultChecked id="notif-3" />
                    </div>
                  </div>
                  
                  {/* Marketing */}
                  <div className="pt-6 border-t border-border-DEFAULT">
                    <h4 className="font-medium text-text-primary mb-4">Marketing & Updates</h4>
                    <div className="space-y-4">
                      <Checkbox label="Weekly account summary email" id="marketing-1" />
                      <Checkbox label="Product updates and new feature announcements" defaultChecked id="marketing-2" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button>Save Preferences</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
