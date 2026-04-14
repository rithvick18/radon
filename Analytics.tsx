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
      font: { color: '#1a1f36', size: 14, family: "'Segoe UI', sans-serif", weight: 600 },
      x: 0,
      y: 0.95
    },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    font: { family: "'Segoe UI', sans-serif", color: '#4a5568', size: 11 },
    margin: { t: 50, r: 30, l: 50, b: 40 },
    xaxis: { 
      gridcolor: '#f0f0f0', 
      zerolinecolor: '#e0e0e0',
      tickfont: { color: '#666' }
    },
    yaxis: { 
      gridcolor: '#f0f0f0', 
      zerolinecolor: '#e0e0e0',
      tickfont: { color: '#666' }
    },
    hovermode: 'closest' as any,
    ...extra
  });

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
      {/* BI Tool Sidebar */}
      <div style={{ width: '280px', background: '#2d3748', color: '#ffffff', padding: '20px 0', overflow: 'auto' }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#ffffff' }}>Radon BI</h2>
          <p style={{ fontSize: '12px', color: '#a0aec0', margin: '4px 0 0 0' }}>Business Intelligence</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '??' },
            { id: 'datasets', label: 'Datasets', icon: '??' },
            { id: 'modeling', label: 'Data Modeling', icon: '??' },
            { id: 'reports', label: 'Reports', icon: '??' },
            { id: 'measures', label: 'Measures', icon: '??' },
            { id: 'ai-tools', label: 'AI Tools', icon: '??' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                background: activeView === item.id ? '#4299e1' : 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeView !== item.id) {
                  e.currentTarget.style.background = '#4a5568'
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
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a202c', margin: 0 }}>
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'datasets' && 'Datasets'}
              {activeView === 'modeling' && 'Data Modeling'}
              {activeView === 'reports' && 'Reports'}
              {activeView === 'measures' && 'Measures'}
              {activeView === 'ai-tools' && 'AI Tools'}
            </h1>
            <p style={{ fontSize: '14px', color: '#718096', margin: '4px 0 0 0' }}>Business intelligence and analytics</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{
              padding: '8px 16px',
              background: '#ffffff',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              color: '#4a5568',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              ?? Refresh
            </button>
            <button style={{
              padding: '8px 16px',
              background: '#4299e1',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
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
                    background: '#ffffff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>{kpi.title}</div>
                    <div style={{ fontSize: '28px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>{kpi.value}</div>
                    <div style={{
                      fontSize: '12px',
                      color: kpi.trend === 'up' ? '#38a169' : '#e53e3e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {kpi.trend === 'up' ? '??' : '??'} {kpi.change} from last period
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Dashboard Grid */}
              <div style={{
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                minHeight: '600px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0 }}>Interactive Dashboard</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      padding: '6px 12px',
                      background: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}>
                      Edit
                    </button>
                    <button style={{
                      padding: '6px 12px',
                      background: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}>
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
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
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
                          <div style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>{item.title}</div>
                          <div style={{ fontSize: '24px', fontWeight: '600', color: '#1a202c' }}>{item.value}</div>
                          <div style={{ fontSize: '12px', color: '#38a169' }}>{item.change}</div>
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
                          <div style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>{item.title}</div>
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
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0 }}>Data Sources</h3>
                  <button style={{
                    padding: '8px 16px',
                    background: '#4299e1',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
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
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
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
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>{dataset.name}</div>
                          <div style={{ fontSize: '12px', color: '#718096' }}>
                            {dataset.rows.toLocaleString()} rows ?? {dataset.columns} columns ?? {dataset.size}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#718096' }}>Modified: {dataset.lastModified}</div>
                        <button style={{
                          padding: '6px 12px',
                          background: '#f7fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
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
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0, marginBottom: '20px' }}>Data Model Relationships</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' }}>Tables</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['Sales', 'Products', 'Customers', 'Regions', 'Calendar'].map(table => (
                        <div key={table} style={{
                          padding: '12px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#1a202c'
                        }}>
                          ?? {table}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' }}>Relationships</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {relationships.map((rel, i) => (
                        <div key={i} style={{
                          padding: '12px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#4a5568'
                        }}>
                          <div>{rel.from}</div>
                          <div style={{ color: '#4299e1' }}>?? {rel.type}</div>
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
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0 }}>DAX Measures</h3>
                  <button style={{
                    padding: '8px 16px',
                    background: '#4299e1',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    + New Measure
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  {measures.map((measure, i) => (
                    <div key={i} style={{
                      padding: '16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>{measure.name}</div>
                          <div style={{
                            padding: '8px 12px',
                            background: '#1a202c',
                            color: '#68d391',
                            borderRadius: '4px',
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
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0, marginBottom: '20px' }}>AI-Powered Analytics</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div style={{
                    padding: '20px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>?? AI Chart Generator</h4>
                    <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '16px' }}>Generate charts from natural language descriptions</p>
                    <button style={{
                      padding: '8px 16px',
                      background: '#4299e1',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      Launch AI Chart Gen
                    </button>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>?? Smart Insights</h4>
                    <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '16px' }}>AI-powered business insights and recommendations</p>
                    <button style={{
                      padding: '8px 16px',
                      background: '#4299e1',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
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
          background: '#ffffff',
          borderLeft: '1px solid #e2e8f0',
          padding: '24px',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', margin: 0 }}>Properties</h3>
            <button
              onClick={() => setSelectedVisual(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#718096'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#718096', marginBottom: '8px', display: 'block' }}>Title</label>
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
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '14px'
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
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {datasets.map(ds => (
                  <option key={ds.id} value={ds.name}>{ds.name}</option>
                ))}
              </select>
            </div>
            
            {selectedVisual.type === 'chart' && (
              <div>
                <label style={{ fontSize: '12px', color: '#718096', marginBottom: '8px', display: 'block' }}>Chart Type</label>
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
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '14px'
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
