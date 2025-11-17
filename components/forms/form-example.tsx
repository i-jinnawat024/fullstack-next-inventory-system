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
import { useNotification } from '@/lib/contexts/notification-context';
import { validateRequired, validateEmail, validatePositiveNumber } from '@/lib/utils/validation';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

/**
 * Example form demonstrating all form components with validation
 * This can be used as a reference for building forms in the application
 */
export function FormExample() {
  const {
    formState,
    handleChange,
    handleBlur,
    validateForm,
    getValues,
    resetForm,
    isFormValid,
    isDirty,
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
            const result = validatePositiveNumber(value);
            if (!result.isValid) return result;
            
            if (value > 1000) {
              return { isValid: false, message: 'จำนวนต้องไม่เกิน 1,000' };
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
  const { showSuccess, showError, showInfo } = useNotification();

  const categoryOptions = [
    { value: 'electronics', label: 'อิเล็กทรอนิกส์' },
    { value: 'furniture', label: 'เฟอร์นิเจอร์' },
    { value: 'supplies', label: 'อุปกรณ์สำนักงาน' },
    { value: 'tools', label: 'เครื่องมือ' },
    { value: 'other', label: 'อื่นๆ' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError(
        'ข้อมูลไม่ครบถ้วน',
        'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง'
      );
      return;
    }

    setIsSubmitting(true);
    showInfo('กำลังบันทึกข้อมูล...', 'กรุณารอสักครู่');

    try {
      const values = getValues();
      console.log('Form values:', values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showSuccess(
        THAI_LABELS.saveSuccess,
        'ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว'
      );

      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
      }, 1000);
    } catch (error) {
      console.error('Submit error:', error);
      showError(
        THAI_LABELS.saveError,
        'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    resetForm();
    showInfo('รีเซ็ตฟอร์ม', 'ข้อมูลในฟอร์มถูกล้างเรียบร้อยแล้ว');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h2
          className="text-xl md:text-2xl font-semibold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          ตัวอย่างฟอร์ม
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          ตัวอย่างการใช้งาน Form Components พร้อม Validation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* 2-column layout on tablet and desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Text Input */}
          <FormField
            label={THAI_LABELS.productName}
            required
            error={formState.productName.error}
            helpText="กรอกชื่อสินค้าภาษาไทยหรืออังกฤษ"
            htmlFor="productName"
          >
            <TextInput
              id="productName"
              placeholder="เช่น เครื่องพิมพ์ HP LaserJet"
              value={formState.productName.value}
              onChange={(e) => handleChange('productName', e.target.value)}
              onBlur={() => handleBlur('productName')}
              error={!!formState.productName.error}
              disabled={isSubmitting}
            />
          </FormField>

          {/* Select */}
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
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Full-width textarea */}
        <FormField
          label={THAI_LABELS.description}
          error={formState.description.error}
          helpText="รายละเอียดเพิ่มเติมเกี่ยวกับสินค้า (ไม่บังคับ)"
          htmlFor="description"
        >
          <Textarea
            id="description"
            placeholder="กรอกรายละเอียดสินค้า เช่น รุ่น สี ขนาด ฯลฯ"
            value={formState.description.value}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            disabled={isSubmitting}
          />
        </FormField>

        {/* 2-column layout on tablet and desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Number Input */}
          <FormField
            label={THAI_LABELS.quantity}
            required
            error={formState.quantity.error}
            helpText="จำนวนที่ต้องการเบิก (1-1,000)"
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
              disabled={isSubmitting}
            />
          </FormField>

          {/* Date Picker */}
          <FormField
            label={THAI_LABELS.requestDate}
            required
            error={formState.requestDate.error}
            helpText="เลือกวันที่ต้องการรับสินค้า"
            htmlFor="requestDate"
          >
            <DatePicker
              id="requestDate"
              value={formState.requestDate.value}
              onChange={(date) => handleChange('requestDate', date)}
              error={!!formState.requestDate.error}
              placeholder="เลือกวันที่"
              disabled={isSubmitting}
              minDate={new Date().toLocaleDateString('th-TH', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).split('/').join('/')}
            />
          </FormField>
        </div>

        {/* Full-width email input */}
        <FormField
          label={THAI_LABELS.email}
          required
          error={formState.email.error}
          helpText="อีเมลสำหรับติดต่อกลับ"
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
            disabled={isSubmitting}
          />
        </FormField>

        {/* File Upload */}
        <FormField
          label="เอกสารแนบ"
          helpText="อัปโหลดไฟล์ PDF หรือรูปภาพ (สูงสุด 5MB, ไม่เกิน 3 ไฟล์)"
          htmlFor="attachments"
        >
          <FileUpload
            accept="image/*,.pdf"
            maxSize={5 * 1024 * 1024}
            maxFiles={3}
            multiple
            disabled={isSubmitting}
            onFilesChange={(files) => console.log('Files selected:', files)}
            onUploadError={(error) => console.error('Upload error:', error)}
          />
        </FormField>

        {/* Form Actions - Stack vertically on mobile, horizontal on tablet+ */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={!isFormValid() || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? THAI_LABELS.submitting : THAI_LABELS.submit}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={!isDirty() || isSubmitting}
            className="w-full sm:w-auto"
          >
            {THAI_LABELS.reset}
          </Button>
          <Button
            type="button"
            variant="tertiary"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {THAI_LABELS.cancel}
          </Button>
        </div>

        {/* Form State Debug Info (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div
            className="mt-6 p-4 rounded-lg text-xs font-mono"
            style={{
              backgroundColor: 'var(--color-surface-hover)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div className="font-semibold mb-2">Form State (Dev Only):</div>
            <div>Valid: {isFormValid() ? '✓' : '✗'}</div>
            <div>Dirty: {isDirty() ? '✓' : '✗'}</div>
            <div className="mt-2">
              <pre>{JSON.stringify(getValues(), null, 2)}</pre>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
