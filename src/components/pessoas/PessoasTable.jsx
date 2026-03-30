import { useState } from 'react'
import { Search, Trash2, Loader, UserX, Pencil, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

function calcularIdade(dataNascimento) {
  const hoje = new Date()
  const nasc = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

function formatarData(data) {
  if (!data) return '—'
  const [year, month, day] = data.split('-')
  return `${day}/${month}/${year}`
}

const BADGE_SEXO = { Masculino: 'badge-blue', Feminino: 'badge-pink' }
const BADGE_CAT  = { Jovem: 'badge-purple', Adolescente: 'badge-pink', Líder: 'badge-green', Voluntário: 'badge-blue', Visitante: '' }

// Valor usado para ordenação por coluna
const SORT_VALUE = {
  codigo:       p => p.codigo || '',
  nome:         p => p.nome?.toLowerCase() || '',
  telefone:     p => p.telefone || '',
  nascimento:   p => p.data_nascimento || '',
  idade:        p => p.data_nascimento ? calcularIdade(p.data_nascimento) : -1,
  sexo:         p => p.sexo || '',
  categoria:    p => p.categoria || '',
  rua:          p => p.rua?.toLowerCase() || '',
  bairro:       p => p.bairro?.toLowerCase() || '',
  cidade:       p => p.cidade?.toLowerCase() || '',
  como_conheceu:p => p.como_conheceu?.toLowerCase() || '',
}

const COLUNAS_DEF = [
  {
    key: 'codigo',
    header: 'Código',
    render: (p) => (
      <span style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: '1px', color: 'rgba(165,160,255,0.9)', fontWeight: 600 }}>
        {p.codigo || '—'}
      </span>
    ),
  },
  {
    key: 'nome',
    header: 'Nome',
    render: (p) => <span style={{ color: '#f0f0ff', fontWeight: 500 }}>{p.nome}</span>,
  },
  {
    key: 'telefone',
    header: 'Telefone',
    render: (p) => <span style={{ color: 'rgba(240,240,255,0.55)', whiteSpace: 'nowrap' }}>{p.telefone || <span style={{ color: 'rgba(240,240,255,0.2)' }}>—</span>}</span>,
  },
  {
    key: 'nascimento',
    header: 'Nascimento',
    render: (p) => <span style={{ color: 'rgba(240,240,255,0.65)' }}>{formatarData(p.data_nascimento)}</span>,
  },
  {
    key: 'idade',
    header: 'Idade',
    render: (p) => (
      <span style={{ display: 'inline-block', background: 'rgba(108,99,255,0.15)', color: '#a5a0ff', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 600 }}>
        {calcularIdade(p.data_nascimento)} anos
      </span>
    ),
  },
  {
    key: 'sexo',
    header: 'Sexo',
    render: (p) => <span className={`badge ${BADGE_SEXO[p.sexo] || ''}`}>{p.sexo}</span>,
  },
  {
    key: 'categoria',
    header: 'Categoria',
    render: (p) => <span className={`badge ${BADGE_CAT[p.categoria] || ''}`}>{p.categoria}</span>,
  },
  {
    key: 'rua',
    header: 'Rua',
    render: (p) => (
      <span style={{ color: 'rgba(240,240,255,0.55)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
        {p.rua || <span style={{ color: 'rgba(240,240,255,0.2)' }}>—</span>}
      </span>
    ),
  },
  {
    key: 'bairro',
    header: 'Bairro',
    render: (p) => <span style={{ color: 'rgba(240,240,255,0.55)', whiteSpace: 'nowrap' }}>{p.bairro || <span style={{ color: 'rgba(240,240,255,0.2)' }}>—</span>}</span>,
  },
  {
    key: 'cidade',
    header: 'Cidade',
    render: (p) => <span style={{ color: 'rgba(240,240,255,0.55)', whiteSpace: 'nowrap' }}>{p.cidade || <span style={{ color: 'rgba(240,240,255,0.2)' }}>—</span>}</span>,
  },
  {
    key: 'como_conheceu',
    header: 'Como Conheceu',
    render: (p) => <span style={{ color: 'rgba(240,240,255,0.55)', whiteSpace: 'nowrap' }}>{p.como_conheceu || <span style={{ color: 'rgba(240,240,255,0.2)' }}>—</span>}</span>,
  },
]

function SortIcon({ colKey, sort }) {
  if (sort.key !== colKey) return <ChevronsUpDown size={12} style={{ opacity: 0.3, marginLeft: 4 }} />
  return sort.dir === 'asc'
    ? <ChevronUp size={12} style={{ color: '#a5a0ff', marginLeft: 4 }} />
    : <ChevronDown size={12} style={{ color: '#a5a0ff', marginLeft: 4 }} />
}

export default function PessoasTable({ pessoas, loading, onDelete, onEdit, colunas = {} }) {
  const [busca, setBusca] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [sort, setSort] = useState({ key: 'codigo', dir: 'asc' })

  const colunasVisiveis = COLUNAS_DEF.filter(c => colunas[c.key] !== false)

  const toggleSort = (key) => {
    setSort(prev => prev.key === key
      ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'asc' }
    )
  }

  const filtered = pessoas.filter(p => {
    const q = busca.toLowerCase()
    return (
      p.nome.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q) ||
      p.sexo.toLowerCase().includes(q) ||
      (p.codigo || '').toLowerCase().includes(q) ||
      (p.rua || '').toLowerCase().includes(q) ||
      (p.bairro || '').toLowerCase().includes(q) ||
      (p.cidade || '').toLowerCase().includes(q)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    const fn = SORT_VALUE[sort.key]
    if (!fn) return 0
    const va = fn(a)
    const vb = fn(b)
    const cmp = typeof va === 'number' ? va - vb : va.localeCompare(vb, 'pt-BR')
    return sort.dir === 'asc' ? cmp : -cmp
  })

  const handleDelete = async (id) => {
    if (!confirm('Remover esta pessoa?')) return
    setDeletingId(id)
    await onDelete(id)
    setDeletingId(null)
  }

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,240,255,0.35)' }} />
          <input
            className="glass-input"
            type="text"
            placeholder="Buscar por nome, código, categoria..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        {busca && (
          <span style={{ fontSize: 12, color: 'rgba(240,240,255,0.45)', whiteSpace: 'nowrap' }}>
            {sorted.length} resultado{sorted.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(240,240,255,0.4)' }}>
          <Loader size={28} className="spin" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14 }}>Carregando...</p>
        </div>
      )}

      {!loading && sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(240,240,255,0.35)' }}>
          <UserX size={36} style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: 14 }}>{busca ? 'Nenhum resultado encontrado.' : 'Nenhuma pessoa cadastrada ainda.'}</p>
        </div>
      )}

      {!loading && sorted.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {colunasVisiveis.map(col => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 600,
                      color: sort.key === col.key ? '#a5a0ff' : 'rgba(240,240,255,0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {col.header}
                      <SortIcon colKey={col.key} sort={sort} />
                    </span>
                  </th>
                ))}
                <th style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr
                  key={p.id}
                  style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
                >
                  {colunasVisiveis.map(col => (
                    <td key={col.key} style={{ padding: '12px 14px' }}>
                      {col.render(p)}
                    </td>
                  ))}
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => onEdit(p)}
                        style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 8, color: '#a5a0ff', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.28)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(108,99,255,0.15)'}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                      >
                        {deletingId === p.id ? <Loader size={13} className="spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
