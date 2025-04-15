import { ColumnDef } from "@tanstack/react-table";

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  searchKey?: string;
  pageSize?: number;
  onEdit?: (row: TData) => void;
  onView?: (row: TData) => void;
};

export type DataTablePaginationProps = {
  table: any;
  pageSizeOptions?: number[];
};
