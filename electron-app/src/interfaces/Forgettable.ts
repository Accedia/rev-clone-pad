export interface Forgettable {
  id: string;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  note?: string;
  oper: string;
  description?: string;
  partType?: string;
  partPrice$?: number;
  quantity?: number;
  taxable?: string;
  laborHours?: number;
  laborType?: string;
  paintHours?: number;
  type: 'general' | 'specific';
  status?: 'approved' | 'pending' | 'denied';
  template?: boolean;
  estimateId?: string;
  orderId?: string;
  groupId?: string;
  creatorUserId?: string;
  adminUserId?: string;
  entityId?: string;
  parentForgettableId?: string;
  changes?: any;
  usesCount: number;
  attachments: any[];
}
