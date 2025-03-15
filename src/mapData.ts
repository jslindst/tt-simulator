import { MapData } from "./components/MapVisualization";

import * as loadedMapData from './mapData.json';

export function findNeighboringRegions(mapData: MapData): Record<string, string[]> {
  const { regions, vertices } = mapData;
  const neighbors: Record<string, string[]> = {};

  // 1. Build a lookup for vertex ID to regions that contain it.  This is more efficient
  //    than searching all regions for every vertex.
  const vertexToRegions: Record<string, string[]> = {};
  for (const region of regions) {
    for (const vertexId of region.vertices) {
      if (!vertexToRegions[vertexId]) {
        vertexToRegions[vertexId] = [];
      }
      vertexToRegions[vertexId].push(region.name);
    }
  }

  for (const region of regions) {
    neighbors[region.name] = []; // Initialize the array for this region

    for (let i = 0; i < region.vertices.length; i++) {
      const vertexId1 = region.vertices[i];
      const vertexId2 = region.vertices[(i + 1) % region.vertices.length]; // Wrap around

      // Find regions that share *both* vertexId1 and vertexId2 (i.e., share an edge)
      const regionsWithVertex1 = vertexToRegions[vertexId1] || [];
      const regionsWithVertex2 = vertexToRegions[vertexId2] || [];

      // Find the intersection of the two sets of regions.
      const sharedRegions = regionsWithVertex1.filter(regionId => regionsWithVertex2.includes(regionId));

      for (const sharedRegionId of sharedRegions) {
        if (sharedRegionId !== region.name && !neighbors[region.name].includes(sharedRegionId)) {
          // Add the neighbor, ensuring no duplicates and not adding itself
          neighbors[region.name].push(sharedRegionId);
        }
      }
    }
  }

  return neighbors;
}

export const mapData = loadedMapData