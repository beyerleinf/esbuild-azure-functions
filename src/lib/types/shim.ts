export interface Shim {
  imports: ShimImport[];
  code: string;
}

export interface ShimImport {
  as: string;
  from: string;
  isDefault?: boolean;
}
