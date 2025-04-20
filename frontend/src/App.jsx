import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Forum from './components/Forum';
import Login from './components/Login';
import NearbyPlayers from './components/NearbyPlayers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/login" element={<Login />} />
        <Route path="/nearby" element={<NearbyPlayers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;