import { Radio } from 'lucide-react'

export function HoustonAdvisoryBanner({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className={`houston-comms-banner ${message.severity || 'advisory'}`}>
      <Radio size={16} />
      <span>{message.body}</span>
      <button onClick={() => onDismiss(message.id)}>Dismiss</button>
    </div>
  )
}
export default HoustonAdvisoryBanner
