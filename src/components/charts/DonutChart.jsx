import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export const DonutChart = ({ data, colorMap }) => {
  const chartData = data.map(d => ({ name: d.holder, value: d.percent }))
  const colors = chartData.map(d => colorMap[d.name] || '#999')

  return (
    <div className="donut-wrapper">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={90}
            outerRadius={140}
            stroke="none"
          >
            {chartData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${Number(v).toFixed(2)} %`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
