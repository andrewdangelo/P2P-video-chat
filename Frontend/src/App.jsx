// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import VideoCall from './pages/VideoCall';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/lobby/:callId" element={<Lobby />} />  {/* lowercase “lobby” */}
      <Route path="/call/:callId" element={<VideoCall />} />
    </Routes>

  );
}
