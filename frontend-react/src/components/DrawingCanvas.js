import React, { useRef, useEffect, useState } from 'react';
import paper from 'paper';
import { socket } from '../socket';

const DrawingCanvas = ({ username, room }) => {
  const canvasRef = useRef(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [paths, setPaths] = useState([]);

  // Setup socket connection
  useEffect(() => {
    socket.connect();
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('current_drawing', (data) => {
      if (data.shapes && data.shapes.length > 0) {
        setPaths(data.shapes);
      }
    });

    return () => {
      socket.disconnect();
      socket.off('connect');
      socket.off('disconnect');
      socket.off('current_drawing');
    };
  }, []);

  // Handle drawing from other users
  useEffect(() => {
    const drawShape = (data) => {
      if (data.username === username) return;
      try {
        JSON.parse(data.shape);
        setPaths((prevPaths) => [...prevPaths, data.shape]);
      } catch (error) {
        console.error('Invalid JSON received:', data.shape);
        console.error(error);
      }
    };

    socket.on('draw', drawShape);

    return () => {
      socket.off('draw', drawShape);
    };
  }, [username]);

  // Handle room changes
  useEffect(() => {
    socket.emit('join', { username, room });

    return () => {
      socket.emit('leave', { username, room });
    };
  }, [username, room]);

  // Setup Paper.js and canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    paper.setup(canvas);

    const tool = new paper.Tool();

    tool.onMouseDown = (event) => {
      const path = new paper.Path();
      path.strokeColor = 'black';
      path.add(event.point);
    };

    tool.onMouseDrag = (event) => {
      const path = paper.project.activeLayer.lastChild;
      path.add(event.point);
    };

    tool.onMouseUp = () => {
      const serializedPath = paper.project.activeLayer.lastChild.exportJSON();
      socket.emit('draw', { username, room, shape: serializedPath });
      setPaths((prevPaths) => [...prevPaths, serializedPath]);
    };
  }, [username, room]);

  // Redraw canvas when paths change
  useEffect(() => {
    paper.project.clear();
    paths.forEach((pathJSON, index) => {
      try {
        const path = new paper.Path();
        path.importJSON(pathJSON);
      } catch (error) {
        console.error(`Error importing path at index ${index}:`, pathJSON);
        console.error(error);
      }
    });
  }, [paths]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: '1px solid black' }}
    />
  );
};

export default DrawingCanvas;
