import React, { useRef, useEffect, useState } from "react";
import { PaperScope, Path, Tool, Point, Color, type ToolEvent } from "paper";
import { socket } from "../socket";
import { set } from "zod";

type DrawingCanvasProps = {
  username: string;
  room: string;
};

type DrawData = {
  username: string;
  shape: string;
};

const DrawingCanvas = ({ username, room }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paperScopeRef = useRef<typeof PaperScope>(null);
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [shapes, setShapes] = useState<string[]>([]);

  // connect to the socket
  useEffect(() => {
    console.log("connecting to socket");

    socket.connect();

    function onConnect() {
      console.log("connected to socket");
      setIsConnected(true);
    }
    socket.on("connect", onConnect);

    function onDisconnect() {
      console.log("disconnected from socket");
      setIsConnected(false);
    }
    socket.on("disconnect", onDisconnect);

    // Cleanup the socket connection on component unmount
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      // leave the room
      socket.disconnect();
    };
  }, []);

  // draw other people's shapes
  useEffect(() => {
    function onDraw(data: DrawData) {
      console.log("draw received");
      if (data.username === username) return;
      setShapes((prev) => [...prev, data.shape]); // add the new shape to the list of shapes
    }
    socket.on("draw", onDraw);
    return () => {
      socket.off("draw", onDraw);
    };
  }, [username]);

  // re-join the room whenever the room changes
  useEffect(() => {
    function onJoin() {
      console.log("join received");
    }
    socket.emit("join", { username, room });

    return () => {
      socket.emit("leave", { username, room }); // check that this uses the old username and room values, might need to wrap in useCallback
      socket.off("join", onJoin);
    };
  }, [username, room]);

  // whenever a new shape is added, draw it
  useEffect(() => {
    const paperScope = paperScopeRef.current;
    if (!paperScope) return;
    const shape = shapes[shapes.length - 1]; // get the most recent shape
    if (!shape) return;
    const path = new Path();
    path.importJSON(shape); // this adds the shape to the path
  }, [shapes]);

  // set up the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const paperScope = new PaperScope();

    paperScope.setup(canvas);

    const tool = new Tool();

    tool.onMouseDown = (event: typeof ToolEvent) => {
      const path = new Path();
      path.strokeColor = new Color(0, 0, 0);
      path.add(event.point);
    };

    tool.onMouseDrag = (event: typeof ToolEvent) => {
      const path = paperScope.project.activeLayer.lastChild as Path; // this is safe because Item extends Path so Path is a subclass
      path.add(event.point);
    };

    // whenever the user draws something, emit the event to the server
    tool.onMouseUp = (event: typeof ToolEvent) => {
      const serializedPaths =
        paperScope.project.activeLayer.lastChild.exportJSON();
      console.log("serializedPaths:", serializedPaths);
      // tell other people to draw the shape
      socket.emit("draw", {
        username,
        room,
        shape: serializedPaths,
      });
      setShapes((prev) => [...prev, serializedPaths]);
    };

    paperScopeRef.current = paperScope;
  }, [username, room]); // should be dependent on room connection

  return (
    <>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: "1px solid black" }}
      />
    </>
  );
};

export default DrawingCanvas;
