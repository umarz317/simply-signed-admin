'use client';

import type { FC } from 'react';

export type SpinnerProps = {
  className?: string;
};

export const Spinner: FC<SpinnerProps> = ({ className = 'h-4 w-4 text-indigo-600' }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"
    />
  </svg>
);

export type SkeletonColumn = {
  className?: string;
  skeletonClassName?: string;
};

export type TableSkeletonProps = {
  columns: SkeletonColumn[];
  rows?: number;
};

export const TableSkeleton: FC<TableSkeletonProps> = ({ columns, rows = 4 }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <tr key={rowIndex} className="animate-pulse">
        {columns.map((column, columnIndex) => (
          <td
            key={`${rowIndex}-${columnIndex}`}
            className={column.className ?? 'px-6 py-4 whitespace-nowrap text-sm text-gray-500'}
          >
            <div className={`bg-gray-200 rounded ${column.skeletonClassName ?? 'h-4 w-24'}`} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export type EmptyRowProps = {
  colSpan: number;
  message: string;
};

export const EmptyRow: FC<EmptyRowProps> = ({ colSpan, message }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-12 text-center text-sm text-gray-500">
      {message}
    </td>
  </tr>
);
