import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export const Table = <T extends object>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  emptyMessage = 'Aucune donnée disponible'
}: TableProps<T>) => {
  if (isLoading) {
    return (
      <div className="w-full flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center p-8 bg-base-200 rounded-lg">
        <p className="text-base-content/60">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="bg-base-200">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'hover:bg-base-200 cursor-pointer' : ''}
            >
              {columns.map((column, colIndex) => (
                <td key={`${rowIndex}-${colIndex}`}>
                  {typeof column.accessor === 'function'
                    ? column.accessor(item)
                    : String(item[column.accessor] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 