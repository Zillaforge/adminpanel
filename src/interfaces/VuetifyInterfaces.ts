type SelectItemKey =
  | boolean
  | string
  | Array<string | number>
  | ((item: Record<string, any>, fallback?: any) => any);
type DataTableCompareFunction<T = any> = (a: T, b: T) => number;

export type FilterMatch =
  | boolean
  | number
  | [number, number]
  | Array<[number, number]>;

export type DataTableItemValue =
  | boolean
  | string
  | number
  | null
  | undefined
  | Date
  | Array<string | number>
  | Record<string, any>;

interface InternalItem<T = any> {
  [x: string]: any;
  value: any;
  raw: T;
}

export interface DataTableHeader {
  key: string;
  value?: SelectItemKey;
  title: string;
  subTitle?: string;
  colspan?: number;
  rowspan?: number;
  fixed?: boolean;
  align?: 'start' | 'end' | 'center' | 'left';
  width?: number | string;
  minWidth?: string;
  maxWidth?: string;
  sortable?: boolean;
  sort?: DataTableCompareFunction;
  optional?: boolean;
}

export interface SortItem {
  key: string;
  order?: boolean | 'asc' | 'desc';
}

export type FilterFunction = (
  value: string,
  query: string,
  item?: InternalItem,
) => FilterMatch;
