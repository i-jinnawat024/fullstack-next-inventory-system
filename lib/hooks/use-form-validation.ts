'use client';

import { useState, useCallback, useEffect } from 'react';
import { ValidationResult } from '@/lib/utils/validation';

export type ValidatorFunction = (value: any) => ValidationResult;

export interface FieldConfig {
  value: any;
  validators?: ValidatorFunction[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export interface FieldState {
  value: any;
  error: string | undefined;
  touched: boolean;
  dirty: boolean;
}

export interface FormState {
  [key: string]: FieldState;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  fieldConfigs: Record<keyof T, Omit<FieldConfig, 'value'>>
) {
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach((key) => {
      state[key] = {
        value: initialValues[key],
        error: undefined,
        touched: false,
        dirty: false,
      };
    });
    return state;
  });

  const [debounceTimers, setDebounceTimers] = useState<Record<string, NodeJS.Timeout>>({});

  // Validate a single field
  const validateField = useCallback(
    (fieldName: string, value: any): string | undefined => {
      const config = fieldConfigs[fieldName];
      if (!config?.validators) return undefined;

      for (const validator of config.validators) {
        const result = validator(value);
        if (!result.isValid) {
          return result.message;
        }
      }
      return undefined;
    },
    [fieldConfigs]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newState = { ...formState };

    Object.keys(formState).forEach((fieldName) => {
      const error = validateField(fieldName, formState[fieldName].value);
      newState[fieldName] = {
        ...formState[fieldName],
        error,
        touched: true,
      };
      if (error) {
        isValid = false;
      }
    });

    setFormState(newState);
    return isValid;
  }, [formState, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (fieldName: string, value: any) => {
      const config = fieldConfigs[fieldName];
      
      setFormState((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value,
          dirty: true,
        },
      }));

      // Clear existing debounce timer
      if (debounceTimers[fieldName]) {
        clearTimeout(debounceTimers[fieldName]);
      }

      // Validate on change with debounce if configured
      if (config?.validateOnChange) {
        const debounceMs = config.debounceMs || 300;
        
        const timer = setTimeout(() => {
          const error = validateField(fieldName, value);
          setFormState((prev) => ({
            ...prev,
            [fieldName]: {
              ...prev[fieldName],
              error,
            },
          }));
        }, debounceMs);

        setDebounceTimers((prev) => ({
          ...prev,
          [fieldName]: timer,
        }));
      }
    },
    [fieldConfigs, validateField, debounceTimers]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (fieldName: string) => {
      const config = fieldConfigs[fieldName];
      const currentValue = formState[fieldName].value;

      setFormState((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          touched: true,
        },
      }));

      // Validate on blur if configured
      if (config?.validateOnBlur !== false) {
        const error = validateField(fieldName, currentValue);
        setFormState((prev) => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            error,
          },
        }));
      }
    },
    [fieldConfigs, formState, validateField]
  );

  // Reset form
  const resetForm = useCallback(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach((key) => {
      state[key] = {
        value: initialValues[key],
        error: undefined,
        touched: false,
        dirty: false,
      };
    });
    setFormState(state);
    
    // Clear all debounce timers
    Object.values(debounceTimers).forEach(clearTimeout);
    setDebounceTimers({});
  }, [initialValues, debounceTimers]);

  // Set field value programmatically
  const setFieldValue = useCallback((fieldName: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        dirty: true,
      },
    }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((fieldName: string, error: string | undefined) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error,
      },
    }));
  }, []);

  // Get form values
  const getValues = useCallback((): T => {
    const values: any = {};
    Object.keys(formState).forEach((key) => {
      values[key] = formState[key].value;
    });
    return values;
  }, [formState]);

  // Check if form is valid
  const isFormValid = useCallback((): boolean => {
    return Object.values(formState).every((field) => !field.error);
  }, [formState]);

  // Check if form has errors
  const hasErrors = useCallback((): boolean => {
    return Object.values(formState).some((field) => field.error);
  }, [formState]);

  // Check if form is dirty
  const isDirty = useCallback((): boolean => {
    return Object.values(formState).some((field) => field.dirty);
  }, [formState]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers).forEach(clearTimeout);
    };
  }, [debounceTimers]);

  return {
    formState,
    handleChange,
    handleBlur,
    validateForm,
    validateField,
    resetForm,
    setFieldValue,
    setFieldError,
    getValues,
    isFormValid,
    hasErrors,
    isDirty,
  };
}

export type { ValidationResult };
