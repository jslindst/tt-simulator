export const groupByReduceFunction = (data, lambda) => {
  if (data === undefined) return [];
  // @ts-ignore
  return data.reduce((group, item) => {
    if (item === undefined) return group;
    var property = lambda(item);
    group[property] = group[property] ?? [];
    group[property].push(item);
    return group;
  }, {});
};