import React from "react";
import { Draggable, DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { Resource, Population, Capital } from "./TrackerIcons";
import { Territory, BlockadeLevel } from "../model/HistoryTracker";  // Assuming this is correct
import styled from "styled-components";
import Chip from "@mui/material/Chip";
// import List from "@mui/material/List"; // Not used, so removed

// --- Styled Components ---

// Add type annotations to styled component props
const ItemName = styled.div<{ bold?: boolean }>`  // Corrected type
  width: 125px;
  height: 29px;
  text-align: left;
  display: flex;
  align-items: center;
  margin-right: auto;
  text-decoration: ${props => props.bold ? "underline" : "none"};
`;

const ForcedDiv = styled.div<{ width: string }>` // Corrected type
  width: ${props => props.width};
`;

// Add props type to Container
type ContainerProps = {
  highlight?: boolean;
  color?: string;  // Add the missing color prop
  opacity?: string | number; // opacity can be string or number
  isDragging?: boolean; // This is used, though indirectly through the snapshot
};

const Container = styled.div<ContainerProps>`
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

// --- Component Props ---

// Define the props type for the component
interface TerritoryItemProps {
  territory: Territory; // Assuming territory is passed as a string (name), then create Territory
  index: number;
  highlight?: boolean; // highlight is optional
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void; // Type the onClick handler
}

// --- Component ---

// Use React.FC for functional components
export const TerritoryItem: React.FC<TerritoryItemProps> = (props) => {

  const territory = props.territory;

  return (
    <Draggable
      draggableId={territory.name}
      index={props.index}
    >
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Container
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          isDragging={snapshot.isDragging}
          color={territory.blockadeLevel === BlockadeLevel.NONE ? territory.nation.color : "gray"}
          highlight={props.highlight}
          onClick={props.onClick} // Use the prop directly
        >
          <ItemName bold={territory.isCapital()}>{territory.name}<Capital territory={territory} /></ItemName>
          {territory.blockadeLevel === BlockadeLevel.MED && "(MED)"}
          <ForcedDiv width="25px" style={{ opacity: territory.blockadeLevel > 0 ? "20%" : "100%" }}><Population amount={territory.POP} /></ForcedDiv>
          <ForcedDiv width="25px" style={{ opacity: territory.blockadeLevel > 0 ? "20%" : "100%" }}><Resource amount={territory.RES} /></ForcedDiv>
          <ForcedDiv width="25px" style={{ opacity: territory.blockadeLevel > 1 ? "20%" : "100%" }}><Resource amount={territory.RESTransAfrica} color="red" /></ForcedDiv>
          <ForcedDiv width="60px">
            <Chip size="small" label={territory.nation.shortName} />
          </ForcedDiv>
        </Container>
      )}
    </Draggable>
  );
};
