'use client';

import { useState } from 'react';
import { DataTable, ColumnDef, TableAction, BulkAction } from './data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';

// Example data type
interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  lastUpdated: string;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    code: 'PRD-001',
    name: 'ปากกาลูกลื่น',
    category: 'อุปกรณ์สำนักงาน',
    stock: 150,
    minStock: 50,
    unit: 'ด้าม',
    status: 'in-stock',
    lastUpdated: '2024-01-15',
  },
  {
    id: '2',
    code: 'PRD-002',
    name: 'กระดาษ A4',
    category: 'อุปกรณ์สำนักงาน',
    stock: 25,
    minStock: 20,
    unit: 'รีม',
    status: 'low-stock',
    lastUpdated: '2024-01-14',
  },
  {
    id: '3',
    code: 'PRD-003',
    name: 'คีย์บอร์ด',
    category: 'อิเล็กทรอนิกส์',
    stock: 0,
    minStock: 10,
    unit: 'ชิ้น',
    status: 'out-of-stock',
    lastUpdated: '2024-01-10',
  },
  // Add more mock data as needed
];

export function DataTableExample() {
  const [data] = useState<Product[]>(mockProducts);
  const [loading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: mockProducts.length,
  });

  // Column definitions
  const columns: ColumnDef<Product>[] = [
    {
      id: 'code',
      header: 'รหัสสินค้า',
      accessorKey: 'code',
      sortable: true,
      filterable: true,
      filterType: 'text',
      width: '120px',
    },
    {
      id: 'name',
      header: 'ชื่อสินค้า',
      accessorKey: 'name',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      id: 'category',
      header: 'หมวดหมู่',
      accessorKey: 'category',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'อุปกรณ์สำนักงาน', value: 'อุปกรณ์สำนักงาน' },
        { label: 'อิเล็กทรอนิกส์', value: 'อิเล็กทรอนิกส์' },
      ],
      width: '150px',
    },
    {
      id: 'stock',
      header: 'สต็อกปัจจุบัน',
      accessorKey: 'stock',
      sortable: true,
      align: 'right',
      width: '120px',
      cell: (row) => (
        <span className={row.stock === 0 ? 'text-red-600 font-semibold' : ''}>
          {row.stock} {row.unit}
        </span>
      ),
    },
    {
      id: 'minStock',
      header: 'สต็อกขั้นต่ำ',
      accessorKey: 'minStock',
      align: 'right',
      width: '120px',
      cell: (row) => `${row.minStock} ${row.unit}`,
    },
    {
      id: 'status',
      header: 'สถานะ',
      accessorKey: 'status',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'มีสินค้า', value: 'in-stock' },
        { label: 'สินค้าใกล้หมด', value: 'low-stock' },
        { label: 'สินค้าหมด', value: 'out-of-stock' },
      ],
      width: '140px',
      align: 'center',
      cell: (row) => {
        const statusMap = {
          'in-stock': 'approved' as const,
          'low-stock': 'pending' as const,
          'out-of-stock': 'rejected' as const,
        };
        return <StatusBadge status={statusMap[row.status]} />;
      },
    },
    {
      id: 'lastUpdated',
      header: 'อัปเดตล่าสุด',
      accessorKey: 'lastUpdated',
      sortable: true,
      width: '130px',
    },
  ];

  // Row actions
  const actions: TableAction<Product>[] = [
    {
      label: 'แก้ไข',
      onClick: (row) => {
        console.log('Edit product:', row);
        alert(`แก้ไขสินค้า: ${row.name}`);
      },
    },
    {
      label: 'ลบ',
      variant: 'danger',
      onClick: (row) => {
        console.log('Delete product:', row);
        if (confirm(`ต้องการลบสินค้า "${row.name}" หรือไม่?`)) {
          alert('ลบสินค้าเรียบร้อย');
        }
      },
      disabled: (row) => row.stock > 0,
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Product>[] = [
    {
      label: 'ส่งออก',
      onClick: (rows) => {
        console.log('Export products:', rows);
        alert(`ส่งออก ${rows.length} รายการ`);
      },
    },
    {
      label: 'ลบที่เลือก',
      variant: 'danger',
      onClick: (rows) => {
        console.log('Delete products:', rows);
        if (confirm(`ต้องการลบ ${rows.length} รายการที่เลือกหรือไม่?`)) {
          alert('ลบรายการที่เลือกเรียบร้อย');
        }
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          ตัวอย่าง DataTable Component
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          ตารางข้อมูลแบบครบครันพร้อมฟีเจอร์การเรียงลำดับ, กรอง, ค้นหา, และเลือกแถว
        </p>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        emptyMessage="ไม่มีสินค้าในระบบ"
        
        // Sorting
        sortable={true}
        defaultSort={{ key: 'name', direction: 'asc' }}
        onSortChange={(sort) => console.log('Sort changed:', sort)}
        
        // Filtering
        globalSearch={true}
        filterable={true}
        onFilterChange={(filters) => console.log('Filters changed:', filters)}
        
        // Pagination
        pagination={pagination}
        onPaginationChange={(page, pageSize) => {
          console.log('Pagination changed:', { page, pageSize });
          setPagination({ ...pagination, page, pageSize });
        }}
        
        // Selection
        selection={{
          enabled: true,
          selectedRows,
          onSelectionChange: setSelectedRows,
          getRowId: (row) => row.id,
        }}
        
        // Actions
        actions={actions}
        bulkActions={bulkActions}
        
        // Row click
        onRowClick={(row) => {
          console.log('Row clicked:', row);
        }}
        
        // Styling
        stickyHeader={true}
      />

      {/* Debug info */}
      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
          Debug Information
        </h3>
        <div className="text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
          <p>Selected rows: {selectedRows.size}</p>
          <p>Current page: {pagination.page}</p>
          <p>Page size: {pagination.pageSize}</p>
          <p>Total items: {data.length}</p>
        </div>
      </div>
    </div>
  );
}
