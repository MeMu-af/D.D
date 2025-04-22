const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LocationService {
    constructor() {
        this.EARTH_RADIUS_KM = 6371;
    }

    // Convert degrees to radians
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Calculate distance between two points using Haversine formula
    calculateDistance(lat1, lon1, lat2, lon2) {
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return this.EARTH_RADIUS_KM * c;
    }

    async findNearbyUsers(userId, latitude, longitude, radiusKm = 10) {
        try {
            // Get all users with their locations
            const users = await prisma.user.findMany({
                where: {
                    id: { not: userId },
                    latitude: { not: null },
                    longitude: { not: null }
                },
                select: {
                    id: true,
                    username: true,
                    latitude: true,
                    longitude: true,
                    profilePicture: true
                }
            });

            // Filter users within the specified radius
            const nearbyUsers = users.filter(user => {
                const distance = this.calculateDistance(
                    latitude,
                    longitude,
                    user.latitude,
                    user.longitude
                );
                return distance <= radiusKm;
            });

            // Add distance to each user
            return nearbyUsers.map(user => ({
                ...user,
                distance: this.calculateDistance(
                    latitude,
                    longitude,
                    user.latitude,
                    user.longitude
                )
            }));
        } catch (error) {
            console.error('Error finding nearby users:', error);
            throw new Error('Failed to find nearby users');
        }
    }

    async updateUserLocation(userId, latitude, longitude) {
        try {
            return await prisma.user.update({
                where: { id: userId },
                data: {
                    latitude,
                    longitude,
                    lastLocationUpdate: new Date()
                }
            });
        } catch (error) {
            console.error('Error updating user location:', error);
            throw new Error('Failed to update user location');
        }
    }
}

module.exports = new LocationService(); 