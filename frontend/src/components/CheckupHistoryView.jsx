import React from 'react'
import { ClipboardList } from 'lucide-react'

export function CheckupHistoryView({ records = [] }) {
  const recentRecords = (records || []).slice(0, 3)
  const olderRecords = (records || []).slice(3)

  const renderRows = (list) =>
    list.map((record) => (
      <tr key={record.id}>
        <td>
          <strong>
            {new Date(record.recordedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </strong>
        </td>
        <td>{record.heartRate} bpm</td>
        <td>{record.bloodPressure}</td>
        <td>{record.bloodOxygen}%</td>
        <td>{Number(record.sleepDuration).toFixed(1)} hours</td>
        <td>
          <span className={`table-status-pill ${record.heartRate > 90 ? 'warning' : 'good'}`}>
            {record.heartRate > 90 ? 'HIGH PULSE' : 'NOMINAL'}
          </span>
        </td>
      </tr>
    ))

  return (
    <div className="view-pane history-pane">
      <div className="vitals-group-heading">
        <ClipboardList size={14} strokeWidth={2} />
        <span>Medical Check History</span>
      </div>

      <div className="history-table-wrapper">
        <table className="clean-history-table">
          <thead>
            <tr>
              <th>Date &amp; Time</th>
              <th>Heart Rate</th>
              <th>Blood Pressure</th>
              <th>Blood Oxygen</th>
              <th>Sleep Duration</th>
              <th>Overall Status</th>
            </tr>
          </thead>
          <tbody>{renderRows(recentRecords)}</tbody>
        </table>
      </div>

      {olderRecords.length > 0 && (
        <details className="view-accordion">
          <summary>Earlier Checkup Records ({olderRecords.length} older entries)</summary>
          <div className="accordion-body">
            <div className="history-table-wrapper">
              <table className="clean-history-table">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Heart Rate</th>
                    <th>Blood Pressure</th>
                    <th>Blood Oxygen</th>
                    <th>Sleep Duration</th>
                    <th>Overall Status</th>
                  </tr>
                </thead>
                <tbody>{renderRows(olderRecords)}</tbody>
              </table>
            </div>
          </div>
        </details>
      )}
    </div>
  )
}

export default CheckupHistoryView
