import React from "react";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import styled from "styled-components";
import { Resource, Population } from "./TrackerIcons";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import { ListSubheader } from "@mui/material";
import TerritoryItem from "./item";

const Container = styled.div`
  margin: 4px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  width: 1000px;

  display: flex;
  flex-direction: column;
`;

const TerritoryList = styled.div`
  transition: background-color 0.2s ease;
  padding: 8px;
  background-color: ${props => (props.isDraggingOver ? props.faction.darkTone : props.faction.color)};
  flex-grow: 1;
  min-height: 100px;
`;

export default class FactionColumn extends React.Component {
  render() {
    const faction = this.props.faction;

    const territoriesToShow = faction.territoriesWithResources().sort((A, B) => {
      if (A.nation.name === B.nation.name)
        return A.name.localeCompare(B.name);
      return A.nation.name.localeCompare(B.nation.name);
    });

    /*
    console.log("Column " + faction.name + ", showing territories", territoriesToShow);
    console.log(faction);
    console.log("all territories of " + faction.name, faction.territories());
*/
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
                  highlight={highlights.indexOf(territory.name) !== -1}
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

