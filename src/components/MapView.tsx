import React from 'react';
import MapVisualization, { Point, Region, RegionStyle, VertexStyle } from './MapVisualization.tsx';
import { mapData } from '../mapData.ts';
import { SiteAppBar } from '../pages/SiteAppBar.tsx';

// Example component that uses MapVisualization to display map data
const MapView: React.FC = () => {
  // Example function to determine how regions should be colored
  function getRegionColor(region: Region): RegionStyle {
    // This is just a sample implementation - in a real app, 
    // you might base this on game state, territory control, etc.
    const regionColors = {
      'Petsamo': 'rgba(255, 0, 0, 0.3)',    // Red
      'Helsinki': 'rgba(0, 0, 255, 0.3)',   // Blue
      'Leningrad': 'rgba(255, 0, 0, 0.3)',  // Red
      'Berlin': 'rgba(128, 128, 128, 0.3)', // Gray
      'Paris': 'rgba(0, 0, 255, 0.3)',      // Blue
      'London': 'rgba(0, 0, 255, 0.3)'      // Blue
    };

    return {
      fillColor: regionColors[region.name] || 'rgba(200, 200, 200, 0)', // Default color
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

  return (
    <div>
      <SiteAppBar title="Tragedy & Triumph - Map View" />
      <div style={{ marginTop: '20px', padding: '0 20px' }}>
        <h2>Game Map View</h2>
        <p>This component demonstrates using the MapVisualization component separately from the editor.</p>
        <div style={{ maxWidth: '100%', maxHeight: '600px', overflow: 'auto', border: '1px solid #ccc' }}>
          <MapVisualization
            imageSrc="TTmap2ndEd.jpg"
            regions={mapData.regions}
            vertices={mapData.vertices}
            getRegionStyle={getRegionColor}
            getVertexStyle={getVertexStyle}
            showLabels={false}
          // We're not adding any interactivity in this view-only example
          />
        </div>
        <p>
          <small>
            Note: This is a view-only representation of the map. The colors represent
            different territories' control as an example of customization.
          </small>
        </p>
      </div>
    </div>
  );
};

export default MapView;