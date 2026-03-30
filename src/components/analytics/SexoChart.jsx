import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = { Masculino: '#7dd3fc', Feminino: '#ff8fa3' }
const RADIAN = Math.PI / 180

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percent < 0.05) return null
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function SexoChart({ pessoas }) {
  const masc = pessoas.filter(p => p.sexo === 'Masculino').length
  const fem = pessoas.filter(p => p.sexo === 'Feminino').length

  const data = [
    { name: 'Masculino', value: masc },
    { name: 'Feminino', value: fem },
  ].filter(d => d.value > 0)

  const empty = data.length === 0

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f0f0ff', marginBottom: 4 }}>Distribuição por Sexo</h3>
      <p style={{ fontSize: 12, color: 'rgba(240,240,255,0.4)', marginBottom: 20 }}>
        {pessoas.length} pessoa{pessoas.length !== 1 ? 's' : ''} no filtro atual
      </p>

      {empty ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,240,255,0.3)', fontSize: 14 }}>
          Sem dados para exibir
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={85}
              innerRadius={40}
              dataKey="value"
              labelLine={false}
              label={CustomLabel}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name] || '#a5a0ff'}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(20,18,50,0.92)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                fontSize: 13,
                color: '#f0f0ff',
              }}
              formatter={(v, name) => [`${v} pessoa${v !== 1 ? 's' : ''}`, name]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ color: 'rgba(240,240,255,0.7)', fontSize: 13 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* Detail rows */}
      {!empty && (
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          {data.map(d => (
            <div key={d.name} style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: COLORS[d.name] || '#a5a0ff' }}>{d.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(240,240,255,0.45)', marginTop: 2 }}>{d.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
