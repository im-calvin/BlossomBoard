import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DrawingCanvas from "../components/DrawingCanvas";

export default function Home() {
  const { roomCode } = useParams(); // Extract room code from URL
  const [color, setColor] = useState("red");
  const [room, setRoom] = useState(roomCode); // Initialize room state with room code from URL

  // Randomly generate a username for demonstration purposes
  const [username, setUsername] = useState(`User${Math.floor(Math.random() * 1000) + 1}`);

  useEffect(() => {
    // Update room state if URL parameter changes
    setRoom(roomCode);
  }, [roomCode]);

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
