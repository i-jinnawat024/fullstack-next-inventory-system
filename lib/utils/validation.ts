// Validation utilities for forms and data

import { THAI_LABELS } from '../constants/thai-labels';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, message: THAI_LABELS.required };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: THAI_LABELS.invalidEmail };
  }
  
  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, message: THAI_LABELS.required };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: THAI_LABELS.passwordTooShort };
  }
  
  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: any): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: THAI_LABELS.required };
  }
  
  return { isValid: true };
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value: number): ValidationResult {
  if (value <= 0) {
    return { isValid: false, message: THAI_LABELS.quantityMustBePositive };
  }
  
  return { isValid: true };
}

/**
 * Validate stock quantity against available stock
 */
export function validateStockQuantity(requested: number, available: number): ValidationResult {
  if (requested > available) {
    return { isValid: false, message: THAI_LABELS.insufficientStock };
  }
  
  return { isValid: true };
}

/**
 * Validate Thai date format (DD/MM/YYYY)
 */
export function validateThaiDate(dateStr: string): ValidationResult {
  if (!dateStr) {
    return { isValid: false, message: THAI_LABELS.required };
  }
  
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(dateStr)) {
    return { isValid: false, message: 'รูปแบบวันที่ไม่ถูกต้อง (DD/MM/YYYY)' };
  }
  
  const parts = dateStr.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
    return { isValid: false, message: 'วันที่ไม่ถูกต้อง' };
  }
  
  return { isValid: true };
}