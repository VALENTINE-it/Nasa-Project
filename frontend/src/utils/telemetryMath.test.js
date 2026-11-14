import { buildChartPoints } from './telemetryMath.js'
const pts = buildChartPoints([74, 74, 74])
if (!pts.length) throw new Error('Test failed')
console.log('Telemetry math test passed')
