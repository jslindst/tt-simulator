import { Box } from '@mui/material';
import { territoriesByName, Territory } from 'model/HistoryTracker';
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

const patternCache = new Map();

function getOrCreateNonRepeatingPattern(
  regionStyle: RegionStyle,
  imageWidth: number,
  imageHeight: number,
  ctx: CanvasRenderingContext2D
) {
  if (!regionStyle.pattern || !regionStyle.pattern.colors) return null;

  const { colors, angle = 0 } = regionStyle.pattern;
  let widths = regionStyle.pattern.widths; // Might be a number or an array

  if (colors.length === 0) return null;

  // --- Handle single width value ---
  if (typeof widths === 'number') {
    widths = Array(colors.length).fill(widths); // Create an array filled with the single width
  } else if (!widths || widths.length === 0) {
    return null; //or default width, if it is not defined.
  }

  // Create a unique key for caching.
  const key = `${colors.join('-')}-${widths.join('-')}-${angle}-${imageWidth}-${imageHeight}`;
  if (patternCache.has(key)) {
    return patternCache.get(key);
  }

  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = imageWidth;
  patternCanvas.height = imageHeight;
  const patternCtx = patternCanvas.getContext('2d');
  if (!patternCtx) return null;

  patternCtx.rotate((angle * Math.PI) / 180);

  const diagonal = Math.sqrt(imageWidth * imageWidth + imageHeight * imageHeight);

  // Calculate the total width of one repetition of the pattern
  let totalPatternWidth = 0;
  for (const width of widths) {
    totalPatternWidth += width;
  }

  // Calculate the number of stripes needed to cover the diagonal
  const numStripes = Math.ceil(diagonal / totalPatternWidth);

  let currentX = -numStripes * totalPatternWidth; // Start off-screen to the left

  // Draw the stripes
  for (let i = -numStripes; i <= numStripes; i++) { // Iterate enough times to cover the diagonal
    let colorIndex = 0;
    let widthIndex = 0;
    let stripeStartX = currentX;

    while (stripeStartX < currentX + totalPatternWidth) {
      patternCtx.fillStyle = colors[colorIndex % colors.length];
      const currentWidth = widths[widthIndex % widths.length];
      patternCtx.fillRect(stripeStartX, -diagonal, currentWidth, diagonal * 3); // Draw extra-long stripes

      stripeStartX += currentWidth;
      colorIndex++;
      widthIndex++;
    }
    currentX += totalPatternWidth
  }

  patternCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformations

  const pattern = ctx.createPattern(patternCanvas, 'no-repeat');
  if (!pattern) return null;

  patternCache.set(key, pattern);
  return pattern;
}

// --- NEW: Custom Event Interfaces ---
export interface MapMouseEvent {
  x: number;
  y: number;
  originalEvent: React.MouseEvent<HTMLCanvasElement>; // Keep a reference to original
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
  vertices: Point[];
  getRegionStyle?: (region: Region) => RegionStyle;
  getVertexStyle?: (vertex: Point) => VertexStyle;
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
    const container = containerRef.current;
    const image = imageSrc ? imageRef.current : defaultImage;

    if (container && image) {
      const containerWidth = container.clientWidth;
      const intrinsicScale = containerWidth / image.naturalWidth;
      setScale(intrinsicScale);

      const dpr = window.devicePixelRatio || 1;
      const canvasWidth = image.naturalWidth * intrinsicScale;
      const canvasHeight = image.naturalHeight * intrinsicScale;

      if (canvasRef.current) {
        canvasRef.current.width = canvasWidth * dpr;
        canvasRef.current.height = canvasHeight * dpr;
        canvasRef.current.style.width = `${canvasWidth}px`;
        canvasRef.current.style.height = `${canvasHeight}px`;

        const ctx = canvasRef.current.getContext('2d'); // Moved inside the if
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          // NO SCALING HERE: ctx.scale(intrinsicScale * dpr, intrinsicScale * dpr);
        }

      }
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

    const dpr = window.devicePixelRatio || 1; // Get device pixel ratio
    canvas.width = image.naturalWidth * scale * dpr;  // Multiply by DPR
    canvas.height = image.naturalHeight * scale * dpr; // Multiply by DPR
    canvas.style.width = `${image.naturalWidth * scale}px`;   // Set CSS width (original size)
    canvas.style.height = `${image.naturalHeight * scale}px`; // Set CSS height
    ctx.scale(scale * dpr, scale * dpr); // Scale by DPR *and* your zoom scale


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (image !== defaultImage) ctx.drawImage(image as CanvasImageSource, 0, 0);
    if (image === defaultImage) {
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
    regions.forEach(region => {
      if (region.vertices.length < 3) return;
      const regionStyle = getRegionStyle(region);

      let points: Point[] = region.vertices
        .map(vertexId => vertices.find(v => v.id === vertexId))
        .filter((vertex): vertex is Point => vertex !== undefined);
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

    regions.forEach(region => {
      if (region.vertices.length < 3) return;
      const regionStyle = getRegionStyle(region);

      let points: Point[] = region.vertices
        .map(vertexId => vertices.find(v => v.id === vertexId))
        .filter((vertex): vertex is Point => vertex !== undefined);
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


      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const point of points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      if (showLabels && regionStyle.text) {
        ctx.fillStyle = 'black';
        ctx.font = regionStyle.font || '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(regionStyle.text, centerX, centerY);
      }

    });


    customRenderFunctions.forEach(renderFn => renderFn(ctx));

    if (getVertexStyle) vertices.forEach(vertex => {
      const style = getVertexStyle(vertex);
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = style.fillColor;
      ctx.fill();
      ctx.strokeStyle = style.drawColor;
      ctx.stroke();
    });

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


  // --- Transform Mouse Events ---
  const transformMouseEvent = (event: React.MouseEvent<HTMLCanvasElement>): MapMouseEvent => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0, originalEvent: event };
    }

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Calculate x and y relative to canvas, scaled to original image size, NO DPR.
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    return { x, y, originalEvent: event };
  };


  // --- Event Handlers (using transformed events) ---

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (onClick) {
      onClick(transformMouseEvent(event));
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (onMouseMove) {
      onMouseMove(transformMouseEvent(event));
    }
  };

  const handleCanvasMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (onMouseUp) {
      onMouseUp(transformMouseEvent(event));
    }
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
  x: number; // X-coordinate of the center
  y: number; // Y-coordinate of the center
  scale?: number; // Optional: Scale factor
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