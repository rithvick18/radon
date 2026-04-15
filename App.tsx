import { useState, useEffect, useRef, useCallback, lazy, Suspense, type ComponentType } from 'react'

import { SiteFooter } from './Components'
import GoogleLoginButton from './src/Components/GoogleLoginButton'

function lazyNamed<T extends Record<string, ComponentType<any>>>(factory: () => Promise<T>, exportName: keyof T) {
  return lazy(async () => {
    const module = await factory()
    return { default: module[exportName] as ComponentType<any> }
  })
}

const CRMPage = lazyNamed(() => import('./CRM'), 'CRMPage')
const ERPPage = lazyNamed(() => import('./ERP'), 'ERPPage')
const AnalyticsPage = lazyNamed(() => import('./Analytics'), 'AnalyticsPage')
const NeoGuardPage = lazyNamed(() => import('./NeoGuard'), 'NeoGuardPage')
const EmailEnginePage = lazyNamed(() => import('./EmailEngine'), 'EmailEnginePage')
const AIAgentPage = lazyNamed(() => import('./AIAgent'), 'AIAgentPage')
const MistralChatbot = lazy(() => import('./src/Components/MistralChatbot'))
const AgentDashboard = lazy(() => import('./src/Components/AgentDashboard'))

/* ══════════════════════════════════════
   SYSTEM STATUS BAR
   Displays real-time server health and clock
══════════════════════════════════════ */
function SystemBar() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])
  const dateStr = time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  return (
    <div id="sys-bar">
      <div className="sb-left">
        <div className="sb-item"><div className="sb-pulse"></div> SYSTEMS: OPTIMAL</div>
        <div className="sb-item">LATENCY: 12ms</div>
        <div className="sb-item">BACKEND: ANTIGRAVITY-v4</div>
      </div>
      <div className="sb-right">
        <div className="sb-item">{time.toLocaleTimeString([], { hour12: false })}</div>
        <div className="sb-item">{dateStr}</div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   PARTICLE FIELD
   Canvas-based ambient background
══════════════════════════════════════ */
function ParticleField({ disabled = false }: { disabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (disabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    const particles: any[] = []
    const count = 40

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        s: Math.random() * 2 + 1,
      })
    }

    let raf = 0
    const animate = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(96, 165, 250, 0.2)'
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
        ctx.fill()
      })
      raf = requestAnimationFrame(animate)
    }
    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    animate()
    return () => {
      window.removeEventListener('resize', onResize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [disabled])
  if (disabled) return null
  return <canvas id="hero-particles" ref={canvasRef} />
}

/* ══════════════════════════════════════
   CURSOR COMPONENT
══════════════════════════════════════ */
function Cursor({ disabled = false }: { disabled?: boolean }) {
  const curRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)
  const mx = useRef(0)
  const my = useRef(0)
  const tx = useRef(0)
  const ty = useRef(0)

  useEffect(() => {
    if (disabled) return
    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX
      my.current = e.clientY
      if (curRef.current) {
        curRef.current.style.left = `${e.clientX}px`
        curRef.current.style.top = `${e.clientY}px`
      }
    }

    const onDown = () => curRef.current?.classList.add('click')
    const onUp = () => curRef.current?.classList.remove('click')

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)

    let raf: number
    const loop = () => {
      tx.current += (mx.current - tx.current) * 0.12
      ty.current += (my.current - ty.current) * 0.12
      if (trailRef.current) {
        trailRef.current.style.left = `${tx.current}px`
        trailRef.current.style.top = `${ty.current}px`
      }
      raf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [disabled])

  if (disabled) return null

  return (
    <>
      <div id="cur" ref={curRef} />
      <div id="cur-trail" ref={trailRef} />
    </>
  )
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function countUp(el: HTMLElement | null, end: number, suffix: string, dur: number, prefix = '') {
  if (!el) return
  const s = Date.now()
  const animate = () => {
    const p = Math.min((Date.now() - s) / dur, 1)
    const v = 1 - Math.pow(1 - p, 3)
    el.textContent = prefix + Math.round(end * v).toLocaleString() + suffix
    if (p < 1) requestAnimationFrame(animate)
  }
  animate()
}

/* ══════════════════════════════════════
   PROP INTERFACES
══════════════════════════════════════ */
interface LoginPageProps {
  onLogin: () => void
}

interface LoaderPageProps {
  onDone: () => void
}

interface MainPageProps {
  onLogout: () => void
  onNavigate: (p: string) => void
  onOpenCommandDeck: () => void
  disableAmbientEffects: boolean
}

function useMediaQuery(query: string) {
  const getMatches = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState(getMatches)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)

    setMatches(mediaQuery.matches)
    mediaQuery.addEventListener('change', onChange)

    return () => mediaQuery.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/* ══════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════ */
function LoginPage({ onLogin }: LoginPageProps) {
  const [keepSession, setKeepSession] = useState(false)
  const ls1Ref = useRef<HTMLDivElement>(null)
  const ls2Ref = useRef<HTMLDivElement>(null)
  const ls3Ref = useRef<HTMLDivElement>(null)
  const ls4Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      countUp(ls1Ref.current, 12400, '', 2200)
      countUp(ls2Ref.current, 847, '', 2000)
      countUp(ls3Ref.current, 99, '%', 1800)
      countUp(ls4Ref.current, 142, 'K', 2000, '$')
    }, 400)

    let lv = 12400
    const iv = setInterval(() => {
      lv += Math.round((Math.random() - 0.47) * 60)
      if (ls1Ref.current) ls1Ref.current.textContent = lv.toLocaleString()
    }, 1800)

    return () => {
      clearTimeout(t)
      clearInterval(iv)
    }
  }, [])

  return (
    <div id="page-login">
      <div className="lg-left">
        <div className="lg-grid"></div>
        <div className="lg-orb lg-orb1"></div>
        <div className="lg-orb lg-orb2"></div>
        <div className="lg-orb lg-orb3"></div>
        <div className="lg-brand">
          <div className="lg-logo"><span className="lg-logo-inner glitch">RADON</span></div>
          <div className="lg-tagline">Intelligence — v1.0</div>
        </div>
        <div className="lg-center">
          <div className="lg-big">
            <div className="g1"><span>Fraud</span></div>
            <div className="g2"><span>Eliminated.</span></div>
          </div>
          <p className="lg-desc">Enterprise intelligence powered by <em>NeoGuard</em> (fraud detection), <em>Email Engine</em> (AI-powered communications), and the <em>Central AI Agent</em>. Your all-in-one business intelligence platform.</p>
        </div>
        <div className="lg-stats">
          <div className="lg-stat">
            <div className="lg-stat-n" ref={ls1Ref}>0</div>
            <div className="lg-stat-l">Transactions / sec</div>
            <div className="lg-pulse"><div className="pdot"></div>Live</div>
          </div>
          <div className="lg-stat">
            <div className="lg-stat-n" ref={ls2Ref}>0</div>
            <div className="lg-stat-l">Fraud rings stopped</div>
          </div>
          <div className="lg-stat">
            <div className="lg-stat-n" ref={ls3Ref}>0%</div>
            <div className="lg-stat-l">Detection accuracy</div>
          </div>
          <div className="lg-stat">
            <div className="lg-stat-n" ref={ls4Ref}>$0K</div>
            <div className="lg-stat-l">Protected today</div>
          </div>
        </div>
      </div>
      <div className="lg-right">
        <div className="corner corner-tl"></div>
        <div className="corner corner-tr"></div>
        <div className="corner corner-bl"></div>
        <div className="corner corner-br"></div>
        <div className="lg-form-wrap">
          <div className="form-eyebrow">Secure access</div>
          <div className="form-title">Initialise<br />Session</div>
          <p className="form-sub">Enter your credentials to access the Radon Intelligence platform.</p>
          <div className="field">
            <label>Operator ID</label>
            <input type="text" placeholder="operator@organisation.com" autoComplete="off" />
            <div className="field-line"></div>
            <div className="field-icon">
              <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
          </div>
          <div className="field">
            <label>Access Key</label>
            <input type="password" placeholder="••••••••••••" autoComplete="off" />
            <div className="field-line"></div>
            <div className="field-icon">
              <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
          </div>
          <div className="form-row">
            <div className={`form-check${keepSession ? ' checked' : ''}`} onClick={() => setKeepSession(v => !v)}>
              <div className="check-box"></div>Keep session active
            </div>
            <a href="#" className="form-link">Reset credentials ↗</a>
          </div>
          <button className="btn-submit" onClick={onLogin}><span>Initialise Session ↗</span></button>
          <div className="form-divider">OR CONTINUE WITH</div>
          <button className="btn-sso" onClick={onLogin}>
            <svg viewBox="0 0 24 24"><rect x="2" y="2" width="9" height="9" /><rect x="13" y="2" width="9" height="9" /><rect x="2" y="13" width="9" height="9" /><rect x="13" y="13" width="9" height="9" /></svg>
            Enterprise SSO — SAML 2.0
          </button>

          <div className="form-divider">OR</div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <GoogleLoginButton
              onSuccess={(userInfo) => {
                console.log('Logged in with Google:', userInfo);
                // Trigger your existing login flow
                onLogin();
                
                // Optional: Store user info
                localStorage.setItem('googleUser', JSON.stringify(userInfo));
              }}
              onError={() => alert('Google sign-in failed. Please try again.')}
            />
          </div>
          <div className="form-footer">
            <div className="form-security">
              <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              256-bit AES encrypted
            </div>
            <div className="form-version">Radon Intelligence v3.0.0</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   LOADER PAGE
══════════════════════════════════════ */
function LoaderPage({ onDone }: LoaderPageProps) {
  const scanRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLDivElement>(null)
  const lineRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]

  useEffect(() => {
    if (scanRef.current) scanRef.current.style.animation = 'ldScan 1.6s ease-in-out infinite'
    setTimeout(() => { if (logoRef.current) logoRef.current.style.animation = 'ldLogoUp .6s cubic-bezier(.16,1,.3,1) forwards' }, 300)
    setTimeout(() => { if (subRef.current) subRef.current.style.animation = 'ldSubUp .5s cubic-bezier(.16,1,.3,1) forwards' }, 750)

    const thresholds = [15, 30, 55, 75, 92]
    let pct = 0
    const iv = setInterval(() => {
      pct = Math.min(pct + (Math.random() * 7 + 3), 100)
      if (fillRef.current) fillRef.current.style.width = `${pct}%`
      if (pctRef.current) pctRef.current.textContent = `${Math.floor(pct)}%`
      thresholds.forEach((threshold, i) => {
        const ref = lineRefs[i]
        if (pct >= threshold && ref.current) ref.current.classList.add('vis')
      })
      if (pct >= 100) {
        clearInterval(iv)
        setTimeout(() => onDone(), 400)
      }
    }, 80)

    return () => clearInterval(iv)
  }, [onDone])

  return (
    <div id="page-loader" className="active">
      <div className="ld-scan-bar" ref={scanRef}></div>
      <div className="ld-logo"><div className="ld-logo-inner" ref={logoRef}>RADON</div></div>
      <div className="ld-sub"><div className="ld-sub-inner" ref={subRef}>INTELLIGENCE — INITIALISING</div></div>
      <div className="ld-bar"><div className="ld-fill" ref={fillRef}></div></div>
      <div className="ld-pct" ref={pctRef}>0%</div>
      <div className="ld-lines" style={{ position: 'relative', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
        {['▸ CONNECTING TO ANTIGRAVITY BACKEND...', '▸ LOADING NEOGUARD ENGINE v4.1...', '▸ INITIALISING CENTRAL AI AGENT...', '▸ SYNCING LIVE TRANSACTION FEED...', '▸ ALL SYSTEMS NOMINAL. LAUNCHING...'].map((line, i) => (
          <div key={i} className="ld-line" ref={lineRefs[i]}>{line}</div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   D3 CHARTS
══════════════════════════════════════ */
declare const d3: any

function buildFraudGraph() {
  const d3l = (window as any).d3
  if (!d3l) return
  const svg = d3l.select('#fraud-graph')
  const nodeEl = svg.node()
  const W = nodeEl?.parentElement?.clientWidth || 600
  const H = 200
  svg.attr('width', W).attr('height', H)
  const nodes = [
    { id: 'RING-A', type: 'ring' }, { id: 'RING-B', type: 'ring' }, { id: 'RING-C', type: 'ring' },
    { id: 'ACC-01', type: 'acc' }, { id: 'ACC-02', type: 'acc' }, { id: 'ACC-03', type: 'acc' },
    { id: 'ACC-04', type: 'acc' }, { id: 'ACC-05', type: 'acc' }, { id: 'ACC-06', type: 'acc' },
    { id: 'MER-X', type: 'mer' }, { id: 'MER-Y', type: 'mer' },
    { id: 'DEV-1', type: 'dev' }, { id: 'DEV-2', type: 'dev' },
  ]
  const links = [
    { source: 'RING-A', target: 'ACC-01' }, { source: 'RING-A', target: 'ACC-02' }, { source: 'RING-A', target: 'ACC-03' },
    { source: 'RING-B', target: 'ACC-04' }, { source: 'RING-B', target: 'ACC-05' },
    { source: 'RING-C', target: 'ACC-06' }, { source: 'RING-A', target: 'RING-B' },
    { source: 'ACC-01', target: 'MER-X' }, { source: 'ACC-04', target: 'MER-X' }, { source: 'ACC-02', target: 'MER-Y' },
    { source: 'ACC-03', target: 'DEV-1' }, { source: 'ACC-05', target: 'DEV-2' }, { source: 'ACC-06', target: 'DEV-1' },
    { source: 'RING-B', target: 'RING-C' },
  ]
  const col: Record<string, string> = { ring: '#f87171', acc: '#60a5fa', mer: '#fbbf24', dev: '#8b5cf6' }
  const sz: Record<string, number> = { ring: 10, acc: 6, mer: 8, dev: 6 }
  svg.append('defs').append('marker').attr('id', 'arr').attr('viewBox', '0 -4 8 8').attr('refX', 14).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto').append('path').attr('d', 'M0,-4L8,0L0,4').attr('fill', 'rgba(96,165,250,.3)')
  const sim = d3l.forceSimulation(nodes).force('link', d3l.forceLink(links).id((d: any) => d.id).distance(55).strength(.6)).force('charge', d3l.forceManyBody().strength(-120)).force('center', d3l.forceCenter(W / 2, H / 2)).force('collision', d3l.forceCollide(18))
  const link = svg.append('g').selectAll('line').data(links).join('line').attr('stroke', 'rgba(96,165,250,.18)').attr('stroke-width', 1).attr('marker-end', 'url(#arr)')
  const node = svg.append('g').selectAll('circle').data(nodes).join('circle').attr('r', (d: any) => sz[d.type]).attr('fill', (d: any) => col[d.type] + '33').attr('stroke', (d: any) => col[d.type]).attr('stroke-width', 1.2).style('cursor', 'none')
  const label = svg.append('g').selectAll('text').data(nodes).join('text').attr('class', 'node-label').text((d: any) => d.id).attr('dy', -10)
  sim.on('tick', () => {
    link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y).attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)
    node.attr('cx', (d: any) => Math.max(12, Math.min(W - 12, d.x))).attr('cy', (d: any) => Math.max(12, Math.min(H - 12, d.y)))
    label.attr('x', (d: any) => Math.max(12, Math.min(W - 12, d.x))).attr('y', (d: any) => Math.max(12, Math.min(H - 12, d.y)))
  })
  setInterval(() => {
    svg.selectAll('circle').filter((d: any) => d.type === 'ring').transition().duration(600).attr('r', 12).attr('stroke-opacity', .9).transition().duration(600).attr('r', 10).attr('stroke-opacity', .5)
  }, 2000)
}

function buildRiskBars() {
  const d3l = (window as any).d3
  if (!d3l) return
  const vals = [30, 45, 62, 90, 70, 52, 88, 38, 55, 33, 95, 44, 60, 48, 72, 35, 65, 50]
  const svg = d3l.select('#risk-bar-svg')
  const nodeEl = svg.node()
  const W = nodeEl?.parentElement?.clientWidth || 300
  const H = 80
  svg.attr('width', W).attr('height', H)
  const x = d3l.scaleBand().domain(d3l.range(vals.length)).range([0, W]).padding(.15)
  const y = d3l.scaleLinear().domain([0, 100]).range([H - 2, 2])
  svg.selectAll('rect').data(vals).join('rect').attr('x', (_: any, i: number) => x(i)).attr('width', x.bandwidth()).attr('y', H - 2).attr('height', 0).attr('fill', (d: number) => d >= 85 ? 'rgba(96,165,250,.5)' : 'rgba(59,130,246,.18)').attr('stroke', (d: number) => d >= 85 ? 'rgba(96,165,250,.7)' : 'rgba(59,130,246,.25)').attr('stroke-width', .5).transition().duration(1200).delay((_: any, i: number) => i * 50).attr('y', (d: number) => y(d)).attr('height', (d: number) => H - 2 - y(d))
}

function buildHeatmap() {
  const d3l = (window as any).d3
  if (!d3l) return
  const merchants = ['MER-A', 'MER-B', 'MER-C', 'MER-D', 'MER-E']
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const data: any[] = []
  merchants.forEach(m => hours.forEach(h => { data.push({ m, h, v: Math.random() > 0.7 ? Math.random() : .05 + Math.random() * .3 }) }))
  const svg = d3l.select('#heatmap-canvas')
  const nodeEl = svg.node()
  const W = nodeEl?.parentElement?.clientWidth || 800, H = 120
  const ml = 60, mr = 10, mt = 8, mb = 20
  svg.attr('width', W).attr('height', H)
  const g = svg.append('g').attr('transform', `translate(${ml},${mt})`)
  const w = W - ml - mr, h = H - mt - mb
  const x = d3l.scaleBand().domain(hours).range([0, w]).padding(.05)
  const y = d3l.scaleBand().domain(merchants).range([0, h]).padding(.08)
  const col = d3l.scaleSequential(d3l.interpolate('rgba(59,130,246,.05)', 'rgba(248,113,113,.9)')).domain([0, 1])
  g.append('g').attr('transform', `translate(0,${h})`).call(d3l.axisBottom(x).tickSize(0).tickFormat((d: any) => d % 4 === 0 ? d + 'h' : '')).call((ax: any) => { ax.select('.domain').remove(); ax.selectAll('text').attr('fill', '#4a5568').attr('font-family', 'Space Mono,monospace').attr('font-size', 7) })
  g.append('g').call(d3l.axisLeft(y).tickSize(0)).call((ax: any) => { ax.select('.domain').remove(); ax.selectAll('text').attr('fill', '#4a5568').attr('font-family', 'Space Mono,monospace').attr('font-size', 8) })
  g.selectAll('rect').data(data).join('rect').attr('x', (d: any) => x(d.h)).attr('y', (d: any) => y(d.m)).attr('width', x.bandwidth()).attr('height', y.bandwidth()).attr('fill', 'rgba(0,0,0,0)').attr('rx', 1).transition().duration(800).delay((_: any, i: number) => i * 2).attr('fill', (d: any) => col(d.v))
}

/* ══════════════════════════════════════
   AGENT CHAT COMPONENT
══════════════════════════════════════ */
const agentSystemPrompt = `You are Radon Central Agent — the AI intelligence layer of the Radon Enterprise BI platform. You help enterprise operators understand fraud data, revenue metrics, and business performance.

Your persona:
- Concise, precise, enterprise-grade
- Use data-driven language — cite numbers, percentages, trends
- Format responses with structure when showing data (use ASCII charts or tables)
- Reference the platform's modules: NeoGuard (fraud detection), Central Agent (this), Analytics
- Current simulated data: 12,400 TX/sec, 99.2% accuracy, $142K protected today, 3 active fraud rings, Q1 revenue EMEA $4.2M, AMER $3.8M, APAC $2.9M, LATM $1.9M

Keep responses under 120 words. Be sharp and direct. Never mention you are Claude.`

interface Message {
  role: 'user' | 'agent'
  text: string
}

function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', text: '<strong>Radon v3.0</strong> — connected to Antigravity backend. Ask me anything about your enterprise data, fraud activity, or request a workflow.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('Online — ready')
  const msgsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [messages])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    setStatus('Thinking...')

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: agentSystemPrompt,
          messages: [{ role: 'user', content: msg }]
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Unable to retrieve data.'
      
      // Typewriter simulation
      let current = ''
      const words = reply.split(' ')
      setMessages(prev => [...prev, { role: 'agent', text: '<strong>Radon</strong> — ' }])
      
      for(let i=0; i<words.length; i++) {
        await new Promise(r => setTimeout(r, 40 + Math.random() * 30))
        current += words[i] + ' '
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'agent', text: `<strong>Radon</strong> — ${current.replace(/\n/g, '<br>')}` }
          return next
        })
      }
    } catch {
      setMessages(prev => [...prev, { role: 'agent', text: '<strong>Error</strong> — Backend connection failed. Running in demo mode.' }])
    }

    setLoading(false)
    setStatus('Online — ready')
  }

  const chips = ['Show Q1 revenue by region', 'Summarise active fraud rings', 'Top 5 flagged merchants today', 'Morning executive briefing']

  return (
    <div className="ag-chat">
      <div className="ag-head">
        <div className="ag-av">R</div>
        <div>
          <div className="ag-nm">Radon Central Agent</div>
          <div className={`ag-st${loading ? ' thinking' : ''}`}>{status}</div>
        </div>
      </div>
      <div className="ag-suggestions">
        {chips.map(c => (
          <button key={c} className="ag-chip" onClick={() => send(c)}>{c}</button>
        ))}
      </div>
      <div className="ag-msgs" ref={msgsRef}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`msg ${m.role === 'user' ? 'mu' : 'ma'}`}
            style={{ opacity: 1, transition: 'opacity .3s' }}
            dangerouslySetInnerHTML={{ __html: m.text }}
          />
        ))}
        {loading && (
          <div className="msg ma">
            <span className="dots"><span></span><span></span><span></span></span>
          </div>
        )}
      </div>
      <div className="ag-in">
        <input
          className="ag-inp"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask Radon anything..."
        />
        <button className="ag-send" onClick={() => send()} disabled={loading}>Send ↗</button>
      </div>
    </div>
  )
}

interface CommandDeckProps {
  open: boolean
  onClose: () => void
  onNavigate: (page: string) => void
}

function CommandDeck({ open, onClose, onNavigate }: CommandDeckProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  if (!open) return null

  const jumpToSection = (id: string) => {
    window.dispatchEvent(new CustomEvent('radon:jump-section', { detail: id }))
    onClose()
  }

  const actions = [
    { label: 'Operations Overview', meta: 'Live dashboard', action: () => jumpToSection('dash-sec') },
    { label: 'NeoGuard Briefing', meta: 'Threat intelligence', action: () => jumpToSection('neoguard-sec') },
    { label: 'Central Agent', meta: 'Conversational control', action: () => jumpToSection('agent') },
    { label: 'Analytics Suite', meta: 'Module page', action: () => { onNavigate('analytics'); onClose() } },
    { label: 'CRM Workspace', meta: 'Module page', action: () => { onNavigate('crm'); onClose() } },
    { label: 'ERP Workspace', meta: 'Module page', action: () => { onNavigate('erp'); onClose() } },
    { label: 'Email Engine', meta: 'Module page', action: () => { onNavigate('email'); onClose() } },
    { label: 'NeoGuard Module', meta: 'Module page', action: () => { onNavigate('neoguard'); onClose() } },
  ]

  return (
    <div className="command-deck-backdrop" onClick={onClose}>
      <div className="command-deck" role="dialog" aria-modal="true" aria-label="Command deck" onClick={e => e.stopPropagation()}>
        <div className="command-deck-header">
          <div>
            <div className="command-deck-eyebrow">Mission Control</div>
            <h3>Jump anywhere in Radon.</h3>
          </div>
          <button className="command-close" onClick={onClose} aria-label="Close command deck">Close</button>
        </div>
        <div className="command-status-grid">
          {[
            ['Priority alerts', '03'],
            ['Protected today', '$142K'],
            ['Active agents', '07'],
          ].map(([label, value]) => (
            <div className="command-status-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <div className="command-action-grid">
          {actions.map(item => (
            <button key={item.label} className="command-action" onClick={item.action}>
              <span>{item.label}</span>
              <small>{item.meta}</small>
            </button>
          ))}
        </div>
        <div className="command-deck-footer">Press <kbd>Esc</kbd> to close. Use <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>K</kbd> to reopen.</div>
      </div>
    </div>
  )
}


/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
function MainPage({ onLogout, onNavigate, onOpenCommandDeck, disableAmbientEffects }: MainPageProps) {
  const mainRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const txListRef = useRef<HTMLDivElement>(null)
  const m1Ref = useRef<HTMLDivElement>(null)
  const s1Ref = useRef<HTMLDivElement>(null)
  const s2Ref = useRef<HTMLDivElement>(null)
  const s3Ref = useRef<HTMLDivElement>(null)
  const s4Ref = useRef<HTMLDivElement>(null)
  const alertListRef = useRef<HTMLDivElement>(null)
  const intervalsRef = useRef<NodeJS.Timeout[]>([])

  const navScroll = (id: string) => {
    const el = document.getElementById(id)
    if (el && mainRef.current) {
      mainRef.current.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' })
    }
  }

  // Hero animations
  useEffect(() => {
    const anim = (id: string, kf: string, delay: number) => {
      const el = document.getElementById(id)
      if (el) el.style.animation = `${kf} .7s ${delay}s cubic-bezier(.16,1,.3,1) forwards`
    }
    anim('h-tag', 'hTag', 0.1)
    anim('hw1', 'hWord', 0.3)
    anim('hw2', 'hWord', 0.55)
    setTimeout(() => {
      const l = document.getElementById('h-line')
      if (l) l.style.animation = 'hLine .8s ease forwards'
    }, 900)
    setTimeout(() => anim('h-sub', 'hFade', 0), 1000)
    setTimeout(() => anim('h-actions', 'hFade', 0), 1200)
    setTimeout(() => anim('h-stats', 'hFade', 0), 1450)

    setTimeout(() => {
      countUp(s1Ref.current, 12400, '', 2000)
      countUp(s2Ref.current, 847, '', 2200)
      countUp(s3Ref.current, 99, '%', 1800)
      countUp(s4Ref.current, 142, 'K', 2000, '$')
    }, 400)
  }, [])

  // Scroll reveal + nav
  useEffect(() => {
    const onScroll = () => {
      const main = mainRef.current
      if (!main) return
      const h = main.clientHeight
      main.querySelectorAll('.reveal').forEach((el: any) => {
        if (el.getBoundingClientRect().top < h - 60) el.classList.add('in')
      })
      if (navRef.current) navRef.current.classList.toggle('scrolled', main.scrollTop > 60)
    }
    const m = mainRef.current
    m?.addEventListener('scroll', onScroll)
    setTimeout(onScroll, 200)
    return () => m?.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onJump = (event: Event) => {
      const id = (event as CustomEvent<string>).detail
      if (id) navScroll(id)
    }

    window.addEventListener('radon:jump-section', onJump)
    return () => window.removeEventListener('radon:jump-section', onJump)
  }, [])

  // Live TX feed + intervals
  useEffect(() => {
    const txData = [['$780', 's'], ['$31,200', 'f'], ['$1,450', 's'], ['$990', 'r'], ['$670', 's'], ['$8,900', 'f'], ['$2,100', 's'], ['$450', 'r'], ['$5,500', 'f'], ['$320', 's']]
    let ti = 0
    let tnum = 8830
    const iv1 = setInterval(() => {
      const list = txListRef.current
      if (!list) return
      const [amt, type] = txData[ti % txData.length]
      const cls = type === 's' ? 'bs' : type === 'f' ? 'bf' : 'br'
      const lbl = type === 's' ? 'SAFE' : type === 'f' ? 'FLAGGED' : 'REVIEW'
      const row = document.createElement('div')
      row.className = 'tx-r'
      row.style.opacity = '0'
      row.style.transition = 'opacity .4s'
      row.innerHTML = `<span class="tx-id">#TX-${tnum++}</span><span class="tx-amt">${amt}</span><span class="bd ${cls}">${lbl}</span>`
      list.prepend(row)
      requestAnimationFrame(() => { row.style.opacity = '1' })
      if (list.children.length > 6) list.removeChild(list.lastChild as Node)
      ti++
    }, 2000)

    let m1v = 4821
    const iv2 = setInterval(() => {
      m1v += Math.round((Math.random() - 0.47) * 55)
      if (m1Ref.current) m1Ref.current.textContent = m1v.toLocaleString()
    }, 1800)

    // Alert feed
    const alertPool = [
      { sev: 'high', msg: 'RING-4472 detected — 8 accounts linked' },
      { sev: 'med', msg: 'Unusual velocity: TX cluster #9910' },
      { sev: 'low', msg: 'New device cluster identified' },
      { sev: 'high', msg: 'Cross-border anomaly — 3 regions' },
      { sev: 'med', msg: 'Merchant ID spoofing suspected' },
      { sev: 'low', msg: 'GNN edge weight threshold crossed' },
    ]
    let aIdx = 0
    const iv3 = setInterval(() => {
      const list = alertListRef.current
      if (!list) return
      const a = alertPool[aIdx % alertPool.length]
      const now = new Date()
      const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      const row = document.createElement('div')
      row.className = `alert-item ${a.sev}`
      row.style.opacity = '0'
      row.style.transition = 'opacity .4s'
      row.innerHTML = `<span class="alert-time">${ts}</span><span class="alert-msg">${a.msg}</span><span class="alert-badge ${a.sev}">${a.sev.toUpperCase()}</span>`
      list.prepend(row)
      requestAnimationFrame(() => { row.style.opacity = '1' })
      if (list.children.length > 8) list.removeChild(list.lastChild as Node)
      aIdx++
    }, 4000)

    intervalsRef.current = [iv1, iv2, iv3]
    return () => intervalsRef.current.forEach(clearInterval)
  }, [])

  // D3 charts
  useEffect(() => {
    const t = setTimeout(() => {
      buildFraudGraph()
      buildRiskBars()
      buildHeatmap()

      document.querySelectorAll('#xai-bars .xai-bar').forEach((bar: any) => {
        const w = bar.dataset.w
        if (w) setTimeout(() => { bar.style.width = `${w}%` }, 200)
      })
    }, 800)
    return () => clearTimeout(t)
  }, [])

  // Cursor hover effects
  useEffect(() => {
    const bind = () => {
      document.querySelectorAll('a,button,input,.mod-card,.d-item,.ag-chip,.mod-tab').forEach((el: any) => {
        if (el._c) return
        el._c = true
        el.addEventListener('mouseenter', () => {
          const cur = document.getElementById('cur')
          const trail = document.getElementById('cur-trail')
          if (cur) cur.classList.add('big')
          if (trail) trail.style.opacity = '0'
        })
        el.addEventListener('mouseleave', () => {
          const cur = document.getElementById('cur')
          const trail = document.getElementById('cur-trail')
          if (cur) cur.classList.remove('big')
          if (trail) trail.style.opacity = '1'
        })
      })
    }
    bind()
    const obs = new MutationObserver(bind)
    obs.observe(document.body, { childList: true, subtree: true })
    return () => obs.disconnect()
  }, [])

  return (
    <div id="page-main" className="active" ref={mainRef}>
      <nav id="site-nav" ref={navRef}>
        <a className="n-logo" href="#"><span className="grad">RAD</span><span className="dot">·</span><span className="grad">ON</span></a>
        <ul className="n-links">
          <li><a href="#" onClick={e => { e.preventDefault(); onNavigate('erp') }}>ERP</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); onNavigate('crm') }}>CRM</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); onNavigate('analytics') }}>Analytics</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); onNavigate('email') }}>Email</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); onNavigate('neoguard') }}>NeoGuard</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); onNavigate('ai-agent') }}>AI Agent</a></li>
        </ul>
        <div className="n-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="n-command" onClick={onOpenCommandDeck}><span>Mission Control</span><span className="n-command-key">Ctrl+K</span></button>
          <div className="n-news">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--muted)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div className="n-news-count">3</div>
          </div>
          <div className="n-badge"><div className="live-dot"></div>LIVE</div>
          <button className="n-cta" onClick={onLogout}><span>Log Out</span></button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <ParticleField disabled={disableAmbientEffects} />
        <div className="h-grid"></div>
        <div className="h-orb h-orb1"></div>
        <div className="h-orb h-orb2"></div>
        <div className="h-orb h-orb3"></div>
        <div className="h-tag" id="h-tag">Enterprise Intelligence Platform — 2026</div>
        <div className="h-title">
          <div className="h-word"><span className="h-word-inner glitch" id="hw1">RADON</span></div>
          <div className="h-word"><span className="h-word-inner" id="hw2">INTELLIGENCE</span></div>
        </div>
        <div className="h-line" id="h-line"></div>
        <p className="h-sub" id="h-sub">Real-time fraud elimination, AI-powered communications, and conversational enterprise control — powered by <em>NeoGuard</em>, <em>Email Engine</em>, and the <em>Central AI Agent</em>.</p>
        <div className="h-actions" id="h-actions">
          <button className="btn-p" onClick={() => navScroll('dash-sec')}><span>Enter Dashboard ↗</span></button>
          <button className="btn-g" onClick={() => navScroll('modules')}>Explore Platform</button>
        </div>
        <div className="h-stats" id="h-stats">
          <div className="stat"><div className="stat-n" ref={s1Ref}>0</div><div className="stat-l">Transactions / sec</div></div>
          <div className="stat"><div className="stat-n" ref={s2Ref}>0</div><div className="stat-l">Fraud rings stopped</div></div>
          <div className="stat"><div className="stat-n" ref={s3Ref}>0%</div><div className="stat-l">Detection accuracy</div></div>
          <div className="stat"><div className="stat-n" ref={s4Ref}>$0</div><div className="stat-l">Protected today</div></div>
        </div>
      </section>

      <div className="diag" style={{ background: 'var(--s1)' }}></div>

      {/* MODULES */}
      <section id="modules" style={{ background: 'var(--s1)' }}>
        <div className="sec-top reveal">
          <div>
            <div className="sec-tag">Core modules</div>
            <h2 className="sec-h">Four engines.<br />One platform.</h2>
            <div className="tick-line"></div>
          </div>
          <p className="sec-sub">Every capability you need to protect revenue and command your enterprise — unified in one interface.</p>
        </div>
        <div className="mod-grid reveal reveal-d1">
          <div className="mod-card" onClick={() => onNavigate('neoguard')} style={{ cursor: 'pointer' }}>
            <div className="mc-num">01</div>
            <div className="mc-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg></div>
            <div className="mc-tag">Module 01</div>
            <div className="mc-name">NeoGuard</div>
            <div className="mc-desc">Real-time fraud detection powered by Temporal Transformers and Dynamic Graph Neural Networks. Identifies coordinated fraud rings across accounts, devices, and merchants in milliseconds.</div>
            <div className="mc-feats">
              <div className="mc-feat"><div className="mc-dot"></div>Temporal Transformer — behavioural anomaly detection</div>
              <div className="mc-feat"><div className="mc-dot"></div>Dynamic GNN — fraud ring graph discovery</div>
              <div className="mc-feat"><div className="mc-dot"></div>XAI risk heatmaps + SHAP/DiCE-ML rationale</div>
              <div className="mc-feat"><div className="mc-dot"></div>Sub-50ms scoring at enterprise scale</div>
            </div>
          </div>
          <div className="mod-card" onClick={() => onNavigate('email')} style={{ cursor: 'pointer' }}>
            <div className="mc-num">02</div>
            <div className="mc-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg></div>
            <div className="mc-tag">Module 02</div>
            <div className="mc-name">Email Engine</div>
            <div className="mc-desc">AI-powered email management with smart categorization, priority scoring, sentiment analysis, and automated action extraction. Never miss an important message again.</div>
            <div className="mc-feats">
              <div className="mc-feat"><div className="mc-dot" style={{ background: 'var(--vio)' }}></div>AI summarization & priority scoring</div>
              <div className="mc-feat"><div className="mc-dot" style={{ background: 'var(--vio)' }}></div>Smart categorization & sentiment analysis</div>
              <div className="mc-feat"><div className="mc-dot" style={{ background: 'var(--vio)' }}></div>Auto action item extraction</div>
              <div className="mc-feat"><div className="mc-dot" style={{ background: 'var(--vio)' }}></div>Intelligent reply suggestions</div>
            </div>
          </div>
          <div className="mod-card" onClick={() => onNavigate('main')} style={{ cursor: 'pointer' }}>
            <div className="mc-num">03</div>
            <div className="mc-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg></div>
            <div className="mc-tag">Module 03</div>
            <div className="mc-name">Central Agent</div>
            <div className="mc-desc">A single conversational interface that commands your entire enterprise stack — CRM, ERP, analytics, workflows. Speak to your business in plain language and watch it execute.</div>
            <div className="mc-feats">
              <div className="mc-feat"><div className="mc-dot" style={{ background: '#f59e0b' }}></div>Natural language → SQL → live charts</div>
              <div className="mc-feat"><div className="mc-dot" style={{ background: '#f59e0b' }}></div>Multi-agent LangGraph orchestration</div>
              <div className="mc-feat"><div className="mc-dot" style={{ background: '#f59e0b' }}></div>Human-in-the-loop approval gates</div>
              <div className="mc-feat"><div className="mc-dot" style={{ background: '#f59e0b' }}></div>Morning executive intelligence briefing</div>
            </div>
          </div>
          <div className="mod-card" onClick={() => onNavigate('analytics')} style={{ cursor: 'pointer' }}>
            <div className="mc-num">04</div>
            <div className="mc-icon"><svg viewBox="0 0 24 24"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg></div>
            <div className="mc-tag">Module 04</div>
            <div className="mc-name">Analytics</div>
            <div className="mc-desc">Deep business intelligence with real-time KPIs, revenue attribution, cohort analysis, and predictive forecasting. Turn data into decisions, automatically.</div>
            <div className="mc-feats">
              <div className="mc-feat"><div className="mc-dot" style={{ background: 'var(--cyan)' }}></div>Real-time revenue tracking &amp; attribution</div>
              <div className="mc-feat"><div className="mc-dot" style={{ background: 'var(--cyan)' }}></div>Cohort analysis &amp; retention metrics</div>
              <div className="mc-feat"><div className="mc-dot" style={{ background: 'var(--cyan)' }}></div>Predictive modeling &amp; trend forecasting</div>
              <div className="mc-feat"><div className="mc-dot" style={{ background: 'var(--cyan)' }}></div>Automated anomaly detection &amp; alerts</div>
            </div>
          </div>
        </div>
      </section>

      <div className="diag diag-rev" style={{ background: 'var(--bg)', marginTop: '-1px' }}></div>

      {/* DASHBOARD */}
      <section id="dash-sec" style={{ background: 'var(--bg)' }}>
        <div style={{ padding: '5rem 3.5rem 6rem' }}>
          <div className="sec-top reveal">
            <div>
              <div className="sec-tag">Live interface</div>
              <h2 className="sec-h">The command centre.</h2>
              <div className="tick-line"></div>
            </div>
            <p className="sec-sub">Real-time operations overview. Every metric, every transaction, every threat — one screen.</p>
          </div>
          <div className="dash-wrap reveal reveal-d1">
            <div className="dash-chrome">
              <div className="dash-chrome-bar">
                <div className="chrome-dot" style={{ background: '#f87171' }}></div>
                <div className="chrome-dot" style={{ background: '#fbbf24' }}></div>
                <div className="chrome-dot" style={{ background: '#34d399' }}></div>
                <div className="chrome-title">Radon Intelligence — v3.0.0 — Operations Overview</div>
                <div className="chrome-title" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}><div className="live-dot"></div>LIVE</div>
              </div>
              <div className="dash-body">
                <div className="d-side">
                  <div className="d-side-logo">RADON</div>
                  <div className="d-nav">
                    {[['Overview', true], ['NeoGuard', false], ['Fraud Graph', false], ['AI Agent', false], ['Analytics', false], ['Workflows', false]].map(([label, active]) => (
                      <div key={label as string} className={`d-item${active ? ' on' : ''}`}><div className="d-dot"></div>{label as string}</div>
                    ))}
                    <div className="d-item" style={{ marginTop: '1.5rem' }}><div className="d-dot" style={{ background: 'var(--muted)' }}></div>Settings</div>
                  </div>
                </div>
                <div className="d-main">
                  <div className="d-topbar">
                    <div className="d-title">Operations Overview</div>
                    <div className="d-live"><div className="live-dot"></div>All systems nominal</div>
                  </div>
                  <div className="m-row">
                    <div className="m-cell"><div className="m-val blue" ref={m1Ref}>4,821</div><div className="m-lbl">Transactions / min</div><div className="m-chg">+12% vs avg</div></div>
                    <div className="m-cell"><div className="m-val red">3</div><div className="m-lbl">Active threats</div><div className="m-chg">2 new rings</div></div>
                    <div className="m-cell"><div className="m-val green">99.2%</div><div className="m-lbl">Detection accuracy</div><div className="m-chg">Model v4.1</div></div>
                    <div className="m-cell"><div className="m-val">$142K</div><div className="m-lbl">Protected today</div><div className="m-chg">+$18K last hr</div></div>
                  </div>
                  <div className="d-panels">
                    <div className="d-panel">
                      <div className="p-lbl">Live transactions<span className="p-live-tag"><div className="live-dot" style={{ width: '4px', height: '4px' }}></div>LIVE</span></div>
                      <div className="tx" ref={txListRef}>
                        {[['8821', '$2,340', 'bs', 'SAFE'], ['8820', '$890', 'bf', 'FLAGGED'], ['8819', '$12,100', 'br', 'REVIEW'], ['8818', '$440', 'bs', 'SAFE'], ['8817', '$5,670', 'bf', 'FLAGGED']].map(([num, amt, cls, lbl]) => (
                          <div key={num} className="tx-r"><span className="tx-id">#TX-{num}</span><span className="tx-amt">{amt}</span><span className={`bd ${cls}`}>{lbl}</span></div>
                        ))}
                      </div>
                    </div>
                    <div className="d-panel">
                      <div className="p-lbl">Risk score distribution — 24h</div>
                      <svg id="risk-bar-svg" width="100%" height="80"></svg>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '.52rem', color: 'var(--muted)', marginTop: '.5rem', letterSpacing: '.08em' }}>3 SPIKE EVENTS — RING FORMATION LIKELY</div>
                    </div>
                  </div>
                  <div style={{ padding: '.875rem', background: 'var(--s2)', borderTop: '1px solid rgba(96,165,250,.06)' }}>
                    <div className="p-lbl">Fraud ring network — live<span className="p-live-tag"><div className="live-dot" style={{ width: '4px', height: '4px' }}></div>LIVE</span></div>
                    <svg id="fraud-graph"></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="diag" style={{ background: 'var(--s1)' }}></div>

      {/* NEOGUARD */}
      <section id="neoguard-sec" style={{ background: 'var(--s1)' }}>
        <div className="sec-top reveal" style={{ maxWidth: '1100px', margin: '0 auto 0', padding: '5rem 0 0' }}>
          <div>
            <div className="sec-tag">Module 01</div>
            <h2 className="sec-h">NeoGuard<br />Deep Dive.</h2>
            <div className="tick-line"></div>
          </div>
          <p className="sec-sub">XAI risk heatmaps, fraud ring explorer, and real-time alert timeline.</p>
        </div>
        <div className="ng-grid reveal reveal-d1">
          <div className="ng-panel">
            <div className="ng-panel-title">XAI Feature Importance</div>
            <div className="xai-bars" id="xai-bars">
              {[
                ['Velocity spike', '92', '0.92', 'linear-gradient(to right,var(--elec),var(--vio))'],
                ['Device fingerprint', '78', '0.78', 'linear-gradient(to right,var(--elec),var(--vio))'],
                ['Geo anomaly', '71', '0.71', 'linear-gradient(to right,var(--elec),var(--vio))'],
                ['Time pattern', '64', '0.64', 'linear-gradient(to right,var(--cyan),var(--elec))'],
                ['Merchant mismatch', '55', '0.55', 'linear-gradient(to right,var(--cyan),var(--elec))'],
                ['Network centrality', '48', '0.48', 'linear-gradient(to right,var(--vio),var(--elec))']
              ].map(([label, w, val, bg]) => (
                <div key={label} className="xai-row">
                  <span className="xai-label">{label}</span>
                  <div className="xai-bar-wrap"><div className="xai-bar" style={{ width: 0, background: bg }} data-w={w}></div></div>
                  <span className="xai-val">{val}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.25rem', padding: '.75rem', background: 'rgba(59,130,246,.05)', border: '1px solid rgba(96,165,250,.1)', fontFamily: "'Space Mono',monospace", fontSize: '.58rem', color: 'var(--muted)', lineHeight: 1.7 }}>
              ▸ RISK SCORE: <span style={{ color: '#f87171', fontWeight: 700 }}>0.94 — HIGH RISK</span><br />
              ▸ RING ID: RING-4471 (14 nodes)<br />
              ▸ RECOMMENDED ACTION: <span style={{ color: 'var(--amber)' }}>BLOCK + ESCALATE</span>
            </div>
          </div>
          <div className="ng-panel">
            <div className="ng-panel-title">Alert Timeline</div>
            <div className="alert-list" ref={alertListRef}>
              {[
                ['14:32:01', 'RING-4471 — 14 accounts, $89K exposure', 'high'],
                ['14:28:45', 'Velocity anomaly — TX-8801 series', 'med'],
                ['14:21:18', 'New device fingerprint cluster', 'low'],
                ['13:58:33', 'RING-4468 — confirmed, 9 accounts', 'high'],
                ['13:44:07', 'GNN subgraph expansion — watch list', 'med'],
                ['13:30:52', 'Geo cluster: Mumbai → Singapore', 'low']
              ].map(([time, msg, sev]) => (
                <div key={time} className={`alert-item ${sev}`}>
                  <span className="alert-time">{time}</span>
                  <span className="alert-msg">{msg}</span>
                  <span className={`alert-badge ${sev}`}>{sev.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="ng-grid reveal reveal-d2" style={{ marginTop: '1px' }}>
          <div className="ng-panel" style={{ gridColumn: '1/-1' }}>
            <div className="ng-panel-title">Risk Heatmap — Merchant × Hour (24h)</div>
            <svg id="heatmap-canvas" height="120"></svg>
          </div>
        </div>
      </section>

      <div className="diag diag-rev" style={{ background: 'var(--bg)', marginTop: '-1px' }}></div>

      {/* AGENT */}
      <section id="agent" style={{ background: 'var(--bg)', padding: '5rem 3.5rem' }}>
        <div className="ag-split">
          <div className="reveal">
            <div className="sec-tag">Central AI Agent</div>
            <h2 className="sec-h">Your enterprise,<br />on command.</h2>
            <div className="tick-line"></div>
            <p style={{ color: 'var(--muted)', fontSize: '.88rem', lineHeight: 1.8, marginBottom: '2rem' }}>Ask Radon anything about your business. It queries, analyses, orchestrates, and explains — in plain language. No SQL. No dashboards. No waiting.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
              {['Natural language to live charts in one turn', 'Multi-step LangGraph workflow execution', 'Daily executive briefing — voice + text', 'Fraud ring replay and XAI explainer'].map(f => (
                <div key={f} className="mc-feat" style={{ fontSize: '.82rem' }}><div className="mc-dot"></div>{f}</div>
              ))}
            </div>
          </div>
          <div className="reveal reveal-d2">
            <AgentChat />
          </div>
        </div>
      </section>

      <div className="diag" style={{ background: 'var(--s1)' }}></div>
      
      <SiteFooter />
    </div>
  )
}

/* ══════════════════════════════════════
   COMPONENTS
══════════════════════════════════════ */
// Shared components moved to Components.tsx

/* ══════════════════════════════════════
   PAGES
══════════════════════════════════════ */


/* ══════════════════════════════════════
   APP ROOT
══════════════════════════════════════ */
function RouteFallback() {
  return (
    <div className="route-loading-shell">
      <div className="route-loading-card">
        <div className="route-loading-label">Loading module</div>
        <div className="route-loading-bar"><span></span></div>
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<'login' | 'loader' | 'main' | 'analytics' | 'crm' | 'erp' | 'neoguard' | 'email' | 'ai-agent'>('login')
  const [commandDeckOpen, setCommandDeckOpen] = useState(false)
  const flashRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const usesCoarsePointer = useMediaQuery('(pointer: coarse)')

  const doFlash = useCallback((cb: () => void) => {
    const f = flashRef.current
    if (f) {
      f.classList.add('on')
      setTimeout(() => {
        f.classList.remove('on')
        cb()
      }, 360)
    } else {
      cb()
    }
  }, [])

  const handleLogin = () => doFlash(() => setPage('loader'))
  const handleLoaderDone = () => doFlash(() => setPage('main'))
  const handleNavigate = (v: string) => {
    setCommandDeckOpen(false)
    doFlash(() => setPage(v as any))
  }
  const handleLogout = () => {
    setCommandDeckOpen(false)
    doFlash(() => {
      // Reset hero elements
      ['h-tag', 'h-sub', 'h-actions', 'h-stats'].forEach(id => {
        const el = document.getElementById(id)
        if (el) {
          el.style.animation = 'none'
          el.style.opacity = '0'
        }
      });
      ['hw1', 'hw2'].forEach(id => {
        const el = document.getElementById(id)
        if (el) {
          el.style.animation = 'none'
          el.style.transform = 'translateY(110%)'
        }
      })
      const hl = document.getElementById('h-line')
      if (hl) {
        hl.style.animation = 'none'
        hl.style.height = '0'
      }
      setPage('login')
    })
  }

  useEffect(() => {
    if (page !== 'main') return

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isTypingTarget = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      const isModifierShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'
      const isSlashShortcut = event.key === '/' && !isTypingTarget

      if (isModifierShortcut || isSlashShortcut) {
        event.preventDefault()
        setCommandDeckOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [page])

  useEffect(() => {
    document.body.classList.toggle('cursor-off', !usesCoarsePointer)
    document.body.classList.toggle('motion-reduced', prefersReducedMotion)
  }, [prefersReducedMotion, usesCoarsePointer])

  return (
    <>
      <Cursor disabled={usesCoarsePointer || prefersReducedMotion} />
      <div id="flash" ref={flashRef}></div>
      {page === 'login' && <LoginPage onLogin={handleLogin} />}
      {page === 'loader' && <LoaderPage onDone={handleLoaderDone} />}
      {page === 'main' && <MainPage onLogout={handleLogout} onNavigate={handleNavigate} onOpenCommandDeck={() => setCommandDeckOpen(true)} disableAmbientEffects={usesCoarsePointer || prefersReducedMotion} />}
      <Suspense fallback={<RouteFallback />}>
        {page === 'analytics' && <AnalyticsPage onLogout={handleLogout} onNavigate={handleNavigate} />}
        {page === 'crm' && <CRMPage onLogout={handleLogout} onNavigate={handleNavigate} />}
        {page === 'erp' && <ERPPage onLogout={handleLogout} onNavigate={handleNavigate} />}
        {page === 'neoguard' && <NeoGuardPage onNavigate={handleNavigate} onLogout={handleLogout} />}
        {page === 'email' && <EmailEnginePage onNavigate={handleNavigate} onLogout={handleLogout} />}
        {page === 'ai-agent' && <AIAgentPage onNavigate={handleNavigate} onLogout={handleLogout} />}
      </Suspense>
      {page === 'main' && <CommandDeck open={commandDeckOpen} onClose={() => setCommandDeckOpen(false)} onNavigate={handleNavigate} />}
      <Suspense fallback={null}>
        <MistralChatbot />
        <AgentDashboard />
      </Suspense>
    </>
  )
}
