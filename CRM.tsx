import { useState, useEffect, useMemo } from 'react'
import Plot from 'react-plotly.js'
import { SiteFooter, MinimalNav } from './Components'
import { useCollection, db } from './src/Services/useDatabase'
import type { Lead, Activity, Customer, Contact, Employee } from './src/Services/DatabaseTypes'
import {
  Icon,
  chartLayout,
  CHART_PALETTE,
  BizSidebar,
  BizTopbar,
  StatCard,
  Card,
  Badge,
  Progress,
  Avatar,
  FilterBar,
  Modal,
  DrawerHeader,
  statusColor,
  type NavSectionDef,
} from './BizUI'

/* ══════════════════════════════════════
   CRM — REDESIGNED
   Customer Relationship Management
══════════════════════════════════════ */
export function CRMSection() {
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState('all')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showAddNewModal, setShowAddNewModal] = useState(false)
  const [addNewType, setAddNewType] = useState('lead')

  // Data from shared database
  const leads = useCollection<Lead>('leads')
  const dbActivities = useCollection<Activity>('activities')
  const customers = useCollection<Customer>('customers')
  const contacts = useCollection<Contact>('contacts')
  const employees = useCollection<Employee>('employees')

  const enrichedLeads = useMemo(
    () =>
      leads.map((lead) => {
        const customer = customers.find((c) => c.id === lead.customerId)
        const contact = contacts.find((c) => c.id === lead.contactId)
        const owner = employees.find((e) => e.id === lead.ownerId)
        return {
          ...lead,
          name: customer?.name || 'Unknown',
          industry: customer?.industry || '',
          size: customer?.size || '',
          contact: contact?.name || '',
          email: contact?.email || '',
          phone: contact?.phone || '',
          owner: owner?.name || '',
          created: lead.createdAt,
        }
      }),
    [leads, customers, contacts, employees]
  )

  const activities = useMemo(
    () =>
      dbActivities.map((act) => {
        const lead = leads.find((l) => l.id === act.leadId)
        const customer = lead ? customers.find((c) => c.id === lead.customerId) : null
        return { ...act, lead: customer?.name || '' }
      }),
    [dbActivities, leads, customers]
  )

  const filteredLeads = enrichedLeads.filter((lead) => {
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      lead.name.toLowerCase().includes(q) || lead.contact.toLowerCase().includes(q)
    const matchesStage = filterStage === 'all' || lead.stage === filterStage
    return matchesSearch && matchesStage
  })

  const activityIcon = (type: string) => {
    const map: any = { call: Icon.phone, email: Icon.mail, meeting: Icon.meeting, task: Icon.task }
    return map[type] || Icon.task
  }

  const sections: NavSectionDef[] = [
    {
      label: 'Workspace',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'leads', label: 'Leads & Deals', icon: 'target' },
      ],
    },
    {
      label: 'Records',
      items: [
        { id: 'contacts', label: 'Contacts', icon: 'users' },
        { id: 'accounts', label: 'Accounts', icon: 'building' },
        { id: 'activities', label: 'Activities', icon: 'calendar' },
      ],
    },
    {
      label: 'Insights',
      items: [{ id: 'reports', label: 'Reports', icon: 'chart' }],
    },
  ]

  const viewMeta: Record<string, { title: string; subtitle: string; crumbs: string[] }> = {
    dashboard: {
      title: 'Pipeline Overview',
      subtitle: 'Real-time view of your sales motion',
      crumbs: ['CRM', 'Dashboard'],
    },
    leads: {
      title: 'Leads & Opportunities',
      subtitle: 'Track every deal from discovery to close',
      crumbs: ['CRM', 'Leads'],
    },
    contacts: {
      title: 'Contact Directory',
      subtitle: 'People driving your customer relationships',
      crumbs: ['CRM', 'Contacts'],
    },
    accounts: {
      title: 'Account Management',
      subtitle: 'Companies and organizations in your pipeline',
      crumbs: ['CRM', 'Accounts'],
    },
    activities: {
      title: 'Activity Timeline',
      subtitle: 'Every touchpoint, calls, meetings and tasks',
      crumbs: ['CRM', 'Activities'],
    },
    reports: {
      title: 'Reports & Analytics',
      subtitle: 'Deep-dive metrics across your sales engine',
      crumbs: ['CRM', 'Reports'],
    },
  }

  const meta = viewMeta[activeView]

  return (
    <div className="biz-shell">
      <BizSidebar
        brand="Radon CRM"
        subtitle="REL · v3.0"
        sections={sections}
        active={activeView}
        onSelect={setActiveView}
      />

      <main className="biz-main">
        <BizTopbar
          crumbs={meta.crumbs}
          title={meta.title}
          subtitle={meta.subtitle}
          onSearch={() => setShowSearchModal(true)}
          onAdd={() => {
            setAddNewType(
              activeView === 'leads'
                ? 'lead'
                : activeView === 'contacts'
                ? 'contact'
                : activeView === 'accounts'
                ? 'account'
                : activeView === 'activities'
                ? 'activity'
                : 'lead'
            )
            setShowAddNewModal(true)
          }}
          addLabel="Add New"
        />

        <div className="biz-content">
          {/* DASHBOARD */}
          {activeView === 'dashboard' && (
            <>
              <div className="biz-kpi-grid">
                <StatCard
                  label="Total Pipeline"
                  value={`$${(db.getTotalPipelineValue() / 1000).toFixed(0)}K`}
                  change="+12%"
                  trend="up"
                  variant="blue"
                  foot="vs last month"
                />
                <StatCard
                  label="Active Leads"
                  value={leads.length.toString()}
                  change="+8%"
                  trend="up"
                  variant="violet"
                  foot="vs last month"
                />
                <StatCard
                  label="Win Rate"
                  value={`${(db.getWinRate() * 100).toFixed(0)}%`}
                  change="+5%"
                  trend="up"
                  variant="green"
                  foot="vs last month"
                />
                <StatCard
                  label="Avg Deal Size"
                  value={`$${
                    leads.length > 0
                      ? (leads.reduce((s, l) => s + l.value, 0) / leads.length / 1000).toFixed(0)
                      : 0
                  }K`}
                  change="+5%"
                  trend="up"
                  variant="cyan"
                  foot="vs last month"
                />
              </div>

              <div className="biz-grid-2-1">
                <Card>
                  <Plot
                    data={[
                      {
                        type: 'funnel',
                        y: ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'],
                        x: [12400, 3200, 850, 120, 48],
                        marker: { color: ['#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#34d399'] },
                        textinfo: 'value+percent initial' as any,
                        textfont: { color: '#e8eaf6' },
                      },
                    ]}
                    layout={chartLayout('Sales Pipeline Funnel', { margin: { t: 50, b: 30, l: 130, r: 20 } })}
                    style={{ width: '100%', height: 360 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
                <Card>
                  <Plot
                    data={[
                      {
                        type: 'pie',
                        values: [12, 28, 44],
                        labels: ['High', 'Medium', 'Low'],
                        hole: 0.7,
                        marker: { colors: ['#f87171', '#fbbf24', '#60a5fa'] },
                        textinfo: 'label+percent',
                        textfont: { color: '#e8eaf6' },
                      },
                    ]}
                    layout={chartLayout('Lead Priority', {
                      margin: { t: 50, b: 30, l: 20, r: 20 },
                      showlegend: true,
                    })}
                    style={{ width: '100%', height: 360 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
              </div>

              <Card title="Recent Activity" sub="LATEST · TOUCHPOINTS">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activities.slice(0, 5).map((activity) => {
                    const ActIcon = activityIcon(activity.type)
                    return (
                      <div key={activity.id} className="biz-row">
                        <div className="biz-row-ico">
                          <ActIcon style={{ width: 16, height: 16 }} />
                        </div>
                        <div className="biz-row-body">
                          <div className="biz-row-title">{activity.title}</div>
                          <div className="biz-row-meta">
                            {activity.lead} • {activity.date} at {activity.time}
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'Space Mono',monospace" }}>
                          {activity.duration}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </>
          )}

          {/* LEADS */}
          {activeView === 'leads' && (
            <>
              <FilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search leads by company or contact..."
                filters={[
                  {
                    value: filterStage,
                    onChange: setFilterStage,
                    options: [
                      { value: 'all', label: 'All Stages' },
                      { value: 'discovery', label: 'Discovery' },
                      { value: 'qualification', label: 'Qualification' },
                      { value: 'proposal', label: 'Proposal' },
                      { value: 'negotiation', label: 'Negotiation' },
                      { value: 'closed-won', label: 'Closed Won' },
                    ],
                  },
                ]}
              />

              <div className="biz-table-wrap">
                <table className="biz-table">
                  <thead>
                    <tr>
                      <th>Lead</th>
                      <th>Value</th>
                      <th>Stage</th>
                      <th style={{ minWidth: 160 }}>Probability</th>
                      <th>Owner</th>
                      <th>Contact</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => {
                      const color = statusColor(lead.stage)
                      const palette: any = {
                        blue: '#60a5fa',
                        violet: '#a78bfa',
                        amber: '#fbbf24',
                        pink: '#f472b6',
                        green: '#34d399',
                        red: '#f87171',
                        gray: '#94a3b8',
                      }
                      return (
                        <tr key={lead.id} onClick={() => setSelectedLead(lead)}>
                          <td>
                            <div className="biz-cell-strong">{lead.name}</div>
                            <div className="biz-cell-muted">
                              {lead.industry} • {lead.size}
                            </div>
                          </td>
                          <td>
                            <span className="biz-cell-num">${(lead.value / 1000).toFixed(0)}K</span>
                          </td>
                          <td>
                            <Badge color={color}>{lead.stage.replace('-', ' ')}</Badge>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Progress value={lead.probability} color={palette[color]} />
                              <span
                                style={{
                                  fontSize: 11,
                                  color: 'var(--muted)',
                                  fontFamily: "'Space Mono',monospace",
                                  minWidth: 32,
                                }}
                              >
                                {lead.probability}%
                              </span>
                            </div>
                          </td>
                          <td>{lead.owner}</td>
                          <td>
                            <div>{lead.contact}</div>
                            <div className="biz-cell-muted">{lead.email}</div>
                          </td>
                          <td>
                            <span style={{ color: 'var(--muted)', fontSize: 12, fontFamily: "'Space Mono',monospace" }}>
                              {lead.created}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* CONTACTS */}
          {activeView === 'contacts' && (
            <div className="biz-grid-cards">
              {contacts.map((contact) => {
                const customer = customers.find((c) => c.id === contact.customerId)
                return (
                  <div className="biz-contact-card" key={contact.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <Avatar initials={contact.avatar || contact.name?.slice(0, 2) || '?'} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{contact.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{customer?.name || ''}</div>
                      </div>
                    </div>
                    <div className="biz-contact-meta">
                      <div className="biz-meta-row">
                        <Icon.mail />
                        <span>{contact.email}</span>
                      </div>
                      <div className="biz-meta-row">
                        <Icon.phone />
                        <span>{contact.phone}</span>
                      </div>
                      <div className="biz-meta-row">
                        <Icon.building />
                        <span>{customer?.industry || ''}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ACCOUNTS */}
          {activeView === 'accounts' && (
            <div className="biz-grid-cards">
              {enrichedLeads.map((lead) => (
                <div className="biz-contact-card" key={lead.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{lead.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                        {lead.industry} • {lead.size}
                      </div>
                    </div>
                    <Badge color={statusColor(lead.stage)}>{lead.stage.replace('-', ' ')}</Badge>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 12 }}>
                    <div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Contact
                      </div>
                      <div style={{ color: 'var(--text)', fontWeight: 500 }}>{lead.contact}</div>
                      <div style={{ color: 'var(--muted)', marginTop: 2 }}>{lead.email}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Deal
                      </div>
                      <div style={{ color: 'var(--text)', fontWeight: 600 }}>${(lead.value / 1000).toFixed(0)}K</div>
                      <div style={{ color: 'var(--muted)', marginTop: 2 }}>Owner: {lead.owner}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ACTIVITIES */}
          {activeView === 'activities' && (
            <Card title="Activity Timeline" sub="ALL · TOUCHPOINTS">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activities.map((activity) => {
                  const ActIcon = activityIcon(activity.type)
                  return (
                    <div className="biz-row" key={activity.id} style={{ alignItems: 'flex-start', padding: 16 }}>
                      <div className="biz-row-ico">
                        <ActIcon style={{ width: 16, height: 16 }} />
                      </div>
                      <div className="biz-row-body">
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                          {activity.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 8, fontFamily: "'Space Mono',monospace", letterSpacing: '.05em' }}>
                          {activity.lead} · {activity.date} · {activity.time}
                          {activity.duration !== '-' && ` · ${activity.duration}`}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, opacity: 0.85 }}>
                          {activity.notes}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* REPORTS */}
          {activeView === 'reports' && (
            <>
              <div className="biz-grid-1-1">
                <Card>
                  <Plot
                    data={[
                      {
                        type: 'bar',
                        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        y: [420, 380, 510, 490, 620, 710],
                        marker: { color: '#60a5fa' },
                      },
                    ]}
                    layout={chartLayout('Monthly Revenue Trend')}
                    style={{ width: '100%', height: 320 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
                <Card>
                  <Plot
                    data={[
                      {
                        type: 'scatter',
                        mode: 'lines+markers',
                        x: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                        y: [12, 19, 15, 25],
                        line: { color: '#34d399', width: 2.5, shape: 'spline' },
                        marker: { color: '#34d399', size: 8 },
                        fill: 'tozeroy',
                        fillcolor: 'rgba(52,211,153,0.08)',
                      },
                    ]}
                    layout={chartLayout('Weekly Lead Generation')}
                    style={{ width: '100%', height: 320 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
              </div>
              <Card>
                <Plot
                  data={[
                    {
                      type: 'bar',
                      orientation: 'h',
                      x: [2.1, 1.8, 1.4, 0.9, 0.5],
                      y: ['Acme Corp', 'Global Industries', 'Tech Solutions', 'Innovation Labs', 'Enterprise Systems'],
                      marker: { color: CHART_PALETTE },
                    },
                  ]}
                  layout={chartLayout('Top Performing Accounts (in $M)', {
                    margin: { t: 50, b: 40, l: 160, r: 20 },
                    yaxis: { autorange: 'reversed', gridcolor: 'rgba(96,165,250,0.06)', tickfont: { color: '#cbd5e1' } },
                  })}
                  style={{ width: '100%', height: 380 }}
                  config={{ displayModeBar: false, responsive: true }}
                />
              </Card>
            </>
          )}
        </div>
      </main>

      {/* DETAIL DRAWER */}
      {selectedLead && (
        <aside className="biz-drawer">
          <DrawerHeader title="Lead Details" onClose={() => setSelectedLead(null)} />
          <div className="biz-drawer-body">
            <div className="biz-drawer-section">
              <h4>Company</h4>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{selectedLead.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                {selectedLead.industry} • {selectedLead.size}
              </div>
            </div>

            <div className="biz-drawer-section">
              <h4>Contact</h4>
              <div className="biz-kv">
                <div><b>Name</b>{selectedLead.contact}</div>
                <div><b>Email</b>{selectedLead.email}</div>
                <div><b>Phone</b>{selectedLead.phone}</div>
              </div>
            </div>

            <div className="biz-drawer-section">
              <h4>Deal</h4>
              <div className="biz-kv">
                <div><b>Value</b>${(selectedLead.value / 1000).toFixed(0)}K</div>
                <div><b>Stage</b><Badge color={statusColor(selectedLead.stage)}>{selectedLead.stage.replace('-', ' ')}</Badge></div>
                <div><b>Probability</b>{selectedLead.probability}%</div>
                <div><b>Owner</b>{selectedLead.owner}</div>
                <div><b>Created</b>{selectedLead.created}</div>
              </div>
            </div>

            <div className="biz-drawer-section">
              <h4>Actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="biz-btn biz-btn-primary" style={{ justifyContent: 'center' }} onClick={() => alert('Edit lead: ' + selectedLead.name)}>
                  Edit Lead
                </button>
                <button className="biz-btn biz-btn-ghost" style={{ justifyContent: 'center' }} onClick={() => alert('Log activity for: ' + selectedLead.name)}>
                  Log Activity
                </button>
                <button className="biz-btn biz-btn-ghost" style={{ justifyContent: 'center' }} onClick={() => alert('Create task for: ' + selectedLead.name)}>
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* SEARCH MODAL */}
      <Modal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="Search CRM"
        subtitle="Find leads, contacts and accounts across your workspace"
        primaryLabel="Search"
      >
        <div className="biz-input-icon">
          <Icon.search />
          <input
            className="biz-input"
            type="text"
            placeholder="Type to search..."
            autoFocus
            style={{ paddingLeft: 38 }}
          />
        </div>
      </Modal>

      {/* ADD NEW MODAL */}
      <Modal
        open={showAddNewModal}
        onClose={() => setShowAddNewModal(false)}
        title={`New ${addNewType.charAt(0).toUpperCase() + addNewType.slice(1)}`}
        subtitle="Create a new record in your CRM"
        primaryLabel="Create"
      >
        {addNewType === 'lead' && (
          <>
            <input className="biz-input" type="text" placeholder="Lead Name" />
            <input className="biz-input" type="text" placeholder="Company" />
            <input className="biz-input" type="number" placeholder="Deal Value" />
          </>
        )}
        {addNewType === 'contact' && (
          <>
            <input className="biz-input" type="text" placeholder="Contact Name" />
            <input className="biz-input" type="email" placeholder="Email" />
            <input className="biz-input" type="tel" placeholder="Phone" />
          </>
        )}
        {addNewType === 'account' && (
          <>
            <input className="biz-input" type="text" placeholder="Account Name" />
            <input className="biz-input" type="text" placeholder="Industry" />
            <input className="biz-input" type="text" placeholder="Company Size" />
          </>
        )}
        {addNewType === 'activity' && (
          <>
            <input className="biz-input" type="text" placeholder="Activity Title" />
            <select className="biz-select">
              <option value="">Select Activity Type</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
            </select>
            <textarea placeholder="Notes" rows={3} />
          </>
        )}
      </Modal>
    </div>
  )
}

/* ══════════════════════════════════════
   CRM PAGE
══════════════════════════════════════ */
export function CRMPage({ onNavigate, onLogout }: any) {
  useEffect(() => {
    document.querySelectorAll('.reveal').forEach((el: any) => el.classList.add('in'))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <MinimalNav onNavigate={onNavigate} onLogout={onLogout} active="crm" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CRMSection />
      </div>
      <SiteFooter />
    </div>
  )
}
