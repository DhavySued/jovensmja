import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import PessoasForm from './PessoasForm'
import PessoasTable from './PessoasTable'
import { useConfig } from '../../hooks/useConfig'
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar'
import { Users, RefreshCw, UserPlus, CalendarDays, Loader, LogOut, CheckCircle, Hash } from 'lucide-react'

export default function CadastroPessoas() {
  const [pessoas, setPessoas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPessoa, setEditingPessoa] = useState(null)
  const [syncFeedback, setSyncFeedback] = useState(null)
  const [gerandoCodigos, setGerandoCodigos] = useState(false)

  const semCodigo = pessoas.filter(p => !p.codigo)

  const gerarCodigos = async () => {
    if (semCodigo.length === 0) return
    setGerandoCodigos(true)
    const maxExistente = pessoas
      .filter(p => p.codigo)
      .reduce((max, p) => Math.max(max, parseInt(p.codigo, 10) || 0), 0)

    const semCodigoOrdenados = [...semCodigo].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    )

    for (let i = 0; i < semCodigoOrdenados.length; i++) {
      const codigo = String(maxExistente + i + 1).padStart(4, '0')
      await supabase.from('pessoas').update({ codigo }).eq('id', semCodigoOrdenados[i].id)
    }

    await fetchPessoas()
    setGerandoCodigos(false)
  }
  const { colunas } = useConfig()
  const gcal = useGoogleCalendar()

  const openEdit = (pessoa) => { setEditingPessoa(pessoa); setModalOpen(true) }
  const openNew  = () => { setEditingPessoa(null); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditingPessoa(null) }

  const fetchPessoas = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('pessoas')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError('Erro ao buscar pessoas: ' + error.message)
    else setPessoas(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchPessoas() }, [fetchPessoas])

  const handleDelete = async (id) => {
    const { error } = await supabase.from('pessoas').delete().eq('id', id)
    if (!error) setPessoas(prev => prev.filter(p => p.id !== id))
  }

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  const handleSaved = () => { fetchPessoas(); closeModal() }

  const handleSync = async () => {
    const feitos = await gcal.sync(pessoas)
    if (feitos !== undefined) {
      setSyncFeedback(`${feitos} aniversário${feitos !== 1 ? 's' : ''} sincronizado${feitos !== 1 ? 's' : ''}!`)
      setTimeout(() => setSyncFeedback(null), 4000)
    }
  }

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #6c63ff33, #8b85ff22)',
            border: '1px solid rgba(108,99,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={20} color="#a5a0ff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0f0ff' }}>Cadastro de Pessoas</h1>
            <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.5)', marginTop: 2 }}>
              {pessoas.length} pessoa{pessoas.length !== 1 ? 's' : ''} cadastrada{pessoas.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Feedback de sync */}
          {syncFeedback && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#43e97b' }}>
              <CheckCircle size={14} /> {syncFeedback}
            </div>
          )}

          {/* Progresso de sync */}
          {gcal.syncing && gcal.progress && (
            <div style={{ fontSize: 13, color: 'rgba(240,240,255,0.5)' }}>
              <Loader size={13} className="spin" style={{ display: 'inline', marginRight: 6 }} />
              {gcal.progress.feitos}/{gcal.progress.total}
            </div>
          )}

          {/* Botão Google Calendar */}
          {gcal.ready && (
            gcal.connected ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleSync}
                  disabled={gcal.syncing}
                  className="btn-primary"
                  style={{ background: 'rgba(66,133,244,0.2)', border: '1px solid rgba(66,133,244,0.4)', color: '#7eb8f7' }}
                >
                  {gcal.syncing
                    ? <Loader size={14} className="spin" />
                    : <CalendarDays size={14} />}
                  {gcal.syncing ? 'Sincronizando...' : 'Sincronizar'}
                </button>
                <button
                  onClick={gcal.desconectar}
                  className="btn-primary"
                  title="Desconectar Google Calendar"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,240,255,0.45)', padding: '10px 12px' }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={gcal.connect}
                className="btn-primary"
                style={{ background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.3)', color: '#7eb8f7' }}
              >
                <CalendarDays size={14} />
                Conectar Google Calendar
              </button>
            )
          )}

          <button
            onClick={fetchPessoas}
            className="btn-primary"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,240,255,0.8)' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Atualizar
          </button>
          <button onClick={openNew} className="btn-primary">
            <UserPlus size={14} />
            Cadastrar
          </button>
        </div>
      </div>

      {/* Aviso de pessoas sem código */}
      {semCodigo.length > 0 && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span style={{ fontSize: 13, color: 'rgba(240,240,255,0.65)' }}>
            {semCodigo.length} pessoa{semCodigo.length !== 1 ? 's' : ''} sem código (importadas).
          </span>
          <button
            onClick={gerarCodigos}
            disabled={gerandoCodigos}
            className="btn-primary"
            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', whiteSpace: 'nowrap' }}
          >
            {gerandoCodigos ? <Loader size={13} className="spin" /> : <Hash size={13} />}
            {gerandoCodigos ? 'Gerando...' : 'Gerar Códigos'}
          </button>
        </div>
      )}

      {/* Erro Google Calendar */}
      {gcal.error && (
        <div style={{
          marginBottom: 16, padding: '10px 14px', borderRadius: 10,
          background: 'rgba(255,99,99,0.08)', border: '1px solid rgba(255,99,99,0.2)',
          color: '#ff8fa3', fontSize: 13,
        }}>
          {gcal.error}
        </div>
      )}

      {/* Última sincronização */}
      {gcal.lastSync && gcal.connected && (
        <div style={{ marginBottom: 16, fontSize: 12, color: 'rgba(240,240,255,0.3)' }}>
          Última sincronização: {gcal.lastSync}
        </div>
      )}

      {/* Modal */}
      {modalOpen && createPortal(
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div style={{
            width: '100%', maxWidth: 780,
            maxHeight: '90vh', overflowY: 'auto',
            background: '#1e1b3a',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 16,
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}>
            <PessoasForm onSaved={handleSaved} onClose={closeModal} editData={editingPessoa} />
          </div>
        </div>,
        document.body
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 20, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(255,99,99,0.1)', border: '1px solid rgba(255,99,99,0.25)',
          color: '#ff8fa3', fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Table */}
      <PessoasTable
        pessoas={pessoas}
        loading={loading}
        onDelete={handleDelete}
        onEdit={openEdit}
        colunas={colunas}
      />
    </div>
  )
}
