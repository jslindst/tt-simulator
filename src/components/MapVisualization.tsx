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

export type RegionStyle = {
  fillColor: string;
  drawColor: string;
  drawWidth: number;
}


interface MapVisualizationProps {
  imageSrc: string;
  regions: Region[];
  vertices: Point[];
  getRegionStyle?: (region: Region) => RegionStyle;
  getVertexStyle?: (vertex: Point) => VertexStyle;
  showLabels?: boolean;
  customRenderFunctions?: ((ctx: CanvasRenderingContext2D) => void)[];
  onClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  cursor?: string;
  width?: number | string;  // Add width prop
  height?: number | string; // Add height prop
}

const MapVisualization: React.FC<MapVisualizationProps> = ({
  imageSrc,
  regions,
  vertices,
  getRegionStyle = (region: Region) => { return { fillColor: 'rgba(0, 128, 255, 0.5)', drawColor: 'green', drawWidth: 2 } },
  getVertexStyle = (vertex: Point) => { return { fillColor: 'blue', drawColor: 'black' } },
  showLabels = true,
  customRenderFunctions = [],
  onClick,
  onMouseMove,
  onMouseUp,
  cursor = 'default',
  width = '2000',   // Default width
  height = 'auto',  // Default height
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1); // Add a scale state
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container


  // Calculate scale based on container and image size
  const calculateScale = useCallback(() => {
    const container = containerRef.current;
    const image = imageRef.current;

    if (container && image) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      //To make it fit, the image should be inside the container, not take more space.
      //That is why we use Math.min
      const newScale = Math.min(
        containerWidth / image.naturalWidth,
        containerHeight / image.naturalHeight
      );

      setScale(newScale);

    }
  }, []);

  useEffect(() => {
    calculateScale(); // Initial calculation

    const handleResize = () => {
      calculateScale();
    };
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Call draw after scale calculation (and image load)
    //draw(); // Removed: draw is called on scale change

    // Clean up the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateScale]); //, draw]); Removed draw dependency, it will be called on scale change anyway.


  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply scaling to the canvas
    canvas.width = image.naturalWidth * scale;
    canvas.height = image.naturalHeight * scale;
    ctx.scale(scale, scale);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);


    // Draw regions (filled and with name)
    regions.forEach(region => {
      if (region.vertices.length < 3) return;
      const regionStyle = getRegionStyle(region);

      //Get points:
      let points: Point[] = region.vertices
        .map(vertexId => vertices.find(v => v.id === vertexId))
        .filter((vertex): vertex is Point => vertex !== undefined);

      if (points.length < 3) return; //Sanity check.
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();

      // Fill color
      ctx.fillStyle = regionStyle.fillColor;
      ctx.fill();

      ctx.strokeStyle = regionStyle.drawColor;
      ctx.lineWidth = regionStyle.drawWidth;
      ctx.stroke();

      // Calculate centroid and draw name if showLabels is true
      if (showLabels) {
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
      }
    });

    // Run custom render functions if any
    customRenderFunctions.forEach(renderFn => renderFn(ctx));

    // Draw vertices
    vertices.forEach(vertex => {
      const style = getVertexStyle(vertex);
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = style.fillColor;
      ctx.fill();
      ctx.strokeStyle = style.drawColor;
      ctx.stroke();
    });
    // Reset scale for event handling (VERY IMPORTANT)
    ctx.setTransform(1, 0, 0, 1, 0, 0);

  }, [regions, vertices, getRegionStyle, getVertexStyle, showLabels, customRenderFunctions, scale]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Helper function that can be exported and used by other components
  const isPointInPolygon = (x: number, y: number, points: Point[]): boolean => {
    let isInside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;

      const intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) isInside = !isInside;
    }
    return isInside;
  };

  // Function to find a region containing a point
  const findRegionAtPoint = (x: number, y: number): string | null => {
    //Iterate regions in reverse order, for the top most to be selected first.
    for (let i = regions.length - 1; i >= 0; i--) {
      const region = regions[i];
      let points: Point[] = region.vertices
        .map(vertexId => vertices.find(v => v.id === vertexId))
        .filter((vertex): vertex is Point => vertex !== undefined);
      if (isPointInPolygon(x, y, points)) {
        return region.id;
      }
    }
    return null;
  };

  // Transform mouse events to account for scaling
  const transformMouseEvent = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return event;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX / scale;
    const y = (event.clientY - rect.top) * scaleY / scale;

    // Create a new object with the adjusted coordinates, *spreading* the original event's properties.
    const adjustedEvent = {
      ...event, // Copy *all* properties from the original React event
      clientX: x,
      clientY: y,
      // No need to manually copy other properties.  The spread operator (...) handles it.
    };

    return adjustedEvent;
  };

  return (
    <div ref={containerRef} style={{ width, height, position: 'relative' }}>
      <img
        ref={imageRef}
        src={imageSrc}
        alt="Map"
        style={{ display: 'none' }}
        onLoad={() => {
          calculateScale();
          draw(); // Call draw when the image loads
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ cursor, width: '100%', height: '100%' }}  // Make canvas fill container
        onClick={(e) => onClick && onClick(transformMouseEvent(e))}
        onMouseMove={(e) => onMouseMove && onMouseMove(transformMouseEvent(e))}
        onMouseUp={(e) => onMouseUp && onMouseUp(transformMouseEvent(e))}
      />
    </div>
  );
};

export default MapVisualization;