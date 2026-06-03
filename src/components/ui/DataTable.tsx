


import { useEffect, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

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
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  className?: string
  hidePagination?: boolean
  loading?: boolean
  onRangeChange?: (start: number, end: number, total: number) => void
  onRowClick?: (row: T) => void
  /** Keeps the scroll area at a fixed height for this many rows (min + max), even with fewer rows. */
  fixedBodyRows?: number
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]
/** Matches thead py-4 + header text (~49px). */
const TABLE_HEAD_HEIGHT_PX = 49
/** Matches tbody py-4 + typical cell content (~62px). */
const TABLE_ROW_HEIGHT_PX = 62

function bodyScrollHeight(rows: number) {
  return `${TABLE_HEAD_HEIGHT_PX + rows * TABLE_ROW_HEIGHT_PX}px`
}

function DataTable<T>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = '',
  hidePagination = false,
  loading = false,
  onRangeChange,
  onRowClick,
  fixedBodyRows,
}: DataTableProps<T>) {
  const bodyScrollStyle = fixedBodyRows
    ? { minHeight: bodyScrollHeight(fixedBodyRows), maxHeight: bodyScrollHeight(fixedBodyRows) }
    : undefined
  const rowCount = data?.length ?? 0
  const safeTotal =
    typeof total === 'number' && !Number.isNaN(total) ? total : rowCount
  const totalPages = Math.max(1, Math.ceil(safeTotal / pageSize))
  const start = safeTotal === 0 ? 0 : (page - 1) * pageSize + 1
  const end =
    safeTotal === 0
      ? 0
      : Math.min(page * pageSize, safeTotal, start + rowCount - 1)

  useEffect(() => {
    onRangeChange?.(start, end, safeTotal)
  }, [start, end, safeTotal])

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, '...', totalPages]
    if (page >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  const emptyRowCount =
    fixedBodyRows && !loading && rowCount > 0
      ? Math.max(0, fixedBodyRows - rowCount)
      : 0

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden ${className}`}>
      <div
        className={`min-h-0 overflow-auto scrollbar-hide ${fixedBodyRows ? '' : 'flex-1'}`}
        style={bodyScrollStyle}
      >
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-[#F2F4F6]">
            <tr className="border-b border-gray-100">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#767683] ${col.headerClassName ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={28} className="text-[#000B60] animate-spin" />
                  </div>
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <p className="text-sm font-semibold text-[#767683]">No data found</p>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {data?.map((row, i) => (
                  <tr
                    key={i}
                    onClick={() => onRowClick?.(row)}
                    className={`hover:bg-gray-50/60 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {columns.map(col => (
                      <td key={col.key} className={`px-6 py-4 text-sm ${col.cellClassName ?? ''}`}>
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
                {Array.from({ length: emptyRowCount }).map((_, i) => (
                  <tr key={`empty-${i}`} aria-hidden>
                    {columns.map(col => (
                      <td key={col.key} className={`px-6 py-4 text-sm ${col.cellClassName ?? ''}`}>
                        {'\u00A0'}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {!hidePagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          {/* Page size selector */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-[#767683] font-medium">Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => {
                onPageSizeChange(Number(e.target.value))
                onPageChange(1) // reset to page 1 on size change
              }}
              className="h-8 w-16 rounded-lg border border-gray-200 bg-white px-2 text-sm font-semibold text-[#191c1e] focus:outline-none cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Page buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#767683] hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-[#767683]">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${page === p
                    ? 'bg-[#000B60] text-white'
                    : 'border border-gray-200 text-[#767683] hover:bg-gray-50'
                    }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#767683] hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable