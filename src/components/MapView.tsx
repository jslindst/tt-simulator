import React, { useState } from 'react';
import MapVisualization, { MapMouseEvent, Point, Region, RegionStyle, VertexStyle } from './MapVisualization';
import { SiteAppBar } from '../pages/SiteAppBar';
import { countryVisualIdentity, landAreaLookup } from '../model/HistoryTracker';
import { findRegionAtPoint } from './MapEditor';
import { findNeighboringRegions, mapData } from 'mapData';

// Example component that uses MapVisualization to display map data
const MapView: React.FC = () => {

  const [selected, setSelected] = useState<(Region | undefined)[]>([])

  // Example function to determine how regions should be colored
  function getRegionColor(region: Region): RegionStyle {

    if (selected.find(r => r?.id === region.id)) {
      return {
        fillColor: 'rgba(255,255,255,1)',
        drawColor: 'rgba(0, 0, 0)',
        drawWidth: 6
      }
    }

    const landArea = landAreaLookup[region.name];
    if (!landArea) return {
      fillColor: 'rgba(255,0,255,1)',
      drawColor: 'rgba(0, 0, 0)',
      drawWidth: 2
    }

    const color = countryVisualIdentity[landArea.Nation].color

    return {
      fillColor: color || 'rgba(200, 200, 200, 0)', // Default color
      drawColor: 'rgba(0, 0, 0)',
      drawWidth: 2
    }
  };

  function getVertexStyle(point: Point): VertexStyle {
    return {
      fillColor: 'rgba(0,0,0,0)',
      drawColor: 'rgba(0,0,0,0)',
    }
  }

  const neighborLookup = findNeighboringRegions(mapData)

  const handleCanvasClick = (event: MapMouseEvent) => {
    const { x, y } = event;

    const regionClicked = findRegionAtPoint(mapData, x, y)
    if (!regionClicked) return;
    const neighbors = neighborLookup[regionClicked.name]
    setSelected(neighbors.map(neighbor => (mapData.regions.find(r => r.name === neighbor))))
  }
  return (
    <div>
      <SiteAppBar title="Tragedy & Triumph - Map View" />
      <div style={{ marginTop: '20px', padding: '0 20px' }}>
        <h2>Game Map View</h2>
        <div style={{ maxWidth: '100%', maxHeight: '100%', overflow: 'auto', border: '1px solid #ccc' }}>
          <MapVisualization
            imageSrc="TTmap2ndEd.jpg"
            regions={mapData.regions}
            vertices={mapData.vertices}
            getRegionStyle={getRegionColor}
            getVertexStyle={getVertexStyle}
            onClick={handleCanvasClick}
            showLabels={false}
          // We're not adding any interactivity in this view-only example
          />
        </div>
      </div>
    </div>
  );
};

export default MapView;