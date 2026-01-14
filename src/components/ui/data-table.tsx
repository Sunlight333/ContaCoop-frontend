import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  emptyMessage?: string;
  stickyHeader?: boolean;
  compact?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  className,
  emptyMessage = 'No data available',
  stickyHeader = false,
  compact = false,
}: DataTableProps<T>) {
  const getNestedValue = (obj: T, path: string): unknown => {
    return path.split('.').reduce((acc: unknown, part) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  };

  return (
    <div className={cn('rounded-lg border border-border bg-card overflow-hidden', className)}>
      <div className={cn('overflow-auto scrollbar-thin', stickyHeader && 'max-h-[600px]')}>
        <Table>
          <TableHeader className={cn(stickyHeader && 'sticky top-0 bg-muted/50 backdrop-blur-sm z-10')}>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    'font-semibold text-foreground',
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center',
                    compact ? 'py-2 px-3' : 'py-3 px-4',
                    column.className
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="transition-colors">
                  {columns.map((column) => (
                    <TableCell
                      key={`${item.id}-${String(column.key)}`}
                      className={cn(
                        column.align === 'right' && 'text-right',
                        column.align === 'center' && 'text-center',
                        compact ? 'py-2 px-3' : 'py-3 px-4',
                        column.className
                      )}
                    >
                      {column.cell
                        ? column.cell(item)
                        : String(getNestedValue(item, String(column.key)) ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
