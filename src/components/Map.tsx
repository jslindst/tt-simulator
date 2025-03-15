import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface Point {
  x: number;
  y: number;
  id: string;
}

export interface Region {
  name: string;
  vertices: string[];
  id: string;
}

export interface MapData {
  regions: Region[];
  vertices: Point[];
}

type Mode = 'none' | 'add' | 'move' | 'delete' | 'create-region' | 'select-region';

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
  const [isDrawingRegion, setIsDrawingRegion] = useState(false); // Track drawing state

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Drawing Functions ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    // Draw regions (filled and with name)
    regions.forEach(region => {
      if (region.vertices.length < 3) return;
      //Get points:
      let points: Point[] = region.vertices.map(vertexId => vertices.find(v => v.id === vertexId)).filter((vertex): vertex is Point => vertex !== undefined);

      if (points.length < 3) return; //Sanity check.
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();

      // Fill color
      ctx.fillStyle = region.id === selectedRegionId ? 'rgba(255, 255, 0, 0.3)' : region.name.startsWith('Region') ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 128, 255, 0.2)';
      ctx.fill();

      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Calculate centroid and draw name
      let sumX = 0;
      let sumY = 0;
      for (const point of points) {
        sumX += point.x;
        sumY += point.y;
      }
      const centerX = sumX / points.length;
      const centerY = sumY / points.length;

      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(region.name, centerX, centerY);
    });

    // Draw current region (being created)
    if (currentRegionVertices.length > 0) {
      ctx.beginPath();
      let points: Point[] = currentRegionVertices.map(vertexId => vertices.find(v => v.id === vertexId)).filter((vertex): vertex is Point => vertex !== undefined);
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

    // Draw vertices
    vertices.forEach(vertex => {
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 5, 0, 2 * Math.PI);
      let fillColor = 'blue';
      if (vertex.id === selectedVertexId) {
        fillColor = 'yellow';
      } else if (vertex.id === highlightedVertexId) {
        fillColor = (mode === 'delete') ? 'red' : 'cyan';
      }
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.stroke();
    });

  }, [vertices, regions, selectedVertexId, highlightedVertexId, currentRegionVertices, mode, selectedRegionId]);

  useEffect(() => {
    draw();
  }, [draw]);

  // --- Event Handlers ---

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
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
        //Update regions, using Ids
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
      const clickedRegionId = findRegionAtPoint(x, y);
      console.log("clicked", clickedRegionId)
      setSelectedRegionId(clickedRegionId); // Select or deselect
      if (!clickedRegionId) console.log("no region found")
      if (clickedRegionId) {
        let region = regions.find(r => r.id == clickedRegionId);
        if (region) {
          setEditedRegionName(region.name);
        }
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (mode === 'create-region') {
      // Finish drawing (but don't close unless clicked on the first vertex or Esc is pressed)

      if (currentRegionVertices.length > 0 && highlightedVertexId === currentRegionVertices[0]) {
        finishCurrentRegion();
      }
      //setIsDrawingRegion(false); // Moved to handleCanvasMouseMove
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (mode !== 'select-region') {
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
    return `v${Date.now()}-</span>${Math.random().toString(36).substring(2, 8)}`;
  };

  const generateRegionId = (): string => {
    return `r${Date.now()}\-</span>${Math.random().toString(36).substring(2, 8)}`;
  };

  // --- Region Selection and Editing ---

  const findRegionAtPoint = (x: number, y: number): string | null => {
    //Iterate regions in reverse order, for the top most to be selected first.
    for (let i = regions.length - 1; i >= 0; i--) {
      const region = regions[i];
      let points: Point[] = region.vertices.map(vertexId => vertices.find(v => v.id === vertexId)).filter((vertex): vertex is Point => vertex !== undefined);
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
  useEffect(() => {
    // Add event listener for keydown events
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
        <div style={{ position: 'relative' }}>
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Map"
            style={{ display: 'none' }}
            onLoad={draw}
          />
          <canvas
            ref={canvasRef}
            style={{ cursor: mode === 'add' ? 'crosshair' : 'default' }}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          />
        </div>
      </div>
    </div>
  );
};

export default MapEditor;