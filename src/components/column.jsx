import React from "react";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import styled from "styled-components";
import { Resource, Population } from "./Resource";
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
  width: 2500px;

  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  padding: 8px;
`;

const TerritoryList = styled.div`
  padding: 8px;
  background-color: ${props => (props.isDraggingOver ? props.faction.darkTone : props.faction.color)};
  flex-grow: 1;
  min-height: 100px;
`;

export default class FactionColumn extends React.Component {
  render() {
    const faction = this.props.faction;

    const territoriesToShow = faction.territoriesForResources().filter(terr => !this.props.onlyWithResources || terr.hasResources()).sort((A, B) => {
      if (A.nation.name === B.nation.name)
        return A.name.localeCompare(B.name);
      return A.nation.name.localeCompare(B.nation.name);
    });


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
              <div style={{ display: "flex" }}>
                <div style={{ width: "150px", padding: "4px", fontSize: "20px", fontWeight: "bold" }}>{faction.name}</div>
                <div style={{ width: "25px" }}><Resource amount={faction.RES()} /></div>
                <div style={{ width: "25px" }}><Resource color="red" amount={faction.RESTransAfrica()} /></div>
                <div style={{ width: "25px" }}><Population amount={faction.POP()} /></div>
              </div>
              {this.props.addTerritoryField}





              {territoriesToShow.map((territory, index) => (
                <TerritoryItem key={territory.name} territory={territory} index={index} />
              ))}
              {provided.placeholder}
            </TerritoryList>
          )}
        </Droppable>
      </Container>
    );
  }
}

