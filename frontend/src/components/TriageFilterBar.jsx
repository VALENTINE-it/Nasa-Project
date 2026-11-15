export function TriageFilterBar({ active, onSelect }) {
  return <div className="triage-filter-bar"><button onClick={() => onSelect('all')}>All Incidents</button></div>
}
export default TriageFilterBar
