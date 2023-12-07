import React, { useRef, useEffect, useState } from "react";
import paper from "paper";
import { socket } from "../socket";
import { useParams } from "react-router-dom";

const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [paths, setPaths] = useState([]);
  const username = sessionStorage.getItem("username");
  const { roomCode } = useParams();
  // Create a mutable ref for roomCode
  var roomCodeRef = useRef(roomCode);

  useEffect(() => {
    console.log("roomcode ref is updated to: " + roomCode);
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  useEffect(() => {
    // Setup WebSocket connection
    const setupWebSocket = () => {
      socket.emit("join", { username, room: roomCode });
      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));
      socket.on("current_drawing", (data) => {
        if (data.shapes) {
          setPaths(data.shapes);
        }
      });
      socket.on("draw", (data) => {
        if (data.username !== username) {
          setPaths((prevPaths) => [...prevPaths, JSON.parse(data.shape)]);
        }
      });
    };
    setupWebSocket();

    console.log("room is this: " + roomCode);

    return () => {
      socket.emit("leave", { username: username, room: roomCode });
      socket.off("connect");
      socket.off("disconnect");
      socket.off("current_drawing");
      socket.off("draw");
      socket.off("join_announcement");
      socket.off("leave_announcement");
    };
  }, [roomCode]);

  // Update the roomCodeRef whenever roomCode changes
  useEffect(() => {
    const canvas = canvasRef.current;
    paper.setup(canvas);
    const tool = new paper.Tool();

    tool.onMouseDown = (event) => {
      const path = new paper.Path();
      path.strokeColor = "black";
      path.add(event.point);
    };

    tool.onMouseDrag = (event) => {
      const path = paper.project.activeLayer.lastChild;
      path.add(event.point);
    };

    tool.onMouseUp = () => {
      const currentRoomCode = roomCodeRef.current;
      console.log(
        "room is this: " + currentRoomCode,
        "username is this: " + username
      );
      const serializedPath = paper.project.activeLayer.lastChild.exportJSON();
      socket.emit("draw", {
        username,
        room: currentRoomCode,
        shape: serializedPath,
      });
      setPaths((prevPaths) => [...prevPaths, serializedPath]);
    };

    return () => paper.project.clear();
  }, [username, paths, roomCode]);

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
      <h1
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "center",
          background: "linear-gradient(45deg, #9b59b6, #3498db)",
          color: "#000033",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <span style={{ color: "#ffffff" }}>Whiteboard++</span>
        <span>Room: {roomCode}</span>
      </h1>
      <canvas
        ref={canvasRef}
        width="800" // Adjust as needed
        height="600" // Adjust as needed
        style={{
          border: "1px solid black",
          margin: "20px auto",
          marginLeft: "20px",
        }}
      />

      {isConnected ? (
        <p style={{ color: "green", fontWeight: "bold", marginLeft: "20px" }}>
          Connected
        </p>
      ) : (
        <p style={{ color: "red", fontWeight: "bold" }}>Disconnected</p>
      )}
    </>
  );
};

export default DrawingCanvas;
