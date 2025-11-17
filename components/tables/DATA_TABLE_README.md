# DataTable Component

A comprehensive, enterprise-grade data table component with advanced features including sorting, filtering, pagination, row selection, and responsive mobile card view.

## Features

- ✅ **Column Configuration**: Flexible column definitions with custom rendering
- ✅ **Sticky Header**: Header stays visible when scrolling
- ✅ **Loading States**: Skeleton loaders that match table structure
- ✅ **Empty States**: Customizable empty state messages
- ✅ **Sorting**: Column-based sorting (ascending/descending)
- ✅ **Global Search**: Search across all columns
- ✅ **Column Filters**: Per-column filtering with multiple filter types
- ✅ **Pagination**: Full pagination controls with page size selector
- ✅ **Row Selection**: Single and multi-row selection with bulk actions
- ✅ **Row Actions**: Individual row action buttons
- ✅ **Mobile Responsive**: Automatic card view on mobile devices (< 768px)
- ✅ **Touch-Friendly**: 44x44px minimum touch targets on mobile
- ✅ **Accessibility**: Keyboard navigation and ARIA labels

## Basic Usage

```tsx
import { DataTable, ColumnDef } from '@/components/tables';

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  status: string;
}

function ProductTable() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        { label: 'อุปกรณ์สำนักงาน', value: 'office' },
        { label: 'อิเล็กทรอนิกส์', value: 'electronics' },
      ],
    },
    {
      id: 'stock',
      header: 'สต็อก',
      accessorKey: 'stock',
      sortable: true,
      align: 'right',
      cell: (row) => `${row.stock} ชิ้น`,
    },
    {
      id: 'status',
      header: 'สถานะ',
      accessorKey: 'status',
      cell: (row) => (
        <StatusBadge status={row.status} label={row.status} />
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      emptyMessage="ไม่มีสินค้าในระบบ"
    />
  );
}
```

## Advanced Features

### Sorting

Enable sorting on specific columns:

```tsx
const columns: ColumnDef<Product>[] = [
  {
    id: 'name',
    header: 'ชื่อสินค้า',
    accessorKey: 'name',
    sortable: true, // Enable sorting
  },
];

<DataTable
  data={data}
  columns={columns}
  sortable={true}
  defaultSort={{ key: 'name', direction: 'asc' }}
  onSortChange={(sort) => console.log('Sort changed:', sort)}
/>
```

### Global Search and Filtering

```tsx
<DataTable
  data={data}
  columns={columns}
  globalSearch={true}
  filterable={true}
  onFilterChange={(filters) => console.log('Filters:', filters)}
/>
```

### Pagination

```tsx
const [pagination, setPagination] = useState({
  page: 1,
  pageSize: 20,
  total: 100,
});

<DataTable
  data={data}
  columns={columns}
  pagination={pagination}
  onPaginationChange={(page, pageSize) => {
    setPagination({ ...pagination, page, pageSize });
  }}
/>
```

### Row Selection and Bulk Actions

```tsx
const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

const bulkActions: BulkAction<Product>[] = [
  {
    label: 'ลบที่เลือก',
    variant: 'danger',
    onClick: (rows) => {
      console.log('Delete rows:', rows);
    },
  },
  {
    label: 'ส่งออก',
    onClick: (rows) => {
      console.log('Export rows:', rows);
    },
  },
];

<DataTable
  data={data}
  columns={columns}
  selection={{
    enabled: true,
    selectedRows,
    onSelectionChange: setSelectedRows,
    getRowId: (row) => row.id,
  }}
  bulkActions={bulkActions}
/>
```

### Row Actions

```tsx
const actions: TableAction<Product>[] = [
  {
    label: 'แก้ไข',
    onClick: (row) => console.log('Edit:', row),
  },
  {
    label: 'ลบ',
    variant: 'danger',
    onClick: (row) => console.log('Delete:', row),
    disabled: (row) => row.status === 'active',
  },
];

<DataTable
  data={data}
  columns={columns}
  actions={actions}
/>
```

### Custom Cell Rendering

```tsx
const columns: ColumnDef<Product>[] = [
  {
    id: 'status',
    header: 'สถานะ',
    cell: (row) => (
      <StatusBadge 
        status={row.status} 
        label={getStatusLabel(row.status)} 
      />
    ),
  },
  {
    id: 'price',
    header: 'ราคา',
    accessorKey: 'price',
    align: 'right',
    cell: (row) => (
      <span className="font-semibold">
        ฿{row.price.toLocaleString()}
      </span>
    ),
  },
];
```

### Row Click Handler

```tsx
<DataTable
  data={data}
  columns={columns}
  onRowClick={(row) => {
    console.log('Row clicked:', row);
    router.push(`/products/${row.id}`);
  }}
/>
```

### Custom Empty State

```tsx
<DataTable
  data={data}
  columns={columns}
  emptyState={
    <div className="text-center py-12">
      <h3>ไม่พบสินค้า</h3>
      <p>ลองค้นหาด้วยคำอื่น หรือเพิ่มสินค้าใหม่</p>
      <Button onClick={handleAddProduct}>เพิ่มสินค้า</Button>
    </div>
  }
/>
```

## Column Definition

```typescript
interface ColumnDef<T> {
  id: string;                    // Unique column identifier
  header: string;                // Column header text
  accessorKey?: keyof T | string; // Key to access data (supports nested: 'user.name')
  cell?: (row: T) => ReactNode;  // Custom cell renderer
  sortable?: boolean;            // Enable sorting
  filterable?: boolean;          // Enable filtering
  filterType?: 'text' | 'select' | 'date' | 'number'; // Filter input type
  filterOptions?: { label: string; value: string }[]; // Options for select filter
  width?: string;                // Column width (e.g., '120px', '20%')
  align?: 'left' | 'center' | 'right'; // Text alignment
}
```

## Mobile Responsive Behavior

On mobile devices (< 768px), the table automatically switches to a card-based layout:

- **Primary columns** (first 3): Always visible
- **Secondary columns** (remaining): Shown in expandable section
- **Touch targets**: Minimum 44x44px for accessibility
- **Actions**: Full-width buttons at bottom of card
- **Selection**: Checkbox with proper touch target size

## Accessibility

- ✅ Keyboard navigation support
- ✅ ARIA labels for checkboxes and buttons
- ✅ Proper semantic HTML
- ✅ Focus indicators
- ✅ Screen reader announcements

## Performance Tips

1. **Memoize data**: Use `useMemo` for expensive data transformations
2. **Virtualization**: For very large datasets (1000+ rows), consider adding virtualization
3. **Server-side operations**: For large datasets, implement server-side sorting, filtering, and pagination
4. **Debounce search**: Global search is real-time, consider debouncing for API calls

## Complete Example

See `components/tables/data-table-example.tsx` for a complete working example with all features.

## Requirements Satisfied

This component satisfies the following requirements from the design document:

- **Requirement 3.1**: Column sorting (ascending/descending)
- **Requirement 3.2**: Search functionality with real-time filtering
- **Requirement 3.3**: Pagination when data exceeds 20 rows
- **Requirement 3.4**: Column filtering with dropdown/input filters
- **Requirement 3.5**: Row selection with bulk actions
- **Requirement 3.6**: Row actions and empty states
- **Requirement 8.1**: Loading skeleton matching table structure
- **Requirement 9.3**: Touch-friendly tap targets (44x44px minimum)
- **Requirement 9.4**: Mobile card view for devices < 768px
