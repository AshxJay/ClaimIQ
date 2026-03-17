import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  onRowClick?: (row: T) => void
  globalFilter?: string
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  isLoading?: boolean
  emptyMessage?: string
  className?: string
  enablePagination?: boolean
  pageSize?: number
}

const densityPadding = {
  compact: 'py-2 px-3 text-xs',
  comfortable: 'py-3 px-4 text-sm',
  spacious: 'py-4 px-5 text-sm',
}

const rowVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.25 },
  }),
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  globalFilter = '',
  rowSelection,
  onRowSelectionChange,
  isLoading,
  emptyMessage = 'No data found',
  className,
  enablePagination = true,
  pageSize: initialPageSize = 10,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const { rowDensity } = useUIStore()

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection: rowSelection ?? {},
    },
    enableRowSelection: !!onRowSelectionChange,
    onRowSelectionChange: onRowSelectionChange
      ? (updater) => {
          const newState = typeof updater === 'function' ? updater(rowSelection ?? {}) : updater
          onRowSelectionChange(newState)
        }
      : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    initialState: { pagination: { pageSize: initialPageSize } },
  })

  const cell = densityPadding[rowDensity]
  const headerCell = densityPadding[rowDensity]

  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-border-subtle', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead className="border-b border-border-subtle bg-bg-elevated/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        headerCell,
                        'text-left text-xs font-semibold text-text-muted uppercase tracking-wide select-none whitespace-nowrap sticky top-0 bg-bg-elevated/80 backdrop-blur-sm',
                        canSort && 'cursor-pointer hover:text-text-primary',
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-text-muted/60">
                            {sorted === 'asc' ? (
                              <ChevronUp size={13} />
                            ) : sorted === 'desc' ? (
                              <ChevronDown size={13} />
                            ) : (
                              <ChevronsUpDown size={13} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            <AnimatePresence>
              {table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    'border-b border-border-subtle/50 last:border-0 group',
                    'transition-all duration-150',
                    onRowClick && 'cursor-pointer',
                    row.getIsSelected() && 'bg-brand-blue/5',
                    !row.getIsSelected() && 'hover:bg-bg-elevated/50',
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        densityPadding[rowDensity],
                        'text-text-primary',
                        // Left border accent on hover
                        'relative first:before:absolute first:before:inset-y-0 first:before:left-0 first:before:w-0.5',
                        'first:before:bg-brand-blue first:before:opacity-0 group-hover:first:before:opacity-100',
                        'first:before:transition-opacity first:before:duration-150',
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>

            {!isLoading && table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-text-muted text-sm">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-bg-elevated/30">
          <p className="text-xs text-text-muted">
            {table.getFilteredSelectedRowModel().rows.length > 0
              ? `${table.getFilteredSelectedRowModel().rows.length} of `
              : ''}
            {table.getFilteredRowModel().rows.length} rows
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card disabled:opacity-30 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-text-secondary px-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card disabled:opacity-30 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
