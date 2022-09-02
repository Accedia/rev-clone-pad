import { LaborType, OperationType, PartType } from '../enums';

export interface Forgettable {
  id: string;
  groupName: string;
  unsupportedSystems: string[];
  description: string;
  lineNote: string;
  operation: OperationType;
  laborHours: number;
  laborType: LaborType;
  paintHours: number;
  partNumber: string;
  partType: PartType;
  partPrice: number;
  quantity: number;
}
