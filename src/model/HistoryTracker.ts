import { SupplyStatus } from "components/MapView";
import { groupByReduceFunction } from "../utils/utils";
import { Nations, NationType } from "./battle";

export const BlockadeLevel = {
  NONE: 0,
  MED: 1,
  FULL: 2
}

type VisualIdentity = {
  name: string
  color: string
}

const INFLUENCE_NEEDED = 3;

export const countryVisualIdentity: { [key: string]: VisualIdentity } = {
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
  "Sea": { name: "Sea", color: 'rgba(206,229,240,1)' },
}

export interface LandAreaData {
  name: string,
  StartFaction: string,
  Nation: string,
  CityType: AreaType,
  Capital: boolean,
  RES: number,
  RESTransAfrica: number,
  POP: number,
  Muster: number,
  CardName: string,
  NumberOfCards: number,
  Type: TerritoryType,
  isStrait: boolean,
}

export class Faction {
  name: string;
  IND: number;
  color: string;
  darkTone: string;
  maxPips?: (unitName: string) => number;
  isPlayable: boolean;
  enemies: Set<string>;
  nationType: NationType;

  constructor(nation: NationType, isPlayable = true) {
    this.name = nation.name
    this.color = nation.color
    this.darkTone = nation.darkTone
    this.maxPips = undefined;
    this.IND = 10;
    this.isPlayable = isPlayable;
    this.enemies = new Set();
    this.nationType = nation;
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

  declareDoW(against: Faction) {
    this.enemies.add(against.name);
    against.enemies.add(this.name)
  }

  removeDow(against: Faction) {
    this.enemies.delete(against.name);
    against.enemies.delete(this.name)
  }

  stateWith(faction: Faction): AreaControl {
    if (faction.name === this.name) return "Friendly"; // always friendly with oneself
    if (this.enemies.has(faction.name)) return "Enemy";
    return "Rival";
  }

  POP(supplyStatus?: SupplyStatus): number {
    return this.territoriesWithResources().reduce((val, area) => {
      const isTradeable = supplyStatus ? supplyStatus.tradeable.includes(area.name) : true
      const addition = (isTradeable && area.blockadeLevel === BlockadeLevel.NONE ? area.POP : 0)
      return val = val + addition;
    }, 0);
  }

  RES(supplyStatus?: SupplyStatus): number {
    return this.territoriesWithResources().filter(area => area.resourcesForFaction() === this).reduce((val, area) => {
      const isTradeable = supplyStatus ? supplyStatus.tradeableMED.includes(area.name) : true
      return val = val + (isTradeable && area.blockadeLevel === BlockadeLevel.NONE ? area.RES : 0);
    }, 0)
  }

  RESTransAfrica(supplyStatus?: SupplyStatus): number {
    return this.territoriesWithResources().filter(area => area.resourcesForFaction() === this).reduce((val, area) => {
      const isTradeable = supplyStatus ? supplyStatus.tradeable.includes(area.name) : true
      return val = val + (isTradeable && area.blockadeLevel !== BlockadeLevel.FULL ? area.RESTransAfrica : 0);
    }, 0);
  }

  toString(): string {
    return `${this.name}, IND: ${this.IND}, POP: ${this.POP()}, RES: ${this.RES()}`;
  }

}

export const factionsByName: { [key: string]: Faction } = {
  Axis: new Faction(Nations[0]),
  West: new Faction(Nations[3]),
  USSR: new Faction(Nations[2]),
  Neutral: new Faction(Nations[1]),
  Sea: new Faction({
    name: 'Sea',
    mainCapitalName: "",
    subCapitalNames: [],
    shortName: 'Sea',
    color: 'rgba(206,229,240,1)',
    darkTone: 'rgba(186,222,238,1)',
    maxPips: () => 0,
    pipColor: 'black',
    edition: '',
    units: ''
  }, false)
}

enum AreaType {
  MainCapital = "MainCapital",
  SubCapital = "SubCapital",
  CapitalCity = "CapitalCity",
  City = "City",
  Town = "Town",
  Land = "Land",
  Sea = "Sea",
  Ocean = "Ocean"
}

type CityTypeData = {
  enum: AreaType;
  population: number;
  muster: number;
  type: "Land" | "Sea" | "Strait";
}

// Lookup object
const CityTypeInfo: Record<AreaType, CityTypeData> = {
  [AreaType.MainCapital]: { enum: AreaType.MainCapital, population: 3, muster: 0, type: "Land" },
  [AreaType.SubCapital]: { enum: AreaType.SubCapital, population: 2, muster: 0, type: "Land" },
  [AreaType.CapitalCity]: { enum: AreaType.CapitalCity, population: 1, muster: 3, type: "Land" },
  [AreaType.City]: { enum: AreaType.City, population: 1, muster: 2, type: "Land" },
  [AreaType.Town]: { enum: AreaType.Town, population: 0, muster: 1, type: "Land" },
  [AreaType.Land]: { enum: AreaType.Land, population: 0, muster: 0, type: "Land" },
  [AreaType.Sea]: { enum: AreaType.Sea, population: 0, muster: 0, type: "Sea" },
  [AreaType.Ocean]: { enum: AreaType.Ocean, population: 0, muster: 0, type: "Sea" },
};

type StartFactionName = "West" | "Axis" | "USSR" | "Neutral" | "Sea"

type NationName = "Canada" | "USA" | "Latin America" | "Portugal" | "Denmark" | "Ireland" | "Britain" | "France" | "Spain" | "French North Africa" | "Norway" |
  "Sweden" | "Finland" | "Baltic States" | "Low Countries" | "Germany" | "Poland" | "Austria" | "Czechoslovakia" | "Hungary" | "Rumania" | "Bulgaria" | "Turkey" | "Middle East" |
  "USSR" | "Yugoslavia" | "Albania" | "Greece" | "Italy" | "Gibraltar" | "Malta" | "Libya" | "India" | "Persia" | "Afghanistan" | "Syria" | "Sea"

const LandAreaData = [
  createLandArea("West", "Canada", "Ottawa", AreaType.Town, true, "Colony", 1, 0, "", 0),
  createLandArea("Neutral", "USA", "New York", AreaType.City, false, "USA", 2, 0, "", 0),
  createLandArea("Neutral", "USA", "Washington", AreaType.SubCapital, true, "USA", 2, 0, "USA", 5),
  createLandArea("Neutral", "Latin America", "Rio de Janeiro", AreaType.Town, true, "MinorNation", 2, 0, "", 0),
  createLandArea("Neutral", "Portugal", "Azores", AreaType.Land, false, "MinorNation", 0, 0, "", 0, true),
  createLandArea("Neutral", "Portugal", "Lisbon", AreaType.Town, true, "MinorNation", 1, 0, "Portugal", 3),
  createLandArea("Neutral", "Denmark", "Iceland", AreaType.Land, false, "MinorNation", 0, 0, "", 0),
  createLandArea("Neutral", "Denmark", "Copenhagen", AreaType.Town, true, "MinorNation", 1, 0, "Denmark", 3, true),
  createLandArea("Neutral", "Ireland", "Dublin", AreaType.Town, true, "MinorNation", 0, 0, "", 0),
  createLandArea("West", "Britain", "London", AreaType.MainCapital, true, "GreatPower", 1, 0, "", 0),
  createLandArea("West", "Britain", "Glasgow", AreaType.City, false, "GreatPower", 1, 0, "", 0),
  createLandArea("West", "France", "Paris", AreaType.SubCapital, true, "MajorPower", 0, 0, "", 0),
  createLandArea("West", "France", "Lorraine", AreaType.Land, false, "MajorPower", 2, 0, "", 0),
  createLandArea("West", "France", "Gascony", AreaType.Land, false, "MajorPower", 0, 0, "", 0),
  createLandArea("West", "France", "Marseille", AreaType.City, false, "MajorPower", 0, 0, "", 0),
  createLandArea("Neutral", "Spain", "Leon", AreaType.Land, false, "MinorNation", 0, 0, "", 0),
  createLandArea("Neutral", "Spain", "Madrid", AreaType.CapitalCity, true, "MinorNation", 0, 0, "Spain", 4),
  createLandArea("Neutral", "Spain", "Barcelona", AreaType.City, false, "MinorNation", 0, 0, "", 0),
  createLandArea("West", "French North Africa", "Dakar", AreaType.Land, false, "Colony", 0, 0, "", 0),
  createLandArea("West", "French North Africa", "Morocco", AreaType.Land, false, "Colony", 0, 0, "", 0),
  createLandArea("West", "French North Africa", "Algiers", AreaType.City, true, "Colony", 0, 0, "", 0),
  createLandArea("West", "French North Africa", "Tunisia", AreaType.Land, false, "Colony", 0, 0, "", 0),
  createLandArea("West", "French North Africa", "Sfax", AreaType.Land, false, "Colony", 0, 0, "", 0),
  createLandArea("Neutral", "Norway", "Oslo", AreaType.Town, true, "MinorNation", 1, 0, "Norway", 3),
  createLandArea("Neutral", "Norway", "Narvik", AreaType.Land, false, "MinorNation", 0, 0, "", 0),
  createLandArea("Neutral", "Sweden", "Gallivare", AreaType.Land, false, "MinorNation", 1, 0, "", 0),
  createLandArea("Neutral", "Sweden", "Stockholm", AreaType.City, true, "MinorNation", 1, 0, "Sweden", 3),
  createLandArea("Neutral", "Finland", "Petsamo", AreaType.Land, false, "MinorNation", 1, 0, "", 0),
  createLandArea("Neutral", "Finland", "Helsinki", AreaType.Town, true, "MinorNation", 0, 0, "Finland", 4),
  createLandArea("Neutral", "Baltic States", "Riga", AreaType.Town, true, "MinorNation", 0, 0, "Baltic States", 2),
  createLandArea("Neutral", "Low Countries", "Amsterdam", AreaType.City, true, "MinorNation", 0, 0, "Low Countries", 4),
  createLandArea("Axis", "Germany", "Ruhr", AreaType.SubCapital, false, "GreatPower", 3, 0, "", 0),
  createLandArea("Axis", "Germany", "Berlin", AreaType.MainCapital, true, "GreatPower", 1, 0, "", 0),
  createLandArea("Axis", "Germany", "Munich", AreaType.City, false, "GreatPower", 0, 0, "", 0),
  createLandArea("Axis", "Germany", "Königsberg", AreaType.City, false, "GreatPower", 0, 0, "", 0),
  createLandArea("Neutral", "Poland", "Warsaw", AreaType.CapitalCity, true, "MinorNation", 1, 0, "Poland", 3),
  createLandArea("Neutral", "Poland", "Vilna", AreaType.Town, false, "MinorNation", 0, 0, "", 0),
  createLandArea("Neutral", "Poland", "Lvov", AreaType.City, false, "MinorNation", 0, 0, "", 0),
  createLandArea("Neutral", "Czechoslovakia", "Prague", AreaType.City, true, "MinorNation", 0, 0, "Czechoslovakia", 6),
  createLandArea("Neutral", "Austria", "Vienna", AreaType.City, true, "MinorNation", 0, 0, "Austria", 6),
  createLandArea("Neutral", "Hungary", "Budapest", AreaType.City, true, "MinorNation", 1, 0, "Hungary", 6),
  createLandArea("Neutral", "Rumania", "Bucharest", AreaType.City, true, "MinorNation", 2, 0, "Rumania", 5),
  createLandArea("Neutral", "Yugoslavia", "Croatia", AreaType.Land, false, "MinorNation", 1, 0, "", 0),
  createLandArea("Neutral", "Yugoslavia", "Belgrade", AreaType.Town, true, "MinorNation", 0, 0, "Yugoslavia", 6),
  createLandArea("Neutral", "Bulgaria", "Sofia", AreaType.Town, true, "MinorNation", 1, 0, "Bulgaria", 4),
  createLandArea("Neutral", "Albania", "Albania", AreaType.Land, true, "MinorNation", 0, 0, "", 0),
  createLandArea("Neutral", "Greece", "Athens", AreaType.Town, true, "MinorNation", 1, 0, "", 0),
  createLandArea("Neutral", "Greece", "Crete", AreaType.Land, false, "MinorNation", 0, 0, "Greece", 6),
  createLandArea("Axis", "Italy", "Milan", AreaType.City, false, "MajorPower", 1, 0, "", 0),
  createLandArea("Axis", "Italy", "Venice", AreaType.Land, false, "MajorPower", 1, 0, "", 0),
  createLandArea("Axis", "Italy", "Rome", AreaType.SubCapital, true, "MajorPower", 0, 0, "", 0),
  createLandArea("Axis", "Italy", "Taranto", AreaType.Land, false, "MajorPower", 0, 0, "", 0),
  createLandArea("Axis", "Italy", "Sardinia", AreaType.Land, false, "MajorPower", 0, 0, "", 0),
  createLandArea("Axis", "Italy", "Sicily", AreaType.Land, false, "MajorPower", 0, 0, "", 0, true),
  createLandArea("West", "Gibraltar", "Gibraltar", AreaType.Town, true, "Colony", 0, 0, "", 0, true),
  createLandArea("West", "Malta", "Malta", AreaType.Town, true, "Colony", 0, 0, "", 0, true),
  createLandArea("Axis", "Libya", "Tripoli", AreaType.City, true, "Colony", 0, 0, "", 0),
  createLandArea("Axis", "Libya", "Cyrenaica", AreaType.Land, false, "Colony", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Murmansk", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Archangel", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Vologda", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Gorky", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Perm", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Urals", AreaType.City, false, "GreatPower", 1, 0, "", 0),
  createLandArea("USSR", "USSR", "Western Siberia", AreaType.Land, false, "GreatPower", 1, 0, "", 0),
  createLandArea("USSR", "USSR", "Leningrad", AreaType.SubCapital, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Moscow", AreaType.MainCapital, true, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Penza", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Ufa", AreaType.Land, false, "GreatPower", 1, 0, "", 0),
  createLandArea("USSR", "USSR", "Kazakhstan", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Belorussia", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Bryansk", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Voronezh", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Kiev", AreaType.City, false, "GreatPower", 1, 0, "", 0),
  createLandArea("USSR", "USSR", "Odessa", AreaType.City, false, "GreatPower", 2, 0, "", 0),
  createLandArea("USSR", "USSR", "Kharkov", AreaType.City, false, "GreatPower", 1, 0, "", 0),
  createLandArea("USSR", "USSR", "Stalingrad", AreaType.City, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Sevastopol", AreaType.Land, false, "GreatPower", 0, 0, "", 0, true),
  createLandArea("USSR", "USSR", "Kuban", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Grozny", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Georgia", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("USSR", "USSR", "Baku", AreaType.SubCapital, false, "GreatPower", 3, 1, "", 0),
  createLandArea("USSR", "USSR", "Turkmenistan", AreaType.Land, false, "GreatPower", 0, 0, "", 0),
  createLandArea("Neutral", "Turkey", "Istanbul", AreaType.City, false, "MinorNation", 0, 0, "Turkey", 3, true),
  createLandArea("Neutral", "Turkey", "Izmir", AreaType.Town, false, "MinorNation", 1, 0, "", 0),
  createLandArea("Neutral", "Turkey", "Ankara", AreaType.CapitalCity, true, "MinorNation", 0, 0, "", 0),
  createLandArea("Neutral", "Turkey", "Sinope", AreaType.Land, false, "MinorNation", 0, 0, "", 0),
  createLandArea("Neutral", "Turkey", "Adana", AreaType.Land, false, "MinorNation", 0, 0, "", 0),
  createLandArea("Neutral", "Turkey", "Kars", AreaType.Land, false, "MinorNation", 0, 0, "", 0),
  createLandArea("Neutral", "Persia", "Tabriz", AreaType.Land, false, "MinorNation", 0, 0, "", 0),
  createLandArea("Neutral", "Persia", "Tehran", AreaType.City, true, "MinorNation", 0, 0, "Persia", 2),
  createLandArea("Neutral", "Persia", "Abadan", AreaType.Land, false, "MinorNation", 2, 2, "", 0),
  createLandArea("Neutral", "Persia", "Shiraz", AreaType.Land, false, "MinorNation", 0, 0, "", 0),
  createLandArea("Neutral", "Afghanistan", "Kabul", AreaType.Town, true, "MinorNation", 0, 0, "Afghanistan", 3),
  createLandArea("West", "India", "Karachi", AreaType.Land, false, "Colony", 0, 0, "", 0),
  createLandArea("West", "India", "Delhi", AreaType.SubCapital, true, "Colony", 1, 1, "", 0),
  createLandArea("West", "India", "Bombay", AreaType.City, false, "Colony", 1, 1, "", 0),
  createLandArea("West", "Syria", "Damascus", AreaType.Town, true, "Colony", 0, 0, "", 0),
  createLandArea("West", "Middle East", "Egypt", AreaType.Land, false, "Colony", 0, 0, "", 0),
  createLandArea("West", "Middle East", "Suez", AreaType.City, true, "Colony", 0, 0, "", 0, true),
  createLandArea("West", "Middle East", "Sudan", AreaType.Land, false, "Colony", 0, 0, "", 0),
  createLandArea("West", "Middle East", "Jordan", AreaType.Land, false, "Colony", 0, 0, "", 0),
  createLandArea("West", "Middle East", "Iraq", AreaType.Land, false, "Colony", 1, 1, "", 0),
  createSeaArea("Baltic Sea"),
  createSeaArea("North Sea"),
  createSeaArea("Barents Sea"),
  createSeaArea("Sea of Azov"),
  createSeaArea("Western Black Sea"),
  createSeaArea("Irish Sea"),
  createSeaArea("Irminger Sea"),
  createSeaArea("Greenland Sea"),
  createSeaArea("English Channel"),
  createSeaArea("Madeira Sea"),
  createSeaArea("South Atlantic Ocean"),
  createSeaArea("Mid Atlantic Ocean"),
  createSeaArea("North Atlantic Ocean"),
  createSeaArea("Tyrrhenian Sea"),
  createSeaArea("Adriatic Sea"),
  createSeaArea("White Sea"),
  createSeaArea("Eastern Black Sea"),
  createSeaArea("Central Mediterranean"),
  createSeaArea("Eastern Mediterranean"),
  createSeaArea("Red Sea"),
  createSeaArea("Gulf of Aden"),
  createSeaArea("West Indian Ocean"),
  createSeaArea("East Indian Ocean"),
  createSeaArea("Arabian Sea"),
  createSeaArea("Persian Gulf"),
  createSeaArea("Southern Caspian Sea"),
  createSeaArea("Northern Caspian Sea"),
  createSeaArea("Bay of Biscay"),
  createSeaArea("Western Mediterranean"),
  createSeaArea("Gulf of Bothnia"),
  createSeaArea("Nordkapp Sea"),
  createSeaArea("Aegan Sea"),
  createSeaArea("Norwegian Sea"),
];

function createSeaArea(name: string): LandAreaData {
  return {
    name,
    CityType: name.includes("Ocean") ? CityTypeInfo.Ocean.enum : CityTypeInfo.Sea.enum,
    StartFaction: "Sea",
    Nation: "Sea",
    RES: 0,
    Capital: false,
    Muster: 0,
    CardName: "",
    NumberOfCards: 0,
    RESTransAfrica: 0,
    POP: 0,
    Type: "Sea",
    isStrait: false,
  }
}


function createLandArea(StartFaction: StartFactionName, Nation: NationName, name: string, CityType: AreaType, Capital: boolean, Type: TerritoryType, RES: number, RESTransAfrica: number, CardName: string, NumberOfCards: number, isStrait = false): LandAreaData {
  const CityTypeData = CityTypeInfo[CityType];
  return {
    StartFaction,
    Nation,
    name,
    CityType: CityTypeData.enum,
    Capital,
    Type,
    RES,
    RESTransAfrica,
    POP: CityTypeData.population,
    Muster: CityTypeData.muster,
    CardName,
    NumberOfCards,
    isStrait
  };
}


export const landAreaLookup: { [key: string]: LandAreaData } = {};
LandAreaData.forEach((data) => {
  landAreaLookup[data.name] = data;
});


type TerritoryType = "GreatPower" | "Colony" | "MajorPower" | "MinorNation" | "USA" | "Sea"

export class Territory {
  id: string;
  name: string;
  occupier?: Faction;
  homeTerritoryOf: Faction;
  nation: Nation;
  RES: number;
  RESTransAfrica: number;
  POP: number;
  CityType: AreaType;
  StartFaction: string;
  Type: TerritoryType;
  blockadeLevel: number = BlockadeLevel.NONE;
  landArea: LandAreaData;

  constructor(landArea: LandAreaData, nation: Nation) {
    this.landArea = landArea;
    this.id = `t${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.name = landArea.name;
    this.RES = landArea.RES;
    this.RESTransAfrica = landArea.RESTransAfrica;
    this.POP = landArea.POP;
    this.CityType = landArea.CityType;
    this.StartFaction = landArea.StartFaction;
    this.Type = landArea.Type;

    //Default values for Territory that LandArea does not have:
    this.blockadeLevel = BlockadeLevel.NONE;

    this.nation = nation;
    this.homeTerritoryOf = factionsByName[this.StartFaction]; //Important, it requires StartFaction to be assigned first
  }

  isGreatPowerHomeTerritory(): boolean {
    return this.Type === "GreatPower";
  }

  resourcesDefaultFaction(): Faction {
    if (this.isGreatPowerHomeTerritory()) return this.homeTerritoryOf;
    return this.nation.resourcesForFaction() || factionsByName.Neutral;
  }

  resourcesForFaction(): Faction {
    if (this.isOccupied()) return this.occupier || factionsByName.Neutral;
    return this.resourcesDefaultFaction();
  }

  controlledBy(): Faction | null {
    if (this.occupier) return this.occupier;
    if (this.isCapital()) {
      if (!this.isOccupied()) return this.homeTerritoryOf;
    }
    if (!this.isOccupied()) {
      if (this.isGreatPowerHomeTerritory()) return this.homeTerritoryOf;
    }
    if (this.nation.capital) return this.nation.capital.controlledBy();
    return null
  }

  isMainCapital(): boolean {
    return this.CityType === AreaType.MainCapital;
  }

  isSubCapital(): boolean {
    return this.CityType === AreaType.SubCapital;
  }

  isCapital(): boolean {
    return this.nation.capital?.id === this.id;
  }

  isOccupied(): boolean {
    if (!this.occupier) return false
    return (this.occupier !== factionsByName.Neutral)
  }

  occupy(faction: Faction) {
    if (faction.name === "Neutral") this.occupier = undefined;
    else this.occupier = faction;
    this.blockadeLevel = BlockadeLevel.NONE;
  }

  startingFaction(): Faction {
    return factionsByName[this.StartFaction];
  }

  hasResources() {
    return (this.RES + this.RESTransAfrica + this.POP) > 0;
  }

  isStrait() {
    return this.landArea.isStrait
  }

  isNeutral() {
    return this.nation.isNeutral();
  }

  isSea() {
    return !this.nation.capital
  }

  isStatusFor(faction: Faction): AreaControl {
    if (!faction) {
      console.error("Should not have null faction here.")
    }
    if (this.isSea()) {
      const control = this.controlledBy();
      if (!control) return "Open";
      return faction.stateWith(control) === "Enemy" ? "Enemy" : "Open"
    }
    const control = this.controlledBy();
    if (control) {
      if (control.name === "Neutral") return "Neutral"
      return faction.stateWith(control!)
    }
    return "Neutral"
  }

}

type AreaControl = "Friendly" | "Neutral" | "Rival" | "Enemy" | "Open"

/**
 * Nation is a collection of Areas that can also be possibly influenced
 */
export class Nation {
  name: string;
  shortName: string;
  color: string;
  territories: Territory[];
  capital?: Territory;
  influence: string[] = [];

  constructor(name: string, territories: LandAreaData[]) {
    this.name = name;
    this.shortName = countryVisualIdentity[name].name;
    this.color = countryVisualIdentity[name].color;
    if (this.shortName === null || this.shortName === undefined) throw new Error(`No acronym found for ${this.name}`);
    this.territories = territories.map(area => new Territory(area, this));

    const capital = this.territories.find(area => area.landArea.Capital);
    if (!capital) console.warn(`Nation '${name}' does not have a capital.`);
    else this.capital = capital;
  }

  isOccupied(): boolean {
    return (this.capital?.isOccupied() === true);
  }

  isInfluenced(): boolean {
    if (this.isOccupied()) return false;
    return this.influence.length > 0
  }

  influenceCount() {
    return (this.influence.length);
  }

  influencor(): string | null {
    if (this.influence.length === 0) return null
    return this.influence[0];
  }

  setInfluence(faction: Faction) {
    if (this.isOccupied()) throw new Error(`Cannot influence ${this.name} as it is occupied by ${this.resourcesForFaction().name}.`);
    if (this.influence.length === INFLUENCE_NEEDED) throw new Error(`Cannot influence ${this.name} as it is already a satellite for ${this.resourcesForFaction().name}.`);
    this.influence = [faction.name];
  }

  addInfluence(faction: Faction) {
    if (!this.capital) return // is sea
    if (this.capital.isGreatPowerHomeTerritory()) return; // cannot influence great powers
    if (faction === factionsByName.Neutral) {
      if (this.influence.length > 0) this.influence.shift();
      return;
    }
    if (this.isOccupied()) {
      console.warn(`Cannot influence ${this.name} as it is occupied by ${this.resourcesForFaction().name}.`);
      return;
    }
    if (this.influence.length === INFLUENCE_NEEDED) {
      console.warn(`Cannot influence ${this.name} as it is already a satellite for ${this.resourcesForFaction().name}.`);
      return;
    }
    if (this.influence.length > 0 && !this.influence.includes(faction.name)) {
      this.influence.shift();
      return;
    }
    this.influence.push(faction.name);
    if (this.influence.length === INFLUENCE_NEEDED) this.occupy(faction);
  }

  canBeInfluenced() {
    if (!this.capital) return false;
    if (this.capital.isGreatPowerHomeTerritory()) return false;
    return !this.capital.isOccupied() && this.influence.length < INFLUENCE_NEEDED;
  }

  resourcesForFaction(): Faction {
    if (!this.capital) return factionsByName.Sea;
    if (this.capital.isOccupied()) return this.capital.occupier || factionsByName.Neutral;
    if (this.influence.length > 0) return factionsByName[this.influence[0]];
    return factionsByName.Neutral;
  }

  occupy(faction: Faction) {
    console.log("Occupying", this.name, faction)
    if (!this.capital) {
      console.warn(`Tried to occupy nation ${this.name}, but it has no capital.`)
      return; // 
    }
    this.influence = [];
    this.capital.occupy(faction);
  }

  isNeutral(): boolean {
    return this.resourcesForFaction() === factionsByName.Neutral;
  }
}

const areasByNation = groupByReduceFunction(LandAreaData, area => area.Nation);
export const territoriesByName: { [key: string]: Territory } = {};
export const territoryList: Territory[] = [];
const nationsByName: { [key: string]: Nation } = {};
Object.keys(areasByNation).forEach(areaName => {
  const nation = new Nation(areaName, areasByNation[areaName]);
  if (nation.capital?.StartFaction) {
    nation.capital.occupier = factionsByName[nation.capital.StartFaction];
  }
  nationsByName[areaName] = nation;
  territoryList.push(...nation.territories);
  nation.territories.forEach(area => {
    area.id = area.name;
    territoriesByName[area.name] = area
  });
}
);

export function findTerritoriesInSupply(
  startTerritoryNames: string[],
  territoriesByName: Record<string, Territory>,
  neighborLookup: Record<string, string[]>,
  rule: (to: Territory, from: Territory, start: boolean) => boolean,
): string[] {
  const inSupply: Set<string> = new Set(); // Use a Set for efficient membership checking
  const queue: string[] = [...startTerritoryNames]; // Use territory *names* for the queue

  while (queue.length > 0) {
    const currentTerritoryName = queue.shift()!; // Get the next territory name.  The ! asserts non-null.
    const currentTerritory = territoriesByName[currentTerritoryName];

    // If territory doesn't exist, or we've already processed it continue.
    if (!currentTerritory || inSupply.has(currentTerritoryName)) continue;

    inSupply.add(currentTerritoryName);

    const neighbors = neighborLookup[currentTerritoryName] || []; // Get neighbor *names*

    for (const neighborName of neighbors) {
      const neighbor = territoriesByName[neighborName];

      // If no neighbor found, or we've already processed continue
      if (!neighbor || inSupply.has(neighborName)) {
        continue;
      }

      if (!rule(neighbor, currentTerritory, startTerritoryNames.includes(currentTerritoryName))) continue;

      queue.push(neighborName); // Add to queue for processing
    }
  }
  return Array.from(inSupply); // Convert Set back to array
}
/*
// Check supply rules:
// 1.  Controlled by the same faction OR the territory itself is in conflict (you mentioned this rule)
// 2.  Not controlled by an enemy faction.
const sameController = neighbor.controllerBy() === controllingFaction;
const isInConflict = false; // Replace with your actual conflict check logic.
const isEnemyControlled = neighbor.controller ? neighbor.controller.isEnemyOf(controllingFaction) : false;

if ((sameController || isInConflict) && !isEnemyControlled) {
  queue.push(neighborName); // Add to queue for processing
}
}
}

return Array.from(inSupply); // Convert Set back to array
*/