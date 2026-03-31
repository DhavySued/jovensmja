import PessoasForm from '../pessoas/PessoasForm'

export default function PublicCadastro({ onAdminClick }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0c1d',
      padding: '40px 16px',
    }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6c63ff, #8b85ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: '#fff',
            margin: '0 auto 16px',
            boxShadow: '0 4px 16px rgba(108,99,255,0.4)',
          }}>M</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f0f0ff', marginBottom: 8 }}>
            Cadastro — Jovens MJA
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(240,240,255,0.45)' }}>
            Preencha seus dados para fazer parte do nosso cadastro
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
        }}>
          <PessoasForm onSaved={() => {}} />
        </div>

        {/* Link discreto para admin */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            onClick={onAdminClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(240,240,255,0.12)',
              fontSize: 12,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Administrador
          </button>
        </div>
      </div>
    </div>
  )
}
