import React from 'react'

export function CheckupHistoryView({ records = [] }) {
  return (
    <div className="view-pane history-pane">
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
          <tbody>
            {(records || []).map((record) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CheckupHistoryView
