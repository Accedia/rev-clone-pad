import { Forgettable } from '../interfaces/Forgettable';

export const getPopulationData = (forgettable: Forgettable): string[] => {
  const {
    oper,
    description,
    quantity,
    partPrice: partPrice$,
    extPrice,
    laborHours,
    laborType,
    paintHours,
  } = forgettable;

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

export const prepareForgettablesData = (forgettables: Forgettable[]): Forgettable[] => {
  const nonConsumableForgettables = forgettables.filter((f) => f.type !== 'consumable');
  const consumableForgettables = forgettables.filter((f) => f.type === 'consumable');

  /**
   * Import single line for all consumable forgettables
   * It has fixed lineNote and description
   * Quantity is set to 1, partPrice is calculated partPrice of all forgettables
   *
   * See ticket #3520 for reference
   * */
  const consumablesAsOne = consumableForgettables.reduce(
    (acc, curr) => {
      const newPartPrice = Number(acc.partPrice) + Number(curr.partPrice || 0) * Number(curr.quantity || 0);
      acc.partPrice = newPartPrice.toFixed(2);
      return acc;
    },
    {
      oper: 'Repl',
      partType: 'Aftermarket',
      description: 'Not included consumables See invoice/docs',
      lineNote:
        'Note: Invoice has proper quantities of each consumable item & categorized by repair operation',
      quantity: '1',
      partPrice: '0',
    } as Forgettable
  );

  return [...nonConsumableForgettables, consumablesAsOne];
};
