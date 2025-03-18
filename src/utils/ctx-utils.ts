import { Point, Region, RegionStyle, Vertex } from "components/MapVisualization";

const patternCache = new Map();
export function getOrCreateNonRepeatingPattern(
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
      patternCtx.fillRect(stripeStartX, -diagonal, currentWidth, diagonal * 3); // Draw extra-long stripes to ensure will fit

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

// Helper function: Line segment intersection
// Returns the intersection point if the segments intersect, otherwise null.
export function lineSegmentIntersection(
  p1: Point,
  p2: Point,
  q1: Point,
  q2: Point
): Point | null {
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

function findAdjustedPoint(
  centroid: Point,
  region: Region,
  vertices: Vertex[],
  adjusting: 'vertical' | 'horizontal' = 'horizontal'
): Point {
  const regionVertices = region.vertices
    .map(vertexId => vertices.find(v => v.id === vertexId))
    .filter((vertex): vertex is Vertex => vertex !== undefined);

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
  const intersections: Point[] = [];
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
  let longestSegment: { start: Point; end: Point } | null = null;
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

export function findAdjustedCentroid(
  region: Region,
  vertices: Vertex[]
): Point {
  const regionVertices = region.vertices
    .map(vertexId => vertices.find(v => v.id === vertexId))
    .filter((vertex): vertex is Vertex => vertex !== undefined);

  if (regionVertices.length === 0) {
    return { x: 0, y: 0 }; // Or some other default/error value
  }

  const centroid = getCentroid(region, vertices)
  let newPoint = centroid;
  newPoint = findAdjustedPoint(newPoint, region, vertices, 'vertical');
  newPoint = findAdjustedPoint(newPoint, region, vertices, 'horizontal');
  return newPoint
}

const getCentroid = (region: Region, vertices: Vertex[]) => {
  const territoryVertices = region.vertices.map(
    vertexId => vertices.find(v => v.id === vertexId)
  ).filter((vertex): vertex is Vertex => vertex !== undefined);

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