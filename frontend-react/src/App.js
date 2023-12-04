import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // Adjust the import path as per your project structure
import LandingPage from './pages/LandingPage'; // Adjust the import path as per your project structure
import TableHome from './components/TableCanvas'; // Adjust the import path as per your project structure
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home/:roomCode" element={<Home/>} />
          <Route path="/table" element={<TableHome/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
