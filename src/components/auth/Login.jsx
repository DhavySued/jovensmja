import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { LogIn, Loader } from 'lucide-react'

export default function Login({ onBack }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0c1d',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 32,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6c63ff, #8b85ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(108,99,255,0.4)',
          }}>M</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#f0f0ff' }}>Acesso Administrativo</h1>
          <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.4)', marginTop: 6 }}>Jovens MJA</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: 'rgba(240,240,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
              Email
            </label>
            <input
              className="glass-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: 'rgba(240,240,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
              Senha
            </label>
            <input
              className="glass-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,99,99,0.1)', border: '1px solid rgba(255,99,99,0.25)', color: '#ff8fa3', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <Loader size={14} className="spin" /> : <LogIn size={14} />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            type="button"
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,240,255,0.3)', fontSize: 13, marginTop: 4, fontFamily: 'Inter, sans-serif' }}
          >
            ← Voltar ao cadastro
          </button>
        </form>
      </div>
    </div>
  )
}
