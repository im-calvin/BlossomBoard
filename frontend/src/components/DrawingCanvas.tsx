import React, { useRef, useEffect } from "react";
import { PaperScope, Path, Tool, Point } from "paper";

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paperScopeRef = useRef<typeof PaperScope>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const paperScope = new PaperScope();

    paperScope.setup(canvas);

    const tool = new Tool();

    tool.onMouseDown = (event) => {
      const path = new Path();
      path.strokeColor = "black";
      path.add(event.point);
    };

    tool.onMouseDrag = (event) => {
      const path = paperScope.project.activeLayer.lastChild as Path;
      path.add(event.point);
    };

    paperScopeRef.current = paperScope;

    return () => {
      paperScope.clear();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: "1px solid black" }}
    />
  );
};

export default DrawingCanvas;
