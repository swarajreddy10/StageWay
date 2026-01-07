import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          return status >= 500 && failureCount < 3;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        const message = error instanceof Error ? error.message : 'An error occurred';
        toast.error(message);
      },
      onSuccess: () => {
        toast.success('Operation completed successfully');
      },
    },
  },
});

// Global state store for UI state
interface UIState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  notifications: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      notifications: [],
      addNotification: (notification) => {
        const id = Date.now().toString();
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id }],
        }));
        // Auto-remove after 5 seconds
        setTimeout(() => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        }, 5000);
      },
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    { name: 'ui-store' }
  )
);

// Query keys factory
export const queryKeys = {
  events: ['events'] as const,
  event: (id: number) => ['events', id] as const,
  registrations: ['registrations'] as const,
  userRegistrations: (userId: number) => ['registrations', 'user', userId] as const,
  eventRegistrations: (eventId: number) => ['registrations', 'event', eventId] as const,
  attendees: (eventId: number) => ['attendees', eventId] as const,
} as const;
