import React from "react";
import { useState, useRef } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import  { Redirect } from 'react-router-dom'

import { territoriesByName, factions, territoryList } from "../model/HistoryTracker.ts";
import FactionColumn from "../components/column";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import styled from "styled-components";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Territory,Faction } from "../model/HistoryTracker.ts";

import { useNavigate } from "react-router-dom";
import { SiteAppBar } from "./SiteAppBar";

const CHAR_LOOKUP = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!#*';
export const TERRITORIES_WITH_RESOURCES = Object.keys(territoriesByName).map(key => territoriesByName[key]).filter(terr => terr.hasResources());

const stateStructure = {
  territories: territoriesByName,
  factions: factions,
  order: Object.keys(factions),
  highlightedTerritories: [],
};


function AddTerritoryField({ territoryList, onAddTerritory }) {

  const [toClearProperty, setToClearProperty] = useState();

  const onKeyPress = (e) => {
    if (e.keyCode == 13) {
      const territoryName = e.target.value.replace(/\(.*$/, "");
      console.log(territoryName);
      const matches = territoryList.filter(terr => {
        console.log(`"${terr.name} (${terr.nation.name})"`);
        return `${terr.name} (${terr.nation.name})`.match(new RegExp(territoryName, "gi"));
      });
      if (matches.length === 1) {
        const terr = matches[0];
        setToClearProperty(`${terr.name} (${terr.nation.name})`);
        onAddTerritory(terr);
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

function ResetButton() {
  let navigate = useNavigate();

  function handleClick() {
    navigate("/resourceTracker");
    navigate(0);
  }

  return (
    <Button type="button" size="small" color="inherit" onClick={handleClick}>Reset</Button>
  );
}



class ResourceTracker extends React.Component {


  createInitState() {
    const initState = stateStructure;
    return initState;
  }


  constructor() {   
    super();
    this.state = this.createInitState();
    var locationMatch = window.location.search.match(/^\?([a-z0-9#!*|]+)$/i);
    if (locationMatch) {
      console.log("reading state from url");
      this.applyOccupiedStateString(this.state, locationMatch[1]);
    }
  }

  onDragStart = start => {
    const territory = territoriesByName[start.draggableId];
    const highlighted = [];
    console.log(territory);
    if (territory.isCapital()) {
      territory.nation.territories.filter(
        terr => !terr.isGreatPowerHomeTerritory() && !terr.isOccupied()
      ).forEach(terr => highlighted.push(terr.name))
    }

    const newState = {
      ...this.state,
      originFaction: start.source.droppableId,
      highlightedTerritories: highlighted
    };
    //console.log("onDragStart", newState);
    this.setState(newState)
  }

  createOccupiedStateString(stateObject) {
    return Object.keys(stateObject.factions).map(id => {
      return factions[id].territoriesWithResources().filter(terr => terr.isOccupied())
        .map(terr => TERRITORIES_WITH_RESOURCES.findIndex(item => terr.name === item.name))
        .map(index => {
          return CHAR_LOOKUP.charAt(index);
        }).join('');
    }).join("|");
  }

  applyOccupiedStateString(stateObject, string) {
    const occupiedAreas = string.split("|");
    if (occupiedAreas.length !== 4) {
      console.log("cannot read url.");
      return;
    }
    Object.keys(stateObject.factions).forEach((factionKey, index) => {
      const faction = stateObject.factions[factionKey];
      occupiedAreas[index].split('').forEach(char => {
        const territory = TERRITORIES_WITH_RESOURCES[CHAR_LOOKUP.indexOf(char)];
        console.log("url override:", territory, faction);
        stateObject.territories[territory.name].occupy(faction);
      })
    });    
    return stateObject;
  }

  occupyAndUpdate = (territory, occupier, state = this.state) => {
    territory.occupy(occupier);
    const newState = {
      ...state,
      territories: structuredClone(territoriesByName),
    }
    this.setState(newState);
    const territoryStateString = this.createOccupiedStateString(newState);
    window.history.replaceState(null, "Resource Tracker", `?${territoryStateString}`);
  }

  onDragEnd = (result) => {
    const newState = {
      ...this.state,
      originFaction: null,
      highlightedTerritories: []
    }
    this.setState(newState);

    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId &&
      destination.index === source.index) {
      return;
    }
    const originalFaction = this.state.factions[source.droppableId];
    const newFaction = this.state.factions[destination.droppableId];

    if (originalFaction !== newFaction) {
      const territory = territoriesByName[draggableId];
      this.occupyAndUpdate(territory, newFaction, {
        ...this.state,
        highlightedTerritories: []
      });
    }

  };

  render() {
    return (
      <div class="App">
        <SiteAppBar title={"Tragedy & Triumph - Resource Tracker v1.11"} actionButton={
          <ResetButton />
        }/>
        <DragDropContext
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}>
          <Container>
            {this.state.order.map((id, index) => {
              const faction = this.state.factions[id];
              if (faction === undefined) return <p>Not Found</p>
              return <FactionColumn
                addTerritoryField={<AddTerritoryField
                  territoryList={TERRITORIES_WITH_RESOURCES}
                  onAddTerritory={territory => this.occupyAndUpdate(territory, faction)}
                />}
                key={faction.name}
                faction={faction}
                isDropDisabled={this.state.originFaction === faction.name}
                highlightedTerritories={this.state.highlightedTerritories}
              />
            })}
          </Container>
        </DragDropContext>
      </div>

    );
  }
}

export default ResourceTracker;
