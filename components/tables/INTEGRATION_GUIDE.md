# DataTable Integration Guide

## Quick Start

### 1. Import the Component

```tsx
import { DataTable, ColumnDef } from '@/components/tables';
```

### 2. Define Your Data Type

```tsx
interface YourDataType {
  id: string;
  name: string;
  // ... other fields
}
```

### 3. Define Columns

```tsx
const columns: ColumnDef<YourDataType>[] = [
  {
    id: 'name',
    header: 'ชื่อ',
    accessorKey: 'name',
    sortable: true,
  },
  // ... more columns
];
```

### 4. Use the Component

```tsx
<DataTable
  data={yourData}
  columns={columns}
  loading={isLoading}
/>
```

## Replacing Existing Tables

### Example: Approval Queue Table

**Before:**
```tsx
// Old custom table implementation
<table>
  <thead>...</thead>
  <tbody>...</tbody>
</table>
```

**After:**
```tsx
import { DataTable, ColumnDef } from '@/components/tables';

const columns: ColumnDef<Requisition>[] = [
  {
    id: 'documentNumber',
    header: THAI_LABELS.documentNumber,
    accessorKey: 'documentNumber',
    sortable: true,
  },
  {
    id: 'status',
    header: THAI_LABELS.status,
    cell: (row) => <StatusBadge status={row.status} />,
  },
  // ... more columns
];

<DataTable
  data={requisitions}
  columns={columns}
  loading={loading}
  sortable={true}
  globalSearch={true}
  actions={[
    {
      label: 'ดูรายละเอียด',
      onClick: (row) => handleViewDetails(row),
    },
  ]}
/>
```

## Common Patterns

### Pattern 1: Simple List

```tsx
<DataTable
  data={items}
  columns={columns}
  loading={loading}
  emptyMessage="ไม่มีข้อมูล"
/>
```

### Pattern 2: Searchable Table

```tsx
<DataTable
  data={items}
  columns={columns}
  globalSearch={true}
  sortable={true}
/>
```

### Pattern 3: Full-Featured Table

```tsx
const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
const [pagination, setPagination] = useState({
  page: 1,
  pageSize: 20,
  total: items.length,
});

<DataTable
  data={items}
  columns={columns}
  loading={loading}
  
  // Search & Filter
  globalSearch={true}
  filterable={true}
  
  // Sorting
  sortable={true}
  defaultSort={{ key: 'name', direction: 'asc' }}
  
  // Pagination
  pagination={pagination}
  onPaginationChange={(page, pageSize) => {
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
  actions={rowActions}
  bulkActions={bulkActions}
/>
```

## Migration Checklist

When replacing an existing table:

- [ ] Define column configuration
- [ ] Map existing cell renderers to `cell` functions
- [ ] Convert sorting logic (if any) to `sortable` prop
- [ ] Convert filtering logic (if any) to `filterable` prop
- [ ] Convert pagination logic (if any) to `pagination` prop
- [ ] Move row actions to `actions` prop
- [ ] Test on desktop and mobile
- [ ] Verify accessibility (keyboard navigation)
- [ ] Update any related tests

## Tips

1. **Start Simple**: Begin with basic columns, then add features incrementally
2. **Use TypeScript**: Define your data type for better autocomplete and type safety
3. **Custom Rendering**: Use the `cell` function for complex cell content
4. **Performance**: For large datasets, consider server-side pagination
5. **Mobile**: Test on mobile devices to ensure card view works well
6. **Accessibility**: Always provide meaningful ARIA labels

## Common Issues

### Issue: Column not sorting correctly
**Solution**: Ensure `accessorKey` matches your data structure, or provide a custom `cell` function

### Issue: Filter not working
**Solution**: Make sure `filterable: true` is set on the column and the parent has `filterable={true}`

### Issue: Mobile view not showing
**Solution**: Check viewport width detection, ensure window is < 768px

### Issue: Selection not working
**Solution**: Verify `getRowId` returns a unique identifier for each row

## Support

For more examples, see:
- `components/tables/data-table-example.tsx` - Complete working example
- `components/tables/DATA_TABLE_README.md` - Full documentation
- `components/tables/data-table.tsx` - Source code with inline comments
