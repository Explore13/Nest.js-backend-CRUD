export interface PaginationMetaFormat {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  itemsPerPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMetaFormat;
}
