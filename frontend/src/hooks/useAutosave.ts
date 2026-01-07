import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface AutosaveOptions<T> {
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutosave<T extends Record<string, unknown>>(
  data: T,
  options: AutosaveOptions<T>
) {
  const {
    onSave,
    debounceMs = 2000,
    enabled = true,
    onSaveSuccess,
    onSaveError,
  } = options;

  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<T | null>(null);
  const errorRef = useRef<Error | null>(null);

  // Simple debounce without useDebounce hook to avoid type issues
  const debouncedDataRef = useRef<T>(data);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      debouncedDataRef.current = data;
    }, debounceMs);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debounceMs]);

  // Check if data has actually changed
  const hasChanged = useCallback(
    (currentData: T, savedData: T | null): boolean => {
      if (!savedData) return true;
      
      return JSON.stringify(currentData) !== JSON.stringify(savedData);
    },
    []
  );

  // Save function
  const save = useCallback(
    async (dataToSave: T) => {
      if (isSavingRef.current || !enabled) return;

      try {
        isSavingRef.current = true;
        errorRef.current = null;

        await onSave(dataToSave);
        
        lastSavedRef.current = { ...dataToSave };
        onSaveSuccess?.();
        
        // Show subtle success indicator (not toast)
        console.log('Autosaved successfully');
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Autosave failed');
        errorRef.current = err;
        onSaveError?.(err);
        
        // Show error only once
        if (err.message !== errorRef.current?.message) {
          toast.error('Failed to save changes');
        }
      } finally {
        isSavingRef.current = false;
      }
    },
    [onSave, enabled, onSaveSuccess, onSaveError]
  );

  // Trigger save when debounced data changes
  const debouncedData = debouncedDataRef.current;
  useEffect(() => {
    if (hasChanged(debouncedData, lastSavedRef.current)) {
      save(debouncedData);
    }
  }, [debouncedData, hasChanged, save]);

  // Manual save function
  const manualSave = useCallback(() => {
    if (hasChanged(data, lastSavedRef.current)) {
      return save(data);
    }
  }, [data, hasChanged, save]);

  return {
    isSaving: isSavingRef.current,
    error: errorRef.current,
    lastSaved: lastSavedRef.current,
    manualSave,
    hasUnsavedChanges: hasChanged(data, lastSavedRef.current),
  };
}
