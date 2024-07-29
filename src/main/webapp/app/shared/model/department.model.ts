export interface IDepartment {
  id?: number;
  name?: string;
  description?: string | null;
}

export const defaultValue: Readonly<IDepartment> = {};
