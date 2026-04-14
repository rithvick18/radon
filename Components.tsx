

export function SiteFooter() {
  return (
    <footer>
      <div className="f-logo">RADON</div>
      <div className="f-copy">© 2026 Radon Intelligence. All rights reserved.</div>
      <div className="f-links">
        {['Privacy', 'Docs', 'Status', 'API'].map(l => <a key={l} href="#">{l}</a>)}
      </div>
    </footer>
  )
}

export function MinimalNav({ onNavigate, onLogout, active }: any) {
  const navItems = [
    { key: 'erp', label: 'ERP' },
    { key: 'crm', label: 'CRM' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'email', label: 'Email' },
    { key: 'neo-guard', label: 'NeoGuard' },
    { key: 'ai-agent', label: 'AI Agent' },
  ];

  return (
    <nav style={{
      padding: '1rem 3.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(96,165,250,.06)',
      background: 'rgba(7,7,26,.95)',
      backdropFilter: 'blur(24px) saturate(1.2)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      alignItems: 'center',
      boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
    }}>
      <a
        href="#"
        className="n-logo"
        style={{ textDecoration: 'none' }}
        onClick={(e) => { e.preventDefault(); onNavigate('main') }}
      >
        <span className="grad">RAD</span>
        <span className="dot">·</span>
        <span className="grad">ON</span>
      </a>
      <ul style={{
        display: 'flex',
        gap: '2.25rem',
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}>
        {navItems.map(item => (
          <li key={item.key}>
            <a
              href="#"
              style={{
                color: active === item.key ? '#60a5fa' : '#4a5568',
                fontSize: '.72rem',
                letterSpacing: '.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'color .3s',
                position: 'relative',
                paddingBottom: '4px',
                fontWeight: active === item.key ? 700 : 400,
                borderBottom: active === item.key ? '1.5px solid #60a5fa' : '1.5px solid transparent',
              }}
              onClick={(e) => { e.preventDefault(); onNavigate(item.key) }}
              onMouseEnter={(e) => { if (active !== item.key) e.currentTarget.style.color = '#60a5fa'; }}
              onMouseLeave={(e) => { if (active !== item.key) e.currentTarget.style.color = '#4a5568'; }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="n-right">
        <div style={{
          fontFamily: '"Space Mono", monospace',
          fontSize: '.52rem',
          color: '#60a5fa',
          letterSpacing: '.1em',
          border: '1px solid rgba(96,165,250,.2)',
          padding: '.25rem .625rem',
          display: 'flex',
          alignItems: 'center',
          gap: '.375rem',
          borderRadius: '6px',
          background: 'rgba(96,165,250,0.03)',
        }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 6px #60a5fa', animation: 'pls 1.8s infinite' }}></div>
          LIVE
        </div>
        <button className="n-cta" onClick={onLogout}><span>Log Out</span></button>
      </div>
    </nav>
  )
}
