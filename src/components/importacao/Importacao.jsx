import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Upload, FileText, CheckCircle, XCircle, Loader,
  Download, Trash2, Send, Plus, AlertTriangle, Edit3,
} from 'lucide-react'

// ── Constantes ──────────────────────────────────────────────────────────────

const CATEGORIAS   = ['Jovem', 'Adolescente', 'Líder', 'Voluntário', 'Visitante']
const COMO_OPTS    = ['Indicação de amigo', 'Familiar', 'Redes sociais', 'Evento/Culto', 'Passou pela igreja', 'Outro']

const COLUNAS = [
  { key: 'nome',               label: 'Nome',              tipo: 'text',   required: true,  width: 180 },
  { key: 'data_nascimento',    label: 'Nascimento',        tipo: 'date',   required: true,  width: 140 },
  { key: 'sexo',               label: 'Sexo',              tipo: 'sexo',   required: true,  width: 120 },
  { key: 'categoria',          label: 'Categoria',         tipo: 'cat',    required: true,  width: 130 },
  { key: 'telefone',           label: 'Telefone',          tipo: 'text',   required: false, width: 140 },
  { key: 'rua',                label: 'Rua',               tipo: 'text',   required: false, width: 160 },
  { key: 'numero_casa',        label: 'Número',            tipo: 'text',   required: false, width: 80  },
  { key: 'bairro',             label: 'Bairro',            tipo: 'text',   required: false, width: 130 },
  { key: 'cidade',             label: 'Cidade',            tipo: 'text',   required: false, width: 130 },
  { key: 'como_conheceu',      label: 'Como Conheceu',     tipo: 'como',   required: false, width: 170 },
  { key: 'gosta_fazer',        label: 'Gosta de Fazer',    tipo: 'text',   required: false, width: 200 },
  { key: 'data_conversao',     label: 'Conversão',         tipo: 'date',   required: false, width: 140 },
  { key: 'data_batismo_aguas', label: 'Batismo nas Águas', tipo: 'date',   required: false, width: 150 },
]

const ROW_VAZIO = () => ({
  _id: Math.random().toString(36).slice(2),
  nome: '', data_nascimento: '', sexo: '', categoria: '',
  telefone: '', rua: '', numero_casa: '', bairro: '', cidade: '',
  como_conheceu: '', gosta_fazer: '', data_conversao: '', data_batismo_aguas: '',
})

const CSV_MODELO = `nome;data_nascimento;sexo;categoria;telefone;rua;numero_casa;bairro;cidade;como_conheceu;gosta_fazer;data_conversao;data_batismo_aguas
João da Silva;2005-03-15;Masculino;Jovem;(11) 99999-1234;Rua das Flores;123;Centro;São Paulo;Indicação de amigo;Cantar e tocar;2020-01-10;2020-06-20
Maria Souza;2008-07-22;Feminino;Adolescente;;;;;;Campinas;Redes sociais;;;`

// ── Utilitários ──────────────────────────────────────────────────────────────

function normalizarHeader(h) {
  return h.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
}

const ALIAS = {
  nascimento: 'data_nascimento',
  dt_nasc: 'data_nascimento',
  dt_nascimento: 'data_nascimento',
  numero: 'numero_casa',
  num: 'numero_casa',
  num_casa: 'numero_casa',
  tel: 'telefone',
  fone: 'telefone',
  celular: 'telefone',
  como_conheceu_o_ministerio: 'como_conheceu',
  como_conheceu_ministerio: 'como_conheceu',
  o_que_gosta: 'gosta_fazer',
  gosta: 'gosta_fazer',
  conversao: 'data_conversao',
  dt_conversao: 'data_conversao',
  batismo: 'data_batismo_aguas',
  batismo_aguas: 'data_batismo_aguas',
  dt_batismo: 'data_batismo_aguas',
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) throw new Error('O arquivo precisa ter cabeçalho e ao menos uma linha de dados.')
  const sep = lines[0].includes(';') ? ';' : ','
  const rawHeaders = lines[0].split(sep)
  const headers = rawHeaders.map(h => {
    const norm = normalizarHeader(h)
    return ALIAS[norm] || norm
  })
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split(sep).map(v => v.trim().replace(/^"|"$/g, ''))
    const row = ROW_VAZIO()
    headers.forEach((h, i) => { if (h in row) row[h] = values[i] || '' })
    // normalizar sexo
    const s = (row.sexo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (s.includes('fem')) row.sexo = 'Feminino'
    else if (s.includes('masc')) row.sexo = 'Masculino'
    // normalizar categoria
    const catMap = { jovem: 'Jovem', adolescente: 'Adolescente', lider: 'Líder', voluntario: 'Voluntário', visitante: 'Visitante' }
    const c = (row.categoria || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (catMap[c]) row.categoria = catMap[c]
    return row
  })
}

function validar(row) {
  const erros = {}
  if (!row.nome?.trim()) erros.nome = 'Obrigatório'
  if (!row.data_nascimento) erros.data_nascimento = 'Obrigatório'
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.data_nascimento)) erros.data_nascimento = 'Formato: AAAA-MM-DD'
  if (!row.sexo) erros.sexo = 'Obrigatório'
  else if (!['Masculino', 'Feminino'].includes(row.sexo)) erros.sexo = 'Inválido'
  if (!row.categoria) erros.categoria = 'Obrigatório'
  if (row.data_conversao && !/^\d{4}-\d{2}-\d{2}$/.test(row.data_conversao)) erros.data_conversao = 'Formato: AAAA-MM-DD'
  if (row.data_batismo_aguas && !/^\d{4}-\d{2}-\d{2}$/.test(row.data_batismo_aguas)) erros.data_batismo_aguas = 'Formato: AAAA-MM-DD'
  return erros
}

// ── Célula editável ──────────────────────────────────────────────────────────

function Celula({ col, value, erro, onChange }) {
  const base = {
    width: '100%',
    background: erro ? 'rgba(255,99,99,0.12)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${erro ? 'rgba(255,99,99,0.4)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 6,
    color: '#f0f0ff',
    padding: '5px 8px',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  if (col.tipo === 'sexo') return (
    <select value={value} onChange={e => onChange(e.target.value)} style={base}>
      <option value="">—</option>
      <option>Masculino</option>
      <option>Feminino</option>
    </select>
  )
  if (col.tipo === 'cat') return (
    <select value={value} onChange={e => onChange(e.target.value)} style={base}>
      <option value="">—</option>
      {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
    </select>
  )
  if (col.tipo === 'como') return (
    <select value={value} onChange={e => onChange(e.target.value)} style={base}>
      <option value="">—</option>
      {COMO_OPTS.map(c => <option key={c}>{c}</option>)}
    </select>
  )
  return (
    <input
      type={col.tipo === 'date' ? 'date' : 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...base, colorScheme: col.tipo === 'date' ? 'dark' : undefined }}
      title={erro || ''}
    />
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function Importacao() {
  const [linhas, setLinhas]         = useState([])
  const [nomeArquivo, setNomeArquivo] = useState('')
  const [erroGlobal, setErroGlobal] = useState(null)
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado]   = useState(null)
  const [dragging, setDragging]     = useState(false)
  const inputRef = useRef()

  const processarArquivo = (file) => {
    setResultado(null)
    setErroGlobal(null)
    if (!file.name.endsWith('.csv')) { setErroGlobal('Apenas arquivos .csv são suportados.'); return }
    setNomeArquivo(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      try { setLinhas(parseCSV(e.target.result)) }
      catch (err) { setErroGlobal(err.message) }
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleFile  = (e) => processarArquivo(e.target.files[0])
  const handleDrop  = (e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) processarArquivo(e.dataTransfer.files[0]) }

  const updateCell  = (id, key, val) => setLinhas(prev => prev.map(r => r._id === id ? { ...r, [key]: val } : r))
  const deleteRow   = (id) => setLinhas(prev => prev.filter(r => r._id !== id))
  const addRow      = () => setLinhas(prev => [...prev, ROW_VAZIO()])

  const errosPorLinha = linhas.map(r => validar(r))
  const validas       = linhas.filter((_, i) => Object.keys(errosPorLinha[i]).length === 0)
  const invalidas     = linhas.filter((_, i) => Object.keys(errosPorLinha[i]).length > 0)

  const handleImportar = async () => {
    if (validas.length === 0) return
    setImportando(true)
    setResultado(null)
    const payload = validas.map(({ _id, ...rest }) =>
      Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v?.trim() === '' ? null : v]))
    )
    const { error } = await supabase.from('pessoas').insert(payload)
    setImportando(false)
    if (error) {
      setResultado({ sucesso: false, msg: 'Erro ao importar: ' + error.message })
    } else {
      setResultado({ sucesso: true, msg: `${validas.length} pessoa${validas.length !== 1 ? 's' : ''} importada${validas.length !== 1 ? 's' : ''} com sucesso!` })
      setLinhas([])
      setNomeArquivo('')
    }
  }

  const baixarModelo = () => {
    const blob = new Blob([CSV_MODELO], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'modelo_importacao.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fade-in" style={{ maxWidth: '100%', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #43e97b22, #43e97b11)', border: '1px solid rgba(67,233,123,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Upload size={20} color="#43e97b" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0f0ff' }}>Importação</h1>
            <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.5)', marginTop: 2 }}>Importe e edite os dados antes de salvar</p>
          </div>
        </div>
        <button onClick={baixarModelo} className="btn-primary" style={{ background: 'rgba(67,233,123,0.12)', border: '1px solid rgba(67,233,123,0.25)', color: '#43e97b' }}>
          <Download size={14} /> Baixar modelo CSV
        </button>
      </div>

      {/* Aviso */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <AlertTriangle size={15} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13, color: 'rgba(240,240,255,0.6)', lineHeight: 1.7 }}>
            <strong style={{ color: '#f0f0ff' }}>Colunas obrigatórias:</strong> <span style={{ color: '#a5a0ff' }}>nome · data_nascimento (AAAA-MM-DD) · sexo · categoria</span><br />
            Após carregar o CSV, você pode <strong style={{ color: '#f0f0ff' }}>editar qualquer célula</strong> diretamente na tabela antes de importar.
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className="glass-card"
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
          border: dragging ? '2px dashed #43e97b' : '2px dashed rgba(255,255,255,0.1)',
          background: dragging ? 'rgba(67,233,123,0.05)' : undefined,
          transition: 'all 0.2s', marginBottom: 20,
        }}
      >
        <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
        <FileText size={32} color={dragging ? '#43e97b' : 'rgba(240,240,255,0.25)'} style={{ margin: '0 auto 10px', display: 'block' }} />
        {nomeArquivo
          ? <p style={{ fontSize: 14, color: '#43e97b', fontWeight: 600 }}>{nomeArquivo} — clique para trocar</p>
          : <>
              <p style={{ fontSize: 15, color: 'rgba(240,240,255,0.6)', fontWeight: 500 }}>Arraste um arquivo CSV aqui</p>
              <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.3)', marginTop: 4 }}>ou clique para selecionar</p>
            </>
        }
      </div>

      {erroGlobal && (
        <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,99,99,0.1)', border: '1px solid rgba(255,99,99,0.25)', color: '#ff8fa3', fontSize: 14 }}>
          {erroGlobal}
        </div>
      )}

      {resultado && (
        <div style={{ marginBottom: 16, padding: '14px 18px', borderRadius: 10, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, background: resultado.sucesso ? 'rgba(67,233,123,0.1)' : 'rgba(255,99,99,0.1)', border: `1px solid ${resultado.sucesso ? 'rgba(67,233,123,0.25)' : 'rgba(255,99,99,0.25)'}`, color: resultado.sucesso ? '#43e97b' : '#ff8fa3' }}>
          {resultado.sucesso ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {resultado.msg}
        </div>
      )}

      {/* Tabela editável */}
      {linhas.length > 0 && (
        <div className="glass-card" style={{ padding: 24 }}>

          {/* Barra de ações */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <Edit3 size={14} color="#a5a0ff" />
                <span style={{ color: 'rgba(240,240,255,0.6)' }}>{linhas.length} linha{linhas.length !== 1 ? 's' : ''}</span>
              </div>
              <span style={{ fontSize: 13, padding: '3px 12px', borderRadius: 99, background: 'rgba(67,233,123,0.12)', border: '1px solid rgba(67,233,123,0.25)', color: '#43e97b' }}>
                ✓ {validas.length} válida{validas.length !== 1 ? 's' : ''}
              </span>
              {invalidas.length > 0 && (
                <span style={{ fontSize: 13, padding: '3px 12px', borderRadius: 99, background: 'rgba(255,99,99,0.12)', border: '1px solid rgba(255,99,99,0.25)', color: '#ff8fa3' }}>
                  ✗ {invalidas.length} com erro — corrija na tabela
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={addRow} className="btn-primary" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,240,255,0.7)' }}>
                <Plus size={14} /> Adicionar linha
              </button>
              <button onClick={() => { setLinhas([]); setNomeArquivo('') }} className="btn-danger">
                <Trash2 size={13} /> Limpar
              </button>
              <button onClick={handleImportar} className="btn-primary" disabled={importando || validas.length === 0}>
                {importando ? <Loader size={14} className="spin" /> : <Send size={14} />}
                {importando ? 'Importando...' : `Importar ${validas.length} pessoa${validas.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>

          {/* Tabela */}
          <div style={{ overflowX: 'auto', borderRadius: 10 }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 12, minWidth: '100%' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <th style={thStyle}>Status</th>
                  {COLUNAS.map(col => (
                    <th key={col.key} style={{ ...thStyle, minWidth: col.width }}>
                      {col.label}
                      {col.required && <span style={{ color: '#ff8fa3', marginLeft: 2 }}>*</span>}
                    </th>
                  ))}
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((row, i) => {
                  const erros = errosPorLinha[i]
                  const valida = Object.keys(erros).length === 0
                  return (
                    <tr
                      key={row._id}
                      style={{ background: valida ? (i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)') : 'rgba(255,60,60,0.04)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      {/* Status */}
                      <td style={{ padding: '6px 10px', textAlign: 'center', verticalAlign: 'middle' }}>
                        {valida
                          ? <CheckCircle size={15} color="#43e97b" />
                          : <div title={Object.values(erros).join(' · ')}><XCircle size={15} color="#ff8fa3" /></div>
                        }
                      </td>

                      {/* Células editáveis */}
                      {COLUNAS.map(col => (
                        <td key={col.key} style={{ padding: '5px 6px', verticalAlign: 'middle', minWidth: col.width }}>
                          <Celula
                            col={col}
                            value={row[col.key] || ''}
                            erro={erros[col.key]}
                            onChange={val => updateCell(row._id, col.key, val)}
                          />
                          {erros[col.key] && (
                            <div style={{ fontSize: 10, color: '#ff8fa3', marginTop: 2, paddingLeft: 2 }}>{erros[col.key]}</div>
                          )}
                        </td>
                      ))}

                      {/* Deletar */}
                      <td style={{ padding: '5px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <button onClick={() => deleteRow(row._id)} className="btn-danger" style={{ padding: '4px 8px' }}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const thStyle = {
  padding: '10px 8px',
  textAlign: 'left',
  fontSize: 10,
  fontWeight: 600,
  color: 'rgba(240,240,255,0.4)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  whiteSpace: 'nowrap',
}
