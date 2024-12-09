import { groupByReduceFunction } from "../utils/utils.js";
//@ts-ignore
import { Nations } from "./battle.ts";

export const BlockadeLevel = {
  NONE: 0,
  MED: 1,
  FULL: 2
}

type CountryDef = {
  name: string,
  color: string,
}

const countryNameToAcronym: { [name: string]: CountryDef } = {
  "Canada": { name: "CA", color: 'rgb(29,176,223)' },
  "USA": { name: "US", color: 'rgb(136,190,128)' },
  "Latin America": { name: "LA", color: 'rgb(191,169,125)' },
  "Portugal": { name: "PT", color: 'rgb(230,189,143)' },
  "Denmark": { name: "DK", color: 'rgb(192,157,80)' },
  "Ireland": { name: "IE", color: 'rgb(226, 190, 148)' },
  "Britain": { name: "GB", color: 'rgb(29, 176, 223)' },
  "France": { name: "FR", color: 'rgb(82,193,198)' },
  "Spain": { name: "ES", color: 'rgb(226,203,101)' },
  "French North Africa": { name: "FR-NA", color: 'rgb(178,220,223)' },
  "Norway": { name: "NO", color: 'rgb(191,169,122)' },
  "Sweden": { name: "SE", color: 'rgb(230,189,143)' },
  "Finland": { name: "FI", color: 'rgb(217,167,96)' },
  "Baltic States": { name: "BS", color: 'rgb(230,189,143)' },
  "Low Countries": { name: "LC", color: 'rgb(243,176,92)' },
  "Germany": { name: "DE", color: 'rgb(175,174,177)' },
  "Poland": { name: "PL", color: 'rgb(226,203,101)' },
  "Czechoslovakia": { name: "CZ", color: 'rgb(189,169,127)' },
  "Austria": { name: "AT", color: 'rgb(217,168,100)' },
  "Hungary": { name: "HU", color: 'rgb(230,189,143)' },
  "Rumania": { name: "RO", color: 'rgb(218,168,95)' },
  "Yugoslavia": { name: "YU", color: 'rgb(189,170,125)' },
  "Bulgaria": { name: "BG", color: 'rgb(230,189,143)' },
  "Albania": { name: "AL", color: 'rgb(229,190,143)' },
  "Greece": { name: "GR", color: 'rgb(217,167,96)' },
  "Italy": { name: "IT", color: 'rgb(166,165,145)' },
  "Gibraltar": { name: "GIB", color: 'rgb(124,185,210)' },
  "Malta": { name: "MT", color: 'rgb(123,184,218)' },
  "Libya": { name: "LY", color: 'rgb(200,198,181)' },
  "USSR": { name: "USSR", color: 'rgb(249,133,131)' },
  "Turkey": { name: "TR", color: 'rgb(226,203,103)' },
  "Persia": { name: "PER", color: 'rgb(229,189,145)' },
  "Afghanistan": { name: "AF", color: 'rgb(189,170,125)' },
  "India": { name: "IN", color: 'rgb(144,203,230)' },
  "Syria": { name: "SY", color: 'rgb(177,221,221)' },
  "Middle East": { name: "ME", color: 'rgb(144,203,230)' },
}

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

export class Faction {

  name: string;
  IND: number;
  color: string;
  maxPips: any;

  constructor(obj) {
    Object.assign(this, obj);
    this.maxPips = undefined;
  }

  territories(): Territory[] {
    return territoryList.filter(area => area.resourcesForFaction().name === this.name);
  }

  territoriesWithResources(): Territory[] {
    return this.territories().filter(area => area.hasResources());
  }

  blockedTerritories(): Territory[] {
    return this.territories().filter(area => area.blockadeLevel > 0);
  }

  POP(): number {
    return this.territoriesWithResources().reduce((val, area) => {
      return val = val + (area.blockadeLevel === BlockadeLevel.NONE ? area.POP : 0);
    }, 0);
  }

  RES(): number {
    return this.territoriesWithResources().filter(area => area.resourcesForFaction() === this).reduce((val, area) => {
      return val = val + (area.blockadeLevel === BlockadeLevel.NONE ? area.RES : 0);
    }, 0)
  }

  RESTransAfrica(): number {
    return this.territoriesWithResources().filter(area => area.resourcesForFaction() === this).reduce((val, area) => {
      return val = val + (area.blockadeLevel !== BlockadeLevel.FULL ? area.RESTransAfrica : 0);
    }, 0);
  }

  toString(): string {
    return `${this.name}, IND: ${this.IND}, POP: ${this.POP()}, RES: ${this.RES()}`;
  }

}

export const factions = {
  Axis: new Faction(Nations[0]),
  West: new Faction(Nations[3]),
  USSR: new Faction(Nations[2]),
  Neutral: new Faction(Nations[1])
}

const TTLandAreaData = [
  ["StartFaction", "Nation", "name", "CityType", "Capital", "Type", "RES", "RESTransAfrica", "POP", "Muster", "CardName", "NumberOfCards"],
  ["West", "Canada", "Ottawa", "Town", true, "Colony", 1, 0, 0, 1, "", 0],
  ["Neutral", "USA", "New York", "City", false, "USA", 2, 0, 1, 2, "", 0],
  ["Neutral", "USA", "Washington", "SubCapital", true, "USA", 2, 0, 2, 0, "USA", 5],
  ["Neutral", "Latin America", "Rio de Janeiro", "Town", true, "MinorNation", 2, 0, 0, 1, "", 0],
  ["Neutral", "Portugal", "Azores", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["Neutral", "Portugal", "Lisbon", "Town", true, "MinorNation", 1, 0, 0, 1, "Portugal", 3],
  ["Neutral", "Denmark", "Iceland", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["Neutral", "Denmark", "Copenhagen", "Town", true, "MinorNation", 1, 0, 0, 1, "Denmark", 3],
  ["Neutral", "Ireland", "Dublin", "Town", true, "MinorNation", 0, 0, 0, 1, "", 0],
  ["West", "Britain", "London", "MainCapital", true, "GreatPower", 1, 0, 3, 0, "", 0],
  ["West", "Britain", "Glasgow", "City", false, "GreatPower", 1, 0, 1, 2, "", 0],
  ["West", "France", "Paris", "SubCapital", true, "MajorPower", 0, 0, 2, 0, "", 0],
  ["West", "France", "Lorraine", "-", false, "MajorPower", 2, 0, 0, 0, "", 0],
  ["West", "France", "Gascony", "-", false, "MajorPower", 0, 0, 0, 0, "", 0],
  ["West", "France", "Marseille", "City", false, "MajorPower", 0, 0, 1, 2, "", 0],
  ["Neutral", "Spain", "Leon", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["Neutral", "Spain", "Madrid", "Capital City", true, "MinorNation", 0, 0, 1, 3, "Spain", 4],
  ["Neutral", "Spain", "Barcelona", "City", false, "MinorNation", 0, 0, 1, 2, "", 0],
  ["West", "French North Africa", "Dakar", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["West", "French North Africa", "Morocco", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["West", "French North Africa", "Algiers", "City", true, "Colony", 0, 0, 1, 2, "", 0],
  ["West", "French North Africa", "Tunisia", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["West", "French North Africa", "Sfax", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["Neutral", "Norway", "Oslo", "Town", true, "MinorNation", 1, 0, 0, 1, "Norway", 3],
  ["Neutral", "Norway", "Narvik", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["Neutral", "Sweden", "Gallilvare", "-", false, "MinorNation", 1, 0, 0, 0, "", 0],
  ["Neutral", "Sweden", "Stockholm", "City", true, "MinorNation", 1, 0, 1, 2, "Sweden", 3],
  ["Neutral", "Finland", "Petsamo", "-", false, "MinorNation", 1, 0, 0, 0, "", 0],
  ["Neutral", "Finland", "Helsinki", "Town", true, "MinorNation", 0, 0, 0, 1, "Finland", 4],
  ["Neutral", "Baltic States", "Riga", "Town", true, "MinorNation", 0, 0, 0, 1, "Baltic States", 2],
  ["Neutral", "Low Countries", "Amsterdam", "City", true, "MinorNation", 0, 0, 1, 2, "Low Countries", 4],
  ["Axis", "Germany", "Ruhr", "SubCapital", false, "GreatPower", 3, 0, 2, 0, "", 0],
  ["Axis", "Germany", "Berlin", "MainCapital", true, "GreatPower", 1, 0, 3, 0, "", 0],
  ["Axis", "Germany", "Munich", "City", false, "GreatPower", 0, 0, 1, 2, "", 0],
  ["Axis", "Germany", "Königsberg", "City", false, "GreatPower", 0, 0, 1, 2, "", 0],
  ["Neutral", "Poland", "Warsaw", "Capital City", true, "MinorNation", 1, 0, 1, 3, "Poland", 3],
  ["Neutral", "Poland", "Vilna", "Town", false, "MinorNation", 0, 0, 0, 1, "", 0],
  ["Neutral", "Poland", "Lvov", "City", false, "MinorNation", 0, 0, 1, 2, "", 0],
  ["Neutral", "Czechoslovakia", "Prague", "City", true, "MinorNation", 0, 0, 1, 2, "Czechoslovakia", 6],
  ["Neutral", "Austria", "Vienna", "City", true, "MinorNation", 0, 0, 1, 2, "Austria", 6],
  ["Neutral", "Hungary", "Budapest", "City", true, "MinorNation", 1, 0, 1, 2, "Hungary", 6],
  ["Neutral", "Rumania", "Bucharest", "City", true, "MinorNation", 2, 0, 1, 2, "Rumania", 5],
  ["Neutral", "Yugoslavia", "Croatia", "-", false, "MinorNation", 1, 0, 0, 0, "", 0],
  ["Neutral", "Yugoslavia", "Belgrade", "Town", true, "MinorNation", 0, 0, 0, 1, "Yugoslavia", 6],
  ["Neutral", "Bulgaria", "Sofia", "Town", true, "MinorNation", 1, 0, 0, 1, "Bulgaria", 4],
  ["Neutral", "Albania", "Albania", "-", true, "MinorNation", 0, 0, 0, 0, "", 0],
  ["Neutral", "Greece", "Athens", "Town", true, "MinorNation", 1, 0, 0, 1, "", 0],
  ["Neutral", "Greece", "Crete", "-", false, "MinorNation", 0, 0, 0, 0, "Greece", 6],
  ["Axis", "Italy", "Milan", "City", false, "MajorPower", 1, 0, 1, 2, "", 0],
  ["Axis", "Italy", "Venice", "-", false, "MajorPower", 1, 0, 0, 0, "", 0],
  ["Axis", "Italy", "Rome", "SubCapital", true, "MajorPower", 0, 0, 2, 0, "", 0],
  ["Axis", "Italy", "Taranto", "-", false, "MajorPower", 0, 0, 0, 0, "", 0],
  ["Axis", "Italy", "Sardinia", "-", false, "MajorPower", 0, 0, 0, 0, "", 0],
  ["Axis", "Italy", "Sicily", "-", false, "MajorPower", 0, 0, 0, 0, "", 0],
  ["West", "Gibraltar", "Gibraltar", "Town", true, "Colony", 0, 0, 0, 1, "", 0],
  ["West", "Malta", "Malta", "Town", true, "Colony", 0, 0, 0, 1, "", 0],
  ["Axis", "Libya", "Tripoli", "City", true, "Colony", 0, 0, 1, 2, "", 0],
  ["Axis", "Libya", "Cyrenaica", "-", false, "Colony", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Murmansk", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Archangel", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Vologda", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Gorky", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Perm", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Urals", "City", false, "GreatPower", 1, 0, 1, 2, "", 0],
  ["USSR", "USSR", "Western Siberia", "-", false, "GreatPower", 1, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Leningrad", "SubCapital", false, "GreatPower", 0, 0, 2, 0, "", 0],
  ["USSR", "USSR", "Moscow", "MainCapital", true, "GreatPower", 0, 0, 3, 0, "", 0],
  ["USSR", "USSR", "Penza", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Ufa", "-", false, "GreatPower", 1, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Kazakhstan", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Belorussia", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Bryansk", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Voronezh", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Kiev", "City", false, "GreatPower", 1, 0, 1, 2, "", 0],
  ["USSR", "USSR", "Odessa", "City", false, "GreatPower", 2, 0, 1, 2, "", 0],
  ["USSR", "USSR", "Kharkov", "City", false, "GreatPower", 1, 0, 1, 2, "", 0],
  ["USSR", "USSR", "Stalingrad", "City", false, "GreatPower", 0, 0, 1, 2, "", 0],
  ["USSR", "USSR", "Sevastopol", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Kuban", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Grozny", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Georgia", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["USSR", "USSR", "Baku", "SubCapital", false, "GreatPower", 3, 1, 2, 0, "", 0],
  ["USSR", "USSR", "Turkmenistan", "-", false, "GreatPower", 0, 0, 0, 0, "", 0],
  ["Neutral", "Turkey", "Istanbul", "City", false, "MinorNation", 0, 0, 1, 2, "Turkey", 3],
  ["Neutral", "Turkey", "Izmir", "Town", false, "MinorNation", 1, 0, 0, 1, "", 0],
  ["Neutral", "Turkey", "Ankara", "Capital City", true, "MinorNation", 0, 0, 1, 3, "", 0],
  ["Neutral", "Turkey", "Sinope", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["Neutral", "Turkey", "Adana", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["Neutral", "Turkey", "Kars", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["Neutral", "Persia", "Tabriz", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["Neutral", "Persia", "Tehran", "City", true, "MinorNation", 0, 0, 1, 2, "Persia", 2],
  ["Neutral", "Persia", "Abadan", "-", false, "MinorNation", 2, 2, 0, 0, "", 0],
  ["Neutral", "Persia", "Shiraz", "-", false, "MinorNation", 0, 0, 0, 0, "", 0],
  ["Neutral", "Afghanistan", "Kabul", "Town", true, "MinorNation", 0, 0, 0, 1, "Afghanistan", 3],
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
const header: string[] = TTLandAreaData.shift();
export const landAreaTable: LandArea[] = []
export const landAreaLookup = {};

TTLandAreaData.forEach((data) => {

  //@ts-ignore
  const area: LandArea = {};

  for (var i = 0; i < header.length; i++) {
    area[header[i]] = data[i];
  }

  //@ts-ignore
  landAreaLookup[area.name] = area;
  landAreaTable.push(area);
});

export class Territory {
  id: string;
  name: string;
  controller: Faction;
  homeTerritoryOf: Faction;
  nation: Nation;
  RES: number;
  RESTransAfrica;
  POP: number;
  CityType: string;
  StartFaction: string;
  Type: string;
  blockadeLevel: any = BlockadeLevel.NONE;

  constructor(obj: LandArea, nation?: Nation) {
    Object.assign(this, obj);
    if (nation !== null && nation !== undefined) this.nation = nation;
    this.homeTerritoryOf = factions[this.StartFaction];
  }

  isGreatPowerHomeTerritory(): boolean {
    return this.Type === "GreatPower";
  }

  resourcesDefaultFaction(): Faction {
    if (this.isGreatPowerHomeTerritory()) return this.homeTerritoryOf;
    return this.nation.resourcesForFaction();
  }

  resourcesForFaction(): Faction {
    if (this.isOccupied()) return this.controller;
    return this.resourcesDefaultFaction();
  }

  isMainCapital(): boolean {
    return this.CityType === "MainCapital";
  }

  isSubCapital(): boolean {
    return this.CityType === "SubCapital";
  }

  isCapital(): boolean {
    return this.nation.capital.id === this.id;
  }

  isOccupied(): boolean {
    return this.controller !== null && this.controller !== undefined && this.controller !== factions.Neutral;
  }

  occupy(faction: Faction) {
    this.controller = faction;
    this.blockadeLevel = BlockadeLevel.NONE;
  }

  startingFaction(): Faction {
    return factions[this.StartFaction];
  }

  hasResources() {
    return (this.RES + this.RESTransAfrica + this.POP) > 0;
  }

  isNeutral() {
    return this.nation.isNeutral();
  }

  toString() {
    return `${this.name} (${this.nation.shortName}${this.isCapital() ? '*' : ''}) RES: ${this.RES + this.RESTransAfrica} (${this.RES}+${this.RESTransAfrica}), POP: ${this.POP}`;
  }
}

export class Nation {
  name: string;
  shortName: string;
  color: string;
  territories: Territory[];
  capital: Territory;
  influence: Faction[] = [];

  constructor(name: string, territories: LandArea[]) {
    this.name = name;
    this.shortName = countryNameToAcronym[name].name;
    this.color = countryNameToAcronym[name].color;
    if (this.shortName === null || this.shortName === undefined) throw new Error(`No acronym found for ${this.name}`);
    this.territories = territories.map(area => new Territory(area, this));
    //@ts-ignore
    this.capital = this.territories.find(area => area.Capital);
    if (this.capital === null || this.capital === undefined) throw new Error(`${name} does not have a capital in ${territories}`);
  }

  setInfluence(faction: Faction) {
    if (this.capital.isOccupied()) throw new Error(`Cannot influence ${this.name} as it is occupied by ${this.resourcesForFaction().name}.`);
    if (this.influence.length === 3) throw new Error(`Cannot influence ${this.name} as it is already a satellite for ${this.resourcesForFaction().name}.`);
    this.influence = [faction];
  }

  addInfluence(faction: Faction) {
    if (this.capital.isOccupied()) throw new Error(`Cannot influence ${this.name} as it is occupied by ${this.resourcesForFaction().name}.`);
    if (this.influence.length === 3) throw new Error(`Cannot influence ${this.name} as it is already a satellite for ${this.resourcesForFaction().name}.`);
    if (this.influence.length > 0 && !this.influence.includes(faction)) {
      this.influence.shift();
      return;
    }
    this.influence.push(faction);
    if (this.influence.length === 3) this.occupy(faction);
  }

  canBeInfluenced() {
    return !this.capital.isOccupied() && this.influence.length < 3;
  }

  resourcesForFaction(): Faction {
    if (this.capital.isOccupied()) return this.capital.controller;
    if (this.influence.length > 0) return this.influence[0];
    return factions.Neutral;
  }

  occupy(faction: Faction) {
    this.influence = [];
    this.capital.occupy(faction);
  }

  isNeutral(): boolean {
    return this.resourcesForFaction() === factions.Neutral;
  }

}

const areasByNation = groupByReduceFunction(landAreaTable, area => area.Nation);

export const territoriesByName = {};
export const territoryList: Territory[] = [];

export const nationsByName = {};
Object.keys(areasByNation).forEach(key => {
  const nation = new Nation(key, areasByNation[key]);
  if (nation.capital.StartFaction) {
    nation.capital.controller = factions[nation.capital.StartFaction];
  }
  nationsByName[key] = nation;
  territoryList.push(...nation.territories);
  nation.territories.forEach(area => {
    area.id = area.name;
    territoriesByName[area.name] = area
  });
}
);

/*
nationsByName['Persia'].addInfluence(factions.Axis);

console.log(factions.Axis.toString());
console.log(factions.USSR.toString());
console.log(factions.West.toString());

nationsByName['Persia'].occupy(factions.USSR);
territoriesByName['Abadan'].occupier = factions.West;

console.log(factions.Axis.toString());
console.log(factions.Axis.territoriesForResources().filter(terr => terr.hasResources()).map(t => t.toString()));

console.log(factions.USSR.toString());
console.log(factions.USSR.territoriesForResources().filter(terr => terr.hasResources()).map(t => t.toString()));

console.log(factions.West.toString());
console.log(factions.West.territoriesForResources().filter(terr => terr.hasResources()).map(t => t.toString()));

console.log(territoryList.filter(terr => terr.isNeutral() && terr.hasResources()).map(t => t.toString()));

*/