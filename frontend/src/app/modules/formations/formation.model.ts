export interface Formation {
  id?: number;
  name: string;
  type: string;
  level: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  fundingAmount?: number;
  fundingType?: string;
  code?: string;
  createdBy?: {
    id: number;
    username: string;
    fullName?: string;
  };
}