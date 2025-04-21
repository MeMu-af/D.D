import { useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    location: '',
    latitude: null,
    longitude: null,
    bio: '',
    gamePreferences: '',
    experienceLevel: '',
    profilePicture: '',
  });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          alert('Unable to retrieve location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post('/api/auth/register', formData);
      console.log('Registration successful:', response.data);
      alert('Registration successful!');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <div className="space-y-4 max-w-md mx-auto">
        <Input
          type="text"
          name="username"
          placeholders="Username"
          value={formData.username}
          onChange={handleChange}
        />
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <Input
          type="text"
          name="location"
          placeholder="Location (e.g., city)"
          value={formData.location}
          onChange={handleChange}
        />
        <Button type="button" onClick={getLocation}>
          Get My Location
        </Button>
        {formData.latitude && formData.longitude && (
          <p>
            Latitude: {formData.latitude}, Longitude: {formData.longitude}
          </p>
        )}
        <Input
          type="text"
          name="bio"
          placeholder="Bio"
          value={formData.bio}
          onChange={handleChange}
        />
        <Input
          type="text"
          name="gamePreferences"
          placeholder="Game Preferences"
          value={formData.gamePreferences}
          onChange={handleChange}
        />
        <Input
          type="text"
          name="experienceLevel"
          placeholder="Experience Level"
          value={formData.experienceLevel}
          onChange={handleChange}
        />
        <Input
          type="text"
          name="profilePicture"
          placeholder="Profile Picture URL"
          value={formData.profilePicture}
          onChange={handleChange}
        />
        <Button onClick={handleRegister}>Register</Button>
      </div>
    </div>
  );
}

export default Register;