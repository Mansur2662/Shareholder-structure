import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Table, Tag, ConfigProvider, theme, Spin } from 'antd'
import { DonutChart } from './charts/DonutChart.jsx'
import ruRU from 'antd/locale/ru_RU'

const COLOR_MAP = {
  'Группа ИнтерРАО': '#0464a0ff',
  'Free Float': '#d2bdbdff',
  'Роснефтегаз': '#d6a211ff',
  'ФСК ЕЭС': '#b8c6c0ff',
}

const ORDER = ['Группа ИнтерРАО', 'Free Float', 'Роснефтегаз', 'ФСК ЕЭС']


function normalize(rows) {
  const total = rows.reduce((s, r) => s + r.percent, 0)
  if (total === 100) return rows

  const scaled = rows.map(r => ({ ...r, percent: r.percent * (100 / total) }))
  const rounded = scaled.map(r => ({ ...r, percent: Math.round(r.percent * 100) / 100 }))
  const sumRounded = rounded.reduce((s, r) => s + r.percent, 0)
  const delta = Math.round((100 - sumRounded) * 100) / 100

  
  let idx = 0
  for (let i = 1; i < rounded.length; i++) {
    if (rounded[i].percent > rounded[idx].percent) idx = i
  }
  rounded[idx] = { ...rounded[idx], percent: Math.round((rounded[idx].percent + delta) * 100) / 100 }
  return rounded
}

function groupAndNormalize(raw) {
  const map = new Map()
  raw.forEach(({ holder, percent }) => {
    const key = holder.trim()
    map.set(key, (map.get(key) || 0) + Number(percent))
  })
  const grouped = Array.from(map.entries()).map(([holder, percent]) => ({ holder, percent }))
 
  grouped.sort((a, b) => (ORDER.indexOf(a.holder) - ORDER.indexOf(b.holder)))
  return normalize(grouped)
}

export const ShareholdersBlock = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        
        const { data } = await axios.get('/api/shareholders')
        if (!mounted) return
        setRows(groupAndNormalize(data.items || []))
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const columns = useMemo(() => ([
    {
      title: 'Держатель акций',
      dataIndex: 'holder',
      key: 'holder',
      render: text => (
        <div className="holderCell">
          <span className="dot" style={{ backgroundColor: COLOR_MAP[text] || '#999' }} />
          {text}
        </div>
      )
    },
    {
      title: '% Доли',
      dataIndex: 'percent',
      key: 'percent',
      align: 'right',
      render: value => `${value.toFixed(2)} %`
    }
  ]), [])

  const today = new Date()
  const dateStr = `${String(today.getDate()).padStart(2,'0')}.${String(today.getMonth()+1).padStart(2,'0')}.${today.getFullYear()}`

  return (
    <ConfigProvider
      locale={ruRU}
      theme={{ algorithm: theme.defaultAlgorithm }}
    >
      <div className="card shareholders">
        <div className="card-title">Структура акционеров</div>

        {loading ? (
          <div className="loading"><Spin /></div>
        ) : (
          <div className="grid">
            <div className="grid-left">
              <Table
                size="middle"
                rowKey="holder"
                columns={columns}
                dataSource={rows}
                pagination={false}
                className="shareholders-table"
              />
              <div className="updatedAt">Дата последнего обновления этой структуры: {dateStr}</div>
            </div>

            <div className="grid-right">
              <DonutChart data={rows} colorMap={COLOR_MAP} />
              <ul className="legend">
                {rows.map(r => (
                  <li key={r.holder}>
                    <span className="dot" style={{ backgroundColor: COLOR_MAP[r.holder] || '#999' }} />
                    <span className="legend-name">{r.holder}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </ConfigProvider>
  )
}
