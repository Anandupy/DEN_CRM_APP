import React from 'react';

export interface DataTableColumn<T> {
  key: string;
  title: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

export default function DataTable<T>({
  columns,
  rows,
  emptyState = 'No records found.',
}: {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  emptyState?: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide ${column.className ?? ''}`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={index} className="table-row-hover">
                  {columns.map((column) => (
                    <td key={column.key} className={`px-4 py-3 ${column.className ?? ''}`}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-zinc-600">
                  {emptyState}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
