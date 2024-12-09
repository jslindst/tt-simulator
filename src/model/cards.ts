const investmentCardData = [["id", "Factory", "Tech1", "Tech2", "Special"],
[1, 2, "AirDefense Radar", "Heavy Tanks", ""],
[2, 3, "Heavy Tanks", "Rocket Artillery", ""],
[3, 1, "", "", "Science 1938"],
[4, 1, "Sonar", "AirDefense Radar", ""],
[5, 1, "Naval Radar", "Sonar", ""],
[6, 3, "AirDefense Radar", "Rocket Artillery", ""],
[7, 1, "Sonar", "AirDefense Radar", ""],
[8, 2, "Sonar", "Naval Radar", ""],
[9, 2, "Rocket Artillery", "Sonar", ""],
[10, 2, "Naval Radar", "Heavy Tanks", ""],
[11, 3, "LSTs", "Motorized Infantry", ""],
[12, 3, "Heavy Bombers", "LSTs", ""],
[13, 4, "Heavy Bombers", "Jets", ""],
[14, 1, "", "", "Science 1938"],
[15, 3, "Jets", "Motorized Infantry", ""],
[16, 4, "LSTs", "Atomic Research 3", ""],
[17, 4, "Heavy Bombers", "Atomic Research 4", ""],
[18, 3, "Precision Bombsight", "Atomic Research 1", ""],
[19, 2, "", "", "Science 1940"],
[20, 4, "", "", "Science 1944"],
[21, 2, "Industrial Espionage", "AirDefense Radar", ""],
[22, 3, "Industrial Espionage", "Atomic Research 2", ""],
[23, 2, "Precision Bombsight", "Atomic Research 1", ""],
[24, 3, "", "", "Science 1942"],
[25, 3, "Rocket Artillery", "Precision Bombsight", ""],
[26, 3, "Industrial Espionage", "Precision Bombsight", ""],
[27, 3, "Motorized Infantry", "Atomic Research 2", ""],
[28, 2, "Precision Bombsight", "Atomic Research 1", ""],
[29, 3, "Heavy Bombers", "Precision Bombsight", ""],
[30, 3, "LSTs", "Motorized Infantry", ""],
[31, 3, "", "", "Mole"],
[32, 2, "", "", "Agent"],
[33, 3, "", "", "Sabotage"],
[34, 3, "", "", "Spy Ring"],
[35, 1, "", "", "Code Break"],
[36, 4, "", "", "Double Agent"],
[37, 1, "", "", "Agent"],
[38, 4, "", "", "Coup"],
[39, 2, "", "", "Spy Ring"],
[40, 2, "", "", "Code Break"],
[41, 1, "AirDefense Radar", "Naval Radar", ""],
[42, 2, "Sonar", "Atomic Research 1", ""],
[43, 3, "Heavy Tanks", "Jets", ""],
[44, 3, "Precision Bombsight", "Industrial Espionage", ""],
[45, 1, "Naval Radar", "Sonar", ""],
[46, 2, "AirDefense Radar", "Atomic Research 2", ""],
[47, 1, "Sonar", "Naval Radar", ""],
[48, 3, "Heavy Tanks", "Rocket Artillery", ""],
[49, 2, "Heavy Tanks", "AirDefense Radar", ""],
[50, 2, "Naval Radar", "Sonar", ""],
[51, 3, "LSTs", "Motorized Infantry", ""],
[52, 2, "Heavy Bombers", "Industrial Espionage", ""],
[53, 3, "Motorized Infantry", "Atomic Research 3", ""],
[54, 3, "LSTs", "Heavy Bombers", ""],
[55, 4, "Jets", "Atomic Research 4", ""]];

const SpecialInvestmentCards = {
  "Science 1938": ["Sonar", "Naval Radar", "Heavy Tanks", "AirDefense Radar", "Motorized Infantry", "Atomic Research 1"],
  "Science 1940": ["Sonar", "Naval Radar", "Heavy Bombers", "Rocket Artillery", "Precision Bombsight", "Atomic Research 2"],
  "Science 1942": ["LSTs", "Heavy Tanks", "Rocket Artillery", "AirDefense Radar", "Precision Bombsight", "Atomic Research 3"],
  "Science 1944": ["LSTs", "Jets", "Heavy Bombers", "Precision Bombsight", "Atomic Research 3", "Atomic Research 4"]
}

const actionCardData = [["id", "Season", "Priority", "Value", "Influence1", "Influence2", "Special"],
[1, "Spring", "A", 4, "Spain", "Yugoslavia", ""],
[2, "Spring", "B", 4, "", "", "Fear & Loathing"],
[3, "Spring", "C", 4, "Latin America", "USA", ""],
[4, "Spring", "D", 5, "Greece", "Portugal", ""],
[5, "Spring", "E", 5, "Austria", "Czechoslovakia", ""],
[6, "Spring", "F", 5, "Spain", "Rumania", ""],
[7, "Spring", "G", 6, "Yugoslavia", "Hungary", ""],
[8, "Spring", "H", 6, "Poland", "Austria", ""],
[9, "Spring", "I", 6, "", "", "Ethnic Ties"],
[10, "Spring", "J", 5, "Rumania", "Bulgaria", ""],
[11, "Spring", "K", 5, "Afghanistan", "Austria", ""],
[12, "Spring", "L", 5, "", "", "Birds of a Feather"],
[13, "Spring", "M", 4, "USA", "Rumania", ""],
[14, "Spring", "N", 4, "Hungary", "Portugal", ""],
[15, "Spring", "P", 4, "", "", "Intimidation"],
[16, "Summer", "A", 6, "Spain", "Czechoslovakia", ""],
[17, "Summer", "B", 6, "", "", "Foreign Aid"],
[18, "Summer", "C", 6, "Poland", "Hungary", ""],
[19, "Summer", "D", 7, "USA", "Latin America", ""],
[20, "Summer", "E", 7, "", "", "Ties That Bind"],
[21, "Summer", "F", 7, "Yugoslavia", "Rumania", ""],
[22, "Summer", "G", 8, "Denmark", "Low Countries", ""],
[23, "Summer", "H", 8, "Turkey", "Denmark", ""],
[24, "Summer", "I", 8, "", "", "Versailles"],
[25, "Summer", "J", 9, "Sweden", "USA", ""],
[26, "Summer", "K", 9, "Greece", "Latin America", ""],
[27, "Summer", "L", 9, "Low Countries", "Finland", ""],
[28, "Summer", "M", 10, "Norway", "Yugoslavia", ""],
[29, "Summer", "N", 10, "Yugoslavia", "Czechoslovakia", ""],
[30, "Summer", "P", 10, "Greece", "Hungary", ""],
[31, "Summer", "Q", 9, "USA", "Austria", ""],
[32, "Summer", "R", 9, "Bulgaria", "Czechoslovakia", ""],
[33, "Summer", "S", 9, "Finland", "Baltic States", ""],
[34, "Summer", "T", 8, "Yugoslavia", "Hungary", ""],
[35, "Summer", "U", 8, "", "", "Isolationism"],
[36, "Summer", "V", 8, "Portugal", "Czechoslovakia", ""],
[37, "Summer", "W", 7, "Austria", "Bulgaria", ""],
[38, "Summer", "X", 7, "Latin America", "Austria", ""],
[39, "Summer", "Y", 6, "Persia", "Rumania", ""],
[40, "Summer", "Z", 6, "Poland", "Spain", ""],
[41, "Fall", "A", 6, "Hungary", "Afghanistan", ""],
[42, "Fall", "B", 6, "", "", "Guarantee"],
[43, "Fall", "C", 6, "Afghanistan", "Low Countries", ""],
[44, "Fall", "D", 7, "", "", "Brothers in Arms"],
[45, "Fall", "E", 7, "", "", "Birds of a Feather"],
[46, "Fall", "F", 7, "Latin America", "Greece", ""],
[47, "Fall", "G", 8, "Norway", "Finland", ""],
[48, "Fall", "H", 8, "", "", "Isolationism"],
[49, "Fall", "I", 8, "Denmark", "Low Countries", ""],
[50, "Fall", "J", 7, "Turkey", "Greece", ""],
[51, "Fall", "K", 7, "Sweden", "Baltic States", ""],
[52, "Fall", "L", 7, "Sweden", "Norway", ""],
[53, "Fall", "M", 6, "Greece", "Bulgaria", ""],
[54, "Fall", "N", 6, "Czechoslovakia", "Finland", ""],
[55, "Fall", "P", 6, "Turkey", "Persia", ""]];

export const SpecialActionCards = {
  "Birds of a Feather": {
    text: "Add 1 Friendly (or remove 1 Rival) Influence marker from one of the Neutral Nations listed after your Faction.",
    type: "add/remove",
    West: ["USA", "Norway", "Denmark", "Sweden"],
    Axis: ["Portugal", "Spain", "Yugoslavia", "Latin America"],
    USSR: ["Spain"]
  },
  "Brothers in Arms": {
    text: "Add 1 Friendly (or remove 1 Rival) influence marker from one of the Neutral Nations listed after your Faction.",
    type: "add/remove",
    West: ["USA", "Low Countries", "Rumania"],
    Axis: ["Austria", "Hungary", "Bulgaria"],
    USSR: ["Spain", "Czechoslovakia"]
  },
  "Guarantee": {
    text: "Add 1 Friendly (or remove 1 Rival) Influence marker in any Neutral Nation adjacent to Friendly-controlled territory",
    type: "add/remove",
    West: ["ADJACENT"],
    Axis: ["ADJACENT"],
    USSR: ["ADJACENT"],
  },
  "Foreign Aid": {
    text: "Reduce Friendly IND by 1 to add 1 Friendly (or remove 1 Rival) Influence marker in any Neutral Nation.",
    type: "add/remove",
    West: ["IND-TO-INF"],
    Axis: ["IND-TO-INF"],
    USSR: ["IND-TO-INF"],
  },
  "Fear & Loathing": {
    text: "Remove a Rival Influence marker from one of the Neutral Nations listed after that Rival.",
    type: "remove",
    West: ["Austria", "Hungary", "Bulgaria", "Latin America", "Turkey", "Persia"],
    Axis: ["Low Countries", "Czechoslovakia", "Poland", "Yugoslavia", "Norway", "Rumania", "USA"],
    USSR: ["Poland", "Rumania", "Turkey", "Finland", "Sweden", "Baltic States", "USA"]
  },
  "Ties That Bind": {
    text: "Add 1 Friendly (or remove 1 Rival) Influence marker from one of the Neutral Nations listed after your Faction.",
    type: "add/remove",
    West: ["USA", "Low Countries", "Czechoslovakia"],
    Axis: ["Austria", "Hungary", "Bulgaria"],
    USSR: ["Spain", "Yugoslavia"]
  },
  "Ethnic Ties": {
    text: "Add 1 Friendly (or remove 1 Rival) Influence marker from one of the Neutral Nations listed after your Faction.",
    type: "add/remove",
    West: ["USA", "Norway", "Low Countries", "Rumania"],
    Axis: ["Austria", "Sweden", "Norway"],
    USSR: ["Yugoslavia", "Poland", "Bulgaria"]
  },
  "Intimidation": {
    text: "Add 1 Friendly (or remove 1 Rival) Influence marker in any Neutral Nation adjacent to Friendly-controlled Territory.",
    type: "add/remove",
    West: ["ADJACENT"],
    Axis: ["ADJACENT"],
    USSR: ["ADJACENT"],
  },
  "Versailles": {
    text: "Add 1 Friendly (or remove 1 Rival) Influence marker from one of the Neutral Nations listed after your Faction.",
    type: "add/remove",
    West: ["Poland", "Czechoslovakia", "Yugoslavia"],
    Axis: ["Austria", "Hungary", "Turkey"],
    USSR: ["Yugoslavia"]
  },
  "Isolationism": {
    text: "Remove 1 Rival influence marker from the USA, Spain Low Countries Poland, sweden or Turkey.",
    type: "remove",
    West: ["USA", "Spain", "Low Countries", "Poland", "Sweden", "Turkey"],
    Axis: ["USA", "Spain", "Low Countries", "Poland", "Sweden", "Turkey"],
    USSR: ["USA", "Spain", "Low Countries", "Poland", "Sweden", "Turkey"],
  }
}


export type InvestmentCard = {
  id: number,
  Factory: number,
  Tech1: string,
  Tech2: string,
  Special: string
}

export type ActionCard = {
  id: number,
  Season: string,
  Priority: string,
  PriorityNumber: number,
  Value: number,
  Influence1: string,
  Influence2: string,
  Special: string
}
const PRIORITIES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function loadData(data, postProcess?) {
  const table = [];
  const lookup = {};
  const header = data.shift();
  data.forEach(itemRow => {
    const item = {};

    for (var i = 0; i < header.length; i++) {
      item[header[i]] = itemRow[i];
    }
    if (postProcess) postProcess(item);

    //@ts-ignore
    lookup[item.id] = item;
    table.push(item);

  });

  return {
    table: table,
    lookup: lookup
  };
}

const actionCardResult = loadData(actionCardData, (item) => {
  item["PriorityNumber"] = PRIORITIES.indexOf(item["Priority"]);
  if (item["PriorityNumber"] === -1) throw new Error(`Could not parse priority for '${item.id}'`);
});
export const actionCardTable: ActionCard[] = actionCardResult.table;
export const actionCardLookup = actionCardResult.lookup;

const investmentCardResult = loadData(investmentCardData);
export const investmentCardTable: InvestmentCard[] = investmentCardResult.table;
export const investmentCardLookup = investmentCardResult.lookup;


const techs = new Set();

investmentCardTable.forEach(card => {
  if (card.Special.startsWith("Science")) {
    SpecialInvestmentCards[card.Special].forEach(tech => techs.add(tech))
  } else techs.add(card.Tech1); techs.add(card.Tech2)
});
console.log(techs);


console.log(actionCardTable);




const results = simulate(10, 6, actionCardTable);
const condition = (hand: ActionCard[]) => {
  return hand.filter(card =>
    card.Season === "Spring" && card.PriorityNumber >= PRIORITIES.indexOf('H')
  ).length > 0 &&
    hand.filter(card =>
      card.Season === "Summer" && card.PriorityNumber <= PRIORITIES.indexOf('H')
    ).length > 0
}

var count = 0;
results.forEach(hand => condition(hand) ? count++ : count);
console.log("chance: " + Math.round(count / 20000 * 10000) / 100);

const findPairs = (pairSum: number, numbers: number[]) => {
  const sorted = numbers.sort((a, b) => b - a);
  const set = {};
  var matches = 0;
  for (var i = 0; i < sorted.length; i++) {
    const value = sorted[i];
    if (value === pairSum) {
      matches++;
      continue;
    }
    const matchArray = set[pairSum - value];
    if (matchArray?.length > 0) {
      matchArray.shift();
      if (matchArray.length === 0) set[pairSum - value] = undefined;
      matches++;
      continue;
    }
    if (set[value]) set[value].push(value);
    else set[value] = [value];
  }
  const remaining = Object.keys(set).reduce((val, key) => {
    if (set[key] === undefined) return val;
    val.push(...set[key]);
    return val;
  }, []);
  return { matches: matches, remainingNumbers: remaining };
}

const cI = (hand: InvestmentCard[]): number => {
  const tech = "Precision Bombsight";

  const totalFactory = hand.reduce((val, card) => val + card.Factory, 0)

  const factoryCost = 6;
  if (totalFactory >= factoryCost && totalFactory < factoryCost * 2) {
    // only one
    return 1;
  }

  const results = findPairs(factoryCost, hand.map(card => card.Factory));
  if (results.remainingNumbers?.reduce((val, n) => val + n, 0) >= factoryCost) {
    const newResults = findPairs(factoryCost + 1, results.remainingNumbers);
    results.matches += newResults.matches;
    results.remainingNumbers = newResults.remainingNumbers;
    if (results.remainingNumbers.reduce((val, n) => val + n, 0) >= factoryCost) {
      const newResults = findPairs(factoryCost + 2, results.remainingNumbers);
      results.matches += newResults.matches;
      results.remainingNumbers = newResults.remainingNumbers;
    }
  }
  const remainingSum = results.remainingNumbers.reduce((val, n) => val + n, 0);
  if (remainingSum >= factoryCost * 2 && results.remainingNumbers.length >= 4) {
    console.log("Too many cards remaining", results)
  }
  if (remainingSum >= factoryCost) results.matches++;
  return results.matches;
}

const iSimulations = 10000;
const iR = simulate(iSimulations, 5, investmentCardTable);
count = 0;
iR.forEach(hand => cI(hand) >= 2 ? count++ : count);
console.log("ind incrase chance: " + Math.round(count / iSimulations * 10000) / 100);



function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}


export function simulate(simulations: number, cardsToDraw: number, deck: any[]): any[] {

  const results = [];

  const initialDeck = structuredClone(deck);

  const initialHand = [];
  /*
    initialHand.push(initialDeck.splice(48, 1)[0]);
    initialHand.push(initialDeck.splice(46, 1)[0]);
    initialHand.push(initialDeck.splice(22, 1)[0]);
  */


  for (var i = 0; i < simulations; i++) {
    const shuffledDeck = shuffle(structuredClone(initialDeck));
    const hand = shuffledDeck.splice(0, cardsToDraw);
    hand.push(...structuredClone(initialHand));
    results.push(hand);
  }


  return results;
}


