import { useState } from 'react'
import Sidebar from './components/Sidebar'
import CadastroPessoas from './components/pessoas/CadastroPessoas'
import Analytics from './components/analytics/Analytics'
import Importacao from './components/importacao/Importacao'
import Configuracoes from './components/configuracoes/Configuracoes'
import { ConfigProvider } from './hooks/useConfig'

export default function App() {
  const [activePage, setActivePage] = useState('cadastro')

  return (
    <ConfigProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          {activePage === 'cadastro'      && <CadastroPessoas />}
          {activePage === 'analytics'     && <Analytics />}
          {activePage === 'importacao'    && <Importacao />}
          {activePage === 'configuracoes' && <Configuracoes />}
        </main>
      </div>
    </ConfigProvider>
  )
}
