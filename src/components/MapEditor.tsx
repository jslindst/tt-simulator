import React, { useState, useEffect, useRef, useCallback } from 'react';
import MapVisualization, { Point, Region, MapData, RegionStyle, VertexStyle } from './MapVisualization.tsx';

type Mode = 'none' | 'add' | 'move' | 'delete' | 'create-region' | 'select-region' | 'split-edge'; // Added split-edge mode


// --- Region Selection and Editing ---
const findRegionAtPoint = (data: MapData, x: number, y: number): string | null => {
  for (let i = data.regions.length - 1; i >= 0; i--) {
    const region = data.regions[i];
    let points: Point[] = region.vertices.map(vertexId => data.vertices.find(v => v.id === vertexId)).filter((vertex): vertex is Point => vertex !== undefined);
    if (isPointInPolygon(x, y, points)) {
      return region.id;
    }
  }
  return null;
};

const isPointInPolygon = (x: number, y: number, vertices: Point[]): boolean => {
  let isInside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;

    const intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
};

const MapEditor: React.FC = () => {
  const [imageSrc] = useState<string>('TTmap2ndEd.jpg'); // YOUR IMAGE URL
  const [vertices, setVertices] = useState<Point[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [mode, setMode] = useState<Mode>('add');
  const [selectedVertexId, setSelectedVertexId] = useState<string | null>(null);
  const [highlightedVertexId, setHighlightedVertexId] = useState<string | null>(null);
  const [nextRegionName, setNextRegionName] = useState<string>('Region 1');
  const [currentRegionVertices, setCurrentRegionVertices] = useState<string[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [editedRegionName, setEditedRegionName] = useState<string>('');
  const [isDrawingRegion, setIsDrawingRegion] = useState<boolean>(false); // Track drawing state

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom render functions for MapEditor
  function getRegionFillStyle(region: Region): RegionStyle {
    return {
      fillColor: region.id === selectedRegionId
        ? 'rgba(255, 255, 0, 0.3)'
        : region.name.startsWith('Region')
          ? 'rgba(255, 0, 0, 0.2)'
          : 'rgba(0, 128, 255, 0.2)',
      drawColor: 'green',
      drawWidth: 2
    }
  }

  function getVertexFillStyle(vertex: Point): VertexStyle {
    return {
      fillColor: vertex.id === selectedVertexId ? 'yellow' : vertex.id === highlightedVertexId ? (mode === 'delete' ? 'red' : 'cyan') : 'blue',
      drawColor: 'black'
    }
  };

  // Custom rendering for the current region being created
  const renderCurrentRegion = useCallback((ctx: CanvasRenderingContext2D) => {
    if (currentRegionVertices.length > 0) {
      ctx.beginPath();
      let points: Point[] = currentRegionVertices
        .map(vertexId => vertices.find(v => v.id === vertexId))
        .filter((vertex): vertex is Point => vertex !== undefined);

      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [currentRegionVertices, vertices]);

  // --- Event Handlers ---
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.target as HTMLCanvasElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (mode === 'add') {
      const newVertex: Point = { x, y, id: generateVertexId() };
      setVertices([...vertices, newVertex]);
    } else if (mode === 'move') {
      if (selectedVertexId === null) {
        if (highlightedVertexId !== null) {
          setSelectedVertexId(highlightedVertexId);
        }
      } else {
        const updatedVertices = vertices.map(vertex =>
          vertex.id === selectedVertexId ? { ...vertex, x, y } : vertex
        );
        setVertices(updatedVertices);

        // Update regions, using IDs
        const newRegions = [...regions];
        newRegions.forEach(region => {
          region.vertices = region.vertices.map(vertexId => {
            let vertex = updatedVertices.find(v => v.id === vertexId);
            if (vertex == undefined) return "";
            return vertex.id;
          }).filter(item => item !== null && item !== undefined && item !== "") as string[];
        });
        setRegions(newRegions.filter(r => r.vertices.length >= 3));

        setSelectedVertexId(null);
        setHighlightedVertexId(null);
      }
    } else if (mode === 'delete') {
      if (highlightedVertexId !== null) {
        //Remove vertex
        setVertices(vertices.filter(vertex => vertex.id !== highlightedVertexId));

        // Remove the vertex from any region:
        const newRegions = [...regions];
        newRegions.forEach(region => {
          region.vertices = region.vertices.filter(vId => vId !== highlightedVertexId);
        });

        // Remove empty regions or with less than 3 vertices
        setRegions(newRegions.filter(region => region.vertices.length >= 3));

        setSelectedVertexId(null);
        setHighlightedVertexId(null);
      }
    } else if (mode === 'create-region') {
      if (highlightedVertexId !== null) {
        // Start/Continue drawing
        setIsDrawingRegion(true);
        if (!currentRegionVertices.includes(highlightedVertexId)) {
          setCurrentRegionVertices([...currentRegionVertices, highlightedVertexId]);
        }
      }
    } else if (mode === 'select-region') {
      const clickedRegionId = findRegionAtPoint({ vertices, regions }, x, y);
      setSelectedRegionId(clickedRegionId);
      if (clickedRegionId) {
        let region = regions.find(r => r.id == clickedRegionId);
        if (region) {
          setEditedRegionName(region.name);
        }
      }
    } else if (mode === 'split-edge') {
      splitEdgeAtPoint(x, y);
    }
  };

  const handleCanvasMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'create-region') {
      // Finish drawing (but don't close unless clicked on the first vertex or Esc is pressed)

      if (currentRegionVertices.length > 0 && highlightedVertexId === currentRegionVertices[0]) {
        finishCurrentRegion();
      }
      //setIsDrawingRegion(false); // Moved to handleCanvasMouseMove
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.target as HTMLCanvasElement;

    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (mode !== 'select-region' && mode !== 'split-edge') {
      const closestVertexId = findClosestVertexId(x, y);
      setHighlightedVertexId(closestVertexId);
    } else {
      setHighlightedVertexId(null);
    }

    // Continue drawing if mouse is down and in create-region mode
    if (isDrawingRegion && mode === 'create-region' && highlightedVertexId) {
      if (!currentRegionVertices.includes(highlightedVertexId)) {
        setCurrentRegionVertices([...currentRegionVertices, highlightedVertexId]);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && mode === 'create-region') {
      setIsDrawingRegion(false);
      setCurrentRegionVertices([]);
    }
  };
  //Helper to finish region
  const finishCurrentRegion = () => {
    console.log("Finishing current region")
    setMode('none')
    setIsDrawingRegion(false);
    if (currentRegionVertices.length < 3) {
      alert("Regions must have at least 3 vertices.");
      return;
    }
    const newRegion: Region = {
      name: nextRegionName,
      vertices: currentRegionVertices,
      id: generateRegionId(),
    };
    setRegions([...regions, newRegion]);
    setCurrentRegionVertices([]);
    setNextRegionName(`Region ${regions.length + 2}`);
  }

  // Helper function to find the closest vertex ID
  const findClosestVertexId = (x: number, y: number): string | null => {
    let closestId: string | null = null;
    let minDistance = Infinity;

    vertices.forEach(vertex => {
      const distance = Math.sqrt((vertex.x - x) ** 2 + (vertex.y - y) ** 2);
      if (distance < 15 && distance < minDistance) {
        minDistance = distance;
        closestId = vertex.id;
      }
    });
    return closestId;
  };

  const generateVertexId = (): string => {
    return `v${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  };

  const generateRegionId = (): string => {
    return `r${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  };

  const handleRegionNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedRegionName(event.target.value);
  };

  const handleUpdateRegionName = () => {
    if (selectedRegionId) {
      const updatedRegions = regions.map(region =>
        region.id === selectedRegionId ? { ...region, name: editedRegionName } : region
      );
      setRegions(updatedRegions);
      setSelectedRegionId(null);
      setEditedRegionName('');
    }
  };

  const handleDeleteRegion = () => {
    if (selectedRegionId) {
      setRegions(regions.filter(region => region.id !== selectedRegionId));
      setSelectedRegionId(null);
      setEditedRegionName('');
    }
  };

  const handleDownload = () => {
    const mapData: MapData = { regions, vertices };
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(mapData)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "map-data.json";
    link.click();
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          console.error("Loaded file is not a string.");
          return
        }
        const loadedData: MapData = JSON.parse(text);
        setRegions(loadedData.regions);
        setVertices(loadedData.vertices);
      } catch (error) {
        console.error("Error loading or parsing JSON:", error);
        alert("Failed to load map data.  See console for details.");
      }
    };
    reader.readAsText(file);
  };

  // --- Split Edge Logic ---

  const splitEdgeAtPoint = (x: number, y: number) => {
    let closestEdges: { regionId: string; vertexIndex1: number; vertexIndex2: number }[] = [];
    let minDistance = Infinity;

    // Iterate through all regions and their edges
    for (const region of regions) {
      for (let i = 0; i < region.vertices.length; i++) {
        const vertexId1 = region.vertices[i];
        const vertexId2 = region.vertices[(i + 1) % region.vertices.length]; // Wrap around
        const vertex1 = vertices.find(v => v.id === vertexId1);
        const vertex2 = vertices.find(v => v.id === vertexId2);

        if (!vertex1 || !vertex2) continue; // Skip if vertices not found

        const distance = pointToLineDistance(x, y, vertex1.x, vertex1.y, vertex2.x, vertex2.y);

        if (distance < 10) { // 10 pixel tolerance - collect *all* close edges
          if (distance < minDistance) minDistance = distance; //Keep track of minimum.

          closestEdges.push({
            regionId: region.id,
            vertexIndex1: i,
            vertexIndex2: (i + 1) % region.vertices.length,
          });
        }
      }
    }
    //Filter edges by minimum distance
    closestEdges = closestEdges.filter(edge => {
      const vertex1 = vertices.find(v => v.id === regions.find(r => r.id === edge.regionId)?.vertices[edge.vertexIndex1]);
      const vertex2 = vertices.find(v => v.id === regions.find(r => r.id === edge.regionId)?.vertices[edge.vertexIndex2]);

      if (!vertex1 || !vertex2) return false;

      const distance = pointToLineDistance(x, y, vertex1.x, vertex1.y, vertex2.x, vertex2.y);
      return Math.abs(distance - minDistance) < 0.001; //Floating point comparison.

    });

    if (closestEdges.length > 0) {
      // 1. Create the new vertex
      const newVertex: Point = { x, y, id: generateVertexId() };
      setVertices([...vertices, newVertex]);

      // 2. Update *all* affected regions
      const updatedRegions = regions.map(region => {
        // Find if this region has a matching edge
        const matchingEdge = closestEdges.find(edge => edge.regionId === region.id);

        if (matchingEdge) {
          // Insert the new vertex ID into the vertices array
          const newVertices = [...region.vertices];
          newVertices.splice(matchingEdge.vertexIndex2, 0, newVertex.id); // Insert *before* vertex2
          return { ...region, vertices: newVertices };
        }
        return region;
      });
      setRegions(updatedRegions);
    }
  };

  // Helper function: Calculate distance from point to line segment
  const pointToLineDistance = (x: number, y: number, x1: number, y1: number, x2: number, y2: number): number => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    }
    else if (param > 1) {
      xx = x2;
      yy = y2;
    }
    else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
  useEffect(() => {
    // Add event listener for keydown events
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mode === 'create-region') {
        setIsDrawingRegion(false);
        setCurrentRegionVertices([]);
      }

      // Check if the active element is an input field
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');

      // Only process shortcuts if an input isn't focused
      if (!isInputFocused) {
        switch (event.key.toLowerCase()) {
          case 'a':
            setMode('add');
            break;
          case 'm':
            setMode('move');
            break;
          case 'd':
            setMode('delete');
            break;
          case 'c':
            setMode('create-region');
            setIsDrawingRegion(false);
            break;
          case 's':
            setMode('select-region');
            break;
          case 'e':
            setMode('split-edge');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode, currentRegionVertices]); // Add dependencies

  return (
    <div>
      {/* Fixed Toolbar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', background: 'white', zIndex: 1000, padding: '10px' }}>
        <button onClick={() => setMode('add')} disabled={mode === 'add'}>Add Vertex</button>
        <button onClick={() => setMode('move')} disabled={mode === 'move'}>Move Vertex</button>
        <button onClick={() => setMode('delete')} disabled={mode === 'delete'}>Delete Vertex</button>
        <button
          onClick={() => {
            if (mode !== 'create-region') {
              setMode('create-region');
              setIsDrawingRegion(false); // Ensure drawing is off when switching mode
            }
          }}
          disabled={mode === 'create-region'}
        >
          Create Region {isDrawingRegion ? '(Drawing)' : ''} {/* Show drawing status */}
        </button>
        <button onClick={() => setMode('select-region')} disabled={mode === 'select-region'}>Select Region</button>
        <button onClick={() => setMode('split-edge')} disabled={mode === 'split-edge'}>Split Edge</button> {/* New button */}
        <button onClick={handleDownload}>Download JSON</button>
        <input type="file" accept=".json" onChange={handleLoad} />
        <div>Current Mode: {mode}</div>

        {/* Region Editing UI */}
        {mode === 'select-region' && selectedRegionId && (
          <div>
            <input type="text" value={editedRegionName} onChange={handleRegionNameChange} />
            <button onClick={handleUpdateRegionName}>Update Name</button>
            <button onClick={handleDeleteRegion}>Delete Region</button>
          </div>
        )}

        {mode === 'create-region' && (
          <div>
            Next Region Name:
            <input
              type="text"
              value={nextRegionName}
              onChange={(e) => setNextRegionName(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Scrollable Container */}
      <div ref={containerRef} style={{ overflow: 'auto', marginTop: '100px' }}>
        <MapVisualization
          imageSrc={imageSrc}
          regions={regions}
          vertices={vertices}
          getRegionStyle={getRegionFillStyle}
          getVertexStyle={getVertexFillStyle}
          customRenderFunctions={[renderCurrentRegion]}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          cursor={mode === 'add' ? 'crosshair' : mode === 'split-edge' ? 'crosshair' : 'default'}
        />
      </div>
    </div>
  );
};

export default MapEditor;