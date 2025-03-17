import React, { useState, useCallback, useEffect } from 'react'; // Import useCallback
import MapVisualization, { MapMouseEvent, Region, RegionStyle } from './MapVisualization';
import { SiteAppBar } from '../pages/SiteAppBar';
import { Faction, factionsByName, territoriesByName, Territory } from '../model/HistoryTracker';
import { findRegionAtPoint } from './MapEditor'; // Make sure you have this export
import { mapData, neighborLookupNoAfrica, neighborLookupWithAfricaRoute } from 'mapData'; // Ensure this path is correct
import { FactionDiv } from './FactionDiv';
import { Box, Button, SxProps, Theme, Typography } from '@mui/material';
import WarStateControls from './WarState';
import { findSuppliedTerritoriesFor, findTradableTerritoriesFor } from 'model/supply';

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

const NO_SUPPY_NO_TRADE: Partial<RegionStyle> = {
  drawColor: 'rgba(150, 0, 0, 1)',
  drawWidth: 12,
  pattern: {
    color1: 'black',
    color2: 'red',
    angle: 45,
    width: 20,
  }
}

const SUPPY_NO_TRADE: Partial<RegionStyle> = {
  drawColor: 'rgba(150, 0, 0, 1)',
  drawWidth: 12,
}

const NO_SUPPLY_TRADE: Partial<RegionStyle> = {
  drawColor: 'black',
  drawWidth: 2,
  pattern: {
    color1: 'black',
    color2: 'red',
    angle: 45,
    width: 20,
  }

}

const SUPPLY_TRADE: Partial<RegionStyle> = {
  drawColor: 'rgba(0, 0, 0, 1)',
  drawWidth: 2,
}

function getRegionStyle(color: string, inOwnersSupply: boolean, inOwnersTrade: boolean): RegionStyle {
  let style: Partial<RegionStyle>;

  if (inOwnersSupply && inOwnersTrade) {
    style = SUPPLY_TRADE;
  } else if (inOwnersSupply && !inOwnersTrade) {
    style = SUPPY_NO_TRADE;
  } else if (!inOwnersSupply && inOwnersTrade) {
    style = NO_SUPPLY_TRADE;
    style.pattern!.color2 = color;
  } else {
    style = NO_SUPPY_NO_TRADE;
    style.pattern!.color2 = color;
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
    const inOwnersTrade = territory.isSea() || resourcesFor.name === "Neutral" || supplyStatusByFaction[resourcesFor.name].tradeable.includes(region.name)

    if (!inOwnersSupply && inOwnersTrade) console.log("S", territory.name)

    let style: RegionStyle = getRegionStyle(color, inOwnersSupply, inOwnersTrade);
    if (territory.isSea() && territory.isOccupied()) {
      return {
        ...style,
        pattern: {
          color1: territory.occupier!.color,
          color2: territory.homeTerritoryOf.color
        },
      };
    }
    if (!territory.isOccupied()) {
      if (territory.nation.isInfluenced()) {
        const faction = factionsByName[territory.nation.influencor()!]
        return {
          ...style,
          pattern: {
            color1: faction.color,
            color2: territory.homeTerritoryOf.color
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
      <SiteAppBar title="Tragedy & Triumph - Map View" />
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
            imageSrc="TTmap2ndEd.jpg"
            regions={mapData.regions}
            vertices={mapData.vertices}
            getRegionStyle={getRegionColor}
            onMouseUp={handleCanvasClick}
            showLabels={false}
          />
        </div>
      </div>
    </div>
  );
};

export default MapView;