import { useState, useEffect, useRef } from 'react'
import Plot from 'react-plotly.js'
import { SiteFooter, MinimalNav } from './Components'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { useCollection, db } from './src/Services/useDatabase'
import type { Dataset, Transaction } from './src/Services/DatabaseTypes'

/* ========================================
   POWERBI-STYLE BUSINESS INTELLIGENCE
   Advanced analytics and data visualization
======================================== */
export function AnalyticsSection() {
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedDataset, setSelectedDataset] = useState<any>(null)
  const [showRefreshModal, setShowRefreshModal] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showAddDatasetModal, setShowAddDatasetModal] = useState(false)
  const [showNewMeasureModal, setShowNewMeasureModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiToolType, setAiToolType] = useState('')
  const [newModalType, setNewModalType] = useState('')
  // Data from shared database
  const dbDatasets = useCollection<Dataset>('datasets')
  const transactions = useCollection<Transaction>('transactions')
  const stats = db.getAggregatedStats()

  const [datasets, setDatasets] = useState<any[]>([])

  // Sync database datasets to local state
  useEffect(() => {
    setDatasets(dbDatasets.map(ds => ({
      id: ds.id,
      name: ds.name,
      rows: ds.rows,
      columns: ds.columns,
      size: ds.size,
      lastModified: ds.lastModified,
      type: ds.type,
      tables: ds.tables,
      source: ds.source,
    })))
  }, [dbDatasets])
  const [dashboardItems, setDashboardItems] = useState<any[]>([
    {
      id: 1,
      type: 'kpi',
      title: 'Total Revenue',
      value: '$4.2M',
      change: '+12.5%',
      position: { x: 0, y: 0, w: 3, h: 2 },
      dataSource: 'Sales Data 2024',
      measure: 'SUM(Sales[Amount])'
    },
    {
      id: 2,
      type: 'chart',
      chartType: 'bar',
      title: 'Sales by Region',
      position: { x: 3, y: 0, w: 6, h: 4 },
      dataSource: 'Sales Data 2024'
    },
    {
      id: 3,
      type: 'table',
      title: 'Top Products',
      position: { x: 9, y: 0, w: 3, h: 4 },
      dataSource: 'Sales Data 2024'
    }
  ])
  const [measures, setMeasures] = useState<any[]>([
    { name: 'Total Revenue', expression: 'SUM(Sales[Amount])', format: '$0.0M' },
    { name: 'YoY Growth', expression: 'DIVIDE([Total Revenue] - [Total Revenue LY], [Total Revenue LY])', format: '0.0%' },
    { name: 'Profit Margin', expression: 'DIVIDE([Total Revenue] - [Total Cost], [Total Revenue])', format: '0.0%' },
    { name: 'Customer Count', expression: 'DISTINCTCOUNT(Customers[CustomerID])', format: '0' }
  ])
  const [relationships, setRelationships] = useState<any[]>([
    { from: 'Sales[CustomerID]', to: 'Customers[CustomerID]', type: 'many-to-one' },
    { from: 'Sales[ProductID]', to: 'Products[ProductID]', type: 'many-to-one' },
    { from: 'Sales[RegionID]', to: 'Regions[RegionID]', type: 'many-to-one' }
  ])
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [selectedVisual, setSelectedVisual] = useState<any>(null)
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const biLayout = (t: string, extra={}) => ({
    title: { 
      text: t, 
      font: { color: 'var(--text)', size: 14, family: "'Inter', sans-serif", weight: 600 },
      x: 0,
      y: 0.95
    },
    paper_bgcolor: 'var(--s1)',
    plot_bgcolor: 'var(--s1)',
    font: { family: "'Inter', sans-serif", color: '#4a5568', size: 11 },
    margin: { t: 50, r: 30, l: 50, b: 40 },
    xaxis: { 
      gridcolor: 'rgba(96,165,250,0.1)', 
      zerolinecolor: 'rgba(96,165,250,0.2)',
      tickfont: { color: '#666' }
    },
    yaxis: { 
      gridcolor: 'rgba(96,165,250,0.1)', 
      zerolinecolor: 'rgba(96,165,250,0.2)',
      tickfont: { color: '#666' }
    },
    hovermode: 'closest' as any,
    ...extra
  });

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      {/* BI Tool Sidebar */}
      <div style={{ width: '280px', background: 'var(--s1)', color: 'var(--text)', padding: '20px 0', borderRight: '1px solid rgba(96,165,250,0.06)', overflow: 'auto' }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>Radon BI</h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '4px 0 0 0' }}>Business Intelligence</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'datasets', label: 'Datasets', icon: '📁' },
            { id: 'modeling', label: 'Data Modeling', icon: '🔗' },
            { id: 'reports', label: 'Reports', icon: '📄' },
            { id: 'measures', label: 'Measures', icon: '📏' },
            { id: 'ai-tools', label: 'AI Tools', icon: '🤖' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                background: activeView === item.id ? 'var(--elec)' : 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeView !== item.id) {
                  e.currentTarget.style.background = 'var(--s2)'
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
        <div style={{ background: 'var(--s1)', borderBottom: '1px solid rgba(96,165,250,0.06)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'datasets' && 'Datasets'}
              {activeView === 'modeling' && 'Data Modeling'}
              {activeView === 'reports' && 'Reports'}
              {activeView === 'measures' && 'Measures'}
              {activeView === 'ai-tools' && 'AI Tools'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '4px 0 0 0' }}>Business intelligence and analytics</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={() => {
                setShowRefreshModal(true)
                setTimeout(() => setShowRefreshModal(false), 2000)
              }}
              style={{
                padding: '8px 16px',
                background: 'var(--s2)',
                border: '1px solid rgba(96,165,250,0.15)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
            <button 
              onClick={() => {
                setNewModalType(activeView === 'datasets' ? 'dataset' : 
                              activeView === 'measures' ? 'measure' : 
                              activeView === 'reports' ? 'report' : 'dashboard')
                setShowNewModal(true)
              }}
              style={{
                padding: '8px 16px',
                background: 'var(--elec)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--bg)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              + New
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* KPI Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { title: 'Total Revenue', value: '$4.2M', change: '+12.5%', trend: 'up' },
                  { title: 'Profit Margin', value: '23.8%', change: '+2.1%', trend: 'up' },
                  { title: 'Customer Count', value: '15,420', change: '+8.3%', trend: 'up' },
                  { title: 'Avg Order Value', value: '$272', change: '-1.2%', trend: 'down' },
                ].map((kpi, i) => (
                  <div key={i} style={{
                    background: 'var(--s1)',
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(96,165,250,0.06)',
                    boxShadow: 'var(--shadow-elevated)'
                  }}>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>{kpi.title}</div>
                    <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>{kpi.value}</div>
                    <div style={{
                      fontSize: '12px',
                      color: kpi.trend === 'up' ? '#38a169' : '#e53e3e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {kpi.trend === 'up' ? '↑' : '↓'} {kpi.change} from last period
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Dashboard Grid */}
              <div style={{
                background: 'var(--s1)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(96,165,250,0.06)',
                padding: '24px',
                minHeight: '600px',
                boxShadow: 'var(--shadow-elevated)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>Interactive Dashboard</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setShowEditModal(true)}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--s2)',
                        border: '1px solid rgba(96,165,250,0.15)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setShowFullscreen(true)}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--s2)',
                        border: '1px solid rgba(96,165,250,0.15)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Full Screen
                    </button>
                  </div>
                </div>
                
                {/* Dashboard Grid Layout */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gridAutoRows: '80px',
                  gap: '16px',
                  minHeight: '500px'
                }}>
                  {dashboardItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        gridColumn: `${item.position.x + 1} / span ${item.position.w}`,
                        gridRow: `${item.position.y + 1} / span ${item.position.h}`,
                        background: 'var(--s2)',
                        border: '1px solid rgba(96,165,250,0.06)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '16px',
                        cursor: 'move'
                      }}
                      draggable
                      onDragStart={() => setDraggedItem(item)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => e.preventDefault()}
                      onClick={() => setSelectedVisual(item)}
                    >
                      {item.type === 'kpi' && (
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>{item.title}</div>
                          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text)' }}>{item.value}</div>
                          <div style={{ fontSize: '12px', color: '#10b981' }}>{item.change}</div>
                        </div>
                      )}
                      {item.type === 'chart' && (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plot
                            data={[
                              { type: 'bar', x: ['North', 'South', 'East', 'West'], y: [120, 190, 300, 250], marker: { color: '#4299e1' } }
                            ]}
                            layout={biLayout(item.title, { margin: { t: 30, b: 30, l: 30, r: 30 }})}
                            style={{ width: '100%', height: '200px' }}
                            config={{ displayModeBar: false }}
                          />
                        </div>
                      )}
                      {item.type === 'table' && (
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>{item.title}</div>
                          <div style={{ fontSize: '11px', color: '#4a5568' }}>
                            <div>Product A: $45,200</div>
                            <div>Product B: $38,100</div>
                            <div>Product C: $29,800</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Datasets View */}
          {activeView === 'datasets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                background: 'var(--s1)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(96,165,250,0.06)',
                padding: '24px',
                boxShadow: 'var(--shadow-elevated)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>Data Sources</h3>
                  <button 
                    onClick={() => setShowAddDatasetModal(true)}
                    style={{
                      padding: '8px 16px',
                      background: '#4299e1',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Dataset
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  {datasets.map(dataset => (
                    <div
                      key={dataset.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        background: 'var(--s2)',
                        border: '1px solid rgba(96,165,250,0.06)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedDataset(dataset)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: dataset.type === 'Excel' ? '#10b981' : dataset.type === 'CSV' ? '#3b82f6' : '#8b5cf6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}>
                          {dataset.type.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>{dataset.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            {dataset.rows.toLocaleString()} rows • {dataset.columns} columns • {dataset.size}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Modified: {dataset.lastModified}</div>
                        <button style={{
                          padding: '6px 12px',
                          background: 'var(--s2)',
                          border: '1px solid rgba(96,165,250,0.15)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}>
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Data Modeling View */}
          {activeView === 'modeling' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                background: 'var(--s1)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(96,165,250,0.06)',
                padding: '24px',
                boxShadow: 'var(--shadow-elevated)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0, marginBottom: '20px' }}>Data Model Relationships</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', marginBottom: '12px' }}>Tables</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['Sales', 'Products', 'Customers', 'Regions', 'Calendar'].map(table => (
                        <div key={table} style={{
                          padding: '12px',
                          background: 'var(--s2)',
                          border: '1px solid rgba(96,165,250,0.06)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '14px',
                          color: 'var(--text)'
                        }}>
                          📋 {table}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', marginBottom: '12px' }}>Relationships</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {relationships.map((rel, i) => (
                        <div key={i} style={{
                          padding: '12px',
                          background: 'var(--s2)',
                          border: '1px solid rgba(96,165,250,0.06)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          color: '#4a5568'
                        }}>
                          <div>{rel.from}</div>
                          <div style={{ color: '#4299e1' }}>↔ {rel.type}</div>
                          <div>{rel.to}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Measures View */}
          {activeView === 'measures' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                background: 'var(--s1)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(96,165,250,0.06)',
                padding: '24px',
                boxShadow: 'var(--shadow-elevated)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>DAX Measures</h3>
                  <button 
                    onClick={() => setShowNewMeasureModal(true)}
                    style={{
                      padding: '8px 16px',
                      background: '#4299e1',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    + New Measure
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  {measures.map((measure, i) => (
                    <div key={i} style={{
                      padding: '16px',
                      background: 'var(--s2)',
                      border: '1px solid rgba(96,165,250,0.06)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>{measure.name}</div>
                          <div style={{
                            padding: '8px 12px',
                            background: 'var(--dim)',
                            color: '#68d391',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            marginBottom: '8px'
                          }}>
                            {measure.expression}
                          </div>
                        </div>
                        <div style={{
                          padding: '4px 8px',
                          background: '#edf2f7',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#4a5568'
                        }}>
                          {measure.format}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Tools View */}
          {activeView === 'ai-tools' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                background: 'var(--s1)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(96,165,250,0.06)',
                padding: '24px',
                boxShadow: 'var(--shadow-elevated)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0, marginBottom: '20px' }}>AI-Powered Analytics</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div style={{
                    padding: '20px',
                    background: 'var(--s2)',
                    border: '1px solid rgba(96,165,250,0.06)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>📈 AI Chart Generator</h4>
                    <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>Generate charts from natural language descriptions</p>
                    <button 
                      onClick={() => {
                        setAiToolType('chart')
                        setShowAIModal(true)
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--elec)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--bg)',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Launch AI Chart Gen
                    </button>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    background: 'var(--s2)',
                    border: '1px solid rgba(96,165,250,0.06)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>💡 Smart Insights</h4>
                    <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>AI-powered business insights and recommendations</p>
                    <button 
                      onClick={() => {
                        setAiToolType('insights')
                        setShowAIModal(true)
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--elec)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--bg)',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Generate Insights
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedVisual && (
        <div style={{
          width: '300px',
          background: 'var(--s1)',
          borderLeft: '1px solid rgba(96,165,250,0.06)',
          padding: '24px',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>Properties</h3>
            <button
              onClick={() => setSelectedVisual(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: 'var(--muted)'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Title</label>
              <input
                type="text"
                value={selectedVisual.title}
                onChange={(e) => {
                  const updated = { ...selectedVisual, title: e.target.value }
                  setSelectedVisual(updated)
                  setDashboardItems(prev => prev.map(item => item.id === selectedVisual.id ? updated : item))
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'var(--s2)',
                  border: '1px solid rgba(96,165,250,0.15)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  color: 'var(--text)'
                }}
              />
            </div>
            
            <div>
              <label style={{ fontSize: '12px', color: '#718096', marginBottom: '8px', display: 'block' }}>Data Source</label>
              <select
                value={selectedVisual.dataSource}
                onChange={(e) => {
                  const updated = { ...selectedVisual, dataSource: e.target.value }
                  setSelectedVisual(updated)
                  setDashboardItems(prev => prev.map(item => item.id === selectedVisual.id ? updated : item))
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'var(--s2)',
                  border: '1px solid rgba(96,165,250,0.15)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  color: 'var(--text)'
                }}
              >
                {datasets.map(ds => (
                  <option key={ds.id} value={ds.name}>{ds.name}</option>
                ))}
              </select>
            </div>
            
            {selectedVisual.type === 'chart' && (
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Chart Type</label>
                <select
                  value={selectedVisual.chartType}
                  onChange={(e) => {
                    const updated = { ...selectedVisual, chartType: e.target.value }
                    setSelectedVisual(updated)
                    setDashboardItems(prev => prev.map(item => item.id === selectedVisual.id ? updated : item))
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'var(--s2)',
                    border: '1px solid rgba(96,165,250,0.15)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    color: 'var(--text)'
                  }}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="area">Area Chart</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refresh Modal */}
      {showRefreshModal && (
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
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            width: '300px',
            maxWidth: '90%',
            border: '1px solid rgba(96,165,250,0.06)',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#4299e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '20px',
                animation: 'spin 1s linear infinite'
              }}>
                <span>×</span>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>Refreshing Data</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '4px 0 0 0' }}>Updating dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Modal */}
      {showNewModal && (
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
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            width: '500px',
            maxWidth: '90%',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
              Create New {newModalType.charAt(0).toUpperCase() + newModalType.slice(1)}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="Name"
                style={{
                  padding: '12px',
                  background: 'var(--s2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  color: 'var(--text)'
                }}
              />
              <textarea
                placeholder="Description"
                rows={3}
                style={{
                  padding: '12px',
                  background: 'var(--s2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  color: 'var(--text)',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowNewModal(false)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--s2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewModal(false)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--elec)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--bg)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
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
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            width: '600px',
            maxWidth: '90%',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
              Edit Dashboard
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Layout</label>
                  <select style={{
                    width: '100%',
                    padding: '8px',
                    background: 'var(--s2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    color: 'var(--text)'
                  }}>
                    <option>Grid Layout</option>
                    <option>Free Form</option>
                    <option>Tabbed</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Theme</label>
                  <select style={{
                    width: '100%',
                    padding: '8px',
                    background: 'var(--s2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    color: 'var(--text)'
                  }}>
                    <option>Default</option>
                    <option>Dark</option>
                    <option>Light</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Description</label>
                <textarea
                  placeholder="Dashboard description..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--s2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    color: 'var(--text)',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--s2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--elec)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--bg)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#ffffff',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: '#1a202c',
            color: '#ffffff',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Dashboard - Full Screen</h3>
            <button
              onClick={() => setShowFullscreen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
            <div style={{ fontSize: '24px', color: 'var(--muted)', textAlign: 'center', marginTop: '100px' }}>
              Full screen dashboard view would display here with all visualizations maximized
            </div>
          </div>
        </div>
      )}

      {/* Add Dataset Modal */}
      {showAddDatasetModal && (
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
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            width: '600px',
            maxWidth: '90%',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
              Add New Dataset
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Dataset Name</label>
                  <input
                    type="text"
                    placeholder="Enter dataset name"
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'var(--s2)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '14px',
                      color: 'var(--text)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Data Source</label>
                  <select style={{
                    width: '100%',
                    padding: '8px',
                    background: 'var(--s2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    color: 'var(--text)'
                  }}>
                    <option>Upload File</option>
                    <option>Database Connection</option>
                    <option>API Endpoint</option>
                    <option>Excel File</option>
                    <option>CSV File</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Connection String / File Path</label>
                <input
                  type="text"
                  placeholder="Enter connection details or file path"
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'var(--s2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    color: 'var(--text)'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowAddDatasetModal(false)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--s2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddDatasetModal(false)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--elec)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--bg)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Add Dataset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Measure Modal */}
      {showNewMeasureModal && (
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
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            width: '600px',
            maxWidth: '90%',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
              Create New DAX Measure
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Measure Name</label>
                <input
                  type="text"
                  placeholder="Enter measure name"
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'var(--s2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    color: 'var(--text)'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>DAX Expression</label>
                <textarea
                  placeholder="Enter DAX formula..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--s2)',
                    border: '1px solid rgba(96,165,250,0.15)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: 'var(--text)',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Format String</label>
                  <select style={{
                    width: '100%',
                    padding: '8px',
                    background: 'var(--s2)',
                    border: '1px solid rgba(96,165,250,0.15)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    color: 'var(--text)'
                  }}>
                    <option>0</option>
                    <option>0.0</option>
                    <option>0.00</option>
                    <option>0.0%</option>
                    <option>$0.0M</option>
                    <option>$0.0K</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Category</label>
                  <select style={{
                    width: '100%',
                    padding: '8px',
                    background: 'var(--s2)',
                    border: '1px solid rgba(96,165,250,0.15)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    color: 'var(--text)'
                  }}>
                    <option>Calculation</option>
                    <option>Time Intelligence</option>
                    <option>Filter</option>
                    <option>Text</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowNewMeasureModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  color: '#4a5568',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewMeasureModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#4299e1',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Create Measure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Tools Modal */}
      {showAIModal && (
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
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            width: '600px',
            maxWidth: '90%',
            border: '1px solid rgba(96,165,250,0.06)',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
              {aiToolType === 'chart' ? 'AI Chart Generator' : 'Smart Insights Generator'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>
                  {aiToolType === 'chart' ? 'Describe the chart you want to create' : 'Describe the insights you need'}
                </label>
                <textarea
                  placeholder={aiToolType === 'chart' ? 
                    "e.g., 'Create a bar chart showing sales by region for the last quarter'" : 
                    "e.g., 'Analyze customer trends and identify growth opportunities'"}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--s2)',
                    border: '1px solid rgba(96,165,250,0.15)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    color: 'var(--text)',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Data Source</label>
                <select style={{
                  width: '100%',
                  padding: '8px',
                  background: 'var(--s2)',
                  border: '1px solid rgba(96,165,250,0.15)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  color: 'var(--text)'
                }}>
                  {datasets.map(ds => (
                    <option key={ds.id} value={ds.name}>{ds.name}</option>
                  ))}
                </select>
              </div>
              {aiToolType === 'chart' && (
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Chart Type (Optional)</label>
                  <select style={{
                    width: '100%',
                    padding: '8px',
                    background: 'var(--s2)',
                    border: '1px solid rgba(96,165,250,0.15)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    color: 'var(--text)'
                  }}>
                    <option>Auto-detect</option>
                    <option>Bar Chart</option>
                    <option>Line Chart</option>
                    <option>Pie Chart</option>
                    <option>Scatter Plot</option>
                    <option>Area Chart</option>
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowAIModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  color: '#4a5568',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAIModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#4299e1',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {aiToolType === 'chart' ? 'Generate Chart' : 'Generate Insights'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AnalyticsPage({ onNavigate, onLogout }: any) {
  useEffect(() => { 
    document.querySelectorAll('.reveal').forEach((el: any) => el.classList.add('in')) 
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <MinimalNav onNavigate={onNavigate} onLogout={onLogout} active="analytics" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AnalyticsSection />
      </div>
      <SiteFooter />
    </div>
  )
}
