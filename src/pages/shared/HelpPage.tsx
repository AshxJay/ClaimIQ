import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, MessageCircle, FileText, PhoneCall, BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const FAQS = [
  {
    category: 'Claims',
    items: [
      { q: 'How long does it take for a claim to be processed?', a: 'Most auto claims are processed within 3-5 business days. Home insurance claims may take longer depending on the severity of the damage and if an on-site inspection is required.' },
      { q: 'What documents do I need to submit a claim?', a: 'Typically, you will need a police report (if applicable), photos of the damage, repair estimates, and your policy number. Our smart guided workflow will tell you exactly what is required for your specific claim type.' },
      { q: 'Can I track the status of my claim?', a: 'Yes! The ClaimIQ dashboard provides real-time updates. You will be notified via email or SMS whenever your claim advances to the next stage of review.' }
    ]
  },
  {
    category: 'Account',
    items: [
      { q: 'How do I reset my password?', a: 'Navigate to Settings > Security and click "Update Password". Alternatively, you can use the "Forgot Password" link on the login screen.' },
      { q: 'Can I change my notification preferences?', a: 'Yes, visit Settings > Notifications to toggle Email, SMS, or in-app alerts on or off based on your preference.' }
    ]
  }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>('Claims-0')

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 px-4 bg-gradient-to-b from-brand-blue/5 to-transparent rounded-3xl border border-border-subtle">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">How can we help you today?</h1>
        <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">Search our knowledge base or browse frequently asked questions below.</p>
        
        <div className="max-w-2xl mx-auto flex items-center bg-bg-card border border-border-DEFAULT rounded-2xl shadow-card transition-shadow focus-within:shadow-floating focus-within:border-brand-blue">
          <div className="pl-4 text-text-muted">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search for articles, guides, or questions..." 
            className="w-full bg-transparent px-4 py-4 outline-none text-text-primary placeholder:text-text-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="pr-2">
            <Button>Search</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Support Channels */}
        <div className="col-span-1 space-y-4">
          <h3 className="font-display font-semibold text-lg text-text-primary mb-4">Contact Support</h3>
          
          <Card className="hover:border-brand-blue transition-colors cursor-pointer group">
            <div className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                <MessageCircle size={24} />
              </div>
              <div>
                <h4 className="font-medium text-text-primary">Live Chat</h4>
                <p className="text-sm text-text-muted mt-1">Available 24/7 for urgent claim inquiries.</p>
              </div>
            </div>
          </Card>

          <Card className="hover:border-brand-blue transition-colors cursor-pointer group">
            <div className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal group-hover:scale-110 transition-transform">
                <PhoneCall size={24} />
              </div>
              <div>
                <h4 className="font-medium text-text-primary">Phone Support</h4>
                <p className="text-sm text-text-muted mt-1">1-800-CLAIM-IQ<br/><span className="text-xs">Mon-Fri, 9am - 6pm EST</span></p>
              </div>
            </div>
          </Card>

          <Card className="hover:border-brand-blue transition-colors cursor-pointer group">
            <div className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <div>
                <h4 className="font-medium text-text-primary">Documentation</h4>
                <p className="text-sm text-text-muted mt-1">Detailed guides and API documentation.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* FAQs */}
        <div className="col-span-1 md:col-span-2">
          <h3 className="font-display font-semibold text-lg text-text-primary mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-6">
            {FAQS.map((category) => (
              <div key={category.category}>
                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 ml-2">{category.category}</h4>
                <div className="bg-bg-card border border-border-DEFAULT rounded-2xl overflow-hidden shadow-sm">
                  {category.items.map((item, idx) => {
                    const id = `${category.category}-${idx}`
                    const isOpen = openFaqIndex === id
                    return (
                      <div key={idx} className="border-b border-border-DEFAULT last:border-b-0">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : id)}
                          className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-bg-deep transition-colors focus:outline-none focus:bg-bg-deep"
                        >
                          <span className="font-medium text-text-primary pr-8">{item.q}</span>
                          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                            <ChevronDown size={18} className="text-text-muted flex-shrink-0" />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
