import { useState, useEffect } from 'react'
import {
  initGoogle, isReady, isConnected,
  requestToken, disconnect, syncAniversarios,
} from '../lib/googleCalendar'

export function useGoogleCalendar() {
  const [ready, setReady] = useState(false)
  const [connected, setConnected] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState(null) // { feitos, total }
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(() => localStorage.getItem('gcal_lastSync') || null)

  useEffect(() => {
    initGoogle()
      .then(() => {
        setReady(true)
        setConnected(isConnected())
      })
      .catch(() => setError('Falha ao carregar Google API. Verifique as credenciais.'))
  }, [])

  const connect = async () => {
    setError(null)
    try {
      await requestToken()
      setConnected(true)
    } catch (e) {
      setError('Autenticação cancelada ou falhou.')
      throw e
    }
  }

  const desconectar = () => {
    disconnect()
    setConnected(false)
  }

  const sync = async (pessoas) => {
    if (!connected) {
      try { await connect() } catch { return }
    }
    setSyncing(true)
    setProgress({ feitos: 0, total: pessoas.filter(p => p.data_nascimento).length })
    setError(null)
    try {
      const feitos = await syncAniversarios(pessoas, (feitos, total) => {
        setProgress({ feitos, total })
      })
      const agora = new Date().toLocaleString('pt-BR')
      setLastSync(agora)
      localStorage.setItem('gcal_lastSync', agora)
      return feitos
    } catch (e) {
      setError('Erro durante a sincronização: ' + e.message)
    } finally {
      setSyncing(false)
      setProgress(null)
    }
  }

  return { ready, connected, syncing, progress, error, lastSync, connect, desconectar, sync }
}
