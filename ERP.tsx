import { useState, useEffect, useMemo } from 'react'
import Plot from 'react-plotly.js'
import { SiteFooter, MinimalNav } from './Components'
import { useCollection, db } from './src/Services/useDatabase'
import type { Product, InventoryItem, FinancialAccount, Employee, Project } from './src/Services/DatabaseTypes'
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
   ERP — REDESIGNED
   Enterprise Resource Planning
══════════════════════════════════════ */
export function ERPSection() {
  const [activeModule, setActiveModule] = useState('dashboard')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showNewRecordModal, setShowNewRecordModal] = useState(false)
  const [newRecordType, setNewRecordType] = useState('')

  // Data from shared database
  const products = useCollection<Product>('products')
  const inventoryItems = useCollection<InventoryItem>('inventory')
  const financials = useCollection<FinancialAccount>('financialAccounts')
  const employees = useCollection<Employee>('employees')
  const projects = useCollection<Project>('projects')

  // Enrich inventory with product data
  const inventory = useMemo(
    () =>
      inventoryItems.map((item) => {
        const product = products.find((p) => p.id === item.productId)
        return {
          ...item,
          sku: product?.sku || '',
          name: product?.name || '',
          category: product?.category || '',
          unitCost: product?.unitCost || 0,
          value: (product?.unitCost || 0) * item.quantity,
          supplier: product?.supplierName || '',
        }
      }),
    [inventoryItems, products]
  )

  const enrichedProjects = useMemo(
    () =>
      projects.map((project) => {
        const manager = employees.find((e) => e.id === project.managerId)
        return { ...project, manager: manager?.name || 'Unassigned', team: project.teamSize }
      }),
    [projects, employees]
  )

  const enrichedEmployees = useMemo(
    () =>
      employees.map((emp) => {
        const manager = emp.managerId ? employees.find((e) => e.id === emp.managerId) : null
        return { ...emp, manager: manager?.name || 'CEO' }
      }),
    [employees]
  )

  const filteredInventory = inventory.filter((item) => {
    const q = searchTerm.toLowerCase()
    const matchesSearch = item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = db.getAggregatedStats()

  const sections: NavSectionDef[] = [
    {
      label: 'Workspace',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }],
    },
    {
      label: 'Operations',
      items: [
        { id: 'financials', label: 'Financials', icon: 'dollar' },
        { id: 'inventory', label: 'Inventory', icon: 'box' },
        { id: 'supply-chain', label: 'Supply Chain', icon: 'truck' },
        { id: 'manufacturing', label: 'Manufacturing', icon: 'factory' },
      ],
    },
    {
      label: 'People',
      items: [
        { id: 'hr', label: 'Human Resources', icon: 'users' },
        { id: 'projects', label: 'Projects', icon: 'briefcase' },
      ],
    },
    {
      label: 'Insights',
      items: [{ id: 'reports', label: 'Reports', icon: 'chart' }],
    },
  ]

  const meta: Record<string, { title: string; subtitle: string; crumbs: string[] }> = {
    dashboard: { title: 'Operations Overview', subtitle: 'Live snapshot of your enterprise', crumbs: ['ERP', 'Dashboard'] },
    financials: { title: 'Financial Management', subtitle: 'Cash flow, ledgers and profitability', crumbs: ['ERP', 'Financials'] },
    inventory: { title: 'Inventory Management', subtitle: 'Stock levels, valuation and movement', crumbs: ['ERP', 'Inventory'] },
    'supply-chain': { title: 'Supply Chain', subtitle: 'Shipments, suppliers and logistics', crumbs: ['ERP', 'Supply Chain'] },
    hr: { title: 'Human Resources', subtitle: 'Workforce, performance and compensation', crumbs: ['ERP', 'HR'] },
    projects: { title: 'Project Management', subtitle: 'Initiatives, budgets and delivery', crumbs: ['ERP', 'Projects'] },
    manufacturing: { title: 'Manufacturing', subtitle: 'Production lines and output', crumbs: ['ERP', 'Manufacturing'] },
    reports: { title: 'Reports & Analytics', subtitle: 'Cross-module business intelligence', crumbs: ['ERP', 'Reports'] },
  }
  const m = meta[activeModule]

  return (
    <div className="biz-shell">
      <BizSidebar
        brand="Radon ERP"
        subtitle="OPS · v3.0"
        sections={sections}
        active={activeModule}
        onSelect={setActiveModule}
      />

      <main className="biz-main">
        <BizTopbar
          crumbs={m.crumbs}
          title={m.title}
          subtitle={m.subtitle}
          onSearch={() => setShowSearchModal(true)}
          onAdd={() => {
            setNewRecordType(
              activeModule === 'financials'
                ? 'financial'
                : activeModule === 'inventory'
                ? 'inventory'
                : activeModule === 'hr'
                ? 'employee'
                : activeModule === 'projects'
                ? 'project'
                : 'general'
            )
            setShowNewRecordModal(true)
          }}
          addLabel="New Record"
        />

        <div className="biz-content">
          {/* DASHBOARD */}
          {activeModule === 'dashboard' && (
            <>
              <div className="biz-kpi-grid">
                <StatCard label="Total Revenue" value={`$${(stats.erp.totalRevenue / 1000000).toFixed(2)}M`} change="+18.5%" trend="up" variant="green" foot="vs last quarter" />
                <StatCard label="Inventory Value" value={`$${(stats.erp.inventoryValue / 1000).toFixed(0)}K`} change="+3.8%" trend="up" variant="blue" foot="vs last month" />
                <StatCard label="Active Projects" value={stats.erp.activeProjects.toString()} change="+2" trend="up" variant="violet" foot="this quarter" />
                <StatCard label="Workforce" value={stats.erp.employeeCount.toString()} change="+5.2%" trend="up" variant="cyan" foot="YoY" />
              </div>

              <div className="biz-grid-2-1">
                <Card>
                  <Plot
                    data={[
                      { type: 'bar', name: 'Revenue', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [420, 480, 510, 490, 580, 620], marker: { color: '#34d399' } },
                      { type: 'bar', name: 'Expenses', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [380, 390, 410, 420, 450, 440], marker: { color: '#f87171' } },
                      { type: 'scatter', name: 'Profit', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [40, 90, 100, 70, 130, 180], mode: 'lines+markers', line: { color: '#60a5fa', width: 2.5, shape: 'spline' } },
                    ]}
                    layout={chartLayout('Revenue vs Expenses', { barmode: 'group' })}
                    style={{ width: '100%', height: 350 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
                <Card>
                  <Plot
                    data={[
                      { type: 'pie', values: [45, 25, 20, 10], labels: ['Electronics', 'Furniture', 'Office', 'Materials'], hole: 0.7, marker: { colors: ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24'] }, textinfo: 'label+percent', textfont: { color: '#e8eaf6' } },
                    ]}
                    layout={chartLayout('Inventory by Category', { showlegend: true, margin: { t: 50, b: 30, l: 20, r: 20 } })}
                    style={{ width: '100%', height: 350 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
              </div>

              <div className="biz-grid-1-1" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <Card title="Latest Transactions" sub="LIVE · LEDGER">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { desc: 'Invoice #1245 paid', amount: '$12,500', time: '2h ago' },
                      { desc: 'Purchase order approved', amount: '$8,200', time: '5h ago' },
                      { desc: 'Salary payments processed', amount: '$125,000', time: '1d ago' },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: 10, background: 'rgba(96,165,250,.04)', borderRadius: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.desc}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, fontFamily: "'Space Mono',monospace" }}>
                          <span style={{ color: 'var(--green)' }}>{item.amount}</span>
                          <span style={{ color: 'var(--muted)' }}>{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card title="Inventory Alerts" sub="LOW · STOCK">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { item: 'Standing Desk', status: 'critical', qty: '12 units' },
                      { item: 'Office Chair', status: 'low-stock', qty: '89 units' },
                      { item: 'Monitor 27"', status: 'reorder', qty: '156 units' },
                    ].map((alert, i) => {
                      const c = statusColor(alert.status)
                      const palette: any = { red: '#f87171', amber: '#fbbf24', blue: '#60a5fa', green: '#34d399' }
                      return (
                        <div key={i} style={{ padding: 10, background: 'rgba(96,165,250,.04)', borderRadius: 8, borderLeft: `3px solid ${palette[c] || '#fbbf24'}` }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{alert.item}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11 }}>
                            <span style={{ color: 'var(--muted)' }}>{alert.qty}</span>
                            <Badge color={c}>{alert.status}</Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
                <Card title="Project Updates" sub="ACTIVE · INITIATIVES">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { project: 'ERP Upgrade', progress: 65, status: 'on-track' },
                      { project: 'Website Redesign', progress: 15, status: 'planning' },
                      { project: 'Mobile App', progress: 40, status: 'in-progress' },
                    ].map((proj, i) => {
                      const c = statusColor(proj.status)
                      const palette: any = { green: '#34d399', violet: '#a78bfa', blue: '#60a5fa' }
                      return (
                        <div key={i} style={{ padding: 10, background: 'rgba(96,165,250,.04)', borderRadius: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>{proj.project}</div>
                          <Progress value={proj.progress} color={palette[c] || '#60a5fa'} />
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontFamily: "'Space Mono',monospace" }}>
                            {proj.progress}% complete
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* FINANCIALS */}
          {activeModule === 'financials' && (
            <>
              <div className="biz-kpi-grid">
                <StatCard label="Total Assets" value="$4.68M" change="+5.2%" trend="up" variant="green" foot="vs last quarter" />
                <StatCard label="Total Liabilities" value="$890K" change="-2.1%" trend="down" variant="red" foot="vs last quarter" />
                <StatCard label="Cash Flow" value="$510K" change="+12.4%" trend="up" variant="cyan" foot="vs last quarter" />
                <StatCard label="Profit Margin" value="18.5%" change="+3.2%" trend="up" variant="violet" foot="vs last quarter" />
              </div>

              <div className="biz-grid-2-1">
                <Card>
                  <Plot
                    data={[
                      { type: 'bar', name: 'Revenue', x: ['Q1', 'Q2', 'Q3', 'Q4'], y: [1420, 1680, 1890, 1780], marker: { color: '#34d399' } },
                      { type: 'bar', name: 'Expenses', x: ['Q1', 'Q2', 'Q3', 'Q4'], y: [1180, 1310, 1420, 1370], marker: { color: '#f87171' } },
                      { type: 'scatter', name: 'Net Profit', x: ['Q1', 'Q2', 'Q3', 'Q4'], y: [240, 370, 470, 410], mode: 'lines+markers', line: { color: '#60a5fa', width: 3, shape: 'spline' } },
                    ]}
                    layout={chartLayout('Quarterly Performance', { barmode: 'group' })}
                    style={{ width: '100%', height: 350 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
                <Card>
                  <Plot
                    data={[
                      { type: 'pie', values: [1450, 890, 2340, 845], labels: ['A/R', 'A/P', 'Cash', 'Inventory'], hole: 0.7, marker: { colors: ['#60a5fa', '#f87171', '#34d399', '#fbbf24'] }, textinfo: 'label+percent', textfont: { color: '#e8eaf6' } },
                    ]}
                    layout={chartLayout('Asset Distribution', { showlegend: true, margin: { t: 50, b: 30, l: 20, r: 20 } })}
                    style={{ width: '100%', height: 350 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
              </div>

              <div className="biz-table-wrap">
                <table className="biz-table">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Type</th>
                      <th>Balance</th>
                      <th>Change</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financials.map((account) => (
                      <tr key={account.id} onClick={() => setSelectedItem(account)}>
                        <td className="biz-cell-strong">{account.account}</td>
                        <td>
                          <Badge color={account.type === 'Asset' ? 'green' : account.type === 'Liability' ? 'red' : 'blue'}>{account.type}</Badge>
                        </td>
                        <td>
                          <span className="biz-cell-num">${(account.balance / 1000).toFixed(0)}K</span>
                        </td>
                        <td>
                          <span style={{ color: account.trend === 'up' ? 'var(--green)' : 'var(--red)', fontFamily: "'Space Mono',monospace", fontWeight: 600, fontSize: 12 }}>
                            {account.trend === 'up' ? '↑' : '↓'} {Math.abs(account.change)}%
                          </span>
                        </td>
                        <td style={{ color: 'var(--muted)' }}>{account.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* INVENTORY */}
          {activeModule === 'inventory' && (
            <>
              <div className="biz-kpi-grid">
                <StatCard label="Total SKUs" value="14,204" change="+124" trend="up" variant="blue" />
                <StatCard label="Inventory Value" value="$845K" change="+3.8%" trend="up" variant="green" />
                <StatCard label="Low Stock" value="24" change="-8" trend="down" variant="amber" />
                <StatCard label="Turnover Rate" value="4.2x" change="+0.3x" trend="up" variant="violet" />
              </div>

              <FilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search inventory by SKU or name..."
                filters={[
                  {
                    value: filterStatus,
                    onChange: setFilterStatus,
                    options: [
                      { value: 'all', label: 'All Status' },
                      { value: 'in-stock', label: 'In Stock' },
                      { value: 'low-stock', label: 'Low Stock' },
                      { value: 'critical', label: 'Critical' },
                    ],
                  },
                ]}
              />

              <div className="biz-table-wrap">
                <table className="biz-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Value</th>
                      <th>Status</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr key={item.id} onClick={() => setSelectedItem(item)}>
                        <td>
                          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: 'var(--elec)' }}>{item.sku}</span>
                        </td>
                        <td>
                          <div className="biz-cell-strong">{item.name}</div>
                          <div className="biz-cell-muted">{item.supplier}</div>
                        </td>
                        <td style={{ color: 'var(--muted)' }}>{item.category}</td>
                        <td className="biz-cell-num">{item.quantity}</td>
                        <td className="biz-cell-num">${(item.value / 1000).toFixed(0)}K</td>
                        <td>
                          <Badge color={statusColor(item.status)}>{item.status.replace('-', ' ')}</Badge>
                        </td>
                        <td style={{ color: 'var(--muted)' }}>{item.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* HR */}
          {activeModule === 'hr' && (
            <>
              <div className="biz-kpi-grid">
                <StatCard label="Total Employees" value="247" change="+12" trend="up" variant="blue" />
                <StatCard label="Avg Salary" value="$85K" change="+3.2%" trend="up" variant="green" />
                <StatCard label="Turnover Rate" value="8.5%" change="-1.2%" trend="down" variant="cyan" />
                <StatCard label="Open Positions" value="8" change="-3" trend="down" variant="amber" />
              </div>

              <div className="biz-table-wrap">
                <table className="biz-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Position</th>
                      <th>Salary</th>
                      <th style={{ minWidth: 140 }}>Performance</th>
                      <th>Hire Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedEmployees.map((employee) => {
                      const perf = employee.performance
                      const perfColor = perf >= 4 ? '#34d399' : perf >= 3 ? '#fbbf24' : '#f87171'
                      return (
                        <tr key={employee.id} onClick={() => setSelectedItem(employee)}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <Avatar initials={employee.avatar || employee.name?.slice(0, 2) || '?'} size="sm" />
                              <div>
                                <div className="biz-cell-strong">{employee.name}</div>
                                <div className="biz-cell-muted">Reports to {employee.manager}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--muted)' }}>{employee.department}</td>
                          <td>{employee.position}</td>
                          <td className="biz-cell-num">${(employee.salary / 1000).toFixed(0)}K</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Progress value={(perf / 5) * 100} color={perfColor} />
                              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'Space Mono',monospace", minWidth: 24 }}>
                                {perf}
                              </span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--muted)', fontFamily: "'Space Mono',monospace", fontSize: 12 }}>{employee.hireDate}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* PROJECTS */}
          {activeModule === 'projects' && (
            <>
              <div className="biz-kpi-grid">
                <StatCard label="Active Projects" value="12" change="+2" trend="up" variant="blue" />
                <StatCard label="Total Budget" value="$825K" change="+15%" trend="up" variant="green" />
                <StatCard label="On-Time Delivery" value="85%" change="+5%" trend="up" variant="violet" />
                <StatCard label="Team Utilization" value="78%" change="+3%" trend="up" variant="cyan" />
              </div>

              <div className="biz-grid-cards">
                {enrichedProjects.map((project) => {
                  const c = statusColor(project.status)
                  const palette: any = { green: '#34d399', violet: '#a78bfa', blue: '#60a5fa', amber: '#fbbf24', red: '#f87171' }
                  return (
                    <div className="biz-contact-card" key={project.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{project.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>Lead: {project.manager}</div>
                        </div>
                        <Badge color={c}>{project.status.replace('-', ' ')}</Badge>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6, fontFamily: "'Space Mono',monospace" }}>
                          <span>PROGRESS</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} color={palette[c] || '#60a5fa'} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 12 }}>
                        <div>
                          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                            Budget
                          </div>
                          <div style={{ color: 'var(--text)', fontWeight: 600 }}>${(project.budget / 1000).toFixed(0)}K</div>
                          <div style={{ color: 'var(--muted)', marginTop: 2 }}>Spent ${(project.spent / 1000).toFixed(0)}K</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                            Timeline
                          </div>
                          <div style={{ color: 'var(--text)', fontWeight: 500 }}>{project.startDate}</div>
                          <div style={{ color: 'var(--muted)', marginTop: 2 }}>→ {project.endDate}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon.users style={{ width: 12, height: 12 }} />
                        {project.teamSize} team members
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* SUPPLY CHAIN */}
          {activeModule === 'supply-chain' && (
            <>
              <div className="biz-kpi-grid">
                <StatCard label="Active Shipments" value="47" change="+8" trend="up" variant="blue" />
                <StatCard label="On-Time Delivery" value="92%" change="+3%" trend="up" variant="green" />
                <StatCard label="Supplier Score" value="4.6" change="+0.2" trend="up" variant="violet" />
                <StatCard label="Logistics Cost" value="$124K" change="-5%" trend="down" variant="cyan" />
              </div>

              <div className="biz-grid-2-1">
                <Card>
                  <Plot
                    data={[
                      { type: 'scatter', mode: 'lines+markers', name: 'Inbound', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], y: [120, 150, 180, 90, 200, 140], line: { color: '#34d399', shape: 'spline' }, fill: 'tozeroy', fillcolor: 'rgba(52, 211, 153, 0.1)' },
                      { type: 'scatter', mode: 'lines+markers', name: 'Outbound', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], y: [100, 130, 200, 120, 250, 110], line: { color: '#60a5fa', shape: 'spline' } },
                    ]}
                    layout={chartLayout('Weekly Shipments')}
                    style={{ width: '100%', height: 350 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
                <Card>
                  <Plot
                    data={[
                      {
                        type: 'scatterpolar',
                        r: [95, 80, 90, 75, 95],
                        theta: ['Delivery', 'Quality', 'Pricing', 'Comms', 'Flexibility'],
                        fill: 'toself',
                        fillcolor: 'rgba(96, 165, 250, 0.18)',
                        line: { color: '#60a5fa' },
                      },
                    ]}
                    layout={chartLayout('Supplier Performance', {
                      polar: {
                        bgcolor: 'rgba(0,0,0,0)',
                        radialaxis: { visible: true, range: [0, 100], gridcolor: 'rgba(96,165,250,0.08)', tickfont: { color: '#94a3b8' } },
                        angularaxis: { gridcolor: 'rgba(96,165,250,0.08)', tickfont: { color: '#cbd5e1' } },
                      },
                    })}
                    style={{ width: '100%', height: 350 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
              </div>

              <Card title="Active Shipments" sub="LIVE · TRACKING">
                <div className="biz-grid-cards">
                  {[
                    { id: 'SHP-001', destination: 'New York, USA', status: 'in-transit', eta: '2 days', progress: 65 },
                    { id: 'SHP-002', destination: 'London, UK', status: 'delayed', eta: '5 days', progress: 30 },
                    { id: 'SHP-003', destination: 'Tokyo, Japan', status: 'delivered', eta: 'Delivered', progress: 100 },
                    { id: 'SHP-004', destination: 'Sydney, Australia', status: 'in-transit', eta: '7 days', progress: 45 },
                  ].map((shipment) => {
                    const c = statusColor(shipment.status)
                    const palette: any = { blue: '#60a5fa', red: '#f87171', green: '#34d399', amber: '#fbbf24' }
                    return (
                      <div key={shipment.id} style={{ padding: 16, background: 'rgba(96,165,250,.04)', border: '1px solid rgba(96,165,250,.08)', borderRadius: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'Space Mono',monospace" }}>{shipment.id}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                              <Icon.truck style={{ width: 12, height: 12 }} />
                              {shipment.destination}
                            </div>
                          </div>
                          <Badge color={c}>{shipment.status.replace('-', ' ')}</Badge>
                        </div>
                        <Progress value={shipment.progress} color={palette[c] || '#60a5fa'} />
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, fontFamily: "'Space Mono',monospace", display: 'flex', justifyContent: 'space-between' }}>
                          <span>ETA</span>
                          <span style={{ color: 'var(--text)' }}>{shipment.eta}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </>
          )}

          {/* MANUFACTURING */}
          {activeModule === 'manufacturing' && (
            <>
              <div className="biz-kpi-grid">
                <StatCard label="Production Rate" value="1,250" change="+8%" trend="up" variant="blue" />
                <StatCard label="Quality Rate" value="98.5%" change="+0.5%" trend="up" variant="green" />
                <StatCard label="Downtime" value="2.4%" change="-1.2%" trend="down" variant="amber" />
                <StatCard label="Efficiency" value="87%" change="+3%" trend="up" variant="violet" />
              </div>

              <div className="biz-grid-2-1">
                <Card>
                  <Plot
                    data={[
                      { type: 'scatter', mode: 'lines+markers', name: 'Actual', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], y: [1200, 1350, 1180, 1420, 1380, 1250], line: { color: '#34d399', shape: 'spline', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(52,211,153,0.08)' },
                      { type: 'scatter', mode: 'lines', name: 'Target', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], y: [1300, 1300, 1300, 1300, 1300, 1300], line: { color: '#f87171', dash: 'dash' } },
                    ]}
                    layout={chartLayout('Daily Production Output')}
                    style={{ width: '100%', height: 350 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
                <Card>
                  <Plot
                    data={[
                      { type: 'pie', values: [45, 25, 20, 10], labels: ['Line A', 'Line B', 'Line C', 'Line D'], hole: 0.7, marker: { colors: ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24'] }, textinfo: 'label+percent', textfont: { color: '#e8eaf6' } },
                    ]}
                    layout={chartLayout('Production by Line', { showlegend: true })}
                    style={{ width: '100%', height: 350 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
              </div>

              <Card title="Production Lines" sub="LIVE · STATUS">
                <div className="biz-grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                  {[
                    { name: 'Line A — Electronics', status: 'running', output: 450, target: 500, efficiency: 90 },
                    { name: 'Line B — Assembly', status: 'running', output: 380, target: 400, efficiency: 95 },
                    { name: 'Line C — Packaging', status: 'maintenance', output: 0, target: 300, efficiency: 0 },
                    { name: 'Line D — QC', status: 'running', output: 420, target: 450, efficiency: 93 },
                  ].map((line, i) => {
                    const c = statusColor(line.status)
                    const palette: any = { green: '#34d399', amber: '#fbbf24' }
                    return (
                      <div key={i} style={{ padding: 16, background: 'rgba(96,165,250,.04)', border: '1px solid rgba(96,165,250,.08)', borderRadius: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{line.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, fontFamily: "'Space Mono',monospace" }}>EFFICIENCY {line.efficiency}%</div>
                          </div>
                          <Badge color={c}>{line.status}</Badge>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono',monospace" }}>
                          <span>OUTPUT</span>
                          <span style={{ color: 'var(--text)' }}>{line.output} / {line.target}</span>
                        </div>
                        <Progress value={line.target > 0 ? (line.output / line.target) * 100 : 0} color={palette[c] || '#60a5fa'} />
                      </div>
                    )
                  })}
                </div>
              </Card>
            </>
          )}

          {/* REPORTS */}
          {activeModule === 'reports' && (
            <>
              <div className="biz-grid-1-1">
                <Card>
                  <Plot
                    data={[{ type: 'bar', x: ['Q1', 'Q2', 'Q3', 'Q4'], y: [1420, 1680, 1890, 1780], marker: { color: '#60a5fa' } }]}
                    layout={chartLayout('Quarterly Revenue Trend')}
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
                        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        y: [92, 88, 95, 91, 94, 96],
                        line: { color: '#34d399', shape: 'spline', width: 2.5 },
                        marker: { color: '#34d399', size: 8 },
                        fill: 'tozeroy',
                        fillcolor: 'rgba(52,211,153,0.08)',
                      },
                    ]}
                    layout={chartLayout('Quality Metrics')}
                    style={{ width: '100%', height: 320 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
              </div>
              <div className="biz-grid-2-1">
                <Card>
                  <Plot
                    data={[
                      { type: 'bar', name: 'Revenue', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [420, 480, 510, 490, 580, 620], marker: { color: '#34d399' } },
                      { type: 'bar', name: 'Expenses', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [380, 390, 410, 420, 450, 440], marker: { color: '#f87171' } },
                    ]}
                    layout={chartLayout('Monthly Financial Overview', { barmode: 'group' })}
                    style={{ width: '100%', height: 380 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
                <Card>
                  <Plot
                    data={[
                      { type: 'pie', values: [245, 89, 567, 12, 156], labels: ['Laptops', 'Chairs', 'Mice', 'Desks', 'Monitors'], hole: 0.7, marker: { colors: CHART_PALETTE }, textinfo: 'label+percent', textfont: { color: '#e8eaf6' } },
                    ]}
                    layout={chartLayout('Inventory Distribution', { showlegend: true })}
                    style={{ width: '100%', height: 380 }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </Card>
              </div>
            </>
          )}
        </div>
      </main>

      {/* DETAIL DRAWER */}
      {selectedItem && (
        <aside className="biz-drawer">
          <DrawerHeader title="Record Details" onClose={() => setSelectedItem(null)} />
          <div className="biz-drawer-body">
            {selectedItem.sku && (
              <div className="biz-drawer-section">
                <h4>Product</h4>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{selectedItem.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, fontFamily: "'Space Mono',monospace" }}>
                  {selectedItem.category} · {selectedItem.sku}
                </div>
                <div className="biz-kv" style={{ marginTop: 12 }}>
                  <div><b>Quantity</b>{selectedItem.quantity}</div>
                  <div><b>Value</b>${(selectedItem.value / 1000).toFixed(0)}K</div>
                  <div><b>Status</b><Badge color={statusColor(selectedItem.status)}>{selectedItem.status?.replace('-', ' ')}</Badge></div>
                  <div><b>Location</b>{selectedItem.location}</div>
                  <div><b>Supplier</b>{selectedItem.supplier}</div>
                </div>
              </div>
            )}

            {selectedItem.account && (
              <div className="biz-drawer-section">
                <h4>Account</h4>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{selectedItem.account}</div>
                <div className="biz-kv" style={{ marginTop: 10 }}>
                  <div><b>Type</b><Badge color={selectedItem.type === 'Asset' ? 'green' : selectedItem.type === 'Liability' ? 'red' : 'blue'}>{selectedItem.type}</Badge></div>
                  <div><b>Balance</b>${(selectedItem.balance / 1000).toFixed(0)}K</div>
                  <div><b>Department</b>{selectedItem.department}</div>
                </div>
              </div>
            )}

            {selectedItem.position && (
              <div className="biz-drawer-section">
                <h4>Employee</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Avatar initials={selectedItem.avatar || selectedItem.name?.slice(0, 2) || '?'} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{selectedItem.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{selectedItem.position}</div>
                  </div>
                </div>
                <div className="biz-kv">
                  <div><b>Department</b>{selectedItem.department}</div>
                  <div><b>Salary</b>${(selectedItem.salary / 1000).toFixed(0)}K</div>
                  <div><b>Performance</b>{selectedItem.performance}/5</div>
                  <div><b>Hire Date</b>{selectedItem.hireDate}</div>
                </div>
              </div>
            )}

            <div className="biz-drawer-section">
              <h4>Actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="biz-btn biz-btn-primary" style={{ justifyContent: 'center' }}>Edit Record</button>
                <button className="biz-btn biz-btn-ghost" style={{ justifyContent: 'center' }}>View History</button>
                <button className="biz-btn biz-btn-ghost" style={{ justifyContent: 'center' }}>Export Report</button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* SEARCH MODAL */}
      <Modal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="Search ERP"
        subtitle="Find records across all modules"
        primaryLabel="Search"
      >
        <div className="biz-input-icon">
          <Icon.search />
          <input className="biz-input" type="text" placeholder="Type to search..." autoFocus style={{ paddingLeft: 38 }} />
        </div>
      </Modal>

      {/* NEW RECORD MODAL */}
      <Modal
        open={showNewRecordModal}
        onClose={() => setShowNewRecordModal(false)}
        title={`New ${newRecordType.charAt(0).toUpperCase() + newRecordType.slice(1)} Record`}
        subtitle="Create a new record in the system"
        primaryLabel="Create Record"
      >
        <input className="biz-input" type="text" placeholder="Name / Title" />
        <input className="biz-input" type="text" placeholder="Description" />
        <input className="biz-input" type="number" placeholder="Value / Amount" />
      </Modal>
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
