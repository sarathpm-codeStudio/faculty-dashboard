import { useState, useEffect, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type TableColumn<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
  headerClassName?: string
  cellClassName?: string
}

type DataTableProps<T> = {
  columns: TableColumn<T>[]
  data: T[]
  defaultPageSize?: number
  className?: string
  onRangeChange?: (start: number, end: number, total: number) => void
  onRowClick?: (row: T) => void
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]

function DataTable<T>({ columns, data, defaultPageSize = 10, className = '', onRangeChange, onRowClick }: DataTableProps<T>) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  const start = (page - 1) * pageSize
  const end = Math.min(start + pageSize, data.length)
  const pageData = data.slice(start, end)

  const goTo = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)))

  useEffect(() => {
    onRangeChange?.(start + 1, end, data.length)
  }, [start, end, data.length])

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, '...', totalPages]
    if (page >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden ${className}`}>
      <div className="flex-1 min-h-0 overflow-auto scrollbar-hide">
        <table className="w-full min-w-[720px]">
          <thead className="sticky top-0 z-10 bg-[#F2F4F6]">
            <tr className="border-b border-gray-100">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 md:px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#767683] whitespace-nowrap ${col.headerClassName ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pageData.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-gray-50/60 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-4 md:px-6 py-4 text-sm ${col.cellClassName ?? ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 md:px-6 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-[#767683] font-medium hidden sm:inline">Rows per page:</span>
          <span className="text-xs text-[#767683] font-medium sm:hidden">Rows:</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="h-8 w-16 rounded-lg border border-gray-200 bg-white px-2 text-sm font-semibold text-[#191c1e] focus:outline-none cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#767683] hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          {getPageNumbers().map((p, i) =>
            p === '...'
              ? (
                <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-[#767683]">
                  …
                </span>
              )
              : (
                <button
                  key={p}
                  onClick={() => goTo(p as number)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    page === p
                      ? 'bg-[#000B60] text-white'
                      : 'border border-gray-200 text-[#767683] hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              )
          )}
          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#767683] hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataTable
