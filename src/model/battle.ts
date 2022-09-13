export const UnitName = {
  Fortress: "Fortress",
  AirForce: "Air Force",
  Carrier: "Carrier",
  Sub: "Sub",
  Fleet: "Fleet",
  Tank: "Tank",
  Infantry: "Infantry",
  Convoy: "Convoy",
  Marine: "Marine",
  Militia: "Militia",
  Industry: "Industry"
}

export type Technology = {
  name: string,
  shortName: string,
  edition: string,
  attackModifier?: any,
  attackMultiplier?: any,
  firstFire?: string
  ignoreSeaInvasion?: boolean,
  description?: string,
  selectable: boolean
}

export const Technologies: Technology[] = [
  { name: "AmphTracks", shortName: "at", edition: "CnC", ignoreSeaInvasion: true, selectable: true },
  {
    shortName: "ac",
    name: "AutoCannons", edition: "CnC", attackModifier: {
      Fleet: {
        "A": 2
      },
      Carrier: {
        "A": 3
      }
    }, selectable: true
  },
  {
    shortName: "ar",
    name: "AirDefense Radar", edition: "CnC, TnT", attackMultiplier: {
      "Air Force": {
        "A": 2
      }
    }, selectable: true
  },
  //  { name: "Heavy Bombers", edition: "TnT" },
  {
    shortName: "db",
    name: "Dive Bombing", edition: "CnC", attackModifier: {
      "Air Force": {
        "N": 2
      }
    }, selectable: true
  },
  { shortName: "ht", name: "Heavy Tanks", edition: "TnT", firstFire: UnitName.Tank, selectable: true },
  {
    shortName: "it",
    name: "Improved Torpedoes", edition: "CnC", attackModifier: {
      "Sub": {
        "N": 2
      }
    }, selectable: true
  },
  {
    shortName: "in",
    name: "Incendiaries", edition: "CnC", attackModifier: {
      "Air Force": {
        "IND": 1
      }
    }, selectable: true
  },
  { shortName: "je", name: "Jets", edition: "CnC, TnT", firstFire: UnitName.AirForce, selectable: true },
  {
    shortName: "pb",
    name: "Precision Bombsight", edition: "TnT", attackModifier: {
      "Air Force": {
        "IND": 1
      }
    }, selectable: true
  },
  { shortName: "nr", name: "Naval Radar", edition: "CnC, TnT", firstFire: UnitName.Fleet, selectable: true },
  { shortName: "ra", name: "Rocket Artillery", edition: "TnT", firstFire: UnitName.Infantry, selectable: true },
  {
    shortName: "so", name: "Sonar", edition: "CnC, TnT", attackModifier: {
      "Fleet": {
        "S": 3
      }
    }, selectable: true
  },
  //  { name: "Motorized Infantry", edition: "TnT" },
  //  { name: "LST", edition: "TnT" },
  {
    shortName: "ll",
    name: "LongLance", edition: "CnC", attackModifier: {
      "Fleet": {
        "N": 4
      }
    }, selectable: false
  },
  { shortName: "po", name: "Precision Optics", edition: "CnC", selectable: false },
];
export const TechLookup = {}
Technologies.forEach(tech => TechLookup[tech.name] = tech);
Technologies.forEach(tech => TechLookup[tech.shortName] = tech);

export const techsToString = (techs: string[]): string => {
  return techs.filter(tech => tech !== null).map(tech => TechLookup[tech].shortName).join("|");
}

export const stringToTechs = (string: string): string[] => {
  return string.split("|").filter(str => str !== '').map(str => {
    try {
      return TechLookup[str].name;
    } catch (e) {
      console.log(`Trying to read technology '${str}', but failed.`);
      return null;
    }
  }).filter(item => item !== null);
}

const stringToBlock = (string: string): Block => {
  const nation = NationLookup[string.charAt(0)];
  const unit = unitLookup[string.charAt(1)];
  const strength = Number(string.substring(2));
  //@ts-ignore
  const block: Block = force(unit.name, nation.name, strength)[0];
  return block;
}

export const blocksToString = (blocks: Block[]): string => {
  return blocks.map(block => NationLookup[block.nationName].shortName + unitLookup[block.name].shortName + block.strength).join("|");
}

export const stringToBlocks = (string: string): Block[] => {
  const blockStrings = string.split("|");
  //@ts-ignore
  return blockStrings.map(str => {
    try {
      return stringToBlock(str);
    } catch (e) {
      return null;
    }
  }
  ).filter(block => block !== null);
}


export const UnitClassType = {
  G: 'G',
  A: 'A',
  N: 'N',
  S: 'S',
  I: 'IND'
}


export type Nation = {
  name: string,
  shortName: string,
  color: string,
  pipColor: string,
  darkTone: string,
  maxPips: any,
  edition: string
  specialTechnologies?: string[],
  description?: string,
  units: string
}


export const Nations: Nation[] = [
  {
    name: "Axis",
    shortName: "a",
    color: "rgb(162,163,162)",
    pipColor: "black",
    darkTone: "rgb(111,113,112)",
    maxPips: (unit) => 4,
    edition: "TnT",
    units: "facsFtiCI",
  },
  {
    name: "Neutral",
    shortName: "n",
    pipColor: "black",
    color: "rgb(225, 137, 46)",
    darkTone: "rgb(204, 92, 45)",
    maxPips: (unit) => 3,
    edition: "TnT",
    units: "f"
  },
  {
    name: "USSR",
    shortName: "u",
    pipColor: "white",
    color: "rgb(221,72,56)",
    darkTone: "rgb(186,39,31)",
    maxPips: unit => 3,
    edition: "TnT",
    units: "facsFtiCI"
  },
  {
    name: "West",
    shortName: "w",
    pipColor: "white",
    color: "rgb(30,120,171)",
    darkTone: "rgb(2, 55, 83)",
    maxPips: unit => 4,
    edition: "TnT",
    units: "facsFtiCI"
  },
  {
    name: "Japanese (CnC)",
    shortName: "j",
    pipColor: "white",
    color: "rgb(171,146,36)",
    darkTone: "rgb(116,94,32)",
    maxPips: unit => {
      if (unitLookup[unit].class === UnitClassType.N) return 4;
      if (unit === UnitName.Tank) return 2;
      if (unit === UnitName.Marine) return 2;
      return 3;
    },
    edition: "CnC",
    specialTechnologies: [
      "LongLance", "Precision Optics"
    ],
    description: "Japanese have \n- *LongLance* (Fleets fire S4)\n- *Precision Optics* (Fleets have FirstFire, if neither has Naval Radar)\n- Air Force and Carriers can *Kamikaze* (N4, then self-destruct)",
    units: "facsFtimCI"
  },
  {
    name: "Soviets (CnC)",
    shortName: "s",
    pipColor: "white",
    color: "rgb(222,74,54)",
    darkTone: "rgb(186,39,31)",
    maxPips: unit => 3,
    edition: "CnC",
    units: "facsFtiMCI"
  },
  {
    name: "US (CnC)",
    shortName: "U",
    pipColor: "white",
    color: "rgb(93,134,73)",
    darkTone: "rgb(40,93,54)",
    maxPips: unit => unit === UnitName.Marine ? 2 : 4,
    edition: "CnC",
    units: "facsFtimMCI"
  },
];
export const NationLookup = {}
Nations.forEach(nation => NationLookup[nation.name] = nation);
Nations.forEach(nation => NationLookup[nation.shortName] = nation);


const unitClasses = [UnitClassType.G, UnitClassType.A, UnitClassType.N, UnitClassType.S, UnitClassType.I] as const;
export type UnitClass = typeof unitClasses[number];

export type AttackOrder = (UnitClass | "MAX")[];

export type Force = {
  name: string,
  nationName: string,
  forces: Block[],
  attackOrder: AttackOrder,
  reduceOrder?: string[],
  technologies?: string[], // technames
}

export type CombatRound = {
  attacker: "A" | "B",
  seaInvasion?: boolean,
  hasDoWFirstFire?: boolean
}

export type Block = {
  name: string,
  strength: number,
  nationName: string
};

export const force = (type: string, nationName: string, strength: number, amount: number = 1): Block[] => {
  const force: Block[] = [];
  for (var i = 0; i < amount; i++) {
    force.push({ name: type, strength: strength, nationName: nationName });
  }
  return force;
}

export type UnitTypeInfo = {
  id: number,
  shortName: string,
  name: string,
  priority: number,
  class: UnitClass,
  move: number,
  A: number,
  N: number,
  G: number,
  S: number,
  I: number,
  takesDouble: boolean,
  special: boolean,
  preferredOrder: UnitClass[],
  canFirstFire: boolean,
  ignoreSeaInvasion: boolean,
  TnT: boolean,
  CnC: boolean
}



var LOG = true;
const unitData = [
  ["id", "shortName", "name", "priority", "class", "move", UnitClassType.A, UnitClassType.N, UnitClassType.G, UnitClassType.S, UnitClassType.I, "takesDouble", "special", "canFirstFire", "TnT", "CnC", "ignoreSeaInvasion"],
  [0, "f", UnitName.Fortress, 1, UnitClassType.G, 0, 2, 3, 4, 3, 0, false, false, false, true, true, false],
  [1, "a", UnitName.AirForce, 2, UnitClassType.A, "2R", 3, 1, 1, 1, 0, false, false, true, true, true, false],
  [2, "c", UnitName.Carrier, 3, UnitClassType.N, "3R", 2, 2, 1, 2, 0, true, false, false, true, true, false], // Carrier requires the special condition on attack and escape at A1, not yet there
  [3, "s", UnitName.Sub, 4, UnitClassType.S, "2R", 0, 1, 0, 1, 0, false, false, false, true, true, false],
  [4, "F", UnitName.Fleet, 5, UnitClassType.N, "3R", 1, 3, 1, 2, 0, false, false, true, true, true, false],
  [5, "t", UnitName.Tank, 6, UnitClassType.G, 3, 0, 0, 2, 0, 0, false, false, true, true, true, false],
  [6, "i", UnitName.Infantry, 7, UnitClassType.G, 2, 1, 1, 3, 0, 0, false, false, true, true, true, false],
  [7, "m", UnitName.Marine, 7, UnitClassType.G, 2, 0, 0, 2, 0, 0, false, false, false, false, true, true],
  [8, "M", UnitName.Militia, 7, UnitClassType.G, 2, 0, 0, 2, 0, 0, false, false, false, false, true, false],
  [9, "C", UnitName.Convoy, 50, UnitClassType.N, 2, 0, 0, 0, 0, 0, true, false, false, true, true, false],
  [10, "I", UnitName.Industry, 100, UnitClassType.I, 0, 0, 0, 0, 0, 0, false, true, false, true, true, false],
];



//@ts-ignore
const header: string = unitData.shift();
export const unitTable: UnitTypeInfo[] = []
export const unitLookup = {};
unitData.forEach((data) => {

  //@ts-ignore
  const unit: UnitTypeInfo = {};

  for (var i = 0; i < header.length; i++) {
    unit[header[i]] = data[i];
  }

  //@ts-ignore
  unitLookup[unit.name] = unit;
  unitLookup[unit.shortName] = unit;

  unit.preferredOrder = unitClasses.map((type) => {
    return {
      unitType: type,
      firepower: unit[type]
    }
  }
  ).sort((a, b) => b.firepower - a.firepower).map(item => item.unitType);
  unitTable.push(unit);
});
unitTable.sort((A, B) => A.priority - B.priority);

function roll() {
  return Math.floor(Math.random() * 6) + 1;
}

function attack(strength: number, hitOn: number) {
  const rolls = Array.from(Array(strength)).map((val) => roll());
  return rolls.filter((val) => val <= hitOn).length;
}

function applyHits(targets: Block[], hits, targetType: UnitClass) {
  if (LOG) console.log(`applying ${hits} hits to ${targets.map(block => block.name + ":" + block.strength).join(",")} where type is ${targetType}`);
  if (hits === 0) return;

  while (hits > 0) {
    const validTargets = targets.filter(
      (block) => unitLookup[block.name]?.class === targetType
    );
    if (LOG) console.log("Valid targets", validTargets);
    if (validTargets.length === 0) {
      if (LOG) console.log("No targets of type available.");
      break;
    }

    const highestPips = Math.max(...validTargets.map((target) => target.strength));
    if (LOG) console.log("Highest pips: " + highestPips);
    
    const highestPipTargets = validTargets.filter(
      (target) => Number(target.strength) === highestPips
    );
    if (highestPipTargets.length === 0) {
      if (LOG) console.log ("No targets available.");
      break; // no targets available
    }
    // iterate through all the highest pip targets
    for (var i = 0; hits > 0 && i < highestPipTargets.length; i++) {
      const unitInfo: UnitTypeInfo = unitLookup[highestPipTargets[i].name];
      highestPipTargets[i].strength -= unitInfo.takesDouble ? 2 : 1;
      hits--;

      // remove the block if strength gets to zero or less
      if (highestPipTargets[i].strength <= 0) {
        const index = targets.indexOf(highestPipTargets[i]);
        targets.splice(index, 1);
      }
    }
  }
}


function fire(firingBlock: Block, targetBlocks: Block[], attackOrder: AttackOrder, technologies: string[]) {
  const firingUnit = unitLookup[firingBlock.name];
  const firingUnitNation = NationLookup[firingBlock.nationName];

  const toHitTable = {}

  unitClasses.forEach(unitClass => { toHitTable[unitClass] = firingUnit[unitClass] });

  const techs: Technology[] = [];
  if (firingUnitNation.specialTechnologies) techs.push(...firingUnitNation.specialTechnologies.map(name => TechLookup[name]));
  if (technologies) techs.push(...technologies.map(name => TechLookup[name]));

  techs?.forEach(tech => {
    if (tech.attackModifier === undefined) return;
    if (tech.attackModifier[firingBlock.name] === undefined) return;
    const toHitOverride = tech.attackModifier[firingBlock.name];
    Object.keys(toHitOverride).forEach(key => toHitTable[key] = toHitOverride[key]);
  });

  var order = [...attackOrder];
  order.splice(order.indexOf("MAX"), 1, ...firingUnit.preferredOrder);

  // remove units that cannot be damaged
  order = order.filter(item => toHitTable[item] > 0);


  //@ts-ignore
  const targetUnitType: UnitClass = order.find(
    (type) =>
      targetBlocks.findIndex(
        (block) => unitLookup[block.name]?.class === type
      ) !== -1
  );

  if (targetUnitType === null || targetUnitType === undefined) {
    if (LOG) console.log(`No targets available for firing.`);
    return;
  }
  var totalHits = 0;
  var totalForce = 0;
  if (LOG)
    console.log(`..(${firingBlock.name},${firingBlock.strength}) firing at ${targetUnitType}`);

  if (LOG) console.log("firing block nation", firingUnitNation);


  const multipliers = techs?.map(tech => {
    if (tech.attackMultiplier === undefined) return null;
    if (tech.attackMultiplier[firingBlock.name] === undefined) return null;
    return tech.attackMultiplier[firingBlock.name][targetUnitType];
  }).filter(item => item !== null && item !== undefined);
  const multiplier = multipliers.length > 0 && multipliers[0] > 1 ? multipliers[0] : 1;

  const toHit = toHitTable[targetUnitType];

  const hits = attack(firingBlock.strength * multiplier, toHit);
  totalHits += hits;

  applyHits(targetBlocks, hits, targetUnitType);
  totalForce += firingBlock.strength;
  if (totalForce === 0) return;
  if (LOG)
    console.log(
      `Total hits: ${totalHits}/${totalForce} against ${targetBlocks[0].name}:${targetBlocks[0].strength}`
    );
}

export const simulate = (attacker: Force, defender: Force, combatRounds: CombatRound[], rolls = 1) => {
  LOG = false;

  const aggressionResults = [];
  const defensiveResults = [];
  for (var i = 0; i < rolls; i++) {
    if (i === 0) LOG = false;
    else LOG = false;
    var results = runBattle(
      JSON.parse(JSON.stringify(attacker)),
      JSON.parse(JSON.stringify(defender)),
      combatRounds);
    aggressionResults.push(results[0]);
    defensiveResults.push(results[1]);
  }

  return [aggressionResults, defensiveResults];
}



function runBattle(forceA: Force, forceB: Force, combatRounds: CombatRound[]) {
  combatRounds?.forEach((round, i) => {
    if (LOG) console.log(`Round ${i + 1}! -------------------------------------`);

    var attacker = forceA;
    var defender = forceB;

    //    attacker.forces.forEach(block => block.nationName = attacker.nationName);
    //    defender.forces.forEach(block => block.nationName = defender.nationName);

    if ("B" === round.attacker) {
      defender = forceA;
      attacker = forceB;
    }
    if (LOG) console.log(`Attacker is '${attacker.name}', Defender is '${defender.name}`);

    unitTable.forEach((activeUnitType) => {

      if (!(
        attacker.forces.find((block) => block?.name === activeUnitType.name) !== undefined ||
        defender.forces.find((block) => block?.name === activeUnitType.name) !== undefined)) 
        return;

      if (LOG) console.log(`'${activeUnitType.name}' ====== "`);


      var attackerFFs = 0;
      if (attacker.technologies?.filter((item) => TechLookup[item]?.firstFire === activeUnitType.name).length > 0) attackerFFs++;

      var defenderFFs = 0;
      if (defender.technologies?.filter((item) => TechLookup[item]?.firstFire === activeUnitType.name).length > 0) defenderFFs++;

      var goesFirst = defender;
      var goesSecond = attacker;

      // if neither has FFs then give the japanese player first fire
      if (attackerFFs === 0 && defenderFFs === 0 && activeUnitType.name === UnitName.Fleet) {
        attackerFFs += NationLookup[attacker.nationName].specialTechnologies?.find(tech => tech === "Precision Optics") ? 1 : 0;
        defenderFFs += NationLookup[defender.nationName].specialTechnologies?.find(tech => tech === "Precision Optics") ? 1 : 0;
      }

      // give DoW bonus to attacker
      if (round.hasDoWFirstFire) attackerFFs++;

      if (attackerFFs - defenderFFs > 0) {
        if (LOG) console.log("Attacker has advantage, so goes first");
        const temp = goesFirst;
        goesFirst = goesSecond;
        goesSecond = temp;
      }
      if (
        round.seaInvasion &&
        goesFirst === attacker &&
        activeUnitType.class === "G" &&
        !activeUnitType.ignoreSeaInvasion
        && !(goesFirst.technologies?.filter(tech => tech === "AmphTracks").length > 0)
      ) {
        if (LOG) console.log("Sea invasion ongoing, attacking ground units skip.")
      } else
        goesFirst.forces
          .filter((block) => block?.name === activeUnitType.name)
          .forEach((block) =>
            fire(
              block,
              goesSecond.forces,
              goesFirst.attackOrder,
              goesFirst.technologies
            )
          );

      if (
        round.seaInvasion &&
        goesSecond === attacker &&
        activeUnitType.class === "G" &&
        !activeUnitType.ignoreSeaInvasion
        && !(goesSecond.technologies?.filter(tech => tech === "AmphTracks").length > 0)
      ) {
        if (LOG) console.log("Sea invasion ongoing, attacking ground units skip.")
      } else
        goesSecond.forces
          .filter((block) => block?.name === activeUnitType.name)
          .forEach((block) =>
            fire(
              block,
              goesFirst.forces,
              goesSecond.attackOrder,
              goesSecond.technologies
            )
          );
    });
    if (LOG) console.log("ForceA after round", forceA);
    if (LOG) console.log("ForceB after round", forceB);
    /*
        if (reinforcenementsArriveEndOf[0] === i) {
          attacker.forces.push(...attackReinforcements);
          if (LOG) console.log("reinforcements arrive", attacker);
        }
        */
  });
  return [forceA, forceB];
}
