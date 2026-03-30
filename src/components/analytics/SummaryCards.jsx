import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Users, TrendingUp, Cake, X, ChevronRight } from 'lucide-react'

const BADGE_CAT  = { Jovem: 'badge-purple', Adolescente: 'badge-pink', Líder: 'badge-green', Voluntário: 'badge-blue', Visitante: '' }
const BADGE_SEXO = { Masculino: 'badge-blue', Feminino: 'badge-pink' }

function formatarData(data) {
  if (!data) return '—'
  const [, m, d] = data.split('-')
  return `${d}/${m}`
}

function diasParaAniversario(dataNascimento) {
  const hoje = new Date()
  const [, mes, dia] = dataNascimento.split('-')
  let proximo = new Date(hoje.getFullYear(), parseInt(mes) - 1, parseInt(dia))
  if (proximo < hoje) proximo.setFullYear(hoje.getFullYear() + 1)
  const diff = Math.ceil((proximo - hoje) / (1000 * 60 * 60 * 24))
  return diff === 0 ? 'Hoje!' : `${diff} dia${diff !== 1 ? 's' : ''}`
}

function idadeQueueVaiCompletar(dataNascimento) {
  const [ano] = dataNascimento.split('-')
  return new Date().getFullYear() - parseInt(ano)
}

// ── Modais de detalhe ────────────────────────────────────────────

function DetalheTotal({ pessoas }) {
  const porCategoria = {}
  const porSexo = {}
  for (const p of pessoas) {
    porCategoria[p.categoria] = (porCategoria[p.categoria] || 0) + 1
    porSexo[p.sexo] = (porSexo[p.sexo] || 0) + 1
  }
  const cats = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])
  const sexos = Object.entries(porSexo).sort((a, b) => b[1] - a[1])

  return (
    <div>
      <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.45)', marginBottom: 20 }}>
        {pessoas.length} pessoa{pessoas.length !== 1 ? 's' : ''} cadastrada{pessoas.length !== 1 ? 's' : ''} no filtro atual
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Por Categoria</div>
          {cats.map(([cat, qtd]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className={`badge ${BADGE_CAT[cat] || ''}`}>{cat}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f0ff' }}>{qtd}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Por Sexo</div>
          {sexos.map(([sexo, qtd]) => (
            <div key={sexo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className={`badge ${BADGE_SEXO[sexo] || ''}`}>{sexo}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f0ff' }}>{qtd}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Lista Completa</div>
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {[...pessoas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {p.codigo && <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(165,160,255,0.6)', minWidth: 36 }}>{p.codigo}</span>}
            <span style={{ flex: 1, fontSize: 14, color: '#f0f0ff' }}>{p.nome}</span>
            <span className={`badge ${BADGE_CAT[p.categoria] || ''}`}>{p.categoria}</span>
            <span style={{ fontSize: 12, color: 'rgba(240,240,255,0.35)' }}>{p.idade} anos</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DetalheMedia({ pessoas }) {
  const faixas = [
    { label: '0–12',  min: 0,  max: 12  },
    { label: '13–17', min: 13, max: 17  },
    { label: '18–25', min: 18, max: 25  },
    { label: '26–35', min: 26, max: 35  },
    { label: '36–50', min: 36, max: 50  },
    { label: '50+',   min: 51, max: 999 },
  ]

  const contagens = faixas.map(f => ({
    ...f,
    qtd: pessoas.filter(p => p.idade >= f.min && p.idade <= f.max).length,
  }))

  const maxQtd = Math.max(...contagens.map(f => f.qtd), 1)

  const ordenadosPorIdade = [...pessoas].sort((a, b) => a.idade - b.idade)
  const maisjovem = ordenadosPorIdade[0]
  const maisvelho = ordenadosPorIdade[ordenadosPorIdade.length - 1]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {maisjovem && (
          <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(67,233,123,0.08)', border: '1px solid rgba(67,233,123,0.18)' }}>
            <div style={{ fontSize: 11, color: 'rgba(67,233,123,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Mais jovem</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0ff' }}>{maisjovem.nome}</div>
            <div style={{ fontSize: 13, color: 'rgba(240,240,255,0.45)', marginTop: 2 }}>{maisjovem.idade} anos</div>
          </div>
        )}
        {maisvelho && (
          <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.18)' }}>
            <div style={{ fontSize: 11, color: 'rgba(165,160,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Mais velho</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0ff' }}>{maisvelho.nome}</div>
            <div style={{ fontSize: 13, color: 'rgba(240,240,255,0.45)', marginTop: 2 }}>{maisvelho.idade} anos</div>
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Distribuição por Faixa Etária</div>
      {contagens.map(f => (
        <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: 'rgba(240,240,255,0.5)', minWidth: 40, textAlign: 'right' }}>{f.label}</span>
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${(f.qtd / maxQtd) * 100}%`,
              background: 'linear-gradient(90deg, #6c63ff, #8b85ff)',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0ff', minWidth: 24, textAlign: 'right' }}>{f.qtd}</span>
        </div>
      ))}

      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', margin: '20px 0 10px' }}>Todas por Idade</div>
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {ordenadosPorIdade.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {p.codigo && <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(165,160,255,0.6)', minWidth: 36 }}>{p.codigo}</span>}
            <span style={{ flex: 1, fontSize: 14, color: '#f0f0ff' }}>{p.nome}</span>
            <span style={{ display: 'inline-block', background: 'rgba(108,99,255,0.15)', color: '#a5a0ff', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
              {p.idade} anos
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DetalheAniversariantes({ pessoas }) {
  const mesAtual = new Date().getMonth() + 1
  const aniversariantes = pessoas
    .filter(p => new Date(p.data_nascimento + 'T00:00:00').getMonth() + 1 === mesAtual)
    .sort((a, b) => {
      const [, , dA] = a.data_nascimento.split('-')
      const [, , dB] = b.data_nascimento.split('-')
      return parseInt(dA) - parseInt(dB)
    })

  const nomeMes = new Date().toLocaleString('pt-BR', { month: 'long' })

  if (aniversariantes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(240,240,255,0.35)' }}>
        <Cake size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
        <p style={{ fontSize: 14 }}>Nenhum aniversariante em {nomeMes}.</p>
      </div>
    )
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.45)', marginBottom: 20 }}>
        {aniversariantes.length} aniversariante{aniversariantes.length !== 1 ? 's' : ''} em {nomeMes}
      </p>
      {aniversariantes.map(p => {
        const dias = diasParaAniversario(p.data_nascimento)
        const idade = idadeQueueVaiCompletar(p.data_nascimento)
        const hoje = dias === 'Hoje!'
        return (
          <div
            key={p.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', marginBottom: 8, borderRadius: 10,
              background: hoje ? 'rgba(255,101,132,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${hoje ? 'rgba(255,101,132,0.25)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: hoje ? 'rgba(255,101,132,0.2)' : 'rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Cake size={16} color={hoje ? '#ff8fa3' : 'rgba(240,240,255,0.4)'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0ff' }}>{p.nome}</div>
              <div style={{ fontSize: 12, color: 'rgba(240,240,255,0.4)', marginTop: 2 }}>
                {formatarData(p.data_nascimento)} · completa {idade} anos
              </div>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              background: hoje ? 'rgba(255,101,132,0.2)' : 'rgba(255,255,255,0.08)',
              color: hoje ? '#ff8fa3' : 'rgba(240,240,255,0.5)',
              whiteSpace: 'nowrap',
            }}>
              {dias}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Modal genérico ───────────────────────────────────────────────

function CardModal({ card, pessoas, onClose }) {
  const conteudo = {
    total:         <DetalheTotal pessoas={pessoas} />,
    media:         <DetalheMedia pessoas={pessoas} />,
    aniversariantes: <DetalheAniversariantes pessoas={pessoas} />,
  }

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto',
        background: '#1e1b3a',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        padding: '28px',
      }}>
        {/* Header do modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: card.bg, border: `1px solid ${card.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <card.icon size={18} color={card.color} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0ff' }}>{card.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(240,240,255,0.4)', marginTop: 1 }}>{card.sub}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,240,255,0.4)', display: 'flex', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {conteudo[card.id]}
      </div>
    </div>,
    document.body
  )
}

// ── Componente principal ─────────────────────────────────────────

export default function SummaryCards({ pessoas }) {
  const [modalAberto, setModalAberto] = useState(null)

  const total = pessoas.length
  const mediaIdade = total > 0
    ? Math.round(pessoas.reduce((sum, p) => sum + p.idade, 0) / total)
    : 0
  const mesAtual = new Date().getMonth() + 1
  const aniversariantesDoMes = pessoas.filter(p =>
    new Date(p.data_nascimento + 'T00:00:00').getMonth() + 1 === mesAtual
  ).length

  const cards = [
    {
      id: 'total',
      label: 'Total de Pessoas',
      value: total,
      sub: 'cadastradas',
      icon: Users,
      color: '#6c63ff',
      bg: 'rgba(108,99,255,0.12)',
      border: 'rgba(108,99,255,0.25)',
    },
    {
      id: 'media',
      label: 'Média de Idade',
      value: total > 0 ? `${mediaIdade} anos` : '—',
      sub: 'do grupo',
      icon: TrendingUp,
      color: '#43e97b',
      bg: 'rgba(67,233,123,0.1)',
      border: 'rgba(67,233,123,0.22)',
    },
    {
      id: 'aniversariantes',
      label: 'Aniversariantes',
      value: aniversariantesDoMes,
      sub: new Date().toLocaleString('pt-BR', { month: 'long' }),
      icon: Cake,
      color: '#ff6584',
      bg: 'rgba(255,101,132,0.1)',
      border: 'rgba(255,101,132,0.22)',
    },
  ]

  const cardAberto = cards.find(c => c.id === modalAberto)

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {cards.map((card) => (
          <div
            key={card.id}
            className="glass-card"
            onClick={() => setModalAberto(card.id)}
            style={{ padding: '22px 24px', cursor: 'pointer', position: 'relative' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '10px',
                background: card.bg, border: `1px solid ${card.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <card.icon size={18} color={card.color} />
              </div>
              <ChevronRight size={14} style={{ color: 'rgba(240,240,255,0.2)', marginTop: 4 }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f0f0ff', lineHeight: 1 }}>{card.value}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 13, color: 'rgba(240,240,255,0.55)' }}>{card.label}</span>
              {card.sub && <span style={{ fontSize: 12, color: 'rgba(240,240,255,0.3)', marginLeft: 4 }}>· {card.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {cardAberto && (
        <CardModal
          card={cardAberto}
          pessoas={pessoas}
          onClose={() => setModalAberto(null)}
        />
      )}
    </>
  )
}
