'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FunctionComplexity } from '@/types';

interface FunctionComplexityTableProps {
  data: FunctionComplexity[];
}

const columnHelper = createColumnHelper<FunctionComplexity>();

const columns = [
  columnHelper.accessor('functionName', {
    header: 'Function',
    cell: (info) => <span className="font-mono">{info.getValue()}</span>,
  }),
  columnHelper.accessor('timeComplexity', {
    header: 'Time',
    cell: (info) => (
      <span className="font-bold text-emerald-700 dark:text-emerald-300">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('spaceComplexity', {
    header: 'Space',
    cell: (info) => (
      <span className="font-bold text-teal-700 dark:text-teal-300">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor((row) => `${row.lineStart}-${row.lineEnd}`, {
    id: 'lines',
    header: 'Lines',
    cell: (info) => <span className="text-gray-500 dark:text-gray-400">{info.getValue()}</span>,
  }),
  columnHelper.accessor('timeComplexityRank', {
    header: 'Rank',
    cell: (info) => {
      const rank = info.getValue();
      const color =
        rank <= 1
          ? 'text-emerald-600'
          : rank <= 2
            ? 'text-teal-600'
            : rank <= 3
              ? 'text-blue-600'
              : rank <= 4
                ? 'text-amber-600'
                : rank <= 5
                  ? 'text-orange-600'
                  : 'text-red-600';
      return <span className={`font-medium ${color}`}>{rank}</span>;
    },
  }),
];

const FunctionComplexityTable: React.FC<FunctionComplexityTableProps> = ({ data }) => {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'timeComplexityRank', desc: true },
  ]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table className="text-xs">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="border-primary/20 dark:border-primary/50">
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className="text-primary hover:bg-primary/10 dark:text-primary-foreground dark:hover:bg-primary/20 h-8 cursor-pointer px-2 text-center"
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex items-center justify-center gap-1">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && '↑'}
                  {header.column.getIsSorted() === 'desc' && '↓'}
                </div>
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} className="border-primary/10 dark:border-primary/20">
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="px-2 py-1 text-center">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

FunctionComplexityTable.displayName = 'FunctionComplexityTable';

export default FunctionComplexityTable;
