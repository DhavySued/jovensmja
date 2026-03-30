import { useState, useEffect, useContext, createContext } from 'react'
import { supabase } from '../lib/supabase'

export const CAMPOS_CONFIG = [
  { key: 'telefone',           label: 'Telefone',                     secao: 'Dados Pessoais' },
  { key: 'rua',                label: 'Rua',                          secao: 'Endereço' },
  { key: 'numero_casa',        label: 'Número da Casa',               secao: 'Endereço' },
  { key: 'bairro',             label: 'Bairro',                       secao: 'Endereço' },
  { key: 'cidade',             label: 'Cidade',                       secao: 'Endereço' },
  { key: 'como_conheceu',      label: 'Como Conheceu o Ministério',   secao: 'Ministério' },
  { key: 'gosta_fazer',        label: 'O que Gosta de Fazer na Obra', secao: 'Ministério' },
  { key: 'data_conversao',     label: 'Data de Conversão',            secao: 'Ministério' },
  { key: 'data_batismo_aguas', label: 'Data do Batismo nas Águas',    secao: 'Ministério' },
]

export const COLUNAS_CONFIG = [
  { key: 'codigo',        label: 'Código',        fixo: true  },
  { key: 'nome',          label: 'Nome',          fixo: true  },
  { key: 'telefone',      label: 'Telefone',      fixo: false },
  { key: 'nascimento',    label: 'Nascimento',    fixo: false },
  { key: 'idade',         label: 'Idade',         fixo: false },
  { key: 'sexo',          label: 'Sexo',          fixo: false },
  { key: 'categoria',     label: 'Categoria',     fixo: false },
  { key: 'rua',           label: 'Rua',           fixo: false },
  { key: 'bairro',        label: 'Bairro',        fixo: false },
  { key: 'cidade',        label: 'Cidade',        fixo: false },
  { key: 'como_conheceu', label: 'Como Conheceu', fixo: false },
]

const DEFAULT_CONFIG = Object.fromEntries(CAMPOS_CONFIG.map(c => [c.key, false]))
const DEFAULT_COLUNAS = Object.fromEntries(
  COLUNAS_CONFIG.map(c => [c.key, c.fixo || ['nascimento', 'idade', 'sexo', 'categoria'].includes(c.key)])
)

const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [config, setConfig]   = useState(DEFAULT_CONFIG)
  const [colunas, setColunas] = useState(DEFAULT_COLUNAS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    supabase
      .from('configuracoes')
      .select('campos, colunas')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data?.campos)  setConfig({ ...DEFAULT_CONFIG, ...data.campos })
        if (data?.colunas) setColunas({ ...DEFAULT_COLUNAS, ...data.colunas })
        setLoading(false)
      })
  }, [])

  const toggleCampo = async (key) => {
    const next = { ...config, [key]: !config[key] }
    setConfig(next)
    setSaving(true)
    await supabase.from('configuracoes').update({ campos: next }).eq('id', 1)
    setSaving(false)
  }

  const toggleColuna = async (key) => {
    const next = { ...colunas, [key]: !colunas[key] }
    setColunas(next)
    setSaving(true)
    await supabase.from('configuracoes').update({ colunas: next }).eq('id', 1)
    setSaving(false)
  }

  const resetConfig = async () => {
    setConfig(DEFAULT_CONFIG)
    setColunas(DEFAULT_COLUNAS)
    setSaving(true)
    await supabase.from('configuracoes').update({ campos: DEFAULT_CONFIG, colunas: DEFAULT_COLUNAS }).eq('id', 1)
    setSaving(false)
  }

  return (
    <ConfigContext.Provider value={{ config, colunas, loading, saving, toggleCampo, toggleColuna, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  return useContext(ConfigContext)
}
