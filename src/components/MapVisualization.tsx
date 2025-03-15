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

// --- NEW: Custom Event Interfaces ---
export interface MapMouseEvent {
  x: number;
  y: number;
  originalEvent: React.MouseEvent<HTMLCanvasElement>; // Keep a reference to original
}

interface MapVisualizationProps {
  imageSrc: string;
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
  getRegionStyle = (region: Region) => { return { fillColor: 'rgba(0, 128, 255, 0.5)', drawColor: 'green', drawWidth: 2 } },
  getVertexStyle = (vertex: Point) => { return { fillColor: 'blue', drawColor: 'black' } },
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

  // Calculate scale based on container and image size
  const calculateScale = useCallback(() => {
    const container = containerRef.current;
    const image = imageRef.current;

    if (container && image) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const newScale = Math.min(
        containerWidth / image.naturalWidth,
        containerHeight / image.naturalHeight
      );
      setScale(newScale);
    }
  }, []);

  useEffect(() => {
    calculateScale();
    const handleResize = () => { calculateScale(); };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); };
  }, [calculateScale]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.naturalWidth * scale;
    canvas.height = image.naturalHeight * scale;
    ctx.scale(scale, scale);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

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

      ctx.fillStyle = regionStyle.fillColor;
      ctx.fill();

      ctx.strokeStyle = regionStyle.drawColor;
      ctx.lineWidth = regionStyle.drawWidth;
      ctx.stroke();

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

    customRenderFunctions.forEach(renderFn => renderFn(ctx));

    vertices.forEach(vertex => {
      const style = getVertexStyle(vertex);
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = style.fillColor;
      ctx.fill();
      ctx.strokeStyle = style.drawColor;
      ctx.stroke();
    });

    ctx.setTransform(1, 0, 0, 1, 0, 0);

  }, [regions, vertices, getRegionStyle, getVertexStyle, showLabels, customRenderFunctions, scale]);

  useEffect(() => { draw(); }, [draw]);


  // --- Transform Mouse Events ---
  const transformMouseEvent = (event: React.MouseEvent<HTMLCanvasElement>): MapMouseEvent => {
    const canvas = canvasRef.current;
    if (!canvas) { // Return a default object if canvas is null
      return { x: 0, y: 0, originalEvent: event };
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Coordinates in the *original* image space (not scaled, not relative to canvas element)
    const x = (event.clientX - rect.left) * scaleX / scale;
    const y = (event.clientY - rect.top) * scaleY / scale;


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
      <img
        ref={imageRef}
        src={imageSrc}
        alt="Map"
        style={{ display: 'none' }}
        onLoad={() => {
          calculateScale();
          draw();
        }}
      />
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

export default MapVisualization;