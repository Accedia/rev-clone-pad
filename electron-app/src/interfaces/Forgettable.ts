export interface Forgettable {
  oper: string;
  description?: string;
  quantity?: string;
  partPrice?: string;
  extPrice?: string;
  laborType?: string;
  laborHours?: string;
  paintHours?: string;
  partNum?: string;
  lineNote?: string;
  type?: 'consumable' | 'specific' | 'general';
  partType?: string;
  rowData: any[];
}
