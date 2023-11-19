import React, { useRef, useEffect, useState } from 'react';
import paper from 'paper';
import { socket } from '../socket';

const DrawingCanvas = ({ room }) => {
  const canvasRef = useRef(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [paths, setPaths] = useState([]);
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState(room);

  useEffect(() => {
    console.log("isConnected:", isConnected);
  }, [isConnected]);

  // Generate and store unique username
  useEffect(() => {
    let storedUsername = sessionStorage.getItem('username');
    if (!storedUsername) {
      storedUsername = `User${Math.floor(Math.random() * 1000) + 1}`;
      sessionStorage.setItem('username', storedUsername);
    }
    setUsername(storedUsername);
    setRoomCode(room); // Update room code when room prop changes

    // Setup WebSocket connection
    const setupWebSocket = () => {
      socket.emit('join', { username: storedUsername, room });

      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      socket.on('current_drawing', (data) => {
        if (data.shapes) {
          setPaths(data.shapes);
        }
      });
      socket.on('draw', (data) => {
        if (data.username !== storedUsername) {
          setPaths((prevPaths) => [...prevPaths, JSON.parse(data.shape)]);
        }
      });

      // Handle join and leave announcements
      socket.on('join_announcement', (data) => {
        console.log(data.message);
        setRoomCode(data.room);
      });
      socket.on('leave_announcement', (data) => {
        console.log(data.message);
        setRoomCode(data.room);
      });
    };

    setupWebSocket();

    // Cleanup on component unmount
    return () => {
      socket.emit('leave', { username: storedUsername, room });
      socket.off('connect');
      socket.off('disconnect');
      socket.off('current_drawing');
      socket.off('draw');
      socket.off('join_announcement');
      socket.off('leave_announcement');
    };
  }, [room]);

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
      socket.emit('draw', { username, room: roomCode, shape: serializedPath });
      setPaths((prevPaths) => [...prevPaths, serializedPath]);
    };

    return () => paper.project.clear();
  }, [roomCode, paths]);

  // Redraw canvas when paths change
  useEffect(() => {
    paper.project.clear();
    paths.forEach((pathJSON) => {
      const path = new paper.Path();
      path.importJSON(pathJSON);
    });
  }, [paths]);

  return (
    <>
      <h1>Whiteboard++ Room: {roomCode}</h1>
      <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid black' }} />
      {isConnected ? <p>Connected</p> : <p>Disconnected</p>}
    </>
  );
};

export default DrawingCanvas;
