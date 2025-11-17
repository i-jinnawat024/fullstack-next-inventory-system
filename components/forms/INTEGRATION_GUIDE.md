# Form Components Integration Guide

## Quick Start

### 1. Basic Form Setup

```tsx
'use client';

import { FormField, TextInput, Button } from '@/components/forms';
import { useFormValidation } from '@/lib/hooks/use-form-validation';
import { validateRequired } from '@/lib/utils/validation';

export function SimpleForm() {
  const { formState, handleChange, handleBlur, validateForm, getValues } = 
    useFormValidation(
      { name: '' },
      { name: { validators: [validateRequired], validateOnBlur: true } }
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log(getValues());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Name" required error={formState.name.error}>
        <TextInput
          value={formState.name.value}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          error={!!formState.name.error}
        />
      </FormField>
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### 2. Import Components

```tsx
// Import individual components
import { FormField } from '@/components/forms/form-field';
import { TextInput } from '@/components/forms/text-input';

// Or import from index
import { FormField, TextInput, Select, DatePicker } from '@/components/forms';
```

### 3. Import Validation Hook

```tsx
import { useFormValidation } from '@/lib/hooks/use-form-validation';
import { validateRequired, validateEmail } from '@/lib/utils/validation';
```

## Common Patterns

### Pattern 1: Simple Text Field

```tsx
<FormField label="Product Name" required error={formState.productName.error}>
  <TextInput
    value={formState.productName.value}
    onChange={(e) => handleChange('productName', e.target.value)}
    onBlur={() => handleBlur('productName')}
    error={!!formState.productName.error}
    placeholder="Enter product name"
  />
</FormField>
```

### Pattern 2: Select Dropdown

```tsx
const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
];

<FormField label="Category" required error={formState.category.error}>
  <Select
    options={options}
    value={formState.category.value}
    onChange={(e) => handleChange('category', e.target.value)}
    onBlur={() => handleBlur('category')}
    error={!!formState.category.error}
    placeholder="Select category"
  />
</FormField>
```

### Pattern 3: Date Picker

```tsx
<FormField label="Request Date" required error={formState.date.error}>
  <DatePicker
    value={formState.date.value}
    onChange={(date) => handleChange('date', date)}
    error={!!formState.date.error}
    placeholder="DD/MM/YYYY"
  />
</FormField>
```

### Pattern 4: Number Input

```tsx
<FormField label="Quantity" required error={formState.quantity.error}>
  <NumberInput
    value={formState.quantity.value}
    onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
    onBlur={() => handleBlur('quantity')}
    error={!!formState.quantity.error}
    min={1}
    max={100}
  />
</FormField>
```

### Pattern 5: File Upload

```tsx
<FormField label="Attachments" helpText="Upload PDF or images (max 5MB)">
  <FileUpload
    accept="image/*,.pdf"
    maxSize={5 * 1024 * 1024}
    maxFiles={3}
    multiple
    onFilesChange={(files) => console.log('Files:', files)}
  />
</FormField>
```

## Validation Patterns

### Pattern 1: Required Field

```tsx
const { formState, handleChange, handleBlur } = useFormValidation(
  { fieldName: '' },
  {
    fieldName: {
      validators: [validateRequired],
      validateOnBlur: true,
    },
  }
);
```

### Pattern 2: Email Validation

```tsx
const { formState, handleChange, handleBlur } = useFormValidation(
  { email: '' },
  {
    email: {
      validators: [validateRequired, validateEmail],
      validateOnChange: true,
      debounceMs: 500,
    },
  }
);
```

### Pattern 3: Custom Validation

```tsx
const validateQuantity = (value: number) => {
  if (value <= 0) {
    return { isValid: false, message: 'Quantity must be positive' };
  }
  if (value > 1000) {
    return { isValid: false, message: 'Quantity cannot exceed 1000' };
  }
  return { isValid: true };
};

const { formState, handleChange, handleBlur } = useFormValidation(
  { quantity: 0 },
  {
    quantity: {
      validators: [validateRequired, validateQuantity],
      validateOnChange: true,
      debounceMs: 300,
    },
  }
);
```

### Pattern 4: Conditional Validation

```tsx
const validateConditional = (value: string) => {
  if (formState.otherField.value === 'specific-value') {
    return validateRequired(value);
  }
  return { isValid: true };
};
```

## Form Submission Patterns

### Pattern 1: Basic Submission

```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (validateForm()) {
    const values = getValues();
    console.log('Form values:', values);
    // Submit to API
  }
};
```

### Pattern 2: Async Submission with Loading

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  try {
    const values = getValues();
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    
    if (response.ok) {
      alert('Success!');
      resetForm();
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsSubmitting(false);
  }
};

// In JSX
<Button type="submit" loading={isSubmitting} disabled={!isFormValid()}>
  Submit
</Button>
```

### Pattern 3: Server-Side Validation Errors

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(getValues()),
    });
    
    if (!response.ok) {
      const errors = await response.json();
      // Set server errors
      Object.keys(errors).forEach(field => {
        setFieldError(field, errors[field]);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Styling Patterns

### Pattern 1: Custom Width

```tsx
<FormField label="Name">
  <TextInput fullWidth={false} className="w-64" />
</FormField>
```

### Pattern 2: Inline Fields

```tsx
<div className="flex gap-4">
  <FormField label="First Name">
    <TextInput />
  </FormField>
  <FormField label="Last Name">
    <TextInput />
  </FormField>
</div>
```

### Pattern 3: Grid Layout

```tsx
<div className="grid grid-cols-2 gap-4">
  <FormField label="Field 1">
    <TextInput />
  </FormField>
  <FormField label="Field 2">
    <TextInput />
  </FormField>
</div>
```

## Advanced Patterns

### Pattern 1: Dynamic Fields

```tsx
const [items, setItems] = useState([{ id: 1, name: '' }]);

const addItem = () => {
  setItems([...items, { id: Date.now(), name: '' }]);
};

const removeItem = (id: number) => {
  setItems(items.filter(item => item.id !== id));
};

return (
  <>
    {items.map((item, index) => (
      <div key={item.id} className="flex gap-2">
        <FormField label={`Item ${index + 1}`}>
          <TextInput
            value={item.name}
            onChange={(e) => {
              const newItems = [...items];
              newItems[index].name = e.target.value;
              setItems(newItems);
            }}
          />
        </FormField>
        <Button onClick={() => removeItem(item.id)}>Remove</Button>
      </div>
    ))}
    <Button onClick={addItem}>Add Item</Button>
  </>
);
```

### Pattern 2: Dependent Fields

```tsx
const [showAdditional, setShowAdditional] = useState(false);

<FormField label="Type">
  <Select
    options={typeOptions}
    value={formState.type.value}
    onChange={(e) => {
      handleChange('type', e.target.value);
      setShowAdditional(e.target.value === 'other');
    }}
  />
</FormField>

{showAdditional && (
  <FormField label="Additional Info">
    <TextInput
      value={formState.additionalInfo.value}
      onChange={(e) => handleChange('additionalInfo', e.target.value)}
    />
  </FormField>
)}
```

### Pattern 3: Multi-Step Form

```tsx
const [step, setStep] = useState(1);

const handleNext = () => {
  if (validateForm()) {
    setStep(step + 1);
  }
};

return (
  <>
    {step === 1 && (
      <div>
        {/* Step 1 fields */}
        <Button onClick={handleNext}>Next</Button>
      </div>
    )}
    {step === 2 && (
      <div>
        {/* Step 2 fields */}
        <Button onClick={() => setStep(1)}>Back</Button>
        <Button type="submit">Submit</Button>
      </div>
    )}
  </>
);
```

## Accessibility Best Practices

### 1. Always Use Labels

```tsx
// Good
<FormField label="Name" htmlFor="name">
  <TextInput id="name" />
</FormField>

// Bad
<TextInput placeholder="Name" />
```

### 2. Provide Help Text

```tsx
<FormField
  label="Password"
  helpText="Must be at least 8 characters"
>
  <TextInput type="password" />
</FormField>
```

### 3. Mark Required Fields

```tsx
<FormField label="Email" required>
  <TextInput type="email" />
</FormField>
```

### 4. Use Semantic HTML

```tsx
<form onSubmit={handleSubmit}>
  {/* Fields */}
  <Button type="submit">Submit</Button>
</form>
```

## Performance Tips

### 1. Memoize Validation Functions

```tsx
const validateQuantity = useCallback((value: number) => {
  // validation logic
}, []);
```

### 2. Debounce Expensive Validations

```tsx
{
  email: {
    validators: [validateEmail],
    validateOnChange: true,
    debounceMs: 500, // Wait 500ms after typing stops
  },
}
```

### 3. Use React.memo for Large Forms

```tsx
const FormSection = React.memo(({ fields }) => {
  return (
    <>
      {fields.map(field => (
        <FormField key={field.name} {...field} />
      ))}
    </>
  );
});
```

## Troubleshooting

### Issue: Validation not triggering

**Solution:** Ensure you're calling `handleBlur` or setting `validateOnChange: true`

```tsx
<TextInput
  onBlur={() => handleBlur('fieldName')} // Add this
/>
```

### Issue: Form not submitting

**Solution:** Check if `validateForm()` returns true

```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Is valid?', validateForm()); // Debug
  if (validateForm()) {
    // Submit
  }
};
```

### Issue: Errors not displaying

**Solution:** Ensure error prop is passed to both FormField and input

```tsx
<FormField error={formState.field.error}> {/* Add this */}
  <TextInput error={!!formState.field.error} /> {/* And this */}
</FormField>
```

### Issue: TypeScript errors

**Solution:** Ensure types match between form state and validators

```tsx
// Define types explicitly
interface FormValues {
  name: string;
  age: number;
}

const { formState } = useFormValidation<FormValues>(
  { name: '', age: 0 },
  { /* config */ }
);
```

## Migration Checklist

- [ ] Replace native inputs with form components
- [ ] Wrap fields with FormField
- [ ] Implement useFormValidation hook
- [ ] Update validation logic
- [ ] Add error handling
- [ ] Test keyboard navigation
- [ ] Test screen reader support
- [ ] Test in light/dark themes
- [ ] Test on mobile devices
- [ ] Update tests

## Resources

- [Form Components README](./FORM_COMPONENTS_README.md)
- [Form Example](./form-example.tsx)
- [Architecture Guide](../../.kiro/specs/enterprise-ux-ui-enhancement/FORM_COMPONENTS_ARCHITECTURE.md)
- [Validation Utilities](../../lib/utils/validation.ts)
- [Thai Labels](../../lib/constants/thai-labels.ts)
