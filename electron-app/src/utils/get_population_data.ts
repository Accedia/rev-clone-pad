import { Forgettable } from '../interfaces/Forgettable';

export const getPopulationData = (forgettable: Forgettable): string[] => {
  const { oper, description, quantity, partPrice$, extPrice, laborHours, laborType, paintHours } =
    forgettable;

  return [
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
  ];
};
