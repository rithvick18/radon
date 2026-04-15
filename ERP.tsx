import { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { SiteFooter, MinimalNav } from './Components'
import { useCollection, db } from './src/Services/useDatabase'
import type { Product, InventoryItem, FinancialAccount, Employee, Project, Supplier } from './src/Services/DatabaseTypes'

/* ══════════════════════════════════════
   DYNAMICS 365-STYLE ERP
══════════════════════════════════════ */
export function ERPSection() {
  const [activeModule, setActiveModule] = useState('dashboard')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showNewRecordModal, setShowNewRecordModal] = useState(false)
  const [newRecordType, setNewRecordType] = useState('')
  
  const pLayout = (t: string, extra={}) => ({
    title: { text: t, font: { color: 'var(--text)', size: 14, family: "'Inter', sans-serif", weight: 600 }, x: 0 },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    font: { family: "'Inter', sans-serif", color: '#4a5568', size: 11 },
    margin: { t: 50, r: 30, l: 50, b: 40 },
    xaxis: { gridcolor: '#f0f0f0', zerolinecolor: '#e0e0e0', tickfont: { color: '#666' } },
    yaxis: { gridcolor: '#f0f0f0', zerolinecolor: '#e0e0e0', tickfont: { color: '#666' } },
    ...extra
  });

  // Data from shared database
  const products = useCollection<Product>('products')
  const inventoryItems = useCollection<InventoryItem>('inventory')
  const financials = useCollection<FinancialAccount>('financialAccounts')
  const employees = useCollection<Employee>('employees')
  const projects = useCollection<Project>('projects')
  const suppliers = useCollection<Supplier>('suppliers')

  // Enrich inventory with product and supplier data
  const inventory = inventoryItems.map(item => {
    const product = products.find(p => p.id === item.productId)
    return {
      ...item,
      sku: product?.sku || '',
      name: product?.name || '',
      category: product?.category || '',
      unitCost: product?.unitCost || 0,
      value: (product?.unitCost || 0) * item.quantity,
      supplier: product?.supplierName || '',
    }
  })

  // Enrich projects with manager names
  const enrichedProjects = projects.map(project => {
    const manager = employees.find(e => e.id === project.managerId)
    return {
      ...project,
      manager: manager?.name || 'Unassigned',
      team: project.teamSize,
    }
  })

  // Enrich employees with manager names
  const enrichedEmployees = employees.map(emp => {
    const manager = emp.managerId ? employees.find(e => e.id === emp.managerId) : null
    return {
      ...emp,
      manager: manager?.name || 'CEO',
    }
  })

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'in-stock': '#10b981',
      'low-stock': '#f59e0b',
      'critical': '#ef4444',
      'active': '#10b981',
      'in-progress': '#3b82f6',
      'planning': '#8b5cf6',
      'completed': '#10b981',
      'up': '#10b981',
      'down': '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Aggregated stats from database
  const stats = db.getAggregatedStats()

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar Navigation */}
      <div style={{ width: '260px', background: 'var(--s1)', color: 'var(--text)', padding: '20px 0', borderRight: '1px solid rgba(96,165,250,0.06)' }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>Radon ERP</h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '4px 0 0 0' }}>Enterprise Resource Planning</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'financials', label: 'Financial Management', icon: '💰' },
            { id: 'inventory', label: 'Inventory Management', icon: '📦' },
            { id: 'supply-chain', label: 'Supply Chain', icon: '🚚' },
            { id: 'hr', label: 'Human Resources', icon: '👥' },
            { id: 'projects', label: 'Project Management', icon: '📋' },
            { id: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
            { id: 'reports', label: 'Reports & Analytics', icon: '📈' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                background: activeModule === item.id ? 'var(--elec)' : 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeModule !== item.id) {
                  e.currentTarget.style.background = 'var(--s2)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeModule !== item.id) {
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
        <div style={{ background: 'var(--s1)', borderBottom: '1px solid rgba(96,165,250,0.06)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
              {activeModule === 'dashboard' && 'ERP Dashboard'}
              {activeModule === 'financials' && 'Financial Management'}
              {activeModule === 'inventory' && 'Inventory Management'}
              {activeModule === 'supply-chain' && 'Supply Chain Management'}
              {activeModule === 'hr' && 'Human Resources'}
              {activeModule === 'projects' && 'Project Management'}
              {activeModule === 'manufacturing' && 'Manufacturing'}
              {activeModule === 'reports' && 'Reports & Analytics'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '4px 0 0 0' }}>Manage your enterprise resources efficiently</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={() => setShowSearchModal(true)}
              style={{
                padding: '8px 16px',
                background: 'var(--s2)',
                border: '1px solid rgba(96,165,250,0.15)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🔍 Search
            </button>
            <button 
              onClick={() => {
                setNewRecordType(activeModule === 'financials' ? 'financial' : 
                              activeModule === 'inventory' ? 'inventory' : 
                              activeModule === 'hr' ? 'employee' : 
                              activeModule === 'projects' ? 'project' : 'general')
                setShowNewRecordModal(true)
              }}
              style={{
                padding: '8px 16px',
                background: 'var(--elec)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--bg)',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ➕ New Record
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
         
          {/* Dashboard View */}
          {activeModule === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Total Revenue', value: `$${(stats.erp.totalRevenue / 1000000).toFixed(2)}M`, change: '+18.5%', trend: 'up' },
                  { label: 'Inventory Value', value: `$${(stats.erp.inventoryValue / 1000).toFixed(0)}K`, change: '+3.8%', trend: 'up' },
                  { label: 'Active Projects', value: stats.erp.activeProjects.toString(), change: '+2', trend: 'up' },
                  { label: 'Employees', value: stats.erp.employeeCount.toString(), change: '+5.2%', trend: 'up' },
                ].map((kpi, i) => (
                  <div key={i} style={{
                    background: 'var(--s1)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(96,165,250,0.06)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>{kpi.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>{kpi.value}</div>
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
                  background: 'var(--s1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  <Plot data={[
                    { type: 'bar', name: 'Revenue', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [420, 480, 510, 490, 580, 620], marker: { color: '#10b981' } },
                    { type: 'bar', name: 'Expenses', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [380, 390, 410, 420, 450, 440], marker: { color: '#ef4444' } },
                    { type: 'scatter', name: 'Profit', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [40, 90, 100, 70, 130, 180], mode: 'lines+markers', line: { color: '#3b82f6', width: 3 } }
                  ]} layout={pLayout('Revenue vs Expenses', { barmode: 'group', margin: { t: 50, b: 40, l: 50, r: 30 } })} style={{ width: '100%', height: '350px' }} config={{ displayModeBar: false }} />
                </div>
                <div style={{
                  background: 'var(--s1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  <Plot data={[
                    { type: 'pie', values: [45, 25, 20, 10], labels: ['Electronics', 'Furniture', 'Office Supplies', 'Raw Materials'], hole: 0.7, marker: { colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'] }, textinfo: 'label+percent' }
                  ]} layout={pLayout('Inventory by Category', { margin: { t: 50, b: 30, l: 20, r: 20 }, showlegend: true })} style={{ width: '100%', height: '350px' }} config={{ displayModeBar: false }} />
                </div>
              </div>

              {/* Recent Activities */}
              <div style={{
                background: 'var(--s1)',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(96,165,250,0.06)',
                boxShadow: 'var(--shadow-elevated)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>Recent Activities</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', marginBottom: '12px' }}>Latest Transactions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { desc: 'Invoice #1245 paid', amount: '$12,500', time: '2 hours ago' },
                        { desc: 'Purchase order approved', amount: '$8,200', time: '5 hours ago' },
                        { desc: 'Salary payments processed', amount: '$125,000', time: '1 day ago' },
                      ].map((item, i) => (
                        <div key={i} style={{
                          padding: '8px',
                          background: 'var(--s2)',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          <div style={{ fontWeight: '500', color: 'var(--text)' }}>{item.desc}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', marginTop: '2px' }}>
                            <span>{item.amount}</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', marginBottom: '12px' }}>Inventory Alerts</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { item: 'Standing Desk', status: 'critical', qty: '12 units' },
                        { item: 'Office Chair', status: 'low-stock', qty: '89 units' },
                        { item: 'Monitor 27"', status: 'reorder', qty: '156 units' },
                      ].map((alert, i) => (
                        <div key={i} style={{
                          padding: '8px',
                          background: 'var(--s2)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          borderLeft: `3px solid ${getStatusColor(alert.status)}`
                        }}>
                          <div style={{ fontWeight: '500', color: 'var(--text)' }}>{alert.item}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', marginTop: '2px' }}>
                            <span>{alert.qty}</span>
                            <span style={{ color: getStatusColor(alert.status) }}>{alert.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', marginBottom: '12px' }}>Project Updates</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { project: 'ERP Upgrade', progress: 65, status: 'on-track' },
                        { project: 'Website Redesign', progress: 15, status: 'planning' },
                        { project: 'Mobile App', progress: 40, status: 'in-progress' },
                      ].map((proj, i) => (
                        <div key={i} style={{
                          padding: '8px',
                          background: 'var(--s2)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px'
                        }}>
                          <div style={{ fontWeight: '500', color: 'var(--text)' }}>{proj.project}</div>
                          <div style={{ marginTop: '4px' }}>
                            <div style={{
                              height: '4px',
                              background: 'rgba(96,165,250,0.1)',
                              borderRadius: '2px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${proj.progress}%`,
                                height: '100%',
                                backgroundColor: getStatusColor(proj.status)
                              }} />
                            </div>
                            <div style={{ color: 'var(--muted)', marginTop: '2px' }}>{proj.progress}% complete</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financial Management View */}
          {activeModule === 'financials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Financial KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Total Assets', value: '$4.68M', change: '+5.2%', trend: 'up' },
                  { label: 'Total Liabilities', value: '$890K', change: '-2.1%', trend: 'down' },
                  { label: 'Cash Flow', value: '$510K', change: '+12.4%', trend: 'up' },
                  { label: 'Profit Margin', value: '18.5%', change: '+3.2%', trend: 'up' },
                ].map((kpi, i) => (
                  <div key={i} style={{
                    background: 'var(--s1)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(96,165,250,0.06)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>{kpi.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>{kpi.value}</div>
                    <div style={{
                      fontSize: '12px',
                      color: kpi.trend === 'up' ? '#10b981' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {kpi.trend === 'up' ? '↑' : '↓'} {kpi.change} from last quarter
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{
                  background: 'var(--s1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  <Plot data={[
                    { type: 'bar', name: 'Revenue', x: ['Q1', 'Q2', 'Q3', 'Q4'], y: [1420, 1680, 1890, 1780], marker: { color: '#10b981' } },
                    { type: 'bar', name: 'Expenses', x: ['Q1', 'Q2', 'Q3', 'Q4'], y: [1180, 1310, 1420, 1370], marker: { color: '#ef4444' } },
                    { type: 'scatter', name: 'Net Profit', x: ['Q1', 'Q2', 'Q3', 'Q4'], y: [240, 370, 470, 410], mode: 'lines+markers', line: { color: '#3b82f6', width: 3 } }
                  ]} layout={pLayout('Quarterly Financial Performance', { barmode: 'group', margin: { t: 50, b: 40, l: 50, r: 30 } })} style={{ width: '100%', height: '350px' }} config={{ displayModeBar: false }} />
                </div>
                <div style={{
                  background: 'var(--s1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  <Plot data={[
                    { type: 'pie', values: [1450, 890, 2340, 845], labels: ['Accounts Receivable', 'Accounts Payable', 'Cash', 'Inventory'], hole: 0.7, marker: { colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'] }, textinfo: 'label+percent' }
                  ]} layout={pLayout('Asset Distribution', { margin: { t: 50, b: 30, l: 20, r: 20 }, showlegend: true })} style={{ width: '100%', height: '350px' }} config={{ displayModeBar: false }} />
                </div>
              </div>

              {/* Financial Accounts Table */}
              <div style={{
                background: 'var(--s1)',
                borderRadius: '8px',
                border: '1px solid rgba(96,165,250,0.06)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--s2)' }}>
                    <tr>
                      {['Account', 'Type', 'Balance', 'Change', 'Department'].map(header => (
                        <th key={header} style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'var(--muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '1px solid rgba(96,165,250,0.06)'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {financials.map(account => (
                      <tr
                        key={account.id}
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
                        onClick={() => setSelectedItem(account)}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1f36' }}>{account.account}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '4px',
                            backgroundColor: account.type === 'Asset' ? '#10b98120' : account.type === 'Liability' ? '#ef444420' : '#3b82f620',
                            color: account.type === 'Asset' ? '#10b981' : account.type === 'Liability' ? '#ef4444' : '#3b82f6'
                          }}>
                            {account.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1f36' }}>
                            ${(account.balance / 1000).toFixed(0)}K
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '14px', color: getStatusColor(account.trend) }}>
                              {account.trend === 'up' ? '↑' : '↓'} {Math.abs(account.change)}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>{account.department}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inventory Management View */}
          {activeModule === 'inventory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Inventory KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Total SKUs', value: '14,204', change: '+124', trend: 'up' },
                  { label: 'Inventory Value', value: '$845K', change: '+3.8%', trend: 'up' },
                  { label: 'Low Stock Alerts', value: '24', change: '-8', trend: 'down' },
                  { label: 'Turnover Rate', value: '4.2x', change: '+0.3x', trend: 'up' },
                ].map((kpi, i) => (
                  <div key={i} style={{
                    background: 'var(--s1)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(96,165,250,0.06)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>{kpi.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>{kpi.value}</div>
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

              {/* Search and Filters */}
              <div style={{
                background: 'var(--s1)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid rgba(96,165,250,0.06)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                gap: '16px',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  placeholder="Search inventory..."
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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Inventory Table */}
              <div style={{
                background: 'var(--s1)',
                borderRadius: '8px',
                border: '1px solid rgba(96,165,250,0.06)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--s2)' }}>
                    <tr>
                      {['SKU', 'Product Name', 'Category', 'Quantity', 'Value', 'Status', 'Location'].map(header => (
                        <th key={header} style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'var(--muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '1px solid rgba(96,165,250,0.06)'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(item => (
                      <tr
                        key={item.id}
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
                        onClick={() => setSelectedItem(item)}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1f36' }}>{item.sku}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1f36' }}>{item.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.supplier}</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>{item.category}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1f36' }}>{item.quantity}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1f36' }}>
                            ${(item.value / 1000).toFixed(0)}K
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '4px',
                            backgroundColor: getStatusColor(item.status) + '20',
                            color: getStatusColor(item.status)
                          }}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>{item.location}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Human Resources View */}
          {activeModule === 'hr' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* HR KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Total Employees', value: '247', change: '+12', trend: 'up' },
                  { label: 'Avg Salary', value: '$85K', change: '+3.2%', trend: 'up' },
                  { label: 'Turnover Rate', value: '8.5%', change: '-1.2%', trend: 'down' },
                  { label: 'Open Positions', value: '8', change: '-3', trend: 'down' },
                ].map((kpi, i) => (
                  <div key={i} style={{
                    background: 'var(--s1)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(96,165,250,0.06)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>{kpi.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>{kpi.value}</div>
                    <div style={{
                      fontSize: '12px',
                      color: kpi.trend === 'up' ? '#10b981' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {kpi.trend === 'up' ? '↑' : '↓'} {kpi.change} from last quarter
                    </div>
                  </div>
                ))}
              </div>

              {/* Employee Table */}
              <div style={{
                background: 'var(--s1)',
                borderRadius: '8px',
                border: '1px solid rgba(96,165,250,0.06)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--s2)' }}>
                    <tr>
                      {['Employee', 'Department', 'Position', 'Salary', 'Performance', 'Hire Date'].map(header => (
                        <th key={header} style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'var(--muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '1px solid rgba(96,165,250,0.06)'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedEmployees.map(employee => (
                      <tr
                        key={employee.id}
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
                        onClick={() => setSelectedItem(employee)}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#3b82f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontWeight: '600',
                              fontSize: '12px'
                            }}>
                              {employee.avatar}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1f36' }}>{employee.name}</div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>{employee.manager}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>{employee.department}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', color: '#1a1f36' }}>{employee.position}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1f36' }}>
                            ${(employee.salary / 1000).toFixed(0)}K
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '60px',
                              height: '6px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${(employee.performance / 5) * 100}%`,
                                height: '100%',
                                backgroundColor: employee.performance >= 4 ? '#10b981' : employee.performance >= 3 ? '#f59e0b' : '#ef4444'
                              }} />
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--muted)', minWidth: '25px' }}>
                              {employee.performance}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>{employee.hireDate}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Project Management View */}
          {activeModule === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Project KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Active Projects', value: '12', change: '+2', trend: 'up' },
                  { label: 'Total Budget', value: '$825K', change: '+15%', trend: 'up' },
                  { label: 'On-Time Delivery', value: '85%', change: '+5%', trend: 'up' },
                  { label: 'Team Utilization', value: '78%', change: '+3%', trend: 'up' },
                ].map((kpi, i) => (
                  <div key={i} style={{
                    background: 'var(--s1)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(96,165,250,0.06)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>{kpi.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>{kpi.value}</div>
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

              {/* Project Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                {enrichedProjects.map(project => (
                  <div key={project.id} style={{
                    background: 'var(--s1)',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(96,165,250,0.06)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', margin: '0 0 4px 0' }}>{project.name}</h4>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Manager: {project.manager}</div>
                      </div>
                      <span style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        borderRadius: '4px',
                        backgroundColor: getStatusColor(project.status) + '20',
                        color: getStatusColor(project.status)
                      }}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div style={{
                        height: '8px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${project.progress}%`,
                          height: '100%',
                          backgroundColor: getStatusColor(project.status)
                        }} />
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>Budget</div>
                        <div>${(project.budget / 1000).toFixed(0)}K</div>
                        <div>Spent: ${(project.spent / 1000).toFixed(0)}K</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>Timeline</div>
                        <div>{project.startDate}</div>
                        <div>{project.endDate}</div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                      <strong>Team:</strong> {project.teamSize} members
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supply Chain View */}
          {activeModule === 'supply-chain' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Supply Chain KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Active Shipments', value: '47', change: '+8', trend: 'up' },
                  { label: 'On-Time Delivery', value: '92%', change: '+3%', trend: 'up' },
                  { label: 'Supplier Score', value: '4.6', change: '+0.2', trend: 'up' },
                  { label: 'Logistics Cost', value: '$124K', change: '-5%', trend: 'down' },
                ].map((kpi, i) => (
                  <div key={i} style={{
                    background: 'var(--s1)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(96,165,250,0.06)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>{kpi.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>{kpi.value}</div>
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

              {/* Supply Chain Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{
                  background: 'var(--s1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  <Plot data={[
                    { type: 'scatter', mode: 'lines+markers', name: 'Inbound', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], y: [120, 150, 180, 90, 200, 140], line: { color: '#10b981', shape: 'spline' }, fill: 'tozeroy', fillcolor: 'rgba(16, 185, 129, 0.1)' },
                    { type: 'scatter', mode: 'lines+markers', name: 'Outbound', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], y: [100, 130, 200, 120, 250, 110], line: { color: '#3b82f6', shape: 'spline' } }
                  ]} layout={pLayout('Weekly Shipments', { margin: { t: 50, b: 40, l: 50, r: 30 } })} style={{ width: '100%', height: '350px' }} config={{ displayModeBar: false }} />
                </div>
                <div style={{
                  background: 'var(--s1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  <Plot data={[
                    { type: 'scatterpolar', r: [95, 80, 90, 75, 95], theta: ['Delivery', 'Quality', 'Pricing', 'Communication', 'Flexibility'], fill: 'toself', fillcolor: 'rgba(59, 130, 246, 0.2)', line: { color: '#3b82f6' } }
                  ]} layout={pLayout('Supplier Performance', { polar: { radialaxis: { visible: true, range: [0, 100] } }, margin: { t: 50, b: 30, l: 30, r: 30 } })} style={{ width: '100%', height: '350px' }} config={{ displayModeBar: false }} />
                </div>
              </div>

              {/* Shipment Tracking */}
              <div style={{
                background: 'var(--s1)',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid rgba(96,165,250,0.06)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>Active Shipments</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {[
                    { id: 'SHP-001', destination: 'New York, USA', status: 'in-transit', eta: '2 days', progress: 65 },
                    { id: 'SHP-002', destination: 'London, UK', status: 'delayed', eta: '5 days', progress: 30 },
                    { id: 'SHP-003', destination: 'Tokyo, Japan', status: 'delivered', eta: 'Delivered', progress: 100 },
                    { id: 'SHP-004', destination: 'Sydney, Australia', status: 'in-transit', eta: '7 days', progress: 45 },
                  ].map(shipment => (
                    <div key={shipment.id} style={{
                      padding: '16px',
                      border: '1px solid rgba(96,165,250,0.06)',
                      borderRadius: '8px',
                      background: 'var(--s2)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1f36' }}>{shipment.id}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{shipment.destination}</div>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: '500',
                          borderRadius: '4px',
                          backgroundColor: getStatusColor(shipment.status) + '20',
                          color: getStatusColor(shipment.status)
                        }}>
                          {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                          <span>Progress</span>
                          <span>{shipment.progress}%</span>
                        </div>
                        <div style={{
                          height: '6px',
                          background: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${shipment.progress}%`,
                            height: '100%',
                            backgroundColor: getStatusColor(shipment.status)
                          }} />
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        <strong>ETA:</strong> {shipment.eta}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Manufacturing View */}
          {activeModule === 'manufacturing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Manufacturing KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Production Rate', value: '1,250', change: '+8%', trend: 'up' },
                  { label: 'Quality Rate', value: '98.5%', change: '+0.5%', trend: 'up' },
                  { label: 'Downtime', value: '2.4%', change: '-1.2%', trend: 'down' },
                  { label: 'Efficiency', value: '87%', change: '+3%', trend: 'up' },
                ].map((kpi, i) => (
                  <div key={i} style={{
                    background: 'var(--s1)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(96,165,250,0.06)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>{kpi.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>{kpi.value}</div>
                    <div style={{
                      fontSize: '12px',
                      color: kpi.trend === 'up' ? '#10b981' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {kpi.trend === 'up' ? '↑' : '↓'} {kpi.change} from last week
                    </div>
                  </div>
                ))}
              </div>

              {/* Production Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{
                  background: 'var(--s1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  <Plot data={[
                    { type: 'scatter', mode: 'lines+markers', name: 'Actual', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], y: [1200, 1350, 1180, 1420, 1380, 1250], line: { color: '#10b981', shape: 'spline' } },
                    { type: 'scatter', mode: 'lines', name: 'Target', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], y: [1300, 1300, 1300, 1300, 1300, 1300], line: { color: '#ef4444', dash: 'dash' } }
                  ]} layout={pLayout('Daily Production Output', { margin: { t: 50, b: 40, l: 50, r: 30 } })} style={{ width: '100%', height: '350px' }} config={{ displayModeBar: false }} />
                </div>
                <div style={{
                  background: 'var(--s1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  <Plot data={[
                    { type: 'pie', values: [45, 25, 20, 10], labels: ['Line A', 'Line B', 'Line C', 'Line D'], hole: 0.7, marker: { colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'] }, textinfo: 'label+percent' }
                  ]} layout={pLayout('Production by Line', { margin: { t: 50, b: 30, l: 20, r: 20 }, showlegend: true })} style={{ width: '100%', height: '350px' }} config={{ displayModeBar: false }} />
                </div>
              </div>

              {/* Production Lines */}
              <div style={{
                background: 'var(--s1)',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid rgba(96,165,250,0.06)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>Production Lines Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  {[
                    { name: 'Line A - Electronics', status: 'running', output: 450, target: 500, efficiency: 90 },
                    { name: 'Line B - Assembly', status: 'running', output: 380, target: 400, efficiency: 95 },
                    { name: 'Line C - Packaging', status: 'maintenance', output: 0, target: 300, efficiency: 0 },
                    { name: 'Line D - Quality Control', status: 'running', output: 420, target: 450, efficiency: 93 },
                  ].map((line, i) => (
                    <div key={i} style={{
                      padding: '16px',
                      border: '1px solid rgba(96,165,250,0.06)',
                      borderRadius: '8px',
                      background: 'var(--s2)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1f36' }}>{line.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Efficiency: {line.efficiency}%</div>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: '500',
                          borderRadius: '4px',
                          backgroundColor: getStatusColor(line.status) + '20',
                          color: getStatusColor(line.status)
                        }}>
                          {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
                        </span>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                          <span>Output: {line.output} / {line.target}</span>
                        </div>
                        <div style={{
                          height: '6px',
                          background: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(line.output / line.target) * 100}%`,
                            height: '100%',
                            backgroundColor: getStatusColor(line.status)
                          }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reports View */}
          {activeModule === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{
                  background: 'var(--s1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  <Plot data={[
                    { type: 'bar', x: ['Q1', 'Q2', 'Q3', 'Q4'], y: [1420, 1680, 1890, 1780], marker: { color: '#3b82f6' } }
                  ]} layout={pLayout('Quarterly Revenue Trend', { margin: { t: 50, b: 40, l: 50, r: 30 } })} style={{ width: '100%', height: '300px' }} config={{ displayModeBar: false }} />
                </div>
                <div style={{
                  background: 'var(--s1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  <Plot data={[
                    { type: 'scatter', mode: 'lines+markers', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [92, 88, 95, 91, 94, 96], line: { color: '#10b981' }, marker: { color: '#10b981', size: 8 } }
                  ]} layout={pLayout('Quality Metrics', { margin: { t: 50, b: 40, l: 50, r: 30 } })} style={{ width: '100%', height: '300px' }} config={{ displayModeBar: false }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{
                  background: 'var(--s1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  <Plot data={[
                    { type: 'bar', name: 'Revenue', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [420, 480, 510, 490, 580, 620], marker: { color: '#10b981' } },
                    { type: 'bar', name: 'Expenses', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [380, 390, 410, 420, 450, 440], marker: { color: '#ef4444' } }
                  ]} layout={pLayout('Monthly Financial Overview', { barmode: 'group', margin: { t: 50, b: 40, l: 50, r: 30 } })} style={{ width: '100%', height: '400px' }} config={{ displayModeBar: false }} />
                </div>
                <div style={{
                  background: 'var(--s1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(96,165,250,0.06)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  <Plot data={[
                    { type: 'pie', values: [245, 89, 567, 12, 156], labels: ['Laptops', 'Chairs', 'Mice', 'Desks', 'Monitors'], hole: 0.7, marker: { colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'] }, textinfo: 'label+percent' }
                  ]} layout={pLayout('Inventory Distribution', { margin: { t: 50, b: 30, l: 20, r: 20 }, showlegend: true })} style={{ width: '100%', height: '400px' }} config={{ displayModeBar: false }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Sidebar */}
      {selectedItem && (
        <div style={{
          width: '400px',
          background: 'var(--s1)',
          borderLeft: '1px solid #e5e7eb',
          padding: '24px',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>Item Details</h3>
            <button
              onClick={() => setSelectedItem(null)}
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
            {/* Dynamic content based on selected item type */}
            {selectedItem.sku && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', marginBottom: '8px' }}>Product Information</h4>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{selectedItem.name}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{selectedItem.category} • {selectedItem.sku}</div>
              </div>
            )}
            
            {selectedItem.account && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', marginBottom: '8px' }}>Account Information</h4>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{selectedItem.account}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{selectedItem.type} • {selectedItem.department}</div>
              </div>
            )}
            
            {selectedItem.name && !selectedItem.sku && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', marginBottom: '8px' }}>Employee Information</h4>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{selectedItem.name}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{selectedItem.position} • {selectedItem.department}</div>
              </div>
            )}
            
            {selectedItem.name && !selectedItem.sku && !selectedItem.account && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', marginBottom: '8px' }}>Project Information</h4>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{selectedItem.name}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Manager: {selectedItem.manager}</div>
              </div>
            )}
            
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', marginBottom: '12px' }}>Actions</h4>
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
                  Edit Item
                </button>
                <button style={{
                  padding: '10px 16px',
                  background: 'var(--s1)',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  View History
                </button>
                <button style={{
                  padding: '10px 16px',
                  background: 'var(--s1)',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--s1)',
            borderRadius: '8px',
            padding: '24px',
            width: '500px',
            maxWidth: '90%'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
              Search ERP Records
            </h3>
            <input
              type="text"
              placeholder="Search across all modules..."
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSearchModal(false)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--s1)',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSearchModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Record Modal */}
      {showNewRecordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--s1)',
            borderRadius: '8px',
            padding: '24px',
            width: '500px',
            maxWidth: '90%'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
              Create New {newRecordType.charAt(0).toUpperCase() + newRecordType.slice(1)} Record
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="Name/Title"
                style={{
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                placeholder="Description"
                style={{
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <input
                type="number"
                placeholder="Value/Amount"
                style={{
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowNewRecordModal(false)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--s1)',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewRecordModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Create Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════
   ERP PAGE
══════════════════════════════════════ */
export function ERPPage({ onNavigate, onLogout }: any) {
  useEffect(() => { 
    document.querySelectorAll('.reveal').forEach((el: any) => el.classList.add('in')) 
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <MinimalNav onNavigate={onNavigate} onLogout={onLogout} active="erp" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ERPSection />
      </div>
      <SiteFooter />
    </div>
  )
}
