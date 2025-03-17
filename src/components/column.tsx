import React from "react";

import { Droppable } from "@hello-pangea/dnd";
import styled from "styled-components";
import { Faction, Territory } from "../model/HistoryTracker";
import { TerritoryItem } from "./item";
import { FactionDiv } from "./FactionDiv";
import { Box } from "@mui/material";
import { InsertDriveFileSharp } from "@mui/icons-material";

const Container = styled.div`
  margin: 4px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  width: 1000px;

  display: flex;
  flex-direction: column;
`;

const style = (isDraggingOver: boolean, faction: Faction) => {
  return {
    transition: "background-color 0.2s ease",
    padding: "8px",
    backgroundColor: `${isDraggingOver ? faction.darkTone : faction.color}`,
    flexGrow: 1,
    minHeight: "100px"
  }
}

interface FactionColumnProps {
  faction: Faction;
  isDropDisabled: boolean;
  highlightedTerritories: string[];
  addTerritoryField: React.ReactNode;
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
    if (!faction.isPlayable) return <></>

    const highlights = this.props.highlightedTerritories
    return (
      <Container>
        <Droppable
          isDropDisabled={this.props.isDropDisabled}
          droppableId={faction.name}>
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{ ...style(snapshot.isDraggingOver, faction) }}>
              <FactionDiv faction={faction} />
              {this.props.addTerritoryField}

              {territoriesToShow.map((territory, index) => (
                <TerritoryItem
                  key={territory.name}
                  territory={territory}
                  index={index}
                  highlight={!!highlights.find(terr => terr === territory.name)}
                  onClick={() => this.props.blockadeUpdateFunction(territory, territory.blockadeLevel)}
                />
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </Container>
    );
  }
}

