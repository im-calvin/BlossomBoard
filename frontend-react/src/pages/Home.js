import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DrawingCanvas from "../components/DrawingCanvas";

export default function Home() {
  const { roomCode } = useParams();
  const [color, setColor] = useState("red");
  const [room, setRoom] = useState(roomCode);

  // Initialize username from sessionStorage or generate a new one
  const storedUsername = sessionStorage.getItem('username');
  const initialUsername = storedUsername || `User${Math.floor(Math.random() * 1000) + 1}`;
  const [username, setUsername] = useState(initialUsername);

  useEffect(() => {
    setRoom(roomCode);

    // Store the username in sessionStorage if not already present
    if (!storedUsername) {
      sessionStorage.setItem('username', username);
    }
  }, [roomCode, username, storedUsername]);

  console.log("username:", username);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-600">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <DrawingCanvas username={username} room={room} />
        </div>
      </main>
    </>
  );
}
