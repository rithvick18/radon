import { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { SiteFooter, MinimalNav } from './Components'

/* ══════════════════════════════════════
   ANALYTICS SECTION
   High-level enterprise intelligence
══════════════════════════════════════ */
export function AnalyticsSection() {
  const [tab, setTab] = useState('revenue')
  
  const pLayout = (t: string, extra={}) => ({
    title: { 
      text: t, 
      font: { color: '#e8eaf6', size: 13, family: "'Space Mono', monospace", letterSpacing: '0.1em' },
      x: 0,
      y: 0.95
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { family: "'Space Mono', monospace", color: '#4a5568', size: 9 },
    margin: { t: 60, r: 20, l: 40, b: 40 },
    xaxis: { 
      gridcolor: 'rgba(96,165,250,0.06)', 
      zerolinecolor: 'rgba(96,165,250,0.1)',
      tickfont: { color: 'var(--muted)' }
    },
    yaxis: { 
      gridcolor: 'rgba(96,165,250,0.06)', 
      zerolinecolor: 'rgba(96,165,250,0.1)',
      tickfont: { color: 'var(--muted)' }
    },
    hovermode: 'closest' as any,
    ...extra
  });

  return (
    <section id="analytics-sec" className="module-pane" style={{ background: 'var(--bg)', padding: '5rem 3.5rem' }}>
      <div className="sec-top reveal">
         <div>
           <div className="sec-tag">Enterprise Intelligence</div>
           <h2 className="sec-h">Global Analytics.</h2>
           <div className="tick-line"></div>
         </div>
         <p className="sec-sub">Multi-dimensional analysis of global operations, revenue streams, and security posture.</p>
      </div>

      <div className="mod-subnav reveal reveal-d1">
         <div className={`mod-tab ${tab === 'revenue' ? 'active' : ''}`} onClick={() => setTab('revenue')}>REVENUE</div>
         <div className={`mod-tab ${tab === 'fraud' ? 'active' : ''}`} onClick={() => setTab('fraud')}>SECURITY & FRAUD</div>
         <div className={`mod-tab ${tab === 'performance' ? 'active' : ''}`} onClick={() => setTab('performance')}>SYSTEM PERF</div>
      </div>

      <div className="reveal reveal-d2" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
         
         {/* REVENUE TAB */}
         {tab === 'revenue' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
                {[
                  {l: 'Total Gross Volume', v: '$182.4M', s: '+12.4%', c: 'var(--elec)'},
                  {l: 'Net Revenue', v: '$42.1M', s: '+8.2%', c: 'var(--green)'},
                  {l: 'Avg Order Value', v: '$244.10', s: '-1.2%', c: 'var(--vio)'},
                  {l: 'Churn Rate', v: '1.24%', s: '-0.4%', c: '#f87171'}
                ].map((k, i) => (
                  <div key={i} style={{ background: "var(--s2)", padding: '1.5rem' }}>
                    <div style={{ fontSize: '.6rem', fontFamily: "'Space Mono', monospace", color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{k.l}</div>
                    <div style={{ fontSize: '2.2rem', fontFamily: "'Bebas Neue', sans-serif", color: k.c }}>{k.v}</div>
                    <div style={{ fontSize: '.55rem', fontFamily: "'Space Mono', monospace", color: k.s.startsWith('+') ? 'var(--green)' : '#f87171', marginTop: '4px' }}>{k.s} <span style={{ color: 'var(--muted)', opacity: 0.5 }}>vs last month</span></div>
                  </div>
                ))}
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
               <div style={{ background: "var(--s2)", padding: '1.5rem' }}>
                 <Plot data={[
                   { 
                     type: 'scatter', 
                     mode: 'lines+markers', 
                     name: 'Actual Revenue', 
                     x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], 
                     y: [4.2, 3.8, 5.1, 4.9, 6.2, 7.1], 
                     line: { color: '#60a5fa', width: 3, shape: 'spline' },
                     marker: { color: '#03030a', size: 8, line: { color: '#60a5fa', width: 2 } }
                   },
                   { 
                     type: 'scatter', 
                     mode: 'lines', 
                     name: 'AI Forecast', 
                     x: ['Jun', 'Jul', 'Aug', 'Sep'], 
                     y: [7.1, 7.8, 8.4, 9.1], 
                     line: { color: '#8b5cf6', width: 2, dash: 'dot', shape: 'spline' } 
                   }
                 ]} layout={pLayout('MONTHLY REVENUE TRENDS (M)', { height: 350 })} style={{ width: '100%' }} config={{ displayModeBar: false }} />
               </div>
               <div style={{ background: "var(--s2)", padding: '1.5rem' }}>
                 <Plot data={[
                   { 
                     type: 'pie', 
                     values: [42, 31, 18, 9], 
                     labels: ['AMER', 'EMEA', 'APAC', 'LATAM'], 
                     hole: 0.6, 
                     marker: { colors: ['#60a5fa', '#8b5cf6', '#22d3ee', 'rgba(96,165,250,0.2)'] },
                     textinfo: 'percent'
                   }
                 ]} layout={pLayout('REVENUE BY REGION', { showlegend: true, legend: { x: 0, y: -0.2, orientation: 'h', font: { size: 8 } }, height: 350 })} style={{ width: '100%' }} config={{ displayModeBar: false }} />
               </div>
             </div>
           </div>
         )}

         {/* FRAUD TAB */}
         {tab === 'fraud' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
                <div style={{ background: "var(--s2)", padding: '1.5rem' }}>
                  <Plot data={[
                    {
                      type: 'choropleth',
                      locations: ['USA', 'CHN', 'GBR', 'FRA', 'CAN', 'IND', 'DEU', 'MEX', 'BRA', 'AUS'],
                      locationmode: 'ISO-3',
                      z: [14, 28, 12, 15, 8, 35, 14, 22, 19, 7],
                      colorscale: [ [0, '#0a0a20'], [0.5, 'rgba(248,113,113,0.4)'], [1, '#f87171'] ],
                      marker: { line: { color: '#03030a', width: 0.5 } },
                      colorbar: { thickness: 10, outlinecolor: 'transparent', tickfont: { color: '#4a5568' } }
                    }
                  ]} layout={pLayout('GLOBAL FRAUD HOTSPOTS', { geo: { bgcolor: 'transparent', showland: true, landcolor: '#07071a', subunitcolor: '#03030a', countrycolor: '#03030a', showocean: true, oceancolor: '#03030a' }, height: 400 })} style={{ width: '100%' }} config={{ displayModeBar: false }} />
                </div>
                <div style={{ background: "var(--s2)", padding: '1.5rem' }}>
                  <Plot data={[
                    {
                      type: 'bar',
                      x: ['Card Not Present', 'Identity Theft', 'Account Takeover', 'Friendly Fraud', 'Bot Attacks'],
                      y: [420, 280, 150, 90, 310],
                      marker: { color: 'rgba(248,113,113,0.5)', line: { color: '#f87171', width: 1 } }
                    }
                  ]} layout={pLayout('ATTACK VECTORS (COUNT)', { height: 400 })} style={{ width: '100%' }} config={{ displayModeBar: false }} />
                </div>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
                {[
                  {l: 'False Positive Rate', v: '0.08%', s: 'Optimized', c: 'var(--elec)'},
                  {l: 'Avg Risk Score', v: '14.2', s: 'Low', c: 'var(--green)'},
                  {l: 'Auto-Blocked TX', v: '1.2K', s: 'Past 24h', c: '#f87171'}
                ].map((k, i) => (
                  <div key={i} style={{ background: "var(--s2)", padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '.6rem', fontFamily: "'Space Mono', monospace", color: 'var(--muted)', marginBottom: '8px' }}>{k.l}</div>
                    <div style={{ fontSize: '2rem', fontFamily: "'Bebas Neue', sans-serif", color: k.c }}>{k.v}</div>
                    <div style={{ fontSize: '.55rem', fontFamily: "'Space Mono', monospace", color: 'var(--muted)', opacity: 0.5 }}>{k.s}</div>
                  </div>
                ))}
             </div>
           </div>
         )}

         {/* PERFORMANCE TAB */}
         {tab === 'performance' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
                 <div style={{ background: "var(--s2)", padding: '1.5rem' }}>
                    <Plot data={[
                      {
                        type: 'scatter',
                        mode: 'lines',
                        name: 'API Latency',
                        y: Array.from({length: 20}, () => 10 + Math.random() * 8),
                        line: { color: '#22d3ee', width: 2 }
                      }
                    ]} layout={pLayout('SYSTEM LATENCY (MS)', { height: 300, yaxis: { range: [0, 30] } })} style={{ width: '100%' }} config={{ displayModeBar: false }} />
                 </div>
                 <div style={{ background: "var(--s2)", padding: '1.5rem' }}>
                    <Plot data={[
                      {
                        type: 'scatter',
                        fill: 'tozeroy',
                        name: 'CPU Load',
                        y: Array.from({length: 20}, () => 30 + Math.random() * 40),
                        line: { color: '#8b5cf6', width: 2 },
                        fillcolor: 'rgba(139,92,246,0.1)'
                      }
                    ]} layout={pLayout('GPU/CPU UTILIZATION (%)', { height: 300, yaxis: { range: [0, 100] } })} style={{ width: '100%' }} config={{ displayModeBar: false }} />
                 </div>
              </div>
              <div style={{ background: "var(--s2)", padding: '2rem' }}>
                 <div className="p-lbl" style={{ marginBottom: '1.5rem' }}>Model Performance Matrix</div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                    {[
                      {l: 'NeoGuard v4.1 Accuracy', v: '99.4%', d: 'Temporal Transformer'},
                      {l: 'Graph Insight Recall', v: '94.2%', d: 'Dynamic GNN'},
                      {l: 'Agent Reasoning Score', v: '98.1%', d: 'LangGraph Core'},
                      {l: 'Data Sync Latency', v: '4ms', d: 'Edge Pipeline'}
                    ].map((m, i) => (
                      <div key={i}>
                         <div style={{ fontSize: '.55rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{m.l}</div>
                         <div style={{ fontSize: '1.8rem', fontFamily: "'Bebas Neue', sans-serif", color: 'var(--text)', margin: '5px 0' }}>{m.v}</div>
                         <div style={{ fontSize: '.52rem', color: 'var(--elec)', fontFamily: "'Space Mono', monospace" }}>{m.d}</div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
         )}

      </div>
    </section>
  )
}

/* ══════════════════════════════════════
   ANALYTICS PAGE
══════════════════════════════════════ */
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
