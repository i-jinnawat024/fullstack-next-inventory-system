# Upgrade Notes

## Next.js 16 Migration

### Breaking Change: Async Route Params

Next.js 16 introduced a breaking change where route parameters (`params`) in API route handlers are now returned as Promises and must be awaited.

#### Before (Next.js 15):
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const item = await db.findById(params.id);
  // ...
}
```

#### After (Next.js 16):
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await db.findById(id);
  // ...
}
```

### Files Requiring Updates

The following API route files need to be updated to handle async params:

- `app/api/inventory/[id]/route.ts`
- `app/api/requisitions/[id]/route.ts`
- `app/api/requisitions/[id]/approve/route.ts`
- `app/api/requisitions/[id]/reject/route.ts`
- `app/api/requisitions/[id]/issue/route.ts`
- `app/api/notices/[id]/route.ts`
- `app/api/webhooks/[id]/route.ts`

### Quick Fix Script

You can use this pattern to update all route handlers:

```typescript
// Find this pattern:
{ params }: { params: { id: string } }

// Replace with:
{ params }: { params: Promise<{ id: string }> }

// Then at the start of the function:
const { id } = await params;

// Replace all instances of params.id with just id
```

### Temporary Workaround

To build the project with the current code, you can temporarily downgrade to Next.js 15:

```bash
pnpm add next@15
```

Or update all route handlers to use the new async params pattern.

## Other Considerations

### TypeScript Strict Mode

The project uses TypeScript strict mode. Ensure all type definitions are properly updated when migrating route handlers.

### Testing

After updating route handlers, run the full test suite to ensure everything works:

```bash
pnpm test
```

### Development vs Production

The async params change affects both development and production builds. Make sure to test both environments after migration.
