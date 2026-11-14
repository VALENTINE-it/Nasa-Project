import { Watch } from 'lucide-react'

export function WearableSyncPill({ isConnected, deviceName, steps }) {
  return (
    <div className={`watch-status-pill ${isConnected ? 'connected' : 'disconnected'}`}>
      <Watch size={13} />
      <span>{deviceName || 'Oraimo Watch'}</span>
      {steps ? <span>{steps} steps</span> : null}
    </div>
  )
}
export default WearableSyncPill
