import { useState } from 'react'
import Sidebar from './components/Sidebar'
import CadastroPessoas from './components/pessoas/CadastroPessoas'
import Analytics from './components/analytics/Analytics'
import Importacao from './components/importacao/Importacao'
import Configuracoes from './components/configuracoes/Configuracoes'
import { ConfigProvider } from './hooks/useConfig'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './components/auth/Login'
import PublicCadastro from './components/public/PublicCadastro'

function AppContent() {
  const [activePage, setActivePage] = useState('cadastro')
  const [showLogin, setShowLogin] = useState(false)
  const { session, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0c1d' }}>
        <div style={{ color: 'rgba(240,240,255,0.4)', fontSize: 14 }}>Carregando...</div>
      </div>
    )
  }

  if (!session) {
    if (showLogin) return <Login onBack={() => setShowLogin(false)} />
    return <PublicCadastro onAdminClick={() => setShowLogin(true)} />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={signOut} />
      <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        {activePage === 'cadastro'      && <CadastroPessoas />}
        {activePage === 'analytics'     && <Analytics />}
        {activePage === 'importacao'    && <Importacao />}
        {activePage === 'configuracoes' && <Configuracoes />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <AppContent />
      </ConfigProvider>
    </AuthProvider>
  )
}
