import React from "react";
import { Faction } from "../model/HistoryTracker";
import { Population, Resource } from "./TrackerIcons";
import { SupplyStatus } from "./MapView";

interface FactionDivProps {
  faction: Faction;
  supplyStatus?: SupplyStatus;
}

export const FactionDiv: React.FC<FactionDivProps> = ({ faction, supplyStatus }) => {
  if (!faction.isPlayable) return <></>
  return (
    <div style={{ padding: "4px", display: "flex", justifyContent: "flex-end" }}>
      <div style={{ width: "125px", padding: "3px", fontSize: "20px", fontWeight: "bold", marginRight: "auto" }}>{faction.name}</div>
      <div style={{ width: "25px" }}><Population amount={faction.POP(supplyStatus)} /></div>
      <div style={{ width: "25px" }}><Resource amount={faction.RES(supplyStatus)} /></div>
      <div style={{ width: "25px" }}><Resource color="red" amount={faction.RESTransAfrica(supplyStatus)} /></div>
      <div style={{ width: "25px" }} />
    </div>
  );
};