import { Box } from '@mui/material';
import { territoriesByName, Territory } from 'model/HistoryTracker';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { isPointInPolygon } from './MapEditor';

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


// Helper function: Line segment intersection
// Returns the intersection point if the segments intersect, otherwise null.
function lineSegmentIntersection(
  p1: { x: number, y: number },
  p2: { x: number, y: number },
  q1: { x: number, y: number },
  q2: { x: number, y: number }
): { x: number, y: number } | null {
  // Calculate direction vectors
  const r = { x: p2.x - p1.x, y: p2.y - p1.y };
  const s = { x: q2.x - q1.x, y: q2.y - q1.y };

  const rCrossS = r.x * s.y - r.y * s.x;
  const qMinusP = { x: q1.x - p1.x, y: q1.y - p1.y };

  // Parallel lines
  if (rCrossS === 0) {
    return null;
  }

  const t = (qMinusP.x * s.y - qMinusP.y * s.x) / rCrossS;
  const u = (qMinusP.x * r.y - qMinusP.y * r.x) / rCrossS;

  // Check if intersection point is within both segments
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: p1.x + t * r.x,
      y: p1.y + t * r.y,
    };
  }

  return null; // No intersection within segments
}

// Helper function: Check if a point is on a line segment
function isPointOnSegment(point: { x: number, y: number }, p1: { x: number, y: number }, p2: { x: number, y: number }): boolean {
  const crossProduct = (point.y - p1.y) * (p2.x - p1.x) - (point.x - p1.x) * (p2.y - p1.y);
  if (Math.abs(crossProduct) > 1e-9) return false; // Use epsilon for floating point comparison. Not collinear

  const dotProduct = (point.x - p1.x) * (p2.x - p1.x) + (point.y - p1.y) * (p2.y - p1.y);
  if (dotProduct < 0) return false; // Beyond p1

  const squaredLength = (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
  if (dotProduct > squaredLength) return false; // Beyond p2

  return true;
}

function findAdjustedPoint(
  centroid: { x: number, y: number },
  region: Region,
  vertices: Point[],
  adjusting: 'vertical' | 'horizontal' = 'horizontal'
): { x: number, y: number } {
  const regionVertices = region.vertices
    .map(vertexId => vertices.find(v => v.id === vertexId))
    .filter((vertex): vertex is Point => vertex !== undefined);

  const line = adjusting === 'vertical' ? {
    start: { x: centroid.x, y: -1000 },
    end: { x: centroid.x, y: 3000 }
  } : {
    start: { x: -1000, y: centroid.y },
    end: { x: 5000, y: centroid.y }
  }


  if (regionVertices.length < 3) {
    return centroid; // Not a valid polygon, return original centroid
  }
  // 1. Find intersection points on the same horizontal line (y = centroid.y)
  const intersections: { x: number, y: number }[] = [];
  for (let i = 0; i < regionVertices.length; i++) {
    const p1 = regionVertices[i];
    const p2 = regionVertices[(i + 1) % regionVertices.length]; // Wrap around




    //Edge potentially intersects, calculate intersection
    const intersection = lineSegmentIntersection(
      p1,
      p2,
      line.start,
      line.end
    );
    if (intersection != null) { //Check point exists and on segment
      intersections.push(intersection);
    }
  }

  // 2. Sort intersection points by x-coordinate
  if (adjusting === 'horizontal') intersections.sort((a, b) => a.x - b.x);
  else intersections.sort((a, b) => a.y - b.y);

  // 3. Find the longest segment containing the centroid's x-coordinate
  let longestSegment: { start: { x: number, y: number }; end: { x: number, y: number } } | null = null;
  let maxLength = 0;

  for (let i = 0; i < intersections.length - 1; i += 2) {
    const segmentStart = intersections[i];
    const segmentEnd = intersections[i + 1];

    const length = Math.pow((segmentEnd.x - segmentStart.x), 2) + Math.pow((segmentEnd.y - segmentStart.y), 2);
    if (length > maxLength) {
      maxLength = length;
      longestSegment = { start: segmentStart, end: segmentEnd };
    }
  }


  // 4.  Adjust position within longest segment, applying margin
  if (longestSegment) {
    const adjustedX = (Math.max(longestSegment.start.x, longestSegment.end.x) - Math.min(longestSegment.start.x, longestSegment.end.x)) / 2 + Math.min(longestSegment.start.x, longestSegment.end.x);
    const adjustedY = (Math.max(longestSegment.start.y, longestSegment.end.y) - Math.min(longestSegment.start.y, longestSegment.end.y)) / 2 + Math.min(longestSegment.start.y, longestSegment.end.y);
    return { x: adjustedX, y: adjustedY }; // Keep original y
  }

  // 5. Return original centroid if no suitable segment found.
  return centroid;
}


function findAdjustedCentroid(
  region: Region,
  vertices: Point[],
  margin: number
): { x: number, y: number } {
  const regionVertices = region.vertices
    .map(vertexId => vertices.find(v => v.id === vertexId))
    .filter((vertex): vertex is Point => vertex !== undefined);

  if (regionVertices.length === 0) {
    return { x: 0, y: 0 }; // Or some other default/error value
  }

  const centroid = getCentroid(region, vertices)
  if (!isPointInPolygon(centroid.x, centroid.y, vertices)) console.log("!!!")

  let newPoint = centroid;
  newPoint = findAdjustedPoint(newPoint, region, vertices, 'vertical');
  newPoint = findAdjustedPoint(newPoint, region, vertices, 'horizontal');
  return newPoint
}


const getCentroid = (region: Region, vertices: Point[]) => {
  const territoryVertices = region.vertices.map(
    vertexId => vertices.find(v => v.id === vertexId)
  ).filter((vertex): vertex is Point => vertex !== undefined);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const point of territoryVertices) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2
  };
};



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
  routes?: Region[];
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


  const [svgImage, setSvgImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setSvgImage(img);
    };
    img.src = 'noun-submarine-1189639.svg'; // REPLACE WITH YOUR SVG FILE PATH
  }, []);


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

    // DRAW REGION BOUNDARIES
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

      const centroid = findAdjustedCentroid(region, vertices, 0);

      if (regionStyle.text || showLabels) {
        ctx.fillStyle = 'black';
        ctx.font = regionStyle.font || '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const text = (regionStyle.text || region.name).split("\n")

        text.forEach((line, index) => ctx.fillText(line, centroid.x, centroid.y - ((text.length - 1) * 18 / 2) + index * 18))
      }

      /*
      if (territoriesByName[region.name]?.isSea() && svgImage) {
        ctx.fillStyle = 'black';
        ctx.font = regionStyle.font || 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const size = 80

        //        ctx.drawImage(svgImage, centroid.x - size / 2, centroid.y - size / 2, size, size);
        
    }*/
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


    // DRAW ROUTES
    if (routes && routes.length > 0) { // path is now just string[] | null
      ctx.beginPath();
      ctx.strokeStyle = 'purple'; // Choose a color
      ctx.lineWidth = 3;

      // --- Helper function to get centroid (same as before) ---

      // --- Draw the path segments ---
      for (let i = 0; i < routes.length - 1; i++) {
        const territory1 = routes[i];
        const territory2 = routes[i + 1];

        if (!territory1 || !territory2) continue;
        const centroid1 = getCentroid(territory1, vertices);
        const centroid2 = getCentroid(territory2, vertices);

        if (centroid1 && centroid2) {
          ctx.moveTo(centroid1.x, centroid1.y);
          ctx.lineTo(centroid2.x, centroid2.y);
        }
      }
      ctx.stroke(); // Stroke the *entire* path
    }

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