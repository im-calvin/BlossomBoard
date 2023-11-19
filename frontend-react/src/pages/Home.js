import { useState, useCallback, useEffect } from "react";
import { Canvas, Layer, Rectangle, View } from "react-paper-bindings";
import DrawingCanvas from "../components/DrawingCanvas";

export default function Home() {
  const [color, setColor] = useState("red");
  const [room, setRoom] = useState("1234");


  const [username, setUsername] = useState(Math.floor(Math.random() * 1000) + 1);

  console.log("username:", username);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-600">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <DrawingCanvas username={username} room={room} />
        </div>
      </main>
    </>
  );
}
