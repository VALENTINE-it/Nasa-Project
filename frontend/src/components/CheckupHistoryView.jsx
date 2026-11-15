import React from 'react'
import { ClipboardList, History } from 'lucide-react'
import { Table, StatusChip, Accordion } from '../ui'

export function CheckupHistoryView({ records = [] }) {
  const recentRecords = (records || []).slice(0, 3)
  const olderRecords = (records || []).slice(3)

  const renderTableRows = (list) =>
    list.map((record) => (
      <tr key={record.id}>
        <td>
          <strong style={{ color: 'var(--text-primary)' }}>
            {new Date(record.recordedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </strong>
        </td>
        <td className="hd-table__mono">{record.heartRate} bpm</td>
        <td className="hd-table__mono">{record.bloodPressure}</td>
        <td className="hd-table__mono">{record.bloodOxygen}%</td>
        <td className="hd-table__mono">{Number(record.sleepDuration).toFixed(1)} hours</td>
        <td>
          <StatusChip variant={record.heartRate > 90 ? 'warning' : 'good'}>
            {record.heartRate > 90 ? 'HIGH PULSE' : 'NOMINAL'}
          </StatusChip>
        </td>
      </tr>
    ))

  const tableHead = (
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
  )

  return (
    <div className="view-pane history-pane hd-history-container">
      <div className="hd-history-section-title">
        <ClipboardList size={15} strokeWidth={2} />
        <span>Medical Check History</span>
      </div>

      <Table>
        {tableHead}
        <tbody>{renderTableRows(recentRecords)}</tbody>
      </Table>

      {olderRecords.length > 0 && (
        <Accordion
          title={`Earlier Checkup Records (${olderRecords.length} older entries)`}
          icon={<History size={16} />}
          defaultOpen={false}
        >
          <Table>
            {tableHead}
            <tbody>{renderTableRows(olderRecords)}</tbody>
          </Table>
        </Accordion>
      )}
    </div>
  )
}

export default CheckupHistoryView
