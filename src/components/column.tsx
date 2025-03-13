import React from "react";

import { Droppable } from "@hello-pangea/dnd";
import styled from "styled-components";
import { Resource, Population } from "./TrackerIcons.tsx";
import TerritoryItem from "./item.jsx";
import { Faction, Territory } from "../model/HistoryTracker.js";

const Container = styled.div`
  margin: 4px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  width: 1000px;

  display: flex;
  flex-direction: column;
`;

const TerritoryList = styled.div<{ isDraggingOver: boolean; faction: Faction }>`
  transition: background-color 0.2s ease;
  padding: 8px;
  background-color: ${props => (props.isDraggingOver ? props.faction.darkTone : props.faction.color)};
  flex-grow: 1;
  min-height: 100px;
`;

interface FactionColumnProps {
  faction: Faction;
  isDropDisabled: boolean;
  highlightedTerritories: string[];
  addTerritoryField: React.ReactNode; // Correct type for React components/elements
  blockadeUpdateFunction: (territory: Territory, blockadeLevel: number) => void;
}

export default class FactionColumn extends React.Component<FactionColumnProps> { // Use the interface here
  render() {
    const faction = this.props.faction;

    const territoriesToShow = faction.territoriesWithResources().sort((A, B) => {
      if (A.nation.name === B.nation.name)
        return A.name.localeCompare(B.name);
      return A.nation.name.localeCompare(B.nation.name);
    });


    const highlights = this.props.highlightedTerritories
    return (
      <Container>
        <Droppable
          isDropDisabled={this.props.isDropDisabled}
          droppableId={faction.name}>
          {(provided, snapshot) => (
            <TerritoryList
              ref={provided.innerRef}
              {...provided.droppableProps}
              isDraggingOver={snapshot.isDraggingOver}
              faction={faction}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: "125px", padding: "3px", fontSize: "20px", fontWeight: "bold", marginRight: "auto" }}>{faction.name}</div>
                <div style={{ width: "25px" }}><Population amount={faction.POP()} /></div>
                <div style={{ width: "25px" }}><Resource amount={faction.RES()} /></div>
                <div style={{ width: "25px" }}><Resource color="red" amount={faction.RESTransAfrica()} /></div>
                <div style={{ width: "65px" }} />
              </div>
              {this.props.addTerritoryField}

              {territoriesToShow.map((territory, index) => (
                <TerritoryItem
                  key={territory.name}
                  territory={territory}
                  index={index}
                  highlight={highlights.find(terr => terr === territory.name)}
                  onClick={() => this.props.blockadeUpdateFunction(territory, territory.blockadeLevel)}
                />
              ))}
              {provided.placeholder}
            </TerritoryList>
          )}
        </Droppable>
      </Container>
    );
  }
}

