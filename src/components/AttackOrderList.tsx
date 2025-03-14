import React, { Component } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided, // Corrected type import
  DraggableStateSnapshot,
  DroppableProvided, // Corrected type import
  DroppableStateSnapshot
} from '@hello-pangea/dnd';

// --- Helper Functions ---

const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const grid = 4;

// --- Style Functions (Inline Styles) ---

const getItemStyle = (isDragging: boolean, draggableStyle: React.CSSProperties | undefined) => ({ //Corrected
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,
  background: isDragging ? 'lightgreen' : 'grey',
  ...draggableStyle,
} as React.CSSProperties);

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  display: 'flex',
  padding: grid,
  overflow: 'auto',
} as React.CSSProperties);

// --- Component Props and State ---

interface AttackOrderListProps {
  items: string[];
  onOrderChanged: (newOrder: string[]) => void;
}

interface AttackOrderListState {
  itemsList: { id: string; content: string }[];
}

// --- Component ---

export class AttackOrderList extends Component<AttackOrderListProps, AttackOrderListState> {
  constructor(props: AttackOrderListProps) {
    super(props);
    this.state = {
      itemsList: props.items.map(item => ({ id: item, content: item })),
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.itemsList,
      result.source.index,
      result.destination.index
    );

    this.setState({ itemsList: items });
    this.props.onOrderChanged(items.map(item => item.content));
  };

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => ( // Corrected type
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {this.state.itemsList.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => ( // Corrected type
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style  //No cast needed
                      )}
                    >
                      {item.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}