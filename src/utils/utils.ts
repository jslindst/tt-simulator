
export interface GroupedByObject<T> {
  [key: string | number]: T[]
}

/**
 * Groups an array of objects based on a specified property.
 * 
 * @template T - The type of elements in the input array.
 * @param {T[]} data - The array of objects to be grouped.
 * @param {string} groupByProperty - The property name on which the grouping is to be based.
 * @returns {{ [key: string | number]: T[] }} An object with keys as distinct values of the `groupByProperty`.
 * Each key corresponds to an array of objects from `data` that share that key value.
 * 
 * @example
 * // Usage with an array of user objects:
 * type User = {
 *   id: number;
 *   name: string;
 *   role: string;
 * };
 * const users: User[] = [
 *   { id: 1, name: 'Alice', role: 'admin' },
 *   { id: 2, name: 'Bob', role: 'user' },
 *   { id: 3, name: 'Charlie', role: 'admin' },
 * ];
 * const groupedByRole = groupByReduce(users, 'role');
 * // groupedByRole will now be an object grouping users by their roles
 */
export function groupByReduce<T>(data: T[], groupByProperty: string): { [key: string | number]: T[] } {
  if (data === undefined) return {};
  return data.reduce((group: { [key: string]: T[] }, item) => {
    if (item === undefined) return group;
    // @ts-ignore
    var property = item[groupByProperty];
    group[property] = group[property] ?? [];
    group[property].push(item);
    return group;
  }, {});
};

/**
 * Groups an array of objects based on a given lambda function that extracts the key for grouping.
 * 
 * @template T - The type of elements in the input array.
 * @param {T[]} data - The array of objects to be grouped.
 * @param {(item: T) => string | number} lambda - A lambda function that takes an element of the array and returns a property value (string or number) to group by.
 * @returns {{ [key: string | number]: T[] }} An object with keys as distinct values returned by the lambda function. Each key corresponds to an array of objects from `data` that share that key value.
 * 
 * @example
 * // Usage with an array of user objects and a lambda function:
 * type User = {
 *   id: number;
 *   name: string;
 *   age: number;
 * };
 * const users: User[] = [
 *   { id: 1, name: 'Alice', age: 30 },
 *   { id: 2, name: 'Bob', age: 25 },
 *   { id: 3, name: 'Charlie', age: 30 },
 * ];
 * const groupedByAge = groupByReduceFunction(users, user => user.age);
 * // groupedByAge will now be an object grouping users by their ages
 */
export function groupByReduceFunction<T>(data: T[], lambda: (item: T) => string | number): { [key: string | number]: T[] } {
  if (data === undefined) return {};
  // @ts-ignore
  return data.reduce((group: { [key: string]: T[] }, item) => {
    if (item === undefined) return group;
    var property = lambda(item);
    group[property] = group[property] ?? [];
    group[property].push(item);
    return group;
  }, {});
};


export function groupByReduceFunctionMultiple<T>(data: T[], lambda: (item: T) => (string | number)[]): { [key: string | number]: T[] } {
  if (data === undefined) return {};
  // @ts-ignore
  return data.reduce((group: { [key: string]: T[] }, item) => {
    if (item === undefined) return group;
    var groupNames = lambda(item);
    groupNames.forEach(name => {
      group[name] = group[name] ?? [];
      group[name].push(item);
    }
    );
    return group;
  }, {});
};

/**
 * Transforms a grouped object into a flattened array based on a lambda function applied to each group.
 * 
 * @template T - The type of elements in the grouped object.
 * @template A - The type of elements in the output array.
 * @param {{ [key: string | number]: T[] }} groupedByObject - An object with keys as distinct values and values as arrays of type T.
 * @param {(values: T[]) => A} lambda - A lambda function that takes an array of elements (T[]) and returns an element of type A, which is used to transform each group.
 * @returns {A[]} An array containing the transformed elements of each group.
 * 
 * @example
 * // Usage with a grouped object and a lambda function to process each group:
 * const groupedUsers = {
 *   'admin': [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
 *   'user': [{ id: 3, name: 'Charlie' }]
 * };
 * const counts = flattenGroupBy(groupedUsers, group => group.length);
 * // counts will be an array of the counts of each group, e.g., [2, 1]
 */
export function flattenGroupBy<T, A>(groupedByObject: { [key: string | number]: T[] }, lambda: (values: T[]) => A): A[] {
  const keys = Object.keys(groupedByObject);
  // @ts-ignore
  return keys.map(key => lambda(groupedByObject[key])).flat();
}

/**
  * Takes a grouped by object, where properties are the keys and values are arrays and 
  * returns a new groupedbyObject, where the lambda has been run for each 
 * @param groupedByObject 
 * @param lambda 
 * @returns 
 */
export function flattenGroupByKeepGroup<T, A>(groupedByObject: { [key: string | number]: T[] }, lambda: (values: T[]) => A): { [key: string]: A } {
  const keys = Object.keys(groupedByObject);
  const result: { [key: string | number]: A } = {}
  keys.forEach(key => {
    result[key] = lambda(groupedByObject[key])
  });
  return result;
}


/**
 * Function that finds from a data array the item that returns the smallest value for the distance function.
 * @param data array of items
 * @param distanceFn function to use to evaluate each item in the array
 * @returns undefined, or data value that returned minimum value for the distance function
 */
export function findMin<T>(data: T[], distanceFn: (item: T) => number): T {
  return data?.reduce(function (prev, curr) {
    return distanceFn(curr) < distanceFn(prev) ? curr : prev;
  });
};

export function toNumber(value: any, defaultValue = 100000) {
  if (typeof value === 'number') return value;
  return (value ? Number(value.replace(/[^0-9.-]+/g, "")) : defaultValue);
}

export function findClosestLessOrEqual<T>(sortedArray: T[], distance: (item: T) => number): T | undefined {
  let left: number = 0;
  let right: number = sortedArray.length - 1;

  // Edge cases: if the target date is less than the first element or greater than the last element,
  // return the first or last element respectively.
  if (distance(sortedArray[left]) < 0) {
    return sortedArray[left];
  } else if (distance(sortedArray[right]) >= 0) {
    return sortedArray[right];
  }

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (distance(sortedArray[mid]) === 0) {
      // If we found an exact match return it.
      return sortedArray[mid];
    } else if (distance(sortedArray[mid]) < 0) {
      // If the middle element is less than the target date, look for a closer element in the right half.
      left = mid + 1;
    } else {
      // If the middle element is greater than the target date, look for a closer element in the left half.
      right = mid - 1;
    }
  }

  // At this point, we have narrowed down left and right indices to the two closest elements to the target date.
  // Choose the closer element and return it.
  if (distance(sortedArray[right]) < distance(sortedArray[left])) {
    return sortedArray[right];
  } else {
    return sortedArray[left];
  }
}

export function getNestedProperty<T>(obj: T, property: string): any {
  const properties = property.split('.');
  let result: any = obj;

  for (const prop of properties) {
    if (result && result.hasOwnProperty(prop)) {
      result = result[prop];
    } else {
      return null;
    }
  }

  return result;
}

/**
 * Set a property to the object based on a lookup with matching id
 * @param object object to be modified
 * @param idField idField of the modified which references an id of the lookup
 * @param propertyName property to be set
 * @param lookup lookup object where id's are keys and objects are values
 */
export function addPropertyFromLookup<T>(object: T, idField: string, propertyName: keyof T, lookup: { [key: string]: any }) {
  //@ts-ignore
  object[propertyName] = lookup[object[idField]];
}

/**
 * Defines a calculated property to the object
 * @param object object to be modified
 * @param propertyName name of the property to be set
 * @param get function to set as getter
 */
export function defineCalculatedProperty<T>(object: T, propertyName: keyof T, get: () => any): void {
  // @ts-ignore
  if (object.hasOwnProperty(propertyName)) {
    //    console.warn(`Object already has a property called '${propertyName}!`, object);
    return;
  }
  Object.defineProperty(object, propertyName, {
    get,
    enumerable: true,
  });
}


/**
 * Adds 
 * @param objects 
 * @param objIdField 
 * @param toField 
 * @param keyedRelationObjects 
 * @returns 
 */
export function addPropertyFromKeyedObject<T, A>(objects: T[], objIdField: string, toField: string, keyedRelationObjects: { [key: string]: A }): T[] {
  objects.forEach(object => {
    // @ts-ignore
    object[toField] = keyedRelationObjects[object[objIdField]];
  });
  return objects;
}

function copy<T>(item: T, copy: boolean): T {
  if (!copy) return item;
  return { ...item };
}

// ARRAY FINDERS
export function latest<T>(descSortedGroup: T[], copyObj: boolean = false): T | null {
  if (descSortedGroup.length === 0) return null;
  return copy(descSortedGroup[0], copyObj);
}

export function latestBefore<T>(pastDate: Date, descSortedGroup: T[], propertyName: keyof T, copyObj: boolean = false): T | null {
  for (const object of descSortedGroup)
    if (new Date(object[propertyName] as any) <= pastDate) {
      return copy(object, copyObj);
    }
  return null;
}

/**
 * Time until target date, if the time has already passed MAX_SAFE_INTEGER is returned  
 * @param targetDate date which is the last
 */
export function timeUntil<T>(targetDate: Date, propertyName: keyof T) {
  const closestBeforeEqualPredicate = (item: T) => {
    if (!item) return Number.MAX_SAFE_INTEGER;
    const propertyValue = item[propertyName];
    if (!propertyValue) return Number.MAX_SAFE_INTEGER;
    const diff = targetDate.getTime() - new Date(propertyValue as string).getTime();
    return diff >= 0 ? diff : Number.MAX_SAFE_INTEGER;
  }
  return closestBeforeEqualPredicate;
}

export function latestBeforeUnsorted<T>(date: Date = new Date(), group: T[], propertyName: keyof T): T | null {
  return findMin(group, timeUntil(date, propertyName));
}


type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

/**
 * Distribute values of an array to subarrays as evenly as possible
 * @param inputArr array to be split
 * @param numOfArrays number of arrays to be created
 * @param property property of the objects to used as sorting
 * @returns 
 */
export function distribute<N>(inputArr: N[], numOfArrays: number, property: NumericKeys<N>): N[][] {
  // @ts-ignore
  const sortedArr = [...inputArr].sort((a, b) => a[property] - b[property]);

  let res: N[][] = Array.from({ length: numOfArrays }, () => []);

  sortedArr.forEach((item, index) => {
    const arrayIndex = index % numOfArrays;
    res[arrayIndex].push(item);
  });

  return res;
}


export function ensureDefault<T>(obj: T | undefined | null, defaultValue: T): T {
  if (isEmpty(obj)) return defaultValue;
  return obj as T;
}

/**
 * Checks if object is empty
 * @param obj object to check
 * @returns 
 */
export function isEmpty(obj: any): boolean {
  if (obj === null) return true;
  if (typeof obj === "string" && obj.trim().length === 0) return true;
  if (Array.isArray(obj) && obj.length === 0) return true;
  if (typeof obj === "object" && Object.keys(obj).length === 0) return true;
  return false;
}


/**
 * Splits a long string into shorter strings at the white spaces, trying
 * to balance so that all the split strings are close in length if possible
 * @param str string to be split
 * @param maxLength maximum length of an individual string segment
 * @returns array of split strings
 */
export function splitStringBalanced(str: string, maxLength: number): string[] {
  if (str.length <= maxLength) {
    return [str];
  }

  const words = str.split(/\s+/);
  let currentLine = words[0];
  let lines: string[] = [];

  for (let i = 1; i < words.length; i++) {
    if (currentLine.length + 1 + words[i].length <= maxLength) {
      currentLine += ' ' + words[i];
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }

  lines.push(currentLine);
  return lines;
}

/**
 * Formats a string array so that it can be sent to hasura and then to PSQL
 * @param array of strings
 * @returns string that can be stored to a property of an object going to hasura
 */
export function formatArrayForHasura(array: string[]): string {
  array = array.filter(item => item);
  return `{${array.map(item => {
    if (item.includes(',') || item.includes('"')) {
      return `"${item.replace(/"/g, '\'')}"`;
    }
    return item;
  }).join(',')}}`;
}

export function extractNumber(inputString: any): number | null {
  if (!inputString) return null;
  const regex = /^-?\d+(\.\d+)?/;
  const match = inputString.match(regex);

  if (match) {
    return parseFloat(match[0]);
  }

  return null;
}

export function getValueFromObject(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && current.hasOwnProperty(part)) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
};

/**
 * @param url to check
 * @returns Promise<boolean> of wheter the resource existed or not
 */
export async function urlExists(url: RequestInfo | URL, contentType?: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.status >= 200 &&
      response.status < 400 && (!contentType || contentType === response.headers.get("Content-Type"));
  } catch (error) {
    console.error('Error checking URL:', error);
    return false;
  }
}

export interface Weighted {
  weight: number;
}

export interface Choice<T> extends Weighted {
  value: T;
};

export function randomWeighted<T extends Weighted>(weightedItems: T[]): T {
  // Calculate the total weight of all the choices
  const totalWeight = weightedItems.reduce((sum, choice) => sum + choice.weight, 0);

  // Generate a random number between 0 and the total weight
  const randomWeight = Math.random() * totalWeight;

  // Loop through the choices and subtract their weights from the random weight
  // until we find the choice whose weight caused the random weight to drop below zero
  let cumulativeWeight = 0;
  for (const choice of weightedItems) {
    cumulativeWeight += choice.weight;
    if (randomWeight < cumulativeWeight) return choice;
  }
  // If for some reason we don't find a choice, just return the last one
  return weightedItems[0];
}

/**
 * Returns a random choice from given weighted choices.
 * @param choices 
 * @returns a random choice from the given alternatives.
 */
export function randomChoiceValue<T>(choices: Choice<T>[]): T {
  return randomWeighted(choices).value;
}

export const isNil = <T>(x: T): x is ((null | undefined) & T) => x === null || x === undefined
export const isNotNil = <T>(x: T): x is NonNullable<T> => !isNil(x)

export const clampNumBetween = (num: number, min: number, max: number): number => {
  return Math.max(min, Math.min(num, max))
}
