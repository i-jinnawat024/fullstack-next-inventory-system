'use client';

import { useState, useMemo, useEffect, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: { label: string; value: string }[];
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [key: string]: string;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface SelectionConfig {
  enabled: boolean;
  selectedRows: Set<string>;
  onSelectionChange: (selectedRows: Set<string>) => void;
  getRowId: (row: any) => string;
}

export interface TableAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'danger';
  disabled?: (row: T) => boolean;
}

export interface BulkAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (rows: T[]) => void;
  variant?: 'default' | 'danger';
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyState?: ReactNode;
  
  // Sorting
  sortable?: boolean;
  defaultSort?: SortConfig;
  onSortChange?: (sort: SortConfig | null) => void;
  
  // Filtering
  filterable?: boolean;
  globalSearch?: boolean;
  onFilterChange?: (filters: FilterConfig) => void;
  
  // Pagination
  pagination?: PaginationConfig;
  onPaginationChange?: (page: number, pageSize: number) => void;
  
  // Selection
  selection?: SelectionConfig;
  
  // Actions
  actions?: TableAction<T>[];
  bulkActions?: BulkAction<T>[];
  
  // Row interaction
  onRowClick?: (row: T) => void;
  
  // Styling
  className?: string;
  stickyHeader?: boolean;
}

// ============================================================================
// Helper Components
// ============================================================================

function TableSkeleton({ columns }: { columns: ColumnDef<any>[] }) {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {columns.map((col, colIndex) => (
            <div key={colIndex} style={{ width: col.width || 'auto', flex: col.width ? undefined : 1 }}>
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function MobileCardSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, index) => (
        <div 
          key={index}
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message, customState }: { message: string; customState?: ReactNode }) {
  if (customState) {
    return <>{customState}</>;
  }
  
  return (
    <div 
      className="flex flex-col items-center justify-center py-12 px-4 rounded-lg"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <svg
        className="w-16 h-16 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <p 
        className="text-base font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {message}
      </p>
    </div>
  );
}

interface MobileCardViewProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  selection?: SelectionConfig;
  actions?: TableAction<T>[];
  onRowClick?: (row: T) => void;
  getCellValue: (row: T, column: ColumnDef<T>) => any;
}

function MobileCardView<T extends Record<string, any>>({
  data,
  columns,
  selection,
  actions,
  onRowClick,
  getCellValue,
}: MobileCardViewProps<T>) {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  // Show first 3 columns as primary, rest as expandable
  const primaryColumns = columns.slice(0, 3);
  const secondaryColumns = columns.slice(3);

  return (
    <div className="space-y-3">
      {data.map((row, index) => {
        const rowId = selection?.getRowId(row);
        const isSelected = selection && rowId ? selection.selectedRows.has(rowId) : false;
        const isExpanded = expandedCards.has(index);

        return (
          <div
            key={index}
            className="rounded-lg overflow-hidden transition-all duration-200"
            style={{
              backgroundColor: isSelected 
                ? 'var(--color-primary-light, rgba(37, 99, 235, 0.1))' 
                : 'var(--color-surface)',
              border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            {/* Card Header */}
            <div 
              className="p-4"
              onClick={() => onRowClick?.(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {/* Selection checkbox and primary info */}
              <div className="flex items-start gap-3 mb-3">
                {selection?.enabled && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newSelection = new Set(selection.selectedRows);
                      if (rowId) {
                        if (newSelection.has(rowId)) {
                          newSelection.delete(rowId);
                        } else {
                          newSelection.add(rowId);
                        }
                        selection.onSelectionChange(newSelection);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded cursor-pointer mt-1 flex-shrink-0"
                    style={{
                      accentColor: 'var(--color-primary)',
                      minWidth: '44px',
                      minHeight: '44px',
                    }}
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  {primaryColumns.map((column, colIndex) => (
                    <div key={column.id} className={colIndex > 0 ? 'mt-2' : ''}>
                      <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {column.header}
                      </div>
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {getCellValue(row, column)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expandable secondary info */}
              {secondaryColumns.length > 0 && (
                <>
                  {isExpanded && (
                    <div 
                      className="pt-3 mt-3 space-y-2"
                      style={{ borderTop: '1px solid var(--color-border)' }}
                    >
                      {secondaryColumns.map((column) => (
                        <div key={column.id} className="flex justify-between items-start gap-2">
                          <span className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                            {column.header}:
                          </span>
                          <span className="text-sm text-right" style={{ color: 'var(--color-text)' }}>
                            {getCellValue(row, column)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCard(index);
                    }}
                    className="mt-3 text-xs font-medium flex items-center gap-1 transition-colors duration-150"
                    style={{ 
                      color: 'var(--color-primary)',
                      minHeight: '44px',
                      minWidth: '44px',
                    }}
                  >
                    {isExpanded ? 'แสดงน้อยลง' : 'แสดงเพิ่มเติม'}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Actions */}
              {actions && actions.length > 0 && (
                <div 
                  className="flex flex-wrap gap-2 pt-3 mt-3"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  {actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(row);
                      }}
                      disabled={action.disabled?.(row)}
                      className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 flex-1"
                      style={{
                        backgroundColor: action.variant === 'danger' 
                          ? 'var(--color-error)' 
                          : 'var(--color-primary)',
                        color: '#ffffff',
                        opacity: action.disabled?.(row) ? 0.5 : 1,
                        cursor: action.disabled?.(row) ? 'not-allowed' : 'pointer',
                        minHeight: '44px',
                      }}
                    >
                      {action.icon && <span className="mr-1">{action.icon}</span>}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main DataTable Component
// ============================================================================

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = THAI_LABELS.noData,
  emptyState,
  sortable = false,
  defaultSort,
  onSortChange,
  filterable = false,
  globalSearch = false,
  onFilterChange,
  pagination,
  onPaginationChange,
  selection,
  actions,
  bulkActions,
  onRowClick,
  className = '',
  stickyHeader = true,
}: DataTableProps<T>) {
  // ============================================================================
  // State Management
  // ============================================================================
  
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);
  const [filters, setFilters] = useState<FilterConfig>({});
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ============================================================================
  // Helper Functions
  // ============================================================================
  
  const getCellValue = (row: T, column: ColumnDef<T>): any => {
    if (column.cell) {
      return column.cell(row);
    }
    
    if (!column.accessorKey) {
      return null;
    }
    
    const key = column.accessorKey as string;
    if (key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], row);
    }
    
    return row[key];
  };

  // ============================================================================
  // Filtering Logic
  // ============================================================================
  
  const handleGlobalSearch = (term: string) => {
    setGlobalSearchTerm(term);
  };

  const handleFilterChange = (columnId: string, value: string) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === 'all') {
      delete newFilters[columnId];
    } else {
      newFilters[columnId] = value;
    }
    
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Apply global search
    if (globalSearch && globalSearchTerm) {
      const searchLower = globalSearchTerm.toLowerCase();
      result = result.filter(row => {
        return columns.some(column => {
          const value = getCellValue(row, column);
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }
    
    // Apply column filters
    Object.entries(filters).forEach(([columnId, filterValue]) => {
      const column = columns.find(col => col.id === columnId);
      if (!column) return;
      
      result = result.filter(row => {
        const cellValue = getCellValue(row, column);
        if (cellValue === null || cellValue === undefined) return false;
        
        const cellString = String(cellValue).toLowerCase();
        const filterString = filterValue.toLowerCase();
        
        return cellString.includes(filterString);
      });
    });
    
    return result;
  }, [data, globalSearchTerm, filters, columns, globalSearch]);

  // ============================================================================
  // Sorting Logic
  // ============================================================================
  
  const handleSort = (columnId: string) => {
    if (!sortable) return;
    
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;
    
    let newSort: SortConfig | null = null;
    
    if (!sortConfig || sortConfig.key !== columnId) {
      newSort = { key: columnId, direction: 'asc' };
    } else if (sortConfig.direction === 'asc') {
      newSort = { key: columnId, direction: 'desc' };
    } else {
      newSort = null;
    }
    
    setSortConfig(newSort);
    onSortChange?.(newSort);
  };

  const sortedData = useMemo(() => {
    const dataToSort = filteredData;
    if (!sortConfig) return dataToSort;
    
    const column = columns.find(col => col.id === sortConfig.key);
    if (!column) return dataToSort;
    
    return [...dataToSort].sort((a, b) => {
      const aValue = getCellValue(a, column);
      const bValue = getCellValue(b, column);
      
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig, columns]);

  // ============================================================================
  // Pagination Logic
  // ============================================================================
  
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination]);

  const totalPages = pagination ? Math.ceil(sortedData.length / pagination.pageSize) : 1;
  const startRow = pagination ? (pagination.page - 1) * pagination.pageSize + 1 : 1;
  const endRow = pagination ? Math.min(pagination.page * pagination.pageSize, sortedData.length) : sortedData.length;

  const handlePageChange = (newPage: number) => {
    if (!pagination || !onPaginationChange) return;
    onPaginationChange(newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (!pagination || !onPaginationChange) return;
    onPaginationChange(1, newPageSize);
  };

  const getPageNumbers = () => {
    if (!pagination) return [];
    
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (pagination.page > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, pagination.page - 1);
      const end = Math.min(totalPages - 1, pagination.page + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (pagination.page < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  // ============================================================================
  // Selection Logic
  // ============================================================================
  
  const isAllSelected = selection && data.length > 0 && 
    data.every(row => selection.selectedRows.has(selection.getRowId(row)));
  
  const isSomeSelected = selection && selection.selectedRows.size > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (!selection) return;
    
    if (isAllSelected) {
      selection.onSelectionChange(new Set());
    } else {
      const allIds = new Set(data.map(row => selection.getRowId(row)));
      selection.onSelectionChange(allIds);
    }
  };

  const handleSelectRow = (row: T) => {
    if (!selection) return;
    
    const rowId = selection.getRowId(row);
    const newSelection = new Set(selection.selectedRows);
    
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    
    selection.onSelectionChange(newSelection);
  };

  // ============================================================================
  // Render Loading State
  // ============================================================================
  
  if (loading) {
    return (
      <div className={className}>
        {isMobile ? <MobileCardSkeleton /> : <TableSkeleton columns={columns} />}
      </div>
    );
  }

  // ============================================================================
  // Render Empty State
  // ============================================================================
  
  if (data.length === 0) {
    return (
      <div className={className}>
        <EmptyState message={emptyMessage} customState={emptyState} />
      </div>
    );
  }

  // ============================================================================
  // Render Table
  // ============================================================================
  
  return (
    <div className={className}>
      {/* Search and Filter Bar */}
      {(globalSearch || filterable) && (
        <div className="mb-4 space-y-3">
          {/* Global Search */}
          {globalSearch && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={globalSearchTerm}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                placeholder={THAI_LABELS.search}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg transition-colors duration-150"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              {globalSearchTerm && (
                <button
                  onClick={() => handleGlobalSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Column Filters */}
          {filterable && (
            <div className="flex flex-wrap gap-3">
              {columns
                .filter(col => col.filterable)
                .map(column => (
                  <div key={column.id} className="flex-1 min-w-[200px]">
                    {column.filterType === 'select' && column.filterOptions ? (
                      <select
                        value={filters[column.id] || ''}
                        onChange={(e) => handleFilterChange(column.id, e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg transition-colors duration-150"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      >
                        <option value="">ทั้งหมด - {column.header}</option>
                        {column.filterOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={column.filterType === 'number' ? 'number' : column.filterType === 'date' ? 'date' : 'text'}
                        value={filters[column.id] || ''}
                        onChange={(e) => handleFilterChange(column.id, e.target.value)}
                        placeholder={`${THAI_LABELS.filter} ${column.header}`}
                        className="w-full px-3 py-2 text-sm rounded-lg transition-colors duration-150"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
      
      {/* Bulk Actions Bar */}
      {selection && selection.selectedRows.size > 0 && bulkActions && bulkActions.length > 0 && (
        <div 
          className="mb-4 px-4 py-3 rounded-lg flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-primary-light, rgba(37, 99, 235, 0.1))',
            border: '1px solid var(--color-primary)',
          }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            เลือกแล้ว {selection.selectedRows.size} รายการ
          </span>
          <div className="flex gap-2">
            {bulkActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  const selectedData = data.filter(row => 
                    selection.selectedRows.has(selection.getRowId(row))
                  );
                  action.onClick(selectedData);
                }}
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150"
                style={{
                  backgroundColor: action.variant === 'danger' 
                    ? 'var(--color-error)' 
                    : 'var(--color-primary)',
                  color: '#ffffff',
                }}
              >
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Mobile Card View */}
      {isMobile ? (
        <MobileCardView
          data={paginatedData}
          columns={columns}
          selection={selection}
          actions={actions}
          onRowClick={onRowClick}
          getCellValue={getCellValue}
        />
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
          <table className="w-full">
          {/* Table Header */}
          <thead
            style={{
              backgroundColor: 'var(--color-surface)',
              position: stickyHeader ? 'sticky' : 'relative',
              top: 0,
              zIndex: 10,
            }}
          >
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              {/* Selection Column */}
              {selection?.enabled && (
                <th 
                  className="px-4 py-3"
                  style={{ width: '48px' }}
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) {
                        input.indeterminate = isSomeSelected || false;
                      }
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{
                      accentColor: 'var(--color-primary)',
                    }}
                    aria-label="เลือกทั้งหมด"
                  />
                </th>
              )}
              
              {/* Data Columns */}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`px-4 py-3 text-sm font-semibold ${
                    column.sortable ? 'cursor-pointer select-none hover:opacity-80' : ''
                  } ${
                    column.align === 'center' ? 'text-center' :
                    column.align === 'right' ? 'text-right' :
                    'text-left'
                  }`}
                  style={{
                    color: 'var(--color-text)',
                    width: column.width,
                  }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="inline-flex flex-col">
                        {sortConfig?.key === column.id ? (
                          sortConfig.direction === 'asc' ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" />
                            </svg>
                          )
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ opacity: 0.3 }}>
                            <path d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {/* Actions Column */}
              {actions && actions.length > 0 && (
                <th 
                  className="px-4 py-3 text-sm font-semibold text-center"
                  style={{ color: 'var(--color-text)', width: '120px' }}
                >
                  {THAI_LABELS.viewDetails}
                </th>
              )}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {paginatedData.map((row, rowIndex) => {
              const rowId = selection?.getRowId(row);
              const isSelected = selection && rowId ? selection.selectedRows.has(rowId) : false;
              
              return (
                <tr
                  key={rowIndex}
                  className={`transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected 
                      ? 'var(--color-primary-light, rgba(37, 99, 235, 0.1))' 
                      : 'var(--color-surface)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    }
                  }}
                  onClick={() => onRowClick?.(row)}
                >
                  {/* Selection Cell */}
                  {selection?.enabled && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectRow(row);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{
                          accentColor: 'var(--color-primary)',
                        }}
                        aria-label={`เลือกแถวที่ ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  
                  {/* Data Cells */}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`px-4 py-3 text-sm ${
                        column.align === 'center' ? 'text-center' :
                        column.align === 'right' ? 'text-right' :
                        'text-left'
                      }`}
                      style={{ color: 'var(--color-text)' }}
                    >
                      {getCellValue(row, column)}
                    </td>
                  ))}
                  
                  {/* Actions Cell */}
                  {actions && actions.length > 0 && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            disabled={action.disabled?.(row)}
                            className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150"
                            style={{
                              backgroundColor: action.variant === 'danger' 
                                ? 'var(--color-error)' 
                                : 'var(--color-primary)',
                              color: '#ffffff',
                              opacity: action.disabled?.(row) ? 0.5 : 1,
                              cursor: action.disabled?.(row) ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {action.icon && <span className="mr-1">{action.icon}</span>}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
      
      {/* Pagination Controls */}
      {pagination && sortedData.length > 0 && (
        <div 
          className="mt-4 px-4 py-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Results Info */}
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            แสดง {startRow} ถึง {endRow} จากทั้งหมด {sortedData.length} รายการ
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            {/* Rows per page selector */}
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                แสดง
              </span>
              <select
                value={pagination.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 text-sm rounded border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                รายการ
              </span>
            </div>
            
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150"
              style={{
                backgroundColor: pagination.page === 1 ? 'var(--color-surface)' : 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: pagination.page === 1 ? 'var(--color-text-muted)' : 'var(--color-text)',
                cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                opacity: pagination.page === 1 ? 0.5 : 1,
              }}
            >
              {THAI_LABELS.previous}
            </button>
            
            {/* Page numbers */}
            <div className="flex gap-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                  className="min-w-[36px] px-2 py-1.5 text-sm font-medium rounded-md transition-colors duration-150"
                  style={{
                    backgroundColor: page === pagination.page 
                      ? 'var(--color-primary)' 
                      : 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: page === pagination.page 
                      ? '#ffffff' 
                      : page === '...' 
                        ? 'var(--color-text-muted)' 
                        : 'var(--color-text)',
                    cursor: page === '...' ? 'default' : 'pointer',
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
            
            {/* Next button */}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150"
              style={{
                backgroundColor: pagination.page === totalPages ? 'var(--color-surface)' : 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: pagination.page === totalPages ? 'var(--color-text-muted)' : 'var(--color-text)',
                cursor: pagination.page === totalPages ? 'not-allowed' : 'pointer',
                opacity: pagination.page === totalPages ? 0.5 : 1,
              }}
            >
              {THAI_LABELS.next}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
