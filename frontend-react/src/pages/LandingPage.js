import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { use } from "bcrypt/promises";

const LandingPage = () => {
  const [roomCode, setRoomCode] = useState("");
  const [tableCode, setTableCode] = useState("");
  const navigate = useNavigate();

  const storedUsername =
    sessionStorage.getItem("username") ||
    `User${Math.floor(Math.random() * 1000) + 1}`;
  if (!sessionStorage.getItem("username")) {
    sessionStorage.setItem("username", storedUsername);
  }

  const handleJoinRoom = async () => {
    try {
      // Replace with your API endpoint to verify the room
      const response = await axios.get(`/api/rooms/verify/${roomCode}`);
      if (response.data.exists) {
        navigate(`/home/${roomCode}`);
        window.location.reload();
      } else {
        alert("Room does not exist");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Error joining room");
    }
  };

  const handleJoinTable = async () => {
    try {
      // Replace with your API endpoint to verify the room
      const response = await axios.get(`/api/tables/verify/${tableCode}`);
      if (response.data.exists) {
        navigate(`/table/${tableCode}`);
        window.location.reload();
      } else {
        alert("Room does not exist");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Error joining room");
    }
  };

  const handleCreateRoom = async () => {
    try {
      // Replace with your API endpoint to create a room
      const response = await axios.post("/api/rooms/create");
      const newRoomCode = response.data.roomCode;
      //   navigate with reload
      navigate(`/home/${newRoomCode}`);
      window.location.reload();
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Error creating room");
    }
  };

  const handleCreateTable = async () => {
    try {
      // Replace with your API endpoint to create a room
      const response = await axios.post("/api/tables/create");
      const newTableCode = response.data.tableCode;
      //   navigate with reload
      navigate(`/table/${newTableCode}`);
      window.location.reload();
    } catch (error) {
      console.error("Error creating table room:", error);
      alert("Error creating table room");
    }
  };

  return (
    <div>
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
        <span style={{ color: "#ffffff" }}>BlossomBoard</span>
      </h1>
      <div
        style={{
          textAlign: "center",
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter Room Code"
            style={{
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              color: "#e0e0e0",
              fontSize: "16px",
              marginBottom: "10px",
              marginRight: "10px",
            }}
          />
          <button
            onClick={handleJoinRoom}
            style={{
              padding: "15px 30px",
              borderRadius: "8px",
              backgroundColor: "#3498db", // Green color
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              marginTop: "50px", // Add margin between input and button
            }}
          >
            Join Room
          </button>
        </div>

        

        <button
          onClick={handleCreateRoom}
          style={{
            padding: "15px 30px",
            borderRadius: "8px",
            backgroundColor: "#FFA500", // Blue color
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            marginTop: "30px",
          }}
        >
          Create Drawing Room (random room code)
        </button>



          <div style={{ marginTop: "30px" }}>
            OR
          </div>


        <button
          style={{
            padding: "15px 30px",
            borderRadius: "8px",
            backgroundColor: "#FFA500", // Blue color
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            marginTop: "30px",
          }}
          onClick={handleCreateTable}
        >
          Create Table Room (random room code)
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
