import { useState, useEffect, useRef } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// NEOGUARD FRAUD DETECTION MODULE
// Real-time fraud detection with Temporal Transformer + GNN
// ═══════════════════════════════════════════════════════════════════════════════

// --- Types ---
interface Transaction {
  transaction_id: string
  user_id: string
  amount: number
  category: string
  merchant_id: string
  country: string
  timestamp: string
  risk_score: number
  transformer_score: number
  gnn_score: number
  is_flagged: boolean
  flag_reason?: string
}

interface GraphNode {
  id: string
  type: string
  label: string
  risk_score: number
}

interface GraphEdge {
  source: string
  target: string
  edge_type: string
  weight: number
}

interface FraudGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

interface Alert {
  id: string
  timestamp: string
  message: string
  severity: 'high' | 'med' | 'low'
  transaction_id?: string
}

interface XAIExplanation {
  shap_values: Record<string, number>
  top_risk_factors: Array<{ factor: string; importance: number; description: string }>
  narrative: string
  risk_score: number
  heatmap_data: {
    calendar_heatmap: any[]
    category_risk: any[]
    hourly_pattern: any[]
    merchant_risk: any[]
  }
}

// --- API Service ---
const API_BASE = 'http://localhost:8000'

const api = {
  health: async () => {
    const res = await fetch(`${API_BASE}/api/health`)
    return res.json()
  },
  getDemoData: async (): Promise<Transaction[]> => {
    const res = await fetch(`${API_BASE}/api/demo`)
    const data = await res.json()
    return data.transactions
  },
  getGraph: async (): Promise<FraudGraph> => {
    const res = await fetch(`${API_BASE}/api/graph`)
    return res.json()
  },
  scoreTransactions: async (transactions: any[]): Promise<Transaction[]> => {
    const res = await fetch(`${API_BASE}/api/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions })
    })
    const data = await res.json()
    return data.results
  },
  explainTransaction: async (transactionId: string, transactionData: any): Promise<XAIExplanation> => {
    const res = await fetch(`${API_BASE}/api/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: transactionId, transaction_data: transactionData })
    })
    return res.json()
  }
}

// --- Components ---

function RiskBadge({ score }: { score: number }) {
  let color = '#10b981'
  let label = 'LOW'
  if (score > 1.2) { color = '#ef4444'; label = 'CRITICAL' }
  else if (score > 0.9) { color = '#f59e0b'; label = 'HIGH' }
  else if (score > 0.6) { color = '#3b82f6'; label = 'MEDIUM' }
  
  return (
    <span style={{ 
      background: `${color}20`, 
      color, 
      padding: '4px 10px', 
      borderRadius: '4px', 
      fontSize: '0.7rem', 
      fontWeight: 700,
      border: `1px solid ${color}40`
    }}>
      {label} ({(score * 100).toFixed(0)}%)
    </span>
  )
}

function AlertItem({ alert }: { alert: Alert }) {
  const colors = {
    high: { bg: '#ef444420', border: '#ef4444', text: '#ef4444' },
    med: { bg: '#f59e0b20', border: '#f59e0b', text: '#f59e0b' },
    low: { bg: '#3b82f620', border: '#3b82f6', text: '#3b82f6' }
  }
  const c = colors[alert.severity]
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: c.bg,
      borderLeft: `3px solid ${c.border}`,
      marginBottom: '8px',
      borderRadius: '4px'
    }}>
      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: 'var(--muted)' }}>
        {alert.timestamp}
      </span>
      <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text)' }}>{alert.message}</span>
      <span style={{ 
        fontSize: '0.65rem', 
        fontWeight: 700, 
        color: c.text,
        textTransform: 'uppercase'
      }}>
        {alert.severity}
      </span>
    </div>
  )
}

function TransactionRow({ 
  tx, 
  onClick,
  selected 
}: { 
  tx: Transaction
  onClick: () => void
  selected: boolean 
}) {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 100px 80px',
        gap: '16px',
        padding: '14px 20px',
        background: selected ? 'rgba(96,165,250,0.1)' : 'transparent',
        borderLeft: selected ? '3px solid var(--blue)' : '3px solid transparent',
        borderBottom: '1px solid rgba(96,165,250,0.06)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '0.82rem',
        alignItems: 'center'
      }}
    >
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text)' }}>#{tx.transaction_id.slice(-6)}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px' }}>{tx.user_id}</div>
      </div>
      <div style={{ color: 'var(--text)' }}>${tx.amount.toLocaleString()}</div>
      <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{tx.category}</div>
      <div>
        <RiskBadge score={tx.risk_score} />
      </div>
      <div style={{ textAlign: 'right' }}>
        {tx.is_flagged && (
          <span style={{ 
            fontSize: '0.65rem', 
            color: '#ef4444',
            fontWeight: 700 
          }}>
            ⚠ FLAGGED
          </span>
        )}
      </div>
    </div>
  )
}

function XAIPanel({ explanation }: { explanation: XAIExplanation | null }) {
  if (!explanation) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: '0.85rem'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
        Select a transaction to view XAI explanation
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        padding: '16px', 
        background: 'rgba(96,165,250,0.05)', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '8px' }}>AI NARRATIVE</div>
        <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text)' }}>
          {explanation.narrative}
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '12px' }}>TOP RISK FACTORS</div>
      {explanation.top_risk_factors.map((factor, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 0',
          borderBottom: '1px solid rgba(96,165,250,0.06)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: i === 0 ? '#ef444420' : i === 1 ? '#f59e0b20' : '#3b82f620',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : '#3b82f6'
          }}>
            {i + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
              {factor.factor}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px' }}>
              {factor.description}
            </div>
          </div>
          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.75rem',
            color: 'var(--blue)',
            fontWeight: 600
          }}>
            {(factor.importance * 100).toFixed(1)}%
          </div>
        </div>
      ))}

      <div style={{ 
        marginTop: '20px',
        padding: '16px',
        background: explanation.risk_score > 0.8 ? '#ef444410' : '#10b98110',
        borderRadius: '8px',
        border: `1px solid ${explanation.risk_score > 0.8 ? '#ef444430' : '#10b98130'}`
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
            Overall Risk Score
          </span>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: explanation.risk_score > 0.8 ? '#ef4444' : '#10b981'
          }}>
            {(explanation.risk_score * 100).toFixed(1)}%
          </span>
        </div>
        <div style={{
          height: '6px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '3px',
          marginTop: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${explanation.risk_score * 100}%`,
            background: explanation.risk_score > 0.8 ? '#ef4444' : '#10b981',
            borderRadius: '3px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>
    </div>
  )
}

function FraudGraphVisualization({ graph }: { graph: FraudGraph | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!graph || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    if (!graph.nodes.length) return

    // Position nodes in a circle layout with risk-based coloring
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.35
    
    const nodePositions: Record<string, { x: number; y: number }> = {}
    
    // Group nodes by type
    const nodesByType: Record<string, GraphNode[]> = {}
    graph.nodes.forEach(node => {
      if (!nodesByType[node.type]) nodesByType[node.type] = []
      nodesByType[node.type].push(node)
    })
    
    // Position nodes in concentric circles by type
    let angleOffset = 0
    const types = ['user', 'merchant', 'device', 'ip']
    const typeColors: Record<string, string> = {
      user: '#60a5fa',
      merchant: '#fbbf24', 
      device: '#8b5cf6',
      ip: '#10b981'
    }
    
    types.forEach((type, typeIdx) => {
      const typeNodes = nodesByType[type] || []
      const typeRadius = radius * (0.5 + typeIdx * 0.2)
      
      typeNodes.forEach((node, i) => {
        const angle = angleOffset + (i / Math.max(typeNodes.length, 1)) * Math.PI * 2
        nodePositions[node.id] = {
          x: centerX + Math.cos(angle) * typeRadius,
          y: centerY + Math.sin(angle) * typeRadius
        }
      })
      angleOffset += Math.PI / 4
    })

    // Draw edges
    graph.edges.forEach(edge => {
      const src = nodePositions[edge.source]
      const dst = nodePositions[edge.target]
      if (!src || !dst) return
      
      ctx.beginPath()
      ctx.moveTo(src.x, src.y)
      ctx.lineTo(dst.x, dst.y)
      ctx.strokeStyle = 'rgba(96,165,250,0.15)'
      ctx.lineWidth = edge.weight || 1
      ctx.stroke()
    })

    // Draw nodes
    graph.nodes.forEach(node => {
      const pos = nodePositions[node.id]
      if (!pos) return
      
      const color = typeColors[node.type] || '#94a3b8'
      const size = 6 + node.risk_score * 8
      
      // Node glow for high risk
      if (node.risk_score > 0.7) {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, size + 4, 0, Math.PI * 2)
        ctx.fillStyle = `${color}30`
        ctx.fill()
      }
      
      // Node body
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2)
      ctx.fillStyle = `${color}40`
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Label
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px Space Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(node.label.slice(0, 8), pos.x, pos.y + size + 12)
    })
  }, [graph])

  return (
    <canvas 
      ref={canvasRef}
      width={600}
      height={400}
      style={{ 
        width: '100%', 
        height: '100%',
        borderRadius: '8px'
      }}
    />
  )
}

// --- Main Component ---
export function NeoGuardPage({ onNavigate, onLogout }: { onNavigate: (p: string) => void, onLogout: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [graph, setGraph] = useState<FraudGraph | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [explanation, setExplanation] = useState<XAIExplanation | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTx: 0,
    flaggedTx: 0,
    fraudRings: 0,
    avgRiskScore: 0
  })

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [demoData, graphData] = await Promise.all([
          api.getDemoData(),
          api.getGraph()
        ])
        
        setTransactions(demoData)
        setGraph(graphData)
        
        // Generate alerts from flagged transactions
        const newAlerts: Alert[] = demoData
          .filter(tx => tx.is_flagged)
          .slice(0, 5)
          .map((tx, i) => ({
            id: `alert-${i}`,
            timestamp: new Date().toLocaleTimeString(),
            message: tx.flag_reason || `High risk transaction detected`,
            severity: tx.risk_score > 1.2 ? 'high' : tx.risk_score > 0.9 ? 'med' : 'low',
            transaction_id: tx.transaction_id
          }))
        setAlerts(newAlerts)
        
        // Calculate stats
        setStats({
          totalTx: demoData.length,
          flaggedTx: demoData.filter(tx => tx.is_flagged).length,
          fraudRings: Math.floor(demoData.filter(tx => tx.risk_score > 0.8).length / 3),
          avgRiskScore: demoData.reduce((acc, tx) => acc + tx.risk_score, 0) / demoData.length
        })
        
        setLoading(false)
      } catch (err) {
        console.error('Failed to load NeoGuard data:', err)
        setLoading(false)
      }
    }
    
    loadData()
    
    // Live updates
    const interval = setInterval(() => {
      setAlerts(prev => {
        if (prev.length > 8) return prev.slice(0, 8)
        return prev
      })
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  // Load explanation when transaction selected
  useEffect(() => {
    if (!selectedTx) {
      setExplanation(null)
      return
    }
    
    const loadExplanation = async () => {
      try {
        const exp = await api.explainTransaction(selectedTx.transaction_id, {
          amount: selectedTx.amount,
          category: selectedTx.category,
          merchant_id: selectedTx.merchant_id,
          country: selectedTx.country,
          user_id: selectedTx.user_id
        })
        setExplanation(exp)
      } catch (err) {
        console.error('Failed to load explanation:', err)
      }
    }
    
    loadExplanation()
  }, [selectedTx])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>
            Initializing NeoGuard...
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Loading Temporal Transformer + GNN models
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      {/* Header */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid rgba(96,165,250,0.1)',
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('main') }} style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--blue), var(--vio))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none'
          }}>
            RAD<span style={{ color: 'var(--blue)' }}>·</span>ON
          </a>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>NeoGuard</span>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('email') }} style={{
              color: 'var(--muted)',
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}>Email Engine</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('analytics') }} style={{
              color: 'var(--muted)',
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}>Analytics</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('crm') }} style={{
              color: 'var(--muted)',
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}>CRM</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('erp') }} style={{
              color: 'var(--muted)',
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}>ERP</a>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'rgba(16,185,129,0.1)',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: '#10b981'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 2s infinite'
            }} />
            LIVE
          </div>
          <button 
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(96,165,250,0.3)',
              color: 'var(--text)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Log Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '24px 32px' }}>
        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {[
            { label: 'Total Transactions', value: stats.totalTx.toLocaleString(), color: '#60a5fa' },
            { label: 'Flagged Transactions', value: stats.flaggedTx.toString(), color: '#ef4444' },
            { label: 'Active Fraud Rings', value: stats.fraudRings.toString(), color: '#f59e0b' },
            { label: 'Avg Risk Score', value: `${(stats.avgRiskScore * 100).toFixed(1)}%`, color: '#8b5cf6' }
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '20px',
              background: 'rgba(96,165,250,0.03)',
              border: '1px solid rgba(96,165,250,0.1)',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '8px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: '20px'
        }}>
          {/* Transaction List */}
          <div style={{
            gridRow: '1 / 3',
            background: 'rgba(96,165,250,0.03)',
            border: '1px solid rgba(96,165,250,0.1)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(96,165,250,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Transaction Feed</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                {transactions.length} transactions
              </span>
            </div>
            <div style={{ maxHeight: '600px', overflow: 'auto' }}>
              {transactions.map(tx => (
                <TransactionRow
                  key={tx.transaction_id}
                  tx={tx}
                  selected={selectedTx?.transaction_id === tx.transaction_id}
                  onClick={() => setSelectedTx(tx)}
                />
              ))}
            </div>
          </div>

          {/* XAI Explanation Panel */}
          <div style={{
            background: 'rgba(96,165,250,0.03)',
            border: '1px solid rgba(96,165,250,0.1)',
            borderRadius: '8px',
            minHeight: '300px'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(96,165,250,0.1)'
            }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {selectedTx ? `XAI Analysis: #${selectedTx.transaction_id.slice(-6)}` : 'XAI Explainability'}
              </span>
            </div>
            <XAIPanel explanation={explanation} />
          </div>

          {/* Fraud Graph Visualization */}
          <div style={{
            background: 'rgba(96,165,250,0.03)',
            border: '1px solid rgba(96,165,250,0.1)',
            borderRadius: '8px'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(96,165,250,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Fraud Ring Network</span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem' }}>
                <span style={{ color: '#60a5fa' }}>● User</span>
                <span style={{ color: '#fbbf24' }}>● Merchant</span>
                <span style={{ color: '#8b5cf6' }}>● Device</span>
                <span style={{ color: '#10b981' }}>● IP</span>
              </div>
            </div>
            <div style={{ padding: '20px', height: '300px' }}>
              <FraudGraphVisualization graph={graph} />
            </div>
          </div>
        </div>

        {/* Alert Timeline */}
        <div style={{
          marginTop: '20px',
          background: 'rgba(96,165,250,0.03)',
          border: '1px solid rgba(96,165,250,0.1)',
          borderRadius: '8px',
          padding: '16px 20px'
        }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '12px' }}>
            Alert Timeline
          </div>
          <div>
            {alerts.map(alert => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
            {alerts.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>
                No active alerts
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
