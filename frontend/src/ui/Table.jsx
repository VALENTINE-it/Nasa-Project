export default function Table({
  columns,
  data,
  children,
  className = '',
  containerClassName = '',
  maxHeight,
  ...rest
}) {
  return (
    <div
      className={`hd-table-container ${containerClassName}`}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className={`hd-table ${className}`} {...rest}>
        {columns && (
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  style={col.align ? { textAlign: col.align } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
        )}
        {data && (
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={row.id || rowIdx}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={col.mono ? 'hd-table__mono' : ''}
                    style={col.align ? { textAlign: col.align } : undefined}
                  >
                    {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
        {children}
      </table>
    </div>
  )
}
