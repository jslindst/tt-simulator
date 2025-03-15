import React from "react";
import { Faction } from "../model/HistoryTracker";
import { Population, Resource } from "./TrackerIcons";

interface FactionDivProps {
  faction: Faction;
}

export const FactionDiv: React.FC<FactionDivProps> = ({ faction }) => {  //Use props
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div style={{ width: "125px", padding: "3px", fontSize: "20px", fontWeight: "bold", marginRight: "auto" }}>{faction.name}</div>
      <div style={{ width: "25px" }}><Population amount={faction.POP()} /></div>
      <div style={{ width: "25px" }}><Resource amount={faction.RES()} /></div>
      <div style={{ width: "25px" }}><Resource color="red" amount={faction.RESTransAfrica()} /></div>
      <div style={{ width: "65px" }} />
    </div>
  );
};