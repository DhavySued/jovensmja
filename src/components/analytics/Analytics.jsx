import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { BarChart2, RefreshCw, Loader, Search, UserX } from 'lucide-react'
import SummaryCards from './SummaryCards'
import SexoChart from './SexoChart'
import FaixaEtariaChart from './FaixaEtariaChart'

const BADGE_SEXO = { Masculino: 'badge-blue', Feminino: 'badge-pink' }
const BADGE_CAT  = { Jovem: 'badge-purple', Adolescente: 'badge-pink', Líder: 'badge-green', Voluntário: 'badge-blue', Visitante: '' }

function formatarData(data) {
  if (!data) return '—'
  const [y, m, d] = data.split('-')
  return `${d}/${m}/${y}`
}

function TabelaCadastros({ pessoas }) {
  const [busca, setBusca] = useState('')

  const filtered = pessoas.filter(p => {
    const q = busca.toLowerCase()
    return (
      p.nome.toLowerCase().includes(q) ||
      (p.categoria || '').toLowerCase().includes(q) ||
      (p.sexo || '').toLowerCase().includes(q) ||
      (p.cidade || '').toLowerCase().includes(q) ||
      (p.bairro || '').toLowerCase().includes(q) ||
      (p.como_conheceu || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="glass-card" style={{ padding: '24px', marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f0f0ff' }}>Todos os Cadastros</h3>
          <p style={{ fontSize: 12, color: 'rgba(240,240,255,0.4)', marginTop: 2 }}>
            {filtered.length} pessoa{filtered.length !== 1 ? 's' : ''} no filtro atual
          </p>
        </div>
        <div style={{ position: 'relative', minWidth: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,240,255,0.35)' }} />
          <input
            className="glass-input"
            type="text"
            placeholder="Buscar na tabela..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(240,240,255,0.3)' }}>
          <UserX size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
          <p style={{ fontSize: 14 }}>Nenhum resultado.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['#', 'Nome', 'Idade', 'Sexo', 'Categoria', 'Cidade', 'Bairro', 'Nascimento', 'Como Conheceu'].map(col => (
                  <th key={col} style={{
                    padding: '9px 12px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(240,240,255,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    whiteSpace: 'nowrap',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
                >
                  <td style={{ padding: '10px 12px', color: 'rgba(240,240,255,0.3)', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', color: '#f0f0ff', fontWeight: 500, whiteSpace: 'nowrap' }}>{p.nome}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: 'rgba(108,99,255,0.15)', color: '#a5a0ff', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>
                      {p.idade} anos
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge ${BADGE_SEXO[p.sexo] || ''}`}>{p.sexo}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge ${BADGE_CAT[p.categoria] || ''}`}>{p.categoria}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'rgba(240,240,255,0.55)', whiteSpace: 'nowrap' }}>
                    {p.cidade || <span style={{ color: 'rgba(240,240,255,0.2)' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'rgba(240,240,255,0.55)', whiteSpace: 'nowrap' }}>
                    {p.bairro || <span style={{ color: 'rgba(240,240,255,0.2)' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'rgba(240,240,255,0.55)', whiteSpace: 'nowrap' }}>
                    {formatarData(p.data_nascimento)}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'rgba(240,240,255,0.55)', whiteSpace: 'nowrap' }}>
                    {p.como_conheceu || <span style={{ color: 'rgba(240,240,255,0.2)' }}>—</span>}
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

const CATEGORIAS_OPTS = ['Todas', 'Jovem', 'Adolescente', 'Líder', 'Voluntário', 'Visitante']
const SEXO_OPTS = ['Todos', 'Masculino', 'Feminino']

function calcularIdade(dataNascimento) {
  const hoje = new Date()
  const nasc = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

export default function Analytics() {
  const [pessoas, setPessoas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [filtroSexo, setFiltroSexo] = useState('Todos')

  const fetchPessoas = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from('pessoas').select('*')
    if (error) setError('Erro ao buscar dados: ' + error.message)
    else setPessoas(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPessoas() }, [])

  const pessoasFiltradas = useMemo(() => {
    return pessoas.filter(p => {
      const okCat = filtroCategoria === 'Todas' || p.categoria === filtroCategoria
      const okSexo = filtroSexo === 'Todos' || p.sexo === filtroSexo
      return okCat && okSexo
    })
  }, [pessoas, filtroCategoria, filtroSexo])

  const pessoasComIdade = useMemo(() =>
    pessoasFiltradas.map(p => ({ ...p, idade: calcularIdade(p.data_nascimento) })),
    [pessoasFiltradas]
  )

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #ff658433, #ff6584111)',
            border: '1px solid rgba(255,101,132,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BarChart2 size={20} color="#ff8fa3" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0f0ff' }}>Analytics</h1>
            <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.5)', marginTop: 2 }}>
              Análise do grupo
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="glass-input"
            style={{ width: 'auto', minWidth: 140 }}
            value={filtroCategoria}
            onChange={e => setFiltroCategoria(e.target.value)}
          >
            {CATEGORIAS_OPTS.map(c => <option key={c} value={c}>{c === 'Todas' ? 'Todas as categorias' : c}</option>)}
          </select>
          <select
            className="glass-input"
            style={{ width: 'auto', minWidth: 120 }}
            value={filtroSexo}
            onChange={e => setFiltroSexo(e.target.value)}
          >
            {SEXO_OPTS.map(s => <option key={s} value={s}>{s === 'Todos' ? 'Todos os sexos' : s}</option>)}
          </select>
          <button
            onClick={fetchPessoas}
            className="btn-primary"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,240,255,0.8)', whiteSpace: 'nowrap' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,99,99,0.1)', border: '1px solid rgba(255,99,99,0.25)', color: '#ff8fa3', fontSize: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(240,240,255,0.4)' }}>
          <Loader size={36} className="spin" style={{ margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontSize: 15 }}>Carregando dados...</p>
        </div>
      ) : (
        <>
          <SummaryCards pessoas={pessoasComIdade} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}>
            <SexoChart pessoas={pessoasComIdade} />
            <FaixaEtariaChart pessoas={pessoasComIdade} />
          </div>
          <TabelaCadastros pessoas={pessoasComIdade} />
        </>
      )}
    </div>
  )
}
