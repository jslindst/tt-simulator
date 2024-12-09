
export const groupByReduceFunction = <T>(data: T[], lambda: (item: T) => string | number): Record<string | number, T[]> => {
  if (data === undefined) return {} as Record<string | number, T[]>;
  // @ts-ignore
  return data.reduce((group, item) => {
    if (item === undefined) return group;
    var property = lambda(item);
    group[property] = group[property] ?? [];
    group[property].push(item);
    return group;
  }, {});
};