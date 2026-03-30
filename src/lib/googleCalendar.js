const SCOPES = 'https://www.googleapis.com/auth/calendar.events'
const CALENDAR_ID = 'primary'
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

let gapiReady = false
let gisReady = false
let tokenClient = null

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export async function initGoogle() {
  await Promise.all([
    loadScript('https://apis.google.com/js/api.js'),
    loadScript('https://accounts.google.com/gsi/client'),
  ])

  await new Promise((resolve) => {
    window.gapi.load('client', resolve)
  })

  await window.gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  })

  gapiReady = true

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '',
  })

  gisReady = true
}

export function isReady() {
  return gapiReady && gisReady
}

export function isConnected() {
  return !!window.gapi?.client?.getToken()?.access_token
}

export function requestToken() {
  return new Promise((resolve, reject) => {
    tokenClient.callback = (resp) => {
      if (resp.error) reject(new Error(resp.error))
      else resolve(resp)
    }
    tokenClient.requestAccessToken({ prompt: isConnected() ? '' : 'consent' })
  })
}

export function disconnect() {
  const token = window.gapi?.client?.getToken()
  if (token) {
    window.google.accounts.oauth2.revoke(token.access_token)
    window.gapi.client.setToken(null)
  }
}

function proximaOcorrencia(dataNascimento) {
  const hoje = new Date()
  const [, mes, dia] = dataNascimento.split('-')
  let ano = hoje.getFullYear()
  const deste = new Date(ano, parseInt(mes) - 1, parseInt(dia))
  if (deste < hoje) ano++
  return `${ano}-${mes}-${dia}`
}


function montarEvento(pessoa) {
  // Evento às 18h — permite calcular lembretes às 9h (540 min antes), 13h (300 min antes) e 18h (0 min)
  const data = proximaOcorrencia(pessoa.data_nascimento)
  return {
    summary: `Aniversário de ${pessoa.nome}`,
    description: `Aniversário de ${pessoa.nome}${pessoa.codigo ? ` (Código: ${pessoa.codigo})` : ''}`,
    start: { dateTime: `${data}T18:00:00`, timeZone: 'America/Sao_Paulo' },
    end:   { dateTime: `${data}T18:30:00`, timeZone: 'America/Sao_Paulo' },
    recurrence: ['RRULE:FREQ=YEARLY'],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 540 }, // 9h00
        { method: 'popup', minutes: 300 }, // 13h00
        { method: 'popup', minutes: 0   }, // 18h00
      ],
    },
    extendedProperties: {
      private: { mjaPessoaId: pessoa.id },
    },
  }
}

async function buscarEventosExistentes() {
  const existentes = {}
  try {
    // A API não suporta busca por extendedProperties sem pageToken loop, então buscamos via campo
    const res = await window.gapi.client.calendar.events.list({
      calendarId: CALENDAR_ID,
      privateExtendedProperty: 'mjaPessoaId',
      maxResults: 2500,
      singleEvents: false,
    })
    for (const ev of res.result.items || []) {
      const id = ev.extendedProperties?.private?.mjaPessoaId
      if (id) existentes[id] = ev.id
    }
  } catch {
    // Se falhar, apenas não atualiza os já existentes
  }
  return existentes
}

export async function syncAniversarios(pessoas, onProgress) {
  const comAniversario = pessoas.filter(p => !!p.data_nascimento)
  const existentes = await buscarEventosExistentes()

  let feitos = 0
  for (const pessoa of comAniversario) {
    const evento = montarEvento(pessoa)
    try {
      if (existentes[pessoa.id]) {
        await window.gapi.client.calendar.events.update({
          calendarId: CALENDAR_ID,
          eventId: existentes[pessoa.id],
          resource: evento,
        })
      } else {
        await window.gapi.client.calendar.events.insert({
          calendarId: CALENDAR_ID,
          resource: evento,
        })
      }
    } catch (e) {
      console.error(`Erro ao sincronizar ${pessoa.nome}:`, e)
    }
    feitos++
    onProgress?.(feitos, comAniversario.length)
  }

  return feitos
}
