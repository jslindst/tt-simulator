import React, { useState, useCallback, useEffect } from 'react'; // Import useCallback
import MapVisualization, { MapMouseEvent, Region, RegionStyle } from './MapVisualization';
import { SiteAppBar } from '../pages/SiteAppBar';
import { BlockadeLevel, Faction, factionsByName, territoriesByName, Territory } from '../model/HistoryTracker';
import { findRegionAtPoint } from './MapEditor'; // Make sure you have this export
import { mapData, neighborLookupNoAfrica, neighborLookupWithAfricaRoute } from 'mapData'; // Ensure this path is correct
import { FactionDiv } from './FactionDiv';
import { Box, Button, SxProps, Theme, Typography } from '@mui/material';
import WarStateControls from './WarState';
import { findSuppliedTerritoriesFor, findTradableTerritoriesFor } from 'model/supply';
import chroma from "chroma-js";

export type TerritoryState = {
  territoriesByName: { [key: string]: Territory };
  factionsByName: { [key: string]: Faction };
}

const initialState: TerritoryState = {
  territoriesByName: territoriesByName,
  factionsByName: factionsByName,
}

export type SupplyStatus = {
  supplied: string[]
  tradeable: string[]
  tradeableMED: string[]
}

const MED_BLOCKED: Partial<RegionStyle> = {
  drawColor: 'rgba(150, 0, 0, 1)',
  drawWidth: 6,
  text: "MED BLOCKED"
}

const BLOCKED: Partial<RegionStyle> = {
  drawColor: 'rgba(150, 0, 0, 1)',
  drawWidth: 12,
}

const UNSUPPLIED: Partial<RegionStyle> = {
  pattern: {
    colors: ['black'],
    angle: 45,
    widths: 20,
  }
}

const OK: Partial<RegionStyle> = {
  drawColor: 'rgba(0, 0, 0, 1)',
  drawWidth: 2,
}

function getRegionStyle(color: string, inOwnersSupply: boolean, blockade: number): RegionStyle {
  let style: Partial<RegionStyle> = { ...OK }

  if (!inOwnersSupply) {
    style = { ...style, ...UNSUPPLIED }
    style.pattern!.colors[1] = color;
  }
  if (blockade === BlockadeLevel.FULL) {
    style = { ...style, ...BLOCKED }
  } else if (blockade === BlockadeLevel.MED) {
    style = { ...style, ...MED_BLOCKED }
  }

  return {
    ...style,  // Merge with any other default styles
    fillColor: color, // Assuming 'color' is defined elsewhere
  };
}


const MapView: React.FC = () => {
  const [myState, setMyState] = useState<TerritoryState>(initialState);
  const [currentFaction, setCurrentFaction] = useState<string>("Axis");
  const [currentMode, setCurrentMode] = useState<"Influence" | "Control">("Influence");

  const getRegionColor = useCallback((region: Region): RegionStyle => {
    const territory = myState.territoriesByName[region.name];

    const controller = territory.controlledBy();
    const resourcesFor = (territory.resourcesForFaction() || myState.factionsByName.Neutral);

    const color = resourcesFor.color;
    const inOwnersSupply = territory.isSea() || !controller || controller.name === "Neutral" || supplyStatusByFaction[controller.name].supplied.includes(region.name)


    const inOwnersTradeTRANS = territory.isSea() || resourcesFor.name === "Neutral" || supplyStatusByFaction[resourcesFor.name].tradeable.includes(region.name)
    const inOwnersTradeMED = territory.isSea() || resourcesFor.name === "Neutral" || supplyStatusByFaction[resourcesFor.name].tradeableMED.includes(region.name)

    const blockade = inOwnersTradeMED ? BlockadeLevel.NONE : inOwnersTradeTRANS ? BlockadeLevel.MED : BlockadeLevel.FULL;

    let style: RegionStyle = getRegionStyle(color, inOwnersSupply, blockade);
    if (territory.isSea() && territory.isOccupied()) {
      return {
        ...style,
        fillColor: chroma.mix(territory.occupier!.color, territory.homeTerritoryOf.color).hex()
      };
    }
    if (!territory.isOccupied()) {
      const nation = territory.nation
      if (nation.isInfluenced()) {
        const faction = factionsByName[nation.influencor()!]
        return {
          ...style,
          pattern: {
            colors: [faction.color, territory.homeTerritoryOf.color],
            widths: [nation.influenceCount() * 34, 34 * (3 - nation.influenceCount())]
          },
        }
      }
    }
    return style;
  }, [myState]);

  const supplyStatusByFaction: { [key: string]: SupplyStatus } = {}

  Object.keys(myState.factionsByName).map((name, index) => {
    const faction = myState.factionsByName[name];
    supplyStatusByFaction[name] = {
      supplied: findSuppliedTerritoriesFor(faction, myState, neighborLookupWithAfricaRoute),
      tradeable: findTradableTerritoriesFor(faction, myState, neighborLookupWithAfricaRoute),
      tradeableMED: findTradableTerritoriesFor(faction, myState, neighborLookupNoAfrica),
    }
  })

  const handleCanvasClick = (event: MapMouseEvent) => {
    const { x, y } = event;

    const regionClicked = findRegionAtPoint(mapData, x, y);
    if (!regionClicked) return;

    const territory = territoriesByName[regionClicked.name];
    if (!territory) {
      console.warn(`Territory not found: ${regionClicked.name}`);
      return;
    }
    const faction = factionsByName[currentFaction]

    if (currentMode === 'Control') {
      territory.occupy(faction);
    } else if (currentMode === 'Influence') {
      territory.nation.addInfluence(faction)
    }

    setMyState((oldState) => {
      const newTerritoriesByName = { ...oldState.territoriesByName };
      return {
        ...oldState,
        territoriesByName: newTerritoriesByName,
      };
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'a':
          setCurrentFaction('Axis');
          break;
        case 'w':
          setCurrentFaction('West');
          break;
        case 'u':
          setCurrentFaction('USSR');
          break;
        case 'n':
          setCurrentFaction('Neutral');
          break;

        case 'i':
          setCurrentMode('Influence');
          break;
        case 'c':
          setCurrentMode('Control');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentFaction]);

  const warStateUpdater = (faction1: string, faction2: string, state: "WAR" | "PEACE") => {
    setMyState((oldState) => {
      const f1 = oldState.factionsByName[faction1];
      const f2 = oldState.factionsByName[faction2];
      if (state === "WAR") f1.declareDoW(f2);
      else f1.removeDow(f2)
      return {
        ...oldState,
        factionsByName: oldState.factionsByName
      };
    })
  }

  const factions = Object.keys(myState.factionsByName).map(name => myState.factionsByName[name]);


  const selectedStyle: SxProps<Theme> = {
    backgroundColor: '#B2D7FF', border: 2, color: 'black'
  }

  return (
    <div>
      <SiteAppBar title="Tragedy & Triumph - Map Resource Tracker v1.0" />
      <div style={{ marginTop: '20px', padding: '0 20px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: '100%', justifyContent: 'center', gap: 2, alignItems: 'center' }}>
          <WarStateControls faction1="Axis" faction2="West" onWarChange={warStateUpdater} />
          <WarStateControls faction1="Axis" faction2="USSR" onWarChange={warStateUpdater} />
          <WarStateControls faction1="West" faction2="USSR" onWarChange={warStateUpdater} />

        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: '100%', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: '100%', justifyContent: 'center', gap: 2, alignItems: 'center' }}>
            <Button size='small' sx={{ ...(currentMode === "Influence" ? selectedStyle : {}) }} onClick={() => setCurrentMode('Influence')} variant='contained'>Influence [I]</Button>
            <Button size='small' sx={{ ...(currentMode === "Control" ? selectedStyle : {}) }} onClick={() => setCurrentMode('Control')} variant='contained'>Control [C]</Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: '100%', justifyContent: 'center', alignItems: 'center', marginRight: 2, marginLeft: 2 }}>
            {factions.filter(f => f.name !== "Neutral").map((faction, index) => <Box key={index} sx={{ backgroundColor: faction.color }}>
              <FactionDiv faction={faction} supplyStatus={supplyStatusByFaction[faction.name]} />

            </Box>)}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: '100%', justifyContent: 'center', gap: 2, alignItems: 'center' }}>
            <Button size='small' sx={{ ...(currentFaction === "Axis" ? selectedStyle : {}) }} onClick={() => setCurrentFaction("Axis")} variant='contained'>Axis [A]</Button>
            <Button size='small' sx={{ ...(currentFaction === "West" ? selectedStyle : {}) }} onClick={() => setCurrentFaction("West")} variant='contained'>West [W]</Button>
            <Button size='small' sx={{ ...(currentFaction === "USSR" ? selectedStyle : {}) }} onClick={() => setCurrentFaction("USSR")} variant='contained'>USSR [U]</Button>
            <Button size='small' sx={{ ...(currentFaction === "Neutral" ? selectedStyle : {}) }} onClick={() => setCurrentFaction("Neutral")} variant='contained'>Neutral [N]</Button>
          </Box></Box>
        <div style={{ maxWidth: '100%', maxHeight: '100%', overflow: 'auto', border: '1px solid #ccc' }}>
          <MapVisualization
            regions={mapData.regions}
            vertices={mapData.vertices}
            getRegionStyle={getRegionColor}
            onMouseUp={handleCanvasClick}
            showLabels={true}
          />
        </div>
      </div>
    </div>
  );
};

const WarStateControls: React.FC<{ faction1: string, faction2: string, onWarChange: (faction1: string, faction2: string, state: "WAR" | "PEACE") => void }> = ({
  faction1,
  faction2,
  onWarChange
}) => {
  const [toggleState, setToggleState] = useState<boolean>(false);

  const handleToggleWar = (
    newValue: boolean
  ) => {
    setToggleState(newValue)
    const newState = newValue ? "WAR" : "PEACE";
    onWarChange(faction1, faction2, newState);
  };

  return (
    <Box >
      <FormGroup sx={{ display: "flex", flexDirection: "row" }}> {/* Group the switches */}
        <FormControlLabel
          control={
            <Switch
              checked={toggleState}
              onChange={(e) => handleToggleWar(e.target.checked)}
              name="axisVsWest"
            />
          }
          label={`${faction1} & ${faction2} ` + (toggleState ? "War" : "Peace")}
        />
      </FormGroup>
    </Box>
  );
};

interface FactionDivProps {
  faction: Faction;
  supplyStatus?: SupplyStatus;
}

export const FactionDiv: React.FC<FactionDivProps> = ({ faction, supplyStatus }) => {
  if (!faction.isPlayable) return <></>
  return (
    <div style={{ padding: "4px", display: "flex", justifyContent: "flex-end" }}>
      <div style={{ width: "125px", padding: "3px", fontSize: "20px", fontWeight: "bold", marginRight: "auto" }}>{faction.name}</div>
      <div style={{ width: "25px" }}><Population amount={faction.POP(supplyStatus)} /></div>
      <div style={{ width: "25px" }}><Resource amount={faction.RES(supplyStatus)} /></div>
      <div style={{ width: "25px" }}><Resource color="red" amount={faction.RESTransAfrica(supplyStatus)} /></div>
      <div style={{ width: "25px" }} />
    </div>
  );
};

export default MapView;