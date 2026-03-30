import { Settings, Loader, RotateCcw, Shield, Check, Table2 } from 'lucide-react'
import { useConfig, CAMPOS_CONFIG, COLUNAS_CONFIG } from '../../hooks/useConfig'

const CAMPOS_FIXOS = [
  { key: 'nome',            label: 'Nome completo',    secao: 'Dados Pessoais' },
  { key: 'data_nascimento', label: 'Data de Nascimento', secao: 'Dados Pessoais' },
  { key: 'sexo',            label: 'Sexo',             secao: 'Dados Pessoais' },
  { key: 'categoria',       label: 'Categoria',        secao: 'Dados Pessoais' },
]

function Toggle({ active, onChange, disabled }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      style={{
        width: 44, height: 24,
        borderRadius: 99,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: active
          ? 'linear-gradient(135deg, #6c63ff, #8b85ff)'
          : 'rgba(255,255,255,0.1)',
        position: 'relative',
        transition: 'background 0.25s',
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{
        width: 18, height: 18,
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: 3,
        left: active ? 23 : 3,
        transition: 'left 0.25s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

function SecaoCard({ titulo, campos, config, saving, onToggle, fixo }) {
  return (
    <div className="glass-card" style={{ padding: '20px 24px', marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(240,240,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
        {titulo}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {campos.map((campo, i) => {
          const obrigatorio = fixo ? true : config[campo.key]
          return (
            <div
              key={campo.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 0',
                borderBottom: i < campos.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: obrigatorio ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${obrigatorio ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {obrigatorio
                    ? <Check size={14} color="#a5a0ff" />
                    : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(240,240,255,0.2)' }} />
                  }
                </div>
                <div>
                  <div style={{ fontSize: 14, color: '#f0f0ff', fontWeight: 500 }}>{campo.label}</div>
                  {fixo && (
                    <div style={{ fontSize: 11, color: 'rgba(240,240,255,0.3)', marginTop: 2 }}>
                      Sempre obrigatório
                    </div>
                  )}
                </div>
              </div>

              {fixo ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={13} color="rgba(240,240,255,0.25)" />
                  <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.25)' }}>Fixo</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: obrigatorio ? '#a5a0ff' : 'rgba(240,240,255,0.35)' }}>
                    {obrigatorio ? 'Obrigatório' : 'Opcional'}
                  </span>
                  <Toggle
                    active={obrigatorio}
                    onChange={() => onToggle(campo.key)}
                    disabled={saving}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Configuracoes() {
  const { config, colunas, loading, saving, toggleCampo, toggleColuna, resetConfig } = useConfig()

  const secoes = [...new Set(CAMPOS_CONFIG.map(c => c.secao))]

  return (
    <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(251,191,36,0.12)',
            border: '1px solid rgba(251,191,36,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Settings size={20} color="#fbbf24" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0f0ff' }}>Configurações</h1>
            <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.5)', marginTop: 2 }}>
              Defina quais campos são obrigatórios no cadastro
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saving && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(240,240,255,0.4)' }}>
              <Loader size={13} className="spin" /> Salvando...
            </div>
          )}
          <button
            onClick={resetConfig}
            disabled={saving || loading}
            className="btn-danger"
          >
            <RotateCcw size={13} /> Redefinir padrões
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(240,240,255,0.4)' }}>
          <Loader size={32} className="spin" style={{ margin: '0 auto 14px', display: 'block' }} />
          <p style={{ fontSize: 14 }}>Carregando configurações...</p>
        </div>
      ) : (
        <>
          {/* Info */}
          <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', fontSize: 13, color: 'rgba(240,240,255,0.6)', display: 'flex', gap: 10 }}>
            <Shield size={15} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
            As alterações são salvas automaticamente e aplicadas imediatamente no formulário de cadastro.
          </div>

          {/* Campos fixos */}
          {(() => {
            const secosFixas = [...new Set(CAMPOS_FIXOS.map(c => c.secao))]
            return secosFixas.map(secao => (
              <SecaoCard
                key={`fixo-${secao}`}
                titulo={secao}
                campos={CAMPOS_FIXOS.filter(c => c.secao === secao)}
                config={config}
                saving={saving}
                onToggle={toggleCampo}
                fixo
              />
            ))
          })()}

          {/* Campos configuráveis */}
          {secoes.map(secao => (
            <SecaoCard
              key={secao}
              titulo={secao}
              campos={CAMPOS_CONFIG.filter(c => c.secao === secao)}
              config={config}
              saving={saving}
              onToggle={toggleCampo}
              fixo={false}
            />
          ))}

          {/* Colunas da tabela */}
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(67,233,123,0.1)',
                border: '1px solid rgba(67,233,123,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Table2 size={16} color="#43e97b" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0ff' }}>Colunas da Tabela</div>
                <div style={{ fontSize: 12, color: 'rgba(240,240,255,0.4)', marginTop: 1 }}>
                  Escolha quais colunas aparecem na listagem de pessoas
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {COLUNAS_CONFIG.map((col, i) => {
                  const ativo = col.fixo || colunas[col.key]
                  return (
                    <div
                      key={col.key}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 0',
                        borderBottom: i < COLUNAS_CONFIG.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: ativo ? 'rgba(67,233,123,0.12)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${ativo ? 'rgba(67,233,123,0.3)' : 'rgba(255,255,255,0.08)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}>
                          {ativo
                            ? <Check size={14} color="#43e97b" />
                            : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(240,240,255,0.2)' }} />
                          }
                        </div>
                        <div>
                          <div style={{ fontSize: 14, color: '#f0f0ff', fontWeight: 500 }}>{col.label}</div>
                          {col.fixo && (
                            <div style={{ fontSize: 11, color: 'rgba(240,240,255,0.3)', marginTop: 2 }}>
                              Sempre visível
                            </div>
                          )}
                        </div>
                      </div>

                      {col.fixo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Shield size={13} color="rgba(240,240,255,0.25)" />
                          <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.25)' }}>Fixo</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 12, color: ativo ? '#43e97b' : 'rgba(240,240,255,0.35)' }}>
                            {ativo ? 'Visível' : 'Oculta'}
                          </span>
                          <Toggle active={ativo} onChange={() => toggleColuna(col.key)} disabled={saving} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
