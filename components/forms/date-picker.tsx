'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/format';

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  error?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  id?: string;
}

export function DatePicker({
  value = '',
  onChange,
  error,
  disabled,
  fullWidth = true,
  placeholder = 'DD/MM/YYYY',
  minDate,
  maxDate,
  id,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? parseThaiDate(value) : null
  );
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate || new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setDisplayValue(value);
      setSelectedDate(parseThaiDate(value));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  function parseThaiDate(dateStr: string): Date | null {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  function formatThaiDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function handleDateSelect(date: Date) {
    const formatted = formatThaiDate(date);
    setSelectedDate(date);
    setDisplayValue(formatted);
    onChange?.(formatted);
    setIsOpen(false);
  }

  function getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add empty slots for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(new Date(0));
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  function isSameDay(date1: Date | null, date2: Date): boolean {
    if (!date1) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  function isToday(date: Date): boolean {
    return isSameDay(new Date(), date);
  }

  function isDisabled(date: Date): boolean {
    if (date.getTime() === 0) return true;
    if (minDate) {
      const min = parseThaiDate(minDate);
      if (min && date < min) return true;
    }
    if (maxDate) {
      const max = parseThaiDate(maxDate);
      if (max && date > max) return true;
    }
    return false;
  }

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  const baseStyles = 'rounded-md px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 cursor-pointer';

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          baseStyles,
          fullWidth && 'w-full',
          error && 'ring-2',
          disabled && 'cursor-not-allowed opacity-60',
          'flex items-center justify-between'
        )}
        style={{
          backgroundColor: 'var(--color-surface)',
          color: displayValue ? 'var(--color-text)' : 'var(--color-text-muted)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
          ...(error && {
            '--tw-ring-color': 'var(--color-error)',
          } as any),
          ...(!error && {
            '--tw-ring-color': 'var(--color-primary)',
          } as any),
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        id={id}
      >
        <span>{displayValue || placeholder}</span>
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div
          className="absolute z-50 mt-2 rounded-lg shadow-lg p-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--color-border)',
            minWidth: '280px',
          }}
          role="dialog"
          aria-label="Calendar"
        >
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-1 rounded hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-text)' }}
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="font-medium" style={{ color: 'var(--color-text)' }}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-1 rounded hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-text)' }}
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium py-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const isEmpty = date.getTime() === 0;
              const disabled = isDisabled(date);
              const selected = isSameDay(selectedDate, date);
              const today = isToday(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isEmpty && !disabled && handleDateSelect(date)}
                  disabled={isEmpty || disabled}
                  className={cn(
                    'text-sm py-1.5 rounded transition-all',
                    isEmpty && 'invisible',
                    !isEmpty && !disabled && 'hover:opacity-70',
                    disabled && 'opacity-30 cursor-not-allowed',
                    selected && 'font-semibold',
                    today && !selected && 'font-medium'
                  )}
                  style={{
                    color: selected ? 'white' : 'var(--color-text)',
                    backgroundColor: selected ? 'var(--color-primary)' : today ? 'var(--color-surface-hover)' : 'transparent',
                  }}
                  aria-label={isEmpty ? undefined : formatThaiDate(date)}
                  aria-selected={selected}
                >
                  {!isEmpty && date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export type { DatePickerProps };
