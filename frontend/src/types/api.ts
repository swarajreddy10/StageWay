export type ApiError = {
  message: string;
  code?: string;
  statusCode: number;
  errors?: Record<string, string[]>;
};

export type PaginatedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};
