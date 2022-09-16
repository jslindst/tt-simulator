import React from "react";
import { useState, useRef } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

import { territoriesByName, factions } from "../model/HistoryTracker.ts";
import FactionColumn from "../components/column";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Item from "../components/item";
import styled from "styled-components";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const stateStructure = {
  territories: territoriesByName,
  factions: factions,
  order: Object.keys(factions),
  showOnlyWithResources: true,
};


function AddTerritoryField({ territoryList, onAddTerritory }) {

  const [toClearProperty, setToClearProperty] = useState();

  const onKeyPress = (e) => {
    if (e.keyCode == 13) {

      console.log('value', e.target.value);
      const matches = territoryList.filter((terr) => `${terr.name} (${terr.nation.name})`.match(new RegExp(e.target.value, "gi")));
      console.log(matches);
      if (matches.length === 1) {
        const terr = matches[0];
        setToClearProperty(`${terr.name} (${terr.nation.name})`);
        onAddTerritory(terr);
        /*        setTimeout(
                  () => onAddTerritory(terr), 200
                );*/
      }
    }
  }

  return (
    <Autocomplete
      disablePortal
      key={toClearProperty}
      size="small"
      id="combo-box-demo"
      options={territoryList}
      getOptionLabel={(terr) => `${terr.name} (${terr.nation.name})`}
      renderInput={(params) => <TextField
        {...params}
        label="Add"
        onKeyDown={onKeyPress}
      />}
    />
  );
}



const Container = styled.div`
  display:flex;
`;

class ResourceTracker extends React.Component {
  state = stateStructure;

  onDragStart = start => {
    const homeIndex = this.state.order.indexOf(start.source.droppableId);
    this.setState({
      homeIndex,
    });
  }

  occupyAndUpdate = (territory, occupier) => {
    territory.occupy(occupier);
    const newState = {
      ...this.state,
      territories: structuredClone(territoriesByName),
    }
    this.setState(newState);
  }

  onDragEnd = (result) => {
    this.setState({
      homeIndex: null,
    });

    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId &&
      destination.index === source.index) return;

    const originalFaction = this.state.factions[source.droppableId];
    const newFaction = this.state.factions[destination.droppableId];

    if (originalFaction !== newFaction) {
      const territory = territoriesByName[draggableId];
      this.occupyAndUpdate(territory, newFaction);
    }

  };

  render() {
    const territoriesList = Object.keys(territoriesByName).map(key => territoriesByName[key]).filter(terr => !this.state.showOnlyWithResources || terr.hasResources());
    return (
      <div>
        <DragDropContext
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}>
          <Container>
            {this.state.order.map((id, index) => {
              const faction = this.state.factions[id];
              if (faction === undefined) return <p>Not Found</p>
              return <FactionColumn
                addTerritoryField={<AddTerritoryField
                  territoryList={territoriesList}
                  onAddTerritory={territory => this.occupyAndUpdate(territory, faction)}
                />}
                key={faction.name}
                faction={faction}
                isDropDisabled={this.state.homeIndex === index}
                onlyWithResources={this.state.showOnlyWithResources} />
            })}
          </Container>
        </DragDropContext>
      </div>

    );
  }
}

export default ResourceTracker;
