import { TerritoryState } from "components/MapView";
import { Faction, findShortestPathsToAll, findTerritoriesInSupply, SupplyPaths, Territory } from "./HistoryTracker";

const canSupplyFor = (faction: Faction) => {
  return (target: Territory) => {
    const status = target.isStatusFor(faction)
    switch (status) {
      case "Friendly":
        return true;
      case "Neutral":
      case "Rival":
        return target.isStrait();
      case "Enemy":
        return false;
      case "Open":
        return true
    }
  }
}

const canTradeFor = (faction: Faction) => {
  return (target: Territory) => {
    const status = target.isStatusFor(faction)
    switch (status) {
      case "Friendly":
      case "Neutral":
        return true;
      case "Rival":
        return target.isStrait();
      case "Enemy":
        return false;
      case "Open":
        if (faction.enemies.size === 0) return true // no enemies seas are always open
        if (target.escapedSub?.enemies.has(faction.name)) return false // there is an escaped sub of that I am an enemy of
      default:
        return true
    }
  }
}

const supplyRuleFor = (faction: Faction) => {
  const canSupply = canSupplyFor(faction);
  return (target: Territory, origin: Territory) => {
    return canSupply(target) && canSupply(origin)
  }
}

export function findSuppliedTerritoriesFor(faction: Faction, myState: TerritoryState, lookup: Record<string, string[]>): SupplyPaths {
  const supplyRule = supplyRuleFor(faction)
  return findShortestPathsToAll([faction.nationType.mainCapitalName, ...faction.nationType.subCapitalNames], myState.territoriesByName, lookup, supplyRule);
}

export function findTradableTerritoriesFor(faction: Faction, myState: TerritoryState, lookup: Record<string, string[]>): string[] {
  const tradeRule = canTradeFor(faction);

  const landRule = (target: Territory, origin: Territory) => {
    if (target.isSea() || origin.isSea()) return false;
    return tradeRule(origin) && tradeRule(target)
  }

  const seaRule = (target: Territory, origin: Territory, segmentStart: boolean) => {
    if (origin.isSea()) return tradeRule(target);
    return (origin.isStrait() || segmentStart) && target.isSea() && tradeRule(origin) && tradeRule(target)
  }

  const accessBySea: string[] = findTerritoriesInSupply([faction.nationType.mainCapitalName], myState.territoriesByName, lookup, seaRule);
  const seaLand: string[] = findTerritoriesInSupply(accessBySea, myState.territoriesByName, lookup, landRule);

  const acessByLand: string[] = findTerritoriesInSupply([faction.nationType.mainCapitalName], myState.territoriesByName, lookup, landRule);
  const landSea: string[] = findTerritoriesInSupply(acessByLand, myState.territoriesByName, lookup, seaRule);

  const supplied = [...new Set([...accessBySea, ...seaLand, ...acessByLand, ...landSea])]
  return supplied;
}


