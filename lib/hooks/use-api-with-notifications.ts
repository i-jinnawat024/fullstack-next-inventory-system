import { useState, useCallback } from 'react';
import { useNotification } from '@/lib/contexts/notification-context';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

interface ApiOptions {
  successMessage?: string;
  errorMessage?: string;
  showLoadingNotification?: boolean;
  loadingMessage?: string;
}

/**
 * Hook for making API calls with automatic notification handling
 * Shows loading, success, and error notifications based on API response
 */
export function useApiWithNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError, showInfo } = useNotification();

  const callApi = useCallback(
    async <T = any>(
      apiCall: () => Promise<Response>,
      options: ApiOptions = {}
    ): Promise<T | null> => {
      const {
        successMessage,
        errorMessage,
        showLoadingNotification = false,
        loadingMessage = THAI_LABELS.loading,
      } = options;

      setIsLoading(true);

      if (showLoadingNotification) {
        showInfo(loadingMessage);
      }

      try {
        const response = await apiCall();
        const data = await response.json();

        if (!response.ok) {
          // Handle API error response
          const message = data.error?.message || errorMessage || THAI_LABELS.error;
          showError(THAI_LABELS.error, message);
          return null;
        }

        // Handle success
        if (successMessage) {
          showSuccess(THAI_LABELS.success, successMessage);
        }

        return data.data || data;
      } catch (error) {
        // Handle network or other errors
        console.error('API call error:', error);
        const message = errorMessage || THAI_LABELS.networkError;
        showError(THAI_LABELS.error, message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [showSuccess, showError, showInfo]
  );

  return {
    callApi,
    isLoading,
  };
}
