import React from "react";
import { useState } from "react";

import Button from "@mui/material/Button";

//@ts-ignore
import { territoriesByName as TERRITORIES_BY_NAME, factions as FACTIONS_BY_NAME, Territory } from "../model/HistoryTracker.ts";
import FactionColumn from "../components/column.tsx";
import { DragDropContext } from "@hello-pangea/dnd";
import styled from "styled-components";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { useNavigate } from "react-router-dom";
import { SiteAppBar } from "./SiteAppBar.tsx";

const SEPARATORS = '|:='
const CHAR_LOOKUP = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!#*';
export const TERRITORIES_WITH_RESOURCES = Object.keys(TERRITORIES_BY_NAME).map(key => TERRITORIES_BY_NAME[key]).filter(terr => terr.hasResources());



type ResourceTrackerState = {
  territoriesByName: any,
  factionsByName: any,
  order: string[],
  highlightedTerritories: string[],
  originFaction?: any
};

const stateStructure: ResourceTrackerState = {
  territoriesByName: TERRITORIES_BY_NAME,
  factionsByName: FACTIONS_BY_NAME,
  order: Object.keys(FACTIONS_BY_NAME),
  highlightedTerritories: [],
};


function AddTerritoryField({ territoryList, onAddTerritory }) {

  const [toClearProperty, setToClearProperty] = useState("");

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
      //@ts-ignore
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



class ResourceTracker extends React.Component<{}, ResourceTrackerState> {


  createInitState() {
    const initState = stateStructure;
    return initState;
  }

  constructor(props) {
    super(props);
    this.state = this.createInitState();
    var locationMatch = window.location.search.match(/^\?([a-z0-9#!*|:=%]+)$/i);
    if (locationMatch) {
      const stateUrlUndecoded = decodeURIComponent(locationMatch[1]);
      console.log("reading state from url", stateUrlUndecoded);
      this.applyOccupiedStateString(this.state, stateUrlUndecoded);
    }
  }

  onDragStart = start => {
    const territory = TERRITORIES_BY_NAME[start.draggableId];
    const highlighted: string[] = [];
    console.log(territory);
    if (territory.isCapital()) {
      territory.nation.territories.filter(
        terr => !terr.isGreatPowerHomeTerritory() && !terr.isOccupied()
      ).forEach(terr => highlighted.push(terr.name))
    }

    const newState: ResourceTrackerState = {
      ...this.state,
      originFaction: start.source.droppableId,
      highlightedTerritories: highlighted
    };
    //console.log("onDragStart", newState);
    this.setState(newState)
  }

  territoryToChar(territory: Territory) {
    return CHAR_LOOKUP.charAt(TERRITORIES_WITH_RESOURCES.findIndex(item => territory.name === item.name));
  }

  charToTerritory(char: string) {
    return TERRITORIES_WITH_RESOURCES[CHAR_LOOKUP.indexOf(char)];
  }

  createOccupiedStateString(stateObject: ResourceTrackerState) {
    const occupiedString = Object.keys(stateObject.factionsByName).map(id => {
      return FACTIONS_BY_NAME[id].territoriesWithResources().filter(terr => terr.isOccupied())
        .map(terr => this.territoryToChar(terr))
        .join('');
    }).join("|");
    const oneBlockade = Object.keys(stateObject.territoriesByName).map(id => stateObject.territoriesByName[id]).filter(terr => terr.blockadeLevel === 1);
    const twoBlockade = Object.keys(stateObject.territoriesByName).map(id => stateObject.territoriesByName[id]).filter(terr => terr.blockadeLevel === 2);
    return `${occupiedString}:${oneBlockade.map(terr => this.territoryToChar(terr)).join('')}=${twoBlockade.map(terr => this.territoryToChar(terr)).join('')}`;
  }

  applyOccupiedStateString(stateObject, string) {
    console.log("APPLY")
    const split = string.split(":");

    const occupiedAreas = split[0].split("|");
    if (occupiedAreas.length !== 4) {
      console.log("cannot read url.");
      return;
    }
    Object.keys(stateObject.factionsByName).forEach((factionKey, index) => {
      const faction = stateObject.factionsByName[factionKey];
      occupiedAreas[index].split('').forEach(char => {
        const territory = this.charToTerritory(char);
        stateObject.territoriesByName[territory.name].occupy(faction);
      })
    });
    if (split.length > 1) {
      const blockadeParts = split[1].split("=");
      if (blockadeParts.length < 2) return stateObject;
      blockadeParts[0].split('').forEach(char => stateObject.territoriesByName[this.charToTerritory(char).name].blockadeLevel = 1);
      blockadeParts[1].split('').forEach(char => stateObject.territoriesByName[this.charToTerritory(char).name].blockadeLevel = 2);
    }


    return stateObject;
  }

  blockadeAndUpdate = (territory, blockadeLevel, state = this.state) => {
    if (territory.isNeutral() && !territory.isOccupied()) territory.blockadeLevel = 0;
    else territory.blockadeLevel = blockadeLevel + 1;
    if (territory.blockadeLevel > 1 && territory.RESTransAfrica === 0) territory.blockadeLevel = 0;
    if (territory.blockadeLevel > 2 && territory.RESTransAfrica > 0) territory.blockadeLevel = 0;
    this.updateTerritories();
  }

  updateTerritories = (state = this.state) => {
    const newState = {
      ...state,
      territories: structuredClone(TERRITORIES_BY_NAME),
    }
    this.setState(newState);
    const territoryStateString = this.createOccupiedStateString(newState);
    window.history.replaceState(null, "Resource Tracker", `?${encodeURIComponent(territoryStateString)}`);
  }


  occupyAndUpdate = (territory, occupier, state = this.state) => {
    territory.occupy(occupier);
    this.updateTerritories(state);
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
    const originalFaction = this.state.factionsByName[source.droppableId];
    const newFaction = this.state.factionsByName[destination.droppableId];

    if (originalFaction !== newFaction) {
      const territory = TERRITORIES_BY_NAME[draggableId];
      this.occupyAndUpdate(territory, newFaction, {
        ...this.state,
        highlightedTerritories: []
      });
    }

  };

  render() {
    return (
      <div className="App">
        <SiteAppBar title={"Tragedy & Triumph - Resource Tracker v1.2"} actionButton={
          <ResetButton />
        } />
        <DragDropContext
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}>
          <Container>
            {this.state.order.map((id, index) => {
              const faction = this.state.factionsByName[id];
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
                blockadeUpdateFunction={this.blockadeAndUpdate}
              />
            })}
          </Container>
        </DragDropContext>
      </div>

    );
  }
}

export default ResourceTracker;
