export interface ISeller {
  id: string;
  code: number;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUpsertSeller {
  id?: string;
  name: string;
  active: boolean;
}
