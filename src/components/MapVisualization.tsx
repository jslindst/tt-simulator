import { territoriesByName, Territory } from 'model/HistoryTracker';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { findAdjustedCentroid, getOrCreateNonRepeatingPattern } from 'utils/ctx-utils';


export interface Point {
  x: number;
  y: number;
}

export interface Vertex extends Point {
  id: string;
}

export interface Region {
  name: string;
  vertices: string[];
  id: string;
}

export interface MapData {
  regions: Region[];
  vertices: Vertex[];
}

export type VertexStyle = {
  fillColor: string;
  drawColor: string;
}

export type RegionStyle = Partial<{
  fillColor: string;
  drawColor: string;
  drawWidth: number;
  pattern: {
    colors: string[],
    widths: number[] | number,
    angle?: number,
  }
  font: string,
  text: string,
  dashed: number[]
}>

export interface MapMouseEvent {
  x: number;
  y: number;
  originalEvent: React.MouseEvent<HTMLCanvasElement>;
}

const defaultImage = {
  naturalWidth: 3400,
  naturalHeight: 2200,
  width: 3400,
  height: 2200,
}

interface MapVisualizationProps {
  imageSrc?: string;
  regions: Region[];
  vertices: Vertex[];
  routes?: Region[];
  getRegionStyle?: (region: Region) => RegionStyle;
  getVertexStyle?: (vertex: Vertex) => VertexStyle;
  showLabels?: boolean;
  customRenderFunctions?: ((ctx: CanvasRenderingContext2D) => void)[];
  onClick?: (event: MapMouseEvent) => void;
  onMouseMove?: (event: MapMouseEvent) => void;
  onMouseUp?: (event: MapMouseEvent) => void;
  cursor?: string;
  width?: number | string;
  height?: number | string;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({
  imageSrc,
  regions,
  vertices,
  routes = [],
  getRegionStyle = (region: Region): RegionStyle => { return { fillColor: 'rgba(0, 128, 255, 0.5)', drawColor: 'green', drawWidth: 2 } },
  getVertexStyle,
  showLabels = true,
  customRenderFunctions = [],
  onClick,
  onMouseMove,
  onMouseUp,
  cursor = 'default',
  width = '100%',
  height = 'auto',
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);


  const calculateScale = useCallback(() => {
    console.log("Recalculating Scale");
    const container = containerRef.current;
    const image = imageSrc ? imageRef.current : defaultImage;

    if (container && image) {
      const containerWidth = container.clientWidth;
      const intrinsicScale = containerWidth / image.naturalWidth;
      setScale(intrinsicScale);
    }
  }, [imageSrc]);

  useEffect(() => {
    calculateScale();
    const handleResize = () => { calculateScale(); };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); };
  }, [calculateScale]);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    const image = imageSrc ? imageRef.current : defaultImage;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fix scaling
    const dpr = window.devicePixelRatio || 1; // Get device pixel ratio
    canvas.width = image.naturalWidth * scale * dpr;  // Multiply by DPR
    canvas.height = image.naturalHeight * scale * dpr; // Multiply by DPR
    canvas.style.width = `${image.naturalWidth * scale}px`;   // Set CSS width (original size)
    canvas.style.height = `${image.naturalHeight * scale}px`; // Set CSS height
    ctx.scale(scale * dpr, scale * dpr); // Scale by DPR *and* your zoom scale

    // clear area
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (image !== defaultImage) ctx.drawImage(image as CanvasImageSource, 0, 0);
    if (image === defaultImage) {
      // default background, shown through the picture for unaccessible areas
      const pattern = getOrCreateNonRepeatingPattern({
        pattern: {
          colors: ['rgb(218, 199, 217)', 'rgb(181, 158, 176)'],
          angle: 45,
          widths: [10, 10]
        }
      }, image.width, image.height, ctx);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, image.width, image.height);
    }

    // DRAW PATTERNS & COLOR
    regions.forEach(region => {
      if (region.vertices.length < 3) return;
      const regionStyle = getRegionStyle(region);

      let points: Vertex[] = region.vertices
        .map(vertexId => vertices.find(v => v.id === vertexId))
        .filter((vertex): vertex is Vertex => vertex !== undefined);
      if (points.length < 3) return;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      if (regionStyle.pattern) {
        ctx.fillStyle = getOrCreateNonRepeatingPattern(regionStyle, image.width, image.height, ctx);
      } else {
        ctx.fillStyle = regionStyle.fillColor || 'white';
      }
      ctx.fill();
    });

    // DRAW REGION BOUNDARIES
    regions.forEach(region => {
      if (region.vertices.length < 3) return;
      const regionStyle = getRegionStyle(region);

      let points: Vertex[] = region.vertices
        .map(vertexId => vertices.find(v => v.id === vertexId))
        .filter((vertex): vertex is Vertex => vertex !== undefined);
      if (points.length < 3) return;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();

      ctx.strokeStyle = regionStyle.drawColor || 'white';;
      ctx.lineWidth = regionStyle.drawWidth || 2;;

      // --- Dashed Lines ---
      if (regionStyle.dashed) {
        ctx.setLineDash(regionStyle.dashed); // Use a dash pattern from regionStyle
      } else {
        ctx.setLineDash([]); // Reset to solid line (important!)
      }

      ctx.stroke();

      // --- Reset Line Dash (Important!) ---
      ctx.setLineDash([]); // Reset after drawing each region

      const centroid = findAdjustedCentroid(region, vertices);

      if (regionStyle.text || showLabels) {
        ctx.fillStyle = 'black';
        ctx.font = regionStyle.font || '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const text = (regionStyle.text || region.name).split("\n")
        text.forEach((line, index) => ctx.fillText(line, centroid.x, centroid.y - ((text.length - 1) * 18 / 2) + index * 18))
      }
    });

    customRenderFunctions.forEach(renderFn => renderFn(ctx));

    // DRAW VERTICES
    if (getVertexStyle) vertices.forEach(vertex => {
      const style = getVertexStyle(vertex);
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = style.fillColor;
      ctx.fill();
      ctx.strokeStyle = style.drawColor;
      ctx.stroke();
    });

    // DRAW ROUTES
    if (routes && routes.length > 0) { // path is now just string[] | null
      ctx.beginPath();
      ctx.strokeStyle = 'purple'; // Choose a color
      ctx.lineWidth = 3;

      // --- Draw the path segments ---
      for (let i = 0; i < routes.length - 1; i++) {
        const territory1 = routes[i];
        const territory2 = routes[i + 1];

        if (!territory1 || !territory2) continue;
        const centroid1 = findAdjustedCentroid(territory1, vertices);
        const centroid2 = findAdjustedCentroid(territory2, vertices);

        if (centroid1 && centroid2) {
          ctx.moveTo(centroid1.x, centroid1.y);
          ctx.lineTo(centroid2.x, centroid2.y);
        }
      }
      ctx.stroke(); // Stroke the *entire* path
    }

    // DRAW ICONS
    regions.forEach(region => {
      if (territoriesByName[region.name]?.CityType === 'MainCapital' || territoriesByName[region.name]?.CityType === 'SubCapital') {
        const location = vertices.find(v => v.id === region.name);
        if (location) {
          drawCapital(ctx, { territory: territoriesByName[region.name], x: location.x, y: location.y, scale: 0.8 })
        }
      }
    })
    ctx.setTransform(1, 0, 0, 1, 0, 0);

  }, [regions, vertices, getRegionStyle, getVertexStyle, showLabels, customRenderFunctions, scale]);

  useEffect(() => { draw(); }, [draw]);

  const transformMouseEvent = (event: React.MouseEvent<HTMLCanvasElement>): MapMouseEvent => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, originalEvent: event };
    const rect = canvas.getBoundingClientRect();
    // Calculate x and y relative to canvas, scaled to original image size, NO DPR.
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    return { x, y, originalEvent: event };
  };

  // --- Event Handlers (using transformed events) ---
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (onClick) { onClick(transformMouseEvent(event)); }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (onMouseMove) { onMouseMove(transformMouseEvent(event)); }
  };

  const handleCanvasMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (onMouseUp) { onMouseUp(transformMouseEvent(event)); }
  };

  return (
    <div ref={containerRef} style={{ width, height, position: 'relative' }}>
      {imageSrc && <img
        ref={imageRef}
        src={imageSrc}
        alt="Map"
        style={{ display: 'none' }}
        onLoad={() => {
          calculateScale();
          draw();
        }}
      />}
      <canvas
        ref={canvasRef}
        style={{ cursor, width: '100%', height: '100%' }}
        onClick={handleCanvasClick}        // Use our handlers
        onMouseMove={handleCanvasMouseMove}  // Use our handlers
        onMouseUp={handleCanvasMouseUp}    // Use our handlers
      />
    </div>
  );
};

interface CapitalProps {
  territory: Territory;
  x: number;
  y: number;
  scale?: number;
}

const drawCapital = (ctx: CanvasRenderingContext2D, props: CapitalProps) => {
  const { territory, x, y, scale = 1 } = props;
  ctx.save(); // Save the current context state

  ctx.translate(x, y); // Translate to the center point
  ctx.scale(scale, scale); // Apply scaling

  // Scale down (same as your SVG's scale)
  const internalScale = 0.6;
  ctx.scale(internalScale, internalScale);

  // --- Drawing Logic (Same as before, but with x, y, and scale) ---

  // Draw outer circle (only if main capital)
  if (territory.isMainCapital()) {
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, 2 * Math.PI);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw middle circle
  ctx.beginPath();
  ctx.arc(0, 0, 65, 0, 2 * Math.PI);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw inner circle
  ctx.beginPath();
  ctx.arc(0, 0, 55, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw star polygon
  const points = "0,-50 29.39,40.45 -47.55,-15.45 47.55,-15.45 -29.39,40.45";
  const pointsArray = points.split(' ').map(p => p.split(',').map(Number));

  ctx.beginPath();
  ctx.moveTo(pointsArray[0][0], pointsArray[0][1]);
  for (let i = 1; i < pointsArray.length; i++) {
    ctx.lineTo(pointsArray[i][0], pointsArray[i][1]);
  }
  ctx.closePath();
  ctx.fillStyle = territory.isMainCapital() ? territory.startingFaction().darkTone : territory.startingFaction().color
  ctx.strokeStyle = territory.isMainCapital() ? territory.startingFaction().darkTone : territory.startingFaction().color
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke(); // Stroke the star

  ctx.restore(); // Restore the context to its original state
};

export default MapVisualization;

