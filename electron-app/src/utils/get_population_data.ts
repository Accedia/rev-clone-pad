import { Forgettable } from '../interfaces/Forgettable';

export const getPopulationData = (forgettables: Forgettable[]): string[][] => {
  const data = [];

  for (const {
    oper,
    description,
    quantity,
    partPrice$,
    extPrice,
    laborHours,
    laborType,
    paintHours,
  } of forgettables) {
    data.push([
      null,
      null,
      null,
      null,
      null,
      null,
      oper,
      null,
      description,
      null,
      quantity,
      partPrice$,
      extPrice,
      null,
      null,
      laborHours,
      laborType,
      paintHours,
    ]);
  }

  return data;
};
