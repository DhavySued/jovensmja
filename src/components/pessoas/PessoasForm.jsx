import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { UserPlus, Pencil, Loader, X } from 'lucide-react'
import { useConfig } from '../../hooks/useConfig'

const CATEGORIAS = ['Jovem', 'Adolescente', 'Líder', 'Voluntário', 'Visitante']

const COMO_CONHECEU = [
  'Indicação de amigo',
  'Familiar',
  'Redes sociais',
  'Evento/Culto',
  'Passou pela igreja',
  'Outro',
]

const initialForm = {
  nome: '',
  data_nascimento: '',
  sexo: '',
  categoria: '',
  telefone: '',
  rua: '',
  numero_casa: '',
  bairro: '',
  cidade: '',
  como_conheceu: '',
  gosta_fazer: '',
  data_conversao: '',
  data_batismo_aguas: '',
}

function Label({ children, required }) {
  return (
    <label style={{ fontSize: 12, color: 'rgba(240,240,255,0.5)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {children}{required && <span style={{ color: '#ff8fa3', marginLeft: 2 }}>*</span>}
    </label>
  )
}

function Field({ children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</div>
}

function Section({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 14px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
        {title}
      </div>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
    </div>
  )
}

async function gerarProximoCodigo() {
  const { data, error } = await supabase
    .from('pessoas')
    .select('codigo')
    .order('codigo', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) return '0001'
  const ultimo = parseInt(data[0].codigo, 10) || 0
  return String(ultimo + 1).padStart(4, '0')
}

export default function PessoasForm({ onSaved, onClose, editData }) {
  const isEdit = !!editData

  const [form, setForm] = useState(() =>
    isEdit
      ? Object.fromEntries(Object.keys(initialForm).map(k => [k, editData[k] ?? '']))
      : initialForm
  )
  const [codigo, setCodigo] = useState(isEdit ? editData.codigo : '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const { config } = useConfig()

  useEffect(() => {
    if (!isEdit) gerarProximoCodigo().then(setCodigo)
  }, [])

  const isRequired = (key) => {
    const fixos = ['nome', 'data_nascimento', 'sexo', 'categoria']
    return fixos.includes(key) || !!config[key]
  }

  const formatarTelefone = (valor) => {
    const nums = valor.replace(/\D/g, '').slice(0, 11)
    if (nums.length <= 2)  return nums.replace(/^(\d{0,2})/, '($1')
    if (nums.length <= 3)  return `(${nums.slice(0,2)}) ${nums.slice(2)}`
    if (nums.length <= 7)  return `(${nums.slice(0,2)}) ${nums.slice(2,3)}.${nums.slice(3)}`
    if (nums.length <= 11) return `(${nums.slice(0,2)}) ${nums.slice(2,3)}.${nums.slice(3,7)}-${nums.slice(7)}`
    return valor
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const novo = name === 'telefone' ? formatarTelefone(value) : value
    setForm(prev => ({ ...prev, [name]: novo }))
    setSuccess(false)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const faltando = Object.keys(initialForm).filter(k => isRequired(k) && !form[k]?.trim())
    if (faltando.length > 0) {
      setError('Preencha todos os campos obrigatórios marcados com *.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      nome: form.nome.trim(),
      data_nascimento: form.data_nascimento,
      sexo: form.sexo,
      categoria: form.categoria,
      telefone: form.telefone.trim() || null,
      rua: form.rua.trim() || null,
      numero_casa: form.numero_casa.trim() || null,
      bairro: form.bairro.trim() || null,
      cidade: form.cidade.trim() || null,
      como_conheceu: form.como_conheceu || null,
      gosta_fazer: form.gosta_fazer.trim() || null,
      data_conversao: form.data_conversao || null,
      data_batismo_aguas: form.data_batismo_aguas || null,
    }

    const { error } = isEdit
      ? await supabase.from('pessoas').update(payload).eq('id', editData.id)
      : await supabase.from('pessoas').insert([{ codigo, ...payload }])

    setSaving(false)
    if (error) {
      setError('Erro ao salvar: ' + error.message)
    } else {
      if (!isEdit) setForm(initialForm)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onSaved()
    }
  }

  return (
    <div style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEdit ? <Pencil size={16} color="#a5a0ff" /> : <UserPlus size={16} color="#a5a0ff" />}
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#f0f0ff' }}>
            {isEdit ? `Editar — ${editData.codigo}` : 'Nova Pessoa'}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,240,255,0.4)', display: 'flex', alignItems: 'center', padding: 4 }}
          >
            <X size={18} />
          </button>
        )}
      </div>
      <p style={{ fontSize: 12, color: 'rgba(240,240,255,0.35)', marginBottom: 4 }}>
        Campos com * são obrigatórios
      </p>

      <form onSubmit={handleSubmit}>

        {/* ── Dados Pessoais ── */}
        <Section title="Dados Pessoais" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
          <Field>
            <Label>Código</Label>
            <input
              className="glass-input"
              type="text"
              value={codigo}
              readOnly
              style={{ opacity: 0.5, cursor: 'not-allowed', fontFamily: 'monospace', letterSpacing: '2px' }}
            />
          </Field>
          <Field>
            <Label required={isRequired('nome')}>Nome completo</Label>
            <input className="glass-input" type="text" name="nome" value={form.nome} onChange={handleChange} placeholder="Ex: João da Silva" />
          </Field>
          <Field>
            <Label required={isRequired('data_nascimento')}>Data de Nascimento</Label>
            <input className="glass-input" type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} style={{ colorScheme: 'dark' }} />
          </Field>
          <Field>
            <Label required={isRequired('sexo')}>Sexo</Label>
            <select className="glass-input" name="sexo" value={form.sexo} onChange={handleChange}>
              <option value="">Selecione...</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </Field>
          <Field>
            <Label required={isRequired('categoria')}>Categoria</Label>
            <select className="glass-input" name="categoria" value={form.categoria} onChange={handleChange}>
              <option value="">Selecione...</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field>
            <Label required={isRequired('telefone')}>Telefone</Label>
            <input className="glass-input" type="tel" name="telefone" value={form.telefone} onChange={handleChange} placeholder="(11) 9.9999-9999" />
          </Field>
        </div>

        {/* ── Endereço ── */}
        <Section title="Endereço" />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <Field>
            <Label required={isRequired('rua')}>Rua</Label>
            <input className="glass-input" type="text" name="rua" value={form.rua} onChange={handleChange} placeholder="Ex: Rua das Flores" />
          </Field>
          <Field>
            <Label required={isRequired('numero_casa')}>Número</Label>
            <input className="glass-input" type="text" name="numero_casa" value={form.numero_casa} onChange={handleChange} placeholder="123" />
          </Field>
          <Field>
            <Label required={isRequired('bairro')}>Bairro</Label>
            <input className="glass-input" type="text" name="bairro" value={form.bairro} onChange={handleChange} placeholder="Ex: Centro" />
          </Field>
          <Field>
            <Label required={isRequired('cidade')}>Cidade</Label>
            <input className="glass-input" type="text" name="cidade" value={form.cidade} onChange={handleChange} placeholder="Ex: São Paulo" />
          </Field>
        </div>

        {/* ── Ministério ── */}
        <Section title="Ministério" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
          <Field>
            <Label required={isRequired('como_conheceu')}>Como conheceu o Ministério Jesus é Amor?</Label>
            <select className="glass-input" name="como_conheceu" value={form.como_conheceu} onChange={handleChange}>
              <option value="">Selecione...</option>
              {COMO_CONHECEU.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field>
            <Label required={isRequired('data_conversao')}>Data de Conversão</Label>
            <input className="glass-input" type="date" name="data_conversao" value={form.data_conversao} onChange={handleChange} style={{ colorScheme: 'dark' }} />
          </Field>
          <Field>
            <Label required={isRequired('data_batismo_aguas')}>Data do Batismo nas Águas</Label>
            <input className="glass-input" type="date" name="data_batismo_aguas" value={form.data_batismo_aguas} onChange={handleChange} style={{ colorScheme: 'dark' }} />
          </Field>
        </div>

        <Field>
          <Label required={isRequired('gosta_fazer')}>O que você mais gosta de fazer na Obra de Deus?</Label>
          <textarea
            className="glass-input"
            name="gosta_fazer"
            value={form.gosta_fazer}
            onChange={handleChange}
            placeholder="Ex: Gosto de cantar, tocar, pregar, arrumar a igreja, visitar pessoas, evangelizar..."
            rows={3}
            style={{ resize: 'vertical', lineHeight: 1.6 }}
          />
        </Field>

        {/* Feedback */}
        {error && (
          <div style={{ marginTop: 14, marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,99,99,0.1)', border: '1px solid rgba(255,99,99,0.25)', color: '#ff8fa3', fontSize: 13 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginTop: 14, marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.25)', color: '#43e97b', fontSize: 13 }}>
            Pessoa cadastrada com sucesso!
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Loader size={14} className="spin" /> : <UserPlus size={14} />}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn-primary"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,240,255,0.6)' }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
