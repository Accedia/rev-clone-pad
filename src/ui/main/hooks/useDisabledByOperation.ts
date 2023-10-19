import { Forgettable } from '../../../shared/models';
import { OperationType } from '../../../shared/enums'; 

type ForgettableKey = keyof Forgettable;
type FieldByOperationHook = (accessor: ForgettableKey) => boolean;

const COMMON_FIELDS: ForgettableKey[] = ['description', 'lineNote'];
const FIELDS_BY_OPERATION: Record<OperationType, ForgettableKey[]> = {
  [OperationType.REPL]: ['laborHours', 'paintHours', 'partNumber', 'partPrice'],
  [OperationType.RPR]: ['laborHours', 'paintHours'],
  [OperationType.REFN]: ['paintHours'],
  [OperationType.R_I]: ['laborHours'],
  [OperationType.SECT]: ['laborHours'],
  [OperationType.SUBL]: ['partNumber', 'partPrice'],
  [OperationType.BLND]: ['paintHours'],
  [OperationType.PDR]: ['partPrice'],
  [OperationType.NONE]: [],
};

const useFieldByOperation = (
  forgettable: Forgettable | null
): FieldByOperationHook => {
  const isDisabled = (accessor: ForgettableKey): boolean => {
    if (!forgettable) {
      return true;
    }

    const { operation } = forgettable;
    const enabledFields = [...COMMON_FIELDS, ...FIELDS_BY_OPERATION[operation]];
    return !enabledFields.includes(accessor);
  };

  return isDisabled;
};

export default useFieldByOperation;
