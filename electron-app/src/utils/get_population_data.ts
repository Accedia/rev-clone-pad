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
   * Initialize the final forgettables array to be imported
   * It includes initially all forgettables that are not consumables
   *  */
  const finalForgettables = [...nonConsumableForgettables];

  /**
   * If there are more than 0 consumable forgettables,
   * we add them to the final list as one summarized line.
   *
   * Otherwise we do not add them.
   */
  if (consumableForgettables.length > 0) {
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
      /** Defaults. Only partPrice is recalculated in the reduce function */
      {
        oper: 'Repl',
        partType: 'Aftermarket',
        description: 'Not included consumables',
        partNum: 'See invoice/docs',
        lineNote:
          'Note: Invoice has proper quantities of each consumable item & categorized by repair operation',
        quantity: '1',
        partPrice: '0',
      } as Forgettable
    );

    finalForgettables.push(consumablesAsOne);
  }

  return finalForgettables;
};
