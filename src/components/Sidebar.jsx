import { Users, BarChart2, ChevronRight, Upload, Settings } from 'lucide-react'

const navItems = [
  { id: 'cadastro',       label: 'Cadastro de Pessoas', icon: Users },
  { id: 'analytics',      label: 'Analytics',            icon: BarChart2 },
  { id: 'importacao',     label: 'Importação',           icon: Upload },
  { id: 'configuracoes',  label: 'Configurações',        icon: Settings },
]

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 0',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo / Brand */}
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: 38, height: 38,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6c63ff, #8b85ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff',
            boxShadow: '0 4px 12px rgba(108,99,255,0.4)',
          }}>M</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>MJA</div>
            <div style={{ fontSize: 11, color: 'rgba(240,240,255,0.45)', letterSpacing: '0.5px' }}>GESTÃO DE PESSOAS</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 24px 24px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activePage === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '11px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                fontFamily: 'Inter, sans-serif',
                color: active ? '#fff' : 'rgba(240,240,255,0.6)',
                background: active
                  ? 'linear-gradient(135deg, rgba(108,99,255,0.35), rgba(139,133,255,0.2))'
                  : 'transparent',
                border: active ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                position: 'relative',
                width: '100%',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = 'rgba(240,240,255,0.85)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(240,240,255,0.6)'
                }
              }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {active && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, color: 'rgba(240,240,255,0.3)', textAlign: 'center' }}>
          v1.0 · Jovens MJA
        </div>
      </div>
    </aside>
  )
}
