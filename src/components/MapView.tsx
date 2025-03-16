import React, { useState, useCallback, useEffect } from 'react'; // Import useCallback
import MapVisualization, { MapMouseEvent, Region, RegionStyle } from './MapVisualization';
import { SiteAppBar } from '../pages/SiteAppBar';
import { Faction, factionsByName, findTerritoriesInSupply, territoriesByName, Territory } from '../model/HistoryTracker';
import { findRegionAtPoint } from './MapEditor'; // Make sure you have this export
import { mapData, neighborLookupNoAfrica, neighborLookupWithAfricaRoute } from 'mapData'; // Ensure this path is correct
import { FactionDiv } from './FactionDiv';
import { Box } from '@mui/material';
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

const MapView: React.FC = () => {
  const [myState, setMyState] = useState<TerritoryState>(initialState);
  const [currentFaction, setCurrentFaction] = useState<string>("Axis");

  const getRegionColor = useCallback((region: Region): RegionStyle => {
    const territory = myState.territoriesByName[region.name];

    const resourcesFor = (territory.resourcesForFaction() || myState.factionsByName.Neutral);

    const color = resourcesFor.color;
    const inOwnersSupply = territory.isSea() || resourcesFor.name === "Neutral" || supplyStatusByFaction[resourcesFor.name].supplied.includes(region.name)
    const inOwnersTrade = territory.isSea() || resourcesFor.name === "Neutral" || supplyStatusByFaction[resourcesFor.name].tradeable.includes(region.name)

    let style: RegionStyle = {
      drawColor: inOwnersSupply ? inOwnersTrade ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 150, 1)' : 'rgba(150, 0, 0, 1)',
      drawWidth: inOwnersSupply ? inOwnersTrade ? 2 : 5 : 10,
      text: territory.controlledBy()?.name,
      fillColor: color
    }
    if (territory.isSea() && territory.isOccupied()) {
      return {
        ...style,
        pattern: {
          color1: territory.occupier!.color,
          color2: territory.homeTerritoryOf.color
        },
      };
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

    setMyState((oldState) => {
      const newTerritoriesByName = { ...oldState.territoriesByName };
      const territory = newTerritoriesByName[regionClicked.name];

      if (!territory) {
        console.warn(`Territory not found: ${regionClicked.name}`);
        return oldState;
      }
      territory.occupy(factionsByName[currentFaction]);
      newTerritoriesByName[regionClicked.name] = territory;
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

  return (
    <div>
      <SiteAppBar title="Tragedy & Triumph - Map View" />
      <div style={{ marginTop: '20px', padding: '0 20px' }}>
        <h2>Game Map View</h2>
        <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: '100%', justifyContent: 'center' }}>
          <WarStateControls faction1="Axis" faction2="West" onWarChange={warStateUpdater} />
          <WarStateControls faction1="Axis" faction2="USSR" onWarChange={warStateUpdater} />
          <WarStateControls faction1="West" faction2="USSR" onWarChange={warStateUpdater} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: '100%', justifyContent: 'center' }}>
          {currentFaction}
          {Object.keys(myState.factionsByName).map((name, index) => <Box key={index} sx={{ backgroundColor: myState.factionsByName[name].color }}>
            <FactionDiv faction={myState.factionsByName[name]} supplyStatus={supplyStatusByFaction[name]} />
          </Box>)}
        </Box>
        <div style={{ maxWidth: '100%', maxHeight: '100%', overflow: 'auto', border: '1px solid #ccc' }}>
          <MapVisualization
            imageSrc="TTmap2ndEd.jpg"
            regions={mapData.regions}
            vertices={mapData.vertices}
            getRegionStyle={getRegionColor}
            onClick={handleCanvasClick}
            showLabels={true}
          />
        </div>
      </div>
    </div>
  );
};

export default MapView;