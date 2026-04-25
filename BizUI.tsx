import type { ReactNode, CSSProperties } from 'react'

/* ══════════════════════════════════════
   ICONS — minimal stroke set (Lucide-like)
══════════════════════════════════════ */
const svg = (children: ReactNode, props: any = {}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
)

export const Icon = {
  dashboard: (p: any = {}) =>
    svg(
      <>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </>,
      p
    ),
  target: (p: any = {}) =>
    svg(
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
      </>,
      p
    ),
  users: (p: any = {}) =>
    svg(
      <>
        <path d="M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="3.5" />
        <path d="M22 19v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>,
      p
    ),
  building: (p: any = {}) =>
    svg(
      <>
        <rect x="4" y="3" width="16" height="18" rx="1.5" />
        <line x1="9" y1="8" x2="9" y2="8" />
        <line x1="15" y1="8" x2="15" y2="8" />
        <line x1="9" y1="13" x2="9" y2="13" />
        <line x1="15" y1="13" x2="15" y2="13" />
        <path d="M10 21v-4h4v4" />
      </>,
      p
    ),
  calendar: (p: any = {}) =>
    svg(
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
      </>,
      p
    ),
  trendingUp: (p: any = {}) =>
    svg(
      <>
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </>,
      p
    ),
  dollar: (p: any = {}) =>
    svg(
      <>
        <line x1="12" y1="2" x2="12" y2="22" />
        <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </>,
      p
    ),
  box: (p: any = {}) =>
    svg(
      <>
        <path d="M21 8L12 3 3 8v8l9 5 9-5V8z" />
        <line x1="3" y1="8" x2="12" y2="13" />
        <line x1="21" y1="8" x2="12" y2="13" />
        <line x1="12" y1="13" x2="12" y2="21" />
      </>,
      p
    ),
  truck: (p: any = {}) =>
    svg(
      <>
        <rect x="1" y="6" width="13" height="11" rx="1" />
        <path d="M14 9h4l3 3v5h-7" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </>,
      p
    ),
  briefcase: (p: any = {}) =>
    svg(
      <>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </>,
      p
    ),
  factory: (p: any = {}) =>
    svg(
      <>
        <path d="M3 21V11l5 3V11l5 3V8l8 4v9z" />
        <line x1="8" y1="17" x2="8" y2="17" />
        <line x1="13" y1="17" x2="13" y2="17" />
        <line x1="18" y1="17" x2="18" y2="17" />
      </>,
      p
    ),
  search: (p: any = {}) =>
    svg(
      <>
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>,
      p
    ),
  plus: (p: any = {}) =>
    svg(
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>,
      p
    ),
  close: (p: any = {}) =>
    svg(
      <>
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </>,
      p
    ),
  arrowUp: (p: any = {}) =>
    svg(
      <>
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </>,
      p
    ),
  arrowDown: (p: any = {}) =>
    svg(
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
      </>,
      p
    ),
  phone: (p: any = {}) =>
    svg(
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
      p
    ),
  mail: (p: any = {}) =>
    svg(
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <polyline points="3 7 12 13 21 7" />
      </>,
      p
    ),
  meeting: (p: any = {}) =>
    svg(
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
      </>,
      p
    ),
  task: (p: any = {}) =>
    svg(
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <polyline points="9 12 11 14 15 10" />
      </>,
      p
    ),
  chart: (p: any = {}) =>
    svg(
      <>
        <line x1="4" y1="20" x2="4" y2="10" />
        <line x1="10" y1="20" x2="10" y2="4" />
        <line x1="16" y1="20" x2="16" y2="13" />
        <line x1="22" y1="20" x2="22" y2="7" />
      </>,
      p
    ),
  spark: (p: any = {}) =>
    svg(
      <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z" />,
      p
    ),
  filter: (p: any = {}) =>
    svg(
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
      p
    ),
}

/* ══════════════════════════════════════
   PLOTLY DARK LAYOUT HELPER
══════════════════════════════════════ */
export const chartLayout = (title: string, extra: any = {}) => ({
  title: {
    text: title,
    font: { color: '#e8eaf6', size: 13, family: "'Syne', sans-serif", weight: 600 },
    x: 0,
    xanchor: 'left',
    y: 0.96,
  },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { family: "'Inter', sans-serif", color: '#94a3b8', size: 11 },
  margin: { t: 50, r: 20, l: 50, b: 40 },
  xaxis: {
    gridcolor: 'rgba(96,165,250,0.06)',
    zerolinecolor: 'rgba(96,165,250,0.1)',
    tickfont: { color: '#94a3b8' },
    linecolor: 'rgba(96,165,250,0.1)',
  },
  yaxis: {
    gridcolor: 'rgba(96,165,250,0.06)',
    zerolinecolor: 'rgba(96,165,250,0.1)',
    tickfont: { color: '#94a3b8' },
    linecolor: 'rgba(96,165,250,0.1)',
  },
  legend: { font: { color: '#cbd5e1', size: 11 } },
  ...extra,
})

export const CHART_PALETTE = ['#60a5fa', '#a78bfa', '#22d3ee', '#34d399', '#fbbf24', '#f472b6', '#f87171']

/* ══════════════════════════════════════
   SHARED LAYOUT PRIMITIVES
══════════════════════════════════════ */

export type NavItemDef = {
  id: string
  label: string
  icon: keyof typeof Icon
}

export type NavSectionDef = {
  label?: string
  items: NavItemDef[]
}

export function BizSidebar({
  brand,
  subtitle,
  sections,
  active,
  onSelect,
}: {
  brand: string
  subtitle: string
  sections: NavSectionDef[]
  active: string
  onSelect: (id: string) => void
}) {
  return (
    <aside className="biz-side">
      <div className="biz-side-head">
        <div className="biz-side-mark">
          <div className="biz-side-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
              <line x1="12" y1="2" x2="12" y2="22" />
            </svg>
          </div>
          <div>
            <div className="biz-side-title">{brand}</div>
            <div className="biz-side-sub">{subtitle}</div>
          </div>
        </div>
      </div>

      {sections.map((section, sIdx) => (
        <div className="biz-side-section" key={sIdx}>
          {section.label && <div className="biz-side-section-label">{section.label}</div>}
          <div className="biz-side-nav">
            {section.items.map((item) => {
              const IconCmp = Icon[item.icon]
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`biz-nav-item ${active === item.id ? 'active' : ''}`}
                >
                  <IconCmp className="biz-nav-ico" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div style={{ flex: 1 }} />
      <div className="biz-side-foot">
        <div className="biz-pulse" />
        <span>SYSTEM ONLINE</span>
      </div>
    </aside>
  )
}

export function BizTopbar({
  crumbs,
  title,
  subtitle,
  onSearch,
  onAdd,
  addLabel = 'New Record',
}: {
  crumbs: string[]
  title: string
  subtitle: string
  onSearch?: () => void
  onAdd?: () => void
  addLabel?: string
}) {
  return (
    <header className="biz-topbar">
      <div>
        <div className="biz-crumb">
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              {i > 0 && <span className="biz-crumb-sep">›</span>}
              <span style={{ color: i === crumbs.length - 1 ? 'var(--elec)' : undefined }}>{c}</span>
            </span>
          ))}
        </div>
        <h1 className="biz-title">{title}</h1>
        <div className="biz-sub">{subtitle}</div>
      </div>
      <div className="biz-topbar-actions">
        {onSearch && (
          <button className="biz-btn biz-btn-ghost" onClick={onSearch}>
            <Icon.search />
            Search
          </button>
        )}
        {onAdd && (
          <button className="biz-btn biz-btn-primary" onClick={onAdd}>
            <Icon.plus />
            {addLabel}
          </button>
        )}
      </div>
    </header>
  )
}

export function StatCard({
  label,
  value,
  change,
  trend,
  variant = 'blue',
  foot,
}: {
  label: string
  value: string
  change?: string
  trend?: 'up' | 'down'
  variant?: 'blue' | 'violet' | 'cyan' | 'green' | 'amber' | 'red'
  foot?: string
}) {
  const variantClass = variant === 'blue' ? '' : `kpi-${variant}`
  return (
    <div className={`biz-kpi ${variantClass}`}>
      <div className="biz-kpi-label">{label}</div>
      <div className="biz-kpi-value">{value}</div>
      {change && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <span className={`biz-kpi-trend ${trend === 'down' ? 'down' : 'up'}`}>
            {trend === 'down' ? <Icon.arrowDown style={{ width: 11, height: 11 }} /> : <Icon.arrowUp style={{ width: 11, height: 11 }} />}
            {change}
          </span>
          {foot && <span className="biz-kpi-foot">{foot}</span>}
        </div>
      )}
    </div>
  )
}

export function Card({
  title,
  sub,
  children,
  accent = true,
  style,
  padding,
}: {
  title?: string
  sub?: string
  children: ReactNode
  accent?: boolean
  style?: CSSProperties
  padding?: string | number
}) {
  return (
    <div
      className={`biz-card ${accent ? 'biz-card-accent' : ''}`}
      style={{ ...(padding !== undefined ? { padding } : {}), ...style }}
    >
      {(title || sub) && (
        <div className="biz-card-head">
          <div>
            {title && <div className="biz-card-title">{title}</div>}
            {sub && <div className="biz-card-sub" style={{ marginTop: 2 }}>{sub}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export function Badge({ children, color = 'gray' }: { children: ReactNode; color?: string }) {
  const map: Record<string, string> = {
    blue: 'bz-blue',
    violet: 'bz-violet',
    cyan: 'bz-cyan',
    green: 'bz-green',
    amber: 'bz-amber',
    pink: 'bz-pink',
    red: 'bz-red',
    gray: 'bz-gray',
  }
  return (
    <span className={`biz-badge ${map[color] || map.gray}`}>
      <span className="biz-dot" style={{ background: 'currentColor', opacity: 0.8 }} />
      {children}
    </span>
  )
}

/* Map any business status string to a badge color */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    'discovery': 'amber',
    'qualification': 'blue',
    'proposal': 'violet',
    'negotiation': 'pink',
    'closed-won': 'green',
    'closed-lost': 'red',
    'in-stock': 'green',
    'low-stock': 'amber',
    'critical': 'red',
    'active': 'green',
    'in-progress': 'blue',
    'planning': 'violet',
    'completed': 'green',
    'on-track': 'green',
    'in-transit': 'blue',
    'delayed': 'red',
    'delivered': 'green',
    'reorder': 'amber',
    'running': 'green',
    'maintenance': 'amber',
    'asset': 'green',
    'liability': 'red',
    'revenue': 'blue',
  }
  return map[status?.toLowerCase()] || 'gray'
}

export function Progress({ value, color = 'var(--elec)' }: { value: number; color?: string }) {
  return (
    <div className="biz-progress">
      <div
        className="biz-progress-fill"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </div>
  )
}

export function Avatar({ initials, size = 'md', color }: { initials: string; size?: 'sm' | 'md'; color?: string }) {
  // Deterministic color from initials
  const palette = [
    'linear-gradient(135deg,#3b82f6,#8b5cf6)',
    'linear-gradient(135deg,#22d3ee,#3b82f6)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#10b981,#22d3ee)',
    'linear-gradient(135deg,#f59e0b,#ec4899)',
  ]
  const hash = (initials || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const bg = color || palette[hash % palette.length]
  return (
    <div className={`biz-avatar ${size === 'sm' ? 'sm' : ''}`} style={{ background: bg }}>
      {(initials || '?').slice(0, 2).toUpperCase()}
    </div>
  )
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
}: {
  searchValue: string
  onSearchChange: (v: string) => void
  searchPlaceholder?: string
  filters?: { label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }[]
}) {
  return (
    <div className="biz-filter">
      <div className="biz-input-icon" style={{ flex: 1 }}>
        <Icon.search />
        <input
          type="text"
          className="biz-input"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {filters?.map((f, i) => (
        <select key={i} className="biz-select" value={f.value} onChange={(e) => f.onChange(e.target.value)}>
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  primaryLabel = 'Save',
  onPrimary,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  primaryLabel?: string
  onPrimary?: () => void
}) {
  if (!open) return null
  return (
    <div className="biz-modal-back" onClick={onClose}>
      <div className="biz-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {subtitle && <div className="biz-modal-sub">{subtitle}</div>}
        <div className="biz-modal-form">{children}</div>
        <div className="biz-modal-actions">
          <button className="biz-btn biz-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="biz-btn biz-btn-primary" onClick={onPrimary || onClose}>
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function DrawerHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="biz-drawer-head">
      <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
        {title}
      </h3>
      <button className="biz-drawer-close" onClick={onClose} aria-label="Close">
        <Icon.close style={{ width: 14, height: 14 }} />
      </button>
    </div>
  )
}
