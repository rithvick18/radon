import { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { SiteFooter, MinimalNav } from './Components'

/* ══════════════════════════════════════
   ERP SECTION
══════════════════════════════════════ */
export function ERPSection() {
  const [tab, setTab] = useState('inventory')
  
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
    <section id="erp-sec" className="module-pane" style={{ background: 'var(--s1)', padding: '5rem 3.5rem' }}>
      <div className="sec-top reveal">
         <div>
           <div className="sec-tag">Resource Control</div>
           <h2 className="sec-h">ERP Integration.</h2>
           <div className="tick-line"></div>
         </div>
         <p className="sec-sub">Real-time resource allocation, cash flow, and supply chain metrics — tracked via Plotly.</p>
      </div>
      <div className="mod-subnav reveal reveal-d1">
         <div className={`mod-tab ${tab === 'inventory' ? 'active' : ''}`} onClick={() => setTab('inventory')}>INVENTORY</div>
         <div className={`mod-tab ${tab === 'supply' ? 'active' : ''}`} onClick={() => setTab('supply')}>SUPPLY CHAIN</div>
         <div className={`mod-tab ${tab === 'finance' ? 'active' : ''}`} onClick={() => setTab('finance')}>FINANCE</div>
      </div>
      <div className="reveal reveal-d2" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
         
         {/* INVENTORY TAB */}
         {tab === 'inventory' && (
           <>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
               {[
                 {l: 'Total SKUs', v: '14,204', s: 'Across 8 facilities'},
                 {l: 'Inventory Value', v: '$8.4M', s: '+2.4% MoM'},
                 {l: 'Low Stock Alerts', v: '24', s: 'Critical threshold', c: '#f87171'},
                 {l: 'Overstocked', v: '130', s: 'Capital tied up', c: '#fbbf24'}
               ].map((k, i) => (
                 <div key={i} style={{ background: "var(--s2)", padding: '1.25rem' }}>
                   <div style={{ fontSize: '1.8rem', fontFamily: "'Bebas Neue', sans-serif", color: k.c || 'var(--elec)' }}>{k.v}</div>
                   <div style={{ fontSize: '.6rem', fontFamily: "'Space Mono', monospace", color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{k.l}</div>
                   <div style={{ fontSize: '.55rem', fontFamily: "'Space Mono', monospace", color: 'var(--text)', opacity: 0.5, marginTop: '8px' }}>{k.s}</div>
                 </div>
               ))}
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
               <div style={{ background: "var(--s2)", padding: '1rem' }}>
                 <Plot data={[
                   { type: 'pie', values: [45, 25, 20, 10], labels: ['Raw', 'WIP', 'Finished', 'Pack'], hole: 0.6, marker: { colors: ['#60a5fa', '#8b5cf6', '#34d399', '#fbbf24'] }, textinfo: 'none' }
                 ]} layout={pLayout('SKU DISTRIBUTION', { margin: { t: 30, b: 10, l: 10, r: 10 }, showlegend: true, legend: { orientation: 'h', y: -0.2 } })} style={{ width: '100%', height: '240px' }} config={{ displayModeBar: false }} />
               </div>
               <div style={{ background: "var(--s2)", padding: '1rem' }}>
                 <Plot data={[
                   { type: 'scatter', mode: 'lines+markers', name: 'Inbound', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], y: [120, 150, 180, 90, 200, 140], line: { color: '#34d399', shape: 'spline' }, fill: 'tozeroy', fillcolor: 'rgba(52, 211, 153, 0.1)' },
                   { type: 'scatter', mode: 'lines+markers', name: 'Outbound', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], y: [100, 130, 200, 120, 250, 110], line: { color: '#60a5fa', shape: 'spline' } }
                 ]} layout={pLayout('STOCK MOVEMENT (WEEKLY)', { margin: { t: 30, b: 30, l: 30, r: 10 }, legend: { orientation: 'h', y: 1.1, x: 0.7 } })} style={{ width: '100%', height: '240px' }} config={{ displayModeBar: false }} />
               </div>
               <div style={{ background: "var(--s2)", padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 <Plot data={[
                   { type: 'indicator', mode: 'gauge+number', value: 85, title: { text: "UTILIZATION", font: { size: 10, color: 'var(--muted)' } }, gauge: { axis: { range: [null, 100], tickcolor: 'rgba(255,255,255,0.1)' }, bar: { color: '#f87171' }, bgcolor: 'rgba(255,255,255,0.05)', bordercolor: 'transparent' } }
                 ]} layout={{ paper_bgcolor: 'transparent', font: { family: "'Space Mono', monospace", color: '#4a5568' }, margin: { t: 0, b: 0, l: 20, r: 20 } }} style={{ width: '100%', height: '180px' }} config={{ displayModeBar: false }} />
               </div>
             </div>
           </>
         )}

         {/* SUPPLY CHAIN TAB */}
         {tab === 'supply' && (
           <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
             <div style={{ background: "var(--s2)", padding: '1rem' }}>
               <Plot data={[
                 { type: 'scattergeo', locations: ['USA', 'CHN', 'GBR', 'FRA', 'CAN', 'IND'], locationmode: 'ISO-3', marker: { size: [20, 35, 10, 15, 8, 25], color: '#60a5fa', opacity: 0.7, line: { width: 1, color: '#fff' } }, text: ['USA - 20 Shipments', 'China - 35 Shipments', 'UK - 10 Shipments', 'France - 15 Shipments', 'Canada - 8 Shipments', 'India - 25 Shipments'], name: 'Nominal' },
                 { type: 'scattergeo', locations: ['DEU', 'MEX', 'BRA'], locationmode: 'ISO-3', marker: { size: [15, 12, 10], color: '#f87171', symbol: 'star' }, text: ['DELAYED: Germany', 'DELAYED: Mexico', 'DELAYED: Brazil'], name: 'Delayed' }
               ]} layout={pLayout('ACTIVE GLOBAL SHIPMENTS', { geo: { scope: 'world', showland: true, landcolor: '#0d0d2b', showocean: true, oceancolor: '#03030a', bordercolor: '#1e2140', bgcolor: 'transparent' }, margin: { t: 30, b: 0, l: 0, r: 0 }, showlegend: true, legend: { orientation: 'h', y: 0 } })} style={{ width: '100%', height: '400px' }} config={{ displayModeBar: false }} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
               <div style={{ background: "var(--s2)", padding: '1rem', flex: 1 }}>
                 <Plot data={[
                   { type: 'scatterpolar', r: [95, 80, 90, 75, 95], theta: ['Delivery', 'Quality', 'Pricing', 'Communication', 'Delivery'], fill: 'toself', fillcolor: 'rgba(96, 165, 250, 0.2)', line: { color: '#60a5fa' } }
                 ]} layout={pLayout('VENDOR PERFORMANCE', { polar: { radialaxis: { visible: true, range: [0, 100], gridcolor: 'rgba(255,255,255,0.05)', linecolor: 'transparent', tickfont: { color: 'transparent' } }, angularaxis: { gridcolor: 'rgba(255,255,255,0.05)', linecolor: 'transparent' }, bgcolor: 'transparent' }, margin: { t: 40, b: 20, l: 30, r: 30 } })} style={{ width: '100%', height: '100%', minHeight: '200px' }} config={{ displayModeBar: false }} />
               </div>
               <div style={{ background: "var(--s2)", padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
                 <div className="p-lbl" style={{ marginBottom: '1rem' }}>Procurement Alerts</div>
                 {[{m: 'Material XYZ short', s: 'high'}, {m: 'Shipment #89 delayed by weather', s: 'med'}, {m: 'Supplier ABC contract expiry', s: 'low'}].map((a, i) => (
                   <div key={i} className={`alert-item ${a.s}`} style={{ marginBottom: '8px' }}>
                     <span className="alert-msg">{a.m}</span>
                     <span className={`alert-badge ${a.s}`} style={{ marginLeft: 'auto' }}>{a.s.toUpperCase()}</span>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         )}

         {/* FINANCE TAB */}
         {tab === 'finance' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
               {[
                 {l: 'Accounts Receivable', v: '$1.4M', c: '#34d399'},
                 {l: 'Accounts Payable', v: '$890K', c: '#f87171'},
                 {l: 'Net Run Rate', v: '$510K', c: '#60a5fa'}
               ].map((k, i) => (
                 <div key={i} style={{ background: "var(--s2)", padding: '1.5rem', textAlign: 'center' }}>
                   <div style={{ fontSize: '.6rem', fontFamily: "'Space Mono', monospace", color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: '8px' }}>{k.l}</div>
                   <div style={{ fontSize: '2.5rem', fontFamily: "'Bebas Neue', sans-serif", color: k.c }}>{k.v}</div>
                 </div>
               ))}
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1px', background: 'rgba(96,165,250,.06)' }}>
               <div style={{ background: "var(--s2)", padding: '1.5rem' }}>
                 <Plot data={[
                   { type: 'bar', name: 'Revenue', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [420, 480, 510, 490, 580, 620], marker: { color: '#34d399' } },
                   { type: 'bar', name: 'Expenses', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [380, 390, 410, 420, 450, 440], marker: { color: '#f87171' } },
                   { type: 'scatter', name: 'Net Margin (%)', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [9.5, 18.7, 19.6, 14.2, 22.4, 29.0], yaxis: 'y2', mode: 'lines+markers', line: { color: '#60a5fa', width: 2 } }
                 ]} layout={pLayout('CASH FLOW SUMMARY', { barmode: 'group', yaxis2: { title: { text: 'Margin %', font: { color: 'var(--muted)' } }, overlaying: 'y', side: 'right', gridcolor: 'transparent' }, margin: { t: 40, b: 30, l: 40, r: 40 }, legend: { orientation: 'h', y: 1.1 } })} style={{ width: '100%', height: '300px' }} config={{ displayModeBar: false }} />
               </div>
               <div style={{ background: "var(--s2)", padding: '1.5rem' }}>
                 <div className="p-lbl" style={{ marginBottom: '1.5rem' }}>Budget Trackers (YTD)</div>
                 {[['Marketing', 120, 150], ['R&D', 280, 300], ['Ops', 450, 400]].map(([lbl, val, bud], i) => (
                   <div key={i} style={{ marginBottom: '1.5rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono', monospace", fontSize: '.6rem', color: 'var(--muted)', marginBottom: '6px' }}>
                       <span>{lbl}</span><span>${val}k / ${bud}k</span>
                     </div>
                     <div style={{ height: '6px', background: 'rgba(255,255,255,.05)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                       <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${((val as number)/(bud as number))*100}%`, background: (val as number) > (bud as number) ? '#f87171' : '#60a5fa' }}></div>
                     </div>
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
