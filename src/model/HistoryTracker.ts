import { groupByReduceFunction } from "../utils/utils.js";

export type LandArea = {
  name: string,
  StartFaction: string,
  Nation: string,
  CityType: "-" | "Town" | "City" | "SubCapital" | "MainCapital",
  Capital: boolean,
  RES: number,
  RESTransAfrica: number,
  POP: number,
  Muster: number,
  CardName: string,
  NumberOfCards: number
}

class Faction {

  name: string;
  IND: number;

  constructor(obj) {
    Object.assign(this, obj);
  }

  POP(): number {
    return territoryList.filter(area => area.resourcesForFaction() === this).reduce((val, area) => {
      return val = val + area.POP;
    }, 0);
  }

  RES(): number {
    return territoryList.filter(area => area.resourcesForFaction() === this).reduce((val, area) => {
      return val = val + area.RES + area.RESTransAfrica;
    }, 0)
  }

  toString(): string {
    return `${this.name}, IND: ${this.IND}, POP: ${this.POP()}, RES: ${this.RES()}`;
  }

}

const factions = {
  Axis: new Faction({ name: "Axis", IND: 12 }),
  West: new Faction({ name: "West", IND: 7 }),
  USSR: new Faction({ name: "USSR", IND: 9 }),

}

const LandAreaData = [
  ["StartFaction", "Nation", "name", "CityType", "Capital", "Type", "RES", "RESTransAfrica", "POP", "Muster", "CardName", "NumberOfCards"],
  ["West", "Canada", "Ottawa", "Town", true, "HomeTerritory", 1, 0, 0, 1, "", 0],
  ["", "USA", "New York", "City", false, "USA", 2, 0, 1, 2, "", 0],
  ["", "USA", "Washington", "SubCapital", true, "USA", 2, 0, 2, 0, "USA", 5],
  ["", "Latin America", "Rio de Janeiro", "Town", true, "MinorNation", 2, 0, 0, 1, "", 0],
  ["", "Portugal", "Azores", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["", "Portugal", "Lisbon", "Town", true, "MinorNation", 1, 0, 0, 1, "Portugal", 3],
  ["", "Denmark", "Iceland", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["", "Denmark", "Copenhagen", "Town", true, "MinorNation", 1, 0, 0, 1, "Denmark", 3],
  ["", "Ireland", "Dublin", "Town", true, "MinorNation", 0, 0, 0, 1, "", 0],
  ["West", "Britain", "London", "MainCapital", true, "HomeTerritory", 1, 0, 3, 0, "", 0],
  ["West", "Britain", "Glasgow", "City", false, "HomeTerritory", 1, 0, 1, 2, "", 0],
  ["West", "France", "Paris", "SubCapital", true, "HomeTerritory", 0, 0, 2, 0, "", 0],
  ["West", "France", "Lorraine", "-", false, "HomeTerritory", 2, 0, 0, 0, "", 0],
  ["West", "France", "Gascony", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["West", "France", "Marseille", "City", false, "HomeTerritory", 0, 0, 1, 2, "", 0],
  ["", "Spain", "Leon", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["", "Spain", "Madrid", "Capital City", true, "MinorNation", 0, 0, 1, 3, "Spain", 4],
  ["", "Spain", "Barcelona", "City", false, "MinorNation", 0, 0, 1, 2, "", 0],
  ["", "French North Africa", "Dakar", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["", "French North Africa", "Morocco", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["", "French North Africa", "Algiers", "City", true, "Colony", 0, 0, 1, 2, "", 0],
  ["", "French North Africa", "Tunisia", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["", "French North Africa", "Sfax", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["", "Norway", "Oslo", "Town", true, "MinorNation", 1, 0, 0, 1, "Norway", 3],
  ["", "Norway", "Narvik", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["", "Sweden", "Gallilvare", "-", false, "MinorNation", 1, 0, 0, 0, "", 0],
  ["", "Sweden", "Stockholm", "City", true, "MinorNation", 1, 0, 1, 2, "Sweden", 3],
  ["", "Finland", "Petsamo", "-", false, "MinorNation", 1, 0, 0, 0, "", 0],
  ["", "Finland", "Helsinki", "Town", true, "MinorNation", 0, 0, 0, 1, "Finland", 4],
  ["", "Baltic States", "Riga", "Town", true, "MinorNation", 0, 0, 0, 1, "Baltic States", 2],
  ["", "Low Countries", "Amsterdam", "City", true, "MinorNation", 0, 0, 1, 2, "Low Countries", 4],
  ["Axis", "Germany", "Ruhr", "SubCapital", false, "HomeTerritory", 3, 0, 2, 0, "", 0],
  ["Axis", "Germany", "Berlin", "MainCapital", true, "HomeTerritory", 1, 0, 3, 0, "", 0],
  ["Axis", "Germany", "Munich", "City", false, "HomeTerritory", 0, 0, 1, 2, "", 0],
  ["Axis", "Germany", "Königsberg", "City", false, "HomeTerritory", 0, 0, 1, 2, "", 0],
  ["", "Poland", "Warsaw", "Capital City", true, "MinorNation", 1, 0, 1, 3, "Poland", 3],
  ["", "Poland", "Vilna", "Town", false, "MinorNation", 0, 0, 0, 1, "", 0],
  ["", "Poland", "Lvov", "City", false, "MinorNation", 0, 0, 1, 2, "", 0],
  ["", "Czechoslovakia", "Prague", "City", true, "MinorNation", 0, 0, 1, 2, "Czechoslovakia", 6],
  ["", "Austria", "Vienna", "City", true, "MinorNation", 0, 0, 1, 2, "Austria", 6],
  ["", "Hungary", "Budapest", "City", true, "MinorNation", 1, 0, 1, 2, "Hungary", 6],
  ["", "Rumania", "Bucharest", "City", true, "MinorNation", 2, 0, 1, 2, "Rumania", 5],
  ["", "Yugoslavia", "Croatia", "-", false, "MinorNation", 1, 0, 0, 0, "", 0],
  ["", "Yugoslavia", "Belgrade", "Town", true, "MinorNation", 0, 0, 0, 1, "Yugoslavia", 6],
  ["", "Bulgaria", "Sofia", "Town", true, "MinorNation", 1, 0, 0, 1, "Bulgaria", 4],
  ["", "Albania", "", "-", true, "MinorNation", 0, 0, 0, 0, "", 0],
  ["", "Greece", "Athens", "Town", true, "MinorNation", 1, 0, 0, 1, "", 0],
  ["", "Greece", "Crete", "-", false, "MinorNation", 0, 0, 0, 0, "Greece", 6],
  ["Axis", "Italy", "Milan", "City", false, "HomeTerritory", 1, 0, 1, 2, "", 0],
  ["Axis", "Italy", "Venice", "-", false, "HomeTerritory", 1, 0, 0, 0, "", 0],
  ["Axis", "Italy", "Rome", "SubCapital", true, "HomeTerritory", 0, 0, 2, 0, "", 0],
  ["Axis", "Italy", "Taranto", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["Axis", "Italy", "Sardinia", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["Axis", "Italy", "Sicily", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["West", "Gibraltar", "Gibraltar", "Town", true, "Colony", 0, 0, 0, 1, "", 0],
  ["West", "Malta", "Malta", "Town", true, "Colony", 0, 0, 0, 1, "", 0],
  ["Axis", "Libya", "Tripoli", "City", true, "Colony", 0, 0, 1, 2, "", 0],
  ["Axis", "Libya", "Cyrenaica", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Murmansk", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Archangel", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Vologda", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Gorky", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Perm", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Urals", "City", false, "HomeTerritory", 1, 0, 1, 2, "", 0],
  ["USSR", "USSR", "Western Siberia", "-", false, "HomeTerritory", 1, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Leningrad", "SubCapital", false, "HomeTerritory", 0, 0, 2, 0, "", 0],
  ["USSR", "USSR", "Moscow", "MainCapital", true, "HomeTerritory", 0, 0, 3, 0, "", 0],
  ["USSR", "USSR", "Penza", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Ufa", "-", false, "HomeTerritory", 1, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Kazakhstan", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Belorussia", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Bryansk", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Voronezh", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Kiev", "City", false, "HomeTerritory", 1, 0, 1, 2, "", 0],
  ["USSR", "USSR", "Odessa", "City", false, "HomeTerritory", 2, 0, 1, 2, "", 0],
  ["USSR", "USSR", "Kharkov", "City", false, "HomeTerritory", 1, 0, 1, 2, "", 0],
  ["USSR", "USSR", "Stalingrad", "City", false, "HomeTerritory", 0, 0, 1, 2, "", 0],
  ["USSR", "USSR", "Kuban", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Grozny", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Georgia", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Baku", "SubCapital", false, "HomeTerritory", 3, 1, 2, 0, "", 0],
  ["USSR", "USSR", "Turkmenistan", "-", false, "HomeTerritory", 0, 0, 0, 0, "", 0],
  ["", "Turkey", "Istanbul", "City", false, "MinorNation", 0, 0, 1, 2, "Turkey", 3],
  ["", "Turkey", "Izmir", "Town", false, "MinorNation", 1, 0, 0, 1, "", 0],
  ["", "Turkey", "Ankara", "Capital City", true, "MinorNation", 0, 0, 1, 3, "", 0],
  ["", "Turkey", "Sinope", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["", "Turkey", "Adana", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["", "Turkey", "Kars", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["", "Persia", "Tabriz", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["", "Persia", "Tehran", "City", true, "MinorNation", 0, 0, 1, 2, "Persia", 2],
  ["", "Persia", "Abadan", "-", false, "MinorNation", 2, 2, 0, 0, "", 0],
  ["", "Persia", "Shiraz", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["", "Afghanistan", "Kabul", "Town", true, "MinorNation", 0, 0, 0, 1, "Afghanistan", 3],
  ["West", "India", "Karachi", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["West", "India", "Delhi", "SubCapital", true, "Colony", 1, 1, 2, 0, "", 0],
  ["West", "India", "Bombay", "City", false, "Colony", 1, 1, 1, 2, "", 0],
  ["West", "Syria", "Damascus", "Town", true, "Colony", 0, 0, 0, 1, "", 0],
  ["West", "Middle East", "Egypt", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["West", "Middle East", "Suez", "City", true, "Colony", 0, 0, 1, 2, "", 0],
  ["West", "Middle East", "Sudan", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["West", "Middle East", "Jordan", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["West", "Middle East", "Iraq", "-", false, "Colony", 1, 1, 0, 0, "", 0],
];

// @ts-ignore
const header: string[] = LandAreaData.shift();
export const landAreaTable: LandArea[] = []
export const landAreaLookup = {};

LandAreaData.forEach((data) => {

  //@ts-ignore
  const area: LandArea = {};

  for (var i = 0; i < header.length; i++) {
    area[header[i]] = data[i];
  }

  //@ts-ignore
  landAreaLookup[area.name] = area;
  landAreaTable.push(area);
});

class Territory {
  name: string;
  occupier: Faction;
  nation: Nation;
  RES: number;
  RESTransAfrica;
  POP: number;

  constructor(obj: LandArea, nation: Nation) {
    Object.assign(this, obj);
    this.nation = nation;
  }

  resourcesForFaction(): Faction {
    if (this.isOccupied()) return this.occupier;
    return this.nation.resourcesForFaction();
  }

  isOccupied(): boolean {
    return this.occupier !== null && this.occupier !== undefined;
  }

}

class Nation {
  name: string;
  territories: Territory[];
  capital: Territory;
  influence: Faction[] = [];

  constructor(name: string, territories: LandArea[]) {
    this.name = name;
    this.territories = territories.map(area => new Territory(area, this));
    //@ts-ignore
    this.capital = this.territories.find(area => area.Capital);
    if (this.capital === null || this.capital === undefined) throw new Error(`${name} does not have a capital in ${territories}`);
  }

  addInfluence(faction: Faction) {
    if (this.capital.isOccupied()) throw new Error(`Cannot influence ${this.name} as it is occupied by ${this.resourcesForFaction().name}.`);
    if (this.influence.length === 3) throw new Error(`Cannot influence ${this.name} as it is already a satellite for ${this.resourcesForFaction().name}.`);
    if (this.influence.length > 0 && !this.influence.includes(faction)) {
      this.influence.shift();
      return;
    }
    this.influence.push(faction);
  }

  resourcesForFaction(): Faction {
    if (this.capital.isOccupied()) return this.capital.occupier;
    if (this.influence.length > 0) return this.influence[0];
    return undefined;
  }

}

const areasByNation = groupByReduceFunction(landAreaTable, area => area.Nation);

const territoriesByName = {};
const territoryList: Territory[] = [];
const nationsByName = {};
Object.keys(areasByNation).forEach(key => {
  const nation = new Nation(key, areasByNation[key]);
  //@ts-ignore
  if (nation.capital.StartFaction) {
    //@ts-ignore
    nation.capital.occupier = factions[nation.capital.StartFaction];

  }
  nationsByName[key] = nation;
  territoryList.push(...nation.territories);
  nation.territories.forEach(area => territoriesByName[area.name] = area);
}
);

nationsByName['Persia'].addInfluence(factions.Axis);

console.log(factions.Axis.toString());
console.log(factions.West.toString());
console.log(factions.USSR.toString());

territoriesByName['Tehran'].occupier = factions.USSR;
territoriesByName['Abadan'].occupier = factions.West;

console.log(factions.Axis.toString());
console.log(factions.West.toString());
console.log(factions.USSR.toString());
