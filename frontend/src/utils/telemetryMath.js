export function buildChartPoints(values, options = {}) {
  const { defaultMin = 50, defaultMax = 140, minSpan = 30, width = 320, height = 120 } = options
  if (!values || !values.length) return '0,60 320,60'
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  let min = Math.min(rawMin, defaultMin)
  let max = Math.max(rawMax, defaultMax)
  if (max - min < minSpan) {
    const mid = (max + min) / 2
    min = Math.floor(mid - minSpan / 2)
    max = Math.ceil(mid + minSpan / 2)
  }
  const range = max - min || 1
  return values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * width
    const y = height - 16 - Math.max(0, Math.min(1, (v - min) / range)) * (height - 32)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}
