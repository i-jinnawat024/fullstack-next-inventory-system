# Form Components Documentation

This directory contains enterprise-grade form components with built-in validation, accessibility features, and Thai language support.

## Components Overview

### 1. FormField
A wrapper component that provides consistent styling for form fields including labels, error messages, help text, and required indicators.

**Features:**
- Label with required indicator (asterisk)
- Error message display with icon
- Help text support
- Disabled and loading states
- Consistent spacing and styling

**Usage:**
```tsx
import { FormField, TextInput } from '@/components/forms';

<FormField
  label="ชื่อสินค้า"
  required
  error={errors.productName}
  helpText="กรอกชื่อสินค้าภาษาไทย"
  htmlFor="productName"
>
  <TextInput
    id="productName"
    value={values.productName}
    onChange={(e) => handleChange('productName', e.target.value)}
    onBlur={() => handleBlur('productName')}
    error={!!errors.productName}
  />
</FormField>
```

### 2. TextInput
A styled text input component with validation support.

**Features:**
- Error state styling
- Full width option
- Disabled state
- Focus ring with theme colors
- Accessible error indication

**Props:**
- `error?: boolean` - Shows error styling
- `fullWidth?: boolean` - Makes input full width (default: true)
- All standard HTML input attributes

**Usage:**
```tsx
import { TextInput } from '@/components/forms';

<TextInput
  placeholder="กรอกชื่อ"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={hasError}
/>
```

### 3. Textarea
A multi-line text input component.

**Features:**
- Configurable resize behavior
- Adjustable rows
- Error state styling
- Full width option

**Props:**
- `error?: boolean` - Shows error styling
- `fullWidth?: boolean` - Makes textarea full width (default: true)
- `resize?: 'none' | 'vertical' | 'horizontal' | 'both'` - Resize behavior (default: 'vertical')
- `rows?: number` - Number of visible rows (default: 4)

**Usage:**
```tsx
import { Textarea } from '@/components/forms';

<Textarea
  placeholder="กรอกหมายเหตุ"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  rows={6}
  resize="vertical"
/>
```

### 4. Select
A dropdown select component with custom styling.

**Features:**
- Custom chevron icon
- Option groups support
- Placeholder support
- Error state styling
- Disabled options

**Props:**
- `options: SelectOption[]` - Array of options
- `error?: boolean` - Shows error styling
- `fullWidth?: boolean` - Makes select full width (default: true)
- `placeholder?: string` - Placeholder text

**Usage:**
```tsx
import { Select } from '@/components/forms';

const categoryOptions = [
  { value: 'electronics', label: 'อิเล็กทรอนิกส์' },
  { value: 'furniture', label: 'เฟอร์นิเจอร์' },
  { value: 'supplies', label: 'อุปกรณ์สำนักงาน' },
];

<Select
  options={categoryOptions}
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  placeholder="เลือกหมวดหมู่"
/>
```

### 5. DatePicker
A calendar-based date picker with Thai date format (DD/MM/YYYY).

**Features:**
- Calendar interface with month/year navigation
- Thai month names
- Min/max date constraints
- Today highlighting
- Selected date highlighting
- Click outside to close
- Keyboard accessible

**Props:**
- `value?: string` - Date in DD/MM/YYYY format
- `onChange?: (date: string) => void` - Callback when date is selected
- `error?: boolean` - Shows error styling
- `disabled?: boolean` - Disables the picker
- `minDate?: string` - Minimum selectable date
- `maxDate?: string` - Maximum selectable date
- `placeholder?: string` - Placeholder text (default: 'DD/MM/YYYY')

**Usage:**
```tsx
import { DatePicker } from '@/components/forms';

<DatePicker
  value={requestDate}
  onChange={(date) => setRequestDate(date)}
  placeholder="เลือกวันที่"
  minDate="01/01/2024"
/>
```

### 6. NumberInput
A number input with increment/decrement buttons.

**Features:**
- Increment/decrement buttons
- Min/max value constraints
- Step configuration
- Button disable when at limits
- Optional button visibility
- Custom increment/decrement handlers

**Props:**
- `error?: boolean` - Shows error styling
- `fullWidth?: boolean` - Makes input full width (default: true)
- `showButtons?: boolean` - Show increment/decrement buttons (default: true)
- `onIncrement?: () => void` - Custom increment handler
- `onDecrement?: () => void` - Custom decrement handler
- `min?: number` - Minimum value
- `max?: number` - Maximum value
- `step?: number` - Increment/decrement step (default: 1)

**Usage:**
```tsx
import { NumberInput } from '@/components/forms';

<NumberInput
  value={quantity}
  onChange={(e) => setQuantity(parseInt(e.target.value))}
  min={1}
  max={100}
  step={1}
  showButtons
/>
```

### 7. FileUpload
A drag-and-drop file upload component with progress tracking.

**Features:**
- Drag and drop support
- Multiple file upload
- File type validation
- File size validation
- Upload progress tracking
- Error handling with retry
- File list with remove option
- Visual feedback for drag state

**Props:**
- `accept?: string` - Accepted file types (e.g., 'image/*,.pdf')
- `maxSize?: number` - Maximum file size in bytes (default: 5MB)
- `maxFiles?: number` - Maximum number of files (default: 5)
- `multiple?: boolean` - Allow multiple files (default: true)
- `disabled?: boolean` - Disable upload
- `error?: boolean` - Shows error styling
- `onFilesChange?: (files: File[]) => void` - Callback when files change
- `onUploadComplete?: (files: UploadedFile[]) => void` - Callback when upload completes
- `onUploadError?: (error: string) => void` - Callback on upload error
- `uploadFunction?: (file: File) => Promise<string>` - Custom upload function

**Usage:**
```tsx
import { FileUpload } from '@/components/forms';

<FileUpload
  accept="image/*,.pdf"
  maxSize={10 * 1024 * 1024} // 10MB
  maxFiles={3}
  multiple
  onFilesChange={(files) => console.log('Files selected:', files)}
  uploadFunction={async (file) => {
    // Upload file to server
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.url;
  }}
  onUploadComplete={(files) => console.log('Upload complete:', files)}
  onUploadError={(error) => console.error('Upload error:', error)}
/>
```

## Form Validation Hook

### useFormValidation
A custom hook for managing form state and validation.

**Features:**
- Real-time validation with debouncing
- Validation on blur
- Field-level error tracking
- Dirty/touched state tracking
- Form-level validation
- Programmatic field updates

**Usage:**
```tsx
import { useFormValidation } from '@/lib/hooks/use-form-validation';
import { validateRequired, validateEmail } from '@/lib/utils/validation';

function MyForm() {
  const {
    formState,
    handleChange,
    handleBlur,
    validateForm,
    getValues,
    isFormValid,
  } = useFormValidation(
    {
      email: '',
      name: '',
      quantity: 0,
    },
    {
      email: {
        validators: [validateRequired, validateEmail],
        validateOnChange: true,
        validateOnBlur: true,
        debounceMs: 300,
      },
      name: {
        validators: [validateRequired],
        validateOnBlur: true,
      },
      quantity: {
        validators: [
          validateRequired,
          (value) => {
            if (value <= 0) {
              return { isValid: false, message: 'จำนวนต้องมากกว่า 0' };
            }
            return { isValid: true };
          },
        ],
        validateOnChange: true,
        debounceMs: 500,
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const values = getValues();
      console.log('Form values:', values);
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="อีเมล"
        required
        error={formState.email.error}
        htmlFor="email"
      >
        <TextInput
          id="email"
          type="email"
          value={formState.email.value}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={!!formState.email.error}
        />
      </FormField>

      <FormField
        label="ชื่อ"
        required
        error={formState.name.error}
        htmlFor="name"
      >
        <TextInput
          id="name"
          value={formState.name.value}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          error={!!formState.name.error}
        />
      </FormField>

      <FormField
        label="จำนวน"
        required
        error={formState.quantity.error}
        htmlFor="quantity"
      >
        <NumberInput
          id="quantity"
          value={formState.quantity.value}
          onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
          onBlur={() => handleBlur('quantity')}
          error={!!formState.quantity.error}
          min={1}
        />
      </FormField>

      <Button type="submit" disabled={!isFormValid()}>
        ส่ง
      </Button>
    </form>
  );
}
```

## Complete Form Example

```tsx
'use client';

import { useState } from 'react';
import {
  FormField,
  TextInput,
  Textarea,
  Select,
  DatePicker,
  NumberInput,
  FileUpload,
} from '@/components/forms';
import { Button } from '@/components/ui/button';
import { useFormValidation } from '@/lib/hooks/use-form-validation';
import { validateRequired, validateEmail } from '@/lib/utils/validation';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

export function ProductForm() {
  const {
    formState,
    handleChange,
    handleBlur,
    validateForm,
    getValues,
    isFormValid,
  } = useFormValidation(
    {
      productName: '',
      category: '',
      description: '',
      quantity: 1,
      requestDate: '',
      email: '',
    },
    {
      productName: {
        validators: [validateRequired],
        validateOnBlur: true,
      },
      category: {
        validators: [validateRequired],
        validateOnBlur: true,
      },
      description: {
        validators: [],
        validateOnBlur: false,
      },
      quantity: {
        validators: [
          validateRequired,
          (value) => {
            if (value <= 0) {
              return { isValid: false, message: THAI_LABELS.quantityMustBePositive };
            }
            return { isValid: true };
          },
        ],
        validateOnChange: true,
        debounceMs: 300,
      },
      requestDate: {
        validators: [validateRequired],
        validateOnBlur: true,
      },
      email: {
        validators: [validateRequired, validateEmail],
        validateOnChange: true,
        debounceMs: 500,
      },
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = [
    { value: 'electronics', label: 'อิเล็กทรอนิกส์' },
    { value: 'furniture', label: 'เฟอร์นิเจอร์' },
    { value: 'supplies', label: 'อุปกรณ์สำนักงาน' },
    { value: 'other', label: 'อื่นๆ' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const values = getValues();
      console.log('Submitting form:', values);
      
      // Submit to API
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        alert(THAI_LABELS.saveSuccess);
      } else {
        alert(THAI_LABELS.saveError);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(THAI_LABELS.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label={THAI_LABELS.productName}
        required
        error={formState.productName.error}
        htmlFor="productName"
      >
        <TextInput
          id="productName"
          placeholder="กรอกชื่อสินค้า"
          value={formState.productName.value}
          onChange={(e) => handleChange('productName', e.target.value)}
          onBlur={() => handleBlur('productName')}
          error={!!formState.productName.error}
        />
      </FormField>

      <FormField
        label={THAI_LABELS.category}
        required
        error={formState.category.error}
        htmlFor="category"
      >
        <Select
          id="category"
          options={categoryOptions}
          value={formState.category.value}
          onChange={(e) => handleChange('category', e.target.value)}
          onBlur={() => handleBlur('category')}
          error={!!formState.category.error}
          placeholder={THAI_LABELS.selectCategory}
        />
      </FormField>

      <FormField
        label={THAI_LABELS.description}
        error={formState.description.error}
        htmlFor="description"
        helpText="รายละเอียดเพิ่มเติมเกี่ยวกับสินค้า"
      >
        <Textarea
          id="description"
          placeholder="กรอกรายละเอียด"
          value={formState.description.value}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
        />
      </FormField>

      <FormField
        label={THAI_LABELS.quantity}
        required
        error={formState.quantity.error}
        htmlFor="quantity"
      >
        <NumberInput
          id="quantity"
          value={formState.quantity.value}
          onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
          onBlur={() => handleBlur('quantity')}
          error={!!formState.quantity.error}
          min={1}
          max={1000}
        />
      </FormField>

      <FormField
        label={THAI_LABELS.requestDate}
        required
        error={formState.requestDate.error}
        htmlFor="requestDate"
      >
        <DatePicker
          id="requestDate"
          value={formState.requestDate.value}
          onChange={(date) => handleChange('requestDate', date)}
          error={!!formState.requestDate.error}
          placeholder="เลือกวันที่"
        />
      </FormField>

      <FormField
        label={THAI_LABELS.email}
        required
        error={formState.email.error}
        htmlFor="email"
      >
        <TextInput
          id="email"
          type="email"
          placeholder="example@company.com"
          value={formState.email.value}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={!!formState.email.error}
        />
      </FormField>

      <FormField
        label="เอกสารแนบ"
        htmlFor="attachments"
        helpText="อัปโหลดไฟล์ PDF หรือรูปภาพ (สูงสุด 5MB)"
      >
        <FileUpload
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
          maxFiles={3}
          multiple
        />
      </FormField>

      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!isFormValid() || isSubmitting}
        >
          {THAI_LABELS.submit}
        </Button>
        <Button type="button" variant="secondary">
          {THAI_LABELS.cancel}
        </Button>
      </div>
    </form>
  );
}
```

## Accessibility Features

All form components include:
- Proper ARIA labels and attributes
- Keyboard navigation support
- Focus indicators
- Error announcements for screen readers
- Semantic HTML elements
- Proper label associations

## Theme Support

All components support both light and dark themes using CSS custom properties:
- `--color-surface` - Input background
- `--color-text` - Input text color
- `--color-border` - Input border color
- `--color-primary` - Focus ring color
- `--color-error` - Error state color
- `--color-text-muted` - Placeholder and help text color

## Validation Utilities

Available validation functions in `@/lib/utils/validation`:
- `validateRequired(value)` - Check if field is not empty
- `validateEmail(email)` - Validate email format
- `validatePassword(password)` - Validate password strength
- `validatePositiveNumber(value)` - Check if number is positive
- `validateStockQuantity(requested, available)` - Check stock availability
- `validateThaiDate(dateStr)` - Validate Thai date format (DD/MM/YYYY)
- `validateMinimumItems(items)` - Check minimum items in array

All validation functions return `ValidationResult`:
```typescript
interface ValidationResult {
  isValid: boolean;
  message?: string; // Thai language error message
}
```
