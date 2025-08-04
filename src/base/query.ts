export interface Pagination {
  limit?: number;
  page?: number;
  sort?: boolean;
  [filter: string]: any;
}

export const defaultPagination: Pagination = {
  limit: 20,
  page: 0,
  sort: false,
};
