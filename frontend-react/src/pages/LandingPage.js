import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LandingPage = () => {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    try {
      // Replace with your API endpoint to verify the room
      const response = await axios.get(`/api/rooms/verify/${roomCode}`);
      if (response.data.exists) {
        navigate(`/home/${roomCode}`); // Navigate to Home with room code
      } else {
        alert('Room does not exist');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Error joining room');
    }
  };

  const handleCreateRoom = async () => {
    try {
      // Replace with your API endpoint to create a room
      const response = await axios.post('/api/rooms/create');
      const newRoomCode = response.data.roomCode;
      navigate(`/home/${newRoomCode}`);      
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error creating room');
    }
  };

  return (
    <div>
      <h1>Whiteboard++</h1>
      <input
        type="text"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        placeholder="Enter Room Code"
      />
      <button onClick={handleJoinRoom}>Join Room</button>
      <button onClick={handleCreateRoom}>Create Room (random room code)</button>
    </div>
  );
};

export default LandingPage;

