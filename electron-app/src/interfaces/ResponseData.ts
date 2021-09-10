import { Forgettable } from './Forgettable';

export interface ResponseData {
  forgettables: Forgettable[];
  orderNumber: string;
  orderCustomerName: string;
  automationId: string;
}
