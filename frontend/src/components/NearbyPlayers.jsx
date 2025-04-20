import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './card';

function NearbyPlayers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const { latitude, longitude } = position.coords;
        const response = await axios.get('/api/users/nearby', {
          params: { lat: latitude, lon: longitude, radius: 10 }, // 10 km radius
        });
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch nearby players: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNearbyUsers();
  }, []);

  if (loading) return <div className="text-center text-gray-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Nearby Players</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <Card key={user.id} className="p-4 border rounded shadow">
            <h3 className="text-xl font-semibold">{user.username}</h3>
            <p className="text-gray-600">{user.location}</p>
            <p className="text-gray-600">Experience: {user.experienceLevel}</p>
            <p className="text-gray-600">Preferences: {user.gamePreferences}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default NearbyPlayers;