import { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { SiteFooter, MinimalNav } from './Components'

/* ══════════════════════════════════════
   SALESFORCE/ZOHO-STYLE CRM
══════════════════════════════════════ */
export function CRMSection() {
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState('all')
  
  const pLayout = (t: string, extra={}) => ({
    title: { text: t, font: { color: '#1a1f36', size: 14, family: "'Inter', sans-serif", weight: 600 }, x: 0 },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    font: { family: "'Inter', sans-serif", color: '#4a5568', size: 11 },
    margin: { t: 50, r: 30, l: 50, b: 40 },
    xaxis: { gridcolor: '#f0f0f0', zerolinecolor: '#e0e0e0', tickfont: { color: '#666' } },
    yaxis: { gridcolor: '#f0f0f0', zerolinecolor: '#e0e0e0', tickfont: { color: '#666' } },
    ...extra
  });

  // Sample data
  const leads = [
    { id: 1, name: 'Acme Corporation', value: 125000, stage: 'qualification', probability: 25, owner: 'John Smith', created: '2024-01-15', contact: 'Sarah Johnson', email: 'sarah@acme.com', phone: '555-0123', industry: 'Technology', size: 'Enterprise' },
    { id: 2, name: 'Global Industries', value: 85000, stage: 'proposal', probability: 75, owner: 'Jane Doe', created: '2024-01-12', contact: 'Mike Wilson', email: 'mike@global.com', phone: '555-0124', industry: 'Manufacturing', size: 'Mid-Market' },
    { id: 3, name: 'Tech Solutions Inc', value: 240000, stage: 'negotiation', probability: 90, owner: 'John Smith', created: '2024-01-10', contact: 'Lisa Chen', email: 'lisa@techsolutions.com', phone: '555-0125', industry: 'Software', size: 'Enterprise' },
    { id: 4, name: 'Innovation Labs', value: 45000, stage: 'discovery', probability: 15, owner: 'Bob Johnson', created: '2024-01-08', contact: 'Tom Davis', email: 'tom@innovation.com', phone: '555-0126', industry: 'Healthcare', size: 'Small' },
    { id: 5, name: 'Enterprise Systems', value: 180000, stage: 'closed-won', probability: 100, owner: 'Jane Doe', created: '2024-01-05', contact: 'Rachel Green', email: 'rachel@enterprise.com', phone: '555-0127', industry: 'Finance', size: 'Enterprise' },
  ]

  const activities = [
    { id: 1, type: 'call', title: 'Discovery Call with Acme Corp', lead: 'Acme Corporation', date: '2024-01-20', time: '10:00 AM', duration: '45 min', notes: 'Great initial conversation, they have budget and timeline' },
    { id: 2, type: 'email', title: 'Proposal sent to Global Industries', lead: 'Global Industries', date: '2024-01-19', time: '2:30 PM', duration: '-', notes: 'Custom pricing proposal sent, follow up scheduled' },
    { id: 3, type: 'meeting', title: 'Demo with Tech Solutions', lead: 'Tech Solutions Inc', date: '2024-01-18', time: '3:00 PM', duration: '1 hour', notes: 'Product demo went well, technical team impressed' },
    { id: 4, type: 'task', title: 'Prepare contract for Innovation Labs', lead: 'Innovation Labs', date: '2024-01-17', time: '9:00 AM', duration: '-', notes: 'Legal team reviewing terms' },
  ]

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contact.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = filterStage === 'all' || lead.stage === filterStage
    return matchesSearch && matchesStage
  })

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      'discovery': '#f59e0b',
      'qualification': '#3b82f6',
      'proposal': '#8b5cf6',
      'negotiation': '#ec4899',
      'closed-won': '#10b981',
      'closed-lost': '#ef4444'
    }
    return colors[stage] || '#6b7280'
  }

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'call': '📞',
      'email': '✉️',
      'meeting': '👥',
      'task': '📋'
    }
    return icons[type] || '📝'
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <div style={{ width: '250px', background: '#1a1f36', color: '#ffffff', padding: '20px 0' }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#ffffff' }}>Radon CRM</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Customer Relationship Management</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'leads', label: 'Leads & Opportunities', icon: '🎯' },
            { id: 'contacts', label: 'Contacts', icon: '👥' },
            { id: 'accounts', label: 'Accounts', icon: '🏢' },
            { id: 'activities', label: 'Activities', icon: '📅' },
            { id: 'reports', label: 'Reports', icon: '📈' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                background: activeView === item.id ? '#2563eb' : 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeView !== item.id) {
                  e.currentTarget.style.background = '#334155'
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== item.id) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1f36', margin: 0 }}>
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'leads' && 'Leads & Opportunities'}
              {activeView === 'contacts' && 'Contacts'}
              {activeView === 'accounts' && 'Accounts'}
              {activeView === 'activities' && 'Activities'}
              {activeView === 'reports' && 'Reports'}
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Manage your customer relationships</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{
              padding: '8px 16px',
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              color: '#374151',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🔍 Search
            </button>
            <button style={{
              padding: '8px 16px',
              background: '#2563eb',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ➕ Add New
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
         
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Total Pipeline', value: '$675K', change: '+12%', trend: 'up' },
                  { label: 'New Leads', value: '24', change: '+8%', trend: 'up' },
                  { label: 'Conversion Rate', value: '32%', change: '-2%', trend: 'down' },
                  { label: 'Avg Deal Size', value: '$45K', change: '+5%', trend: 'up' },
                ].map((kpi, i) => (
                  <div key={i} style={{
                    background: '#ffffff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{kpi.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '600', color: '#1a1f36', marginBottom: '8px' }}>{kpi.value}</div>
                    <div style={{
                      fontSize: '12px',
                      color: kpi.trend === 'up' ? '#10b981' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {kpi.trend === 'up' ? '↑' : '↓'} {kpi.change} from last month
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <Plot data={[
                    { type: 'funnel', y: ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'], x: [12400, 3200, 850, 120, 48], marker: { color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'] }, textinfo: 'value+percent initial' as any }
                  ]} layout={pLayout('Sales Pipeline Funnel', { margin: { t: 50, b: 30, l: 120, r: 30 } })} style={{ width: '100%', height: '350px' }} config={{ displayModeBar: false }} />
                </div>
                <div style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <Plot data={[
                    { type: 'pie', values: [12, 28, 44], labels: ['High', 'Medium', 'Low'], hole: 0.7, marker: { colors: ['#ef4444', '#f59e0b', '#3b82f6'] }, textinfo: 'label+percent' }
                  ]} layout={pLayout('Lead Priority Distribution', { margin: { t: 50, b: 30, l: 20, r: 20 }, showlegend: true })} style={{ width: '100%', height: '350px' }} config={{ displayModeBar: false }} />
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1f36', marginBottom: '16px' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activities.slice(0, 4).map(activity => (
                    <div key={activity.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '6px'
                    }}>
                      <span style={{ fontSize: '20px' }}>{getActivityIcon(activity.type)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1f36' }}>{activity.title}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{activity.lead} • {activity.date} at {activity.time}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{activity.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Leads & Opportunities View */}
          {activeView === 'leads' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Filters and Search */}
              <div style={{
                background: '#ffffff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                gap: '16px',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Stages</option>
                  <option value="discovery">Discovery</option>
                  <option value="qualification">Qualification</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed-won">Closed Won</option>
                </select>
              </div>

              {/* Leads Table */}
              <div style={{
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f9fafb' }}>
                    <tr>
                      {['Lead Name', 'Value', 'Stage', 'Probability', 'Owner', 'Contact', 'Created'].map(header => (
                        <th key={header} style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr
                        key={lead.id}
                        style={{
                          borderBottom: '1px solid #f3f4f6',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1f36' }}>{lead.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{lead.industry} • {lead.size}</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1f36' }}>
                            ${(lead.value / 1000).toFixed(0)}K
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '4px',
                            backgroundColor: getStageColor(lead.stage) + '20',
                            color: getStageColor(lead.stage)
                          }}>
                            {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1).replace('-', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '100%',
                              height: '6px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${lead.probability}%`,
                                height: '100%',
                                backgroundColor: getStageColor(lead.stage)
                              }} />
                            </div>
                            <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '35px' }}>
                              {lead.probability}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', color: '#1a1f36' }}>{lead.owner}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div>
                            <div style={{ fontSize: '14px', color: '#1a1f36' }}>{lead.contact}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{lead.email}</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>{lead.created}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Contacts View */}
          {activeView === 'contacts' && (
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1f36', marginBottom: '16px' }}>Contact Management</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {leads.map(lead => (
                  <div key={lead.id} style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#f9fafb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}>
                        {lead.contact.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1f36' }}>{lead.contact}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{lead.name}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
                      <div>📧 {lead.email}</div>
                      <div>📞 {lead.phone}</div>
                      <div>🏢 {lead.industry}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accounts View */}
          {activeView === 'accounts' && (
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1f36', marginBottom: '16px' }}>Account Management</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {leads.map(lead => (
                  <div key={lead.id} style={{
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#ffffff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1f36', margin: '0 0 4px 0' }}>{lead.name}</h4>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{lead.industry} • {lead.size}</div>
                      </div>
                      <span style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        borderRadius: '4px',
                        backgroundColor: getStageColor(lead.stage) + '20',
                        color: getStageColor(lead.stage)
                      }}>
                        {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a1f36', marginBottom: '4px' }}>Contact</div>
                        <div>{lead.contact}</div>
                        <div>{lead.email}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a1f36', marginBottom: '4px' }}>Deal Info</div>
                        <div>Value: ${(lead.value / 1000).toFixed(0)}K</div>
                        <div>Owner: {lead.owner}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities View */}
          {activeView === 'activities' && (
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1f36', marginBottom: '16px' }}>Activity Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activities.map(activity => (
                  <div key={activity.id} style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1f36', marginBottom: '4px' }}>
                        {activity.title}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                        {activity.lead} • {activity.date} at {activity.time} {activity.duration !== '-' && `• ${activity.duration}`}
                      </div>
                      <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                        {activity.notes}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports View */}
          {activeView === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <Plot data={[
                    { type: 'bar', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [420, 380, 510, 490, 620, 710], marker: { color: '#3b82f6' } }
                  ]} layout={pLayout('Monthly Revenue Trend', { margin: { t: 50, b: 40, l: 50, r: 30 } })} style={{ width: '100%', height: '300px' }} config={{ displayModeBar: false }} />
                </div>
                <div style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <Plot data={[
                    { type: 'scatter', mode: 'lines+markers', x: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], y: [12, 19, 15, 25], line: { color: '#10b981' }, marker: { color: '#10b981', size: 8 } }
                  ]} layout={pLayout('Weekly Lead Generation', { margin: { t: 50, b: 40, l: 50, r: 30 } })} style={{ width: '100%', height: '300px' }} config={{ displayModeBar: false }} />
                </div>
              </div>
              <div style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <Plot data={[
                  { type: 'bar', orientation: 'h', x: [2.1, 1.8, 1.4, 0.9, 0.5], y: ['Acme Corp', 'Global Industries', 'Tech Solutions', 'Innovation Labs', 'Enterprise Systems'], marker: { color: '#8b5cf6' } }
                ]} layout={pLayout('Top Performing Accounts', { margin: { t: 50, b: 40, l: 150, r: 30 }, yaxis: { autorange: 'reversed' } })} style={{ width: '100%', height: '400px' }} config={{ displayModeBar: false }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lead Detail Sidebar */}
      {selectedLead && (
        <div style={{
          width: '400px',
          background: '#ffffff',
          borderLeft: '1px solid #e5e7eb',
          padding: '24px',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1f36', margin: 0 }}>Lead Details</h3>
            <button
              onClick={() => setSelectedLead(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Company Information</h4>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1f36', marginBottom: '4px' }}>{selectedLead.name}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>{selectedLead.industry} • {selectedLead.size}</div>
            </div>
            
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Contact Information</h4>
              <div style={{ fontSize: '14px', color: '#1a1f36', lineHeight: '1.6' }}>
                <div><strong>Name:</strong> {selectedLead.contact}</div>
                <div><strong>Email:</strong> {selectedLead.email}</div>
                <div><strong>Phone:</strong> {selectedLead.phone}</div>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Deal Information</h4>
              <div style={{ fontSize: '14px', color: '#1a1f36', lineHeight: '1.6' }}>
                <div><strong>Value:</strong> ${(selectedLead.value / 1000).toFixed(0)}K</div>
                <div><strong>Stage:</strong> {selectedLead.stage.charAt(0).toUpperCase() + selectedLead.stage.slice(1).replace('-', ' ')}</div>
                <div><strong>Probability:</strong> {selectedLead.probability}%</div>
                <div><strong>Owner:</strong> {selectedLead.owner}</div>
                <div><strong>Created:</strong> {selectedLead.created}</div>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>Actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{
                  padding: '10px 16px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  Edit Lead
                </button>
                <button style={{
                  padding: '10px 16px',
                  background: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  Log Activity
                </button>
                <button style={{
                  padding: '10px 16px',
                  background: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
