import React from "react";

import { Draggable } from "@hello-pangea/dnd";
import { Resource, Population, Capital } from "./TrackerIcons";
import { Territory } from "../model/HistoryTracker.ts";
import styled from "styled-components";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import { BlockadeLevel } from "../model/HistoryTracker.ts";

const ItemName = styled.div`
  width: 125px;
  height: 29px;
  text-align: left;
  display: flex;
  align-items: center;
  margin-right: auto;
  text-decoration: ${props => props.bold ? "underline" : "none"};
`;

const ForcedDiv = styled.div`
  width: ${props => props.width};
`;

const Container = styled.div`
  transition: background-color 0.4s ease;
  border: ${props => (props.highlight ? "1px solid white" : "1px solid lightgrey")};
  border-radius: 2px;
  padding: 4px;
  margin-bottom: 4px;
  background-color: ${props => props.highlight ? 'white' : props.color}; 
  display: flex;
  opacity: ${props => props.opacity};
  align-items: center;
  justify-content: flex-end;
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
            color={territory.blockadeLevel === BlockadeLevel.NONE ? territory.nation.color : "gray"}
            highlight={this.props.highlight}
            onClick={this.props.onClick}
          >
            <ItemName bold={territory.isCapital()}>{territory.name}<Capital territory={territory} /></ItemName>
            <ForcedDiv width="25px" style={{opacity: territory.blockadeLevel > 0 ? "20%" : "100%"}}><Population amount={territory.POP} /></ForcedDiv>
            <ForcedDiv width="25px" style={{opacity: territory.blockadeLevel > 0 ? "20%" : "100%"}}><Resource amount={territory.RES} /></ForcedDiv>
            <ForcedDiv width="25px" style={{opacity: territory.blockadeLevel > 1 ? "20%" : "100%"}}><Resource amount={territory.RESTransAfrica} color="red"/></ForcedDiv>
            <ForcedDiv width="60px">
            <Chip size="small" label={territory.nation.shortName} />
            </ForcedDiv>
          </Container>
        )}
      </Draggable>
    );
  }
}
