import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts'

const FAIXAS = [
  { label: '0–12',  min: 0,  max: 12,  color: '#43e97b' },
  { label: '13–17', min: 13, max: 17,  color: '#38bdf8' },
  { label: '18–25', min: 18, max: 25,  color: '#a5a0ff' },
  { label: '26–35', min: 26, max: 35,  color: '#ff8fa3' },
  { label: '36–50', min: 36, max: 50,  color: '#fbbf24' },
  { label: '50+',   min: 51, max: 999, color: '#f87171' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  return (
    <div style={{
      background: 'rgba(20,18,50,0.92)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
      color: '#f0f0ff',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Faixa {label}</div>
      <div>{v} pessoa{v !== 1 ? 's' : ''}</div>
    </div>
  )
}

export default function FaixaEtariaChart({ pessoas }) {
  const data = FAIXAS.map(f => ({
    ...f,
    value: pessoas.filter(p => p.idade >= f.min && p.idade <= f.max).length,
  }))

  const hasData = data.some(d => d.value > 0)

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f0f0ff', marginBottom: 4 }}>Faixa Etária</h3>
      <p style={{ fontSize: 12, color: 'rgba(240,240,255,0.4)', marginBottom: 20 }}>
        Distribuição de idades por grupo
      </p>

      {!hasData ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,240,255,0.3)', fontSize: 14 }}>
          Sem dados para exibir
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(240,240,255,0.45)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: 'rgba(240,240,255,0.35)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 14 }}>
        {FAIXAS.map(f => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(240,240,255,0.5)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.color }} />
            {f.label}
          </div>
        ))}
      </div>
    </div>
  )
}
