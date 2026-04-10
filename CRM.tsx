import { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { SiteFooter, MinimalNav } from './Components'

/* ══════════════════════════════════════
   CRM SECTION
══════════════════════════════════════ */
export function CRMSection() {
  const [tab, setTab] = useState('pipeline')
  
  const pLayout = (t: string, extra={}) => ({
    title: { text: t, font: { color: '#e8eaf6', size: 13, family: "'Space Mono', monospace", letterSpacing: '0.1em' }, x: 0 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { family: "'Space Mono', monospace", color: '#4a5568', size: 9 },
    margin: { t: 40, r: 20, l: 40, b: 30 },
    xaxis: { gridcolor: 'rgba(96,165,250,0.06)', zerolinecolor: 'rgba(96,165,250,0.1)' },
    yaxis: { gridcolor: 'rgba(96,165,250,0.06)', zerolinecolor: 'rgba(96,165,250,0.1)' },
    ...extra
  });

  return (
    <section id="crm-sec" className="module-pane" style={{ background: 'var(--bg)', padding: '5rem 3.5rem' }}>
      <div className="sec-top reveal">
         <div>
           <div className="sec-tag">Customer Intelligence</div>
           <h2 className="sec-h">CRM Link.</h2>
           <div className="tick-line"></div>
         </div>
         <p className="sec-sub">Synchronised live with global pipeline and revenue data. Powered by Plotly visualisations.</p>
      </div>
      <div className="mod-subnav reveal reveal-d1">
         <div className={`mod-tab ${tab === 'pipeline' ? 'active' : ''}`} onClick={() => setTab('pipeline')}>PIPELINE</div>
         <div className={`mod-tab ${tab === 'directory' ? 'active' : ''}`} onClick={() => setTab('directory')}>DIRECTORY</div>
         <div className={`mod-tab ${tab === 'support' ? 'active' : ''}`} onClick={() => setTab('support')}>SUPPORT</div>
      </div>
      <div className="reveal reveal-d2" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
         
         {/* PIPELINE TAB */}
         {tab === 'pipeline' && (
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
               <div style={{ background: "var(--s2)", padding: '1.5rem' }}>
                 <Plot data={[
                   { type: 'funnel', y: ['Website Visits', 'MQL', 'SQL', 'Negotiation', 'Closed Won'], x: [12400, 3200, 850, 120, 48], marker: { color: ['rgba(34,211,238,0.8)', 'rgba(96,165,250,0.8)', 'rgba(139,92,246,0.8)', 'rgba(251,191,36,0.8)', 'rgba(52,211,153,0.8)'] }, textinfo: 'value+percent initial' as any }
                 ]} layout={pLayout('SALES FUNNEL VELOCITY', { margin: { t: 40, b: 20, l: 100, r: 20 } })} style={{ width: '100%', height: '280px' }} config={{ displayModeBar: false }} />
               </div>
               <div style={{ background: "var(--s2)", padding: '1.5rem', flex: 1 }}>
                 <div className="p-lbl" style={{ marginBottom: '1rem' }}>Recent Won Deals</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {[['Acme Corp', '$120K', 'Enterprise SaaS'], ['Globex', '$85K', 'Managed Services'], ['Soylent', '$240K', 'Platform License']].map((d,i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,.02)', borderLeft: '2px solid var(--green)' }}>
                       <div><div style={{ fontFamily: "'Space Mono', monospace", fontSize: '.7rem', color: 'var(--text)' }}>{d[0]}</div><div style={{ fontSize: '.55rem', color: 'var(--muted)', marginTop: '4px' }}>{d[2]}</div></div>
                       <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--green)' }}>{d[1]}</div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
             <div style={{ background: "var(--s2)", padding: '1.5rem' }}>
               <Plot data={[
                 ({ type: 'waterfall', name: 'Revenue', orientation: 'v', measure: ['relative', 'relative', 'relative', 'relative', 'total'], x: ['Q1 Actual', 'Pipeline', 'Churn', 'New Biz', 'Q2 Expected'], y: [4.2, 0.8, -0.3, 1.5, 6.2], connector: { line: { color: 'rgba(255,255,255,0.1)' } }, increasing: { marker: { color: '#34d399' } }, decreasing: { marker: { color: '#f87171' } }, totals: { marker: { color: '#60a5fa' } } } as any)
               ]} layout={pLayout('REVENUE FORECAST WATERFALL (M)', { margin: { t: 40, b: 40, l: 30, r: 10 } })} style={{ width: '100%', height: '100%', minHeight: '400px' }} config={{ displayModeBar: false }} />
             </div>
           </div>
         )}

         {/* DIRECTORY TAB */}
         {tab === 'directory' && (
           <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
             <div style={{ background: "var(--s2)", padding: '1.5rem' }}>
               <Plot data={[
                 { type: 'bar', orientation: 'h', x: [2.1, 1.8, 1.4, 0.9, 0.5], y: ['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Umbrella'], marker: { color: 'rgba(96,165,250,0.6)', line: { color: 'rgba(96,165,250,1)', width: 1 } } }
               ]} layout={pLayout('TOP ACCOUNTS BY REVENUE (M)', { margin: { t: 40, b: 40, l: 80, r: 20 }, yaxis: { autorange: 'reversed' } })} style={{ width: '100%', height: '350px' }} config={{ displayModeBar: false }} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
               <div style={{ background: "var(--s2)", padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 <Plot data={[
                   { type: 'indicator', mode: 'gauge+number+delta', value: 92, delta: { reference: 85, increasing: { color: '#34d399', symbol: '▲' } as any }, title: { text: "Avg Client Health", font: { size: 12, color: 'var(--muted)' } }, gauge: { axis: { range: [null, 100], tickcolor: 'rgba(255,255,255,0.1)' }, bar: { color: '#60a5fa' }, bgcolor: 'rgba(255,255,255,0.05)', bordercolor: 'transparent', steps: [{ range: [0, 60], color: 'rgba(248,113,113,0.2)' }, { range: [60, 80], color: 'rgba(251,191,36,0.2)' }] } }
                 ]} layout={{ paper_bgcolor: 'transparent', font: { family: "'Space Mono', monospace", color: '#4a5568' }, margin: { t: 20, b: 20, l: 20, r: 20 } }} style={{ width: '100%', height: '200px' }} config={{ displayModeBar: false }} />
               </div>
               <div style={{ background: "var(--s2)", padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                 <div className="p-lbl" style={{ marginBottom: '1rem' }}>Interaction History</div>
                 {[{t: 'QBR Meeting', c: 'Acme Corp', d: '2h ago'}, {t: 'Support Call', c: 'Initech', d: '5h ago'}, {t: 'Contract Sent', c: 'Globex', d: '1d ago'}].map((a, i) => (
                   <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ fontSize: '.7rem', color: 'var(--text)' }}>{a.t}</div>
                     <div style={{ fontSize: '.55rem', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}><span>{a.c}</span><span style={{ color: 'var(--elec)' }}>{a.d}</span></div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         )}

         {/* SUPPORT TAB */}
         {tab === 'support' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
               {[
                 {l: 'Active Tickets', v: '84', c: 'var(--text)'},
                 {l: 'Avg Resolution Time', v: '2.4h', c: '#34d399', s: '↓ 12% vs last week'},
                 {l: 'SLA Breaches', v: '0', c: 'var(--muted)'}
               ].map((k, i) => (
                 <div key={i} style={{ background: "var(--s2)", padding: '1.5rem', textAlign: 'center' }}>
                   <div style={{ fontSize: '.6rem', fontFamily: "'Space Mono', monospace", color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: '8px' }}>{k.l}</div>
                   <div style={{ fontSize: '2.5rem', fontFamily: "'Bebas Neue', sans-serif", color: k.c }}>{k.v}</div>
                   {k.s && <div style={{ fontSize: '.55rem', fontFamily: "'Space Mono', monospace", color: 'var(--green)', marginTop: '8px' }}>{k.s}</div>}
                 </div>
               ))}
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
               <div style={{ background: "var(--s2)", padding: '1rem' }}>
                 <Plot data={[
                   { type: 'pie', values: [12, 28, 44], labels: ['High', 'Medium', 'Low'], hole: 0.7, marker: { colors: ['#f87171', '#fbbf24', '#60a5fa'] }, textinfo: 'label+percent' }
                 ]} layout={pLayout('TICKETS BY PRIORITY', { margin: { t: 40, b: 20, l: 20, r: 20 }, showlegend: false })} style={{ width: '100%', height: '300px' }} config={{ displayModeBar: false }} />
               </div>
               <div style={{ background: "var(--s2)", padding: '1.5rem' }}>
                 <Plot data={[
                   { type: 'bar', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], y: [42, 58, 35, 60, 48, 12, 8], marker: { color: 'rgba(139,92,246,0.6)' } }
                 ]} layout={pLayout('TICKET VOLUME TREND (7D)', { margin: { t: 40, b: 40, l: 40, r: 20 } })} style={{ width: '100%', height: '300px' }} config={{ displayModeBar: false }} />
               </div>
             </div>
           </div>
         )}

      </div>
    </section>
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
