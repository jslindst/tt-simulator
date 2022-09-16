import React from "react";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { Resource, Population } from "./Resource";

import { Territory } from "../model/HistoryTracker.ts";


import styled from "styled-components";

import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import { ListSubheader } from "@mui/material";

const ItemName = styled.div`
  width: 150px;
  text-align: left;
  display: flex;
  align-items: center;
`;

const ForcedDiv = styled.div`
  width: ${props => props.width};
`;

const Container = styled.div`
  border: 1px solid lightgrey;
  border-radius: 1px;
  padding: 4px;
  margin-bottom: 4px;
  background-color: ${props => (props.color)}; 
  display: flex;
  align-items: center;
  text-decoration: ${props => props.bold ? "underline" : "none"};
`;

export default class TerritoryItem extends React.Component {
  render() {
    const territory = new Territory(this.props.territory);
    return (
      <Draggable
        draggableId={territory.name}
        index={this.props.index}>
        {(provided, snapshot) => (
          <Container
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
            color={territory.nation.color}
            bold={territory.isCapital()}
          >
            <ItemName>{territory.name}

              {territory.isSubCapital() || territory.isMainCapital() ? <svg
                id={territory.name}
                width="25"
                height="25"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="translate(50,50)">
                  <g transform="scale(0.6)">
                    {territory.isMainCapital() ?
                      <circle stroke="black" strokeWidth="2" fill="none" cx={0} cy={0} r={75} />
                      : ""}
                    <circle stroke="black" strokeWidth="2" fill="none" cx={0} cy={0} r={65} />
                    <circle stroke="black" fill="white" strokeWidth="2" cx={0} cy={0} r={55} />
                    <polygon fill={territory.isMainCapital() ? territory.startingFaction().darkTone : territory.startingFaction().color} strokeWidth="1"
                      points="0,-50 29.39,40.45 -47.55,-15.45 47.55,-15.45 -29.39,40.45 " />
                  </g>
                </g>
              </svg>
                : ""}
            </ItemName>
            <ForcedDiv width="50px">
              <Resource amount={territory.RES} />
              <Resource amount={territory.RESTransAfrica} color="red" />
            </ForcedDiv>
            <ForcedDiv width="25px">
              <Population amount={territory.POP} />
            </ForcedDiv>
            <Chip size="small" label={territory.nation.shortName} />
          </Container>
        )}
      </Draggable>
    );
  }
}
