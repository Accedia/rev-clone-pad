import { Forgettable } from '../interfaces/Forgettable';

const getToStringOrNull = (value: number) => {
  return value ? value.toString() : null;
}

const getOper = (value: string) => {
  if (!value) {
    return null;
  }
  
  return value === 'R_I' ? 'R&I' : value;
}

export const getPopulationData = (forgettables: Forgettable[]): string[][] => {
  const data = [];

  for (const forgettable of forgettables) {
    const extPrice = ((forgettable.quantity || 0) * (forgettable.partPrice$ || 0)).toFixed(2);

    data.push([
      null,
      null,
      null,
      null,
      null,
      null,
      getOper(forgettable.oper),
      null,
      forgettable.description,
      null,
      getToStringOrNull(forgettable.quantity),
      getToStringOrNull(forgettable.partPrice$),
      extPrice,
      null,
      null,
      getToStringOrNull(forgettable.laborHours),
      null,
      getToStringOrNull(forgettable.paintHours),
    ]);
  }

  return data;
};
