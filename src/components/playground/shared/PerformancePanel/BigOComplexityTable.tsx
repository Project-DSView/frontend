import React from 'react';
import { X } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BigOComplexityTableProps, BigOComplexityInfo } from '@/types';
import { BIG_O_COMPLEXITY_DATA } from '@/data';

const columnHelper = createColumnHelper<BigOComplexityInfo>();

const columns = [
  columnHelper.accessor('notation', {
    header: 'Notation',
    cell: (info) => {
      const { color, notation } = info.row.original;
      return (
        <span className="inline-flex items-center gap-1.5 font-mono font-bold" style={{ color }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {notation}
        </span>
      );
    },
  }),
  columnHelper.accessor('type', {
    header: 'ประเภท',
    cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor('examples', {
    header: 'ตัวอย่าง',
    cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor('description', {
    header: 'คำอธิบาย',
    cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
  }),
];

const BigOComplexityTable: React.FC<BigOComplexityTableProps> = ({
  currentComplexity,
  onClose,
}) => {
  const isActive = (notation: string) => {
    if (!currentComplexity) return false;
    const clean = notation.replace(/[²ⁿ!]/g, (c) => {
      if (c === '²') return '2';
      if (c === 'ⁿ') return '^n';
      if (c === '!') return '!';
      return c;
    });
    return currentComplexity.includes(clean) || currentComplexity.includes(notation);
  };

  const table = useReactTable({
    data: BIG_O_COMPLEXITY_DATA,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border-border animate-in slide-in-from-top-2 mt-3 overflow-hidden rounded-lg border duration-200">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-500/10 px-3 py-2 dark:bg-blue-500/15">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">ตารางอธิบาย</span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-0.5 transition-colors"
          aria-label="ปิดตาราง"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="w-full text-xs">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border border-b bg-blue-500/5 hover:bg-blue-500/5 dark:bg-blue-500/10 dark:hover:bg-blue-500/10"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-foreground h-auto px-3 py-2 text-left font-semibold"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const active = isActive(row.original.notation);
              return (
                <TableRow
                  key={row.id}
                  className={`border-border/50 border-b transition-colors last:border-b-0 ${
                    active
                      ? 'bg-primary/5 hover:bg-primary/5 dark:bg-primary/10 dark:hover:bg-primary/10'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BigOComplexityTable;
